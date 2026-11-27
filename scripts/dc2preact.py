#!/usr/bin/env python3
"""Convertit les maquettes du canevas (design/*.dc.html) en composants Preact.

Chaque fichier .dc.html contient :
  - un <helmet> (polices + CSS de page : keyframes, classes de survol),
  - un gabarit <x-dc> avec des trous {{a.b}}, des boucles <sc-for> et des conditions <sc-if>,
  - une classe `Component extends DCLogic` (état, minuteries, renderVals()).

Deux groupes d'écrans :
  - le site (canevas du site, design/*.dc.html) -> src/pages/<Nom>.js + src/styles/<prefixe>.css ;
  - l'app (canevas de l'app, design/app/*.dc.html) -> src/app/pages/<Nom>.js + src/app/styles/<prefixe>.css,
    plus src/app/routes.js (adresse -> écran), lu par le routeur de l'app (src/app/main.js).
Chaque composant = la classe d'origine + une méthode render(). Les keyframes sont préfixées
par écran pour éviter les collisions. Un lien vers un artboard sans route fait échouer la conversion.

Données d'exemple de l'app (audit du 19/11, S4) : les canevas de l'app portent un extrait réel du Radar (apps, créateurs,
revenus estimés, vidéos) pour se dessiner sans données. Il était livré tel quel, sans compte, dans les fichiers JS publics.
Chaque littéral qui en contient (id de vidéo TikTok, « @pseudo », /media/app/, /_blob/) est retiré de l'écran généré,
remplacé par `globalThis.__dcSample?.[écran]?.[nom] ?? []` (vide dans l'app, qui n'affiche un écran qu'avec ses vraies
données), et rangé dans design/app/samples/<Écran>.js, que seul scripts/check.mjs charge. La génération échoue s'il en
reste dans src/app/pages ; scripts/check-public.mjs fait de même sur dist/assets au build Vercel.

Usage : python3 scripts/dc2preact.py   (ou npm run gen)
"""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    # fichier source, nom du composant, préfixe CSS
    ('LP.dc.html', 'LP', 'lp'),
    ('LPMobile.dc.html', 'LPMobile', 'lpm'),
    ('Tarifs.dc.html', 'Tarifs', 'tf'),
    ('TarifsMobile.dc.html', 'TarifsMobile', 'tfm'),
    ('Connexion.dc.html', 'Connexion', 'cx'),
    ('Inscription.dc.html', 'Inscription', 'ins'),
    ('MotDePasse.dc.html', 'MotDePasse', 'mdp'),  # mot de passe oublié (24/11, parcours B)
    ('Adresse.dc.html', 'Adresse', 'adr'),  # le lien qui confirme une nouvelle adresse (24/11)
    ('Simulateur.dc.html', 'Simulateur', 'sim'),  # le simulateur (26/11), version ordinateur
    ('SimulateurMobile.dc.html', 'SimulateurMobile', 'simm'),  # et téléphone (sous 860 px)
    ('Plan.dc.html', 'Plan', 'pl'),  # l'onboarding B du test A/B (26/11, maquette B1), version ordinateur
    ('PlanMobile.dc.html', 'PlanMobile', 'plm'),  # et téléphone
]
# Liens entre artboards du canevas -> routes du site
LINKS = {
    'LP.dc.html': '/',
    'LPMobile.dc.html': '/',
    'Tarifs.dc.html': '/tarifs',
    'TarifsMobile.dc.html': '/tarifs',
    'Connexion.dc.html': '/connexion',
    'Inscription.dc.html': '/inscription',
    'MotDePasse.dc.html': '/mot-de-passe-oublie',
    'Adresse.dc.html': '/confirmer-adresse',
    'Simulateur.dc.html': '/simulateur',
    'SimulateurMobile.dc.html': '/simulateur',
    'Plan.dc.html': '/plan',
    'PlanMobile.dc.html': '/plan',
    '#quiz': '/inscription',      # « Trouver mon app » : création du compte
    '#connexion': '/connexion',   # « Se connecter »
    '#paiement': '/inscription',  # « Passer Pro » : on crée d'abord le compte
}

# L'app : artboard retenu -> (composant, préfixe CSS, adresse, titre de l'onglet, données).
# Une adresse peut porter un paramètre (« :slug ») ; « données » = la clé du document
# que l'écran reçoit dans `data` (convex/boards.ts), avec le paramètre entre accolades.
APP_PAGES = [
    ('Main.dc.html', 'Accueil', 'a-acc', '/app', 'Accueil', 'home'),
    ('AppsA.dc.html', 'Apps', 'a-apps', '/app/apps', 'Apps', 'apps'),
    ('FicheA.dc.html', 'FicheApp', 'a-fapp', '/app/apps/:slug', 'App', 'app:{slug}'),
    ('VideoA.dc.html', 'Video', 'a-vid', '/app/videos/:id', 'Vidéo', 'video:{id}'),
    ('FormatsB.dc.html', 'Formats', 'a-fmts', '/app/formats', 'Formats', 'formats'),
    ('FormatFicheA.dc.html', 'FicheFormat', 'a-ffmt', '/app/formats/:id', 'Format', 'format:{id}'),
    ('CreateursA.dc.html', 'Createurs', 'a-crea', '/app/createurs', 'Créateurs', 'creators:FR'),
    ('CreateursB.dc.html', 'CreateursCartes', 'a-creb', '/app/createurs/cartes', 'Créateurs', 'creators:FR'),
    ('CreateurFicheA.dc.html', 'FicheCreateur', 'a-fcre', '/app/createurs/:handle', 'Créateur', 'creator:{handle}'),
    ('DossiersA.dc.html', 'Dossiers', 'a-dos', '/app/dossiers', 'Dossiers', None),
    ('DossiersB.dc.html', 'Dossier', 'a-dosb', '/app/dossiers/:id', 'Dossier', None),
    ('AlertesA.dc.html', 'Alertes', 'a-ale', '/app/alertes', 'Alertes', 'alerts'),
]
# Lien sans paramètre vers une fiche (maquette pas encore branchée) : la liste, plus d'exemple (audit Q11, plus bas).
# Un lien de canevas sans paramètre vers une fiche ne mène à aucune fiche d'exemple (audit Q11 ; S4 pour les vidéos) :
# l'app est branchée sur les vraies données, et l'exemple était une vraie app ou un vrai créateur du Radar. Il mène à la
# liste parente (/app/apps, /app/createurs, /app/formats) ; une vidéo, à /app/videos, que le routeur renvoie à l'accueil.
APP_SAMPLE = {'/app/apps/:slug': None, '/app/videos/:id': None, '/app/formats/:id': None, '/app/createurs/:handle': None}

# Version mobile (sous 860 px) des mêmes adresses : artboard M* -> (composant, préfixe CSS, adresse).
# Une adresse sans version mobile garde l'écran desktop.
APP_MOBILE_PAGES = [
    ('MAccueil.dc.html', 'MAccueil', 'm-acc', '/app'),
    ('MApps.dc.html', 'MApps', 'm-apps', '/app/apps'),
    ('MFiche.dc.html', 'MFicheApp', 'm-fapp', '/app/apps/:slug'),
    ('MVideo.dc.html', 'MVideo', 'm-vid', '/app/videos/:id'),
    ('MFormats.dc.html', 'MFormats', 'm-fmts', '/app/formats'),
    ('MFormatFiche.dc.html', 'MFicheFormat', 'm-ffmt', '/app/formats/:id'),
    ('MCreateurs.dc.html', 'MCreateurs', 'm-crea', '/app/createurs'),
    ('MCreateursCartes.dc.html', 'MCreateursCartes', 'm-creb', '/app/createurs/cartes'),
    ('MCreateurFiche.dc.html', 'MFicheCreateur', 'm-fcre', '/app/createurs/:handle'),
    ('MDossiers.dc.html', 'MDossiers', 'm-dos', '/app/dossiers'),
    ('MDossier.dc.html', 'MDossier', 'm-dosb', '/app/dossiers/:id'),
    ('MAlertes.dc.html', 'MAlertes', 'm-ale', '/app/alertes'),
]

# Composants partagés, importés par <dc-import name="…"> (pas des routes) : fichier, composant, préfixe CSS.
APP_COMPONENTS = [
    ('Palette.dc.html', 'Palette', 'a-pal'),
    ('AjoutDossier.dc.html', 'AjoutDossier', 'a-ajd'),
    ('NouvelleAlerte.dc.html', 'NouvelleAlerte', 'a-nal'),
    # Mobile : feuilles qui montent du bas (recherche, ajout à un dossier, nouvelle alerte).
    ('MPalette.dc.html', 'MPalette', 'm-pal'),
    ('MAjout.dc.html', 'MAjout', 'm-ajd'),
    ('MNouvelleAlerte.dc.html', 'MNouvelleAlerte', 'm-nal'),
    # L'aperçu sans abonnement (19/11), montés par src/app/main.js : Apps réduit au top 3, et la fenêtre des formules.
    ('ApercuA.dc.html', 'Apercu', 'a-apr'),
    ('FormulesA.dc.html', 'Formules', 'a-for'),
    ('MApercuApps.dc.html', 'MApercuApps', 'm-apr'),
    ('MFormules.dc.html', 'MFormules', 'm-for'),
    # Panneau du compte (19/11) : ouvert par l'avatar de la barre latérale, monté par src/app/main.js.
    ('MenuCompteA.dc.html', 'MenuCompte', 'a-mnu'),
    # Réglages (19/11) : fenêtre sur ordinateur, plein écran (liste puis détail) sur téléphone à /app/compte.
    ('ReglagesA.dc.html', 'Reglages', 'a-reg'),
]
# Audit Q33 (19/11) : un drapeau SWARM_SANS_MOBILE retirait ici les écrans mobiles des routes (téléphones servis par le
# desktop) et, en filtrant sur l'initiale « M », jetait aussi MenuCompte (desktop). Tous les écrans mobiles sont branchés :
# retiré. Si un filtre redevient nécessaire, une liste explicite de composants, jamais l'initiale du nom de fichier.
def _plain(route):
    if ':' not in route:
        return route
    sample = APP_SAMPLE.get(route)
    return route.split('/:')[0] + ('/' + sample if sample else '')


APP_LINKS = {src: _plain(route) for src, _, _, route, _, _ in APP_PAGES}
# 'FicheA.dc.html?app=' + slug -> '/app/apps/' + slug : la base de l'adresse à paramètre.
APP_PARAM_LINKS = {src: route.split('/:')[0] + '/' for src, _, _, route, _, _ in APP_PAGES if ':' in route}
APP_LINKS.update({src: _plain(route) for src, _, _, route in APP_MOBILE_PAGES})
APP_PARAM_LINKS.update({src: route.split('/:')[0] + '/' for src, _, _, route in APP_MOBILE_PAGES if ':' in route})
# Artboards sans écran, encore cités par des canevas. Audit Q33 et F22 (19/11) : six entrées visaient des artboards
# disparus (MFiltres, MApercu, MCreerAlerte, MRecherche, MAbonnement, MConnexion) ; un lien vers l'un d'eux serait passé en
# silence au lieu de déclencher « lien(s) sans route ». Chaque entrée ici doit être citée par un canevas
# (scripts/generation.test.mjs).
APP_LINKS.update({
    'FormatsA.dc.html': '/app/formats',        # ancien écran Formats (restes de données), remplacé par FormatsB
    # Ancienne page Compte (sans résiliation ni facturation), retirée (audit Q13) : /app/compte ouvre les Réglages
    # (src/app/main.js : panneau sur ordinateur, plein écran sur téléphone).
    'CompteA.dc.html': '/app/compte', 'MCompte.dc.html': '/app/compte',
    'ConnexionA.dc.html': '/app/deconnexion',  # « Se déconnecter » du compte : le routeur déconnecte puis renvoie à l'accueil du site
})

# Attributs qui portent une adresse : un trou y passe par $u (src/runtime.js).
URL_ATTRS = {'href', 'src', 'action', 'formaction', 'poster', 'xlink:href'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
HOLE = re.compile(r'\{\{\s*([A-Za-z_$][\w$]*(?:\.[\w$]+)*)\s*\}\}')


class Node:
    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = attrs or []
        self.children = []


class GenError(SystemExit):
    """Un canevas que la conversion rendrait faux : la génération s'arrête, avec le fichier et la ligne (audit Q43)."""


def fail(msg, snippet=None):
    """Arrête la génération : fichier du canevas en cours, ligne du morceau fautif s'il s'y trouve."""
    where = CURRENT.get('file') or '?'
    text = CURRENT.get('text') or ''
    if snippet and snippet in text:
        where += f':{text[:text.index(snippet)].count(chr(10)) + 1}'
    raise GenError(f'{where} : {msg}' + (f' — {snippet.strip()[:120]}' if snippet else ''))


class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root')
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        # « <div/> » n'est pas fermé en HTML : le navigateur (donc le canevas) y range les frères qui suivent, la conversion
        # en faisait des frères. Seuls les éléments vides et le SVG (où « /> » ferme) l'acceptent (audit Q43).
        if tag not in VOID and tag != 'svg' and not any(n.tag == 'svg' for n in self.stack):
            fail(f'<{tag} … /> n\'est pas fermé en HTML : écrire <{tag} …></{tag}>', self.get_starttag_text())
        self.stack[-1].children.append(Node(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return
        raise ValueError(f'balise fermante orpheline </{tag}>')

    def handle_data(self, data):
        self.stack[-1].children.append(data)


# HTMLParser met tous les noms en minuscules. En SVG la casse compte : sans `viewBox`
# l'icône n'est plus mise à l'échelle, sans `linearGradient` le dégradé disparaît.
SVG_TAGS = {t.lower(): t for t in [
    'linearGradient', 'radialGradient', 'clipPath', 'foreignObject', 'textPath', 'animateTransform',
    'animateMotion', 'feGaussianBlur', 'feOffset', 'feMerge', 'feMergeNode', 'feColorMatrix', 'feBlend',
    'feFlood', 'feComposite', 'feDropShadow', 'feTurbulence', 'feDisplacementMap']}
SVG_ATTRS = {a.lower(): a for a in [
    'viewBox', 'preserveAspectRatio', 'gradientUnits', 'gradientTransform', 'spreadMethod', 'patternUnits',
    'patternContentUnits', 'patternTransform', 'clipPathUnits', 'maskUnits', 'maskContentUnits', 'filterUnits',
    'primitiveUnits', 'stdDeviation', 'textLength', 'lengthAdjust', 'startOffset', 'markerWidth', 'markerHeight',
    'markerUnits', 'refX', 'refY', 'pathLength', 'baseFrequency', 'numOctaves', 'attributeName', 'repeatCount',
    'keyTimes', 'keySplines', 'calcMode', 'xChannelSelector', 'yChannelSelector']}
EVENTS = {'onclick': 'onClick', 'oninput': 'onInput', 'onchange': 'onChange', 'onsubmit': 'onSubmit', 'onfocus': 'onFocus', 'onblur': 'onBlur',
          'onmouseenter': 'onMouseEnter', 'onmouseleave': 'onMouseLeave', 'onkeydown': 'onKeyDown', 'onpointerdown': 'onPointerDown'}


def attr_name(name):
    return SVG_ATTRS.get(name) or EVENTS.get(name) or name


def path_expr(path, scope):
    parts = path.split('.')
    head = parts[0] if parts[0] in scope else '$v.' + parts[0]  # $v : valeurs de renderVals(), jamais masqué par une variable de boucle
    return head + ''.join('?.' + p for p in parts[1:])


def value_expr(raw, scope):
    """Valeur d'attribut ou de texte -> expression JS."""
    m = HOLE.fullmatch(raw.strip()) if raw.strip() == raw else None
    if m:
        return path_expr(m.group(1), scope)
    if not HOLE.search(raw):
        return json.dumps(raw, ensure_ascii=False)
    out, last = [], 0
    for m in HOLE.finditer(raw):
        out.append(raw[last:m.start()].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${'))
        out.append('${$t(' + path_expr(m.group(1), scope) + ')}')
        last = m.end()
    out.append(raw[last:].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${'))
    return '`' + ''.join(out) + '`'


# Depuis les Tarifs, un lien vers la LP pointe sur la bonne section selon son libellé.
ANCHORS = {
    'Comment ça marche': '#produit', 'Exemple': '#exemple', 'FAQ': '#faq',
    'Apps qui explosent': '#produit', 'Formats qui explosent': '#exemple', 'Créateurs': '#produit',
    'Créateurs derrière chaque app': '#produit', 'Tous les marchés': '#produit', 'Revenus estimés': '#produit',
}
LP_FILES = ('LP.dc.html', 'LPMobile.dc.html')


def rewrite_links(value, label=None, links=LINKS):
    if links is LINKS and value in LP_FILES and label in ANCHORS:
        return '/' + ANCHORS[label]
    if value in links:  # ancre seule qui mène ailleurs : « #quiz » -> /inscription, « #connexion » -> /connexion
        return links[value]
    page, sep, anchor = value.partition('#')
    page, qsep, query = page.partition('?')
    if page in links:
        return links[page] + qsep + query + sep + anchor
    return value


def rewrite_script_links(script, links=LINKS):
    if links is LINKS:
        files = '|'.join(re.escape(f) for f in LP_FILES)
        for label, anchor in ANCHORS.items():
            lab = re.escape(label)
            script = re.sub(r"\['" + lab + r"', '(?:" + files + r")'\]", f"['{label}', '/{anchor}']", script)
            script = re.sub(r"(t: '" + lab + r"'[^}]*?href: )'(?:" + files + r")'", r"\g<1>'/" + anchor + "'", script)
    # 'X.dc.html?param=' (suivi de + valeur) -> base de l'adresse à paramètre
    if links is APP_LINKS:
        for src, base in APP_PARAM_LINKS.items():
            script = re.sub(r"(['\"])" + re.escape(src) + r"\?[A-Za-z]+=(['\"])", lambda m: m.group(1) + base + m.group(2), script)
            # lien d'exemple écrit en entier : 'MVideo.dc.html?v=abc' -> '/app/videos/abc'
            script = re.sub(r"(['\"])" + re.escape(src) + r"\?[A-Za-z]+=([^'\"&#]+)\1", lambda m: m.group(1) + base + m.group(2) + m.group(1), script)
    # 'X.dc.html?filtre=' (écran sans paramètre d'adresse) -> adresse + requête : '/app/apps?niche=' + valeur
    if links is APP_LINKS:
        for src, route in links.items():
            if src not in APP_PARAM_LINKS:
                script = re.sub(r"(['\"])" + re.escape(src) + r"\?", lambda m, r=route: m.group(1) + r + '?', script)
    # 'X.dc.html' ou "X.dc.html#ancre" dans le script -> adresse (+ ancre)
    def to_route(m):
        q, page, anchor = m.group(1), m.group(2), m.group(3) or ''
        return f'{q}{links[page]}{anchor}{q}' if page in links else m.group(0)
    return re.sub(r'([\'"])([A-Za-z]+\.dc\.html)(#[\w-]*)?\1', to_route, script)


def text_of(node):
    return ''.join(c for c in node.children if isinstance(c, str)).strip()


def gen(node, scope, ind):
    pad = '  ' * ind
    if isinstance(node, str):
        if not node.strip():
            if '\n' in node:
                return None
            return pad + json.dumps(node)
        if HOLE.search(node):
            parts, last = [], 0
            for m in HOLE.finditer(node):
                if m.start() > last:
                    parts.append(json.dumps(node[last:m.start()], ensure_ascii=False))
                parts.append('$t(' + path_expr(m.group(1), scope) + ')')
                last = m.end()
            if last < len(node):
                parts.append(json.dumps(node[last:], ensure_ascii=False))
            return pad + ', '.join(parts)
        return pad + json.dumps(node, ensure_ascii=False)

    attrs = dict(node.attrs)
    # Une condition, une liste ou un gestionnaire doit être un trou plein : « {{!x}} » ou « {{a[0]}} » devenait une chaîne
    # constante (condition toujours vraie), « {{go}} » précédé d'une espace un gestionnaire texte (audit Q43).
    for key in (['list'] if node.tag == 'sc-for' else ['value'] if node.tag == 'sc-if' else []):
        if not HOLE.fullmatch(attrs.get(key) or ''):
            fail(f'<{node.tag} {key}="…"> doit être un trou plein {{{{chemin}}}}', f'{key}="{attrs.get(key)}"')
    if node.tag == 'sc-for':
        var = attrs['as']
        lst = value_expr(attrs['list'], scope)
        inner = gen_children(node, scope | {var}, ind + 1)
        return f'{pad}($l({lst})).map(({var}) => [\n{inner}\n{pad}])'
    if node.tag == 'sc-if':
        cond = value_expr(attrs['value'], scope)
        inner = gen_children(node, scope, ind + 1)
        return f'{pad}({cond}) ? [\n{inner}\n{pad}] : null'

    if node.tag == 'dc-import':
        comp = attrs['name']
        CURRENT['imports'].add(comp)
        cprops = []
        for name, val in node.attrs:
            if name == 'name' or name.startswith('hint-'):
                continue
            camel = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), name)  # on-close -> onClose
            cprops.append(f'{json.dumps(camel)}: {value_expr(val, scope) if val is not None else "true"}')
        return f'{pad}$h({comp}, {{ {", ".join(cprops)} }})'

    # Sur un champ texte, onChange du canevas = à chaque frappe ; en Preact c'est onInput.
    text_field = node.tag == 'textarea' or (node.tag == 'input' and attrs.get('type', 'text') not in ('checkbox', 'radio', 'file', 'range', 'color'))
    props = []
    for name, val in node.attrs:
        if text_field and name.lower() == 'onchange':
            name = 'oninput'
        if name.startswith('hint-'):
            continue
        if name.lower().startswith('on') and not HOLE.fullmatch(val or ''):
            fail(f'{name}="…" doit être un trou plein {{{{chemin}}}}', f'{name}="{val}"')
        if val is None:
            props.append(f'{json.dumps(name)}: true')
            continue
        if name == 'href':
            val = rewrite_links(val, text_of(node), CURRENT['links'])
        expr = value_expr(val, scope)
        # Une adresse venue des données passe par $u (src/runtime.js, audit S34) : jamais « javascript: » dans la page.
        if name.lower() in URL_ATTRS and HOLE.search(val):
            expr = f'$u({expr})'
            CURRENT['url'] = True
        props.append(f'{json.dumps(attr_name(name))}: {expr}')
    # App : une image ne se télécharge qu'à l'approche de l'écran (listes de 150 formats, 200 comptes).
    if node.tag == 'img' and CURRENT['links'] is APP_LINKS and 'loading' not in attrs:
        props += ['"loading": "lazy"', '"decoding": "async"']
    props_js = '{ ' + ', '.join(props) + ' }' if props else 'null'
    tag = json.dumps(SVG_TAGS.get(node.tag, node.tag))
    if node.tag in VOID or not node.children:
        return f'{pad}$h({tag}, {props_js})'
    inner = gen_children(node, scope, ind + 1)
    if not inner.strip():
        return f'{pad}$h({tag}, {props_js})'
    return f'{pad}$h({tag}, {props_js},\n{inner}\n{pad})'


def gen_children(node, scope, ind):
    parts = [gen(c, scope, ind) for c in node.children]
    return ',\n'.join(p for p in parts if p is not None)


# Une déclaration d'animation (animation, animation-name, ou une variable CSS qui en porte une) : seul endroit où un nom
# de keyframes est renommé. Audit Q43 : « pulse 2s » était aussi préfixé dans le texte visible (« Tape pulse 2s »).
ANIM_DECL = re.compile(r'((?:animation(?:-name)?|--[\w-]+)\s*:\s*)([^;}"]*)')


def prefix_keyframes(css, template, script, prefix):
    names = sorted(set(re.findall(r'@keyframes\s+([A-Za-z_][\w-]*)', css)), key=len, reverse=True)
    if not names:
        return css, template, script
    alt = '|'.join(re.escape(n) for n in names)
    word = re.compile(r'(?<![\w-])(' + alt + r')(?![\w-])')
    in_decl = lambda m: m.group(1) + word.sub(lambda w: f'{prefix}-{w.group(1)}', m.group(2))
    css = re.sub(r'(@keyframes\s+)([A-Za-z_][\w-]*)', lambda m: m.group(1) + (f'{prefix}-{m.group(2)}' if m.group(2) in names else m.group(2)), css)
    css = ANIM_DECL.sub(in_decl, css)
    # Gabarit : dans les attributs style seulement, jamais dans le texte.
    template = re.sub(r'(\bstyle=")([^"]*)(")', lambda m: m.group(1) + ANIM_DECL.sub(in_decl, m.group(2)) + m.group(3), template)
    # Script : une chaîne qui est une valeur d'animation (le nom en tête : « pulse 2s … »), ou une déclaration d'animation
    # dans une chaîne de style ; jamais un nom au milieu d'une phrase.
    script = re.sub(r"(?<=['\"`])(" + alt + r")(?=\s|['\"`])", lambda m: f'{prefix}-{m.group(1)}', script)
    script = re.sub(r'(animation(?:-name)?\s*:\s*)([^;\'"`}]*)', in_decl, script)
    return css, template, script


# Images : chaque canevas les sert sous /_blob/<id> ; le site les sert depuis public/media/.
MEDIA = json.loads((ROOT / 'design' / 'media.json').read_text())
MEDIA.update(json.loads((ROOT / 'design' / 'app' / 'media.json').read_text()))

GROUPS = {
    'site': {'src': ROOT / 'design', 'pages': ROOT / 'src' / 'pages', 'styles': ROOT / 'src' / 'styles',
             'runtime': '../runtime.js', 'links': LINKS, 'css_import': False},
    'app': {'src': ROOT / 'design' / 'app', 'pages': ROOT / 'src' / 'app' / 'pages', 'styles': ROOT / 'src' / 'app' / 'styles',
            'runtime': '../../runtime.js', 'links': APP_LINKS, 'css_import': False},  # CSS chargé par routes.js
}
CURRENT = {'links': LINKS, 'imports': set()}
IMPORTS = {}  # composant généré -> composants qu'il importe (<dc-import>)

# ─── Données d'exemple de l'app (audit S4) ───
# Ce qui ne doit jamais partir dans un fichier public de l'app : id de vidéo TikTok, « @pseudo », image de l'app.
SAMPLE = re.compile(r'/media/app/|/_blob/|\b7\d{18}\b|["\'`]@[A-Za-z0-9._]{2,30}["\'`]')
SAMPLES_DIR = ROOT / 'design' / 'app' / 'samples'
DECL = re.compile(r'\b(let|const|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\[{])')


def _skip_str(s, i):
    """s[i] ouvre une chaîne ' ou " : l'index qui suit sa fin."""
    q, i = s[i], i + 1
    while s[i] != q:
        i += 2 if s[i] == '\\' else 1
    return i + 1


def _skip_tpl(s, i):
    """s[i] ouvre un gabarit ` : l'index qui suit sa fin, expressions ${…} comprises."""
    i += 1
    while s[i] != '`':
        if s[i] == '\\':
            i += 2
        elif s.startswith('${', i):
            i = js_end(s, i + 1)  # l'expression, de son accolade ouvrante à la fermante
        else:
            i += 1
    return i + 1


def js_end(s, i):
    """s[i] ouvre [, { ou ( : l'index qui suit le crochet fermant (chaînes, gabarits et commentaires sautés)."""
    depth, n = 0, len(s)
    while i < n:
        c = s[i]
        if c in '"\'':
            i = _skip_str(s, i)
            continue
        if c == '`':
            i = _skip_tpl(s, i)
            continue
        if s.startswith('//', i):
            i = s.index('\n', i)
            continue
        if s.startswith('/*', i):
            i = s.index('*/', i) + 2
            continue
        if c in '[{(':
            depth += 1
        elif c in ']})':
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise SystemExit('dc2preact : littéral non fermé')


REGEX_BEFORE = set('(,=:[!&|?{};+-*%<>~^')
REGEX_WORDS = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await'}


def _skip_regex(s, i):
    """s[i] ouvre une regex /…/ : l'index qui suit ses drapeaux."""
    i, cls = i + 1, False
    while cls or s[i] != '/':
        if s[i] == '\\':
            i += 1
        elif s[i] == '[':
            cls = True
        elif s[i] == ']':
            cls = False
        i += 1
    i += 1
    while i < len(s) and s[i].isalpha():
        i += 1
    return i


def string_tokens(s):
    """(début, fin) de chaque chaîne '…' ou "…" du code ; commentaires, gabarits et regex sautés."""
    out, i, n, prev, word = [], 0, len(s), '', ''
    while i < n:
        c = s[i]
        if c in '"\'':
            j = _skip_str(s, i)
            out.append((i, j))
            i, prev, word = j, 'x', ''
            continue
        if c == '`':
            i, prev, word = _skip_tpl(s, i), 'x', ''
            continue
        if s.startswith('//', i):
            i = s.index('\n', i)
            continue
        if s.startswith('/*', i):
            i = s.index('*/', i) + 2
            continue
        if c == '/' and (prev == '' or prev in REGEX_BEFORE or word in REGEX_WORDS):
            i, prev, word = _skip_regex(s, i), 'x', ''
            continue
        if c.isalnum() or c in '_$':
            word = word + c if prev and (prev.isalnum() or prev in '_$') else c
        elif not c.isspace():
            word = ''
        if not c.isspace():
            prev = c
        i += 1
    return out


def block_end(s, i):
    """s[i] ouvre { : l'index qui suit l'accolade fermante ; chaînes, gabarits, commentaires et regex sautés."""
    depth, n, prev, word = 0, len(s), '', ''
    while i < n:
        c = s[i]
        if c in '"\'':
            i, prev, word = _skip_str(s, i), 'x', ''
            continue
        if c == '`':
            i, prev, word = _skip_tpl(s, i), 'x', ''
            continue
        if s.startswith('//', i):
            i = s.index('\n', i)
            continue
        if s.startswith('/*', i):
            i = s.index('*/', i) + 2
            continue
        if c == '/' and (prev == '' or prev in REGEX_BEFORE or word in REGEX_WORDS):
            i, prev, word = _skip_regex(s, i), 'x', ''
            continue
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return i + 1
        if c.isalnum() or c in '_$':
            word = word + c if prev and (prev.isalnum() or prev in '_$') else c
        elif not c.isspace():
            word = ''
        if not c.isspace():
            prev = c
        i += 1
    fail('accolade de la classe jamais fermée')


def strip_js_comments(s):
    return re.sub(r'/\*.*?\*/|//[^\n]*', '', s, flags=re.S)


# Pour chaque littéral : faux s'il ne se calcule pas seul (il lit une variable de l'écran) ; sinon sa valeur vide, de
# même forme : [] pour une liste ; pour un objet, mêmes clés, chaînes vides, listes vides, objets vidés de même (un écran
# qui traite toujours l'exemple, Formats et sa « une », ne tombe pas sur une clé absente). Faux aussi si l'objet porte
# une fonction (elle ne se recopie pas). Une clé qui est elle-même une donnée (objet indexé par pseudo, par id de vidéo)
# disparaît.
EMPTY_JS = r"""
const l = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const KEY = /\/media\/app\/|\/_blob\/|\b7\d{18}\b|^@[A-Za-z0-9._]{2,30}$/;
const empty = (x) => {
  if (Array.isArray(x)) return [];
  if (typeof x === 'string') return '';
  if (typeof x === 'function') throw new Error('fonction');
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).filter(([k]) => !KEY.test(k)).map(([k, v]) => [k, empty(v)]));
  return x;
};
console.log(JSON.stringify(l.map((src) => { try { return JSON.stringify(empty(new Function('return (' + src + ')')())); } catch { return false; } })));
"""


def pure(literals):
    """La valeur vide de chaque littéral (texte JS), ou False s'il ne se calcule pas seul. Un seul appel à Node."""
    if not literals:
        return []
    r = subprocess.run(['node', '-e', EMPTY_JS], input=json.dumps(literals), capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def strip_samples(body, name):
    """Retire les littéraux d'exemple sensibles du corps de classe ; rend le corps et {nom: littéral}."""
    found = []
    for m in DECL.finditer(body):
        start = m.start(3)
        end = js_end(body, start)
        lit = body[start:end]
        if SAMPLE.search(lit):
            found.append((start, end, m.group(2), lit))
    ok = pure([f[3] for f in found])
    samples, out, at = {}, [], 0
    for (start, end, var, lit), empty in zip(found, ok):
        if empty is False or start < at:  # calculé depuis l'écran (ex. dash), ou imbriqué dans un littéral déjà retiré
            continue
        key = var if var not in samples else f'{var}_{len(samples)}'
        samples[key] = lit
        out.append(body[at:start] + f'(globalThis.__dcSample?.[{json.dumps(name)}]?.[{json.dumps(key)}] ?? {empty})')
        at = end
    body = ''.join(out) + body[at:]
    # Ce qui reste (valeur par défaut en ligne, argument d'appel, littéral calculé) : chaque chaîne concernée seule.
    out, at = [], 0
    for start, end in string_tokens(body):
        text = body[start:end]
        if not SAMPLE.search(text):
            continue
        if text[1:-1].endswith('/'):
            raise SystemExit(f'{name} : {text} ressemble à un début de chemin construit par le code, pas à un exemple')
        key = f'$s{len(samples)}'
        samples[key] = text
        out.append(body[at:start] + f'(globalThis.__dcSample?.[{json.dumps(name)}]?.[{json.dumps(key)}] ?? "")')
        at = end
    return ''.join(out) + body[at:], samples


def write_samples(name, rel, samples):
    path = SAMPLES_DIR / f'{name}.js'
    if not samples:
        if path.exists():
            path.unlink()
        return
    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
    items = ',\n'.join(f'  {json.dumps(k)}: {v}' for k, v in samples.items())
    path.write_text(f'// Données d\'exemple de design/{rel}, retirées de l\'app par scripts/dc2preact.py (audit S4).\n'
                    f'// Chargées par scripts/check.mjs seulement : jamais livrées au navigateur.\n'
                    f'export default {{\n{items},\n}};\n')


SYNTAX_JS = r"""
const { transformSync } = require('esbuild');
const bad = [];
for (const f of JSON.parse(require('fs').readFileSync(0, 'utf8'))) {
  try { transformSync(require('fs').readFileSync(f, 'utf8'), { loader: 'js', format: 'esm' }); } catch (e) { bad.push(f + ' : ' + e.message.split('\n')[1]); }
}
console.log(JSON.stringify(bad));
"""


# ─── Polices des canevas (audit Q12) ───
# La page HTML qui porte chaque écran : ses <link> de polices sont déjà chargés.
PAGE_HTML = {'app': 'app.html', 'LP': 'index.html', 'LPMobile': 'index.html', 'Tarifs': 'tarifs.html',
             'TarifsMobile': 'tarifs.html', 'Connexion': 'connexion.html', 'Inscription': 'inscription.html',
             'MotDePasse': 'mot-de-passe-oublie.html', 'Adresse': 'confirmer-adresse.html',
             'Simulateur': 'simulateur.html', 'SimulateurMobile': 'simulateur.html',
             'Plan': 'plan.html', 'PlanMobile': 'plan.html'}
FONT_LINK = re.compile(r'<link\b[^>]*>', re.S)


def font_families(html):
    """{famille: spécification} des polices Google chargées par les <link rel=stylesheet> d'un texte HTML."""
    out = {}
    for tag in FONT_LINK.findall(html):
        if 'stylesheet' not in tag:
            continue
        m = re.search(r'href="([^"]+)"', tag)
        if not m or 'fonts.googleapis.com/css' not in m.group(1):
            continue
        for spec in re.findall(r'family=([^&]+)', m.group(1).replace('&amp;', '&')):
            out[spec.split(':')[0].replace('+', ' ')] = spec
    return out


def top_rules(css):
    """(début, fin, sélecteur) de chaque règle de premier niveau d'une feuille (hors @media, @keyframes…)."""
    out, i, depth, start = [], 0, 0, 0
    css_wo = re.sub(r'/\*.*?\*/', lambda m: ' ' * len(m.group(0)), css, flags=re.S)
    for i, c in enumerate(css_wo):
        if c == '{':
            if depth == 0:
                sel_start = start
                sel = css_wo[start:i].strip()
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                out.append((sel_start, i + 1, sel))
                start = i + 1
        elif c == ';' and depth == 0:
            start = i + 1
    return out


def hover_for_mice(css):
    """Le survol global des liens (« a:hover ») sous @media (hover: hover), comme dans les canevas mobiles. Audit Q45 (19/11) :
    a-apr.css, importé d'office par src/app/main.js, le posait sans condition ; sur téléphone, un lien touché restait
    blanc (survol collant) tant qu'on ne touchait pas ailleurs."""
    out, at = [], 0
    for start, end, sel in top_rules(css):
        if sel.startswith('@') or not any(x.strip() == 'a:hover' for x in sel.split(',')):
            continue
        rule = css[start:end].strip()
        out.append(css[at:start] + f'@media (hover: hover){{{rule}}}')
        at = end
    return ''.join(out) + css[at:]


def missing_fonts(helmet, name, group):
    """L'adresse Google Fonts des familles du helmet que la page HTML de l'écran ne charge pas (ou None)."""
    html_name = PAGE_HTML.get('app' if group == 'app' else name)
    if not html_name or not (ROOT / html_name).exists():
        return None
    have = font_families((ROOT / html_name).read_text())
    want = font_families(helmet)
    specs = [spec for fam, spec in want.items() if fam not in have]
    return 'https://fonts.googleapis.com/css2?' + '&'.join('family=' + x for x in specs) + '&display=swap' if specs else None


def check_app_pages():
    """Échec si un écran généré de l'app livre encore des données du Radar, ou si le retrait l'a rendu illisible."""
    files = [str(f) for f in sorted(GROUPS['app']['pages'].glob('*.js'))]
    r = subprocess.run(['node', '-e', SYNTAX_JS], input=json.dumps(files), capture_output=True, text=True, check=True, cwd=ROOT)
    broken = json.loads(r.stdout)
    if broken:
        raise SystemExit('Écran de l\'app illisible après le retrait des exemples :\n  ' + '\n  '.join(broken))
    bad = []
    for f in sorted(GROUPS['app']['pages'].glob('*.js')):
        hits = sorted(set(SAMPLE.findall(f.read_text())))
        if hits:
            bad.append(f'{f.relative_to(ROOT)} : {", ".join(hits[:6])}{" …" if len(hits) > 6 else ""} ({len(hits)})')
    if bad:
        raise SystemExit('Données du Radar dans un écran de l\'app (livré sans compte) :\n  ' + '\n  '.join(bad))


def convert(src, name, prefix, group='site'):
    g = GROUPS[group]
    CURRENT['links'] = g['links']
    CURRENT['imports'] = set()
    CURRENT['url'] = False
    text = (g['src'] / src).read_text()
    CURRENT['file'] = str((g['src'] / src).relative_to(ROOT)) if (g['src'] / src).is_relative_to(ROOT) else src
    CURRENT['text'] = text
    for blob, local in MEDIA.items():
        text = text.replace(blob, local)
    xdc = text.split('<x-dc>', 1)[1].split('</x-dc>', 1)[0]
    helmet = re.search(r'<helmet>(.*?)</helmet>', xdc, re.S).group(1)
    template = re.sub(r'<helmet>.*?</helmet>', '', xdc, flags=re.S)
    if group == 'site':
        # Audit F10 : les images du site se chargent au défilement (loading=lazy), sauf celles du haut de page, marquées
        # data-eager dans le canevas. Avant, les ~30 images de la landing partaient d'un coup (1,08 Mo pour 3 visibles).
        template = re.sub(r'<img\b(?![^>]*\bloading=)(?![^>]*\bdata-eager)', '<img loading="lazy" decoding="async"', template)
        template = re.sub(r'(<img\b[^>]*?)\s+data-eager(?:="[^"]*")?', r'\1', template)
    # Feuilles du helmet : <style>, ou <style media="…"> rangée sous @media ; toute autre forme arrête (audit Q43 : une
    # <style media=…> était jetée sans bruit).
    sheets = []
    for m in re.finditer(r'<style\b([^>]*)>(.*?)</style>', helmet, re.S):
        extra = m.group(1).strip()
        media = re.fullmatch(r'media="([^"]+)"', extra)
        if extra and not media:
            fail('<style> du helmet : seul l\'attribut media est compris', f'<style{m.group(1)}>')
        sheets.append(f'@media {media.group(1)}{{{m.group(2)}}}' if media else m.group(2))
    css = '\n'.join(sheets).strip()
    script = re.search(r'<script type="text/x-dc" data-dc-script[^>]*>(.*?)</script>', text, re.S).group(1)

    css, template, script = prefix_keyframes(css, template, script, prefix)
    if group == 'app':
        css = hover_for_mice(css)
    script = rewrite_script_links(script, g['links'])

    p = Parser()
    p.feed(template)
    p.close()
    if len(p.stack) > 1:  # audit Q43 : une balise jamais fermée rangeait la suite du gabarit dedans, sans bruit
        fail('balise(s) jamais fermée(s) : ' + ', '.join(f'<{n.tag}>' for n in p.stack[1:]))
    roots = [c for c in p.root.children if not (isinstance(c, str) and not c.strip())]
    body = ',\n'.join(gen(c, set(), 3) for c in roots)
    # Un trou que la conversion ne comprend pas ({{a[0]}}, {{ x + 1 }}) restait écrit tel quel dans la page (audit Q43).
    left = re.search(r'\{\{[^}]*\}\}', body)
    if left:
        fail(f'trou non converti {left.group(0)} : seuls les chemins {{{{a.b.c}}}} sont compris', left.group(0))

    m = re.search(r'class\s+Component\s+extends\s+DCLogic\s*\{', script)
    if not m:
        fail('pas de « class Component extends DCLogic { … } » dans le script')
    start = m.end()
    end = block_end(script, start - 1) - 1  # l'accolade qui ferme la classe
    # Tout le code doit être dans la classe : une constante ou une fonction écrite avant ou après était jetée (l'écran
    # plantait au rendu, ReferenceError), ou rangée dans la classe et la rendait illisible (audit Q43).
    outside = strip_js_comments(script[:m.start()] + '\n' + script[end + 1:]).strip()
    if outside:
        fail('du code hors de la classe Component (le mettre dans la classe, ou dans renderVals)', outside.split('\n')[0])
    cls_body = script[start:end].rstrip()

    rel = src if group == 'site' else f'app/{src}'
    if group == 'app':
        cls_body, samples = strip_samples(cls_body, name)
        write_samples(name, rel, samples)
    css_import = f"import '../styles/{prefix}.css';\n" if g['css_import'] else ''
    fonts = missing_fonts(helmet, name, group)
    css_import += ''.join(f"import {c} from './{c}.js';\n" for c in sorted(CURRENT['imports']))
    IMPORTS[name] = sorted(CURRENT['imports'])
    runtime = 'DCLogic, $t, $l' + (', $u' if CURRENT['url'] else '') + (', $fonts' if fonts else '')
    fonts_call = f"$fonts([{json.dumps(fonts)}]); // polices du canevas absentes de la page HTML (audit Q12)\n" if fonts else ''
    js = f"""// Généré par scripts/dc2preact.py depuis design/{rel} — ne pas modifier à la main.
import {{ h as $h }} from 'preact';  // $h : jamais masqué par une variable de boucle
import {{ {runtime} }} from '{g['runtime']}';
{css_import}{fonts_call}
export default class {name} extends DCLogic {{{cls_body}

  render() {{
    const $v = this.renderVals();
    return [
{body}
    ];
  }}
}}
"""
    # Un lien vers un artboard sans route mènerait nulle part : on s'arrête.
    left = sorted(set(re.findall(r'[A-Za-z]+\.dc\.html', js.split('\n', 1)[1])))  # hors commentaire d'en-tête
    if left:
        raise SystemExit(f'design/{rel} : lien(s) sans route : {", ".join(left)}')
    g['pages'].mkdir(parents=True, exist_ok=True)
    g['styles'].mkdir(parents=True, exist_ok=True)
    (g['pages'] / f'{name}.js').write_text(js)
    (g['styles'] / f'{prefix}.css').write_text(f'/* Généré par scripts/dc2preact.py depuis design/{rel} */\n{css}\n')
    print(f'{rel} -> {g["pages"].relative_to(ROOT)}/{name}.js')


MOBILE_BASE = 'm-base'


def factor_mobile_css():
    """Les règles communes à tous les écrans mobiles, une seule fois dans src/app/styles/m-base.css (audit Q32, 19/11).

    Chaque canevas mobile recopie la même feuille de 17,5 Ko : un téléphone en chargeait 2 au premier écran (l'écran et
    la palette) et 5 après le préchauffage, et le CSSOM gardait autant de jeux de règles identiques. Les règles présentes
    dans les CSS de TOUS les écrans mobiles routés vont dans m-base.css, chargée avec chaque écran mobile (routes.js,
    loadMobile) ; elles sont retirées de ces écrans et des composants qu'ils importent. Jamais en statique dans
    src/app/main.js : la feuille poserait sur ordinateur ses règles globales (fond, liens, zones de clic). La génération
    s'arrête si une règle restée dans un écran porte un sélecteur de m-base (l'ordre des feuilles compterait alors).
    Rend la liste des préfixes allégés."""
    styles = GROUPS['app']['styles']
    routes = [prefix for _, _, prefix, _ in APP_MOBILE_PAGES]
    prefixes = {name: prefix for _, name, prefix, *_ in APP_PAGES + APP_COMPONENTS + APP_MOBILE_PAGES}
    with_mobile = set(routes)
    for _, name, _, _ in APP_MOBILE_PAGES:  # les composants chargés avec un écran mobile (palette, ajout, alerte)
        stack = list(IMPORTS.get(name, []))
        while stack:
            c = stack.pop()
            if prefixes[c] not in with_mobile:
                with_mobile.add(prefixes[c])
                stack += IMPORTS.get(c, [])

    def rules(prefix):
        css = (styles / f'{prefix}.css').read_text()
        head, body = css.split('\n', 1) if css.startswith('/*') else ('', css)
        return head, [body[a:b].strip() for a, b, _ in top_rules(body)]
    parsed = {p: rules(p) for p in with_mobile}
    common = set(parsed[routes[0]][1]).intersection(*(set(parsed[p][1]) for p in routes[1:]))
    base = [r for r in parsed[routes[0]][1] if r in common]
    if not base:
        return []
    def decls(rs, ctx=''):
        """(contexte @…, sélecteur, propriété) -> valeur, pour chaque déclaration (règles @media dépliées)."""
        out = {}
        for r in rs:
            pre, _, inner = r.partition('{')
            inner = inner[:-1] if inner.endswith('}') else inner
            if pre.strip().startswith('@'):
                if pre.strip().startswith(('@media', '@supports', '@container')):
                    out.update(decls([inner[a:b].strip() for a, b, _ in top_rules(inner)], ctx + pre.strip()))
                continue
            for sel in pre.split(','):
                for d in inner.split(';'):
                    if ':' in d:
                        k, v = d.split(':', 1)
                        out[(ctx, sel.strip(), k.strip())] = v.strip()
        return out
    base_decls = decls(base)
    keeps = {}
    for p in sorted(with_mobile):
        head, rs = parsed[p]
        keeps[p] = (head, [r for r in rs if r not in common])
        clash = [k for k, v in decls(keeps[p][1]).items() if k in base_decls and base_decls[k] != v]
        if clash:
            raise GenError(f'src/app/styles/{p}.css : {clash[0][1]} {{ {clash[0][2]} }} diffère de m-base, l\'ordre des feuilles compterait')
    for p, (head, keep) in keeps.items():
        (styles / f'{p}.css').write_text(head + '\n' + '\n'.join(keep) + ('\n' if keep else ''))
    (styles / f'{MOBILE_BASE}.css').write_text('/* Généré par scripts/dc2preact.py : règles communes à tous les écrans mobiles de l\'app (audit Q32) */\n'
                                             + '\n'.join(base) + '\n')
    print(f'src/app/styles/{MOBILE_BASE}.css ({len(base)} règles communes, retirées de {len(with_mobile)} feuilles)')
    return sorted(with_mobile)


def write_app_routes(mobile_base=False):
    lines = ['// Généré par scripts/dc2preact.py — ne pas modifier à la main.',
             '// Adresses de l\'app (fixes d\'abord) : titre de l\'onglet, clé des données (convex/boards.ts),',
             '// écran desktop (load) et, s\'il existe, écran mobile (loadMobile).',
             'export const ROUTES = [']
    prefixes = {name: prefix for _, name, prefix, *_ in APP_PAGES + APP_COMPONENTS + APP_MOBILE_PAGES}
    mobile = {route: (name, prefix) for _, name, prefix, route in APP_MOBILE_PAGES}

    def css_of(name, seen=()):  # le CSS de l'écran et celui des composants qu'il importe
        out = [prefixes[name]]
        for c in IMPORTS.get(name, []):
            if c not in seen:
                out += [x for x in css_of(c, seen + (name,)) if x not in out]
        return out
    for _, name, prefix, route, title, data in sorted(APP_PAGES, key=lambda r: ':' in r[3]):
        css = ', '.join(f"import('./styles/{x}.css')" for x in css_of(name))
        load = f"Promise.all([import('./pages/{name}.js'), {css}]).then(([m]) => m)"
        extra = ''
        if route in mobile:
            mname = mobile[route][0]
            mcss = ', '.join(f"import('./styles/{x}.css')" for x in ([MOBILE_BASE] if mobile_base else []) + css_of(mname))
            extra = f", loadMobile: () => Promise.all([import('./pages/{mname}.js'), {mcss}]).then(([m]) => m)"
        lines.append(f"  {{ path: '{route}', title: {json.dumps(title, ensure_ascii=False)}, data: {json.dumps(data)}, load: () => {load}{extra} }},")
    lines.append('];')
    (ROOT / 'src' / 'app' / 'routes.js').write_text('\n'.join(lines) + '\n')
    print('src/app/routes.js')


if __name__ == '__main__':
    for args in PAGES:
        convert(*args)
    for src, name, prefix in APP_COMPONENTS:
        convert(src, name, prefix, 'app')
    for src, name, prefix, *_ in APP_PAGES:
        convert(src, name, prefix, 'app')
    for src, name, prefix, _ in APP_MOBILE_PAGES:
        if (GROUPS['app']['src'] / src).exists():
            convert(src, name, prefix, 'app')
        else:
            print(f'(mobile) app/{src} absent : l\'adresse garde l\'écran desktop')
    APP_MOBILE_PAGES[:] = [m for m in APP_MOBILE_PAGES if (GROUPS['app']['src'] / m[0]).exists()]
    write_app_routes(mobile_base=bool(factor_mobile_css()))
    check_app_pages()
