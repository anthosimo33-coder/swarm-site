// Généré par scripts/dc2preact.py depuis design/Inscription.dc.html — ne pas modifier à la main.
import { h } from 'preact';
import { DCLogic, $t, $l } from '../runtime.js';

export default class Inscription extends DCLogic {
  renderVals() {
    const avis = [
      ['« [Ce qu’il a trouvé avec Swarm, avec un chiffre : vues, clients ou revenus] »', '[Prénom N.]', '[Ce qu’il a lancé · pays]'],
      ['« [Le format copié qui a marché du premier coup] »', '[Prénom N.]', '[Niche]'],
      ['« [Pourquoi Swarm plutôt qu’une formation à 1 000 €] »', '[Prénom N.]', '[Ce qu’il a lancé · pays]']
    ].map((a, i) => ({ q: a[0], name: a[1], role: a[2], cls: (i === 1 ? 'is-featured ' : '') + (i === 2 ? 'auth-x2' : i === 1 ? 'auth-x1' : ''), delay: (0.2 + i * 0.12).toFixed(2) + 's' }));
    const q = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('q') || '').trim().slice(0, 80) : '';
    const next = () => { window.location.href = '/tarifs'; };
    return {
      avis,
      q,
      hasQ: !!q,
      next,
      submit: (e) => { e.preventDefault(); next(); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      h("div", { "class": "sw sw-ground auth-root", "style": "height: 100vh; height: 100dvh; overflow: hidden; box-sizing: border-box; padding: clamp(16px, 3vh, 32px) 24px; display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 2.4vh, 24px); color: var(--ink); font-family: var(--font-body);" },
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
        h("div", { "class": "auth-card", "style": "flex: 1 1 auto; min-height: 0; width: 100%; max-width: 1240px; box-sizing: border-box; padding: 16px; border-radius: 32px; background: var(--surface-raised); border: 1px solid var(--line); box-shadow: var(--shadow-float); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px;" },
          h("section", { "class": "auth-form", "style": "min-height: 0; display: flex; align-items: center; justify-content: center; padding: clamp(16px, 4vh, 48px) 40px;" },
            h("form", { "onSubmit": $v.submit, "aria-labelledby": "t-signup", "style": "width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: clamp(12px, 2.1vh, 20px);" },
              h("h1", { "id": "t-signup", "style": "margin: 0 0 4px; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
                "Créer un compte"
              ),
              ($v.hasQ) ? [
                h("p", { "class": "auth-notice" },
                  "Ta recherche : ",
                  h("span", { "style": "color: var(--ink); font-weight: 600;" },
                    "« ", $t($v.q), " »"
                  ),
                  ". Crée ton compte pour voir ce qui explose dans ce créneau."
                )
              ] : null,
              h("button", { "class": "sw-btn sw-btn-provider", "type": "button", "onClick": $v.next },
                h("svg", { "width": "18", "height": "18", "viewBox": "0 0 48 48", "aria-hidden": "true" },
                  h("path", { "fill": "#FFC107", "d": "M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" }),
                  h("path", { "fill": "#FF3D00", "d": "M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" }),
                  h("path", { "fill": "#4CAF50", "d": "M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" }),
                  h("path", { "fill": "#1976D2", "d": "M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" })
                ),
                "Continuer avec Google"
              ),
              h("div", { "class": "sw-divider" },
                "Ou avec ton e-mail"
              ),
              h("div", { "class": "sw-field" },
                h("label", { "class": "sw-label", "for": "sa-mail" },
                  "E-mail"
                ),
                h("input", { "class": "sw-input", "id": "sa-mail", "name": "email", "type": "email", "required": true, "autocomplete": "email", "placeholder": "toi@exemple.fr" })
              ),
              h("button", { "type": "submit", "class": "cta", "style": "align-self: center; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; margin: 2px 0 0; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                "Créer mon compte",
                h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                    h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              h("p", { "style": "margin: 0; text-align: center; font-size: 13px; line-height: 1.6; color: var(--ink-faint);" },
                "En continuant, tu acceptes nos ",
                h("a", { "class": "sw-link-quiet", "href": "#cgv" },
                  "CGV"
                ),
                " et notre ",
                h("a", { "class": "sw-link-quiet", "href": "#confidentialite" },
                  "politique de confidentialité"
                ),
                "."
              ),
              h("p", { "style": "margin: 0; text-align: center; font-size: 14px; color: var(--ink-muted);" },
                "Déjà un compte ? ",
                h("a", { "class": "sw-link", "href": "/connexion" },
                  "Se connecter"
                )
              )
            )
          ),
          h("section", { "class": "auth-side", "aria-label": "Ce qu'en disent les membres", "style": "position: relative; min-height: 0; overflow: hidden; border-radius: 24px; background: var(--ground); border: 1px solid var(--line); padding: clamp(24px, 5vh, 56px) clamp(28px, 4vw, 56px); display: flex; flex-direction: column; justify-content: center; gap: clamp(16px, 3.4vh, 36px);" },
            h("div", { "aria-hidden": "true", "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(80% 70% at 30% 10%, #000, transparent); mask-image: radial-gradient(80% 70% at 30% 10%, #000, transparent);" }),
            h("div", { "aria-hidden": "true", "style": "position: absolute; left: -160px; bottom: -260px; width: 680px; height: 680px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.28), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
            h("div", { "style": "position: relative; display: flex; flex-direction: column; gap: clamp(10px, 1.8vh, 16px);" },
              h("h2", { "class": "sw-enter", "style": "position: relative; margin: 0; max-width: 560px; font-family: var(--font-display); font-size: clamp(34px, 5.4vh, 54px); line-height: 1.04; font-weight: 700; letter-spacing: -0.05em; color: var(--ink);" },
                "Ta prochaine app ",
                h("span", { "style": "color: var(--accent);" },
                  "explose déjà sur les réseaux."
                )
              ),
              h("span", { "style": "font-size: 15px; color: var(--ink-muted);" },
                "Rejoins ",
                h("span", { "style": "color: var(--ink); font-weight: 600;" },
                  "[N] membres"
                ),
                " qui repèrent les apps avant tout le monde."
              )
            ),
            h("div", { "style": "position: relative; display: flex; flex-direction: column; gap: 12px;" },
              ($l($v.avis)).map((r) => [
                h("figure", { "class": `sw-card sw-enter ${$t(r?.cls)}`, "style": `margin: 0; padding: clamp(14px, 2vh, 22px) 22px; border-radius: 18px; display: flex; flex-direction: column; gap: 12px; animation-delay: ${$t(r?.delay)};` },
                  h("blockquote", { "style": "margin: 0; font-size: 15px; line-height: 1.5; color: var(--ink-soft);" },
                    $t(r?.q)
                  ),
                  h("figcaption", { "style": "display: flex; align-items: center; gap: 12px;" },
                    h("span", { "aria-hidden": "true", "style": "width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(180deg, #1B2333, #111724); border: 1px solid rgba(255,255,255,0.10); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                      h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24" },
                        h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                        h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                      )
                    ),
                    h("span", { "style": "display: flex; flex-direction: column;" },
                      h("span", { "style": "font-size: 14px; font-weight: 600;" },
                        $t(r?.name)
                      ),
                      h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                        $t(r?.role)
                      )
                    )
                  )
                )
              ])
            )
          )
        )
      )
    ];
  }
}
