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
      sb, me,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const u = this.props.user;
    const prenom0 = u ? (u.prenom || '') : 'Anthony';
    const NT = [['mail', 'Alertes par e-mail', 'Au plus une fois par jour et par alerte', true], ['push', 'Notifications', 'Dans le navigateur et sur ton téléphone', true], ['lundi', 'Le résumé du lundi', 'Ce qui a monté la semaine passée, dans ta niche', false]];
    const nst = st.notif || {};
    return {
      sub: [['Profil', '#cp-profil'], ['Accès', '#cp-acces'], ['Marchés et niches', '#cp-marches'], ['Notifications', '#cp-notifs']].map((s, i) => ({ l: s[0], href: s[1], cur: i === 0 ? 'page' : 'false', bg: i === 0 ? 'var(--accent-soft)' : 'transparent', ink: i === 0 ? 'var(--ink)' : 'var(--ink-muted)' })),
      prenomVal: st.prenom === undefined ? prenom0 : st.prenom,
      setPrenom: (e) => this.setState({ prenom: e.target.value, saved: false }),
      saveLabel: st.saved ? 'Enregistré' : 'Enregistrer', saveProfile: () => this.setState({ saved: true }),
      notifs: NT.map((x) => { const on = nst[x[0]] === undefined ? x[3] : nst[x[0]]; return { t: x[1], s: x[2], on: on ? 'true' : 'false', bg: on ? 'var(--blue-600)' : 'var(--track)', edge: on ? 'transparent' : 'var(--line-strong)', knob: on ? '21px' : '3px',
        toggle: () => this.setState({ notif: Object.assign({}, nst, { [x[0]]: !on }) }) }; }),
      logout: (e) => { if (this.props.signOut) { e.preventDefault(); this.props.signOut(); } }
    };
  }

  baseVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const incl = [{"t": "Les apps qui montent, dans tous les marchés"}, {"t": "Les formats repris par plusieurs comptes"}, {"t": "Les créateurs et leurs vidéos"}, {"t": "Les alertes par e-mail et notification"}, {"t": "Les dossiers, sans limite"}, {"t": "+1 000 apps et +100 000 comptes suivis sur TikTok, Instagram et YouTube Shorts"}];
    const mk = [{"c": "FR", "l": "France"}, {"c": "US", "l": "États-Unis"}, {"c": "MX", "l": "Mexique et Amérique latine"}];
    const ni = [{"l": "Études"}, {"l": "Side hustle"}, {"l": "Couple"}];
    const inv = [{"d": "12/11/2026", "t": "Pro mensuel", "m": "49,00 €", "s": "Payée"}];
    const sub = [{"l": "Profil", "cur": "page", "bg": "var(--accent-soft)", "ink": "var(--ink)"}, {"l": "Abonnement", "cur": "false", "bg": "transparent", "ink": "var(--ink-muted)"}, {"l": "Marchés et niches", "cur": "false", "bg": "transparent", "ink": "var(--ink-muted)"}, {"l": "Notifications", "cur": "false", "bg": "transparent", "ink": "var(--ink-muted)"}, {"l": "Factures", "cur": "false", "bg": "transparent", "ink": "var(--ink-muted)"}];
    return { nav, incl, mk, ni, inv, sub };
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
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Passer au thème clair" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
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
                $h("a", { "href": s?.href, "aria-current": s?.cur, "style": `padding: 10px 14px; border-radius: 12px; background: ${$t(s?.bg)}; color: ${$t(s?.ink)}; font-size: 15px; font-weight: 600; text-decoration: none;` },
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
                  ),
                  $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                    "Ce qui apparaît dans tes e-mails et tes factures."
                  )
                ),
                $h("div", { "style": "display: flex; align-items: center; gap: 18px;" },
                  $h("span", { "class": "sw-avatar", "style": "width: 72px; height: 72px; font-size: 28px;" },
                    $t($v.me?.initiale)
                  )
                ),
                $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px;" },
                  $h("div", { "class": "sw-field" },
                    $h("label", { "class": "sw-label", "for": "cp-prenom" },
                      "Prénom"
                    ),
                    $h("input", { "class": "sw-input", "id": "cp-prenom", "type": "text", "value": $v.prenomVal, "onInput": $v.setPrenom, "placeholder": "Ton prénom", "autocomplete": "given-name", "style": "height: 48px; font-size: 15px;" })
                  ),
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
              ),
              $h("section", { "style": "display: flex; flex-direction: column; gap: 16px; padding-top: 28px; border-top: 1px solid var(--line);" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("h2", { "id": "cp-marches", "style": "margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                    "Marchés et niches"
                  ),
                  $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                    "Ce que l’accueil et les alertes te montrent d’abord."
                  )
                ),
                $h("div", { "style": "display: flex; gap: 8px; flex-wrap: wrap;" },
                  ($l($v.mk)).map((m) => [
                    $h("span", { "class": "sw-pill", "style": "height: 34px; gap: 8px; padding: 0 12px 0 8px;" },
                      $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                        $t(m?.c)
                      ),
                      $t(m?.l)
                    )
                  ]),
                  $h("button", { "class": "sw-pill", "type": "button", "style": "height: 34px; color: var(--accent);" },
                    "+ Ajouter"
                  )
                ),
                $h("div", { "style": "display: flex; gap: 8px; flex-wrap: wrap;" },
                  ($l($v.ni)).map((n) => [
                    $h("span", { "class": "sw-pill", "style": "height: 34px;" },
                      $t(n?.l)
                    )
                  ]),
                  $h("button", { "class": "sw-pill", "type": "button", "style": "height: 34px; color: var(--accent);" },
                    "+ Ajouter"
                  )
                )
              ),
              $h("section", { "style": "display: flex; flex-direction: column; gap: 8px; padding-top: 28px; border-top: 1px solid var(--line);" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("h2", { "id": "cp-notifs", "style": "margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
                    "Notifications"
                  )
                ),
                ($l($v.notifs)).map((n) => [
                  $h("div", { "style": "display: flex; align-items: center; gap: 16px; padding: 12px 0;" },
                    $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 2px;" },
                      $h("span", { "style": "font-size: 15px; font-weight: 600;" },
                        $t(n?.t)
                      ),
                      $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                        $t(n?.s)
                      )
                    ),
                    $h("button", { "type": "button", "role": "switch", "aria-checked": n?.on, "onClick": n?.toggle, "aria-label": n?.t, "style": `width: 44px; height: 26px; border-radius: 13px; flex-shrink: 0; position: relative; padding: 0; border: 0; cursor: pointer; background: ${$t(n?.bg)}; box-shadow: inset 0 0 0 1px ${$t(n?.edge)};` },
                      $h("span", { "style": `position: absolute; top: 3px; left: ${$t(n?.knob)}; width: 20px; height: 20px; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,0.4);` })
                    )
                  )
                ])
              ),
              $h("div", { "style": "display: flex; justify-content: flex-end;" },
                $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.saveProfile },
                  $t($v.saveLabel),
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          )
        ),
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(Palette, { "onClose": $v.closePal })
          )
        ] : null
      )
    ];
  }
}
