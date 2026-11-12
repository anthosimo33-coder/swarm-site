// Généré par scripts/dc2preact.py depuis design/TarifsMobile.dc.html — ne pas modifier à la main.
import { h } from 'preact';
import { DCLogic, $t, $l } from '../runtime.js';

export default class TarifsMobile extends DCLogic {
  componentDidMount() {
    this.t0 = Date.now();
    this.timer = setInterval(() => {
      const el = Date.now() - this.t0;
      this.setState({ now: Date.now() });
      if (el > 1800) clearInterval(this.timer);
    }, 60);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  renderVals() {
    const st = this.state || {};
    const el = Math.max(0, (st.now || 0) - (this.t0 || 0));
    const annual = st.bill === 'y';
    const openQ = st.q === undefined ? 0 : st.q;
    const menuOpen = !!st.menu;
    const ic = {
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      radar: 'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6',
      alertes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0',
      fiche: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5',
      videos: 'M4 5h16v14H4zM10 9l5 3-5 3z',
      revenus: 'M17 6.5A6.5 6.5 0 1 0 17 17.5M5 10h9M5 14h9',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      marches: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9s1.3-6.2 3.8-9z',
      export: 'M12 4v11M7 10l5 5 5-5M5 20h14',
      tarifs: 'M4 12l8-8h8v8l-8 8zM15.5 8.5h.01',
      faq: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.5M12 17h.01'
    };
    const spec = [
      ['01', 'Spot it', 'repérer ce qui explose', [['apps', 'Les apps qui explosent'], ['radar', 'Nouvelles apps repérées'], ['alertes', 'Alertes « vidéo qui explose »']]],
      ['02', 'Copy it', 'copier ce qui marche', [['videos', 'Les formats qui explosent'], ['fiche', 'Fiches d’app décortiquées'], ['revenus', 'Revenus estimés']]],
      ['03', 'Launch it', 'lancer la tienne', [['createurs', 'Les créateurs derrière chaque app'], ['marches', 'Tous les marchés'], ['export', 'Export CSV']]]
    ];
    const groups = spec.map((g, gi) => ({
      n: g[0], title: g[1], sub: g[2],
      line: gi === 0 ? '0' : '1px solid #EEF0F3',
      items: g[3].map((f) => ({ d: ic[f[0]], t: f[1] }))
    }));
    const p = Math.min(1, el / 1600);
    const k = 1 - Math.pow(1 - p, 3);
    const fmt = (x) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const faq = [
      ['Pourquoi un seul plan ?', 'Pour que tu n’aies rien à arbitrer : Pro, c’est tout Swarm, sans palier ni option.'],
      ['Je peux annuler quand je veux ?', 'Oui, en un clic depuis ton compte. Tu gardes l’accès jusqu’à la fin de la période déjà payée.'],
      ['Ça marche sur quels marchés ?', 'Sur tous : choisis un pays ou une langue, tu vois les apps, les formats et les créateurs qui y explosent en ce moment.'],
      ['Les revenus affichés sont garantis ?', 'Non. Ce sont des estimations : vues relevées × un RPM de 3 € pour 1 000 vues, dans une fourchette de 2,50 à 3,50 €. Le calcul est toujours affiché.']
    ];
    const mk = (title, links) => ({ title, links: links.map((l) => ({ t: l[0], href: l[1] })) });
    return {
      thumbL: annual ? '50%' : '5px',
      isM: !annual, isY: annual,
      inkM: annual ? '#3A3F47' : '#FFFFFF',
      inkY: annual ? '#FFFFFF' : '#3A3F47',
      toM: () => this.setState({ bill: 'm' }),
      toY: () => this.setState({ bill: 'y' }),
      oM: annual ? 0 : 1, trM: annual ? 'translateY(-12px)' : 'translateY(0)',
      oY: annual ? 1 : 0, trY: annual ? 'translateY(0)' : 'translateY(12px)',
      barPrice: annual ? '32,50 € / mois' : '49 € / mois',
      barNote: annual ? '390 € par an · annulable' : 'Sans engagement · annulable',
      groups,
      nums: [
        { v: '+' + fmt(1000 * k), l: 'apps suivies', line: '0', pl: '0px' },
        { v: '+' + fmt(100000 * k), l: 'comptes suivis', line: '1px solid #E2E4E9', pl: '14px' },
        { v: 'Tous', l: 'les marchés', line: '1px solid #E2E4E9', pl: '14px' }
      ],
      qs: faq.map((f, i) => {
        const o = openQ === i;
        return {
          q: f[0], a: f[1], open: o,
          rows: o ? '1fr' : '0fr',
          rot: o ? 'rotate(45deg)' : 'rotate(0deg)',
          iconBg: o ? '#0B6FE0' : '#E9EBEF',
          iconInk: o ? '#FFFFFF' : '#111216',
          toggle: () => this.setState({ q: o ? -1 : i })
        };
      }),
      menuOpen,
      openMenu: () => this.setState({ menu: true }),
      closeMenu: () => this.setState({ menu: false }),
      mnav: [
        { t: 'Apps qui explosent', sub: 'En ce moment, sur n’importe quel marché', href: '/#produit', d: ic.apps },
        { t: 'Formats qui explosent', sub: 'Les hooks, les sons et les formats', href: '/#exemple', d: ic.videos },
        { t: 'Créateurs', sub: 'Les comptes derrière chaque app', href: '/#produit', d: ic.createurs },
        { t: 'Tarifs', sub: 'Un seul plan, tout inclus', href: '/tarifs', d: ic.tarifs },
        { t: 'FAQ', sub: 'Les questions fréquentes', href: '/#faq', d: ic.faq }
      ],
      cols: [
        mk('Produit', [['Comment ça marche', '/#produit'], ['Exemple', '/#exemple'], ['Tarifs', '/tarifs'], ['FAQ', '/#faq']]),
        mk('Fonctionnalités', [['Apps qui explosent', '/#produit'], ['Formats qui explosent', '/#exemple'], ['Créateurs', '/#produit'], ['Tous les marchés', '/#produit'], ['Revenus estimés', '/#produit']])
      ]
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      h("div", { "style": "position: relative; display: flex; flex-direction: column; min-height: 100vh; background: linear-gradient(180deg, #B9DCFF 0px, #DCEDFF 340px, #EEF4FB 700px, #F5F6F8 1000px, #F3F3F5 1300px); font-family: Inter, system-ui, sans-serif; color: #111216; font-size: 16px; line-height: 1.5; overflow-x: clip;" },
        h("div", { "aria-hidden": "true", "style": "position: absolute; left: 0; right: 0; top: 0; height: 900px; overflow: hidden; pointer-events: none;" },
          h("div", { "style": "position: absolute; left: -30%; top: 80px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,255,255,0.85), transparent); animation: tfm-driftA 16s ease-in-out infinite;" }),
          h("div", { "style": "position: absolute; right: -35%; top: 0; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(76,154,255,0.30), transparent); animation: tfm-driftB 14s ease-in-out infinite;" })
        ),
        h("div", { "style": "position: relative; display: flex; flex-direction: column;" },
          h("header", { "style": "position: sticky; top: 0; z-index: 50; padding: 10px 12px 0;" },
            h("div", { "style": "display: flex; align-items: center; gap: 2px; height: 56px; padding: 0 6px 0 14px; box-sizing: border-box; border-radius: 999px; background: rgba(255,255,255,0.64); border: 1px solid rgba(255,255,255,0.92); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); box-shadow: 0 8px 24px rgba(16,24,40,0.10), inset 0 1px 0 #FFFFFF;" },
              h("a", { "href": "/", "aria-label": "Swarm, accueil", "style": "display: inline-flex; align-items: center; gap: 8px; margin-right: auto; text-decoration: none; color: #0E0F12;" },
                h("svg", { "width": "24", "height": "24", "viewbox": "0 0 24 24", "aria-hidden": "true" },
                  h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#0B6FE0" }),
                  h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#0B6FE0" }),
                  h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#0B6FE0" }),
                  h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#0E0F12" }),
                  h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#0E0F12" }),
                  h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#0E0F12" }),
                  h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#0E0F12" })
                ),
                h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.03em;" },
                  "swarm"
                )
              ),
              h("a", { "href": "#connexion", "class": "tap", "style": "display: inline-flex; align-items: center; height: 44px; padding: 0 12px; border-radius: 999px; color: #0E0F12; text-decoration: none; font-size: 15px; font-weight: 600; white-space: nowrap;" },
                "Se connecter"
              ),
              h("button", { "type": "button", "class": "tap", "onclick": $v.openMenu, "aria-label": "Ouvrir le menu", "aria-expanded": $v.menuOpen, "style": "width: 44px; height: 44px; flex-shrink: 0; border: 0; border-radius: 50%; background: #0E0F12; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 14px rgba(14,15,18,0.22);" },
                h("svg", { "width": "18", "height": "18", "viewbox": "0 0 18 18", "aria-hidden": "true" },
                  h("path", { "d": "M3 6.5h12M3 11.5h12", "stroke": "#FFFFFF", "stroke-width": "1.8", "stroke-linecap": "round" })
                )
              )
            )
          ),
          h("section", { "style": "padding: 32px 20px 28px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px;" },
            h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.04em; color: #3A3F47; animation: tfm-blurIn 0.8s ease-out both;" },
              h("span", { "style": "color: #0B6FE0;" },
                "["
              ),
              " TARIFS ",
              h("span", { "style": "color: #0B6FE0;" },
                "]"
              )
            ),
            h("h1", { "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(36px, 11vw, 46px); line-height: 1.04; letter-spacing: -0.05em; animation: tfm-blurIn 1s cubic-bezier(0.2, 0.7, 0.2, 1) both; animation-delay: 0.1s;" },
              "Un seul plan. ",
              h("span", { "style": "color: #0B6FE0;" },
                "Tout Swarm."
              )
            ),
            h("p", { "style": "margin: 0; font-size: 16px; line-height: 1.55; color: #3A3F47; animation: tfm-blurIn 0.9s ease-out both; animation-delay: 0.25s;" },
              "Les apps et les formats qui explosent en ce moment sur TikTok, Instagram et YouTube Shorts, sur n'importe quel marché, et les créateurs derrière."
            ),
            h("div", { "role": "group", "aria-label": "Facturation", "style": "position: relative; width: 100%; margin-top: 6px; display: flex; padding: 5px; box-sizing: border-box; border-radius: 999px; background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 8px 24px rgba(16,24,40,0.08); animation: tfm-blurIn 0.9s ease-out both; animation-delay: 0.4s;" },
              h("span", { "aria-hidden": "true", "style": `position: absolute; top: 5px; bottom: 5px; left: ${$t($v.thumbL)}; width: calc(50% - 5px); border-radius: 999px; background: #0E0F12; box-shadow: 0 6px 16px rgba(14,15,18,0.25); transition: left 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);` }),
              h("button", { "type": "button", "aria-pressed": $v.isM, "onclick": $v.toM, "style": `position: relative; flex: 1 1 0; height: 46px; border: 0; background: transparent; color: ${$t($v.inkM)}; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; transition: color 0.3s ease;` },
                "Mensuel"
              ),
              h("button", { "type": "button", "aria-pressed": $v.isY, "onclick": $v.toY, "style": `position: relative; flex: 1 1 0; height: 46px; border: 0; background: transparent; color: ${$t($v.inkY)}; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: color 0.3s ease;` },
                "Annuel",
                h("span", { "style": "font-size: 11px; font-weight: 700; color: #FFFFFF; background: #0B6FE0; border-radius: 999px; padding: 2px 7px;" },
                  "−33 %"
                )
              )
            )
          ),
          h("section", { "aria-label": "Swarm Pro", "style": "padding: 0 16px;" },
            h("div", { "style": "position: relative; border-radius: 28px; padding: 1.5px; overflow: hidden; box-shadow: 0 2px 4px rgba(16,24,40,0.06), 0 40px 90px rgba(11,40,90,0.22); animation: tfm-riseIn 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both; animation-delay: 0.5s;" },
              h("span", { "aria-hidden": "true", "style": "position: absolute; left: 50%; top: 50%; width: 260%; aspect-ratio: 1 / 1; background: conic-gradient(from 0deg, rgba(11,111,224,0.18) 0deg, rgba(11,111,224,0.18) 230deg, #4C9AFF 300deg, #FFFFFF 335deg, rgba(11,111,224,0.18) 360deg); animation: tfm-spinC 6s linear infinite;" }),
              h("div", { "style": "position: relative; border-radius: 26.5px; overflow: hidden; background: #FFFFFF;" },
                h("div", { "class": "dk", "style": "position: relative; overflow: hidden; padding: 28px 22px 24px; background: linear-gradient(180deg, #0E1730 0%, #090D17 100%); color: #FFFFFF; display: flex; flex-direction: column; gap: 22px;" },
                  h("div", { "aria-hidden": "true", "style": "position: absolute; left: 100%; top: 100%; width: 560px; height: 560px; border-radius: 50%; background: conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(76,154,255,0.05) 300deg, rgba(76,154,255,0.30) 360deg); animation: tfm-spinC 9s linear infinite; pointer-events: none;" }),
                  h("div", { "style": "position: relative; display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                    h("span", { "style": "display: inline-flex; align-items: center; gap: 9px;" },
                      h("svg", { "width": "22", "height": "22", "viewbox": "0 0 24 24", "aria-hidden": "true" },
                        h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
                        h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#4C9AFF" }),
                        h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
                        h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF" }),
                        h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF" }),
                        h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF" }),
                        h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF" })
                      ),
                      h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.03em;" },
                        "Swarm Pro"
                      )
                    ),
                    h("span", { "style": "font-size: 11px; font-weight: 700; color: #FFFFFF; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); border-radius: 999px; padding: 4px 10px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);" },
                      "Tout inclus"
                    )
                  ),
                  h("div", { "style": "position: relative; height: 96px;" },
                    h("div", { "style": `position: absolute; inset: 0; display: flex; flex-direction: column; gap: 8px; opacity: ${$t($v.oM)}; transform: ${$t($v.trM)}; transition: opacity 0.35s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                      h("span", { "style": "display: flex; align-items: baseline; gap: 8px;" },
                        h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 64px; font-weight: 700; letter-spacing: -0.06em; line-height: 0.95;" },
                          "49 €"
                        ),
                        h("span", { "style": "font-size: 16px; color: #9AA3B2;" },
                          "/ mois"
                        )
                      ),
                      h("span", { "style": "font-size: 14px; color: #9AA3B2;" },
                        "Facturé chaque mois."
                      )
                    ),
                    h("div", { "style": `position: absolute; inset: 0; display: flex; flex-direction: column; gap: 8px; opacity: ${$t($v.oY)}; transform: ${$t($v.trY)}; transition: opacity 0.35s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                      h("span", { "style": "display: flex; align-items: baseline; gap: 8px;" },
                        h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 64px; font-weight: 700; letter-spacing: -0.06em; line-height: 0.95;" },
                          "32,50 €"
                        ),
                        h("span", { "style": "font-size: 16px; color: #9AA3B2;" },
                          "/ mois"
                        )
                      ),
                      h("span", { "style": "font-size: 14px; color: #9AA3B2;" },
                        "Facturé 390 € par an au lieu de 588 €."
                      )
                    )
                  ),
                  h("a", { "href": "#paiement", "class": "tap", "style": "position: relative; display: flex; align-items: center; justify-content: center; gap: 14px; height: 58px; box-sizing: border-box; padding: 0 16px; border-radius: 18px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; animation: tfm-glowDk 3s ease-in-out infinite;" },
                    "Passer Pro",
                    h("span", { "style": "width: 36px; height: 36px; border-radius: 11px; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.40); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                      h("svg", { "width": "14", "height": "14", "viewbox": "0 0 16 16", "aria-hidden": "true" },
                        h("path", { "d": "M6 3.5L10.5 8 6 12.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  ),
                  h("div", { "style": "position: relative; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 16px; font-size: 13px; color: #C9CED6;" },
                    h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                      h("svg", { "width": "13", "height": "13", "viewbox": "0 0 24 24", "aria-hidden": "true" },
                        h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Annulable en un clic"
                    ),
                    h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                      h("svg", { "width": "13", "height": "13", "viewbox": "0 0 24 24", "aria-hidden": "true" },
                        h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Sans engagement"
                    ),
                    h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                      h("svg", { "width": "13", "height": "13", "viewbox": "0 0 24 24", "aria-hidden": "true" },
                        h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Paiement sécurisé"
                    )
                  )
                ),
                h("div", { "style": "padding: 22px 22px 10px; display: flex; flex-direction: column;" },
                  h("span", { "style": "font-size: 15px; font-weight: 600;" },
                    "Tout ce que tu débloques"
                  ),
                  ($l($v.groups)).map((g) => [
                    h("div", { "style": `padding: 16px 0; border-top: ${$t(g?.line)}; display: flex; flex-direction: column; gap: 4px;` },
                      h("span", { "style": "display: flex; align-items: baseline; gap: 8px; padding-bottom: 4px;" },
                        h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #0B6FE0;" },
                          $t(g?.n)
                        ),
                        h("span", { "style": "font-size: 14px; font-weight: 700;" },
                          $t(g?.title)
                        ),
                        h("span", { "style": "font-size: 13px; color: #5F656E;" },
                          $t(g?.sub)
                        )
                      ),
                      ($l(g?.items)).map((f) => [
                        h("div", { "style": "display: flex; align-items: center; gap: 12px; min-height: 44px;" },
                          h("span", { "style": "width: 32px; height: 32px; border-radius: 10px; background: #EEF4FF; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                            h("svg", { "width": "16", "height": "16", "viewbox": "0 0 24 24", "aria-hidden": "true" },
                              h("path", { "d": f?.d, "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ),
                          h("span", { "style": "font-size: 15px; font-weight: 500; line-height: 1.35;" },
                            $t(f?.t)
                          )
                        )
                      ])
                    )
                  ])
                )
              )
            )
          ),
          h("section", { "aria-label": "Le Radar en chiffres", "style": "padding: 40px 20px 0;" },
            h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid #E2E4E9; border-bottom: 1px solid #E2E4E9;" },
              ($l($v.nums)).map((n) => [
                h("div", { "style": `padding: 18px 0 18px ${$t(n?.pl)}; border-left: ${$t(n?.line)}; display: flex; flex-direction: column; gap: 4px;` },
                  h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: -0.04em; line-height: 1;" },
                    $t(n?.v)
                  ),
                  h("span", { "style": "font-size: 12px; line-height: 1.35; color: #5F656E;" },
                    $t(n?.l)
                  )
                )
              ])
            )
          ),
          h("section", { "aria-labelledby": "qt", "style": "padding: 64px 20px 120px; display: flex; flex-direction: column; gap: 14px;" },
            h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.04em; color: #5F656E;" },
              h("span", { "style": "color: #0B6FE0;" },
                "["
              ),
              " QUESTIONS ",
              h("span", { "style": "color: #0B6FE0;" },
                "]"
              )
            ),
            h("h2", { "id": "qt", "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 32px; letter-spacing: -0.045em; line-height: 1.05;" },
              "Avant de passer Pro."
            ),
            h("div", { "style": "margin-top: 6px; border-top: 1px dashed #D3D7DE;" },
              ($l($v.qs)).map((f) => [
                h("div", { "style": "border-bottom: 1px dashed #D3D7DE;" },
                  h("button", { "type": "button", "onclick": f?.toggle, "aria-expanded": f?.open, "style": "width: 100%; min-height: 64px; background: transparent; border: 0; padding: 16px 0; box-sizing: border-box; display: flex; align-items: center; gap: 14px; font: inherit; color: #111216; text-align: left; cursor: pointer;" },
                    h("span", { "style": "flex: 1 1 auto; font-size: 17px; font-weight: 500; line-height: 1.35;" },
                      $t(f?.q)
                    ),
                    h("span", { "aria-hidden": "true", "style": `width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: ${$t(f?.iconBg)}; transition: background 0.3s ease;` },
                      h("svg", { "width": "12", "height": "12", "viewbox": "0 0 14 14", "style": `transform: ${$t(f?.rot)}; transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                        h("path", { "d": "M7 2v10M2 7h10", "stroke": f?.iconInk, "stroke-width": "1.8", "stroke-linecap": "round" })
                      )
                    )
                  ),
                  h("div", { "style": `display: grid; grid-template-rows: ${$t(f?.rows)}; transition: grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                    h("div", { "style": "overflow: hidden;" },
                      h("p", { "style": "margin: 0; padding: 0 0 20px; font-size: 15px; line-height: 1.6; color: #4A4F57;" },
                        $t(f?.a)
                      )
                    )
                  )
                )
              ])
            )
          ),
          h("div", { "style": "position: sticky; bottom: 0; z-index: 40; margin-top: -100px; height: 100px; box-sizing: border-box; padding: 0 12px 14px; display: flex; align-items: flex-end; pointer-events: none;" },
            h("div", { "style": "pointer-events: auto; flex: 1 1 auto; display: flex; align-items: center; gap: 12px; height: 72px; box-sizing: border-box; padding: 0 8px 0 18px; border-radius: 24px; background: rgba(255,255,255,0.86); border: 1px solid #FFFFFF; backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); box-shadow: 0 18px 44px rgba(16,24,40,0.20), inset 0 1px 0 #FFFFFF;" },
              h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column;" },
                h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15;" },
                  $t($v.barPrice)
                ),
                h("span", { "style": "font-size: 12px; color: #5F656E; white-space: nowrap;" },
                  $t($v.barNote)
                )
              ),
              h("a", { "href": "#paiement", "class": "tap", "style": "display: inline-flex; align-items: center; gap: 10px; height: 56px; box-sizing: border-box; padding: 0 20px; border-radius: 18px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; white-space: nowrap; box-shadow: inset 0 1px 0 rgba(255,255,255,0.45), 0 10px 24px rgba(11,111,224,0.35);" },
                "Passer Pro",
                h("svg", { "width": "14", "height": "14", "viewbox": "0 0 16 16", "aria-hidden": "true" },
                  h("path", { "d": "M6 3.5L10.5 8 6 12.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          )
        ),
        h("footer", { "class": "dk", "style": "position: relative; overflow: hidden; flex: 1 0 auto; display: flex; flex-direction: column; background-color: #05070C; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px); color: #FFFFFF;" },
          h("div", { "style": "flex: 1 0 auto; padding: 48px 20px 24px; display: flex; flex-direction: column; gap: 36px;" },
            h("div", { "style": "display: flex; flex-direction: column; gap: 12px;" },
              h("a", { "href": "/", "style": "display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #FFFFFF;" },
                h("svg", { "width": "26", "height": "26", "viewbox": "0 0 24 24", "aria-hidden": "true" },
                  h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
                  h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#4C9AFF" }),
                  h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
                  h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF" }),
                  h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF" }),
                  h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF" }),
                  h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF" })
                ),
                h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.03em; color: #FFFFFF;" },
                  "swarm"
                )
              ),
              h("p", { "style": "margin: 0; font-size: 15px; line-height: 1.55; color: #9AA3B2;" },
                "Les apps et les formats qui explosent sur TikTok, Instagram et YouTube Shorts, et les créateurs derrière."
              )
            ),
            h("nav", { "aria-label": "Pied de page", "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 16px;" },
              ($l($v.cols)).map((c) => [
                h("div", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                  h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #8A93A3; padding-bottom: 6px;" },
                    $t(c?.title)
                  ),
                  ($l(c?.links)).map((l) => [
                    h("a", { "href": l?.href, "style": "font-size: 15px; text-decoration: none; min-height: 40px; display: flex; align-items: center;" },
                      $t(l?.t)
                    )
                  ])
                )
              ])
            ),
            h("div", { "style": "display: flex; flex-wrap: wrap; gap: 4px 20px; font-size: 14px;" },
              h("a", { "href": "#cgv", "style": "text-decoration: none; min-height: 40px; display: inline-flex; align-items: center;" },
                "CGV"
              ),
              h("a", { "href": "#confidentialite", "style": "text-decoration: none; min-height: 40px; display: inline-flex; align-items: center;" },
                "Confidentialité"
              ),
              h("a", { "href": "#mentions", "style": "text-decoration: none; min-height: 40px; display: inline-flex; align-items: center;" },
                "Mentions légales"
              ),
              h("a", { "href": "#contact", "style": "text-decoration: none; min-height: 40px; display: inline-flex; align-items: center;" },
                "Contact"
              )
            ),
            h("div", { "style": "margin-top: auto; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 13px; color: #8A93A3;" },
              h("span", null,
                "© 2026 Swarm"
              ),
              h("span", { "style": "font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em;" },
                "Spot it. Copy it. Launch it."
              )
            )
          )
        ),
        ($v.menuOpen) ? [
          h("div", { "style": "position: fixed; inset: 0; z-index: 80; background: rgba(5,7,12,0.42); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);" },
            h("div", { "role": "dialog", "aria-modal": "true", "aria-label": "Menu", "style": "margin: 10px 12px 0; border-radius: 28px; background: rgba(255,255,255,0.97); box-shadow: 0 30px 70px rgba(16,24,40,0.28); padding: 6px 6px 16px; animation: tfm-sheetDown 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
              h("div", { "style": "display: flex; align-items: center; height: 56px; padding: 0 0 0 14px;" },
                h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; margin-right: auto;" },
                  h("svg", { "width": "24", "height": "24", "viewbox": "0 0 24 24", "aria-hidden": "true" },
                    h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#0B6FE0" }),
                    h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#0B6FE0" }),
                    h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#0B6FE0" }),
                    h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#0E0F12" }),
                    h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#0E0F12" }),
                    h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#0E0F12" }),
                    h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#0E0F12" })
                  ),
                  h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-weight: 800; font-size: 20px; letter-spacing: -0.03em; color: #0E0F12;" },
                    "swarm"
                  )
                ),
                h("button", { "type": "button", "class": "tap", "onclick": $v.closeMenu, "aria-label": "Fermer le menu", "style": "width: 44px; height: 44px; border: 0; border-radius: 50%; background: #F1F3F6; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;" },
                  h("svg", { "width": "14", "height": "14", "viewbox": "0 0 14 14", "aria-hidden": "true" },
                    h("path", { "d": "M3 3l8 8M11 3l-8 8", "stroke": "#0E0F12", "stroke-width": "1.8", "stroke-linecap": "round" })
                  )
                )
              ),
              h("nav", { "aria-label": "Menu", "style": "display: flex; flex-direction: column; padding: 4px 10px 0;" },
                ($l($v.mnav)).map((m) => [
                  h("a", { "href": m?.href, "class": "tap", "onclick": $v.closeMenu, "style": "display: flex; align-items: center; gap: 14px; min-height: 60px; padding: 0 6px; border-bottom: 1px solid #EEF0F3; text-decoration: none; color: #0E0F12;" },
                    h("span", { "style": "width: 36px; height: 36px; border-radius: 11px; background: #EAF2FF; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                      h("svg", { "width": "18", "height": "18", "viewbox": "0 0 24 24", "aria-hidden": "true" },
                        h("path", { "d": m?.d, "fill": "none", "stroke": "#0B6FE0", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    h("span", { "style": "flex: 1 1 auto; display: flex; flex-direction: column;" },
                      h("span", { "style": "font-size: 17px; font-weight: 600;" },
                        $t(m?.t)
                      ),
                      h("span", { "style": "font-size: 13px; color: #5F656E;" },
                        $t(m?.sub)
                      )
                    ),
                    h("svg", { "width": "14", "height": "14", "viewbox": "0 0 16 16", "aria-hidden": "true" },
                      h("path", { "d": "M6 3.5L10.5 8 6 12.5", "fill": "none", "stroke": "#9AA0A8", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ])
              ),
              h("div", { "style": "display: flex; flex-direction: column; gap: 8px; padding: 16px 10px 0;" },
                h("a", { "href": "/", "class": "tap", "onclick": $v.closeMenu, "style": "display: flex; align-items: center; justify-content: center; gap: 14px; height: 56px; box-sizing: border-box; padding: 0 16px; border-radius: 18px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; box-shadow: 0 10px 24px rgba(11,111,224,0.30), inset 0 1px 0 rgba(255,255,255,0.45);" },
                  "Trouver mon app",
                  h("span", { "style": "width: 36px; height: 36px; border-radius: 11px; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.40); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                    h("svg", { "width": "14", "height": "14", "viewbox": "0 0 16 16", "aria-hidden": "true" },
                      h("path", { "d": "M6 3.5L10.5 8 6 12.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                h("a", { "href": "#connexion", "class": "tap", "onclick": $v.closeMenu, "style": "display: flex; align-items: center; justify-content: center; height: 52px; border-radius: 18px; border: 1px solid #D3D7DE; color: #0E0F12; text-decoration: none; font-size: 16px; font-weight: 600;" },
                  "Se connecter"
                )
              )
            )
          )
        ] : null
      )
    ];
  }
}
