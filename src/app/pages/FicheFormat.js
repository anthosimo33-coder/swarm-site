// Généré par scripts/dc2preact.py depuis design/app/FormatFicheA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class FicheFormat extends DCLogic {
  renderVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "page"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const f = {"quote": "Ich lösche das in 2h‼️", "fr": "Je supprime ça dans 2 h ‼️", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "mk": [{"c": "DE"}], "med": "39×", "okText": "3 sur 4", "n": 3, "max": "106 k", "rev": "Entre 500 et 710 €", "niche": "Études", "last": "vu le 10/11"};
    const tiles = [{"l": "Repris par", "v": "3 comptes", "s": "en 4 jours", "ink": "var(--ink)"}, {"l": "Réussite", "v": "3 sur 4", "s": "au-dessus de leur normale", "ink": "var(--ink)"}, {"l": "× la normale", "v": "39×", "s": "médiane des reprises", "ink": "var(--accent)"}, {"l": "Meilleure reprise", "v": "106 k vues", "s": "@studywithdenise, 10/11", "ink": "var(--ink)"}, {"l": "Revenus estimés", "v": "Entre 500 et 710 €", "s": "pour les 4 reprises", "ink": "var(--ink)"}];
    const reps = [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards", "when": "10/11 · 17 h", "day": "10/11"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards", "when": "08/11 · 09 h", "day": "08/11"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards", "when": "06/11 · 19 h", "day": "06/11"}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "h": "@study.mit.sophia", "raw": 1064, "date": "06/11", "app": "Retain Cards", "when": "06/11 · 09 h", "day": "06/11"}];
    const common = [{"d": "M5 6h14M12 6v13M9 19h6", "t": "Le même texte à l’écran", "s": "Mot pour mot sur les 4 vidéos, en allemand."}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Une seule app derrière", "s": "Les 3 comptes poussent Retain Cards, une app de révision."}, {"d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "t": "4 reprises en 4 jours", "s": "Du 06/11 au 10/11, chaque reprise a fait mieux que la précédente."}];
    return { nav, f, tiles, reps, common };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1400px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
          $h("nav", { "aria-label": "Fil d’Ariane", "style": "padding: 28px 32px 0; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-faint);" },
            $h("a", { "class": "sw-link-quiet", "href": "/app/formats" },
              "Formats"
            ),
            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("span", { "style": "color: var(--ink-soft);" },
              "Accroche"
            )
          ),
          $h("section", { "class": "sw-card", "style": "margin: 18px 32px 0; padding: 36px 40px; border-radius: 28px; overflow: hidden; display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; flex-wrap: wrap;" },
            $h("div", { "aria-hidden": "true", "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(60% 90% at 85% 0%, #000, transparent); mask-image: radial-gradient(60% 90% at 85% 0%, #000, transparent);" }),
            $h("div", { "style": "position: relative; display: flex; flex-direction: column; gap: 22px; min-width: 0; max-width: 760px;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 10px; flex-wrap: wrap;" },
                $h("span", { "class": "sw-badge", "style": "height: 26px; gap: 6px;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 6h14M12 6v13M9 19h6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Accroche"
                ),
                $h("span", { "class": "sw-badge", "style": "height: 26px;" },
                  $t($v.f?.niche)
                ),
                ($l($v.f?.mk)).map((m) => [
                  $h("span", { "class": "sw-flag", "style": "width: 26px; height: 20px; font-size: 10px;" },
                    $t(m?.c)
                  )
                ]),
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-muted);" },
                  $h("span", { "class": `sw-app-icon ${$t($v.f?.app0?.blank)}`, "style": "width: 22px; height: 22px; border-radius: 7px;" },
                    ($v.f?.app0?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": $v.f?.app0?.logo, "alt": "" })
                    ] : null,
                    ($v.f?.app0?.nologo) ? [
                      $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  "Retain Cards"
                ),
                $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                  "· ", $t($v.f?.last)
                )
              ),
              $h("span", { "style": "line-height: 1.55;" },
                $h("span", { "style": "background: #FFFFFF; color: #111216; font-family: var(--font-body); font-size: 44px; font-weight: 800; letter-spacing: -0.01em; padding: 6px 14px; border-radius: 12px; -webkit-box-decoration-break: clone; box-decoration-break: clone;" },
                  $t($v.f?.quote)
                )
              ),
              $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                $h("span", { "style": "font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
                  "En français"
                ),
                $h("span", { "style": "font-size: 22px; font-weight: 600; letter-spacing: -0.01em; color: var(--ink-soft);" },
                  "« ", $t($v.f?.fr), " »"
                ),
                $h("span", { "style": "font-size: 15px; color: var(--ink-muted);" },
                  "Le principe : la vidéo va disparaître, il faut la regarder maintenant."
                )
              )
            ),
            $h("div", { "style": "position: relative; display: flex; flex-direction: column; align-items: flex-end; gap: 14px;" },
              $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg", "href": "#" },
                "Copier l’accroche",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              $h("span", { "style": "display: flex; gap: 4px;" },
                $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Suivre ce format" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Ajouter à un dossier" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Ouvrir sur TikTok" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          $h("div", { "style": "margin: 16px 32px 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px;" },
            ($l($v.tiles)).map((t) => [
              $h("div", { "class": "sw-card", "style": "padding: 18px 20px; border-radius: 20px; display: flex; flex-direction: column; gap: 6px;" },
                $h("span", { "class": "sw-tile-label" },
                  $t(t?.l)
                ),
                $h("span", { "class": "sw-tile-value", "style": `color: ${$t(t?.ink)};` },
                  $t(t?.v)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  $t(t?.s)
                )
              )
            ])
          ),
          $h("div", { "style": "padding: 36px 32px 14px; display: flex; align-items: baseline; justify-content: space-between;" },
            $h("h2", { "class": "sw-card-title", "style": "font-size: 20px;" },
              "Les 4 reprises"
            ),
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              "Triées par vues"
            )
          ),
          $h("div", { "style": "padding: 0 32px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px;" },
            ($l($v.reps)).map((v) => [
              $h("a", { "href": "/app/videos/learnwithjoel1", "style": "display: flex; flex-direction: column; gap: 10px; text-decoration: none; color: inherit;" },
                $h("span", { "class": "sw-video", "style": "display: block; border-radius: 20px;" },
                  $h("img", { "class": "sw-cover", "src": v?.src, "alt": "" }),
                  $h("span", { "class": "sw-video-shade" }),
                  $h("span", { "class": "sw-badge", "style": "position: absolute; top: 12px; left: 12px; height: 24px; font-size: 11px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                    $t(v?.when)
                  ),
                  $h("span", { "class": "sw-video-foot" },
                    $h("span", { "class": "sw-video-views", "style": "font-size: 26px;" },
                      $t(v?.v)
                    )
                  )
                ),
                $h("span", { "style": "display: flex; justify-content: space-between; font-size: 13px;" },
                  $h("span", { "style": "color: var(--ink-soft); font-weight: 600;" },
                    $t(v?.h)
                  ),
                  $h("span", { "style": "color: var(--ink-faint);" },
                    "Retain Cards"
                  )
                )
              )
            ])
          ),
          $h("div", { "style": "padding: 36px 32px 48px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;" },
            ($l($v.common)).map((c) => [
              $h("div", { "class": "sw-card", "style": "padding: 22px 24px; border-radius: 20px; display: flex; gap: 16px; align-items: flex-start;" },
                $h("span", { "style": "width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": c?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 700; letter-spacing: -0.01em;" },
                    $t(c?.t)
                  ),
                  $h("span", { "style": "font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
                    $t(c?.s)
                  )
                )
              )
            ])
          )
        )
      )
    ];
  }
}
