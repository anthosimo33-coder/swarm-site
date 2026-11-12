// Généré par scripts/dc2preact.py depuis design/app/Main.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class Accueil extends DCLogic {
  renderVals() {
    const ic = {
      accueil: 'M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      formats: 'M4 5h16v14H4zM10 9l5 3-5 3z',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      alertes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0',
      dossiers: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
    };
    const nav = [['accueil', 'Accueil'], ['apps', 'Apps'], ['formats', 'Formats'], ['createurs', 'Créateurs'], ['alertes', 'Alertes'], ['dossiers', 'Dossiers']]
      .map((x, i) => ({ d: ic[x[0]], label: x[1], cur: i === 0 ? 'page' : 'false' }));
    const look = [
      { logo: '/media/app/app-luv-or-pop.jpg', ini: 'L', name: 'Luv or Pop', sub: 'Vidéo à 7,5 M vues', v: 'H+26', bg: 'var(--thumb-plum)' },
      { logo: '/media/app/app-dj-kartier.jpg', ini: 'D', name: 'DJ Kartier', sub: 'Vidéo à 5,5 M vues', v: 'H+43', bg: 'var(--thumb-navy)' },
      { logo: '/media/app/app-astra-ai.jpg', ini: 'A', name: 'Astra AI', sub: 'Une vidéo face à sa normale', v: '2 333×', bg: 'var(--blue-600)' },
      { logo: '/media/app/app-love8.jpg', ini: 'L', name: 'Love8', sub: 'Comptes en une recherche', v: '+69', bg: 'var(--thumb-pine)' }
    ].map((r, i, a) => Object.assign(r, { sep: i === a.length - 1 ? 'transparent' : 'var(--line)' }));
    return {
      nav,
      look,
      niches: [{ label: 'Études' }, { label: 'Couple' }, { label: 'Séduction IA' }, { label: 'Foi' }, { label: 'Side hustle' }]
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1120px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("nav", { "class": "sw-sidebar", "aria-label": "Navigation principale" },
          $h("a", { "class": "sw-side-logo", "href": "#", "aria-label": "Swarm, accueil" },
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
            $h("a", { "class": "sw-side-item", "href": "#", "aria-current": n?.cur },
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
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; position: relative; overflow: hidden; display: flex; flex-direction: column; background: var(--surface);" },
          $h("div", { "aria-hidden": "true", "style": "position: absolute; inset: 0; pointer-events: none;" },
            $h("div", { "style": "position: absolute; left: calc(50% - 560px); top: -300px; width: 1120px; height: 780px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.30), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
            $h("div", { "class": "sw-grid-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(44% 38% at 50% 30%, #000, transparent); mask-image: radial-gradient(44% 38% at 50% 30%, #000, transparent);" })
          ),
          $h("div", { "style": "position: relative; display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap; gap: 8px; padding: 20px 32px;" },
            $h("span", { "class": "sw-badge", "style": "height: 34px; padding: 0 14px; gap: 8px; background: var(--glass-fill); box-shadow: inset 0 0 0 1px var(--glass-edge); color: var(--ink-soft);" },
              $h("span", { "class": "sw-dot" }),
              "Radar en ligne · relevé à 15:57"
            ),
            $h("a", { "class": "sw-more", "href": "#", "style": "gap: 8px; padding: 0 8px; font-size: 14px;" },
              $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-3-6-3-6-1s3 1 6 1zM12 7c2-3 6-3 6-1s-3 1-6 1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Inviter un ami"
            )
          ),
          $h("section", { "style": "position: relative; width: 100%; max-width: 940px; margin: 0 auto; padding: 48px 24px 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; text-align: center;" },
            $h("span", { "class": "sw-app-tile sw-enter", "style": "width: 64px; height: 64px; border-radius: 18px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 0 0 10px rgba(76,154,255,0.08), 0 18px 44px rgba(11,111,224,0.50);" },
              $h("svg", { "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 38px; height: 38px;" },
                $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" })
              )
            ),
            $h("h1", { "class": "sw-enter", "style": "margin: 28px 0 0; font-family: var(--font-display); font-size: 64px; line-height: 1.03; font-weight: 700; letter-spacing: -0.05em; color: var(--ink); animation-delay: 0.1s;" },
              "Bon retour, Anthony."
            ),
            $h("p", { "class": "sw-enter", "style": "margin: 14px 0 0; font-size: 19px; line-height: 1.55; color: var(--ink-muted); animation-delay: 0.2s;" },
              "Ce qui explose sur TikTok en ce moment, app par app, marché par marché."
            ),
            $h("div", { "role": "search", "class": "sw-search sw-enter", "style": "margin-top: 40px; width: 100%; height: 72px; padding: 0 10px 0 26px; box-sizing: border-box; box-shadow: var(--shadow-float), 0 0 0 8px rgba(76,154,255,0.07); animation-delay: 0.3s;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "id": "q", "type": "search", "aria-label": "Chercher une app, un format ou un créateur", "placeholder": "Cherche une app, un format, un créateur…", "style": "font-size: 18px;" }),
              $h("span", { "class": "sw-kbd" },
                "⌘ K"
              ),
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Chercher avec une capture d'écran" },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("button", { "class": "sw-search-market", "type": "button", "aria-haspopup": "listbox", "style": "height: 52px; padding: 0 16px 0 12px;" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Tous les marchés",
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("div", { "class": "sw-enter", "style": "margin-top: 22px; display: flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 16px; font-size: 15px; color: var(--ink-muted); animation-delay: 0.4s;" },
              $h("span", null,
                "Aucune app consultée récemment."
              ),
              $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 20px; background: var(--line);" }),
              $h("a", { "class": "sw-more", "href": "#", "style": "gap: 8px; font-size: 15px;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Historique"
              )
            ),
            $h("div", { "class": "sw-enter", "style": "margin-top: 28px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; animation-delay: 0.5s;" },
              $h("span", { "style": "font-size: 14px; color: var(--ink-faint); padding-right: 4px;" },
                "Ça explose cette semaine :"
              ),
              ($l($v.niches)).map((t) => [
                $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": "false" },
                  $t(t?.label)
                )
              ])
            )
          ),
          $h("section", { "aria-label": "Raccourcis", "style": "position: relative; margin-top: auto; padding: 64px 0 48px 32px;" },
            $h("div", { "style": "display: flex; gap: 16px; overflow: hidden; padding: 4px 0 24px; -webkit-mask-image: linear-gradient(to right, #000 84%, transparent 100%); mask-image: linear-gradient(to right, #000 84%, transparent 100%);" },
              $h("article", { "class": "sw-card", "style": "flex: 0 0 300px; height: 340px; box-sizing: border-box; padding: 10px; display: flex; flex-direction: column;" },
                $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 20px; text-align: center;" },
                  $h("span", { "class": "sw-empty-radar", "aria-hidden": "true", "style": "width: 72px; height: 72px;" }),
                  $h("p", { "style": "margin: 0; max-width: 220px; font-size: 14px; line-height: 1.55; color: var(--ink-muted);" },
                    "Suis une app et vois chaque nouvelle vidéo, chaque pic de vues, le jour même."
                  ),
                  $h("a", { "class": "sw-btn sw-btn-primary sw-btn-sm", "href": "/app/apps" },
                    "Parcourir les apps",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                ),
                $h("div", { "style": "height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px;" },
                  $h("span", { "class": "sw-eyebrow", "style": "font-size: 12px; letter-spacing: 0.08em;" },
                    "Activité"
                  )
                )
              ),
              $h("article", { "class": "sw-card", "style": "flex: 0 0 300px; height: 340px; box-sizing: border-box; padding: 10px; display: flex; flex-direction: column;" },
                $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track); display: flex; flex-direction: column; padding: 14px;" },
                  $h("div", { "class": "sw-tabs", "role": "tablist", "style": "align-self: flex-start; padding: 3px;" },
                    $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "true", "style": "height: 28px; font-size: 13px;" },
                      "Récents"
                    ),
                    $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "style": "height: 28px; font-size: 13px;" },
                      "Activité"
                    )
                  ),
                  $h("div", { "style": "flex: 1 1 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center;" },
                    $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                      $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                      "Aucun dossier pour l'instant"
                    )
                  )
                ),
                $h("div", { "style": "height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px;" },
                  $h("span", { "class": "sw-eyebrow", "style": "font-size: 12px; letter-spacing: 0.08em;" },
                    "Dossiers"
                  ),
                  $h("a", { "class": "sw-more", "href": "#" },
                    "Tout voir",
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ),
              $h("article", { "class": "sw-card", "style": "flex: 0 0 300px; height: 340px; box-sizing: border-box; padding: 10px; display: flex; flex-direction: column;" },
                $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track); padding: 8px 14px; display: flex; flex-direction: column;" },
                  ($l($v.look)).map((r) => [
                    $h("a", { "href": "#", "style": `height: 60px; display: flex; align-items: center; gap: 12px; text-decoration: none; border-bottom: 1px solid ${$t(r?.sep)};` },
                      $h("span", { "class": "sw-app-icon", "style": "width: 30px; height: 30px; border-radius: 9px;" },
                        $h("img", { "class": "sw-logo-img", "src": r?.logo, "alt": "" })
                      ),
                      $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column;" },
                        $h("span", { "class": "sw-app-name" },
                          $t(r?.name)
                        ),
                        $h("span", { "class": "sw-app-sub" },
                          $t(r?.sub)
                        )
                      ),
                      $h("span", { "style": "font-family: var(--font-mono); font-size: 13px; color: var(--ink); font-variant-numeric: tabular-nums;" },
                        $t(r?.v)
                      )
                    )
                  ])
                ),
                $h("div", { "style": "height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px;" },
                  $h("span", { "class": "sw-eyebrow", "style": "font-size: 12px; letter-spacing: 0.08em;" },
                    "Ça explose"
                  ),
                  $h("a", { "class": "sw-more", "href": "#" },
                    "Tout voir",
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ),
              $h("article", { "class": "sw-card", "style": "flex: 0 0 300px; height: 340px; box-sizing: border-box; padding: 10px; display: flex; flex-direction: column;" },
                $h("div", { "style": "position: relative; flex: 1 1 auto; border-radius: 16px; overflow: hidden; background: radial-gradient(60% 40% at 25% 80%, rgba(255,255,255,0.55), transparent 70%), radial-gradient(50% 35% at 85% 30%, rgba(255,255,255,0.45), transparent 70%), linear-gradient(180deg, #4C9AFF 0%, #8DC0FF 55%, #DCEDFF 100%); display: flex; align-items: center; justify-content: center;" },
                  $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Masquer cette carte", "style": "position: absolute; top: 10px; right: 10px; width: 36px; height: 36px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                    )
                  ),
                  $h("div", { "class": "sw-video", "style": "width: 118px; border-radius: 16px; box-shadow: 0 20px 40px rgba(5,7,12,0.35); animation: sw-float 6s ease-in-out infinite;" },
                    $h("img", { "class": "sw-cover", "src": "/media/app/v-7705368869250075925.jpg", "alt": "" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-video-app", "style": "font-size: 10px;" },
                      $h("i", { "style": "overflow: hidden;" },
                        $h("img", { "class": "sw-logo-img", "src": "/media/app/app-astra-ai.jpg", "alt": "" })
                      ),
                      "Astra AI"
                    ),
                    $h("div", { "class": "sw-video-foot" },
                      $h("span", { "class": "sw-video-views", "style": "font-size: 16px;" },
                        "2,0 M"
                      )
                    )
                  ),
                  $h("div", { "class": "sw-toast", "style": "position: absolute; left: 14px; right: 14px; bottom: 14px; padding: 8px 12px 8px 8px; gap: 10px; animation: sw-float 7s ease-in-out infinite; animation-delay: -2s;" },
                    $h("span", { "class": "sw-toast-ico", "style": "width: 26px; height: 26px;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $h("span", { "style": "min-width: 0;" },
                      $h("span", { "class": "sw-toast-kicker" },
                        "Alerte · Astra AI"
                      ),
                      $h("span", { "class": "sw-toast-text", "style": "font-size: 12px;" },
                        "Une vidéo à 2 333× sa normale"
                      )
                    )
                  )
                ),
                $h("div", { "style": "height: 52px; display: flex; align-items: center; padding: 0 12px;" },
                  $h("span", { "style": "font-size: 15px; font-weight: 600; color: var(--ink);" },
                    "Ne rate plus une vidéo qui décolle"
                  )
                )
              ),
              $h("article", { "class": "sw-card", "style": "flex: 0 0 300px; height: 340px; box-sizing: border-box; padding: 10px; display: flex; flex-direction: column;" },
                $h("div", { "style": "position: relative; flex: 1 1 auto; border-radius: 16px; overflow: hidden; background: var(--track); box-shadow: inset 0 0 0 1px var(--line-strong); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;" },
                  $h("a", { "href": "#", "aria-label": "Lire la vidéo de prise en main", "style": "width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.35); display: inline-flex; align-items: center; justify-content: center; color: #FFFFFF;" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 12 12", "aria-hidden": "true" },
                      $h("path", { "d": "M4 2.5v7l5.5-3.5z", "fill": "currentColor" })
                    )
                  ),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    "[Vidéo de prise en main à tourner]"
                  )
                ),
                $h("div", { "style": "height: 52px; display: flex; align-items: center; padding: 0 12px;" },
                  $h("span", { "style": "font-size: 15px; font-weight: 600; color: var(--ink);" },
                    "Lire un signal en 2 minutes"
                  )
                )
              )
            ),
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Voir les cartes suivantes", "style": "position: absolute; right: 32px; top: calc(50% - 8px); width: 52px; height: 52px; background: var(--surface-raised); border: 1px solid var(--line); color: var(--ink); box-shadow: var(--shadow-float);" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          )
        )
      )
    ];
  }
}
