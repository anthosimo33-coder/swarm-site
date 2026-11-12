// Généré par scripts/dc2preact.py depuis design/app/AlertesA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class Alertes extends DCLogic {
  renderVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "page"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const tabs = [{"l": "Toutes", "n": 8, "on": "true"}, {"l": "Formats", "n": 4, "on": "false"}, {"l": "Vidéos", "n": 2, "on": "false"}, {"l": "Comptes", "n": 2, "on": "false"}];
    const groups = [{"g": "Aujourd’hui", "items": [{"group": "Aujourd’hui", "when": "12/11", "typ": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "title": "Un son se répète : « original sound - ex7stence »", "sub": "RecentFollow · 3 comptes · États-Unis et Mexique", "big": "3,2×", "covs": [{"src": "/media/app/v-7704011591062261023.jpg"}, {"src": "/media/app/v-7707075093578419476.jpg"}, {"src": "/media/app/v-7704407707469630741.jpg"}], "cov0": "/media/app/v-7704011591062261023.jpg", "rule": "Un format repris par 3 comptes ou plus", "unread": true, "dot": "var(--accent)", "bg": "var(--accent-soft)", "w": "700", "href": "/app/formats/ich-losche-das-in-2h", "cta": "Voir le format"}]}, {"g": "Hier", "items": [{"group": "Hier", "when": "11/11", "typ": "Format", "ico": "M5 6h14M12 6v13M9 19h6", "title": "Une accroche se répète : « POV: terminaste de estudiar 4 horas antes… »", "sub": "Retain Cards · Mexique · 7 reprises sur 11 au-dessus de leur normale", "big": "4,7×", "covs": [{"src": "/media/app/v-7702846481736174868.jpg"}, {"src": "/media/app/v-7704563725029674262.jpg"}, {"src": "/media/app/v-7706045051574488342.jpg"}], "cov0": "/media/app/v-7702846481736174868.jpg", "rule": "Un format repris par 3 comptes ou plus", "unread": true, "dot": "var(--accent)", "bg": "var(--accent-soft)", "w": "700", "href": "/app/formats/ich-losche-das-in-2h", "cta": "Voir le format"}, {"group": "Hier", "when": "11/11", "typ": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "title": "Un son se répète : « exam vibes »", "sub": "Astra AI · 4 reprises sur 6 au-dessus de leur normale", "big": "7×", "covs": [{"src": "/media/app/v-7704417260647025953.jpg"}, {"src": "/media/app/v-7706993521584098593.jpg"}, {"src": "/media/app/v-7705514449699966241.jpg"}], "cov0": "/media/app/v-7704417260647025953.jpg", "rule": "Un format repris par 3 comptes ou plus", "unread": true, "dot": "var(--accent)", "bg": "var(--accent-soft)", "w": "700", "href": "/app/formats/ich-losche-das-in-2h", "cta": "Voir le format"}]}, {"g": "Lundi 10/11", "items": [{"group": "Lundi 10/11", "when": "10/11 · 17 h", "typ": "Format", "ico": "M5 6h14M12 6v13M9 19h6", "title": "« Ich lösche das in 2h‼️ » : 4e reprise, et la meilleure", "sub": "@studywithdenise · 106 k vues · Retain Cards · Allemagne", "big": "39×", "covs": [{"src": "/media/app/v-7706579888727231777.jpg"}, {"src": "/media/app/v-7705712961511263521.jpg"}, {"src": "/media/app/v-7705122381735513376.jpg"}], "cov0": "/media/app/v-7706579888727231777.jpg", "rule": "Un format repris par 3 comptes ou plus", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/formats/ich-losche-das-in-2h", "cta": "Voir le format"}, {"group": "Lundi 10/11", "when": "10/11 · 01 h", "typ": "Compte", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "title": "@johan_love8 fait 298× sa normale", "sub": "Love8 · France · 253 k vues", "big": "298×", "covs": [{"src": "/media/app/v-7706331130374540577.jpg"}], "cov0": "/media/app/v-7706331130374540577.jpg", "rule": "Un compte fait 100× sa normale", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/createurs/zinedine-gsbb", "cta": "Voir le compte"}]}, {"g": "Dimanche 09/11", "items": [{"group": "Dimanche 09/11", "when": "09/11 · 04 h", "typ": "Compte", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "title": "@studywith_elsie fait 1 226× sa normale", "sub": "Astra AI · 572 abonnés · 809 k vues", "big": "1 226×", "covs": [{"src": "/media/app/v-7706010190566542612.jpg"}], "cov0": "/media/app/v-7706010190566542612.jpg", "rule": "Un compte fait 100× sa normale", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/createurs/zinedine-gsbb", "cta": "Voir le compte"}]}, {"g": "Samedi 08/11", "items": [{"group": "Samedi 08/11", "when": "08/11 · 23 h", "typ": "Vidéo", "ico": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "title": "Une vidéo d’Astra AI passe 1 M de vues", "sub": "@learnwithjoel1 · Espagne · 154× sa normale", "big": "1,87 M", "covs": [{"src": "/media/app/v-7705929733220994337.jpg"}], "cov0": "/media/app/v-7705929733220994337.jpg", "rule": "Une vidéo d’app passe 1 M de vues", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/videos/learnwithjoel1", "cta": "Voir la vidéo"}]}, {"g": "Vendredi 07/11", "items": [{"group": "Vendredi 07/11", "when": "07/11 · 11 h", "typ": "Vidéo", "ico": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "title": "Une vidéo d’Astra AI passe 1 M de vues", "sub": "@belajarbersamaespi · Indonésie · 2 333× sa normale", "big": "1,99 M", "covs": [{"src": "/media/app/v-7705368869250075925.jpg"}], "cov0": "/media/app/v-7705368869250075925.jpg", "rule": "Une vidéo d’app passe 1 M de vues", "unread": false, "dot": "transparent", "bg": "transparent", "w": "600", "href": "/app/videos/learnwithjoel1", "cta": "Voir la vidéo"}]}];
    const rules = [{"t": "Un format repris par 3 comptes ou plus", "s": "Toutes niches · tous les marchés", "n": "4 cette semaine", "ico": "M5 6h14M12 6v13M9 19h6"}, {"t": "Une vidéo d’app passe 1 M de vues", "s": "Études · tous les marchés", "n": "2 cette semaine", "ico": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6"}, {"t": "Un compte fait 100× sa normale", "s": "Études et Couple · tous les marchés", "n": "2 cette semaine", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"}];
    return { nav, tabs, groups, rules };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1100px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
          $h("header", { "style": "display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; padding: 32px 32px 0;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 40px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em;" },
                "Alertes"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Ce que le Radar a repéré pour toi, selon tes réglages."
              )
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 16px;" },
              $h("a", { "class": "sw-more", "href": "#" },
                "Tout marquer comme lu"
              ),
              $h("a", { "class": "sw-btn sw-btn-primary", "href": "/app/alertes/nouvelle" },
                "Créer une alerte",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          $h("div", { "style": "margin: 20px 32px 0; border-bottom: 1px solid var(--line);" },
            $h("div", { "class": "sw-tabs sw-tabs-line", "role": "tablist", "aria-label": "Type", "style": "border-bottom: 0;" },
              ($l($v.tabs)).map((t) => [
                $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": t?.on, "style": "display: inline-flex; align-items: center; gap: 8px;" },
                  $t(t?.l),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    $t(t?.n)
                  )
                )
              ])
            )
          ),
          $h("div", { "style": "padding: 20px 32px 48px; display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 18px;" },
              ($l($v.groups)).map((g) => [
                $h("section", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("h2", { "style": "margin: 0 0 4px 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
                    $t(g?.g)
                  ),
                  ($l(g?.items)).map((a) => [
                    $h("a", { "href": a?.href, "style": `display: flex; align-items: center; gap: 16px; padding: 14px 18px 14px 14px; border-radius: 18px; background: ${$t(a?.bg)}; text-decoration: none; color: inherit;` },
                      $h("span", { "style": `width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: ${$t(a?.dot)};` }),
                      $h("span", { "style": "width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": a?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                        $h("span", { "style": `font-size: 15px; font-weight: ${$t(a?.w)}; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` },
                          $t(a?.title)
                        ),
                        $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                          $t(a?.sub)
                        )
                      ),
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 2px; min-width: 76px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--accent);" },
                          $t(a?.big)
                        ),
                        $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                          $t(a?.when)
                        )
                      ),
                      $h("span", { "style": "display: flex; flex-shrink: 0;" },
                        ($l(a?.covs)).map((c) => [
                          $h("span", { "class": "sw-video", "style": "display: block; width: 34px; margin-left: -10px; border-radius: 8px; box-shadow: 0 0 0 2px var(--surface);" },
                            $h("img", { "class": "sw-cover", "src": c?.src, "alt": "" })
                          )
                        ])
                      )
                    )
                  ])
                )
              ])
            ),
            $h("aside", { "class": "sw-card", "style": "border-radius: 24px; padding: 22px; display: flex; flex-direction: column; gap: 14px;" },
              $h("div", { "style": "display: flex; justify-content: space-between; align-items: baseline;" },
                $h("h2", { "class": "sw-card-title", "style": "font-size: 17px;" },
                  "Tes alertes"
                ),
                $h("a", { "class": "sw-more", "href": "#" },
                  "Gérer"
                )
              ),
              ($l($v.rules)).map((r) => [
                $h("div", { "style": "display: flex; gap: 12px; align-items: flex-start; padding: 14px; border-radius: 16px; background: var(--track);" },
                  $h("span", { "style": "width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": r?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 3px;" },
                    $h("span", { "style": "font-size: 14px; font-weight: 600; line-height: 1.35;" },
                      $t(r?.t)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t(r?.s)
                    ),
                    $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--accent);" },
                      $t(r?.n)
                    )
                  ),
                  $h("span", { "role": "switch", "aria-checked": "true", "style": "width: 40px; height: 24px; border-radius: 12px; flex-shrink: 0; position: relative; display: inline-block; background: var(--blue-600);" },
                    $h("span", { "style": "position: absolute; top: 3px; left: 19px; width: 18px; height: 18px; border-radius: 50%; background: #FFFFFF;" })
                  )
                )
              ]),
              $h("span", { "style": "font-size: 12px; line-height: 1.5; color: var(--ink-faint);" },
                "Par e-mail et notification, au plus une fois par jour et par alerte."
              )
            )
          )
        )
      )
    ];
  }
}
