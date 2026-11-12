// Généré par scripts/dc2preact.py depuis design/app/NouvelleAlerte.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class NouvelleAlerte extends DCLogic {
  componentDidMount() { if (this.first) this.first.focus(); }
  renderVals() {
    const HITS = [{"src": "/media/app/v-7706010190566542612.jpg", "x": "1 226×"}, {"src": "/media/app/v-7706101547570171143.jpg", "x": "455×"}, {"src": "/media/app/v-7705368869250075925.jpg", "x": "2 333×"}];
    const NICHES = ["Études", "Couple", "Séduction IA", "Jalousie et ex", "Side hustle", "Santé et physique", "Langues", "Foi", "Social et loisirs", "Beauté IA"];
    const st = this.state || {};
    const quoi = st.quoi || 'un compte';
    const SE = { 'un compte': ['10×', '100×', '1 000×'], 'une vidéo d’app': ['500 k', '1 M', '5 M'], 'un format': ['3', '5', '10'] };
    const DEF = { 'un compte': '100×', 'une vidéo d’app': '1 M', 'un format': '3' };
    const seuil = SE[quoi].indexOf(st.seuil) >= 0 ? st.seuil : DEF[quoi];
    const niche = st.niche || 'Études';
    const marche = st.marche || 'tous les marchés';
    const mail = st.mail === undefined ? true : st.mail;
    const notif = st.notif === undefined ? true : st.notif;
    const opt = (xs) => xs.map((v) => ({ v }));
    const close = () => { if (this.props.onClose) this.props.onClose(); };
    const T = { 'un compte': 'Un compte fait ' + seuil + ' sa normale', 'une vidéo d’app': 'Une vidéo d’app passe ' + seuil + ' de vues', 'un format': 'Un format repris par ' + seuil + ' comptes ou plus' };
    return {
      quoi, niche, seuil, marche, hits: HITS,
      quois: opt(['un compte', 'une vidéo d’app', 'un format']), niches: opt(NICHES), seuils: opt(SE[quoi]), marches: opt(['tous les marchés', 'la France', 'les États-Unis', 'le Mexique', 'le Brésil', 'l’Espagne', 'l’Indonésie']),
      isCompte: quoi === 'un compte', isApp: quoi === 'une vidéo d’app', isFormat: quoi === 'un format',
      setQuoi: (e) => this.setState({ quoi: e.target.value }), setNiche: (e) => this.setState({ niche: e.target.value }),
      setSeuil: (e) => this.setState({ seuil: e.target.value }), setMarche: (e) => this.setState({ marche: e.target.value }),
      mailOn: mail ? 'true' : 'false', notifOn: notif ? 'true' : 'false',
      toggleMail: () => this.setState({ mail: !mail }), toggleNotif: () => this.setState({ notif: !notif }),
      showHits: quoi === 'un compte' && niche === 'Études' && seuil === '100×' && marche === 'tous les marchés',
      setFirst: (el) => { this.first = el; },
      keys: (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } },
      close,
      create: () => {
        if (this.props.onCreate) this.props.onCreate({ t: T[quoi], s: niche + ' · ' + marche + ' · ' + [mail ? 'e-mail' : '', notif ? 'notification' : ''].filter(Boolean).join(' et ') });
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
          $h("section", { "role": "dialog", "aria-modal": "true", "aria-label": "Nouvelle alerte", "onKeyDown": $v.keys, "style": "pointer-events: auto; width: 100%; max-width: 860px; box-sizing: border-box; border-radius: 30px; background: var(--surface-raised); border: 1px solid var(--line); box-shadow: var(--shadow-float); padding: 36px 44px; display: flex; flex-direction: column; gap: 24px; animation: sw-rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between;" },
              $h("span", { "class": "sw-eyebrow", "style": "font-size: 13px;" },
                $h("b", null,
                  "["
                ),
                " Nouvelle alerte ",
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
              "Préviens-moi quand ",
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
                " de la niche ",
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
                " de la niche ",
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
                " de la niche ",
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
              "\n sur ",
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
            $h("p", { "style": "margin: -10px 0 0; font-size: 17px; line-height: 2; color: var(--ink-muted);" },
              "Par ",
              $h("button", { "type": "button", "aria-pressed": $v.mailOn, "onClick": $v.toggleMail, "class": "sw-pill", "style": "height: 34px; vertical-align: middle;" },
                "e-mail"
              ),
              " et ",
              $h("button", { "type": "button", "aria-pressed": $v.notifOn, "onClick": $v.toggleNotif, "class": "sw-pill", "style": "height: 34px; vertical-align: middle;" },
                "notification"
              ),
              ", au plus une fois par jour."
            ),
            ($v.showHits) ? [
              $h("div", { "style": "border-radius: 22px; border: 1px solid var(--line); background: var(--surface); padding: 18px 20px; display: flex; align-items: center; gap: 20px;" },
                $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 4px;" },
                  $h("span", { "style": "font-size: 14px; font-weight: 700;" },
                    "Ce qu’elle t’aurait signalé cette semaine"
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                    "Trois vidéos d’Astra AI, entre le 07 et le 09/11"
                  )
                ),
                ($l($v.hits)).map((h) => [
                  $h("span", { "class": "sw-video", "style": "display: block; width: 58px; border-radius: 10px;" },
                    $h("img", { "class": "sw-cover", "src": h?.src, "alt": "" }),
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
                "Créer l’alerte",
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
