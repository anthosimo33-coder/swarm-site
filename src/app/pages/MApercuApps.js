// Généré par scripts/dc2preact.py depuis design/app/MApercuApps.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';

export default class MApercuApps extends DCLogic {
  componentDidMount() {
    this.timer = setInterval(() => this.setState({ now: Date.now() }), 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  renderVals() {
    // L'aperçu mobile (19/11) : même contenu que ApercuA (top 3 envoyé par convex/boards.ts, reste en formes vides).
    const p = this.props || {};
    const st = this.state || {};
    const d = p.data || { total: 516, apps: [
      { slug: 'higgsfield', name: 'Higgsfield', niche: 'Création de contenu', views30: 120100000, weekDelta: 0.1, accounts: 190, videosPerWeek: 1030, markets: [['US', 33]], top: [] },
      { slug: 'rizzapp', name: 'Rizz App', niche: 'Séduction IA', views30: 51300000, weekDelta: -0.6, accounts: 114, videosPerWeek: 165, markets: [['US', 50]], top: [] },
      { slug: 'knowunity', name: 'Knowunity', niche: 'Études', views30: 49600000, weekDelta: -0.39, accounts: 41, videosPerWeek: 101, markets: [['ES', 33]], top: [] }
    ] };
    const u = p.user;
    const me = { initiale: (Array.from(String((u && (u.initiale || u.prenom || u.email)) || '?'))[0] || '?').toUpperCase() };
    const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
    const int = (n) => String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
    const apps = (d.apps || []).slice(0, 3);
    const top = apps.map((a, i) => {
      const t = (a.top || []).find((v) => v && v.cover);
      const m = (a.markets || [])[0];
      const delta = typeof a.weekDelta === 'number' ? (a.weekDelta >= 0 ? '+' : '−') + Math.round(Math.abs(a.weekDelta) * 100) + ' %' : '';
      return {
        rank: String(i + 1).padStart(2, '0'), name: a.name, niche: a.niche || '', icon: a.icon || '', cover: t ? t.cover : '',
        href: '/app/apps/' + a.slug, aria: 'N°' + (i + 1) + ' : ' + a.name,
        views: nf(a.views30 || 0), delta, deltaInk: typeof a.weekDelta === 'number' && a.weekDelta > 0 ? 'var(--accent)' : 'var(--ink-faint)',
        meta: int(a.accounts) + ' comptes · ' + int(a.videosPerWeek) + ' vidéos / sem.' + (m ? ' · ' + m[0] + ' ' + Math.round(m[1]) + ' %' : '')
      };
    });
    const total = typeof d.total === 'number' ? d.total : apps.length;
    const ghosts = [0.5, 0.36, 0.24, 0.14, 0.07].map((op, i) => ({
      rank: String(i + 4).padStart(2, '0'), op: String(op), blur: (3 + i) + 'px', w: [120, 96, 140, 110, 88][i] + 'px',
      tile: ['var(--thumb-plum)', 'var(--thumb-pine)', 'var(--thumb-violet)', 'var(--thumb-amber)', 'var(--thumb-navy)'][i]
    }));
    const bfLeft = Math.max(0, Date.parse('2026-12-01T00:00:00+01:00') - (st.now || Date.now()));
    const bf2 = (n) => String(n).padStart(2, '0');
    const bfTime = Math.floor(bfLeft / 864e5) + 'j ' + bf2(Math.floor(bfLeft / 36e5) % 24) + ':' + bf2(Math.floor(bfLeft / 6e4) % 60) + ':' + bf2(Math.floor(bfLeft / 1e3) % 60);
    // Accueil n’y est pas : sans abonnement, il mène à cet écran (src/app/main.js).
    const locked = [['Formats', '/app/formats'], ['Créateurs', '/app/createurs'], ['Alertes', '/app/alertes'], ['Dossiers', '/app/dossiers']].map((x) => ({ label: x[0], href: x[1] }));
    const checkout = p.checkout || {};
    return {
      me, top, ghosts, locked,
      totalTxt: int(total), moreTxt: int(Math.max(0, total - apps.length)),
      bfOn: bfLeft > 0, bfTime,
      monthly: checkout.mensuel || '/tarifs',
      openPlans: (e) => { if (e && e.preventDefault) e.preventDefault(); if (p.onPlans) p.onPlans(); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        ($v.bfOn) ? [
          $h("button", { "class": "mapr-bf", "type": "button", "onClick": $v.openPlans, "aria-label": `Black Friday : −50 % sur l’annuel, fin dans ${$t($v.bfTime)}`, "style": "display: flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 12px; background: #0B0E14; border-bottom: 1px solid rgba(255,255,255,0.07); color: #C9CED8; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden;" },
            $h("svg", { "width": "14", "height": "16", "viewBox": "0 0 20 23", "aria-hidden": "true", "style": "flex-shrink: 0;" },
              $h("defs", null,
                $h("linearGradient", { "id": "maprFlame", "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                  $h("stop", { "offset": "0", "stop-color": "#FFD08A" }),
                  $h("stop", { "offset": "0.5", "stop-color": "#FF8A4C" }),
                  $h("stop", { "offset": "1", "stop-color": "#FF4F1F" })
                )
              ),
              $h("path", { "d": "M11.2 0.8c.5 3.2-1.3 5.1-3 6.9C6.3 9.7 4 11.9 4 15.4 4 19.4 6.9 22.2 10.3 22.2s6.3-2.8 6.3-6.7c0-2.5-1.1-4.3-2.4-5.8-.3 1.6-1.1 2.9-2.4 3.4.5-4.5-.7-8.7-3.2-12.3z", "fill": "url(#maprFlame)" }),
              $h("path", { "d": "M10.3 22.2c-2 0-3.5-1.5-3.5-3.6 0-2 1.3-3.2 2.6-4.5.3 1.3 1.1 2 2.1 2.3-.1-1.1.3-2.4.9-3.2 1.4 1.4 2.4 3 2.4 5 0 2.4-1.8 4-4.5 4z", "fill": "#FFE7B3", "opacity": "0.9" })
            ),
            $h("span", { "style": "color: #FFFFFF; font-weight: 700;" },
              "Black Friday"
            ),
            $h("span", { "aria-hidden": "true", "style": "color: #3A4150;" },
              "•"
            ),
            $h("span", null,
              $h("span", { "style": "color: #FF8A4C; font-weight: 700;" },
                "−50 %"
              ),
              " sur l’annuel"
            ),
            $h("span", { "aria-hidden": "true", "style": "color: #3A4150;" },
              "•"
            ),
            $h("span", { "style": "color: #E6E9EF; font-variant-numeric: tabular-nums;" },
              $t($v.bfTime)
            ),
            $h("span", { "style": "color: #FFFFFF; font-weight: 700;" },
              "→"
            )
          )
        ] : null,
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em;" },
            "Apps"
          ),
          $h("a", { "href": "/app/compte", "aria-label": "Mon compte", "style": "width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; margin-right: -4px;" },
            $h("span", { "class": "sw-avatar", "style": "width: 36px; height: 36px; font-size: 14px;" },
              $t($v.me?.initiale)
            )
          )
        ),
        $h("div", { "style": "padding: 16px 20px 12px; display: flex; align-items: baseline; justify-content: space-between; gap: 12px;" },
          $h("span", { "style": "font-size: 15px; font-weight: 700;" },
            "Le top 3"
          ),
          $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
            "sur ", $t($v.totalTxt), " apps · 30 j"
          )
        ),
        $h("div", { "class": "mapr-row", "style": "display: flex; gap: 12px; padding: 0 20px; overflow-x: auto;" },
          ($l($v.top)).map((a) => [
            $h("a", { "href": $u(a?.href), "aria-label": a?.aria, "style": "flex: 0 0 min(300px, calc(100% - 52px)); display: flex; flex-direction: column; gap: 10px; color: inherit; text-decoration: none;" },
              $h("span", { "style": "position: relative; display: block; height: 132px; border-radius: 18px; overflow: hidden; background: var(--thumb-navy);" },
                (a?.cover) ? [
                  $h("img", { "src": $u(a?.cover), "alt": "", "style": "width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                ] : null,
                $h("span", { "style": "position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,12,0) 35%, rgba(5,7,12,0.88));" }),
                $h("span", { "class": "mono-label", "style": "position: absolute; left: 14px; top: 12px; color: #FFFFFF;" },
                  $t(a?.rank)
                ),
                $h("span", { "style": "position: absolute; left: 14px; right: 14px; bottom: 12px; display: flex; align-items: center; gap: 10px; min-width: 0;" },
                  (a?.icon) ? [
                    $h("img", { "src": $u(a?.icon), "alt": "", "style": "flex-shrink: 0; width: 32px; height: 32px; border-radius: 9px; object-fit: cover;", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  $h("span", { "style": "display: flex; flex-direction: column; min-width: 0;" },
                    $h("span", { "style": "font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                      $t(a?.name)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-muted);" },
                      $t(a?.niche)
                    )
                  )
                )
              ),
              $h("span", { "style": "display: flex; align-items: baseline; justify-content: space-between; gap: 8px;" },
                $h("span", { "style": "display: flex; align-items: baseline; gap: 6px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.04em; font-variant-numeric: tabular-nums;" },
                    $t(a?.views)
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    "vues"
                  )
                ),
                $h("span", { "style": `font-size: 13px; font-weight: 600; color: ${$t(a?.deltaInk)};` },
                  $t(a?.delta)
                )
              ),
              $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                $t(a?.meta)
              )
            )
          ])
        ),
        $h("section", { "aria-label": "Le reste du classement", "style": "position: relative; margin-top: 12px; height: 360px;" },
          $h("div", { "aria-hidden": "true", "style": "position: absolute; inset: 0; padding: 0 20px; overflow: hidden; pointer-events: none;" },
            ($l($v.ghosts)).map((g) => [
              $h("div", { "style": `display: flex; align-items: center; gap: 12px; height: 60px; border-top: 1px solid var(--line); opacity: ${$t(g?.op)}; filter: blur(${$t(g?.blur)});` },
                $h("span", { "class": "mono-data", "style": "width: 22px; color: var(--ink-faint);" },
                  $t(g?.rank)
                ),
                $h("span", { "style": `flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; background: ${$t(g?.tile)};` }),
                $h("span", { "style": "flex: 1;" },
                  $h("span", { "style": `display: block; width: ${$t(g?.w)}; height: 12px; border-radius: 6px; background: rgba(255,255,255,0.12);` })
                ),
                $h("span", { "style": "width: 56px; height: 14px; border-radius: 7px; background: rgba(255,255,255,0.12);" })
              )
            ])
          ),
          $h("div", { "style": "position: absolute; left: 16px; right: 16px; top: 12px; border-radius: 24px; overflow: hidden; background: rgba(13,17,26,0.94); backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%); box-shadow: inset 0 0 0 1px var(--glass-edge), var(--shadow-float);" },
            $h("div", { "style": "padding: 20px; display: flex; flex-direction: column; gap: 14px;" },
              $h("div", { "style": "display: flex; align-items: center; gap: 12px;" },
                $h("span", { "style": "flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent-edge); color: var(--accent); display: flex; align-items: center; justify-content: center;" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("h2", { "style": "margin: 0; font-family: var(--font-display); font-size: 21px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15;" },
                  $t($v.moreTxt), " autres apps t’attendent"
                )
              ),
              $h("p", { "style": "margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
                "Tout le classement, les formats qui marchent, les créateurs derrière chaque app et tous les marchés."
              ),
              $h("div", { "style": "display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding-top: 14px; border-top: 1px solid var(--line);" },
                $h("span", { "style": "display: flex; align-items: baseline; gap: 6px;" },
                  $h("span", { "class": "stat-xl", "style": "font-size: 28px; font-variant-numeric: tabular-nums;" },
                    "29,99 €"
                  ),
                  $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                    "/ mois"
                  )
                ),
                $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                  "Sans engagement"
                )
              ),
              $h("a", { "href": $u($v.monthly), "class": "sw-btn sw-btn-primary sw-btn-lg sw-btn-block", "style": "text-decoration: none; box-sizing: border-box; width: 100%; max-width: 100%;" },
                "Tout débloquer",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ),
            ($v.bfOn) ? [
              $h("button", { "class": "mapr-strip", "type": "button", "onClick": $v.openPlans, "style": "display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 20px; border-top: 1px solid rgba(255,138,76,0.2); background: linear-gradient(90deg, rgba(255,106,31,0.12), rgba(255,106,31,0.03) 80%); font-size: 13px; color: #C9CED8;" },
                $h("svg", { "width": "13", "height": "15", "viewBox": "0 0 20 23", "aria-hidden": "true" },
                  $h("path", { "d": "M11.2 0.8c.5 3.2-1.3 5.1-3 6.9C6.3 9.7 4 11.9 4 15.4 4 19.4 6.9 22.2 10.3 22.2s6.3-2.8 6.3-6.7c0-2.5-1.1-4.3-2.4-5.8-.3 1.6-1.1 2.9-2.4 3.4.5-4.5-.7-8.7-3.2-12.3z", "fill": "url(#maprFlame)" })
                ),
                $h("span", null,
                  $h("span", { "style": "color: #FFFFFF; font-weight: 700;" },
                    "Annuel"
                  ),
                  " à 14,99 € / mois"
                ),
                $h("span", { "style": "margin-left: auto; color: #FF8A4C; font-weight: 700;" },
                  "J’en profite →"
                )
              )
            ] : null
          )
        ),
        $h("nav", { "data-tabbar": "", "aria-label": "Navigation principale", "style": "position: fixed; left: 12px; right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); z-index: 30; height: 64px; padding: 0 6px; box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); align-items: center; border-radius: 32px; background: rgba(22,27,38,0.84); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 20px 50px rgba(0,0,0,0.55);" },
          $h("a", { "href": "/app/apps", "data-tab": "", "aria-current": "page", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: #FFFFFF; font-size: 10.5px; font-weight: 700;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          ($l($v.locked)).map((n) => [
            $h("a", { "href": $u(n?.href), "aria-current": "false", "aria-label": `${$t(n?.label)}, avec Kopycat Pro`, "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500; opacity: 0.55;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t(n?.label)
            )
          ])
        )
      )
    ];
  }
}
