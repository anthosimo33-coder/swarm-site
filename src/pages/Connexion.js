// Généré par scripts/dc2preact.py depuis design/Connexion.dc.html — ne pas modifier à la main.
import { h } from 'preact';
import { DCLogic, $t, $l } from '../runtime.js';

export default class Connexion extends DCLogic {
  renderVals() {
    const ic = {
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      marche: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
      tendance: 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6',
      radar: 'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6',
      alertes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0'
    };
    const tiles = [
      ['apps', '+1 000', 'apps suivies'],
      ['createurs', '+100 000', 'comptes passés au crible chaque jour'],
      ['marche', 'Tous', 'les marchés, toutes les langues'],
      ['tendance', '7,5 M vues', 'Luv or Pop, repérée à H+26'],
      ['radar', '2 333×', 'une vidéo d’Astra AI face à sa normale'],
      ['alertes', '+69 comptes', 'dans le réseau de Love8, en une recherche']
    ].map((t, i) => ({ d: ic[t[0]], v: t[1], l: t[2], delay: (0.15 + i * 0.08).toFixed(2) + 's' }));
    const st = this.state || {};
    const closed = () => this.setState({ notice: true });
    return {
      tiles,
      showNotice: !!st.notice,
      closed,
      submit: (e) => { e.preventDefault(); closed(); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      h("div", { "class": "sw sw-ground auth-root", "style": "min-height: 100vh; box-sizing: border-box; padding: 32px 24px 48px; display: flex; flex-direction: column; align-items: center; gap: 28px; color: var(--ink); font-family: var(--font-body);" },
        h("a", { "class": "sw-logo", "href": "/", "aria-label": "Swarm, page d'accueil" },
          h("svg", { "class": "sw-logo-mark on-dark", "width": "30", "height": "30", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 30px; height: 30px;" },
            h("circle", { "class": "d-a", "cx": "5", "cy": "8", "r": "2.3" }),
            h("circle", { "class": "d-a", "cx": "11", "cy": "5", "r": "2.3" }),
            h("circle", { "class": "d-a", "cx": "17", "cy": "8", "r": "2.3" }),
            h("circle", { "class": "d-b", "cx": "8", "cy": "14", "r": "2.3" }),
            h("circle", { "class": "d-b", "cx": "14", "cy": "13", "r": "2.3" }),
            h("circle", { "class": "d-b", "cx": "19", "cy": "17", "r": "2.3" }),
            h("circle", { "class": "d-b", "cx": "11", "cy": "20", "r": "2.3" })
          ),
          h("span", { "class": "sw-wordmark", "style": "font-size: 25px;" },
            "swarm"
          )
        ),
        h("div", { "class": "auth-card", "style": "width: 100%; max-width: 1320px; box-sizing: border-box; padding: 20px; border-radius: 32px; background: var(--surface-raised); border: 1px solid var(--line); box-shadow: var(--shadow-float); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(440px, 100%), 1fr)); gap: 20px;" },
          h("section", { "class": "auth-form", "style": "display: flex; align-items: center; justify-content: center; padding: 56px 40px;" },
            h("form", { "onSubmit": $v.submit, "style": "width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 22px;", "aria-labelledby": "t-login" },
              h("h1", { "id": "t-login", "style": "margin: 0 0 6px; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
                "Content de te revoir"
              ),
              h("button", { "class": "sw-btn sw-btn-provider", "type": "button", "onClick": $v.closed },
                h("svg", { "width": "18", "height": "18", "viewBox": "0 0 48 48", "aria-hidden": "true" },
                  h("path", { "fill": "#FFC107", "d": "M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" }),
                  h("path", { "fill": "#FF3D00", "d": "M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" }),
                  h("path", { "fill": "#4CAF50", "d": "M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" }),
                  h("path", { "fill": "#1976D2", "d": "M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" })
                ),
                "Se connecter avec Google"
              ),
              h("div", { "class": "sw-divider" },
                "Ou se connecter avec"
              ),
              h("div", { "class": "sw-field" },
                h("label", { "class": "sw-label", "for": "a-mail" },
                  "E-mail"
                ),
                h("input", { "class": "sw-input", "id": "a-mail", "name": "email", "type": "email", "required": true, "autocomplete": "email", "placeholder": "toi@exemple.fr" })
              ),
              h("div", { "class": "sw-field" },
                h("label", { "class": "sw-label", "for": "a-pass" },
                  "Mot de passe"
                ),
                h("input", { "class": "sw-input", "id": "a-pass", "name": "password", "type": "password", "required": true, "autocomplete": "current-password" }),
                h("a", { "class": "sw-link-quiet", "href": "#", "style": "align-self: flex-end; font-size: 13px; margin-top: 4px;" },
                  "Mot de passe oublié ?"
                )
              ),
              h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg sw-btn-block", "type": "submit", "style": "margin-top: 6px; justify-content: center; cursor: pointer; font-family: inherit;" },
                "Se connecter",
                h("span", { "class": "sw-btn-tile" },
                  h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              ($v.showNotice) ? [
                h("p", { "class": "auth-notice", "role": "status", "style": "margin: 0;" },
                  "L'espace membre n'est pas encore ouvert. ",
                  h("a", { "class": "sw-link", "href": "/inscription" },
                    "Crée ton compte"
                  ),
                  " pour être prévenu de l'ouverture."
                )
              ] : null,
              h("p", { "style": "margin: 4px 0 0; text-align: center; font-size: 14px; color: var(--ink-muted);" },
                "Pas encore de compte ? ",
                h("a", { "class": "sw-link", "href": "/inscription" },
                  "En créer un"
                )
              )
            )
          ),
          h("section", { "class": "auth-side", "aria-label": "Ce que suit Swarm", "style": "position: relative; overflow: hidden; border-radius: 24px; background: var(--ground); border: 1px solid var(--line); padding: 64px 56px; display: flex; flex-direction: column; gap: 44px;" },
            h("div", { "aria-hidden": "true", "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(80% 70% at 70% 20%, #000, transparent); mask-image: radial-gradient(80% 70% at 70% 20%, #000, transparent);" }),
            h("div", { "aria-hidden": "true", "style": "position: absolute; right: -180px; top: -200px; width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.30), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
            h("h2", { "class": "sw-enter", "style": "position: relative; margin: 0; max-width: 560px; font-family: var(--font-display); font-size: 56px; line-height: 1.04; font-weight: 700; letter-spacing: -0.05em; color: var(--ink);" },
              "Bon retour. ",
              h("span", { "style": "color: var(--accent);" },
                "Tout est comme tu l'as laissé."
              )
            ),
            h("div", { "style": "position: relative; display: flex; flex-direction: column; gap: 12px;" },
              h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;" },
                ($l($v.tiles)).map((t) => [
                  h("div", { "class": "sw-card sw-enter", "style": `padding: 20px 22px; border-radius: 20px; display: flex; flex-direction: column; gap: 14px; animation-delay: ${$t(t?.delay)};` },
                    h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent);" },
                      h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                      h("span", { "class": "sw-stat", "style": "font-size: 28px;" },
                        $t(t?.v)
                      ),
                      h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                        $t(t?.l)
                      )
                    )
                  )
                ])
              ),
              h("span", { "class": "sw-calc", "style": "position: relative;" },
                "Trois derniers : exemples relevés par le Radar entre le 7 et le 12/11."
              )
            )
          )
        )
      )
    ];
  }
}
