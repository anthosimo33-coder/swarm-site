// Généré par scripts/dc2preact.py depuis design/Connexion.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../runtime.js';

export default class Connexion extends DCLogic {
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
    // Sur le site, src/auth.js passe `auth` (Convex Auth) et la connexion ouvre l'app.
    // Sur le canevas, il n'y a ni backend ni app : une note le dit.
    const auth = this.props && this.props.auth;
    const run = async (action) => {
      if (!auth) { this.setState({ error: '', notice: 'Maquette : sur le site, ce bouton connecte et ouvre l’app.' }); return; }
      this.setState({ busy: true, error: '', notice: '' });
      const failed = await action();
      // Réussi : le pont emmène la personne sur sa page, le bouton reste désactivé d'ici là.
      if (failed) this.setState({ busy: false, error: failed.message });
    };
    return {
      tiles,
      busy: !!st.busy,
      error: st.error || '',
      hasError: !!st.error,
      notice: st.notice || '',
      hasNotice: !!st.notice,
      google: () => run(() => auth.google()),
      // « Mot de passe oublié ? » mène à sa page ; l'e-mail déjà tapé l'y suit, par le stockage de l'onglet (jamais par
      // l'adresse de la page, qui finirait dans l'historique et les journaux).
      forgot: (e) => {
        try {
          const field = e.currentTarget.closest('form').elements.email;
          const email = field ? field.value.trim() : '';
          if (email) window.sessionStorage.setItem('kopycat:reset-email', email);
        } catch (err) { /* stockage refusé : la page s'ouvre avec le champ vide */ }
      },
      submit: (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        run(() => auth.password('signIn', form.get('email'), form.get('password')));
      }
    };
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
            $h("form", { "onSubmit": $v.submit, "aria-labelledby": "t-login", "style": "width: 100%; max-width: 400px; margin: auto 0; display: flex; flex-direction: column; gap: clamp(12px, 2.1vh, 20px);" },
              $h("h1", { "id": "t-login", "style": "margin: 0 0 4px; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
                "Content de te revoir"
              ),
              $h("button", { "class": "sw-btn sw-btn-provider", "type": "button", "onClick": $v.google, "disabled": $v.busy },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 48 48", "aria-hidden": "true" },
                  $h("path", { "fill": "#FFC107", "d": "M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" }),
                  $h("path", { "fill": "#FF3D00", "d": "M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" }),
                  $h("path", { "fill": "#4CAF50", "d": "M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" }),
                  $h("path", { "fill": "#1976D2", "d": "M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" })
                ),
                "Se connecter avec Google"
              ),
              $h("div", { "class": "sw-divider" },
                "Ou avec ton e-mail"
              ),
              $h("div", { "class": "sw-field" },
                $h("label", { "class": "sw-label", "for": "a-mail" },
                  "E-mail"
                ),
                $h("input", { "class": "sw-input", "id": "a-mail", "name": "email", "type": "email", "required": true, "autocomplete": "email", "placeholder": "toi@exemple.fr" })
              ),
              $h("div", { "class": "sw-field" },
                $h("label", { "class": "sw-label", "for": "a-pass" },
                  "Mot de passe"
                ),
                $h("input", { "class": "sw-input", "id": "a-pass", "name": "password", "type": "password", "required": true, "autocomplete": "current-password" }),
                $h("a", { "class": "sw-link-quiet", "href": "/mot-de-passe-oublie", "onClick": $v.forgot, "style": "align-self: flex-end; font-size: 13px; margin-top: 2px;" },
                  "Mot de passe oublié ?"
                )
              ),
              ($v.hasError) ? [
                $h("p", { "class": "auth-error", "role": "alert" },
                  $t($v.error)
                )
              ] : null,
              $h("button", { "type": "submit", "class": "cta", "disabled": $v.busy, "aria-busy": $v.busy, "style": "align-self: center; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; margin: 2px 0 0; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                "Se connecter",
                $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              ($v.hasNotice) ? [
                $h("p", { "class": "auth-notice", "role": "status" },
                  $t($v.notice)
                )
              ] : null,
              $h("p", { "style": "margin: 0; text-align: center; font-size: 14px; color: var(--ink-muted);" },
                "Pas encore de compte ? ",
                $h("a", { "class": "sw-link", "href": "/inscription" },
                  "En créer un"
                )
              )
            )
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
