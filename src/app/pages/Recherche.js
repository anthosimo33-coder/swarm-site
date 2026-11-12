// Généré par scripts/dc2preact.py depuis design/app/RechercheB.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class Recherche extends DCLogic {
  renderVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "page"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const a = {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": "", "hl": "Astra", "rest": " AI", "s": "Études · 57,7 M vues en 30 j", "mk": [{"c": "ID"}, {"c": "US"}, {"c": "ES"}], "v30": "57,7 M", "acc": "269", "ppw": "1 360", "rev": "Entre 144 et 202 k€", "covs": [{"src": "/media/app/v-7700392351268752661.jpg", "v": "2,6 M"}, {"src": "/media/app/v-7697654738124442896.jpg", "v": "2,6 M"}, {"src": "/media/app/v-7702743575934684437.jpg", "v": "2,3 M"}]};
    const vids = [{"src": "/media/app/v-7700392351268752661.jpg", "v": "2,6 M", "h": "@ivylearns8"}, {"src": "/media/app/v-7697654738124442896.jpg", "v": "2,6 M", "h": "@ira.belajaryuk"}, {"src": "/media/app/v-7702743575934684437.jpg", "v": "2,3 M", "h": "@studywithruney"}, {"src": "/media/app/v-7705368869250075925.jpg", "v": "1,99 M", "h": "@belajarbersamaespi"}, {"src": "/media/app/v-7705929733220994337.jpg", "v": "1,87 M", "h": "@learnwithjoel1"}, {"src": "/media/app/v-7706010190566542612.jpg", "v": "809 k", "h": "@studywith_elsie"}];
    const crs = [{"av": "/media/app/av-learnwithjoel1.jpg", "noav": false, "h": "@learnwithjoel1", "s": "12,2 k abonnés · Espagne · 154× sa normale"}, {"av": "/media/app/av-remistudy.jpg", "noav": false, "h": "@remistudy", "s": "France · 7 k vues médianes · 6 vidéos en 7 j"}, {"av": "", "noav": true, "h": "@studywith_elsie", "s": "572 abonnés · 1 226× sa normale"}];
    const fms = [{"t": "« ‼️🚨GUARDA E PARTILHA🚨‼️ »", "s": "Accroche · 3 comptes · 17× la normale", "ico": "M5 6h14M12 6v13M9 19h6"}, {"t": "exam vibes", "s": "Son · 5 comptes · 7× la normale", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"}];
    const acts = [{"t": "Créer une alerte sur Astra AI", "ico": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "k": "A"}, {"t": "Ajouter Astra AI à un dossier", "ico": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "k": "D"}];
    const scopes = [{"l": "Tout", "on": "true"}, {"l": "Apps", "on": "false"}, {"l": "Formats", "on": "false"}, {"l": "Créateurs", "on": "false"}, {"l": "Vidéos", "on": "false"}];
    const bg = [{"src": "/media/app/v-7700392351268752661.jpg"}, {"src": "/media/app/v-7697654738124442896.jpg"}, {"src": "/media/app/v-7705441234847862037.jpg"}, {"src": "/media/app/v-7705024255746002182.jpg"}, {"src": "/media/app/v-7699151144400244000.jpg"}, {"src": "/media/app/v-7702625361716170002.jpg"}, {"src": "/media/app/v-7706018218397273362.jpg"}, {"src": "/media/app/v-7700803310495829266.jpg"}];
    return { nav, a, vids, crs, fms, acts, scopes, bg };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: relative; overflow: hidden; display: flex; flex-wrap: wrap; min-height: 960px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
                "Bonjour"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Ce qui monte sur TikTok en ce moment."
              )
            ),
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 400px; height: 48px; padding: 0 8px 0 16px; box-shadow: none;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "id": "qk3", "type": "search", "aria-label": "Chercher une app, un format, un compte", "placeholder": "Chercher une app, un format, un compte…", "style": "font-size: 15px;" }),
              $h("span", { "class": "sw-kbd" },
                "⌘ K"
              )
            )
          ),
          $h("div", { "style": "padding: 28px 32px; display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 12px;" },
            ($l($v.bg)).map((b) => [
              $h("span", { "class": "sw-video", "style": "display: block; border-radius: 16px;" },
                $h("img", { "class": "sw-cover", "src": b?.src, "alt": "" })
              )
            ])
          )
        ),
        $h("div", { "style": "position: absolute; inset: 0; z-index: 5; background: rgba(5,7,12,0.62); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);" },
          $h("section", { "role": "dialog", "aria-label": "Recherche", "style": "position: absolute; left: 50%; top: 64px; width: 1000px; margin-left: -456px; border-radius: 26px; background: var(--surface-raised); border: 1px solid var(--line-strong); box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 0 6px rgba(76,154,255,0.05); overflow: hidden; animation: sw-rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
            $h("div", { "style": "display: flex; align-items: center; gap: 14px; height: 64px; padding: 0 20px; border-bottom: 1px solid var(--line);" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent);" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("span", { "style": "flex: 1; font-size: 20px; font-weight: 500; color: var(--ink);" },
                "astra",
                $h("span", { "style": "display: inline-block; width: 2px; height: 22px; margin-left: 2px; vertical-align: -4px; background: var(--accent); animation: sw-pulse 1.1s steps(1) infinite;" })
              ),
              $h("span", { "class": "sw-kbd", "style": "height: 22px; min-width: 22px; padding: 0 6px; font-size: 11px;" },
                "Échap"
              )
            ),
            $h("div", { "style": "display: grid; grid-template-columns: 420px minmax(0, 1fr);" },
              $h("div", { "style": "border-right: 1px solid var(--line); padding-bottom: 10px;" },
                $h("span", { "style": "display: block; padding: 12px 20px 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
                  "App"
                ),
                $h("a", { "href": "/app/apps/astra-ai", "style": "display: flex; align-items: center; gap: 12px; margin: 0 8px; padding: 8px 12px; border-radius: 12px; text-decoration: none; color: inherit; background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent-edge);" },
                  $h("span", { "class": `sw-app-icon ${$t($v.a?.blank)}`, "style": "width: 34px; height: 34px; border-radius: 10px;" },
                    ($v.a?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": $v.a?.logo, "alt": "" })
                    ] : null,
                    ($v.a?.nologo) ? [
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 1px;" },
                    $h("span", { "style": "font-size: 15px; font-weight: 600;" },
                      $h("span", { "style": "color: var(--accent);" },
                        $t($v.a?.hl)
                      ),
                      $t($v.a?.rest)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t($v.a?.s)
                    )
                  ),
                  $h("span", { "style": "display: flex; gap: 4px;" },
                    ($l($v.a?.mk)).map((m) => [
                      $h("span", { "class": "sw-flag", "style": "width: 22px; height: 16px; font-size: 8px;" },
                        $t(m?.c)
                      )
                    ])
                  ),
                  $h("span", { "class": "sw-kbd", "style": "height: 22px; min-width: 22px; padding: 0 6px; font-size: 11px;" },
                    "↵"
                  )
                ),
                $h("span", { "style": "display: block; padding: 12px 20px 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
                  "Créateurs"
                ),
                ($l($v.crs)).map((c) => [
                  $h("a", { "href": "/app/createurs/zinedine-gsbb", "style": "display: flex; align-items: center; gap: 12px; margin: 0 8px; padding: 8px 12px; border-radius: 12px; text-decoration: none; color: inherit;" },
                    $h("span", { "style": "width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                      (c?.av) ? [
                        $h("img", { "src": c?.av, "alt": "", "style": "width: 100%; height: 100%; object-fit: cover; display: block;" })
                      ] : null,
                      (c?.noav) ? [
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                          $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                        )
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 1px;" },
                      $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                        $t(c?.h)
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t(c?.s)
                      )
                    )
                  )
                ]),
                $h("span", { "style": "display: block; padding: 12px 20px 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
                  "Formats"
                ),
                ($l($v.fms)).map((f) => [
                  $h("a", { "href": "/app/formats/ich-losche-das-in-2h", "style": "display: flex; align-items: center; gap: 12px; margin: 0 8px; padding: 8px 12px; border-radius: 12px; text-decoration: none; color: inherit;" },
                    $h("span", { "style": "width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--ink-soft);" },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;" },
                      $h("span", { "style": "font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t(f?.t)
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t(f?.s)
                      )
                    )
                  )
                ]),
                $h("span", { "style": "display: block; padding: 12px 20px 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
                  "Actions"
                ),
                ($l($v.acts)).map((x) => [
                  $h("a", { "href": "#", "style": "display: flex; align-items: center; gap: 12px; margin: 0 8px; padding: 8px 12px; border-radius: 12px; text-decoration: none; color: inherit;" },
                    $h("span", { "style": "width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--accent);" },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": x?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $h("span", { "style": "flex: 1; font-size: 14px; font-weight: 600;" },
                      $t(x?.t)
                    ),
                    $h("span", { "class": "sw-kbd", "style": "height: 22px; min-width: 22px; padding: 0 6px; font-size: 11px;" },
                      "⌘"
                    ),
                    $h("span", { "class": "sw-kbd", "style": "height: 22px; min-width: 22px; padding: 0 6px; font-size: 11px;" },
                      $t(x?.k)
                    )
                  )
                ])
              ),
              $h("div", { "style": "padding: 26px 28px; display: flex; flex-direction: column; gap: 18px; background: radial-gradient(80% 60% at 100% 0%, rgba(11,111,224,0.14), transparent);" },
                $h("div", { "style": "display: flex; align-items: center; gap: 16px;" },
                  $h("span", { "class": `sw-app-icon ${$t($v.a?.blank)}`, "style": "width: 64px; height: 64px; border-radius: 18px;" },
                    ($v.a?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": $v.a?.logo, "alt": "" })
                    ] : null,
                    ($v.a?.nologo) ? [
                      $h("svg", { "width": "32", "height": "32", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 4px;" },
                    $h("span", { "style": "font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.03em;" },
                      "Astra AI"
                    ),
                    $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-faint);" },
                      "Études ·",
                      ($l($v.a?.mk)).map((m) => [
                        $h("span", { "class": "sw-flag", "style": "width: 22px; height: 16px; font-size: 8px;" },
                          $t(m?.c)
                        )
                      ])
                    )
                  )
                ),
                $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                  $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                    $h("span", { "class": "sw-tile-label" },
                      "Vues en 30 j"
                    ),
                    $h("span", { "class": "sw-tile-value", "style": "font-size: 20px;" },
                      $t($v.a?.v30)
                    )
                  ),
                  $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                    $h("span", { "class": "sw-tile-label" },
                      "Comptes"
                    ),
                    $h("span", { "class": "sw-tile-value", "style": "font-size: 20px;" },
                      $t($v.a?.acc)
                    )
                  ),
                  $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                    $h("span", { "class": "sw-tile-label" },
                      "Revenus estimés"
                    ),
                    $h("span", { "class": "sw-tile-value", "style": "font-size: 15px; padding-top: 4px;" },
                      $t($v.a?.rev)
                    )
                  )
                ),
                $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px;" },
                  ($l($v.a?.covs)).map((v) => [
                    $h("span", { "class": "sw-video", "style": "display: block; border-radius: 14px;" },
                      $h("img", { "class": "sw-cover", "src": v?.src, "alt": "" }),
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "class": "sw-video-foot" },
                        $h("span", { "class": "sw-video-views", "style": "font-size: 17px;" },
                          $t(v?.v)
                        )
                      )
                    )
                  ])
                ),
                $h("div", { "style": "display: flex; justify-content: space-between; align-items: center;" },
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    $t($v.a?.ppw), " vidéos par semaine"
                  ),
                  $h("a", { "class": "sw-btn sw-btn-primary", "href": "/app/apps/astra-ai" },
                    "Ouvrir la fiche",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              )
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 18px; padding: 12px 20px; border-top: 1px solid var(--line); font-size: 12px; color: var(--ink-faint);" },
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                $h("span", { "class": "sw-kbd", "style": "height: 22px; min-width: 22px; padding: 0 6px; font-size: 11px;" },
                  "↑"
                ),
                $h("span", { "class": "sw-kbd", "style": "height: 22px; min-width: 22px; padding: 0 6px; font-size: 11px;" },
                  "↓"
                ),
                "naviguer"
              ),
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                $h("span", { "class": "sw-kbd", "style": "height: 22px; min-width: 22px; padding: 0 6px; font-size: 11px;" },
                  "↵"
                ),
                "ouvrir"
              ),
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                $h("span", { "class": "sw-kbd", "style": "height: 22px; min-width: 22px; padding: 0 6px; font-size: 11px;" },
                  "Tab"
                ),
                "changer de type"
              ),
              $h("span", { "style": "margin-left: auto;" },
                "13 résultats"
              )
            )
          )
        )
      )
    ];
  }
}
