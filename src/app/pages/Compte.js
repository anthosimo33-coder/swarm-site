// Généré par scripts/dc2preact.py depuis design/app/CompteA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Compte extends DCLogic {

  renderVals() {
    const b = this.baseVals();
    return Object.assign({}, b, this.shellVals(), this.extraVals(b));
  }
  shellVals() {
    const st = this.state || {};
    const u = this.props.user;
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: String(u.initiale || u.prenom || u.email || '?').charAt(0).toUpperCase() }
                 : { prenom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A' };
    const I = {"accueil": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "apps": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "formats": "M4 5h16v14H4zM10 9l5 3-5 3z", "createurs": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "alertes": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "dossiers": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"};
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'aucun' ? 'page' : 'false' }));
    return {
      sb, me, getFn: this.props && this.props.get,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const sec = st.sec || 'cp-profil';
    return {
      sub: [['Profil', 'cp-profil'], ['Accès', 'cp-acces']].map((s) => ({ l: s[0], href: '#' + s[1], cur: s[1] === sec ? 'page' : 'false', bg: s[1] === sec ? 'var(--accent-soft)' : 'transparent', ink: s[1] === sec ? 'var(--ink)' : 'var(--ink-muted)',
        pick: () => this.setState({ sec: s[1] }) })),
      logout: (e) => { if (this.props.signOut) { e.preventDefault(); this.props.signOut(); } }
    };
  }

  baseVals() {
    return {};
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1280px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("nav", { "class": "sw-sidebar", "aria-label": "Navigation principale" },
          $h("a", { "class": "sw-side-logo", "href": "/app", "aria-label": "Swarm, accueil" },
            $h("span", { "class": "sw-app-tile" },
              $h("svg", { "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" })
              )
            )
          ),
          $h("button", { "class": "sw-side-item", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher, raccourci Commande K", "style": "border: 0; background: transparent; font-family: inherit; cursor: pointer;" },
            $h("span", { "class": "sw-side-ico" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            "Chercher"
          ),
          ($l($v.sb)).map((n) => [
            $h("a", { "class": "sw-side-item", "href": n?.href, "aria-current": n?.cur },
              $h("span", { "class": "sw-side-ico" },
                $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": n?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $t(n?.label)
            )
          ]),
          $h("div", { "class": "sw-side-foot" },
            $h("a", { "class": "sw-avatar", "href": "/app/compte", "aria-label": "Mon compte", "style": "text-decoration: none;" },
              $t($v.me?.initiale)
            )
          )
        ),
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; background: var(--surface);" },
          $h("div", { "style": "display: flex; flex: 1;" },
            $h("aside", { "style": "width: 260px; flex-shrink: 0; padding: 32px 16px; border-right: 1px solid var(--line); display: flex; flex-direction: column; gap: 4px;" },
              $h("h1", { "style": "margin: 0 12px 18px; font-family: var(--font-display); font-size: 32px; font-weight: 700; letter-spacing: -0.04em;" },
                "Compte"
              ),
              ($l($v.sub)).map((s) => [
                $h("a", { "href": s?.href, "onClick": s?.pick, "aria-current": s?.cur, "style": `padding: 10px 14px; border-radius: 12px; background: ${$t(s?.bg)}; color: ${$t(s?.ink)}; font-size: 15px; font-weight: 600; text-decoration: none;` },
                  $t(s?.l)
                )
              ]),
              $h("a", { "class": "sw-link-quiet", "href": "/app/deconnexion", "onClick": $v.logout, "style": "margin: auto 14px 0; font-size: 14px;" },
                "Se déconnecter"
              )
            ),
            $h("div", { "style": "flex: 1; min-width: 0; padding: 36px 48px 48px; display: flex; flex-direction: column; gap: 36px; max-width: 820px;" },
              $h("section", { "style": "display: flex; flex-direction: column; gap: 20px;" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("h2", { "id": "cp-profil", "style": "margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                    "Profil"
                  )
                ),
                $h("div", { "style": "display: flex; align-items: center; gap: 18px;" },
                  $h("span", { "class": "sw-avatar", "style": "width: 72px; height: 72px; font-size: 28px;" },
                    $t($v.me?.initiale)
                  )
                ),
                $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;" },
                  ($v.me?.prenom) ? [
                    $h("div", { "class": "sw-field" },
                      $h("span", { "class": "sw-label" },
                        "Prénom"
                      ),
                      $h("span", { "style": "height: 48px; display: flex; align-items: center; padding: 0 16px; border-radius: var(--radius-md); background: var(--track); font-size: 15px; color: var(--ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                        $t($v.me?.prenom)
                      )
                    )
                  ] : null,
                  $h("div", { "class": "sw-field" },
                    $h("span", { "class": "sw-label" },
                      "E-mail"
                    ),
                    $h("span", { "style": "height: 48px; display: flex; align-items: center; padding: 0 16px; border-radius: var(--radius-md); background: var(--track); font-size: 15px; color: var(--ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                      $t($v.me?.email)
                    ),
                    $h("span", { "class": "sw-hint" },
                      "L’e-mail de connexion à Swarm."
                    )
                  )
                )
              ),
              $h("section", { "style": "display: flex; flex-direction: column; gap: 16px; padding-top: 28px; border-top: 1px solid var(--line);" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("h2", { "id": "cp-acces", "style": "margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                    "Accès"
                  )
                ),
                $h("div", { "class": "sw-card is-featured", "style": "border-radius: 22px; padding: 22px 24px; display: flex; flex-direction: column; gap: 6px;" },
                  $h("span", { "style": "display: flex; align-items: center; gap: 10px;" },
                    $h("span", { "style": "font-size: 20px; font-weight: 700;" },
                      "Accès complet"
                    ),
                    $h("span", { "class": "sw-badge sw-badge-accent" },
                      "Ouvert"
                    )
                  ),
                  $h("span", { "style": "font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
                    "Ton compte a accès à tout Swarm : apps, formats, créateurs, alertes et dossiers."
                  )
                )
              )
            )
          )
        ),
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(Palette, { "onClose": $v.closePal, "get": $v.getFn })
          )
        ] : null
      )
    ];
  }
}
