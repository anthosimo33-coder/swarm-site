#!/usr/bin/env python3
"""Convertit les maquettes du canevas (design/*.dc.html) en composants Preact.

Chaque fichier .dc.html contient :
  - un <helmet> (polices + CSS de page : keyframes, classes de survol),
  - un gabarit <x-dc> avec des trous {{a.b}}, des boucles <sc-for> et des conditions <sc-if>,
  - une classe `Component extends DCLogic` (état, minuteries, renderVals()).

Le script produit, pour chaque page :
  - src/pages/<Nom>.js : un composant Preact (la classe d'origine + une méthode render()),
  - src/styles/<prefixe>.css : le CSS de la page, keyframes préfixés pour éviter les collisions.

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


def rewrite_links(value, label=None):
    if value in LP_FILES and label in ANCHORS:
        return '/' + ANCHORS[label]
    if value in LINKS:
        return LINKS[value]
    return value


def rewrite_script_links(script):
    files = '|'.join(re.escape(f) for f in LP_FILES)
    for label, anchor in ANCHORS.items():
        lab = re.escape(label)
        script = re.sub(r"\['" + lab + r"', '(?:" + files + r")'\]", f"['{label}', '/{anchor}']", script)
        script = re.sub(r"(t: '" + lab + r"'[^}]*?href: )'(?:" + files + r")'", r"\g<1>'/" + anchor + "'", script)
    for old, new in LINKS.items():
        if old.endswith('.dc.html'):
            script = script.replace(f"'{old}'", f"'{new}'")
    return script


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

    props = []
    for name, val in node.attrs:
        if name.startswith('hint-'):
            continue
        if val is None:
            props.append(f'{json.dumps(name)}: true')
            continue
        if name == 'href':
            val = rewrite_links(val, text_of(node))
        props.append(f'{json.dumps(attr_name(name))}: {value_expr(val, scope)}')
    props_js = '{ ' + ', '.join(props) + ' }' if props else 'null'
    tag = json.dumps(SVG_TAGS.get(node.tag, node.tag))
    if node.tag in VOID or not node.children:
        return f'{pad}h({tag}, {props_js})'
    inner = gen_children(node, scope, ind + 1)
    if not inner.strip():
        return f'{pad}h({tag}, {props_js})'
    return f'{pad}h({tag}, {props_js},\n{inner}\n{pad})'


def gen_children(node, scope, ind):
    parts = [gen(c, scope, ind) for c in node.children]
    return ',\n'.join(p for p in parts if p is not None)


def prefix_keyframes(css, template, script, prefix):
    names = sorted(set(re.findall(r'@keyframes\s+([A-Za-z_][\w-]*)', css)), key=len, reverse=True)
    for n in names:
        new = f'{prefix}-{n}'
        css = re.sub(r'(@keyframes\s+)' + re.escape(n) + r'\b', r'\g<1>' + new, css)
        dur = r'(?=\s+(?:-?[\d.]+m?s\b|\{\{))'  # « nom 3s … » ou « nom {{durée}} … »
        template = re.sub(r'(?<![\w-])' + re.escape(n) + r'\b' + dur, new, template)
        script = re.sub(r'(?<![\w-])' + re.escape(n) + r'\b' + dur, new, script)
        script = re.sub(r"(?<=['\"`])" + re.escape(n) + r"(?=\s)", new, script)
    return css, template, script


# Images : le canevas les sert sous /_blob/<id> ; le site les sert depuis public/media/.
MEDIA = json.loads((ROOT / 'design' / 'media.json').read_text())


def convert(src, name, prefix):
    text = (ROOT / 'design' / src).read_text()
    for blob, local in MEDIA.items():
        text = text.replace(blob, local)
    xdc = text.split('<x-dc>', 1)[1].split('</x-dc>', 1)[0]
    helmet = re.search(r'<helmet>(.*?)</helmet>', xdc, re.S).group(1)
    template = re.sub(r'<helmet>.*?</helmet>', '', xdc, flags=re.S)
    css = '\n'.join(re.findall(r'<style>(.*?)</style>', helmet, re.S)).strip()
    script = re.search(r'<script type="text/x-dc" data-dc-script[^>]*>(.*?)</script>', text, re.S).group(1)

    css, template, script = prefix_keyframes(css, template, script, prefix)
    script = rewrite_script_links(script)

    p = Parser()
    p.feed(template)
    p.close()
    roots = [c for c in p.root.children if not (isinstance(c, str) and not c.strip())]
    body = ',\n'.join(gen(c, set(), 3) for c in roots)

    m = re.search(r'class\s+Component\s+extends\s+DCLogic\s*\{', script)
    start = m.end()
    end = script.rindex('}')
    cls_body = script[start:end].rstrip()

    js = f"""// Généré par scripts/dc2preact.py depuis design/{src} — ne pas modifier à la main.
import {{ h }} from 'preact';
import {{ DCLogic, $t, $l }} from '../runtime.js';

export default class {name} extends DCLogic {{{cls_body}

  render() {{
    const $v = this.renderVals();
    return [
{body}
    ];
  }}
}}
"""
    (ROOT / 'src' / 'pages' / f'{name}.js').write_text(js)
    (ROOT / 'src' / 'styles' / f'{prefix}.css').write_text(
        f'/* Généré par scripts/dc2preact.py depuis design/{src} */\n{css}\n')
    print(f'{src} -> src/pages/{name}.js, src/styles/{prefix}.css')


if __name__ == '__main__':
    for args in PAGES:
        convert(*args)
