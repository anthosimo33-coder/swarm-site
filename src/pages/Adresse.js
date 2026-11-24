// Généré par scripts/dc2preact.py depuis design/Adresse.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../runtime.js';

export default class Adresse extends DCLogic {
  renderVals() {
    const S0 = (this.props && this.props.stats) || { apps: 190, accounts: 4900 };
    const rs = { apps: S0.apps.toLocaleString('fr-FR'), accounts: S0.accounts.toLocaleString('fr-FR') };

    const ic = {
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      marche: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
      tendance: 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6',
      radar: 'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6',
      alertes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0'
    };
    const tiles = [
      ['apps', '+' + rs.apps, 'apps suivies'],
      ['createurs', '+' + rs.accounts, 'comptes passés au crible'],
      ['tendance', '7,5 M vues', 'Luv or Pop, repérée à H+26'],
      ['radar', '2 333×', 'une vidéo d’Astra AI face à sa normale'],
      ['marche', 'Tous', 'les marchés, toutes les langues'],
      ['alertes', '+69 comptes', 'dans le réseau de Love8']
    ].map((t, i) => ({ d: ic[t[0]], v: t[1], l: t[2], cls: i >= 4 ? 'auth-x1' : '', delay: (0.15 + i * 0.08).toFixed(2) + 's' }));
    const st = this.state || {};
    const props = this.props || {};
    const api = props.adresse;
    // Sur le canevas, sans backend : un exemple, et la confirmation réussit.
    const sample = { from: 'anthony@exemple.fr', to: 'anthony.pro@exemple.fr' };
    const step = st.step || (api ? 'loading' : 'confirm');
    const taken = st.reason === 'email_pris';
    return {
      tiles,
      busy: !!st.busy,
      isLoading: step === 'loading', isConfirm: step === 'confirm', isDone: step === 'done', isExpired: step === 'expired',
      from: st.from || (api ? '' : sample.from),
      to: st.to || (api ? '' : sample.to),
      error: st.error || '', hasError: !!st.error,
      expiredTitle: taken ? 'Cette adresse est déjà prise' : 'Ce lien ne marche plus',
      expiredText: taken
        ? 'Un autre compte Kopycat l’utilise depuis ta demande. Ton adresse n’a pas changé : choisis-en une autre depuis Réglages › Profil.'
        : 'Il a déjà servi, ou il a plus de 24 heures. Si ton adresse n’a pas changé, refais la demande depuis Réglages › Profil.',
      confirm: async (e) => {
        e.preventDefault();
        if (st.busy) return;
        if (!api) { this.setState({ step: 'done' }); return; }
        this.setState({ busy: true, error: '' });
        try {
          const r = await api.confirm(props.token || '');
          if (r && r.ok) this.setState({ busy: false, step: 'done', to: r.email });
          else this.setState({ busy: false, step: 'expired', reason: (r && r.reason) || 'expire' });
        } catch (err) {
          this.setState({ busy: false, error: 'Ça n’a pas marché. Réessaie dans un instant.' });
        }
      }
    };
  }

  async componentDidMount() {
    const api = this.props && this.props.adresse;
    if (!api) return;
    // Avant le clic : les deux adresses, ou le lien expiré. Rien ne change encore (un antivirus qui ouvre le lien ne
    // confirme rien).
    try {
      const r = this.props.token ? await api.peek(this.props.token) : null;
      if (r && r.ok) this.setState({ step: 'confirm', from: r.from, to: r.to });
      else this.setState({ step: 'expired', reason: 'expire' });
    } catch (err) {
      this.setState({ step: 'expired', reason: 'expire' });
    }
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw sw-ground auth-root", "style": "position: relative; isolation: isolate; height: 100vh; height: 100dvh; overflow: hidden; box-sizing: border-box; padding: clamp(16px, 3vh, 32px) 24px; display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 2.4vh, 24px); color: var(--ink); font-family: var(--font-body);" },
        $h("div", { "aria-hidden": "true", "class": "auth-bg", "style": "position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: linear-gradient(180deg, #0A1A35 0%, #071329 46%, #05070C 100%);" },
          $h("div", { "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(95% 60% at 75% 8%, #000, transparent); mask-image: radial-gradient(95% 60% at 75% 8%, #000, transparent);" }),
          $h("div", { "style": "position: absolute; right: -170px; top: -190px; width: 540px; height: 540px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.40), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
          $h("div", { "style": "position: absolute; left: -220px; bottom: -240px; width: 560px; height: 560px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.18), transparent);" })
        ),
        $h("a", { "class": "sw-logo", "href": "/", "aria-label": "Kopycat, page d'accueil", "style": "flex-shrink: 0;" },
          $h("svg", { "class": "sw-logo-mark on-dark", "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 28px; height: 28px;" },
            $h("circle", { "class": "d-a", "cx": "5", "cy": "8", "r": "2.3" }),
            $h("circle", { "class": "d-a", "cx": "11", "cy": "5", "r": "2.3" }),
            $h("circle", { "class": "d-a", "cx": "17", "cy": "8", "r": "2.3" }),
            $h("circle", { "class": "d-b", "cx": "8", "cy": "14", "r": "2.3" }),
            $h("circle", { "class": "d-b", "cx": "14", "cy": "13", "r": "2.3" }),
            $h("circle", { "class": "d-b", "cx": "19", "cy": "17", "r": "2.3" }),
            $h("circle", { "class": "d-b", "cx": "11", "cy": "20", "r": "2.3" })
          ),
          $h("span", { "class": "sw-wordmark", "style": "font-size: 24px;" },
            "kopycat"
          )
        ),
        $h("div", { "class": "auth-card", "style": "flex: 1 1 auto; min-height: 0; width: 100%; max-width: 1240px; box-sizing: border-box; padding: 16px; border-radius: 32px; background: var(--surface-raised); border: 1px solid var(--line); box-shadow: var(--shadow-float); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px;" },
          $h("section", { "class": "auth-form", "style": "min-height: 0; display: flex; align-items: flex-start; justify-content: center; padding: clamp(16px, 4vh, 48px) 40px;" },
            ($v.isLoading) ? [
              $h("p", { "class": "pw-lead", "role": "status", "style": "margin: auto 0; text-align: center;" },
                "Un instant…"
              )
            ] : null,
            ($v.isConfirm) ? [
              $h("form", { "onSubmit": $v.confirm, "aria-labelledby": "t-adr1", "style": "width: 100%; max-width: 400px; margin: auto 0; display: flex; flex-direction: column; gap: clamp(12px, 2.1vh, 20px);" },
                $h("span", { "class": "pw-ic", "aria-hidden": "true" },
                  $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24" },
                    $h("rect", { "x": "3", "y": "5", "width": "18", "height": "14", "rx": "3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8" }),
                    $h("path", { "d": "M4 7l8 6 8-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("h1", { "id": "t-adr1", "style": "margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
                  "Confirme ta nouvelle adresse"
                ),
                $h("p", { "class": "pw-lead" },
                  "Ton compte Kopycat passera de ", $t($v.from), " à ",
                  $h("b", null,
                    $t($v.to)
                  ),
                  "."
                ),
                ($v.hasError) ? [
                  $h("p", { "class": "auth-error", "role": "alert" },
                    $t($v.error)
                  )
                ] : null,
                $h("button", { "type": "submit", "class": "cta", "disabled": $v.busy, "aria-busy": $v.busy, "style": "align-self: center; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; margin: 2px 0 0; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                  "Confirmer cette adresse",
                  $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                $h("p", { "class": "pw-foot" },
                  "Tu te connecteras ensuite avec la nouvelle adresse."
                )
              )
            ] : null,
            ($v.isDone) ? [
              $h("div", { "aria-labelledby": "t-adr2", "style": "width: 100%; max-width: 400px; margin: auto 0; display: flex; flex-direction: column; gap: clamp(12px, 2.1vh, 20px);" },
                $h("span", { "class": "pw-ic", "aria-hidden": "true" },
                  $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24" },
                    $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("h1", { "id": "t-adr2", "style": "margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
                  "Adresse confirmée"
                ),
                $h("p", { "class": "pw-lead" },
                  "Tu te connectes maintenant avec ",
                  $h("b", null,
                    $t($v.to)
                  ),
                  ". Un e-mail prévient ton ancienne adresse."
                ),
                $h("a", { "class": "cta", "href": "/app", "style": "align-self: center; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; margin: 2px 0 0; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                  "Ouvrir Kopycat",
                  $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            ] : null,
            ($v.isExpired) ? [
              $h("div", { "aria-labelledby": "t-adr3", "style": "width: 100%; max-width: 400px; margin: auto 0; display: flex; flex-direction: column; gap: clamp(12px, 2.1vh, 20px);" },
                $h("span", { "class": "pw-ic is-warn", "aria-hidden": "true" },
                  $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24" },
                    $h("circle", { "cx": "12", "cy": "12", "r": "8.5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8" }),
                    $h("path", { "d": "M12 7.5V12l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("h1", { "id": "t-adr3", "style": "margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
                  $t($v.expiredTitle)
                ),
                $h("p", { "class": "pw-lead" },
                  $t($v.expiredText)
                ),
                $h("a", { "class": "cta", "href": "/app/compte", "style": "align-self: center; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; margin: 2px 0 0; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                  "Ouvrir Réglages",
                  $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            ] : null
          ),
          $h("section", { "class": "auth-side", "aria-label": "Ce que suit Kopycat", "style": "position: relative; min-height: 0; overflow: hidden; border-radius: 24px; background: var(--ground); border: 1px solid var(--line); padding: clamp(24px, 5vh, 56px) clamp(28px, 4vw, 56px); display: flex; flex-direction: column; justify-content: center; gap: clamp(16px, 3.4vh, 36px);" },
            $h("div", { "aria-hidden": "true", "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(80% 70% at 70% 20%, #000, transparent); mask-image: radial-gradient(80% 70% at 70% 20%, #000, transparent);" }),
            $h("div", { "aria-hidden": "true", "style": "position: absolute; right: -180px; top: -200px; width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.30), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
            $h("h2", { "class": "sw-enter", "style": "position: relative; margin: 0; max-width: 560px; font-family: var(--font-display); font-size: clamp(34px, 5.4vh, 54px); line-height: 1.04; font-weight: 700; letter-spacing: -0.05em; color: var(--ink);" },
              "Bon retour. ",
              $h("span", { "style": "color: var(--accent);" },
                "Tout est comme tu l'as laissé."
              )
            ),
            $h("div", { "style": "position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;" },
              ($l($v.tiles)).map((t) => [
                $h("div", { "class": `sw-card sw-enter ${$t(t?.cls)}`, "style": `padding: clamp(12px, 1.9vh, 20px) clamp(14px, 1.6vw, 22px); border-radius: 18px; display: flex; flex-direction: column; gap: clamp(8px, 1.3vh, 14px); animation-delay: ${$t(t?.delay)};` },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent);" },
                    $h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                    $h("span", { "class": "sw-stat", "style": "font-size: clamp(20px, 3.1vh, 28px);" },
                      $t(t?.v)
                    ),
                    $h("span", { "style": "font-size: 14px; line-height: 1.4; color: var(--ink-muted);" },
                      $t(t?.l)
                    )
                  )
                )
              ])
            ),
            $h("span", { "class": "sw-calc auth-x2", "style": "position: relative;" },
              "Exemples relevés par le Radar."
            )
          )
        )
      )
    ];
  }
}
