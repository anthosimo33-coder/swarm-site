// Généré par scripts/dc2preact.py depuis design/LPMobile.dc.html — ne pas modifier à la main.
import { h } from 'preact';
import { DCLogic, $t, $l } from '../runtime.js';

export default class LPMobile extends DCLogic {
  componentDidMount() {
    this.t0 = Date.now();
    this.timer = setInterval(() => this.setState({ now: Date.now() }), 90);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  renderVals() {
    const st = this.state || {};
    const el = Math.max(0, (st.now || 0) - (this.t0 || 0));
    const blue = '#0B6FE0';

    // Barre de recherche qui s'écrit seule (mots courts : tiennent sur 390 px)
    const words = ['une app de couple', 'une app d’études', 'une app de foi', 'une app de sport', 'une app IA'];
    const spans = words.map((w) => w.length * 70 + 1400 + w.length * 35 + 300);
    const total = spans.reduce((a, b) => a + b, 0);
    let tt = el % total;
    let wi = 0;
    while (tt >= spans[wi]) { tt -= spans[wi]; wi += 1; }
    const w = words[wi];
    const typeMs = w.length * 70;
    let n;
    if (tt < typeMs) n = Math.floor(tt / 70);
    else if (tt < typeMs + 1400) n = w.length;
    else if (tt < typeMs + 1400 + w.length * 35) n = w.length - Math.floor((tt - typeMs - 1400) / 35);
    else n = 0;


    // Playbook : vidéos qui défilent + celle décortiquée
    const arcData = [
      ['Luv or Pop', 'One question turned into a whole debate…', '7,5 M', '@luvorpop', 'Repérée à', 'H+26'],
      ['Knowunity', 'cuando me dan el examen y es igual a lo que estudié', '5,7 M', '@estudio2bach', 'Un compte de', '592 abonnés'],
      ['Astra AI', 'Sur AstraAi il y a tout sur le corps humain', '2,4 M', '@isskos_ia', 'Enregistrée', '47 k fois'],
      ['What Brandon Thinks', 'Desde cuándo WhatsApp tiene esto??', '3,1 M', '@maris_ecret4', 'Fois sa normale', '751×'],
      ['DJ Kartier', 'That moment when the synth sounds familiar…', '5,5 M', '@djkartierapp', 'Repérée à', 'H+43'],
      ['Ora AI', 'Je fais croire à ma mère que mamie s’est envolée', '3,0 M', '@evanorthh', 'Langue', 'français'],
      ['Snitchy', 'a game where you stalk a missing girl’s phone', '2,2 M', '@_miasecrets', 'Un compte de', '339 abonnés'],
      ['Astra AI', 'Belajar TKA dari mana??', '5,6 M', '@studyclubbyinda', 'Enregistrée', '253 k fois'],
      ['SSME', 'Get this live wallpaper immediately', '3,2 M', '@zoe264472', 'En 3 jours', '× 3,7'],
      ['Love8', 'His status, location, battery, all in one', '2,6 M', '@yuyoyouu', 'Partagée', '32 k fois']
    ];
    const bgs = [
      'linear-gradient(150deg, #5A2E45 0%, #16090F 55%, #3A1D2C 100%)',
      'linear-gradient(150deg, #28405E 0%, #0B1424 55%, #1B2C44 100%)',
      'linear-gradient(150deg, #4B3A33 0%, #1A1412 55%, #2E241F 100%)',
      'linear-gradient(150deg, #2F4A3A 0%, #0B140F 55%, #203328 100%)',
      'linear-gradient(150deg, #4A3F6E 0%, #120E1F 55%, #2E2747 100%)',
      'linear-gradient(150deg, #6A4A2B 0%, #170F08 55%, #43301C 100%)'
    ];
    const reelOne = arcData.map((d, i) => ({ app: d[0], hook: d[1], views: d[2] + ' vues', handle: d[3], bg: bgs[i % bgs.length] }));
    const ci = Math.floor(el / 2600) % arcData.length;
    const c = arcData[ci];

    // Avis : emplacements à remplir avec de vrais avis
    const briefs = [
      ['« [L’app qu’il a trouvée avec Swarm, et pourquoi celle-là] »', '[Prénom N.]', '[Ce qu’il a lancé · pays]'],
      ['« [Son premier résultat, avec un chiffre : vues, clients ou revenus] »', '[Prénom N.]', '[App lancée]'],
      ['« [Le format copié qui a marché du premier coup] »', '[Prénom N.]', '[Niche]'],
      ['« [Le marché qu’il n’aurait jamais testé sans Swarm] »', '[Prénom N.]', '[App lancée]'],
      ['« [Ce qu’il dirait à un pote qui hésite] »', '[Prénom N.]', '[Niche]']
    ];

    const openQ = st.open === undefined ? 0 : st.open;
    const faqData = [
      ['Ça marche sur quels marchés ?', 'Sur tous : choisis un pays ou une langue, tu vois les apps, les formats et les créateurs qui y explosent en ce moment.'],
      ['Je débute, est-ce que c’est pour moi ?', 'Oui. Tu choisis un marché et une niche, Swarm te montre les apps et les formats qui y explosent en ce moment, et les créateurs qui les portent. Pas besoin de savoir coder.'],
      ['Les revenus estimés, vous les sortez d’où ?', 'Comme Sensor Tower pour les apps : les vues des comptes de l’app multipliées par ce que rapportent 1 000 vues (2,50 à 3,50 €), recoupées avec les téléchargements et le prix affiché. Tu vois la fourchette et le calcul.'],
      ['C’est légal de copier une app ?', 'Copier une niche, un modèle, une stratégie de contenu : oui, tout le marché le fait. Copier une marque ou du code : non, et on ne t’y aide pas.'],
      ['Les données sont à jour ?', 'Les comptes sont relus en continu, et une vidéo qui explose est repérée dès ses premières heures.'],
      ['Y a-t-il une limite d’utilisation ?', 'Non. Avec Pro, tu as toutes les apps, tous les marchés, toutes les fiches et toutes les vidéos, sans limite.'],
      ['Je peux annuler à tout moment ?', 'Oui, en un clic depuis ton compte. Aucun engagement sur l’offre mensuelle.']
    ];
    const ic = {
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      videos: 'M4 5h16v14H4zM10 9l5 3-5 3z',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      tarifs: 'M4 12l8-8h8v8l-8 8zM15.5 8.5h.01',
      faq: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.5M12 17h.01'
    };
    const menuOpen = !!st.menu;
    const avisOpen = !!st.avis;
    const mk = (title, links) => ({ title, links: links.map((l) => ({ t: l[0], href: l[1] })) });

    return {
      typed: w.slice(0, Math.max(0, n)),
      miniApps: [
        { ini: 'L', name: 'Luv or Pop', v: '7,5 M · H+26', bg: '#0E0F12', chip: blue, ink: '#FFFFFF' },
        { ini: 'D', name: 'DJ Kartier', v: '5,5 M · H+43', bg: '#3D4450', chip: '#EEF4FF', ink: blue },
        { ini: 'A', name: 'Astra AI', v: '2 333×', bg: blue, chip: '#EEF4FF', ink: blue },
        { ini: 'W', name: 'What Brandon Thinks', v: '751×', bg: '#28405E', chip: '#EEF4FF', ink: blue }
      ],
      creators: [
        { ini: 'S', handle: '@studyclubbyinda', note: 'Enregistrée 253 k fois', v: '5,6 M', bg: '#4A3F6E' },
        { ini: 'I', handle: '@ivylearns8', note: '145× sa normale', v: '2,6 M', bg: '#28405E' },
        { ini: 'I', handle: '@isskos_ia', note: 'Enregistrée 47 k fois', v: '2,4 M', bg: '#5A2E45' }
      ],
      reel: reelOne.concat(reelOne),
      cur: { app: c[0], label: c[4], value: c[5] },
      curO: (el % 2600) < 2350 ? 1 : 0,
      avis: briefs.map((b) => ({ q: b[0], name: b[1], role: b[2] })),
      avisOpen,
      avisMax: avisOpen ? '2400px' : '640px',
      avisMask: avisOpen ? 'none' : 'linear-gradient(to bottom, #000 52%, transparent 100%)',
      avisBtnMt: avisOpen ? '20px' : '-84px',
      avisBtn: avisOpen ? 'Voir moins d’avis' : 'Voir plus d’avis',
      toggleAvis: () => this.setState({ avis: !avisOpen }),
      faqs: faqData.map((d, i) => {
        const on = openQ === i;
        return {
          q: d[0], a: d[1], open: on,
          rows: on ? '1fr' : '0fr',
          bg: on ? 'linear-gradient(180deg, rgba(76,154,255,0.12), rgba(76,154,255,0.04))' : 'rgba(255,255,255,0.03)',
          border: on ? 'rgba(76,154,255,0.45)' : 'rgba(255,255,255,0.08)',
          rot: on ? 'rotate(180deg)' : 'rotate(0deg)',
          chev: on ? '#4C9AFF' : '#9AA3B2',
          toggle: () => this.setState({ open: on ? -1 : i })
        };
      }),
      menuOpen,
      openMenu: () => this.setState({ menu: true }),
      closeMenu: () => this.setState({ menu: false }),
      mnav: [
        { t: 'Apps qui explosent', sub: 'En ce moment, sur n’importe quel marché', href: '#produit', d: ic.apps },
        { t: 'Formats qui explosent', sub: 'Les hooks, les sons et les formats', href: '#exemple', d: ic.videos },
        { t: 'Créateurs', sub: 'Les comptes derrière chaque app', href: '#produit', d: ic.createurs },
        { t: 'Tarifs', sub: 'Un seul plan, tout inclus', href: '/tarifs', d: ic.tarifs },
        { t: 'FAQ', sub: 'Les questions fréquentes', href: '#faq', d: ic.faq }
      ],
      cols: [
        mk('Produit', [['Comment ça marche', '#produit'], ['Exemple', '#exemple'], ['Tarifs', '/tarifs'], ['FAQ', '#faq']]),
        mk('Fonctionnalités', [['Apps qui explosent', '#produit'], ['Formats qui explosent', '#exemple'], ['Créateurs', '#produit'], ['Tous les marchés', '#produit'], ['Revenus estimés', '#produit']])
      ]
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      h("div", { "style": "position: relative; display: flex; flex-direction: column; min-height: 100vh; background: linear-gradient(180deg, #B9DCFF 0px, #DCEDFF 360px, #EEF4FB 760px, #F5F6F8 1100px, #F3F3F5 1400px); font-family: Inter, system-ui, sans-serif; color: #111216; font-size: 16px; line-height: 1.5; overflow-x: clip;" },
        h("div", { "aria-hidden": "true", "style": "position: absolute; left: 0; right: 0; top: 0; height: 1200px; overflow: hidden; pointer-events: none;" },
          h("div", { "style": "position: absolute; left: -30%; top: 90px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,255,255,0.85), transparent); animation: lpm-driftA 16s ease-in-out infinite;" }),
          h("div", { "style": "position: absolute; right: -35%; top: 10px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(76,154,255,0.30), transparent); animation: lpm-driftB 14s ease-in-out infinite;" })
        ),
        h("div", { "style": "position: relative; display: flex; flex-direction: column;" },
          h("header", { "style": "position: sticky; top: 0; z-index: 50; padding: 10px 12px 0;" },
            h("div", { "style": "display: flex; align-items: center; gap: 2px; height: 56px; padding: 0 6px 0 14px; box-sizing: border-box; border-radius: 999px; background: rgba(255,255,255,0.64); border: 1px solid rgba(255,255,255,0.92); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); box-shadow: 0 8px 24px rgba(16,24,40,0.10), inset 0 1px 0 #FFFFFF;" },
              h("a", { "href": "#top", "aria-label": "Swarm, haut de page", "style": "display: inline-flex; align-items: center; gap: 8px; margin-right: auto; text-decoration: none; color: #0E0F12;" },
                h("svg", { "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true" },
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
              h("button", { "type": "button", "class": "tap", "onClick": $v.openMenu, "aria-label": "Ouvrir le menu", "aria-expanded": $v.menuOpen, "style": "width: 44px; height: 44px; flex-shrink: 0; border: 0; border-radius: 50%; background: #0E0F12; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 14px rgba(14,15,18,0.22);" },
                h("svg", { "width": "18", "height": "18", "viewBox": "0 0 18 18", "aria-hidden": "true" },
                  h("path", { "d": "M3 6.5h12M3 11.5h12", "stroke": "#FFFFFF", "stroke-width": "1.8", "stroke-linecap": "round" })
                )
              )
            )
          ),
          h("section", { "id": "top", "style": "position: relative; padding: 28px 20px 0; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 20px;" },
            h("div", { "style": "display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.95); border-radius: 999px; padding: 4px 11px; font-size: 12px; line-height: 1.4; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); animation: lpm-blurIn 0.8s ease-out both;" },
              h("span", { "style": "width: 6px; height: 6px; border-radius: 50%; background: #0B6FE0; animation: lpm-pulse 1.8s infinite;" }),
              h("span", null,
                h("span", { "style": "font-weight: 600;" },
                  "+100 000 comptes"
                ),
                " passés au crible"
              )
            ),
            h("h1", { "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(34px, 10.2vw, 46px); line-height: 1.08; letter-spacing: -0.045em; animation: lpm-blurIn 1s cubic-bezier(0.2, 0.7, 0.2, 1) both; animation-delay: 0.12s;" },
              "Lance ton premier business en copiant une app",
              h("span", { "aria-hidden": "true", "style": "display: inline-block; position: relative; vertical-align: -0.06em; width: 1.5em; height: 0.82em; margin: 0 0.12em;" },
                h("span", { "style": "position: absolute; left: 0; top: 0; width: 0.82em; height: 0.82em; border-radius: 0.22em; background: #0E0F12; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0.08em 0.22em rgba(16,24,40,0.28); animation: lpm-fanA 4s ease-in-out infinite;" },
                  h("span", { "style": "font-size: 0.4em; font-weight: 800; letter-spacing: 0;" },
                    "A"
                  )
                ),
                h("span", { "style": "position: absolute; left: 0.34em; top: 0; width: 0.82em; height: 0.82em; border-radius: 0.22em; background: #0B6FE0; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0.08em 0.22em rgba(11,111,224,0.35); animation: lpm-fanB 4s ease-in-out infinite;" },
                  h("span", { "style": "font-size: 0.4em; font-weight: 800; letter-spacing: 0;" },
                    "R"
                  )
                ),
                h("span", { "style": "position: absolute; left: 0.68em; top: 0; width: 0.82em; height: 0.82em; border-radius: 0.22em; background: #3D4450; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0.08em 0.22em rgba(16,24,40,0.28); animation: lpm-fanC 4s ease-in-out infinite;" },
                  h("span", { "style": "font-size: 0.4em; font-weight: 800; letter-spacing: 0;" },
                    "L"
                  )
                )
              ),
              "qui explose en ce moment",
              h("span", { "aria-hidden": "true", "style": "display: inline-flex; align-items: center; gap: 0.1em; vertical-align: 0.08em; margin-left: 0.16em; height: 0.74em; padding: 0 0.24em 0 0.18em; border-radius: 999px; background: #0B6FE0; color: #FFFFFF; box-shadow: 0 0.1em 0.3em rgba(11,111,224,0.35);" },
                h("svg", { "viewBox": "0 0 40 20", "style": "height: 0.4em; width: 0.8em;" },
                  h("path", { "d": "M2 16 L12 11 L20 13 L30 5 L38 3", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "60", "style": "animation: lpm-drawS 3.2s ease-in-out infinite;" })
                ),
                h("span", { "style": "font-family: Inter, sans-serif; font-size: 0.32em; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap;" },
                  "7,5 M vues"
                )
              )
            ),
            h("p", { "style": "margin: 0; font-size: 17px; line-height: 1.5; color: #3A3F47; animation: lpm-blurIn 0.9s ease-out both; animation-delay: 0.3s;" },
              "Repère les apps et les formats qui explosent en ce moment sur les réseaux, sur n'importe quel marché, et les créateurs qui les font exploser."
            ),
            h("a", { "href": "/tarifs", "aria-label": "Trouver mon app", "class": "tap", "style": "width: 100%; display: flex; flex-direction: column; gap: 8px; padding: 8px; box-sizing: border-box; border-radius: 26px; background: rgba(255,255,255,0.72); border: 1px solid #FFFFFF; backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 24px 60px rgba(16,24,40,0.14), 0 0 0 5px rgba(255,255,255,0.35), inset 0 1px 0 #FFFFFF; text-decoration: none; color: #0E0F12; animation: lpm-blurIn 0.9s ease-out both; animation-delay: 0.45s;" },
              h("span", { "aria-hidden": "true", "style": "display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 12px; text-align: left; font-size: 16px; color: #656B74; white-space: nowrap; overflow: hidden;" },
                h("svg", { "width": "18", "height": "18", "viewBox": "0 0 20 20", "style": "flex-shrink: 0;" },
                  h("circle", { "cx": "9", "cy": "9", "r": "5.8", "fill": "none", "stroke": "#656B74", "stroke-width": "1.8" }),
                  h("path", { "d": "M13.4 13.4L17 17", "stroke": "#656B74", "stroke-width": "1.8", "stroke-linecap": "round" })
                ),
                h("span", null,
                  "Je veux lancer ",
                  h("span", { "style": "color: #0E0F12; font-weight: 600;" },
                    $t($v.typed)
                  ),
                  h("span", { "style": "display: inline-block; width: 2px; height: 1.1em; background: #0B6FE0; vertical-align: -0.2em; margin-left: 2px; animation: lpm-caret 1s steps(1) infinite;" })
                )
              ),
              h("span", { "style": "display: flex; align-items: center; justify-content: center; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 5px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                "Trouver mon app",
                h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                    h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          h("section", { "aria-label": "Vidéo de présentation", "style": "position: relative; padding: 32px 16px 0;" },
            h("div", { "style": "position: relative; padding: 6px; border-radius: 28px; background: linear-gradient(180deg, #1C2230 0%, #0B0E15 100%); box-shadow: 0 2px 4px rgba(16,24,40,0.10), 0 30px 70px rgba(16,24,40,0.26), inset 0 1px 0 rgba(255,255,255,0.12); animation: lpm-blurIn 1s ease-out both; animation-delay: 0.55s;" },
              h("div", { "role": "img", "aria-label": "Emplacement de la vidéo motion, à venir", "style": "position: relative; aspect-ratio: 16 / 9; border-radius: 22px; overflow: hidden; background: radial-gradient(70% 70% at 50% 62%, #FFFFFF 0%, #F1F3F6 55%, #E2E5EA 100%); display: flex; align-items: center; justify-content: center;" },
                h("span", { "style": "position: absolute; top: 10px; right: 10px; display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px 0 10px; border-radius: 999px; background: rgba(14,15,18,0.30); color: #FFFFFF; font-size: 12px; font-weight: 500; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);" },
                  h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    h("path", { "d": "M4 9h4l5-4v14l-5-4H4z", "fill": "#FFFFFF" }),
                    h("path", { "d": "M17 9.5l4 5M21 9.5l-4 5", "stroke": "#FFFFFF", "stroke-width": "1.8", "stroke-linecap": "round" })
                  ),
                  "Activer le son"
                ),
                h("div", { "style": "width: 82%; height: 46px; box-sizing: border-box; padding: 0 16px; border-radius: 14px; background: rgba(255,255,255,0.94); box-shadow: 0 0 0 1px #FFFFFF, 0 10px 28px rgba(16,24,40,0.10), 0 8px 26px rgba(11,111,224,0.22); display: flex; align-items: center; font-family: 'Inter Tight', sans-serif; font-size: 17px; letter-spacing: -0.03em; white-space: nowrap;" },
                  h("span", { "style": "font-weight: 800;" },
                    "Vidéo motion :"
                  ),
                  h("span", { "style": "font-weight: 500;" },
                    " à venir"
                  ),
                  h("span", { "style": "display: inline-block; width: 2px; height: 0.95em; margin-left: 3px; background: #0B6FE0; animation: lpm-caret 1s steps(1) infinite;" })
                )
              )
            )
          ),
          h("section", { "aria-label": "Plateformes incluses", "style": "padding: 26px 16px 8px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;" },
            h("span", { "style": "font-size: 15px; color: #4A4F57;" },
              "Toutes les plateformes incluses"
            ),
            h("div", { "style": "display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 10px 14px; font-size: 14px; font-weight: 600; letter-spacing: -0.01em; color: #0E0F12; white-space: nowrap;" },
              h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  h("path", { "d": "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z", "fill": "#25F4EE", "transform": "translate(-0.7 -0.7)" }),
                  h("path", { "d": "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z", "fill": "#FE2C55", "transform": "translate(0.7 0.7)" }),
                  h("path", { "d": "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z", "fill": "#0E0F12" })
                ),
                "TikTok"
              ),
              h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  h("defs", null,
                    h("linearGradient", { "id": "igM", "x1": "0", "y1": "1", "x2": "1", "y2": "0" },
                      h("stop", { "offset": "0%", "stop-color": "#FEDA75" }),
                      h("stop", { "offset": "30%", "stop-color": "#FA7E1E" }),
                      h("stop", { "offset": "60%", "stop-color": "#D62976" }),
                      h("stop", { "offset": "100%", "stop-color": "#4F5BD5" })
                    )
                  ),
                  h("rect", { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "5.5", "fill": "none", "stroke": "url(#igM)", "stroke-width": "2.2" }),
                  h("circle", { "cx": "12", "cy": "12", "r": "4.1", "fill": "none", "stroke": "url(#igM)", "stroke-width": "2.2" }),
                  h("circle", { "cx": "17.2", "cy": "6.8", "r": "1.3", "fill": "url(#igM)" })
                ),
                "Instagram"
              ),
              h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  h("rect", { "x": "2", "y": "5", "width": "20", "height": "14", "rx": "4.5", "fill": "#FF0033" }),
                  h("path", { "d": "M10 9l5.2 3-5.2 3z", "fill": "#FFFFFF" })
                ),
                "YouTube Shorts"
              )
            )
          ),
          h("section", { "id": "produit", "style": "padding: 72px 0 72px; display: flex; flex-direction: column; gap: 16px;" },
            h("div", { "style": "padding: 0 20px; display: flex; flex-direction: column; gap: 14px;" },
              h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.04em; color: #5F656E;" },
                h("span", { "style": "color: #0B6FE0;" },
                  "["
                ),
                " RADAR ",
                h("span", { "style": "color: #0B6FE0;" },
                  "]"
                )
              ),
              h("h2", { "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 34px; line-height: 1.05; letter-spacing: -0.045em;" },
                "Les apps qui explosent, en ce moment."
              ),
              h("p", { "style": "margin: 0; font-size: 16px; line-height: 1.55; color: #4A4F57;" },
                "Plus de 1 000 apps et 100 000 comptes suivis en continu sur TikTok, Instagram et YouTube Shorts, sur tous les marchés. Choisis un marché, une niche, et vois ce qui y explose."
              )
            ),
            h("div", { "class": "snap", "role": "list", "aria-label": "Ce que tu vois dans Swarm", "style": "margin-top: 12px; display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding: 0 20px; padding: 0 20px 8px; scrollbar-width: none;" },
              h("article", { "role": "listitem", "style": "flex: 0 0 84%; scroll-snap-align: start; border-radius: 24px; background: #FFFFFF; border: 1px solid #E6E6EA; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 16px 40px rgba(16,24,40,0.06); overflow: hidden; display: flex; flex-direction: column;" },
                h("div", { "aria-hidden": "true", "style": "height: 224px; box-sizing: border-box; padding: 16px; background: linear-gradient(180deg, #F4F7FC, #FFFFFF); display: flex; flex-direction: column; gap: 8px;" },
                  h("span", { "style": "align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 999px; background: #0E0F12; color: #FFFFFF; font-size: 11px; font-weight: 600;" },
                    "Tous les marchés",
                    h("svg", { "width": "9", "height": "9", "viewBox": "0 0 12 12" },
                      h("path", { "d": "M3 4.5l3 3 3-3", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  ($l($v.miniApps)).map((m) => [
                    h("div", { "style": "display: flex; align-items: center; gap: 10px; height: 36px;" },
                      h("span", { "style": `width: 28px; height: 28px; border-radius: 8px; background: ${$t(m?.bg)}; color: #FFFFFF; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;` },
                        $t(m?.ini)
                      ),
                      h("span", { "style": "flex: 1 1 auto; font-size: 13px; font-weight: 600;" },
                        $t(m?.name)
                      ),
                      h("span", { "style": `font-size: 12px; font-weight: 700; color: ${$t(m?.ink)}; background: ${$t(m?.chip)}; border-radius: 999px; padding: 3px 9px;` },
                        $t(m?.v)
                      )
                    )
                  ])
                ),
                h("div", { "style": "padding: 18px 20px 22px; display: flex; flex-direction: column; gap: 6px;" },
                  h("h3", { "style": "margin: 0; font-size: 19px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.25;" },
                    "Marché par marché"
                  ),
                  h("p", { "style": "margin: 0; font-size: 15px; line-height: 1.5; color: #5F656E;" },
                    "Les apps qui décollent sur les réseaux dans chaque pays. Tu les vois avant tout le monde."
                  )
                )
              ),
              h("article", { "role": "listitem", "style": "flex: 0 0 84%; scroll-snap-align: start; border-radius: 24px; background: #FFFFFF; border: 1px solid #E6E6EA; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 16px 40px rgba(16,24,40,0.06); overflow: hidden; display: flex; flex-direction: column;" },
                h("div", { "aria-hidden": "true", "style": "height: 224px; box-sizing: border-box; padding: 16px; background: linear-gradient(180deg, #F4F7FC, #FFFFFF); display: flex; flex-direction: column; gap: 6px;" },
                  h("span", { "style": "font-size: 12px; color: #5F656E;" },
                    "Les créateurs d'Astra AI"
                  ),
                  ($l($v.creators)).map((c) => [
                    h("div", { "style": "display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 10px; border-radius: 14px; background: #FFFFFF; border: 1px solid #EEF0F3;" },
                      h("span", { "style": `width: 32px; height: 32px; border-radius: 50%; background: ${$t(c?.bg)}; color: #FFFFFF; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;` },
                        $t(c?.ini)
                      ),
                      h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column;" },
                        h("span", { "style": "font-size: 13px; font-weight: 600;" },
                          $t(c?.handle)
                        ),
                        h("span", { "style": "font-size: 11px; color: #6B717B;" },
                          $t(c?.note)
                        )
                      ),
                      h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 15px; font-weight: 700;" },
                        $t(c?.v)
                      )
                    )
                  ])
                ),
                h("div", { "style": "padding: 18px 20px 22px; display: flex; flex-direction: column; gap: 6px;" },
                  h("h3", { "style": "margin: 0; font-size: 19px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.25;" },
                    "Les créateurs derrière"
                  ),
                  h("p", { "style": "margin: 0; font-size: 15px; line-height: 1.5; color: #5F656E;" },
                    "Les comptes qui font exploser chaque app, avec leurs vidéos et leurs vues."
                  )
                )
              ),
              h("article", { "role": "listitem", "style": "flex: 0 0 84%; scroll-snap-align: start; border-radius: 24px; background: #FFFFFF; border: 1px solid #E6E6EA; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 16px 40px rgba(16,24,40,0.06); overflow: hidden; display: flex; flex-direction: column;" },
                h("div", { "aria-hidden": "true", "style": "height: 224px; box-sizing: border-box; padding: 16px; background: linear-gradient(180deg, #F4F7FC, #FFFFFF); display: flex; flex-direction: column; gap: 8px;" },
                  h("span", { "style": "display: flex; justify-content: space-between; align-items: center;" },
                    h("span", { "style": "font-size: 13px; font-weight: 700;" },
                      "Astra AI"
                    ),
                    h("span", { "style": "font-size: 11px; font-weight: 700; color: #0B6FE0; background: #EEF4FF; border-radius: 999px; padding: 2px 8px;" },
                      "2,0 M à H+114"
                    )
                  ),
                  h("svg", { "viewBox": "0 0 360 150", "width": "100%", "height": "100", "preserveAspectRatio": "none" },
                    h("defs", null,
                      h("linearGradient", { "id": "mA", "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                        h("stop", { "offset": "0%", "stop-color": "#0B6FE0", "stop-opacity": "0.22" }),
                        h("stop", { "offset": "100%", "stop-color": "#0B6FE0", "stop-opacity": "0" })
                      )
                    ),
                    h("path", { "d": "M0 109.4 C 25 108.5, 35 107.6, 51.4 107.1 S 110 92, 144 85.4 S 300 30, 360 19.4 L 360 150 L 0 150 Z", "fill": "url(#mA)", "style": "animation: lpm-areaIn 7s ease-in-out infinite;" }),
                    h("path", { "d": "M0 109.4 C 25 108.5, 35 107.6, 51.4 107.1 S 110 92, 144 85.4 S 300 30, 360 19.4", "fill": "none", "stroke": "#0B6FE0", "stroke-width": "3", "stroke-linecap": "round", "stroke-dasharray": "520", "style": "animation: lpm-draw 7s ease-in-out infinite;" })
                  ),
                  h("div", { "style": "display: flex; justify-content: space-between; font-size: 13px; border-top: 1px solid #EEF0F3; padding-top: 8px;" },
                    h("span", { "style": "color: #4A4F57;" },
                      "Comptes actifs"
                    ),
                    h("span", { "style": "font-weight: 700;" },
                      "269 / 272"
                    )
                  ),
                  h("div", { "style": "display: flex; justify-content: space-between; font-size: 13px;" },
                    h("span", { "style": "color: #4A4F57;" },
                      "Revenus estimés"
                    ),
                    h("span", { "style": "font-weight: 700; filter: blur(4px);" },
                      "[XX] k€"
                    )
                  )
                ),
                h("div", { "style": "padding: 18px 20px 22px; display: flex; flex-direction: column; gap: 6px;" },
                  h("h3", { "style": "margin: 0; font-size: 19px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.25;" },
                    "Chaque app décortiquée"
                  ),
                  h("p", { "style": "margin: 0; font-size: 15px; line-height: 1.5; color: #5F656E;" },
                    "Ses vidéos qui explosent, ses hooks, ses sons et ses revenus estimés."
                  )
                )
              )
            ),
            h("div", { "style": "padding: 12px 20px 0;" },
              h("a", { "href": "/tarifs", "class": "tap", "style": "display: flex; align-items: center; justify-content: center; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 5px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                "Voir ce qui explose",
                h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                    h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          h("section", { "id": "exemple", "style": "padding: 72px 0; border-top: 1px solid #E6E6EA; background: radial-gradient(500px 300px at 50% 55%, rgba(11,111,224,0.07), transparent 70%), #FAFAFA; display: flex; flex-direction: column; gap: 16px;" },
            h("div", { "style": "padding: 0 20px; display: flex; flex-direction: column; gap: 14px;" },
              h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.04em; color: #5F656E;" },
                h("span", { "style": "color: #0B6FE0;" },
                  "["
                ),
                " PLAYBOOK ",
                h("span", { "style": "color: #0B6FE0;" },
                  "]"
                )
              ),
              h("h2", { "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 34px; line-height: 1.05; letter-spacing: -0.045em;" },
                "Les formats qui explosent, décortiqués."
              ),
              h("p", { "style": "margin: 0; font-size: 16px; line-height: 1.55; color: #4A4F57;" },
                "Les hooks, les sons et les formats qui font exploser les vues en ce moment, et les créateurs qui les tournent."
              )
            ),
            h("div", { "aria-hidden": "true", "style": "margin-top: 12px; overflow: hidden; -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%); mask-image: linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%);" },
              h("div", { "style": "display: flex; width: max-content; animation: lpm-rowLeft 80s linear infinite;" },
                ($l($v.reel)).map((v) => [
                  h("div", { "style": `position: relative; flex: 0 0 auto; width: 168px; height: 298px; margin-right: 12px; border-radius: 20px; overflow: hidden; background: ${$t(v?.bg)}; background-size: 220% 220%; animation: lpm-pan 8s ease-in-out infinite alternate; box-shadow: 0 16px 34px rgba(16,24,40,0.18);` },
                    h("div", { "style": "position: absolute; inset: 0; background: radial-gradient(55% 34% at 50% 72%, rgba(255,255,255,0.18), transparent 70%), linear-gradient(to bottom, rgba(0,0,0,0.28), transparent 30%, transparent 60%, rgba(0,0,0,0.62));" }),
                    h("span", { "style": "position: absolute; top: 10px; left: 10px; max-width: calc(100% - 20px); box-sizing: border-box; background: rgba(255,255,255,0.92); color: #111216; border-radius: 999px; padding: 3px 9px; font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                      $t(v?.app)
                    ),
                    h("div", { "style": "position: absolute; left: 10px; right: 10px; top: 32%; text-align: center; line-height: 1.7;" },
                      h("span", { "style": "background: #FFFFFF; color: #111216; font-weight: 700; font-size: 12px; padding: 2px 6px; border-radius: 5px; -webkit-box-decoration-break: clone; box-decoration-break: clone;" },
                        $t(v?.hook)
                      )
                    ),
                    h("div", { "style": "position: absolute; left: 10px; right: 10px; bottom: 12px; display: flex; flex-direction: column; color: #FFFFFF;" },
                      h("span", { "style": "font-family: 'Inter Tight', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1;" },
                        $t(v?.views)
                      ),
                      h("span", { "style": "font-size: 11px; opacity: 0.85;" },
                        $t(v?.handle)
                      )
                    )
                  )
                ])
              )
            ),
            h("div", { "style": "padding: 8px 20px 0;" },
              h("div", { "role": "status", "style": "display: flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid #E6E6EA; border-radius: 18px; padding: 12px 14px; box-shadow: 0 12px 30px rgba(16,24,40,0.08);" },
                h("span", { "style": "width: 38px; height: 38px; border-radius: 11px; background: #EEF4FF; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                  h("span", { "style": "width: 9px; height: 9px; border-radius: 50%; background: #0B6FE0; animation: lpm-pulse 1.8s infinite;" })
                ),
                h("span", { "style": `min-width: 0; display: flex; flex-direction: column; opacity: ${$t($v.curO)}; transition: opacity 0.3s ease;` },
                  h("span", { "style": "font-size: 12px; color: #5F656E;" },
                    "Décortiquée · ", $t($v.cur?.app)
                  ),
                  h("span", { "style": "font-size: 16px; font-weight: 700;" },
                    $t($v.cur?.label), " ",
                    h("span", { "style": "color: #0B6FE0;" },
                      $t($v.cur?.value)
                    )
                  )
                )
              )
            ),
            h("div", { "style": "padding: 8px 20px 0;" },
              h("a", { "href": "/tarifs", "class": "tap", "style": "display: flex; align-items: center; justify-content: center; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 5px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                "Voir les formats",
                h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                    h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          h("section", { "class": "dk", "aria-labelledby": "avis-t", "style": "position: relative; overflow: hidden; padding: 72px 0; background-color: #05070C; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px); color: #FFFFFF; display: flex; flex-direction: column; gap: 16px;" },
            h("div", { "aria-hidden": "true", "style": "position: absolute; left: -40%; top: 0; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.28), transparent); animation: lpm-driftA 16s ease-in-out infinite; pointer-events: none;" }),
            h("div", { "style": "position: relative; padding: 0 20px; display: flex; flex-direction: column; gap: 14px;" },
              h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.04em; color: #9AA3B2;" },
                h("span", { "style": "color: #4C9AFF;" },
                  "["
                ),
                " MUR D'AVIS ",
                h("span", { "style": "color: #4C9AFF;" },
                  "]"
                )
              ),
              h("h2", { "id": "avis-t", "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 34px; line-height: 1.05; letter-spacing: -0.045em;" },
                "Ils ont trouvé leur app. ",
                h("span", { "style": "color: #4C9AFF;" },
                  "Pourquoi pas toi ?"
                )
              ),
              h("p", { "style": "margin: 0; font-size: 16px; line-height: 1.55; color: #9AA3B2;" },
                "Rejoins les [N] membres qui savent déjà ce qui explose sur les réseaux, avant tout le monde."
              )
            ),
            h("div", { "style": "position: relative; margin-top: 12px; padding: 0 16px;" },
              h("div", { "style": `display: flex; flex-direction: column; gap: 16px; max-height: ${$t($v.avisMax)}; overflow: hidden; -webkit-mask-image: ${$t($v.avisMask)}; mask-image: ${$t($v.avisMask)}; transition: max-height 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                ($l($v.avis)).map((r) => [
                  h("figure", { "style": "margin: 0; box-sizing: border-box; border-radius: 28px; padding: 24px 22px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.09); box-shadow: inset 0 1px 0 rgba(255,255,255,0.07); display: flex; flex-direction: column; gap: 18px;" },
                    h("span", { "role": "img", "aria-label": "5 étoiles sur 5", "style": "display: flex; gap: 4px;" },
                      h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true" },
                        h("path", { "d": "M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z", "fill": "#E7B54B" })
                      ),
                      h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true" },
                        h("path", { "d": "M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z", "fill": "#E7B54B" })
                      ),
                      h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true" },
                        h("path", { "d": "M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z", "fill": "#E7B54B" })
                      ),
                      h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true" },
                        h("path", { "d": "M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z", "fill": "#E7B54B" })
                      ),
                      h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true" },
                        h("path", { "d": "M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z", "fill": "#E7B54B" })
                      )
                    ),
                    h("blockquote", { "style": "margin: 0; font-size: 18px; line-height: 1.5; color: #E6E9EF;" },
                      $t(r?.q)
                    ),
                    h("figcaption", { "style": "display: flex; align-items: center; gap: 14px;" },
                      h("span", { "aria-hidden": "true", "style": "width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background: linear-gradient(180deg, #2A3242, #141A26); border: 2px solid rgba(255,255,255,0.14);" }),
                      h("span", { "style": "display: flex; flex-direction: column;" },
                        h("span", { "style": "font-weight: 600; font-size: 16px;" },
                          $t(r?.name)
                        ),
                        h("span", { "style": "font-size: 14px; color: #8A93A3;" },
                          $t(r?.role)
                        )
                      )
                    )
                  )
                ])
              ),
              h("div", { "style": `position: relative; z-index: 2; margin-top: ${$t($v.avisBtnMt)}; display: flex; justify-content: center; transition: margin-top 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                h("button", { "type": "button", "class": "tap", "onClick": $v.toggleAvis, "aria-expanded": $v.avisOpen, "style": "height: 48px; padding: 0 22px; border-radius: 999px; background: rgba(22,26,36,0.94); border: 1px solid rgba(255,255,255,0.16); color: #FFFFFF; font: inherit; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 12px 30px rgba(0,0,0,0.45); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);" },
                  $t($v.avisBtn)
                )
              )
            )
          ),
          h("section", { "class": "dk", "id": "faq", "aria-labelledby": "faq-t", "style": "position: relative; padding: 24px 20px 72px; background-color: #05070C; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px); color: #FFFFFF; display: flex; flex-direction: column; gap: 14px;" },
            h("div", { "style": "border-top: 1px solid rgba(255,255,255,0.08); padding-top: 56px; display: flex; flex-direction: column; gap: 14px;" },
              h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.04em; color: #9AA3B2;" },
                h("span", { "style": "color: #4C9AFF;" },
                  "["
                ),
                " FAQ ",
                h("span", { "style": "color: #4C9AFF;" },
                  "]"
                )
              ),
              h("h2", { "id": "faq-t", "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 34px; line-height: 1.05; letter-spacing: -0.045em;" },
                "Les questions ",
                h("span", { "style": "color: #4C9AFF;" },
                  "fréquentes"
                ),
                "."
              )
            ),
            h("div", { "style": "margin-top: 10px; display: flex; flex-direction: column; gap: 8px;" },
              ($l($v.faqs)).map((f) => [
                h("div", { "style": `border-radius: 18px; background: ${$t(f?.bg)}; border: 1px solid ${$t(f?.border)}; transition: background 0.35s ease, border-color 0.35s ease;` },
                  h("button", { "type": "button", "onClick": f?.toggle, "aria-expanded": f?.open, "style": "width: 100%; min-height: 60px; background: transparent; border: 0; padding: 16px 18px; box-sizing: border-box; display: flex; align-items: center; gap: 14px; font: inherit; color: #FFFFFF; text-align: left; cursor: pointer;" },
                    h("span", { "style": "flex: 1 1 auto; font-size: 16px; font-weight: 500; line-height: 1.35;" },
                      $t(f?.q)
                    ),
                    h("svg", { "width": "16", "height": "16", "viewBox": "0 0 18 18", "aria-hidden": "true", "style": `flex-shrink: 0; transform: ${$t(f?.rot)}; transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                      h("path", { "d": "M4.5 7l4.5 4.5L13.5 7", "fill": "none", "stroke": f?.chev, "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  h("div", { "style": `display: grid; grid-template-rows: ${$t(f?.rows)}; transition: grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                    h("div", { "style": "overflow: hidden;" },
                      h("p", { "style": "margin: 0; padding: 0 18px 18px; font-size: 15px; line-height: 1.6; color: #B7BECA;" },
                        $t(f?.a)
                      )
                    )
                  )
                )
              ])
            ),
            h("p", { "style": "margin: 10px 0 0; font-size: 15px; color: #9AA3B2;" },
              "Une autre question ? ",
              h("a", { "href": "#contact", "style": "color: #FFFFFF; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: rgba(255,255,255,0.35);" },
                "Écris-nous"
              )
            )
          )
        ),
        h("footer", { "class": "dk", "style": "position: relative; overflow: hidden; flex: 1 0 auto; display: flex; flex-direction: column; background-color: #05070C; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px); color: #FFFFFF; border-top: 1px solid rgba(255,255,255,0.08);" },
          h("div", { "style": "flex: 1 0 auto; padding: 48px 20px 24px; display: flex; flex-direction: column; gap: 40px;" },
            h("div", { "style": "position: relative; overflow: hidden; border-radius: 26px; padding: 30px 22px 22px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015)); border: 1px solid rgba(255,255,255,0.10); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 14px;" },
              h("div", { "aria-hidden": "true", "style": "position: absolute; left: 90%; top: 30%; width: 520px; height: 520px; border-radius: 50%; background: conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(76,154,255,0.04) 300deg, rgba(76,154,255,0.30) 360deg); animation: lpm-spinC 8s linear infinite; pointer-events: none;" }),
              h("span", { "style": "position: relative; font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.04em; color: #9AA3B2;" },
                h("span", { "style": "color: #4C9AFF;" },
                  "["
                ),
                " DERNIER APPEL ",
                h("span", { "style": "color: #4C9AFF;" },
                  "]"
                )
              ),
              h("h2", { "style": "position: relative; margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 32px; line-height: 1.05; letter-spacing: -0.045em;" },
                "Ta prochaine app explose déjà sur les réseaux."
              ),
              h("p", { "style": "position: relative; margin: 0; font-size: 16px; color: #9AA3B2;" },
                "Trouve-la avant les autres."
              ),
              h("a", { "href": "/tarifs", "class": "tap", "style": "position: relative; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 5px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                "Trouver mon app",
                h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                    h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ),
            h("div", { "style": "display: flex; flex-direction: column; gap: 12px;" },
              h("a", { "href": "#top", "style": "display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #FFFFFF;" },
                h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
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
            h("div", { "role": "dialog", "aria-modal": "true", "aria-label": "Menu", "style": "margin: 10px 12px 0; border-radius: 28px; background: rgba(255,255,255,0.97); box-shadow: 0 30px 70px rgba(16,24,40,0.28); padding: 6px 6px 16px; animation: lpm-sheetDown 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
              h("div", { "style": "display: flex; align-items: center; height: 56px; padding: 0 0 0 14px;" },
                h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; margin-right: auto;" },
                  h("svg", { "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true" },
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
                h("button", { "type": "button", "class": "tap", "onClick": $v.closeMenu, "aria-label": "Fermer le menu", "style": "width: 44px; height: 44px; border: 0; border-radius: 50%; background: #F1F3F6; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;" },
                  h("svg", { "width": "14", "height": "14", "viewBox": "0 0 14 14", "aria-hidden": "true" },
                    h("path", { "d": "M3 3l8 8M11 3l-8 8", "stroke": "#0E0F12", "stroke-width": "1.8", "stroke-linecap": "round" })
                  )
                )
              ),
              h("nav", { "aria-label": "Menu", "style": "display: flex; flex-direction: column; padding: 4px 10px 0;" },
                ($l($v.mnav)).map((m) => [
                  h("a", { "href": m?.href, "class": "tap", "onClick": $v.closeMenu, "style": "display: flex; align-items: center; gap: 14px; min-height: 60px; padding: 0 6px; border-bottom: 1px solid #EEF0F3; text-decoration: none; color: #0E0F12;" },
                    h("span", { "style": "width: 36px; height: 36px; border-radius: 11px; background: #EAF2FF; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                      h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
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
                    h("svg", { "width": "14", "height": "14", "viewBox": "0 0 16 16", "aria-hidden": "true" },
                      h("path", { "d": "M6 3.5L10.5 8 6 12.5", "fill": "none", "stroke": "#9AA0A8", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ])
              ),
              h("div", { "style": "display: flex; flex-direction: column; gap: 8px; padding: 16px 10px 0;" },
                h("a", { "href": "/tarifs", "class": "tap", "onClick": $v.closeMenu, "style": "display: flex; align-items: center; justify-content: center; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 5px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                  "Trouver mon app",
                  h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                    h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                      h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                h("a", { "href": "#connexion", "class": "tap", "onClick": $v.closeMenu, "style": "display: flex; align-items: center; justify-content: center; height: 52px; border-radius: 18px; border: 1px solid #D3D7DE; color: #0E0F12; text-decoration: none; font-size: 16px; font-weight: 600;" },
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
