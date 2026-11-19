// Généré par scripts/dc2preact.py depuis design/Tarifs.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../runtime.js';

export default class Tarifs extends DCLogic {
  componentDidMount() {
    this.t0 = Date.now();
    this.timer = setInterval(() => this.setState({ now: Date.now() }), 100);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  renderVals() {
    const S0 = (this.props && this.props.stats) || { apps: 190, accounts: 4900 };
    const rs = { apps: S0.apps.toLocaleString('fr-FR'), accounts: S0.accounts.toLocaleString('fr-FR') };

    const st = this.state || {};
    // Black Friday (19/11) : jusqu’au 30 novembre minuit, heure de Paris (même fin que TrendTrack). Bandeau et
    // décompte disparaissent d’eux-mêmes ensuite.
    const bfLeft = Math.max(0, Date.parse('2026-12-01T00:00:00+01:00') - (st.now || Date.now()));
    const bf2 = (n) => String(n).padStart(2, '0');
    const bfTime = Math.floor(bfLeft / 864e5) + 'j ' + bf2(Math.floor(bfLeft / 36e5) % 24) + ':' + bf2(Math.floor(bfLeft / 6e4) % 60) + ':' + bf2(Math.floor(bfLeft / 1e3) % 60);
    const el = Math.max(0, (st.now || 0) - (this.t0 || 0));
    const annual = st.bill ? st.bill === 'y' : bfLeft > 0; // Black Friday : l’annuel d’abord
    const menuOpen = !!st.menu;
    const openQ = st.q === undefined ? 0 : st.q;
    const ic = {
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      radar: 'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6',
      alertes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0',
      fiche: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
      videos: 'M4 5h16v14H4zM10 9l5 3-5 3z',
      revenus: 'M17 6.5A6.5 6.5 0 1 0 17 17.5M5 10h9M5 14h9',
      marches: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9s1.3-6.2 3.8-9z',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      export: 'M12 4v11M7 10l5 5 5-5M5 20h14'
    };
    const spec = [
      ['01', 'Spot it', 'repérer ce qui explose', [
        ['apps', 'Les apps qui explosent', 'En ce moment, parmi plus de ' + rs.apps + ' apps suivies.'],
        ['radar', 'Nouvelles apps repérées', 'Celles qui démarrent, avant qu’elles saturent.'],
        ['alertes', 'Alertes « vidéo qui explose »', 'Une vidéo part très au-dessus de sa normale, tu es prévenu.']
      ]],
      ['02', 'Copy it', 'copier ce qui marche', [
        ['videos', 'Les formats qui explosent', 'Les hooks, les sons et les formats qui font les vues.'],
        ['fiche', 'Fiches d’app décortiquées', 'Comptes, formats et rythme de publication.']
      ]],
      ['03', 'Launch it', 'lancer la tienne', [
        ['createurs', 'Les créateurs derrière chaque app', 'Leurs comptes et leurs vidéos, pour les recruter.'],
        ['marches', 'Tous les marchés', 'Choisis le pays où lancer, vois ce qui y explose déjà.']
      ]]
    ];
    const groups = spec.map((g, gi) => ({
      n: g[0], title: g[1], sub: g[2],
      line: gi === 0 ? '0' : '1px solid #EEF0F3',
      items: g[3].map((f) => ({ d: ic[f[0]], t: f[1], d2: f[2] }))
    }));
    const p = Math.min(1, el / 1600);
    const k = 1 - Math.pow(1 - p, 3);
    const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const nums = [
      ['+' + fmt(1000 * k), 'apps qui poussent sur les réseaux'],
      ['+' + fmt(100000 * k), 'comptes passés au crible chaque jour'],
      ['Tous', 'les marchés, toutes les langues']
    ].map((x, i) => ({ v: x[0], l: x[1], line: i === 0 ? '0' : '1px solid #E2E4E9', pl: i === 0 ? '0px' : '28px' }));
    const faq = [
      ['Pourquoi un seul plan ?', 'Pour que tu n’aies rien à arbitrer : Pro, c’est tout Kopycat, sans palier ni option.'],
      ['Je peux annuler quand je veux ?', 'Oui, en un clic depuis ton compte. Tu gardes l’accès jusqu’à la fin de la période déjà payée.'],
      ['Ça marche sur quels marchés ?', 'Sur tous : choisis un pays ou une langue, tu vois les apps, les formats et les créateurs qui y explosent en ce moment.']
    ];
    const qs = faq.map((f, i) => {
      const o = openQ === i;
      return {
        q: f[0], a: f[1], open: o,
        rows: o ? '1fr' : '0fr',
        rot: o ? 'rotate(45deg)' : 'rotate(0deg)',
        iconBg: o ? '#0B6FE0' : '#E9EBEF',
        iconInk: o ? '#FFFFFF' : '#111216',
        toggle: () => this.setState({ q: o ? -1 : i })
      };
    });
    const ticks = [
      { app: 'Luv or Pop', text: 'repérée à H+26' },
      { app: 'Love8', text: '+69 comptes' },
      { app: 'Astra AI', text: 'une vidéo à 2 333× sa normale' },
      { app: 'DJ Kartier', text: 'repérée à H+43' }
    ];
    const mk = (title, links) => ({ title, links: links.map((l) => ({ t: l[0], href: l[1] })) });
    return {
      bfOn: bfLeft > 0, bfOff: bfLeft === 0, bfTime,
      bfGo: (e) => { if (e && e.preventDefault) e.preventDefault(); this.setState({ bill: 'y' }); const el = typeof document !== 'undefined' && document.getElementById('bf-prix'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
      bfBadge: bfLeft > 0 ? 'linear-gradient(180deg, #FFA266, #FF6A2B)' : '#0B6FE0',
      menuOpen,
      prodBg: menuOpen ? 'rgba(255,255,255,0.90)' : 'transparent',
      chev: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      toggleMenu: () => this.setState({ menu: !menuOpen }),
      closeMenu: () => this.setState({ menu: false }),
      menu: [
        { t: 'Apps qui explosent', sub: 'En ce moment, sur n’importe quel marché', d: ic.apps },
        { t: 'Formats qui explosent', sub: 'Les hooks, les sons et les formats qui font les vues', d: ic.videos },
        { t: 'Créateurs', sub: 'Les comptes qui font exploser chaque app', d: ic.createurs }
      ],
      thumbL: annual ? '185px' : '5px',
      isM: !annual, isY: annual,
      inkM: annual ? '#3A3F47' : '#FFFFFF',
      inkY: annual ? '#FFFFFF' : '#3A3F47',
      toM: () => this.setState({ bill: 'm' }),
      toY: () => this.setState({ bill: 'y' }),
      oM: annual ? 0 : 1, trM: annual ? 'translateY(-12px)' : 'translateY(0)',
      oY: annual ? 1 : 0, trY: annual ? 'translateY(0)' : 'translateY(12px)',
      lastNote: annual ? '14,99 € par mois · annulable en un clic' : '29,99 € par mois · annulable en un clic',
      groups, nums, qs,
      tick: ticks[Math.floor(el / 3200) % ticks.length],
      tickO: (el % 3200) < 2900 ? 1 : 0,
      cols: [
        mk('Produit', [['Comment ça marche', '/#produit'], ['Exemple', '/#exemple'], ['Tarifs', '/tarifs'], ['FAQ', '/#faq']]),
        mk('Fonctionnalités', [['Apps qui explosent', '/#produit'], ['Formats qui explosent', '/#exemple'], ['Créateurs derrière chaque app', '/#produit'], ['Tous les marchés', '/#produit']]),
        mk('Légal', [['CGV', '/cgv'], ['Confidentialité', '/confidentialite'], ['Mentions légales', '/mentions-legales'], ['Contact', '/mentions-legales#contact']])
      ]
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "style": "position: relative; display: flex; flex-direction: column; min-height: 100vh; background: linear-gradient(180deg, #B9DCFF 0px, #DCEDFF 420px, #EEF4FB 780px, #F5F6F8 1180px, #F3F3F5 1480px); font-family: Inter, system-ui, sans-serif; color: #111216; font-size: 16px; line-height: 1.5; overflow-x: clip;" },
        $h("div", { "aria-hidden": "true", "style": "position: absolute; left: 0; right: 0; top: 0; height: 1300px; overflow: hidden; pointer-events: none;" },
          $h("div", { "style": "position: absolute; left: 6%; top: 120px; width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,255,255,0.80), transparent); animation: tf-driftA 18s ease-in-out infinite;" }),
          $h("div", { "style": "position: absolute; right: 4%; top: 40px; width: 580px; height: 580px; border-radius: 50%; background: radial-gradient(closest-side, rgba(76,154,255,0.28), transparent); animation: tf-driftB 15s ease-in-out infinite;" }),
          $h("div", { "style": "position: absolute; inset: 0; background-image: linear-gradient(rgba(11,111,224,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,111,224,0.06) 1px, transparent 1px); background-size: 64px 64px; -webkit-mask-image: radial-gradient(46% 34% at 50% 22%, #000, transparent); mask-image: radial-gradient(46% 34% at 50% 22%, #000, transparent);" })
        ),
        $h("header", { "style": "position: sticky; top: 0; z-index: 50; padding: 22px 24px 0;" },
          ($v.bfOn) ? [
            $h("a", { "href": "#bf-prix", "class": "bfb", "onClick": $v.bfGo, "aria-label": `Black Friday : jusqu’à −50 % sur l’abonnement annuel, fin dans ${$t($v.bfTime)}`, "style": "display: flex; align-items: center; justify-content: center; gap: 12px; margin: -22px -24px 14px; height: 42px; padding: 0 16px; background: #0B0E14; border-bottom: 1px solid rgba(255,255,255,0.07); color: #C9CED8; font-size: 14px; font-weight: 500; text-decoration: none; white-space: nowrap; overflow: hidden;" },
              $h("svg", { "width": "16", "height": "18", "viewBox": "0 0 20 23", "aria-hidden": "true", "style": "flex-shrink: 0; filter: drop-shadow(0 0 6px rgba(255,122,61,0.55));" },
                $h("defs", null,
                  $h("linearGradient", { "id": "bfFlame", "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                    $h("stop", { "offset": "0", "stop-color": "#FFD08A" }),
                    $h("stop", { "offset": "0.5", "stop-color": "#FF8A4C" }),
                    $h("stop", { "offset": "1", "stop-color": "#FF4F1F" })
                  )
                ),
                $h("path", { "d": "M11.2 0.8c.5 3.2-1.3 5.1-3 6.9C6.3 9.7 4 11.9 4 15.4 4 19.4 6.9 22.2 10.3 22.2s6.3-2.8 6.3-6.7c0-2.5-1.1-4.3-2.4-5.8-.3 1.6-1.1 2.9-2.4 3.4.5-4.5-.7-8.7-3.2-12.3z", "fill": "url(#bfFlame)" }),
                $h("path", { "d": "M10.3 22.2c-2 0-3.5-1.5-3.5-3.6 0-2 1.3-3.2 2.6-4.5.3 1.3 1.1 2 2.1 2.3-.1-1.1.3-2.4.9-3.2 1.4 1.4 2.4 3 2.4 5 0 2.4-1.8 4-4.5 4z", "fill": "#FFE7B3", "opacity": "0.9" })
              ),
              $h("span", { "style": "color: #FFFFFF; font-weight: 700;" },
                "Black Friday"
              ),
              $h("span", { "aria-hidden": "true", "style": "color: #3A4150;" },
                "•"
              ),
              $h("span", { "style": "color: #C9CED8;" },
                "Jusqu’à ",
                $h("span", { "style": "color: #FF8A4C; font-weight: 700;" },
                  "−50 %"
                ),
                " sur l’abonnement annuel"
              ),
              $h("span", { "aria-hidden": "true", "style": "color: #3A4150;" },
                "•"
              ),
              $h("span", { "style": "color: #8A93A3;" },
                "Fin dans ",
                $h("span", { "style": "color: #E6E9EF; font-variant-numeric: tabular-nums;" },
                  $t($v.bfTime)
                )
              ),
              $h("span", { "aria-hidden": "true", "style": "color: #3A4150;" },
                "•"
              ),
              $h("span", { "class": "bfc", "style": "color: #FFFFFF; font-weight: 700; transition: color 0.2s ease;" },
                "J’en profite →"
              )
            )
          ] : null,
          $h("div", { "style": "position: relative; max-width: 1240px; margin: 0 auto; display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap;" },
            $h("a", { "href": "/", "style": "display: flex; align-items: center; gap: 9px; text-decoration: none; height: 52px; padding: 0 20px 0 16px; box-sizing: border-box; border-radius: 999px; background: rgba(255,255,255,0.58); border: 1px solid rgba(255,255,255,0.85); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); box-shadow: 0 8px 24px rgba(16,24,40,0.08), inset 0 1px 0 #FFFFFF;" },
              $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#0B6FE0" }),
                $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#0B6FE0" }),
                $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#0B6FE0" }),
                $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#0E0F12" }),
                $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#0E0F12" }),
                $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#0E0F12" }),
                $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#0E0F12" })
              ),
              $h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 21px; letter-spacing: -0.03em; color: #0E0F12;" },
                "kopycat"
              )
            ),
            $h("nav", { "aria-label": "Principal", "style": "display: flex; align-items: center; gap: 4px; height: 52px; padding: 0 6px; box-sizing: border-box; border-radius: 999px; background: rgba(255,255,255,0.58); border: 1px solid rgba(255,255,255,0.85); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); box-shadow: 0 8px 24px rgba(16,24,40,0.08), inset 0 1px 0 #FFFFFF;" },
              $h("button", { "type": "button", "class": "nh", "onClick": $v.toggleMenu, "aria-expanded": $v.menuOpen, "style": `display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px 0 16px; border: 0; border-radius: 999px; background: ${$t($v.prodBg)}; color: #0E0F12; font: inherit; font-size: 15px; font-weight: 500; cursor: pointer;` },
                "Produit",
                $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 12 12", "aria-hidden": "true", "style": `transform: ${$t($v.chev)}; transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                  $h("path", { "d": "M3 4.5l3 3 3-3", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("a", { "href": "/#exemple", "class": "nh", "style": "display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 999px; color: #4A4F57; text-decoration: none; font-size: 15px; font-weight: 500;" },
                "Exemple"
              ),
              $h("a", { "href": "/tarifs", "aria-current": "page", "style": "display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 999px; background: rgba(255,255,255,0.95); box-shadow: 0 1px 2px rgba(16,24,40,0.08); color: #0E0F12; text-decoration: none; font-size: 15px; font-weight: 600;" },
                "Tarifs"
              ),
              $h("a", { "href": "/#faq", "class": "nh", "style": "display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 999px; color: #4A4F57; text-decoration: none; font-size: 15px; font-weight: 500;" },
                "FAQ"
              )
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 4px; height: 52px; padding: 0 5px; box-sizing: border-box; border-radius: 999px; background: rgba(255,255,255,0.58); border: 1px solid rgba(255,255,255,0.85); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); box-shadow: 0 8px 24px rgba(16,24,40,0.08), inset 0 1px 0 #FFFFFF;" },
              $h("a", { "href": "/connexion", "class": "nh", "style": "display: inline-flex; align-items: center; height: 42px; padding: 0 18px; border-radius: 999px; color: #0E0F12; text-decoration: none; font-size: 15px; font-weight: 600; white-space: nowrap;" },
                "Se connecter"
              ),
              $h("a", { "href": "/inscription", "class": "cta", "style": "display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 42px; box-sizing: border-box; padding: 0 4px 0 18px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 15px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                "Trouver mon app",
                $h("span", { "aria-hidden": "true", "style": "width: 32px; height: 32px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ),
            ($v.menuOpen) ? [
              $h("div", { "style": "position: absolute; top: calc(100% + 12px); left: 50%; width: 700px; max-width: calc(100vw - 48px); transform: translateX(-50%); box-sizing: border-box; border-radius: 24px; padding: 10px; background: rgba(255,255,255,0.72); border: 1px solid rgba(255,255,255,0.92); backdrop-filter: blur(26px) saturate(180%); -webkit-backdrop-filter: blur(26px) saturate(180%); box-shadow: 0 30px 70px rgba(16,24,40,0.20), inset 0 1px 0 #FFFFFF; display: flex; flex-wrap: wrap; gap: 10px; animation: tf-menuIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
                $h("div", { "style": "flex: 1 1 320px; display: flex; flex-direction: column; gap: 2px;" },
                  ($l($v.menu)).map((m) => [
                    $h("a", { "href": "/", "class": "mi", "onClick": $v.closeMenu, "style": "display: flex; align-items: flex-start; gap: 14px; padding: 14px; border-radius: 16px; text-decoration: none;" },
                      $h("span", { "style": "width: 40px; height: 40px; border-radius: 12px; background: #EAF2FF; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": m?.d, "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                        $h("span", { "style": "font-size: 15px; font-weight: 600; color: #0E0F12;" },
                          $t(m?.t)
                        ),
                        $h("span", { "style": "font-size: 13px; color: #4A4F57; line-height: 1.45;" },
                          $t(m?.sub)
                        )
                      )
                    )
                  ])
                ),
                $h("div", { "style": "flex: 0 0 220px; position: relative; border-radius: 18px; overflow: hidden; background: #111216; color: #FFFFFF; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; min-height: 236px;" },
                  $h("img", { "src": "/media/v-7705876324832791821.jpg", "alt": "", "style": "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" }),
                  $h("span", { "style": "position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.30), transparent 35%, transparent 50%, rgba(0,0,0,0.78));" }),
                  $h("span", { "style": "position: relative; align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.92); color: #111216; border-radius: 999px; padding: 3px 10px 3px 3px; font-size: 11px; font-weight: 700;" },
                    $h("img", { "src": "/media/app-luv-or-pop.jpg", "alt": "", "style": "width: 18px; height: 18px; border-radius: 5px; display: block;" }),
                    "Repérée à H+26"
                  ),
                  $h("span", { "style": "position: relative; display: flex; flex-direction: column;" },
                    $h("span", { "style": "font-size: 13px; color: #E4E7EC;" },
                      "Luv or Pop"
                    ),
                    $h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 30px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1;" },
                      "7,5 M vues"
                    )
                  )
                )
              )
            ] : null
          )
        ),
        $h("section", { "style": "position: relative; padding: 88px 24px 64px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 22px;" },
          ($v.bfOn) ? [
            $h("div", { "role": "timer", "aria-label": `Black Friday : −50 % sur l’abonnement annuel, fin dans ${$t($v.bfTime)}`, "style": "display: flex; flex-direction: column; align-items: center; animation: tf-blurIn 0.8s ease-out both;" },
              $h("span", { "aria-hidden": "true", "style": "position: relative; z-index: 1; margin-bottom: -1px; padding: 8px 18px 7px; border-radius: 12px 12px 0 0; background: #0B0E14; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500; letter-spacing: 0.1em; color: #FF8A4C;" },
                "BLACK FRIDAY"
              ),
              $h("div", { "aria-hidden": "true", "style": "padding: 18px 30px 16px; border-radius: 22px; background-color: #07090D; background-image: radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1.5px); background-size: 7px 7px; box-shadow: 0 0 0 6px #0B0E14, 0 24px 60px rgba(11,14,20,0.35), inset 0 0 30px rgba(0,0,0,0.7); display: flex; flex-direction: column; align-items: center; gap: 4px;" },
                $h("span", { "style": "font-family: 'Doto', 'JetBrains Mono', monospace; font-weight: 800; font-size: 56px; line-height: 1; letter-spacing: 0.02em; color: #FF9C57; text-shadow: 0 0 14px rgba(255,122,61,0.6);" },
                  "-50% ANNUEL"
                ),
                $h("span", { "style": "font-family: 'Doto', 'JetBrains Mono', monospace; font-weight: 800; font-size: 56px; line-height: 1; letter-spacing: 0.02em; color: #E9ECF2; text-shadow: 0 0 12px rgba(255,255,255,0.28); font-variant-numeric: tabular-nums;" },
                  $t($v.bfTime)
                )
              )
            )
          ] : null,
          ($v.bfOff) ? [
            $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: 0.04em; color: #3A3F47; animation: tf-blurIn 0.8s ease-out both;" },
              $h("span", { "style": "color: #0B6FE0;" },
                "["
              ),
              " TARIFS ",
              $h("span", { "style": "color: #0B6FE0;" },
                "]"
              )
            )
          ] : null,
          $h("h1", { "style": "margin: 0; max-width: 1100px; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(44px, 5.6vw, 84px); line-height: 1.02; letter-spacing: -0.05em; animation: tf-blurIn 1s cubic-bezier(0.2, 0.7, 0.2, 1) both; animation-delay: 0.12s;" },
            "Un seul plan. ",
            $h("span", { "style": "color: #0B6FE0;" },
              "Tout Kopycat."
            )
          ),
          $h("p", { "style": "margin: 0; max-width: 620px; font-size: 19px; line-height: 1.55; color: #3A3F47; animation: tf-blurIn 0.9s ease-out both; animation-delay: 0.3s;" },
            "Les apps et les formats qui explosent en ce moment sur TikTok et Instagram, sur n’importe quel marché, et les créateurs derrière. Pour un seul prix."
          ),
          $h("div", { "role": "group", "aria-label": "Facturation", "style": "position: relative; margin-top: 10px; display: inline-flex; padding: 5px; border-radius: 999px; background: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 8px 24px rgba(16,24,40,0.08); animation: tf-blurIn 0.9s ease-out both; animation-delay: 0.45s;" },
            $h("span", { "aria-hidden": "true", "style": `position: absolute; top: 5px; bottom: 5px; left: ${$t($v.thumbL)}; width: 180px; border-radius: 999px; background: #0E0F12; box-shadow: 0 6px 16px rgba(14,15,18,0.25); transition: left 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);` }),
            $h("button", { "type": "button", "aria-pressed": $v.isM, "onClick": $v.toM, "style": `position: relative; width: 180px; height: 46px; border: 0; background: transparent; color: ${$t($v.inkM)}; font: inherit; font-size: 16px; font-weight: 600; cursor: pointer; transition: color 0.3s ease;` },
              "Mensuel"
            ),
            $h("button", { "type": "button", "aria-pressed": $v.isY, "onClick": $v.toY, "style": `position: relative; width: 180px; height: 46px; border: 0; background: transparent; color: ${$t($v.inkY)}; font: inherit; font-size: 16px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 10px; transition: color 0.3s ease;` },
              "Annuel",
              $h("span", { "style": `font-size: 12px; font-weight: 700; color: #FFFFFF; background: ${$t($v.bfBadge)}; border-radius: 999px; padding: 2px 8px;` },
                "−50 %"
              )
            )
          )
        ),
        $h("section", { "id": "bf-prix", "aria-label": "Kopycat Pro", "style": "position: relative; padding: 0 24px;" },
          $h("div", { "style": "position: relative; max-width: 1120px; margin: 0 auto; border-radius: 32px; padding: 1.5px; overflow: hidden; box-shadow: 0 2px 4px rgba(16,24,40,0.06), 0 50px 110px rgba(11,40,90,0.22); animation: tf-riseIn 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both; animation-delay: 0.55s;" },
            $h("span", { "aria-hidden": "true", "style": "position: absolute; left: 50%; top: 50%; width: 140%; aspect-ratio: 1 / 1; background: conic-gradient(from 0deg, rgba(11,111,224,0.18) 0deg, rgba(11,111,224,0.18) 230deg, #4C9AFF 300deg, #FFFFFF 335deg, rgba(11,111,224,0.18) 360deg); animation: tf-spinC 6s linear infinite;" }),
            $h("div", { "style": "position: relative; border-radius: 30.5px; overflow: hidden; background: #FFFFFF; display: flex; flex-wrap: wrap;" },
              $h("div", { "class": "dk", "style": "position: relative; overflow: hidden; flex: 1 1 400px; box-sizing: border-box; padding: 48px 44px 40px; background: linear-gradient(180deg, #0E1730 0%, #090D17 100%); color: #FFFFFF; display: flex; flex-direction: column; gap: 28px;" },
                $h("div", { "aria-hidden": "true", "style": "position: absolute; left: 100%; top: 100%; width: 820px; height: 820px; border-radius: 50%; background: conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(76,154,255,0.05) 300deg, rgba(76,154,255,0.30) 360deg); animation: tf-spinC 9s linear infinite; pointer-events: none;" }),
                $h("div", { "aria-hidden": "true", "style": "position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; -webkit-mask-image: radial-gradient(70% 60% at 100% 100%, #000, transparent); mask-image: radial-gradient(70% 60% at 100% 100%, #000, transparent); pointer-events: none;" }),
                $h("div", { "style": "position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 10px;" },
                    $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
                      $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#4C9AFF" }),
                      $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
                      $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF" }),
                      $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF" }),
                      $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF" }),
                      $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF" })
                    ),
                    $h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.03em;" },
                      "Kopycat Pro"
                    )
                  ),
                  $h("span", { "style": "font-size: 12px; font-weight: 700; color: #FFFFFF; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); border-radius: 999px; padding: 5px 12px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);" },
                    "Tout inclus"
                  )
                ),
                $h("div", { "style": "position: relative; height: 122px;" },
                  $h("div", { "style": `position: absolute; inset: 0; display: flex; flex-direction: column; gap: 10px; opacity: ${$t($v.oM)}; transform: ${$t($v.trM)}; transition: opacity 0.35s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                    $h("span", { "style": "display: flex; align-items: baseline; gap: 10px;" },
                      $h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 80px; font-weight: 700; letter-spacing: -0.06em; line-height: 0.95;" },
                        "29,99 €"
                      ),
                      $h("span", { "style": "font-size: 17px; color: #9AA3B2;" },
                        "/ mois"
                      )
                    ),
                    $h("span", { "style": "font-size: 15px; color: #9AA3B2;" },
                      "Facturé chaque mois."
                    )
                  ),
                  $h("div", { "style": `position: absolute; inset: 0; display: flex; flex-direction: column; gap: 10px; opacity: ${$t($v.oY)}; transform: ${$t($v.trY)}; transition: opacity 0.35s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                    $h("span", { "style": "display: flex; align-items: baseline; gap: 10px;" },
                      $h("span", { "style": "font-size: 24px; font-weight: 600; color: #6B7385; text-decoration: line-through; text-decoration-color: rgba(255,138,76,0.9); text-decoration-thickness: 2px;" },
                        "29,99 €"
                      ),
                      $h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 80px; font-weight: 700; letter-spacing: -0.06em; line-height: 0.95;" },
                        "14,99 €"
                      ),
                      $h("span", { "style": "font-size: 17px; color: #9AA3B2;" },
                        "/ mois"
                      )
                    ),
                    $h("span", { "style": "display: flex; align-items: center; gap: 10px; flex-wrap: wrap;" },
                      $h("span", { "style": "font-size: 13px; font-weight: 700; color: #FF9C57; background: rgba(255,122,61,0.14); box-shadow: inset 0 0 0 1px rgba(255,122,61,0.32); border-radius: 8px; padding: 4px 9px;" },
                        "Économise 50 %"
                      ),
                      $h("span", { "style": "font-size: 15px; color: #9AA3B2;" },
                        "Facturé 179,88 € par an."
                      )
                    )
                  )
                ),
                $h("a", { "href": "/inscription", "class": "cta", "style": "position: relative; display: flex; align-items: center; justify-content: center; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 5px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                  "Passer Pro",
                  $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                $h("div", { "style": "position: relative; margin-top: auto; border-top: 1px dashed rgba(255,255,255,0.14); padding-top: 22px; display: flex; flex-wrap: wrap; gap: 10px 22px; font-size: 14px; color: #C9CED6;" },
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px;" },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Annulable en un clic"
                  ),
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px;" },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Sans engagement"
                  ),
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px;" },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Paiement sécurisé"
                  )
                )
              ),
              $h("div", { "style": "flex: 1.25 1 480px; box-sizing: border-box; padding: 44px 48px 36px; background: #FFFFFF; display: flex; flex-direction: column;" },
                $h("span", { "style": "font-size: 15px; font-weight: 600; color: #111216; padding-bottom: 6px;" },
                  "Tout ce que tu débloques"
                ),
                ($l($v.groups)).map((g) => [
                  $h("div", { "style": `padding: 20px 0; border-top: ${$t(g?.line)}; display: flex; flex-direction: column; gap: 14px;` },
                    $h("span", { "style": "display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;" },
                      $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #0B6FE0;" },
                        $t(g?.n)
                      ),
                      $h("span", { "style": "font-size: 15px; font-weight: 700;" },
                        $t(g?.title)
                      ),
                      $h("span", { "style": "font-size: 14px; color: #5F656E;" },
                        $t(g?.sub)
                      )
                    ),
                    ($l(g?.items)).map((f) => [
                      $h("div", { "style": "display: flex; align-items: flex-start; gap: 14px;" },
                        $h("span", { "style": "width: 34px; height: 34px; border-radius: 10px; background: #EEF4FF; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                          $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": f?.d, "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ),
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 1px; min-width: 0;" },
                          $h("span", { "style": "font-size: 16px; font-weight: 600;" },
                            $t(f?.t)
                          ),
                          $h("span", { "style": "font-size: 14px; color: #5F656E;" },
                            $t(f?.d2)
                          )
                        )
                      )
                    ])
                  )
                ])
              )
            )
          )
        ),
        $h("section", { "aria-labelledby": "radar", "style": "padding: 104px 24px 0;" },
          $h("div", { "style": "max-width: 1120px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px;" },
            $h("span", { "id": "radar", "style": "font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.04em; color: #5F656E;" },
              $h("span", { "style": "color: #0B6FE0;" },
                "["
              ),
              " LE RADAR ",
              $h("span", { "style": "color: #0B6FE0;" },
                "]"
              )
            ),
            $h("div", { "style": "display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); border-top: 1px solid #E2E4E9; border-bottom: 1px solid #E2E4E9;" },
              ($l($v.nums)).map((n) => [
                $h("div", { "style": `padding: 30px 28px 30px ${$t(n?.pl)}; border-left: ${$t(n?.line)}; display: flex; flex-direction: column; gap: 10px;` },
                  $h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 52px; font-weight: 700; letter-spacing: -0.05em; line-height: 1;" },
                    $t(n?.v)
                  ),
                  $h("span", { "style": "font-size: 15px; color: #5F656E;" },
                    $t(n?.l)
                  )
                )
              ])
            )
          )
        ),
        $h("section", { "aria-labelledby": "qt", "style": "padding: 112px 24px 120px;" },
          $h("div", { "style": "max-width: 1120px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 40px 80px; align-items: flex-start;" },
            $h("div", { "style": "flex: 1 1 300px; display: flex; flex-direction: column; gap: 14px;" },
              $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.04em; color: #5F656E;" },
                $h("span", { "style": "color: #0B6FE0;" },
                  "["
                ),
                " QUESTIONS ",
                $h("span", { "style": "color: #0B6FE0;" },
                  "]"
                )
              ),
              $h("h2", { "id": "qt", "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(36px, 3.6vw, 52px); letter-spacing: -0.04em; line-height: 1.05;" },
                "Avant de passer Pro."
              )
            ),
            $h("div", { "style": "flex: 1.6 1 560px; border-top: 1px dashed #D3D7DE;" },
              ($l($v.qs)).map((f) => [
                $h("div", { "style": "border-bottom: 1px dashed #D3D7DE;" },
                  $h("button", { "type": "button", "onClick": f?.toggle, "aria-expanded": f?.open, "style": "width: 100%; min-height: 76px; background: transparent; border: 0; padding: 20px 0; box-sizing: border-box; display: flex; align-items: center; gap: 20px; font: inherit; color: #111216; text-align: left; cursor: pointer;" },
                    $h("span", { "style": "flex: 1 1 auto; font-size: 19px; font-weight: 500;" },
                      $t(f?.q)
                    ),
                    $h("span", { "aria-hidden": "true", "style": `width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: ${$t(f?.iconBg)}; transition: background 0.3s ease;` },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 14 14", "style": `transform: ${$t(f?.rot)}; transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                        $h("path", { "d": "M7 2v10M2 7h10", "stroke": f?.iconInk, "stroke-width": "1.8", "stroke-linecap": "round" })
                      )
                    )
                  ),
                  $h("div", { "style": `display: grid; grid-template-rows: ${$t(f?.rows)}; transition: grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                    $h("div", { "style": "overflow: hidden;" },
                      $h("p", { "style": "margin: 0; padding: 0 56px 24px 0; font-size: 17px; line-height: 1.65; color: #4A4F57;" },
                        $t(f?.a)
                      )
                    )
                  )
                )
              ])
            )
          )
        ),
        $h("footer", { "class": "dk", "style": "position: relative; overflow: hidden; flex: 1 0 auto; display: flex; flex-direction: column; background-color: #05070C; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px); color: #FFFFFF;" },
          $h("div", { "style": "position: relative; flex: 1 0 auto; width: 100%; max-width: 1320px; margin: 0 auto; background: rgba(8,11,18,0.94); border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08); box-sizing: border-box;" },
            $h("div", { "style": "padding: 88px 56px 0;" },
              $h("div", { "style": "position: relative; overflow: hidden; border-radius: 32px; padding: 64px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015)); border: 1px solid rgba(255,255,255,0.10); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 40px 90px rgba(0,0,0,0.45); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 40px;" },
                $h("div", { "aria-hidden": "true", "style": "position: absolute; left: 82%; top: 50%; width: 820px; height: 820px; border-radius: 50%; background: conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(76,154,255,0.04) 300deg, rgba(76,154,255,0.32) 360deg); animation: tf-spinC 8s linear infinite; pointer-events: none;" }),
                $h("div", { "aria-hidden": "true", "style": "position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 48px 48px; -webkit-mask-image: radial-gradient(60% 80% at 80% 50%, #000, transparent); mask-image: radial-gradient(60% 80% at 80% 50%, #000, transparent); pointer-events: none;" }),
                $h("div", { "style": "position: relative; flex: 1 1 520px; display: flex; flex-direction: column; gap: 16px;" },
                  $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 14px; letter-spacing: 0.04em; color: #9AA3B2;" },
                    $h("span", { "style": "color: #4C9AFF;" },
                      "["
                    ),
                    " DERNIER APPEL ",
                    $h("span", { "style": "color: #4C9AFF;" },
                      "]"
                    )
                  ),
                  $h("h2", { "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(40px, 4.6vw, 64px); line-height: 1.03; letter-spacing: -0.05em;" },
                    "Ta prochaine app explose déjà sur les réseaux."
                  ),
                  $h("p", { "style": "margin: 0; font-size: 19px; color: #9AA3B2;" },
                    "Trouve-la avant les autres."
                  )
                ),
                $h("div", { "style": "position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 12px;" },
                  $h("a", { "href": "/inscription", "class": "cta", "style": "display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                    "Passer Pro",
                    $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  ),
                  $h("span", { "style": "font-size: 14px; color: #9AA3B2;" },
                    $t($v.lastNote)
                  )
                )
              )
            ),
            $h("div", { "style": "padding: 72px 72px 48px; display: flex; flex-wrap: wrap; gap: 48px 64px; justify-content: space-between;" },
              $h("div", { "style": "flex: 1 1 300px; max-width: 360px; display: flex; flex-direction: column; gap: 18px;" },
                $h("a", { "href": "/", "style": "display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #FFFFFF;" },
                  $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
                    $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#4C9AFF" }),
                    $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
                    $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF" }),
                    $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF" }),
                    $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF" }),
                    $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF" })
                  ),
                  $h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 24px; letter-spacing: -0.03em; color: #FFFFFF;" },
                    "kopycat"
                  )
                ),
                $h("p", { "style": "margin: 0; font-size: 16px; line-height: 1.6; color: #9AA3B2;" },
                  "Les apps et les formats qui explosent sur TikTok et Instagram, et les créateurs derrière."
                )
              ),
              $h("nav", { "aria-label": "Pied de page", "style": "flex: 1 1 600px; display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 40px;" },
                ($l($v.cols)).map((c) => [
                  $h("div", { "style": "display: flex; flex-direction: column; gap: 14px;" },
                    $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #8A93A3;" },
                      $t(c?.title)
                    ),
                    ($l(c?.links)).map((l) => [
                      $h("a", { "href": l?.href, "style": "font-size: 15px; text-decoration: none; min-height: 28px; display: inline-flex; align-items: center;" },
                        $t(l?.t)
                      )
                    ])
                  )
                ])
              )
            ),
            $h("div", { "style": "margin: 0 72px; border-top: 1px solid rgba(255,255,255,0.08); padding: 22px 0 30px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; font-size: 14px; color: #8A93A3;" },
              $h("span", null,
                "© 2026 Kopycat"
              ),
              $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.04em; color: #8A93A3;" },
                "Spot it. Copy it. Launch it."
              )
            )
          )
        )
      )
    ];
  }
}
