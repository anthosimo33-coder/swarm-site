// Généré par scripts/dc2preact.py depuis design/Compte.dc.html — ne pas modifier à la main.
import { h } from 'preact';
import { DCLogic, $t, $l } from '../runtime.js';

export default class Compte extends DCLogic {
  renderVals() {
    // Sur le site, src/auth.js passe `account` (la personne connectée). Sur le
    // canevas, il n'y a pas de backend : adresse d'exemple, et la déconnexion ramène à la LP.
    const account = this.props && this.props.account;
    const st = this.state || {};
    return {
      email: account ? account.email : 'toi@exemple.fr',
      leaving: !!st.leaving,
      signOut: () => {
        if (!account) { window.location.href = '/'; return; }
        this.setState({ leaving: true });
        account.signOut();
      }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      h("div", { "class": "sw sw-ground acct-root", "style": "position: relative; isolation: isolate; min-height: 100vh; min-height: 100dvh; box-sizing: border-box; padding: clamp(16px, 3vh, 32px) 24px; display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 2.4vh, 24px); color: var(--ink); font-family: var(--font-body);" },
        h("div", { "aria-hidden": "true", "class": "acct-bg", "style": "position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: linear-gradient(180deg, #0A1A35 0%, #071329 46%, #05070C 100%);" },
          h("div", { "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(95% 60% at 75% 8%, #000, transparent); mask-image: radial-gradient(95% 60% at 75% 8%, #000, transparent);" }),
          h("div", { "style": "position: absolute; right: -170px; top: -190px; width: 540px; height: 540px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.40), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
          h("div", { "style": "position: absolute; left: -220px; bottom: -240px; width: 560px; height: 560px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.18), transparent);" })
        ),
        h("a", { "class": "sw-logo", "href": "/", "aria-label": "Swarm, page d'accueil", "style": "flex-shrink: 0;" },
          h("svg", { "class": "sw-logo-mark on-dark", "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 28px; height: 28px;" },
            h("circle", { "class": "d-a", "cx": "5", "cy": "8", "r": "2.3" }),
            h("circle", { "class": "d-a", "cx": "11", "cy": "5", "r": "2.3" }),
            h("circle", { "class": "d-a", "cx": "17", "cy": "8", "r": "2.3" }),
            h("circle", { "class": "d-b", "cx": "8", "cy": "14", "r": "2.3" }),
            h("circle", { "class": "d-b", "cx": "14", "cy": "13", "r": "2.3" }),
            h("circle", { "class": "d-b", "cx": "19", "cy": "17", "r": "2.3" }),
            h("circle", { "class": "d-b", "cx": "11", "cy": "20", "r": "2.3" })
          ),
          h("span", { "class": "sw-wordmark", "style": "font-size: 24px;" },
            "swarm"
          )
        ),
        h("main", { "style": "flex: 1 1 auto; width: 100%; display: flex; align-items: center; justify-content: center;" },
          h("section", { "class": "acct-card sw-enter", "aria-labelledby": "t-compte", "style": "width: 100%; max-width: 440px; box-sizing: border-box; padding: 32px; border-radius: 24px; background: var(--surface-raised); border: 1px solid var(--line); box-shadow: var(--shadow-float); display: flex; flex-direction: column; gap: 20px;" },
            h("h1", { "id": "t-compte", "style": "margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
              "Ton compte"
            ),
            h("dl", { "style": "margin: 0; border-bottom: 1px solid var(--line);" },
              h("div", { "class": "acct-row" },
                h("dt", null,
                  "E-mail"
                ),
                h("dd", null,
                  $t($v.email)
                )
              ),
              h("div", { "class": "acct-row" },
                h("dt", null,
                  "Abonnement"
                ),
                h("dd", null,
                  "Aucun pour l’instant"
                )
              )
            ),
            h("a", { "class": "cta", "href": "/tarifs", "style": "align-self: center; display: inline-flex; text-decoration: none; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; margin: 2px 0 0; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
              "Passer Pro",
              h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                  h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            h("button", { "type": "button", "class": "acct-out sw-link-quiet", "onClick": $v.signOut, "disabled": $v.leaving, "style": "align-self: center;" },
              "Se déconnecter"
            )
          )
        )
      )
    ];
  }
}
