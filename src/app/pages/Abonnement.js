// Généré par scripts/dc2preact.py depuis design/app/CompteB.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class Abonnement extends DCLogic {
  renderVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const incl = [{"t": "Les apps qui montent, dans tous les marchés"}, {"t": "Les formats repris par plusieurs comptes"}, {"t": "Les créateurs et leurs vidéos"}, {"t": "Les alertes par e-mail et notification"}, {"t": "Les dossiers, sans limite"}, {"t": "+1 000 apps et +100 000 comptes TikTok suivis"}];
    const mk = [{"c": "FR", "l": "France"}, {"c": "US", "l": "États-Unis"}, {"c": "MX", "l": "Mexique et Amérique latine"}];
    const ni = [{"l": "Études"}, {"l": "Side hustle"}, {"l": "Couple"}];
    const inv = [{"d": "12/11/2026", "t": "Pro mensuel", "m": "49,00 €", "s": "Payée"}];
    return { nav, incl, mk, ni, inv };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 880px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
          ($l($v.nav)).map((n) => [
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
            $h("a", { "class": "sw-avatar", "href": "#", "aria-label": "Mon compte", "style": "text-decoration: none;" },
              "A"
            )
          )
        ),
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; background: var(--surface);" },
          $h("div", { "style": "max-width: 1040px; width: 100%; margin: 0 auto; box-sizing: border-box; padding: 36px 32px 48px; display: flex; flex-direction: column; gap: 24px;" },
            $h("div", { "style": "display: flex; align-items: flex-end; justify-content: space-between;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 40px; font-weight: 700; letter-spacing: -0.04em;" },
                "Ton abonnement"
              ),
              $h("span", { "style": "display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--ink-muted);" },
                $h("span", { "class": "sw-avatar", "style": "width: 32px; height: 32px; font-size: 13px;" },
                  "A"
                ),
                "anthony@exemple.fr"
              )
            ),
            $h("section", { "style": "position: relative; overflow: hidden; border-radius: 32px; padding: 40px 44px; background: radial-gradient(80% 120% at 100% 0%, rgba(11,111,224,0.35), transparent 60%), var(--surface-raised); border: 1px solid var(--accent-edge); box-shadow: var(--shadow-active); display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 40px;" },
              $h("div", { "aria-hidden": "true", "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(50% 80% at 100% 0%, #000, transparent); mask-image: radial-gradient(50% 80% at 100% 0%, #000, transparent);" }),
              $h("div", { "style": "position: relative; display: flex; flex-direction: column; gap: 18px;" },
                $h("span", { "style": "display: flex; align-items: center; gap: 10px;" },
                  $h("span", { "class": "sw-eyebrow", "style": "font-size: 13px;" },
                    $h("b", null,
                      "["
                    ),
                    " Ton plan ",
                    $h("b", null,
                      "]"
                    )
                  ),
                  $h("span", { "class": "sw-badge sw-badge-accent" },
                    "Actif depuis le 12/11/2026"
                  )
                ),
                $h("span", { "style": "display: flex; align-items: baseline; gap: 14px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 72px; line-height: 0.95; font-weight: 800; letter-spacing: -0.06em;" },
                    "Pro"
                  ),
                  $h("span", { "style": "font-size: 22px; font-weight: 600; color: var(--ink-soft);" },
                    "49 € par mois"
                  )
                ),
                $h("span", { "style": "font-size: 15px; color: var(--ink-muted);" },
                  "Prochain prélèvement le 12/12/2026."
                ),
                $h("ul", { "style": "margin: 6px 0 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 20px;" },
                  ($l($v.incl)).map((i) => [
                    $h("li", { "style": "display: flex; gap: 10px; font-size: 14px; line-height: 1.45; color: var(--ink-soft);" },
                      $h("span", { "style": "color: var(--accent); flex-shrink: 0; padding-top: 2px;" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      $t(i?.t)
                    )
                  ])
                )
              ),
              $h("div", { "style": "position: relative; border-radius: 24px; padding: 24px; background: rgba(5,7,12,0.45); border: 1px solid var(--line); display: flex; flex-direction: column; gap: 14px;" },
                $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Facturation", "style": "align-self: flex-start;" },
                  $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "false" },
                    "Mensuel"
                  ),
                  $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "true" },
                    "Annuel"
                  )
                ),
                $h("span", { "style": "display: flex; align-items: baseline; gap: 8px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 44px; font-weight: 700; letter-spacing: -0.04em;" },
                    "390 €"
                  ),
                  $h("span", { "style": "font-size: 15px; color: var(--ink-muted);" },
                    "par an"
                  )
                ),
                $h("span", { "style": "font-size: 14px; line-height: 1.55; color: var(--ink-muted);" },
                  "Soit 32,50 € par mois, et 198 € de moins qu’en mensuel sur un an."
                ),
                $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg sw-btn-block", "href": "#" },
                  "Passer à l’annuel",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint); text-align: center;" },
                  "Le reste de ton mois en cours est déduit."
                )
              )
            ),
            $h("section", { "class": "sw-card", "style": "border-radius: 24px; padding: 8px 0;" },
              $h("div", { "style": "display: flex; justify-content: space-between; align-items: baseline; padding: 16px 24px 8px;" },
                $h("h2", { "class": "sw-card-title", "style": "font-size: 17px;" },
                  "Factures"
                ),
                $h("a", { "class": "sw-more", "href": "#" },
                  "Moyen de paiement"
                )
              ),
              $h("table", { "class": "sw-table" },
                $h("thead", null,
                  $h("tr", null,
                    $h("th", { "style": "padding-left: 24px;" },
                      "Date"
                    ),
                    $h("th", null,
                      "Plan"
                    ),
                    $h("th", { "class": "sw-num" },
                      "Montant"
                    ),
                    $h("th", null,
                      "Statut"
                    ),
                    $h("th", { "style": "padding-right: 24px;" })
                  )
                ),
                $h("tbody", null,
                  ($l($v.inv)).map((f) => [
                    $h("tr", null,
                      $h("td", { "style": "padding-left: 24px;" },
                        $t(f?.d)
                      ),
                      $h("td", null,
                        $t(f?.t)
                      ),
                      $h("td", { "class": "sw-num" },
                        $t(f?.m)
                      ),
                      $h("td", null,
                        $h("span", { "class": "sw-badge" },
                          $t(f?.s)
                        )
                      ),
                      $h("td", { "style": "padding-right: 24px; text-align: right;" },
                        $h("a", { "class": "sw-more", "href": "#" },
                          "PDF ",
                          $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M12 4v12M7 11l5 5 5-5M5 20h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    )
                  ])
                )
              )
            ),
            $h("div", { "style": "display: flex; justify-content: space-between; align-items: center; padding: 4px 4px 0; font-size: 14px;" },
              $h("span", { "style": "color: var(--ink-faint);" },
                "Tu peux arrêter quand tu veux, l’accès reste ouvert jusqu’à la fin de la période payée."
              ),
              $h("a", { "class": "sw-link-quiet", "href": "#" },
                "Résilier"
              )
            )
          )
        )
      )
    ];
  }
}
