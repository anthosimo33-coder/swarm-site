// Généré par scripts/dc2preact.py depuis design/app/MCompte.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MCompte extends DCLogic {

  renderVals() {
    const b = this.baseVals();
    return Object.assign({}, b, this.shellVals(), this.extraVals(b));
  }
  shellVals() {
    const st = this.state || {};
    const u = this.props.user;
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: String(u.initiale || u.prenom || u.email || '?').charAt(0).toUpperCase() }
                 : { prenom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A' };
    return {
      me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save, ajItem: null, pal: !!st.pal, openPal: () => this.setState({ pal: true }), closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, openAj: () => this.setState({ aj: true }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const u = this.props.user;
    const prenom = u ? (u.prenom || '') : 'Anthony';
    return { nameLabel: prenom || 'Ton compte', prenomLabel: prenom || '—',
      logout: (e) => { if (this.props.signOut) { e.preventDefault(); this.props.signOut(); } } };
  }

  baseVals() {
    const m = 1;
    return { m };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(32px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("a", { "class": "sw-btn sw-btn-icon", "href": "/app", "aria-label": "Retour", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-left: -10px;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Compte"
            )
          )
        ),
        $h("div", { "style": "padding: 24px 20px 0; display: flex; align-items: center; gap: 16px;" },
          $h("span", { "class": "sw-avatar", "style": "width: 64px; height: 64px; font-size: 26px;" },
            $t($v.me?.initiale)
          ),
          $h("span", { "style": "display: flex; flex-direction: column; gap: 3px;" },
            $h("span", { "style": "font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: -0.03em;" },
              $t($v.nameLabel)
            ),
            $h("span", { "style": "font-size: 14px; color: var(--ink-muted); overflow-wrap: anywhere;" },
              $t($v.me?.email)
            )
          )
        ),
        $h("div", { "style": "padding: 24px 20px 0; display: flex; flex-direction: column; gap: 8px;" },
          $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding-left: 4px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
              $h("path", { "d": "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Accès"
          ),
          $h("div", { "style": "border-radius: 20px; background: var(--surface-raised); border: 1px solid var(--accent-edge); overflow: hidden;" },
            $h("div", { "style": "min-height: 56px; padding: 14px 16px; display: flex; flex-direction: column; gap: 4px;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 8px;" },
                $h("span", { "style": "font-size: 16px; font-weight: 700;" },
                  "Accès complet"
                ),
                $h("span", { "class": "sw-badge sw-badge-accent", "style": "height: 22px;" },
                  "Ouvert"
                )
              ),
              $h("span", { "style": "font-size: 13px; line-height: 1.5; color: var(--ink-faint);" },
                "Ton compte a accès à tout Kopycat : apps, formats, créateurs, alertes et dossiers."
              )
            )
          )
        ),
        $h("div", { "style": "padding: 24px 20px 0; display: flex; flex-direction: column; gap: 8px;" },
          $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding-left: 4px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
              $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Profil"
          ),
          $h("div", { "style": "border-radius: 20px; background: var(--surface-raised); border: 1px solid var(--line); overflow: hidden;" },
            $h("div", { "style": "min-height: 56px; padding: 10px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--line);" },
              $h("span", { "style": "width: 70px; font-size: 14px; color: var(--ink-faint);" },
                "Prénom"
              ),
              $h("span", { "style": "flex: 1; min-width: 0; font-size: 16px; color: var(--ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                $t($v.prenomLabel)
              )
            ),
            $h("div", { "style": "min-height: 56px; padding: 10px 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--line);" },
              $h("span", { "style": "width: 70px; font-size: 14px; color: var(--ink-faint);" },
                "E-mail"
              ),
              $h("span", { "style": "flex: 1; min-width: 0; font-size: 16px; color: var(--ink-soft); overflow-wrap: anywhere;" },
                $t($v.me?.email)
              )
            )
          )
        ),
        $h("div", { "style": "padding: 26px 20px 0; display: flex; flex-direction: column; align-items: center; gap: 18px;" },
          $h("a", { "class": "sw-link-quiet", "href": "/app/deconnexion", "onClick": $v.logout, "style": "font-size: 15px; min-height: 44px; display: inline-flex; align-items: center;" },
            "Se déconnecter"
          )
        ),
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(MPalette, { "onClose": $v.closePal, "get": $v.getFn })
          )
        ] : null,
        ($v.aj) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 70;" },
            $h(MAjout, { "onClose": $v.closeAj, "item": $v.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
          )
        ] : null
      )
    ];
  }
}
