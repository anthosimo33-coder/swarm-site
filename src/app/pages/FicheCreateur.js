// Généré par scripts/dc2preact.py depuis design/app/CreateurFicheA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class FicheCreateur extends DCLogic {
  renderVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "page"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const z = {"av": "/media/app/av-zinedine.gsbb.jpg", "noav": false, "h": "@zinedine.gsbb", "bio": "L'ia c'est 👇", "fans": "16 200", "med": "7 792", "p7": "3 vidéos en 7 j", "rev": "Entre 12 et 16 k€", "views": "4,7 M", "best": "2,85 M", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "hits": 4};
    const tiles = [{"l": "Abonnés", "v": "16 200", "s": "relevé le 12/11", "ink": "var(--ink)"}, {"l": "Vues médianes", "v": "7 792", "s": "sa normale", "ink": "var(--ink)"}, {"l": "Rythme", "v": "3 vidéos en 7 j", "s": "dernière il y a 2 j", "ink": "var(--ink)"}, {"l": "Meilleure vidéo", "v": "2,85 M", "s": "366× sa normale", "ink": "var(--accent)"}, {"l": "Revenus estimés, 30 j", "v": "Entre 12 et 16 k€", "s": "4,7 M vues sur ses 10 vidéos", "ink": "var(--ink)"}];
    const vids = [{"src": "/media/app/v-7706797723294420256.jpg", "v": "2 k", "raw": 2042.0, "x": "0,3×", "xr": 0.2620636550308008, "hit": false, "date": "11/11", "ago": "il y a 2 j", "t": "Job Alimentaire ❌ Vidéo YTB pour enfants ✅", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7706656919259319585.jpg", "v": "5 k", "raw": 4676.0, "x": "0,6×", "xr": 0.6001026694045175, "hit": false, "date": "10/11", "ago": "il y a 2 j", "t": "Il vit en 2098 😳", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7704799316795477280.jpg", "v": "2 k", "raw": 1635.0, "x": "0,2×", "xr": 0.2098305954825462, "hit": false, "date": "05/11", "ago": "il y a 7 j", "t": "Shortfy.io", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7703924847239269664.jpg", "v": "8 k", "raw": 8017.0, "x": "1×", "xr": 1.028875770020534, "hit": false, "date": "03/11", "ago": "il y a 9 j", "t": "Shortfy.io", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7702800263538560289.jpg", "v": "791 k", "raw": 791173.0, "x": "102×", "xr": 101.53657597535934, "hit": true, "date": "31/10", "ago": "il y a 12 j", "t": "Shortfy.io", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7702109191736986913.jpg", "v": "191 k", "raw": 190605.0, "x": "24×", "xr": 24.4616273100616, "hit": true, "date": "29/10", "ago": "il y a 14 j", "t": "Vous avez plus d’excuses, il vient d’expliquer comment faire en même p", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7701347136323013921.jpg", "v": "841 k", "raw": 841262.0, "x": "108×", "xr": 107.96483572895278, "hit": true, "date": "27/10", "ago": "il y a 16 j", "t": "J’ai enregistré pour vous, me remerciez pas 🤝 #Argent #shortfy #TikTok", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M", "raw": 2848785.0, "x": "366×", "xr": 365.6038244353183, "hit": true, "date": "24/10", "ago": "il y a 19 j", "t": "Pourquoi personne nous apprend ça à l’école? 😭 #Argent #shortfy #TikTo", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7699871031615360288.jpg", "v": "8 k", "raw": 7567.0, "x": "1×", "xr": 0.9711242299794661, "hit": false, "date": "23/10", "ago": "il y a 20 j", "t": "Shortfy.io", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7699388137767734561.jpg", "v": "7 k", "raw": 6941.0, "x": "0,9×", "xr": 0.8907854209445585, "hit": false, "date": "22/10", "ago": "il y a 22 j", "t": "c’est une dinguerie ce qu’il fait 🤯", "badge": "rgba(5,7,12,0.55)"}];
    return { nav, z, tiles, vids };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1600px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
            $h("a", { "class": "sw-link-quiet", "href": "/app/createurs" },
              "Créateurs"
            ),
            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("span", null,
              "France"
            ),
            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("span", { "style": "color: var(--ink-soft);" },
              "@zinedine.gsbb"
            )
          ),
          $h("section", { "class": "sw-card", "style": "margin: 18px 32px 0; padding: 32px 36px; border-radius: 28px; overflow: hidden; display: flex; align-items: center; gap: 28px; flex-wrap: wrap;" },
            $h("div", { "aria-hidden": "true", "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(50% 100% at 0% 50%, #000, transparent); mask-image: radial-gradient(50% 100% at 0% 50%, #000, transparent);" }),
            $h("span", { "style": "position: relative; padding: 4px; border-radius: 50%; background: conic-gradient(from 200deg, var(--blue-400), var(--blue-700), var(--blue-400));" },
              $h("span", { "style": "width: 112px; height: 112px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); box-shadow: 0 0 0 4px var(--surface-raised);" },
                ($v.z?.av) ? [
                  $h("img", { "src": $v.z?.av, "alt": "", "style": "width: 100%; height: 100%; object-fit: cover; display: block;" })
                ] : null,
                ($v.z?.noav) ? [
                  $h("svg", { "width": "56", "height": "56", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                    $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                  )
                ] : null
              )
            ),
            $h("div", { "style": "position: relative; flex: 1; min-width: 320px; display: flex; flex-direction: column; gap: 10px;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 42px; line-height: 1.05; font-weight: 700; letter-spacing: -0.045em;" },
                $t($v.z?.h)
              ),
              $h("span", { "style": "font-size: 16px; color: var(--ink-muted);" },
                $t($v.z?.bio)
              ),
              $h("span", { "style": "display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 4px;" },
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-soft);" },
                  $h("span", { "class": `sw-app-icon ${$t($v.z?.app?.blank)}`, "style": "width: 22px; height: 22px; border-radius: 7px;" },
                    ($v.z?.app?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": $v.z?.app?.logo, "alt": "" })
                    ] : null,
                    ($v.z?.app?.nologo) ? [
                      $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  "Pousse Shortfy"
                ),
                $h("span", { "class": "sw-badge", "style": "height: 26px;" },
                  "Side hustle"
                ),
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-soft);" },
                  $h("span", { "class": "sw-flag" },
                    "FR"
                  ),
                  "France"
                )
              )
            ),
            $h("div", { "style": "position: relative; display: flex; align-items: center; gap: 12px;" },
              $h("span", { "style": "display: flex; gap: 4px;" },
                $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Suivre ce compte" },
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
          $h("div", { "style": "margin: 28px 32px 0; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--line);" },
            $h("div", { "class": "sw-tabs sw-tabs-line", "role": "tablist", "aria-label": "Contenu", "style": "border-bottom: 0;" },
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "true" },
                "Vidéos · 10"
              ),
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "false" },
                "Formats repris"
              ),
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "false" },
                "Apps poussées · 1"
              )
            ),
            $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Tri", "style": "margin-bottom: 10px;" },
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "true", "style": "height: 30px;" },
                "Récentes"
              ),
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "style": "height: 30px;" },
                "Les plus vues"
              )
            )
          ),
          $h("div", { "style": "margin: 16px 32px 0; padding: 14px 18px; border-radius: 16px; display: flex; align-items: center; gap: 14px; background: linear-gradient(90deg, var(--accent-soft), transparent 70%); border: 1px solid var(--accent-edge);" },
            $h("span", { "style": "width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--blue-600); color: #FFFFFF;" },
              $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "font-size: 14px; color: var(--ink-soft);" },
              $h("span", { "style": "font-weight: 700; color: var(--ink);" },
                "4 vidéos sur 10 à plus de 10× sa normale,"
              ),
              " toutes publiées entre le 24/10 et le 31/10. Depuis, aucune n’a dépassé 2×."
            )
          ),
          $h("div", { "style": "padding: 16px 32px 48px; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px;" },
            ($l($v.vids)).map((v) => [
              $h("a", { "href": "/app/videos/learnwithjoel1", "style": "display: flex; flex-direction: column; gap: 10px; text-decoration: none; color: inherit; min-width: 0;" },
                $h("span", { "class": "sw-video", "style": "display: block; border-radius: 18px;" },
                  $h("img", { "class": "sw-cover", "src": v?.src, "alt": "" }),
                  $h("span", { "class": "sw-video-shade" }),
                  $h("span", { "class": "sw-badge", "style": `position: absolute; top: 10px; left: 10px; height: 24px; font-size: 11px; background: ${$t(v?.badge)}; color: #FFFFFF;` },
                    $t(v?.x), " sa normale"
                  ),
                  $h("span", { "class": "sw-video-foot" },
                    $h("span", { "class": "sw-video-views", "style": "font-size: 22px;" },
                      $t(v?.v)
                    ),
                    $h("span", { "style": "font-size: 11px; color: #E4E7EC;" },
                      $t(v?.date)
                    )
                  )
                ),
                $h("span", { "style": "font-size: 13px; line-height: 1.4; color: var(--ink-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" },
                  $t(v?.t)
                )
              )
            ])
          )
        )
      )
    ];
  }
}
