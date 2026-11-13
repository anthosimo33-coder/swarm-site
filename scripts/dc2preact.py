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

Usage : python3 scripts/dc2preact.py   (ou npm run gen)
"""
from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    # fichier source, nom du composant, préfixe CSS
    ('LP.dc.html', 'LP', 'lp'),
    ('LPMobile.dc.html', 'LPMobile', 'lpm'),
    ('Tarifs.dc.html', 'Tarifs', 'tf'),
    ('TarifsMobile.dc.html', 'TarifsMobile', 'tfm'),
    ('Connexion.dc.html', 'Connexion', 'cx'),
    ('Inscription.dc.html', 'Inscription', 'ins'),
]
# Liens entre artboards du canevas -> routes du site
LINKS = {
    'LP.dc.html': '/',
    'LPMobile.dc.html': '/',
    'Tarifs.dc.html': '/tarifs',
    'TarifsMobile.dc.html': '/tarifs',
    'Connexion.dc.html': '/connexion',
    'Inscription.dc.html': '/inscription',
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
    ('CompteA.dc.html', 'Compte', 'a-cpt', '/app/compte', 'Compte', None),
]
# Lien sans paramètre vers une fiche (maquette pas encore branchée) : l'exemple de la maquette.
APP_SAMPLE = {'/app/apps/:slug': 'astraai', '/app/videos/:id': '7705929733220994337',
              '/app/formats/:id': None, '/app/createurs/:handle': 'zinedine.gsbb'}

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
    ('MCompte.dc.html', 'MCompte', 'm-cpt', '/app/compte'),
]

# SWARM_SANS_MOBILE=1 : génère sans les écrans mobiles (téléphones servis par le desktop), le temps
# qu'ils soient branchés ; on ne commite alors ni design/app/M* ni leurs pages.
if __import__('os').environ.get('SWARM_SANS_MOBILE'):
    APP_MOBILE_PAGES = []

# Composants partagés, importés par <dc-import name="…"> (pas des routes) : fichier, composant, préfixe CSS.
APP_COMPONENTS = [
    ('Palette.dc.html', 'Palette', 'a-pal'),
    ('AjoutDossier.dc.html', 'AjoutDossier', 'a-ajd'),
    ('NouvelleAlerte.dc.html', 'NouvelleAlerte', 'a-nal'),
    # Mobile : feuilles qui montent du bas (recherche, ajout à un dossier, nouvelle alerte).
    ('MPalette.dc.html', 'MPalette', 'm-pal'),
    ('MAjout.dc.html', 'MAjout', 'm-ajd'),
    ('MNouvelleAlerte.dc.html', 'MNouvelleAlerte', 'm-nal'),
]
if not APP_MOBILE_PAGES:
    APP_COMPONENTS = [c for c in APP_COMPONENTS if not c[0].startswith('M')]
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
APP_LINKS.update({
    # Écrans d'interaction mobiles : s'il en reste un lien, il mène à l'écran hôte.
    'MFiltres.dc.html': '/app/apps', 'MApercu.dc.html': '/app/apps/astraai', 'MCreerAlerte.dc.html': '/app/alertes',
    'MRecherche.dc.html': '/app', 'MAbonnement.dc.html': '/app/compte', 'MConnexion.dc.html': '/app/deconnexion',

    'FormatsA.dc.html': '/app/formats',        # ancien écran Formats (restes de données), remplacé par FormatsB
    'ConnexionA.dc.html': '/app/deconnexion',  # « Se déconnecter » du compte : le routeur déconnecte puis renvoie à l'accueil du site
})

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
HOLE = re.compile(r'\{\{\s*([A-Za-z_$][\w$]*(?:\.[\w$]+)*)\s*\}\}')


class Node:
    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = attrs or []
        self.children = []


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
          'onmouseenter': 'onMouseEnter', 'onmouseleave': 'onMouseLeave', 'onkeydown': 'onKeyDown'}


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
        if val is None:
            props.append(f'{json.dumps(name)}: true')
            continue
        if name == 'href':
            val = rewrite_links(val, text_of(node), CURRENT['links'])
        props.append(f'{json.dumps(attr_name(name))}: {value_expr(val, scope)}')
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


def prefix_keyframes(css, template, script, prefix):
    names = sorted(set(re.findall(r'@keyframes\s+([A-Za-z_][\w-]*)', css)), key=len, reverse=True)
    for n in names:
        new = f'{prefix}-{n}'
        css = re.sub(r'(@keyframes\s+)' + re.escape(n) + r'\b', r'\g<1>' + new, css)
        dur = r'(?=\s+(?:-?[\d.]+m?s\b|\{\{))'  # « nom 3s … » ou « nom {{durée}} … »
        css = re.sub(r'(?<![\w-])' + re.escape(n) + r'\b' + dur, new, css)  # « animation: nom 1s » dans la feuille elle-même
        template = re.sub(r'(?<![\w-])' + re.escape(n) + r'\b' + dur, new, template)
        script = re.sub(r'(?<![\w-])' + re.escape(n) + r'\b' + dur, new, script)
        script = re.sub(r"(?<=['\"`])" + re.escape(n) + r"(?=\s)", new, script)
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


def convert(src, name, prefix, group='site'):
    g = GROUPS[group]
    CURRENT['links'] = g['links']
    CURRENT['imports'] = set()
    text = (g['src'] / src).read_text()
    for blob, local in MEDIA.items():
        text = text.replace(blob, local)
    xdc = text.split('<x-dc>', 1)[1].split('</x-dc>', 1)[0]
    helmet = re.search(r'<helmet>(.*?)</helmet>', xdc, re.S).group(1)
    template = re.sub(r'<helmet>.*?</helmet>', '', xdc, flags=re.S)
    css = '\n'.join(re.findall(r'<style>(.*?)</style>', helmet, re.S)).strip()
    script = re.search(r'<script type="text/x-dc" data-dc-script[^>]*>(.*?)</script>', text, re.S).group(1)

    css, template, script = prefix_keyframes(css, template, script, prefix)
    script = rewrite_script_links(script, g['links'])

    p = Parser()
    p.feed(template)
    p.close()
    roots = [c for c in p.root.children if not (isinstance(c, str) and not c.strip())]
    body = ',\n'.join(gen(c, set(), 3) for c in roots)

    m = re.search(r'class\s+Component\s+extends\s+DCLogic\s*\{', script)
    start = m.end()
    end = script.rindex('}')
    cls_body = script[start:end].rstrip()

    rel = src if group == 'site' else f'app/{src}'
    css_import = f"import '../styles/{prefix}.css';\n" if g['css_import'] else ''
    css_import += ''.join(f"import {c} from './{c}.js';\n" for c in sorted(CURRENT['imports']))
    IMPORTS[name] = sorted(CURRENT['imports'])
    js = f"""// Généré par scripts/dc2preact.py depuis design/{rel} — ne pas modifier à la main.
import {{ h as $h }} from 'preact';  // $h : jamais masqué par une variable de boucle
import {{ DCLogic, $t, $l }} from '{g['runtime']}';
{css_import}
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


def write_app_routes():
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
            mcss = ', '.join(f"import('./styles/{x}.css')" for x in css_of(mname))
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
    write_app_routes()
