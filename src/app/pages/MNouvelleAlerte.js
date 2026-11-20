// Généré par scripts/dc2preact.py depuis design/app/MNouvelleAlerte.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class MNouvelleAlerte extends DCLogic {
  // Clavier ouvert (audit Q72) : sur iPhone, il recouvre le bas de la page sans la réduire ; la feuille remonte de ce qu'il
  // cache (visualViewport). Chrome Android réduit la page lui-même (interactive-widget=resizes-content, app.html) : 0 ici.
  componentDidMount() {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    this.onVv = () => { const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)); if (kb !== ((this.state || {}).kb || 0)) this.setState({ kb }); };
    vv.addEventListener('resize', this.onVv);
    vv.addEventListener('scroll', this.onVv);
    this.onVv();
  }
  componentWillUnmount() { const vv = typeof window !== 'undefined' ? window.visualViewport : null; if (vv && this.onVv) { vv.removeEventListener('resize', this.onVv); vv.removeEventListener('scroll', this.onVv); } }
  renderVals() {
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let HITS = (globalThis.__dcSample?.["MNouvelleAlerte"]?.["HITS"] ?? []);
    HITS = HITS.map((x) => Object.assign({}, x, { href: '/app/videos/' + vkey(x.src) }));
    const NICHES = ["Études", "Couple", "Séduction IA", "Jalousie et ex", "Side hustle", "Santé et physique", "Langues", "Foi", "Social et loisirs", "Beauté IA"];
    const close = () => { if (this.props.onClose) this.props.onClose(); };
    const sheet = {
      close,
      keys: (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } },
      tStart: (e) => { this.y0 = e.touches && e.touches[0] ? e.touches[0].clientY : null; },
      tEnd: (e) => { const t = e.changedTouches && e.changedTouches[0]; if (this.y0 !== null && this.y0 !== undefined && t && t.clientY - this.y0 > 60) close(); this.y0 = null; }
    };
    const st = this.state || {};
    const P = this.props || {};
    // Une alerte = { quoi: 'compte'|'video'|'format', niche: nom|null, seuil: nombre, marche: code|null } (comme le desktop) ;
    // rule = l'alerte à modifier, niches = celles du Radar, preview(règle) = ce qu'elle trouve parmi les alertes de la semaine.
    const R0 = P.rule || null;
    const QL = [['compte', 'un compte'], ['video', 'une vidéo d’app'], ['format', 'un format']];
    const SV = { compte: [[10, '10×'], [100, '100×'], [1000, '1 000×']], video: [[5e5, '500 k'], [1e6, '1 M'], [5e6, '5 M']], format: [[3, '3'], [5, '5'], [10, '10']] };
    const DEF = { compte: 100, video: 1e6, format: 3 };
    // Les marchés : les cinq langues du Radar, puis ceux du document « apps » (du plus fourni au moins fourni).
    const MKN = (c) => ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    const AD = this.props && typeof this.props.get === 'function' ? this.props.get('apps') : null;
    const PREP = (n) => { n = String(n || ''); if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return ['aux', 'les ']; if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return ['en', 'l’']; return /e$/.test(n) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize)$/.test(n) ? ['en', 'la '] : ['au', 'le ']; }; // « en France », « au Mexique », « aux États-Unis »
    const MK0 = [['', 'tous les marchés']];
    const MKX = {};
    const MK = MK0.concat(((AD && AD.markets) || []).filter((m) => m[0] && m[0] !== 'XX' && !MK0.some((x) => x[0] === m[0]))
      .map((m) => { const n = m[1] || MKN(m[0]) || m[0]; return [m[0], PREP(n)[1] + n]; }));
    const NS = Array.isArray(P.niches) && P.niches.length ? P.niches.filter((n) => n !== 'Autres') : NICHES;
    const quoi = SV[st.quoi] ? st.quoi : (R0 && SV[R0.quoi] ? R0.quoi : 'compte');
    const sv = SV[quoi];
    const ok = (v) => sv.some((x) => x[0] === v);
    const seuil = ok(st.seuil) ? st.seuil : (R0 && R0.quoi === quoi && ok(R0.seuil) ? R0.seuil : DEF[quoi]);
    const niche = st.niche !== undefined ? st.niche : (R0 ? R0.niche || '' : (P.preview ? '' : 'Études'));
    const marche = st.marche !== undefined ? st.marche : (R0 ? R0.marche || '' : '');
    const rule = { quoi, niche: niche || null, seuil, marche: marche || null };
    const pv = typeof P.preview === 'function' ? P.preview(rule) : undefined;
    const demo = pv === undefined && quoi === 'compte' && niche === 'Études' && seuil === 100 && !marche;
    const hits = pv ? (pv.hits || []) : HITS;
    return {
      kb: ((this.state || {}).kb || 0) + 'px',
      title: R0 ? 'Modifier l’alerte' : 'Nouvelle alerte', cta: R0 ? 'Enregistrer' : 'Créer l’alerte',
      quoi, niche, seuil: String(seuil), marche,
      quois: QL.map((q) => ({ v: q[0], l: q[1] })), niches: [{ v: '', l: 'de n’importe quelle niche' }].concat(NS.map((n) => ({ v: n, l: 'de la niche ' + n }))),
      seuils: sv.map((x) => ({ v: String(x[0]), l: x[1] })), marches: MK.map((x) => ({ v: x[0], l: x[1] })),
      isCompte: quoi === 'compte', isApp: quoi === 'video', isFormat: quoi === 'format',
      setQuoi: (e) => this.setState({ quoi: e.target.value, seuil: undefined }), setNiche: (e) => this.setState({ niche: e.target.value }),
      setSeuil: (e) => this.setState({ seuil: Number(e.target.value) }), setMarche: (e) => this.setState({ marche: e.target.value }),
      showHits: pv ? hits.length > 0 : demo, hits,
      hitsTitle: pv ? 'Cette semaine, elle aurait trouvé ' + pv.text : 'Ce qu’elle aurait trouvé cette semaine', hitsSub: pv ? 'Parmi les alertes repérées par le Radar.' : 'Trois vidéos d’Astra AI, du 07 au 09/11',
      showNone: !!pv && hits.length === 0, noneText: pv ? 'Cette semaine : ' + pv.text.charAt(0).toLowerCase() + pv.text.slice(1) + '.' : '',
      setFirst: (el) => { this.first = el; },
      keys: (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } },
      sheet,
      create: () => { if (P.onCreate) P.onCreate(rule); close(); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: fixed; inset: 0; z-index: 70; color: var(--ink); font-family: var(--font-body);" },
        $h("button", { "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.sheet?.close, "style": "position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); touch-action: none; -webkit-tap-highlight-color: transparent;" }),
        $h("section", { "role": "dialog", "aria-modal": "true", "aria-label": "Nouvelle alerte", "onKeyDown": $v.sheet?.keys, "style": `position: absolute; left: 0; right: 0; bottom: ${$t($v.kb)}; max-height: 88vh; max-height: calc(88dvh - ${$t($v.kb)}); overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; border-radius: 28px 28px 0 0; background: var(--surface-raised); border-top: 1px solid var(--line-strong); box-shadow: 0 -30px 80px rgba(0,0,0,0.55); padding: 0 20px max(20px, env(safe-area-inset-bottom)); animation: sw-rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;` },
          $h("div", { "ontouchstart": $v.sheet?.tStart, "ontouchend": $v.sheet?.tEnd, "style": "display: flex; justify-content: center; padding: 10px 0 6px; touch-action: none;" },
            $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 5px; border-radius: 3px; background: var(--line-strong);" })
          ),
          $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 4px 0 12px;" },
            $h("span", { "style": "font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
              $t($v.title)
            ),
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.sheet?.close, "aria-label": "Fermer", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-right: -8px;" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          ),
          $h("p", { "style": "margin: 0; font-family: var(--font-display); font-size: 22px; line-height: 2; font-weight: 700; letter-spacing: -0.02em; color: var(--ink-soft);" },
            "Montre-moi quand ",
            $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 3px 1px;" },
              $h("select", { "value": $v.quoi, "onChange": $v.setQuoi, "style": "appearance: none; -webkit-appearance: none; height: 44px; max-width: 100%; padding: 0 34px 0 14px; border-radius: 12px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 20px; font-weight: 700; cursor: pointer;" },
                ($l($v.quois)).map((o) => [
                  $h("option", { "value": o?.v },
                    $t(o?.l)
                  )
                ])
              ),
              $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            ($v.isCompte) ? [
              " ",
              $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 3px 1px;" },
                $h("select", { "value": $v.niche, "onChange": $v.setNiche, "style": "appearance: none; -webkit-appearance: none; height: 44px; max-width: 100%; padding: 0 34px 0 14px; border-radius: 12px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 20px; font-weight: 700; cursor: pointer;" },
                  ($l($v.niches)).map((o) => [
                    $h("option", { "value": o?.v },
                      $t(o?.l)
                    )
                  ])
                ),
                $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              " fait ",
              $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 3px 1px;" },
                $h("select", { "value": $v.seuil, "onChange": $v.setSeuil, "style": "appearance: none; -webkit-appearance: none; height: 44px; max-width: 100%; padding: 0 34px 0 14px; border-radius: 12px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 20px; font-weight: 700; cursor: pointer;" },
                  ($l($v.seuils)).map((o) => [
                    $h("option", { "value": o?.v },
                      $t(o?.l)
                    )
                  ])
                ),
                $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              " sa normale,"
            ] : null,
            ($v.isApp) ? [
              " ",
              $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 3px 1px;" },
                $h("select", { "value": $v.niche, "onChange": $v.setNiche, "style": "appearance: none; -webkit-appearance: none; height: 44px; max-width: 100%; padding: 0 34px 0 14px; border-radius: 12px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 20px; font-weight: 700; cursor: pointer;" },
                  ($l($v.niches)).map((o) => [
                    $h("option", { "value": o?.v },
                      $t(o?.l)
                    )
                  ])
                ),
                $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              " passe ",
              $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 3px 1px;" },
                $h("select", { "value": $v.seuil, "onChange": $v.setSeuil, "style": "appearance: none; -webkit-appearance: none; height: 44px; max-width: 100%; padding: 0 34px 0 14px; border-radius: 12px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 20px; font-weight: 700; cursor: pointer;" },
                  ($l($v.seuils)).map((o) => [
                    $h("option", { "value": o?.v },
                      $t(o?.l)
                    )
                  ])
                ),
                $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              " de vues,"
            ] : null,
            ($v.isFormat) ? [
              " ",
              $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 3px 1px;" },
                $h("select", { "value": $v.niche, "onChange": $v.setNiche, "style": "appearance: none; -webkit-appearance: none; height: 44px; max-width: 100%; padding: 0 34px 0 14px; border-radius: 12px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 20px; font-weight: 700; cursor: pointer;" },
                  ($l($v.niches)).map((o) => [
                    $h("option", { "value": o?.v },
                      $t(o?.l)
                    )
                  ])
                ),
                $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              " est repris par ",
              $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 3px 1px;" },
                $h("select", { "value": $v.seuil, "onChange": $v.setSeuil, "style": "appearance: none; -webkit-appearance: none; height: 44px; max-width: 100%; padding: 0 34px 0 14px; border-radius: 12px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 20px; font-weight: 700; cursor: pointer;" },
                  ($l($v.seuils)).map((o) => [
                    $h("option", { "value": o?.v },
                      $t(o?.l)
                    )
                  ])
                ),
                $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              " comptes ou plus,"
            ] : null,
            " sur ",
            $h("span", { "style": "position: relative; display: inline-flex; vertical-align: middle; margin: 3px 1px;" },
              $h("select", { "value": $v.marche, "onChange": $v.setMarche, "style": "appearance: none; -webkit-appearance: none; height: 44px; max-width: 100%; padding: 0 34px 0 14px; border-radius: 12px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 20px; font-weight: 700; cursor: pointer;" },
                ($l($v.marches)).map((o) => [
                  $h("option", { "value": o?.v },
                    $t(o?.l)
                  )
                ])
              ),
              $h("span", { "aria-hidden": "true", "style": "position: absolute; right: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--accent); display: inline-flex;" },
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            "."
          ),
          ($v.showHits) ? [
            $h("div", { "style": "margin-top: 16px; border-radius: 20px; border: 1px solid var(--line); background: var(--surface); padding: 16px; display: flex; flex-direction: column; gap: 12px;" },
              $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                $h("span", { "style": "font-size: 15px; font-weight: 700;" },
                  $t($v.hitsTitle)
                ),
                $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                  $t($v.hitsSub)
                )
              ),
              $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                ($l($v.hits)).map((h) => [
                  $h("a", { "href": h?.href, "aria-label": "Ouvrir la vidéo", "class": "sw-video", "style": "display: block; border-radius: 12px;" },
                    $h("img", { "class": "sw-cover", "src": h?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "style": "position: absolute; left: 6px; right: 6px; bottom: 6px; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: #FFFFFF; text-align: center; white-space: nowrap;" },
                      $t(h?.x)
                    )
                  )
                ])
              )
            )
          ] : null,
          ($v.showNone) ? [
            $h("p", { "style": "margin: 16px 0 0; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
              $t($v.noneText)
            )
          ] : null,
          $h("div", { "style": "display: flex; justify-content: center; padding-top: 18px;" },
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
    ];
  }
}
