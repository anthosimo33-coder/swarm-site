// Généré par scripts/dc2preact.py depuis design/app/AppsA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class Apps extends DCLogic {
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
      .map((x, i) => ({ d: ic[x[0]], label: x[1], cur: i === 1 ? 'page' : 'false' }));
    const T = ['t-plum', 't-navy', 't-pine', 't-violet', 't-umber', 't-amber'];
    const A = [
      ['Rizz App', 'R', 'var(--thumb-plum)', 'Séduction IA', ['US'], 82, 332, 59.67, [0.6, 10.8, 0.5, 16.1, 23.7, 14.1], '120×', ['2,6 M', '2,5 M', '1,9 M']],
      ['Astra AI', 'A', 'var(--blue-600)', 'Études', ['ID', 'US', 'ES'], 269, 1360, 57.66, [10.6, 9.8, 8.9, 8.5, 17.3, 18.4], '2 333×', ['2,6 M', '2,6 M', '2,3 M']],
      ['Knowunity', 'K', 'var(--thumb-navy)', 'Études', ['US', 'ES', 'FR'], 55, 205, 44.43, [4.2, 0.6, 14.6, 16.8, 7.0, 6.1], '101×', ['5,7 M', '3,5 M', '2,5 M']],
      ['Love8', 'L', 'var(--thumb-pine)', 'Couple', ['US', 'ID', 'FR'], 83, 282, 35.06, [1.7, 3.4, 7.1, 4.0, 10.6, 12.6], '1 737×', ['2 M', '1,9 M', '1,8 M']],
      ['WRizz', 'W', 'var(--thumb-violet)', 'Séduction IA', ['US', 'ID'], 81, 410, 31.94, [0.4, 2.5, 0.6, 8.0, 10.1, 12.4], '110×', ['5 M', '3 M', '1,9 M']],
      ['Wing AI', 'W', 'var(--thumb-umber)', 'Séduction IA', ['US', 'MX'], 124, 251, 19.62, [0.7, 1.9, 1.6, 2.4, 7.0, 6.9], '109×', ['1,4 M', '876 k', '869 k']],
      ['Cal AI', 'C', 'var(--thumb-amber)', 'Santé et physique', ['US'], 6, 42, 17.13, [0.01, 0.01, 0.3, 7.8, 5.4, 3.7], '9,5×', ['1,3 M', '878 k', '757 k']],
      ['Praktika', 'P', 'var(--thumb-navy)', 'Langues', ['US', 'ID', 'BR'], 92, 577, 16.58, [5.9, 0.4, 0.4, 0.5, 7.7, 8.0], '70×', ['2,1 M', '1,9 M', '1,5 M']],
      ['RecentFollow', 'R', 'var(--thumb-plum)', 'Jalousie et ex', ['US', 'MX'], 39, 294, 13.06, [0.01, 0.01, 0.7, 1.1, 4.2, 7.0], '750×', ['1,2 M', '874 k', '854 k']],
      ['The Cringe', 'T', 'var(--thumb-pine)', 'Jalousie et ex', ['US', 'FR'], 18, 49, 12.18, [0.1, 0.01, 0.8, 2.9, 5.0, 3.4], '53×', ['2,5 M', '1,1 M', '1,1 M']]
    ];
    const COV = {"Rizz App": ["/media/app/v-7702250997850098958.jpg", "/media/app/v-7700724672438045965.jpg", "/media/app/v-7702290769213672718.jpg"], "Astra AI": ["/media/app/v-7700392351268752661.jpg", "/media/app/v-7697654738124442896.jpg", "/media/app/v-7702743575934684437.jpg"], "Knowunity": ["/media/app/v-7699151144400244000.jpg", "/media/app/v-7702625361716170002.jpg", "/media/app/v-7698010148391947552.jpg"], "Love8": ["/media/app/v-7705441234847862037.jpg", "/media/app/v-7705024255746002182.jpg", "/media/app/v-7701914062296337685.jpg"], "WRizz": ["/media/app/v-7706018218397273362.jpg", "/media/app/v-7700803310495829266.jpg", "/media/app/v-7701533350825037063.jpg"], "Wing AI": ["/media/app/v-7703242451120688405.jpg", "/media/app/v-7701632447951211798.jpg", "/media/app/v-7705479809580715284.jpg"], "Cal AI": ["/media/app/v-7701127438704577823.jpg", "/media/app/v-7702142316479384853.jpg", "/media/app/v-7706561664451136788.jpg"], "Praktika": ["/media/app/v-7704867469072141588.jpg", "/media/app/v-7704226978622082324.jpg", "/media/app/v-7703758186087566612.jpg"], "RecentFollow": ["/media/app/v-7705376808862076182.jpg", "/media/app/v-7706834426096815382.jpg", "/media/app/v-7700279402319367425.jpg"], "The Cringe": ["/media/app/v-7703301496879861014.jpg", "/media/app/v-7705159889147923734.jpg", "/media/app/v-7701454363897629974.jpg"]};
    const LOGO = {"Astra AI": "/media/app/app-astra-ai.jpg", "Knowunity": "/media/app/app-knowunity.jpg", "Love8": "/media/app/app-love8.jpg", "WRizz": "/media/app/app-wrizz.jpg", "Wing AI": "/media/app/app-wing-ai.jpg", "Cal AI": "/media/app/app-cal-ai.jpg", "Praktika": "/media/app/app-praktika.jpg", "The Cringe": "/media/app/app-the-cringe.jpg"};
    const fr = (x, d) => x.toFixed(d).replace('.', ',');
    const rows = A.map((a, i) => {
      const w = a[8];
      const max = Math.max.apply(null, w);
      const pts = w.map((v, j) => [2 + j * 25.2, 36 - (v / max) * 30]);
      const line = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
      const d = (w[5] - w[4]) / w[4];
      const up = d >= 0;
      return {
        rank: String(i + 1).padStart(2, '0'), n: a[0], i: a[1], c: a[2], niche: a[3], mk: a[4].map((c) => ({ c })),
        acc: a[5], ppw: a[6].toLocaleString('fr-FR'), v30: fr(a[7], 1) + ' M',
        delta: (up ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' % cette semaine', dInk: up ? 'var(--accent)' : 'var(--ink-faint)',
        line, area: line + ' L127.9 40 L2 40 Z', endY: pts[5][1].toFixed(1),
        stroke: up ? '#4C9AFF' : '#8A93A3', fill: up ? 'rgba(76,154,255,0.16)' : 'rgba(138,147,163,0.12)',
        revLo: Math.round(a[7] * 2.5), revHi: Math.round(a[7] * 3.5),
        best: a[9], thumbs: a[10].map((v, j) => ({ v, t: T[(i + j) % T.length], src: COV[a[0]][j] })), logo: LOGO[a[0]] || false, nologo: !LOGO[a[0]], blank: LOGO[a[0]] ? '' : 'sw-app-blank',
        bg: i === 1 ? 'var(--accent-soft)' : 'transparent'
      };
    });
    return {
      nav,
      rows,
      filters: [{ k: 'Marché', v: 'Tous' }, { k: 'Niche', v: 'Toutes' }, { k: 'Plateforme', v: 'Toutes' }]
    };
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
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; background: var(--surface);" },
          $h("header", { "style": "display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; padding: 32px 32px 0;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 40px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em;" },
                "Apps"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Les apps que les réseaux de créateurs poussent en ce moment, classées par vues."
              )
            ),
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 400px; height: 48px; padding: 0 8px 0 16px; box-shadow: none;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "id": "qa", "type": "search", "aria-label": "Chercher une app", "placeholder": "Chercher une app…", "style": "font-size: 15px;" }),
              $h("span", { "class": "sw-kbd" },
                "⌘ K"
              )
            )
          ),
          $h("div", { "style": "margin: 24px 32px 0; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; border-bottom: 1px solid var(--line);" },
            $h("div", { "class": "sw-tabs sw-tabs-line", "role": "tablist", "aria-label": "Classement", "style": "border-bottom: 0;" },
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "true" },
                "Les plus vues"
              ),
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "false" },
                "Qui accélèrent"
              ),
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "false" },
                "Nouvelles"
              )
            ),
            $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Période", "style": "margin-bottom: 10px;" },
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "style": "height: 30px;" },
                "7 jours"
              ),
              $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "true", "style": "height: 30px;" },
                "30 jours"
              )
            )
          ),
          $h("div", { "style": "padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
            $h("div", { "style": "display: flex; gap: 8px; flex-wrap: wrap;" },
              ($l($v.filters)).map((f) => [
                $h("button", { "class": "sw-pill", "type": "button", "aria-haspopup": "listbox", "style": "height: 40px; padding: 0 12px 0 14px; gap: 6px; background: var(--track); border-color: var(--line);" },
                  $h("span", { "style": "color: var(--ink-faint);" },
                    $t(f?.k)
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t(f?.v)
                  ),
                  $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ])
            ),
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              "Trier par ",
              $h("span", { "style": "color: var(--ink); font-weight: 600;" },
                "vues 30 j"
              )
            )
          ),
          $h("div", { "style": "margin: 0 32px; overflow-x: auto; border: 1px solid var(--line); border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom));" },
            $h("table", { "class": "sw-table", "style": "table-layout: fixed; min-width: 1180px;" },
              $h("thead", null,
                $h("tr", null,
                  $h("th", { "style": "width: 44px; padding-left: 20px;" },
                    "#"
                  ),
                  $h("th", { "style": "width: 250px;" },
                    "App"
                  ),
                  $h("th", { "style": "width: 120px;" },
                    "Réseau"
                  ),
                  $h("th", { "class": "sw-num", "style": "width: 120px;" },
                    "Vues 30 j"
                  ),
                  $h("th", { "style": "width: 140px;" },
                    "6 semaines"
                  ),
                  $h("th", { "class": "sw-num", "style": "width: 172px;" },
                    "Revenus estimés"
                  ),
                  $h("th", { "class": "sw-num", "style": "width: 100px;" },
                    "Meilleure"
                  ),
                  $h("th", { "style": "width: 156px; padding-right: 20px;" },
                    "Ses vidéos"
                  )
                )
              ),
              $h("tbody", null,
                ($l($v.rows)).map((r) => [
                  $h("tr", { "style": `background: ${$t(r?.bg)};` },
                    $h("td", { "style": "padding-left: 20px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                      $t(r?.rank)
                    ),
                    $h("td", null,
                      $h("a", { "href": "/app/apps/astra-ai", "class": "sw-app", "style": "text-decoration: none;" },
                        $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 40px; height: 40px; border-radius: 12px;" },
                          (r?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": r?.logo, "alt": "" })
                          ] : null,
                          (r?.nologo) ? [
                            $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 4px; min-width: 0;" },
                          $h("span", { "class": "sw-app-name", "style": "font-size: 15px;" },
                            $t(r?.n)
                          ),
                          $h("span", { "style": "display: flex; align-items: center; gap: 6px;" },
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                              $t(r?.niche)
                            ),
                            ($l(r?.mk)).map((m) => [
                              $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                                $t(m?.c)
                              )
                            ])
                          )
                        )
                      )
                    ),
                    $h("td", null,
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                        $h("span", { "style": "font-size: 14px; font-weight: 600; color: var(--ink);" },
                          $t(r?.acc), " comptes"
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                          $t(r?.ppw), " vidéos / sem."
                        )
                      )
                    ),
                    $h("td", { "class": "sw-num" },
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 4px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink);" },
                          $t(r?.v30)
                        ),
                        $h("span", { "style": `font-size: 11px; font-weight: 600; color: ${$t(r?.dInk)};` },
                          $t(r?.delta)
                        )
                      )
                    ),
                    $h("td", null,
                      $h("svg", { "width": "130", "height": "40", "viewBox": "0 0 130 40", "aria-hidden": "true", "style": "display: block;" },
                        $h("path", { "d": r?.area, "fill": r?.fill }),
                        $h("path", { "d": r?.line, "fill": "none", "stroke": r?.stroke, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                        $h("circle", { "cx": "128", "cy": r?.endY, "r": "3", "fill": r?.stroke })
                      )
                    ),
                    $h("td", { "class": "sw-num" },
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 2px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); white-space: nowrap;" },
                          $h("span", { "style": "font-size: 12px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                            "Entre "
                          ),
                          $t(r?.revLo),
                          $h("span", { "style": "font-size: 12px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                            " et "
                          ),
                          $t(r?.revHi), " k€"
                        ),
                        $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                          "sur 30 jours"
                        )
                      )
                    ),
                    $h("td", { "class": "sw-num" },
                      $h("span", { "class": "sw-badge sw-badge-accent" },
                        $t(r?.best)
                      )
                    ),
                    $h("td", { "style": "padding-right: 20px;" },
                      $h("span", { "style": "display: flex; gap: 6px;" },
                        ($l(r?.thumbs)).map((t) => [
                          $h("span", { "class": `sw-video ${$t(t?.t)}`, "style": "width: 44px; border-radius: 8px;" },
                            $h("img", { "class": "sw-cover", "src": t?.src, "alt": "" }),
                            $h("span", { "class": "sw-video-shade" }),
                            $h("span", { "style": "position: absolute; left: 4px; bottom: 4px; font-size: 9px; font-weight: 700; color: #FFFFFF;" },
                              $t(t?.v)
                            )
                          )
                        ])
                      )
                    )
                  )
                ])
              )
            )
          ),
          $h("footer", { "style": "margin-top: auto; padding: 28px 32px 32px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;" },
            $h("p", { "class": "sw-calc", "style": "margin: 0;" },
              "Vues des vidéos publiées par les comptes de l'app, relevées le 12/11."
            ),
            $h("p", { "class": "sw-calc", "style": "margin: 0;" },
              "Meilleure = sa meilleure vidéo de la semaine face à la normale de son compte."
            )
          )
        )
      )
    ];
  }
}
