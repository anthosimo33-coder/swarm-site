// Généré par scripts/dc2preact.py depuis design/app/NouvelleAlerte.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class NouvelleAlerte extends DCLogic {
  componentDidMount() { if (this.first) this.first.focus(); }
  renderVals() {
    // Exemple du canevas : ce que l'alerte par défaut trouve dans la semaine d'exemple.
    const HITS = [{"src": "/media/app/v-7706010190566542612.jpg", "x": "1 226×"}, {"src": "/media/app/v-7706101547570171143.jpg", "x": "455×"}, {"src": "/media/app/v-7705368869250075925.jpg", "x": "2 333×"}];
    const NICHES = ["Études", "Couple", "Séduction IA", "Jalousie et ex", "Side hustle", "Santé et physique", "Langues", "Foi", "Social et loisirs", "Beauté IA"];
    // Libellé à l'écran -> valeur gardée dans l'alerte (AlertesA l'enregistre dans saved('alertRules')) :
    // { quoi: 'compte'|'video'|'format', niche: nom|null, seuil: nombre, marche: code du marché|null }.
    const QUOI = [['un compte', 'compte'], ['une vidéo d’app', 'video'], ['un format', 'format']];
    const SE = { compte: [['10×', 10], ['100×', 100], ['1 000×', 1000]], video: [['500 k', 5e5], ['1 M', 1e6], ['5 M', 5e6]], format: [['3', 3], ['5', 5], ['10', 10]] };
    const DEF = { compte: 100, video: 1e6, format: 3 };
    const MK = [['sur tous les marchés', null], ['en France', 'FR'], ['chez les anglophones', 'US'], ['en Amérique latine', 'MX'], ['en Espagne', 'ES'], ['au Brésil et au Portugal', 'BR'], ['dans les autres langues', 'XX']];
    const P = this.props || {};
    const r0 = P.rule && P.rule.quoi ? P.rule : null; // alerte à modifier, sinon une nouvelle
    const st = this.state || {};
    const pick = (k, def) => (st[k] !== undefined ? st[k] : r0 && r0[k] !== undefined ? r0[k] : def);
    const lab = (xs, v) => (xs.filter((x) => x[1] === v)[0] || xs[0])[0];
    const val = (xs, l) => (xs.filter((x) => x[0] === l)[0] || xs[0])[1];
    const quoi = SE[pick('quoi', 'compte')] ? pick('quoi', 'compte') : 'compte';
    const s0 = pick('seuil', DEF[quoi]);
    const seuil = SE[quoi].some((x) => x[1] === s0) ? s0 : DEF[quoi];
    const niche = pick('niche', null);
    const marche = pick('marche', null);
    const ANY = 'n’importe quelle niche';
    const names = (P.niches && P.niches.length ? P.niches : NICHES).slice();
    if (niche && names.indexOf(niche) < 0) names.push(niche);
    const NI = [[ANY, null]].concat(names.map((n) => [n, n]));
    const opt = (xs) => xs.map((x) => ({ v: x[0] }));
    const close = () => { if (P.onClose) P.onClose(); };
    const rule = { quoi, niche, seuil, marche };
    // Aperçu : ce que l'alerte trouve dans les alertes de la semaine (fourni par AlertesA ; null tant qu'il ne sait pas).
    const pv = typeof P.preview === 'function' ? P.preview(rule) : undefined;
    const sample = pv === undefined && quoi === 'compte' && seuil === 100 && !marche && (!niche || niche === 'Études');
    return {
      head: r0 ? 'Modifier l’alerte' : 'Nouvelle alerte', cta: r0 ? 'Enregistrer' : 'Créer l’alerte',
      quoi: lab(QUOI, quoi), niche: lab(NI, niche), seuil: lab(SE[quoi], seuil), marche: lab(MK, marche),
      deNiche: niche ? 'de la niche' : 'de',
      quois: opt(QUOI), niches: opt(NI), seuils: opt(SE[quoi]), marches: opt(MK),
      isCompte: quoi === 'compte', isApp: quoi === 'video', isFormat: quoi === 'format',
      setQuoi: (e) => { const q = val(QUOI, e.target.value); this.setState({ quoi: q, seuil: DEF[q] }); },
      setNiche: (e) => this.setState({ niche: val(NI, e.target.value) }),
      setSeuil: (e) => this.setState({ seuil: val(SE[quoi], e.target.value) }),
      setMarche: (e) => this.setState({ marche: val(MK, e.target.value) }),
      showHits: pv ? true : sample, hits: pv ? pv.hits : HITS, hitsText: pv ? pv.text : 'Trois vidéos d’Astra AI, entre le 07 et le 09/11',
      setFirst: (el) => { this.first = el; },
      keys: (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } },
      close,
      create: () => {
        if (P.onCreate) P.onCreate(rule);
        close();
      }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: absolute; inset: 0; color: var(--ink); font-family: var(--font-body);" },
        $h("button", { "type": "button", "aria-label": "Fermer", "onClick": $v.close, "style": "position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);" }),
        $h("div", { "style": "position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; padding: 24px; box-sizing: border-box; pointer-events: none;" },
          $h("section", { "role": "dialog", "aria-modal": "true", "aria-label": $v.head, "onKeyDown": $v.keys, "style": "pointer-events: auto; width: 100%; max-width: 860px; box-sizing: border-box; border-radius: 30px; background: var(--surface-raised); border: 1px solid var(--line); box-shadow: var(--shadow-float); padding: 36px 44px; display: flex; flex-direction: column; gap: 24px; animation: sw-rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between;" },
              $h("span", { "class": "sw-eyebrow", "style": "font-size: 13px;" },
                $h("b", null,
                  "["
                ),
                " ", $t($v.head), " ",
                $h("b", null,
                  "]"
                )
              ),
              $h("button", { "ref": $v.setFirst, "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Fermer", "onClick": $v.close },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("p", { "style": "margin: 0; font-family: var(--font-display); font-size: 32px; line-height: 1.8; font-weight: 700; letter-spacing: -0.035em; color: var(--ink-soft);" },
              "Montre-moi quand ",
              $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 4px 2px;" },
                $h("select", { "value": $v.quoi, "onChange": $v.setQuoi, "style": "appearance: none; -webkit-appearance: none; height: 46px; padding: 0 38px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; cursor: pointer;" },
                  ($l($v.quois)).map((o) => [
                    $h("option", { "value": o?.v },
                      $t(o?.v)
                    )
                  ])
                ),
                $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              ($v.isCompte) ? [
                " ", $t($v.deNiche), " ",
                $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 4px 2px;" },
                  $h("select", { "value": $v.niche, "onChange": $v.setNiche, "style": "appearance: none; -webkit-appearance: none; height: 46px; padding: 0 38px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; cursor: pointer;" },
                    ($l($v.niches)).map((o) => [
                      $h("option", { "value": o?.v },
                        $t(o?.v)
                      )
                    ])
                  ),
                  $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                " fait ",
                $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 4px 2px;" },
                  $h("select", { "value": $v.seuil, "onChange": $v.setSeuil, "style": "appearance: none; -webkit-appearance: none; height: 46px; padding: 0 38px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; cursor: pointer;" },
                    ($l($v.seuils)).map((o) => [
                      $h("option", { "value": o?.v },
                        $t(o?.v)
                      )
                    ])
                  ),
                  $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                " sa normale,"
              ] : null,
              ($v.isApp) ? [
                " ", $t($v.deNiche), " ",
                $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 4px 2px;" },
                  $h("select", { "value": $v.niche, "onChange": $v.setNiche, "style": "appearance: none; -webkit-appearance: none; height: 46px; padding: 0 38px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; cursor: pointer;" },
                    ($l($v.niches)).map((o) => [
                      $h("option", { "value": o?.v },
                        $t(o?.v)
                      )
                    ])
                  ),
                  $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                " passe ",
                $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 4px 2px;" },
                  $h("select", { "value": $v.seuil, "onChange": $v.setSeuil, "style": "appearance: none; -webkit-appearance: none; height: 46px; padding: 0 38px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; cursor: pointer;" },
                    ($l($v.seuils)).map((o) => [
                      $h("option", { "value": o?.v },
                        $t(o?.v)
                      )
                    ])
                  ),
                  $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                " de vues,"
              ] : null,
              ($v.isFormat) ? [
                " ", $t($v.deNiche), " ",
                $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 4px 2px;" },
                  $h("select", { "value": $v.niche, "onChange": $v.setNiche, "style": "appearance: none; -webkit-appearance: none; height: 46px; padding: 0 38px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; cursor: pointer;" },
                    ($l($v.niches)).map((o) => [
                      $h("option", { "value": o?.v },
                        $t(o?.v)
                      )
                    ])
                  ),
                  $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                " est repris par ",
                $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 4px 2px;" },
                  $h("select", { "value": $v.seuil, "onChange": $v.setSeuil, "style": "appearance: none; -webkit-appearance: none; height: 46px; padding: 0 38px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; cursor: pointer;" },
                    ($l($v.seuils)).map((o) => [
                      $h("option", { "value": o?.v },
                        $t(o?.v)
                      )
                    ])
                  ),
                  $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                " comptes ou plus,"
              ] : null,
              $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 4px 2px;" },
                $h("select", { "value": $v.marche, "onChange": $v.setMarche, "style": "appearance: none; -webkit-appearance: none; height: 46px; padding: 0 38px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; cursor: pointer;" },
                  ($l($v.marches)).map((o) => [
                    $h("option", { "value": o?.v },
                      $t(o?.v)
                    )
                  ])
                ),
                $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              "."
            ),
            ($v.showHits) ? [
              $h("div", { "style": "border-radius: 22px; border: 1px solid var(--line); background: var(--surface); padding: 18px 20px; display: flex; align-items: center; gap: 20px;" },
                $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 4px;" },
                  $h("span", { "style": "font-size: 14px; font-weight: 700;" },
                    "Dans les alertes de la semaine"
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                    $t($v.hitsText)
                  )
                ),
                ($l($v.hits)).map((h) => [
                  $h("span", { "class": "sw-video", "style": "display: block; width: 58px; border-radius: 10px;" },
                    $h("img", { "class": "sw-cover", "src": h?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "style": "position: absolute; left: 5px; right: 5px; bottom: 5px; font-size: 10px; font-weight: 800; color: #FFFFFF; text-align: center;" },
                      $t(h?.x)
                    )
                  )
                ])
              )
            ] : null,
            $h("div", { "style": "display: flex; justify-content: flex-end;" },
              $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.create },
                $t($v.cta),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          )
        )
      )
    ];
  }
}
