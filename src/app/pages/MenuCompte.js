// Généré par scripts/dc2preact.py depuis design/app/MenuCompteA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class MenuCompte extends DCLogic {
  componentDidMount() {
    this.onKey = (e) => { if (e.key === 'Escape' && this.props && this.props.onClose) this.props.onClose(); };
    if (typeof document !== 'undefined') document.addEventListener('keydown', this.onKey);
  }
  componentWillUnmount() {
    if (typeof document !== 'undefined') document.removeEventListener('keydown', this.onKey);
  }
  renderVals() {
    // Le panneau du compte (19/11, maquette G2) : s’ouvre au clic sur l’avatar de la barre latérale (src/app/main.js).
    // Sans abonnement : l’encart « Tu vois 3 apps sur N » et « Formules et abonnement » ouvrent la fenêtre des formules.
    const p = this.props || {};
    const u = p.user || { prenom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A', pro: false };
    const pro = !!u.pro;
    const total = typeof p.total === 'number' && p.total > 0 ? p.total : 516;
    const close = () => { if (p.onClose) p.onClose(); };
    return {
      me: { initiale: (Array.from(String(u.initiale || u.prenom || u.email || '?'))[0] || '?').toUpperCase(), nom: u.prenom || String(u.email || '').split('@')[0] || 'Mon compte', email: u.email || '' },
      pro, free: !pro,
      badge: pro ? { label: 'Pro', bg: 'var(--accent-soft)', ink: 'var(--accent)', edge: 'var(--accent-edge)' }
                 : { label: 'Aperçu', bg: 'rgba(255,255,255,0.06)', ink: 'var(--ink-muted)', edge: 'rgba(255,255,255,0.1)' },
      totalTxt: String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      bar: Math.max(1, Math.round((3 / total) * 100)) + '%',
      aideHref: '/#faq',
      toProfil: () => { if (p.onSettings) p.onSettings('profil'); },
      toAbo: () => { if (p.onSettings) p.onSettings('abo'); },
      plans: () => { if (p.onPlans) p.onPlans(); },
      bg: (e) => { if (e && e.target === e.currentTarget) close(); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "onClick": $v.bg, "style": "position: fixed; inset: 0; z-index: 70; font-family: var(--font-body); color: var(--ink);" },
        $h("div", { "class": "mnu-box", "role": "menu", "aria-label": "Mon compte", "style": "position: absolute; left: calc(var(--sidebar-width) + 12px); bottom: 16px; width: 300px; box-sizing: border-box; padding: 6px; border-radius: 18px; background: #10141D; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.09), 0 24px 60px rgba(0,0,0,0.55); animation: a-mnu-mnuIn .16s ease-out both;" },
          $h("div", { "style": "display: flex; align-items: center; gap: 12px; padding: 10px 12px 12px;" },
            $h("span", { "style": "width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); color: #FFFFFF; font-weight: 700;" },
              $t($v.me?.initiale)
            ),
            $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
              $h("span", { "style": "font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                $t($v.me?.nom)
              ),
              $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                $t($v.me?.email)
              )
            ),
            $h("span", { "style": `height: 24px; padding: 0 9px; border-radius: 999px; display: inline-flex; align-items: center; font-size: 12px; font-weight: 700; flex-shrink: 0; background: ${$t($v.badge?.bg)}; color: ${$t($v.badge?.ink)}; box-shadow: inset 0 0 0 1px ${$t($v.badge?.edge)};` },
              $t($v.badge?.label)
            )
          ),
          ($v.free) ? [
            $h("div", { "style": "margin: 0 6px 6px; padding: 12px; border-radius: 14px; background: linear-gradient(180deg, rgba(76,154,255,0.14), rgba(76,154,255,0.04)); box-shadow: inset 0 0 0 1px var(--accent-edge); display: flex; flex-direction: column; gap: 10px;" },
              $h("span", { "style": "font-size: 13px; color: var(--ink-soft);" },
                "Tu vois ",
                $h("b", { "style": "color: #FFFFFF;" },
                  "3 apps"
                ),
                " sur ", $t($v.totalTxt), "."
              ),
              $h("span", { "style": "height: 6px; border-radius: 3px; background: rgba(255,255,255,0.08); overflow: hidden;" },
                $h("span", { "style": `display: block; width: ${$t($v.bar)}; min-width: 6px; height: 100%; border-radius: 3px; background: var(--accent);` })
              ),
              $h("button", { "class": "mnu-pro", "type": "button", "onClick": $v.plans, "style": "display: flex; align-items: center; justify-content: center; gap: 8px; height: 36px; border-radius: 10px; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); color: #FFFFFF; font-size: 14px; font-weight: 700;" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M13 3L5 14h6l-1 7 8-11h-6z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Passer Pro"
              )
            )
          ] : null,
          $h("div", { "style": "height: 1px; margin: 0 4px 6px; background: var(--line);" }),
          $h("button", { "class": "mnu-row", "role": "menuitem", "type": "button", "onClick": $v.toProfil },
            $h("span", { "class": "mnu-ic" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1;" },
              "Réglages"
            ),
            $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
              $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          ),
          $h("button", { "class": "mnu-row", "role": "menuitem", "type": "button", "onClick": $v.toAbo },
            $h("span", { "class": "mnu-ic" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M3 6h18v12H3zM3 10h18M7 15h3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1;" },
              "Formules et abonnement"
            ),
            $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
              $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          ),
          $h("a", { "class": "mnu-row", "role": "menuitem", "href": $v.aideHref, "target": "_blank", "rel": "noopener" },
            $h("span", { "class": "mnu-ic" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.5v.4M12 16.8h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1;" },
              "Aide et contact"
            ),
            $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
              $h("path", { "d": "M7 17L17 7M9 7h8v8", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          ),
          $h("div", { "style": "height: 1px; margin: 6px 4px; background: var(--line);" }),
          $h("a", { "class": "mnu-row mnu-out", "role": "menuitem", "href": "/app/deconnexion" },
            $h("span", { "class": "mnu-ic" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M15 17l5-5-5-5M20 12H9M12 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1;" },
              "Se déconnecter"
            )
          )
        )
      )
    ];
  }
}
