// Généré par scripts/dc2preact.py depuis design/LP.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../runtime.js';

export default class LP extends DCLogic {
  componentDidMount() {
    this.t0 = Date.now();
    this.timer = setInterval(() => this.setState({ now: Date.now() }), 90);
    const film = document.querySelector('[data-film] video');
    if (film) {
      film.muted = true; film.defaultMuted = true; film.setAttribute('muted', '');
      const go = () => { if (film.paused) { const p = film.play(); if (p && p.catch) p.catch(() => {}); } };
      go(); film.addEventListener('loadeddata', go); film.addEventListener('canplay', go);
      if ('IntersectionObserver' in window) { this.filmObs = new IntersectionObserver((es) => { if (es[0].isIntersecting) go(); }); this.filmObs.observe(film); }
      ['touchstart', 'pointerdown', 'scroll'].forEach((ev) => window.addEventListener(ev, go, { once: true, passive: true }));
    }
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    if (this.filmObs) this.filmObs.disconnect();
  }
  renderVals() {
    const S0 = (this.props && this.props.stats) || { apps: 190, accounts: 4900 };
    const rs = { apps: S0.apps.toLocaleString('fr-FR'), accounts: S0.accounts.toLocaleString('fr-FR') };

    const st = this.state || {};
    const el = Math.max(0, (st.now || 0) - (this.t0 || 0));
    const blue = this.props.blue ?? '#0B6FE0';

    const q = st.q || '';
    const focused = !!st.focus;
    const search = {
      q,
      ph: focused ? 'Je veux lancer une app de…' : '',
      animO: !focused && !q ? 1 : 0,
      onQ: (e) => this.setState({ q: e.target.value }),
      onFocus: () => this.setState({ focus: true }),
      onBlur: () => this.setState({ focus: false }),
      submitSearch: (e) => {
        e.preventDefault();
        const v = (this.state.q || '').trim();
        window.location.href = '/inscription' + (v ? '?q=' + encodeURIComponent(v) : '');
      }
    };
    const words = ['une app de couple', 'une app pour les études', 'une app de séduction IA', 'une app de foi', 'une app de sport'];
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

    const pos = (deg) => {
      const a = deg * Math.PI / 180;
      return { x: (50 + 50 * Math.sin(a)).toFixed(2) + '%', y: (50 - 50 * Math.cos(a)).toFixed(2) + '%' };
    };
    const styles = [
      { bg: '#111216', ink: '#FFFFFF' },
      { bg: '#FFFFFF', ink: '#111216' },
      { bg: blue, ink: '#FFFFFF' },
      { bg: '#3D4450', ink: '#FFFFFF' }
    ];
    const mkO = (list) => list.map((x) => Object.assign({ t: x[0], icon: ICON[x[0]] }, pos(x[1])));
    const bgs = [
      'linear-gradient(150deg, #5A2E45 0%, #16090F 55%, #3A1D2C 100%)',
      'linear-gradient(150deg, #28405E 0%, #0B1424 55%, #1B2C44 100%)',
      'linear-gradient(150deg, #4B3A33 0%, #1A1412 55%, #2E241F 100%)',
      'linear-gradient(150deg, #2F4A3A 0%, #0B140F 55%, #203328 100%)',
      'linear-gradient(150deg, #4A3F6E 0%, #120E1F 55%, #2E2747 100%)',
      'linear-gradient(150deg, #6A4A2B 0%, #170F08 55%, #43301C 100%)'
    ];
    const thumbViews = ['5,6 M', '2,6 M', '2,6 M', '2,4 M', '2,3 M', '2,0 M', '1,2 M', '809 k'];

    const ICON = {
      'Astra AI': '/media/app-astra-ai.jpg',
      'Love8': '/media/app-love8.jpg',
      'Luv or Pop': '/media/app-luv-or-pop.jpg',
      'Knowunity': '/media/app-knowunity.jpg',
      'DJ Kartier': '/media/app-dj-kartier.jpg',
      'SSME': '/media/app-ssme.jpg',
      'Snitchy': '/media/app-snitchy.jpg',
      'The Cringe': '/media/app-the-cringe.jpg',
      'Retain Cards': '/media/app-retain-cards.jpg',
      'Praktika': '/media/app-praktika.jpg',
      'Plug AI': '/media/app-plug-ai.jpg',
      'Flo': '/media/app-flo.jpg',
      'Creed': '/media/app-creed.jpg'
    };
    const arcData = [
      ['Luv or Pop', '', '7,5 M', '@luvorpop', 'Repérée à', 'H+26', '/media/v-7705876324832791821.jpg'],
      ['Praktika', '', '6,0 M', '@englishbarengfajar', 'Fois ses abonnés', '222×', '/media/v-7699904064636783880.jpg'],
      ['Astra AI', '', '2,0 M', '@belajarbersamaespi', 'Fois sa normale', '2 333×', '/media/v-7705368869250075925.jpg'],
      ['Knowunity', '', '5,7 M', '@estudio2bach', 'Un compte de', '592 abonnés', '/media/v-7699151144400244000.jpg'],
      ['The Cringe', '', '2,5 M', '@foodandlu', 'Enregistrée', '80 k fois', '/media/v-7703301496879861014.jpg'],
      ['DJ Kartier', '', '5,5 M', '@djkartierapp', 'Repérée à', 'H+43', '/media/v-7704497663609244958.jpg'],
      ['Snitchy', '', '2,4 M', '@_miasecrets', 'Fois sa normale', '432×', '/media/v-7704060808094829846.jpg'],
      ['Love8', '', '1,8 M', '@hg_love8', 'Fois sa normale', '2 140×', '/media/v-7701914062296337685.jpg'],
      ['Astra AI', '', '2,4 M', '@isskos_ia', 'Enregistrée', '47 k fois', '/media/v-7697326930328030497.jpg'],
      ['Creed', '', '2,1 M', '@victoria.blessed70', 'Fois ses abonnés', '235×', '/media/v-7696972755480169741.jpg'],
      ['Retain Cards', '', '106 k', '@studywithdenise', 'Fois ses abonnés', '408×', '/media/v-7706579888727231777.jpg'],
      ['Astra AI', '', '2,6 M', '@ira.belajaryuk', 'Fois sa normale', '4 682×', '/media/v-7697654738124442896.jpg'],
      ['Knowunity', '', '1,5 M', '@mahekstudies', 'Fois sa normale', '147×', '/media/v-7701821196131634445.jpg'],
      ['Astra AI', '', '2,7 M', '@ivylearns8', 'Fois sa normale', '133×', '/media/v-7700392351268752661.jpg']
    ];
    const N = arcData.length;
    const D = 106;
    let best = 0;
    let bestD = 2;
    const arc = arcData.map((d, i) => {
      const ph0 = ((0.5 - i / N) % 1 + 1) % 1;
      const ph = (ph0 + el / 1000 / D) % 1;
      const dist = Math.abs(ph - 0.5);
      if (dist < bestD) { bestD = dist; best = i; }
      return {
        app: d[0], views: d[2], handle: d[3], img: d[6], icon: ICON[d[0]],
        bg: bgs[i % bgs.length],
        dur: (8 + (i % 4) * 3) + 's',
        delay: '-' + (ph0 * D).toFixed(2) + 's'
      };
    });
    const c = arcData[best];

// Avis de membres (donnés par le fondateur le 19/11), mot pour mot ; prénom seul. Une colonne = 3 avis de longueurs différentes.
    const briefs = [
      ['« Je cherchais une idée depuis des mois et je tournais en rond. J’ai choisi les États-Unis, la niche beauté, et je suis tombé sur une app qui faisait beaucoup de vues par vidéo. Personne ne la faisait encore en français, donc j’ai foncé. »', 'Mattheo', ''],
      ['« Avant, je passais mes soirées à scroller TikTok sans rien noter. Maintenant, j’ouvre Swarm 30 minutes le matin et je sais ce qui marche. »', 'Luis', ''],
      ['« C’est juste génial, merci, on voit tout. »', 'David', ''],
      ['« Ce qui m’a surpris, c’est le nombre de comptes derrière une seule app. Astra AI tourne avec 200 comptes actifs alors que j’en imaginais vingt. Ça m’a fait revoir tout mon plan de recrutement. »', 'Lucien', ''],
      ['« Si t’hésites, prends un mois et regarde juste les apps qui explosent dans ton pays. Tu vas voir qu’il y a de la place partout. »', 'Elio', ''],
      ['« Le gain de temps et d’argent est massif, le produit est top. »', 'Dimitri', ''],
      ['« Je n’aurais jamais testé l’Amérique du Sud. Swarm m’a montré que les apps d’études y explosaient avec des formats très simples. On a lancé une version locale, résultat on a triplé notre CA. »', 'Julien', ''],
      ['« J’ai repris un format qui tournait sur l’app d’un concurrent. Ma première vidéo a fait 54k vues et j’ai eu une centaine de téléchargements dans la semaine. »', 'Lucas', ''],
      ['« Ma routine, c’est de filtrer par marché, de regarder les vidéos repérées dans leurs premières heures, puis les hooks. Comme ça, je vois un format avant qu’il soit saturé. »', 'Eric', '']
    ];
    const avis = [0, 1, 2].map((ci) => {
      const cards = [];
      for (let r = 0; r < 3; r++) {
        const b = briefs[(ci * 3 + r) % briefs.length];
        const featured = (ci + r) % 4 === 1;
        cards.push({
          q: b[0], name: b[1], role: b[2],
          border: featured ? 'rgba(76,154,255,0.45)' : 'rgba(255,255,255,0.09)',
          glow: featured ? '0 0 0 4px rgba(76,154,255,0.06), 0 24px 60px rgba(11,111,224,0.18)' : '0 20px 50px rgba(0,0,0,0.30)'
        });
      }
      return { cards: cards.concat(cards), anim: (ci % 2 === 0 ? 'lp-colUp ' : 'lp-colDown ') + (52 + ci * 9) + 's linear infinite' };
    });

    const open = st.open === undefined ? 0 : st.open;
    const faqData = [
      ['Ça marche sur quels marchés ?', 'Sur tous : choisis un pays ou une langue, tu vois les apps, les formats et les créateurs qui y explosent en ce moment.'],
      ['Je débute, est-ce que c’est pour moi ?', 'Oui. Tu choisis un marché et une niche, Swarm te montre les apps et les formats qui y explosent en ce moment, et les créateurs qui les portent. Pas besoin de savoir coder.'],
      ['C’est légal de copier une app ?', 'Copier une niche, un modèle, une stratégie de contenu : oui, tout le marché le fait. Copier une marque ou du code : non, et on ne t’y aide pas.'],
      ['Les données sont à jour ?', 'Les comptes sont relus en continu, et une vidéo qui explose est repérée dès ses premières heures.'],
      ['Y a-t-il une limite d’utilisation ?', 'Non. Avec Pro, tu as toutes les apps, tous les marchés, toutes les fiches et toutes les vidéos, sans limite.'],
      ['Je peux annuler à tout moment ?', 'Oui, en un clic depuis ton compte. Aucun engagement sur l’offre mensuelle.']
    ];
    const faqs = faqData.map((d, i) => {
      const on = open === i;
      return {
        q: d[0], a: d[1], open: on,
        rows: on ? '1fr' : '0fr',
        bg: on ? 'linear-gradient(180deg, rgba(76,154,255,0.12), rgba(76,154,255,0.04))' : 'rgba(255,255,255,0.03)',
        border: on ? 'rgba(76,154,255,0.45)' : 'rgba(255,255,255,0.08)',
        shadow: on ? '0 0 0 4px rgba(76,154,255,0.08), 0 20px 50px rgba(11,111,224,0.20), inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        rot: on ? 'rotate(180deg)' : 'rotate(0deg)',
        chev: on ? '#4C9AFF' : '#9AA3B2',
        toggle: () => this.setState({ open: on ? -1 : i })
      };
    });

    const ticks = [
      { app: 'Luv or Pop', text: 'repérée à H+26' },
      { app: 'Love8', text: '+69 comptes' },
      { app: 'Astra AI', text: 'une vidéo à 2 333× sa normale' },
      { app: 'DJ Kartier', text: 'repérée à H+43' }
    ];
    const mkCol = (title, links) => ({ title, links: links.map((l) => ({ t: l[0], href: l[1] })) });

    // Navbar : méga-menu de « Produit »
    const menuOpen = !!st.menu;
    const ic = {
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      videos: 'M4 5h16v14H4zM10 9l5 3-5 3z',
      radar: 'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      alertes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0'
    };
    const menu = [
      { t: 'Apps qui explosent', sub: 'En ce moment, sur n’importe quel marché', href: '#produit', d: ic.apps },
      { t: 'Formats qui explosent', sub: 'Les hooks, les sons et les formats qui font les vues', href: '#exemple', d: ic.videos },
      { t: 'Créateurs', sub: 'Les comptes qui font exploser chaque app', href: '#produit', d: ic.createurs }
    ];


    return {
      filmOn: true,
      filmMuted: !st.sound,
      soundOn: st.sound ? 'true' : 'false',
      soundLabel: st.sound ? 'Couper le son' : 'Activer le son',
      muteIco: st.sound ? 0 : 1,
      soundIco: st.sound ? 1 : 0,
      toggleSound: (e) => {
        const v = e.currentTarget.parentElement.querySelector('video');
        const on = !this.state.sound;
        if (v) { v.muted = !on; if (on) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } }
        this.setState({ sound: on });
      },
      rs,
      blue,
      menuOpen,
      menu,
      prodBg: menuOpen ? 'rgba(255,255,255,0.90)' : 'transparent',
      chev: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      toggleMenu: () => this.setState({ menu: !menuOpen }),
      closeMenu: () => this.setState({ menu: false }),
      typed: w.slice(0, Math.max(0, n)),
      q: search.q, ph: search.ph, animO: search.animO, onQ: search.onQ, onFocus: search.onFocus, onBlur: search.onBlur, submitSearch: search.submitSearch,
      niches: [{ t: 'Couple' }, { t: 'Études' }, { t: 'Séduction IA' }, { t: 'Foi' }, { t: 'Sport' }, { t: 'IA & productivité' }],
      o1: mkO([['Astra AI', 300], ['Luv or Pop', 60]]),
      o2: mkO([['Love8', 320], ['Praktika', 20], ['Plug AI', 75]]),
      o3: mkO([['Knowunity', 295], ['Flo', 335], ['DJ Kartier', 15], ['Creed', 55]]),
      thumbs: [
        { v: '2,7 M', img: '/media/v-7700392351268752661.jpg' },
        { v: '2,6 M', img: '/media/v-7697654738124442896.jpg' },
        { v: '2,4 M', img: '/media/v-7697326930328030497.jpg' },
        { v: '2,3 M', img: '/media/v-7702743575934684437.jpg' },
        { v: '2,0 M', img: '/media/v-7705368869250075925.jpg' },
        { v: '1,9 M', img: '/media/v-7696248791560703252.jpg' },
        { v: '1,9 M', img: '/media/v-7705929733220994337.jpg' },
        { v: '1,2 M', img: '/media/v-7704074126801046804.jpg' }
      ],
      pills: [{ t: '+' + rs.apps + ' apps, +' + rs.accounts + ' comptes' }, { t: 'Tous les marchés' }, { t: 'En ce moment, en continu' }, { t: 'Les créateurs derrière chaque app' }],
      arc,
      cur: { app: c[0], label: c[4], value: c[5] },
      avis,
      faqs,
      tick: ticks[Math.floor(el / 3200) % ticks.length],
      tickO: (el % 3200) < 2900 ? 1 : 0,
      cols: [
        mkCol('Produit', [['Comment ça marche', '#produit'], ['Exemple', '#exemple'], ['Tarifs', '/tarifs'], ['FAQ', '#faq']]),
        mkCol('Fonctionnalités', [['Apps qui explosent', '#produit'], ['Formats qui explosent', '#exemple'], ['Hooks qui gagnent', '#exemple'], ['Créateurs derrière chaque app', '#produit'], ['Tous les marchés', '#produit']]),
        mkCol('Légal', [['CGV', '#cgv'], ['Confidentialité', '#confidentialite'], ['Mentions légales', '#mentions'], ['Contact', '#contact']])
      ]
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "style": "position: relative; display: flex; flex-direction: column; min-height: 100vh; background: linear-gradient(180deg, #B9DCFF 0px, #DCEDFF 440px, #EEF4FB 820px, #F5F6F8 1260px, #F3F3F5 1560px); font-family: Inter, system-ui, sans-serif; color: #111216; font-size: 16px; line-height: 1.5; overflow-x: clip;" },
        $h("div", { "aria-hidden": "true", "style": "position: absolute; left: 0; right: 0; top: 0; height: 1500px; overflow: hidden; pointer-events: none;" },
          $h("div", { "style": "position: absolute; left: 4%; top: 140px; width: 640px; height: 640px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,255,255,0.80), transparent); animation: lp-driftA 18s ease-in-out infinite;" }),
          $h("div", { "style": "position: absolute; right: 2%; top: 20px; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(closest-side, rgba(76,154,255,0.28), transparent); animation: lp-driftB 15s ease-in-out infinite;" }),
          $h("div", { "style": "position: absolute; inset: 0; background-image: linear-gradient(rgba(11,111,224,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(11,111,224,0.06) 1px, transparent 1px); background-size: 64px 64px; -webkit-mask-image: radial-gradient(48% 38% at 50% 26%, #000, transparent); mask-image: radial-gradient(48% 38% at 50% 26%, #000, transparent);" })
        ),
        $h("header", { "style": "position: sticky; top: 0; z-index: 50; padding: 22px 24px 0;" },
          $h("div", { "style": "position: relative; max-width: 1240px; margin: 0 auto; display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap;" },
            $h("a", { "href": "#top", "style": "display: flex; align-items: center; gap: 9px; text-decoration: none; height: 52px; padding: 0 20px 0 16px; box-sizing: border-box; border-radius: 999px; background: rgba(255,255,255,0.58); border: 1px solid rgba(255,255,255,0.85); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); box-shadow: 0 8px 24px rgba(16,24,40,0.08), inset 0 1px 0 #FFFFFF;" },
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
                "swarm"
              )
            ),
            $h("nav", { "aria-label": "Principal", "style": "display: flex; align-items: center; gap: 4px; height: 52px; padding: 0 6px; box-sizing: border-box; border-radius: 999px; background: rgba(255,255,255,0.58); border: 1px solid rgba(255,255,255,0.85); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); box-shadow: 0 8px 24px rgba(16,24,40,0.08), inset 0 1px 0 #FFFFFF;" },
              $h("button", { "type": "button", "class": "nh", "onClick": $v.toggleMenu, "aria-expanded": $v.menuOpen, "style": `display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px 0 16px; border: 0; border-radius: 999px; background: ${$t($v.prodBg)}; color: #0E0F12; font: inherit; font-size: 15px; font-weight: 500; cursor: pointer;` },
                "Produit",
                $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 12 12", "aria-hidden": "true", "style": `transform: ${$t($v.chev)}; transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                  $h("path", { "d": "M3 4.5l3 3 3-3", "fill": "none", "stroke": "#0E0F12", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("a", { "href": "#exemple", "class": "nh", "style": "display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 999px; color: #4A4F57; text-decoration: none; font-size: 15px; font-weight: 500;" },
                "Exemple"
              ),
              $h("a", { "href": "/tarifs", "class": "nh", "style": "display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 999px; color: #4A4F57; text-decoration: none; font-size: 15px; font-weight: 500;" },
                "Tarifs"
              ),
              $h("a", { "href": "#faq", "class": "nh", "style": "display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 999px; color: #4A4F57; text-decoration: none; font-size: 15px; font-weight: 500;" },
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
              $h("div", { "style": "position: absolute; top: calc(100% + 12px); left: 50%; width: 700px; max-width: calc(100vw - 48px); transform: translateX(-50%); box-sizing: border-box; border-radius: 24px; padding: 10px; background: rgba(255,255,255,0.72); border: 1px solid rgba(255,255,255,0.92); backdrop-filter: blur(26px) saturate(180%); -webkit-backdrop-filter: blur(26px) saturate(180%); box-shadow: 0 30px 70px rgba(16,24,40,0.20), inset 0 1px 0 #FFFFFF; display: flex; flex-wrap: wrap; gap: 10px; animation: lp-menuIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
                $h("div", { "style": "flex: 1 1 320px; display: flex; flex-direction: column; gap: 2px;" },
                  ($l($v.menu)).map((m) => [
                    $h("a", { "href": m?.href, "class": "mi", "onClick": $v.closeMenu, "style": "display: flex; align-items: flex-start; gap: 14px; padding: 14px; border-radius: 16px; text-decoration: none;" },
                      $h("span", { "style": "width: 40px; height: 40px; border-radius: 12px; background: #EAF2FF; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": m?.d, "fill": "none", "stroke": $v.blue, "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
        $h("section", { "id": "top", "style": "position: relative; z-index: 2; max-width: 1160px; margin: 0 auto; padding: 64px 24px 0; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 30px;" },
          $h("div", { "style": "display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.60); border: 1px solid rgba(255,255,255,0.95); border-radius: 999px; padding: 8px 18px; font-size: 14px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); animation: lp-blurIn 0.8s ease-out both;" },
            $h("span", { "style": `width: 8px; height: 8px; border-radius: 50%; background: ${$t($v.blue)}; animation: lp-pulse 1.8s infinite;` }),
            $h("span", null,
              $h("span", { "style": "font-weight: 600;" },
                "+", $t($v.rs?.accounts), " comptes"
              ),
              " passés au crible chaque jour"
            )
          ),
          $h("h1", { "style": "margin: 0; max-width: 1100px; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(44px, 6vw, 84px); line-height: 1.1; letter-spacing: -0.05em; animation: lp-blurIn 1s cubic-bezier(0.2, 0.7, 0.2, 1) both; animation-delay: 0.15s;" },
            "Lance ton premier business en copiant une app",
            $h("span", { "aria-hidden": "true", "style": "display: inline-block; position: relative; vertical-align: -0.06em; width: 1.5em; height: 0.82em; margin: 0 0.14em;" },
              $h("span", { "style": "position: absolute; left: 0; top: 0; width: 0.82em; height: 0.82em; border-radius: 0.22em; background: #0E0F12; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0.08em 0.22em rgba(16,24,40,0.28); animation: lp-fanA 4s ease-in-out infinite;" },
                $h("img", { "src": "/media/app-astra-ai.jpg", "alt": "", "style": "width: 100%; height: 100%; display: block; border-radius: 0.22em; object-fit: cover;" })
              ),
              $h("span", { "style": `position: absolute; left: 0.34em; top: 0; width: 0.82em; height: 0.82em; border-radius: 0.22em; background: ${$t($v.blue)}; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0.08em 0.22em rgba(11,111,224,0.35); animation: lp-fanB 4s ease-in-out infinite;` },
                $h("img", { "src": "/media/app-love8.jpg", "alt": "", "style": "width: 100%; height: 100%; display: block; border-radius: 0.22em; object-fit: cover;" })
              ),
              $h("span", { "style": "position: absolute; left: 0.68em; top: 0; width: 0.82em; height: 0.82em; border-radius: 0.22em; background: #3D4450; color: #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0.08em 0.22em rgba(16,24,40,0.28); animation: lp-fanC 4s ease-in-out infinite;" },
                $h("img", { "src": "/media/app-luv-or-pop.jpg", "alt": "", "style": "width: 100%; height: 100%; display: block; border-radius: 0.22em; object-fit: cover;" })
              )
            ),
            "qui explose en ce moment",
            $h("span", { "aria-hidden": "true", "style": `display: inline-flex; align-items: center; gap: 0.1em; vertical-align: 0.08em; margin-left: 0.16em; height: 0.74em; padding: 0 0.24em 0 0.18em; border-radius: 999px; background: ${$t($v.blue)}; color: #FFFFFF; box-shadow: 0 0.1em 0.3em rgba(11,111,224,0.35);` },
              $h("svg", { "viewBox": "0 0 40 20", "style": "height: 0.4em; width: 0.8em;" },
                $h("path", { "d": "M2 16 L12 11 L20 13 L30 5 L38 3", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3.2", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "60", "style": "animation: lp-drawS 3.2s ease-in-out infinite;" })
              ),
              $h("span", { "style": "font-family: Inter, sans-serif; font-size: 0.3em; font-weight: 700; letter-spacing: -0.01em; white-space: nowrap;" },
                "7,5 M vues"
              )
            )
          ),
          $h("p", { "style": "margin: 0; max-width: 640px; font-size: 19px; line-height: 1.55; color: #3A3F47; animation: lp-blurIn 0.9s ease-out both; animation-delay: 0.35s;" },
            "Repère les apps et les formats qui explosent en ce moment sur les réseaux, sur n'importe quel marché, et les créateurs qui les font exploser. ",
            $h("span", { "style": "color: rgb(14, 15, 18); font-weight: 600" },
              "Tu copies ce qui marche, tu lances la tienne."
            )
          ),
          $h("form", { "role": "search", "aria-label": "Trouver mon app", "onSubmit": $v.submitSearch, "style": "margin: 0; width: 100%; max-width: 680px; display: flex; align-items: center; gap: 14px; padding: 8px 8px 8px 24px; box-sizing: border-box; border-radius: 999px; background: rgba(255,255,255,0.66); border: 1px solid rgba(255,255,255,0.98); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 24px 60px rgba(16,24,40,0.14), 0 0 0 6px rgba(255,255,255,0.35), inset 0 1px 0 #FFFFFF; color: #0E0F12; animation: lp-blurIn 0.9s ease-out both; animation-delay: 0.5s;" },
            $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true", "style": "flex-shrink: 0;" },
              $h("circle", { "cx": "9", "cy": "9", "r": "5.8", "fill": "none", "stroke": "#656B74", "stroke-width": "1.8" }),
              $h("path", { "d": "M13.4 13.4L17 17", "stroke": "#656B74", "stroke-width": "1.8", "stroke-linecap": "round" })
            ),
            $h("label", { "style": "position: relative; flex: 1 1 auto; min-width: 0; height: 48px; display: flex; align-items: center; cursor: text;" },
              $h("span", { "style": "position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;" },
                "Quelle app veux-tu lancer ?"
              ),
              $h("input", { "type": "text", "name": "q", "value": $v.q, "onInput": $v.onQ, "onInput": $v.onQ, "onFocus": $v.onFocus, "onBlur": $v.onBlur, "placeholder": $v.ph, "autocomplete": "off", "enterkeyhint": "search", "style": "position: absolute; inset: 0; width: 100%; height: 100%; box-sizing: border-box; border: 0; outline: none; background: transparent; padding: 0; margin: 0; font-family: inherit; font-size: 17px; font-weight: 600; color: #0E0F12; -webkit-appearance: none; appearance: none;" }),
              $h("span", { "aria-hidden": "true", "style": `pointer-events: none; opacity: ${$t($v.animO)}; transition: opacity 0.2s ease; text-align: left; font-size: 17px; color: #656B74; white-space: nowrap; overflow: hidden;` },
                "Je veux lancer ",
                $h("span", { "style": "color: #0E0F12; font-weight: 600;" },
                  $t($v.typed)
                ),
                $h("span", { "style": `display: inline-block; width: 2px; height: 1.1em; background: ${$t($v.blue)}; vertical-align: -0.2em; margin-left: 2px; animation: lp-caret 1s steps(1) infinite;` })
              )
            ),
            $h("button", { "type": "submit", "class": "cta", "style": "flex-shrink: 0; cursor: pointer; margin: 0; font-family: inherit; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
              "Trouver mon app",
              $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          )
        ),
        $h("section", { "aria-label": "Vidéo de présentation", "style": "position: relative; z-index: 2; padding: 64px 24px 0;" },
          $h("div", { "aria-hidden": "true", "style": "position: absolute; left: 50%; top: 56%; width: 1200px; height: 600px; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.18), transparent); pointer-events: none;" }),
          $h("div", { "style": "position: relative; max-width: 1160px; margin: 0 auto; padding: 10px; border-radius: 36px; background: linear-gradient(180deg, #1C2230 0%, #0B0E15 100%); box-shadow: 0 2px 4px rgba(16,24,40,0.10), 0 50px 110px rgba(16,24,40,0.28), inset 0 1px 0 rgba(255,255,255,0.12); animation: lp-blurIn 1s ease-out both; animation-delay: 0.7s;" },
            $h("div", { "data-film": "", "style": "position: relative; aspect-ratio: 16 / 9; border-radius: 27px; overflow: hidden; background: #05070C;" },
              $h("video", { "src": "/media/film/swarm-film.mp4", "poster": "/media/film/swarm-film-affiche.jpg", "autoplay": $v.filmOn, "muted": $v.filmMuted, "loop": $v.filmOn, "playsinline": "", "preload": "auto", "aria-label": "Film de présentation de Swarm, 1 minute", "style": "display: block; width: 100%; height: 100%; object-fit: cover;" }),
              $h("button", { "type": "button", "onClick": $v.toggleSound, "aria-pressed": $v.soundOn, "style": "position: absolute; top: 22px; right: 22px; display: inline-flex; align-items: center; gap: 10px; height: 42px; padding: 0 18px 0 14px; border: 0; border-radius: 999px; background: rgba(14,15,18,0.45); color: #FFFFFF; font-family: inherit; font-size: 15px; font-weight: 500; cursor: pointer; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M4 9h4l5-4v14l-5-4H4z", "fill": "#FFFFFF" }),
                  $h("path", { "d": "M17 9.5l4 5M21 9.5l-4 5", "stroke": "#FFFFFF", "stroke-width": "1.8", "stroke-linecap": "round", "style": `opacity: ${$t($v.muteIco)};` }),
                  $h("path", { "d": "M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12", "stroke": "#FFFFFF", "stroke-width": "1.8", "stroke-linecap": "round", "fill": "none", "style": `opacity: ${$t($v.soundIco)};` })
                ),
                $t($v.soundLabel)
              )
            )
          )
        ),
        $h("section", { "aria-label": "Plateformes incluses", "style": "position: relative; z-index: 2; padding: 44px 24px 104px; display: flex; flex-direction: column; align-items: center; gap: 18px; text-align: center;" },
          $h("span", { "style": "font-size: 18px; color: #4A4F57;" },
            "Toutes les plateformes incluses"
          ),
          $h("div", { "style": "display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 14px 44px; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: #0E0F12;" },
            $h("span", { "style": "display: inline-flex; align-items: center; gap: 12px;" },
              $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z", "fill": "#25F4EE", "transform": "translate(-0.7 -0.7)" }),
                $h("path", { "d": "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z", "fill": "#FE2C55", "transform": "translate(0.7 0.7)" }),
                $h("path", { "d": "M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z", "fill": "#0E0F12" })
              ),
              "TikTok"
            ),
            $h("span", { "style": "display: inline-flex; align-items: center; gap: 12px;" },
              $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("defs", null,
                  $h("linearGradient", { "id": "igD", "x1": "0", "y1": "1", "x2": "1", "y2": "0" },
                    $h("stop", { "offset": "0%", "stop-color": "#FEDA75" }),
                    $h("stop", { "offset": "30%", "stop-color": "#FA7E1E" }),
                    $h("stop", { "offset": "60%", "stop-color": "#D62976" }),
                    $h("stop", { "offset": "100%", "stop-color": "#4F5BD5" })
                  )
                ),
                $h("rect", { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "5.5", "fill": "none", "stroke": "url(#igD)", "stroke-width": "2.2" }),
                $h("circle", { "cx": "12", "cy": "12", "r": "4.1", "fill": "none", "stroke": "url(#igD)", "stroke-width": "2.2" }),
                $h("circle", { "cx": "17.2", "cy": "6.8", "r": "1.3", "fill": "url(#igD)" })
              ),
              "Instagram"
            )
          )
        ),
        $h("div", { "id": "produit", "style": "background-color: #F3F3F5; background-image: repeating-linear-gradient(135deg, rgba(14,15,18,0.05) 0 1px, transparent 1px 9px);" },
          $h("div", { "style": "max-width: 1320px; margin: 0 auto; background: #FAFAFA; border-left: 1px solid #E6E6EA; border-right: 1px solid #E6E6EA; box-sizing: border-box;" },
            $h("section", { "style": "padding: 96px 72px 80px; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 40px 56px; border-top: 1px solid #E6E6EA;" },
              $h("div", { "style": "flex: 1 1 640px; min-width: 0; display: flex; flex-direction: column; gap: 22px;" },
                $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: 0.04em; color: #5F656E;" },
                  $h("span", { "style": `color: ${$t($v.blue)};` },
                    "["
                  ),
                  " RADAR ",
                  $h("span", { "style": `color: ${$t($v.blue)};` },
                    "]"
                  )
                ),
                $h("h2", { "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(44px, 5.6vw, 84px); line-height: 1.02; letter-spacing: -0.05em;" },
                  "Les apps qui explosent, en ce moment."
                ),
                $h("p", { "style": "margin: 0; max-width: 700px; font-size: 20px; line-height: 1.55; color: #4A4F57;" },
                  "Plus de ", $t($v.rs?.apps), " apps et ", $t($v.rs?.accounts), " comptes suivis en continu sur TikTok et Instagram, sur tous les marchés. Choisis un marché, une niche, et plonge dans les formats et les créateurs de n'importe quelle app."
                )
              ),
              $h("a", { "href": "/inscription", "class": "cta", "style": "display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                "Voir ce qui explose",
                $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ),
            $h("div", { "style": "border-top: 1px solid #E6E6EA; display: flex; flex-wrap: wrap;" },
              $h("div", { "style": "flex: 1 1 560px; min-width: 0; border-right: 1px solid #E6E6EA; padding: 40px 56px 52px; box-sizing: border-box; display: flex; flex-direction: column; gap: 32px;" },
                $h("div", { "aria-hidden": "true", "style": "position: relative; height: 460px; overflow: hidden;" },
                  $h("div", { "style": "position: absolute; left: 50%; top: 82%; width: 820px; height: 820px; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(circle, rgba(14,15,18,0.035) 0%, rgba(14,15,18,0.02) 45%, transparent 70%);" }),
                  $h("div", { "style": "position: absolute; left: 50%; top: 82%; width: 560px; height: 560px; transform: translate(-50%, -50%); border-radius: 50%; background: rgba(14,15,18,0.025);" }),
                  $h("div", { "style": "position: absolute; left: 50%; top: 82%; width: 320px; height: 320px; transform: translate(-50%, -50%); border-radius: 50%; background: rgba(14,15,18,0.03);" }),
                  $h("div", { "style": "position: absolute; left: 50%; top: 82%; width: 0; height: 0;" },
                    $h("div", { "style": "position: absolute; left: -160px; top: -160px; width: 320px; height: 320px; animation: lp-spin 46s linear infinite;" },
                      ($l($v.o1)).map((b) => [
                        $h("div", { "style": `position: absolute; left: ${$t(b?.x)}; top: ${$t(b?.y)}; transform: translate(-50%, -50%);` },
                          $h("div", { "style": "width: 60px; height: 60px; border-radius: 18px; border: 3px solid #FFFFFF; box-sizing: border-box; overflow: hidden; background: #FFFFFF; box-shadow: 0 10px 24px rgba(16,24,40,0.16); animation: lp-spinRev 46s linear infinite;" },
                            $h("img", { "src": b?.icon, "alt": b?.t, "style": "width: 100%; height: 100%; display: block; object-fit: cover;" })
                          )
                        )
                      ])
                    ),
                    $h("div", { "style": "position: absolute; left: -280px; top: -280px; width: 560px; height: 560px; animation: lp-spinRev 70s linear infinite;" },
                      ($l($v.o2)).map((b) => [
                        $h("div", { "style": `position: absolute; left: ${$t(b?.x)}; top: ${$t(b?.y)}; transform: translate(-50%, -50%);` },
                          $h("div", { "style": "width: 60px; height: 60px; border-radius: 18px; border: 3px solid #FFFFFF; box-sizing: border-box; overflow: hidden; background: #FFFFFF; box-shadow: 0 10px 24px rgba(16,24,40,0.16); animation: lp-spin 70s linear infinite;" },
                            $h("img", { "src": b?.icon, "alt": b?.t, "style": "width: 100%; height: 100%; display: block; object-fit: cover;" })
                          )
                        )
                      ])
                    ),
                    $h("div", { "style": "position: absolute; left: -410px; top: -410px; width: 820px; height: 820px; animation: lp-spin 96s linear infinite;" },
                      ($l($v.o3)).map((b) => [
                        $h("div", { "style": `position: absolute; left: ${$t(b?.x)}; top: ${$t(b?.y)}; transform: translate(-50%, -50%);` },
                          $h("div", { "style": "width: 60px; height: 60px; border-radius: 18px; border: 3px solid #FFFFFF; box-sizing: border-box; overflow: hidden; background: #FFFFFF; box-shadow: 0 10px 24px rgba(16,24,40,0.16); animation: lp-spinRev 96s linear infinite;" },
                            $h("img", { "src": b?.icon, "alt": b?.t, "style": "width: 100%; height: 100%; display: block; object-fit: cover;" })
                          )
                        )
                      ])
                    ),
                    $h("div", { "style": `position: absolute; left: -48px; top: -48px; width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(180deg, #4C9AFF 0%, ${$t($v.blue)} 100%); box-shadow: 0 0 0 10px rgba(11,111,224,0.08), 0 22px 50px rgba(11,111,224,0.45), inset 0 1px 0 rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center;` },
                      $h("svg", { "width": "44", "height": "44", "viewBox": "0 0 24 24" },
                        $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                        $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#FFFFFF" }),
                        $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                        $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.75" }),
                        $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.75" }),
                        $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.75" }),
                        $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.75" })
                      )
                    )
                  )
                ),
                $h("div", { "style": "display: flex; flex-direction: column; gap: 10px;" },
                  $h("h3", { "style": "margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.02em;" },
                    "Les apps qui explosent, marché par marché"
                  ),
                  $h("p", { "style": "margin: 0; font-size: 19px; line-height: 1.55; color: #4A4F57;" },
                    "Chaque jour, les apps qui décollent sur les réseaux dans chaque pays, avec leurs comptes et leurs vidéos. Tu les vois avant tout le monde."
                  )
                )
              ),
              $h("div", { "style": "flex: 1 1 560px; min-width: 0; padding: 40px 56px 52px; box-sizing: border-box; display: flex; flex-direction: column; gap: 32px;" },
                $h("div", { "aria-hidden": "true", "style": "height: 460px; background: #FFFFFF; border: 1px solid #E6E6EA; border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 20px 50px rgba(16,24,40,0.06);" },
                  $h("div", { "style": "height: 46px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; border-bottom: 1px solid #F0F0F3;" },
                    $h("span", { "style": `width: 26px; height: 26px; border-radius: 8px; background: ${$t($v.blue)}; display: inline-flex; align-items: center; justify-content: center;` },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24" },
                        $h("circle", { "cx": "5", "cy": "8", "r": "2.4", "fill": "#FFFFFF" }),
                        $h("circle", { "cx": "11", "cy": "5", "r": "2.4", "fill": "#FFFFFF" }),
                        $h("circle", { "cx": "17", "cy": "8", "r": "2.4", "fill": "#FFFFFF" }),
                        $h("circle", { "cx": "11", "cy": "16", "r": "2.4", "fill": "#FFFFFF" })
                      )
                    ),
                    $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; background: #F4F5F7; border-radius: 8px; padding: 4px 14px; font-size: 12px; color: #5F656E;" },
                      "swarm.app/apps/astra-ai"
                    ),
                    $h("span", { "style": "width: 26px;" })
                  ),
                  $h("div", { "style": "flex: 1 1 auto; display: flex; min-height: 0;" },
                    $h("div", { "style": "width: 44px; flex-shrink: 0; border-right: 1px solid #F0F0F3; display: flex; flex-direction: column; align-items: center; gap: 16px; padding-top: 16px;" },
                      $h("span", { "style": "width: 16px; height: 16px; border-radius: 4px; background: #E3E5E9;" }),
                      $h("span", { "style": `width: 16px; height: 16px; border-radius: 4px; background: ${$t($v.blue)};` }),
                      $h("span", { "style": "width: 16px; height: 16px; border-radius: 4px; background: #E3E5E9;" }),
                      $h("span", { "style": "width: 16px; height: 16px; border-radius: 4px; background: #E3E5E9;" })
                    ),
                    $h("div", { "style": "flex: 1 1 auto; min-width: 0; padding: 16px; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 16px;" },
                      $h("div", { "style": "display: flex; flex-direction: column; gap: 10px; min-width: 0;" },
                        $h("div", { "style": "display: flex; justify-content: space-between; align-items: center; gap: 8px;" },
                          $h("span", { "style": "font-size: 14px; color: #4A4F57;" },
                            "Sa meilleure vidéo"
                          ),
                          $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 16px;" },
                            $h("span", { "style": `width: 7px; height: 7px; border-radius: 50%; background: ${$t($v.blue)}; animation: lp-pulse 1.8s infinite;` }),
                            "2,0 M"
                          )
                        ),
                        $h("svg", { "viewBox": "0 0 360 150", "width": "100%", "height": "170", "preserveAspectRatio": "none" },
                          $h("defs", null,
                            $h("linearGradient", { "id": "lpA", "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                              $h("stop", { "offset": "0%", "stop-color": "#0B6FE0", "stop-opacity": "0.22" }),
                              $h("stop", { "offset": "100%", "stop-color": "#0B6FE0", "stop-opacity": "0" })
                            )
                          ),
                          $h("path", { "d": "M0 109.4 C 25 108.5, 35 107.6, 51.4 107.1 S 110 92, 144 85.4 S 300 30, 360 19.4 L 360 150 L 0 150 Z", "fill": "url(#lpA)", "style": "animation: lp-areaIn 7s ease-in-out infinite;" }),
                          $h("path", { "d": "M0 109.4 C 25 108.5, 35 107.6, 51.4 107.1 S 110 92, 144 85.4 S 300 30, 360 19.4", "fill": "none", "stroke": $v.blue, "stroke-width": "2.5", "stroke-linecap": "round", "stroke-dasharray": "520", "style": "animation: lp-draw 7s ease-in-out infinite;" })
                        ),
                        $h("div", { "style": "display: flex; justify-content: space-between; font-size: 11px; color: #5F656E;" },
                          $h("span", null,
                            "1,76 M à H+79"
                          ),
                          $h("span", { "style": "font-weight: 700; color: #111216;" },
                            "2,0 M à H+114"
                          )
                        ),
                        $h("div", { "style": "margin-top: auto; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #F0F0F3; padding-top: 12px;" },
                          $h("div", { "style": "display: flex; justify-content: space-between; font-size: 14px;" },
                            $h("span", { "style": "color: #4A4F57;" },
                              "Comptes actifs"
                            ),
                            $h("span", { "style": "font-weight: 700;" },
                              "269 / 272"
                            )
                          ),
                          $h("span", { "style": "display: block; height: 6px; border-radius: 999px; background: #EEF0F3; overflow: hidden;" },
                            $h("span", { "style": `display: block; width: 98.9%; height: 6px; background: ${$t($v.blue)}; border-radius: 999px;` })
                          )
                        )
                      ),
                      $h("div", { "style": "display: flex; flex-direction: column; gap: 8px; min-width: 0;" },
                        $h("span", { "style": "font-size: 14px; color: #4A4F57;" },
                          "Son réseau"
                        ),
                        $h("div", { "style": "display: flex; justify-content: space-between; align-items: center; background: #F6F7F9; border-radius: 10px; padding: 9px 12px; font-size: 13px;" },
                          $h("span", { "style": "color: #4A4F57;" },
                            "Comptes suivis"
                          ),
                          $h("span", { "style": "font-weight: 700;" },
                            "272"
                          )
                        ),
                        $h("div", { "style": "display: flex; justify-content: space-between; align-items: center; background: #F6F7F9; border-radius: 10px; padding: 9px 12px; font-size: 13px;" },
                          $h("span", { "style": "color: #4A4F57;" },
                            "Vidéos / sem."
                          ),
                          $h("span", { "style": "font-weight: 700;" },
                            "1 350"
                          )
                        ),
                        $h("div", { "style": "display: flex; justify-content: space-between; align-items: center; margin-top: 6px;" },
                          $h("span", { "style": "font-size: 14px; color: #4A4F57;" },
                            "Vidéos qui explosent"
                          ),
                          $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 14px;" },
                            $h("span", { "style": `width: 7px; height: 7px; border-radius: 50%; background: ${$t($v.blue)}; animation: lp-pulse 1.8s infinite;` }),
                            "225"
                          )
                        ),
                        $h("div", { "style": "display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px;" },
                          ($l($v.thumbs)).map((t) => [
                            $h("span", { "style": "position: relative; aspect-ratio: 3 / 4; border-radius: 8px; overflow: hidden; background: #111216; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 3px; box-sizing: border-box; color: #FFFFFF; font-size: 9px; font-weight: 700;" },
                              $h("img", { "src": t?.img, "alt": "", "style": "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" }),
                              $h("span", { "style": "position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.7));" }),
                              $h("span", { "style": "position: relative;" },
                                $t(t?.v)
                              )
                            )
                          ])
                        )
                      )
                    )
                  )
                ),
                $h("div", { "style": "display: flex; flex-direction: column; gap: 10px;" },
                  $h("h3", { "style": "margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.02em;" },
                    "Les créateurs et les formats derrière chaque app"
                  ),
                  $h("p", { "style": "margin: 0; font-size: 19px; line-height: 1.55; color: #4A4F57;" },
                    "Ses créateurs, ses vidéos qui explosent, ses hooks et ses sons. Tout ce qu'il faut pour la copier."
                  )
                )
              )
            ),
            $h("div", { "style": "border-top: 1px solid #E6E6EA; padding: 28px 40px; display: flex; flex-wrap: wrap; justify-content: center; gap: 16px;" },
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid #EDEDF0; border-radius: 14px; padding: 12px 20px; font-size: 17px; font-weight: 500; box-shadow: 0 6px 16px rgba(16,24,40,0.05);" },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true" },
                  $h("rect", { "x": "3", "y": "3", "width": "5.5", "height": "5.5", "rx": "1.5", "fill": $v.blue }),
                  $h("rect", { "x": "11.5", "y": "3", "width": "5.5", "height": "5.5", "rx": "1.5", "fill": $v.blue, "fill-opacity": "0.45" }),
                  $h("rect", { "x": "3", "y": "11.5", "width": "5.5", "height": "5.5", "rx": "1.5", "fill": $v.blue, "fill-opacity": "0.45" }),
                  $h("rect", { "x": "11.5", "y": "11.5", "width": "5.5", "height": "5.5", "rx": "1.5", "fill": $v.blue })
                ),
                "+", $t($v.rs?.apps), " apps, +", $t($v.rs?.accounts), " comptes"
              ),
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid #EDEDF0; border-radius: 14px; padding: 12px 20px; font-size: 17px; font-weight: 500; box-shadow: 0 6px 16px rgba(16,24,40,0.05);" },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true" },
                  $h("path", { "d": "M3 4h14l-5.5 6.5V16l-3-1.5v-4z", "fill": "none", "stroke": $v.blue, "stroke-width": "1.8", "stroke-linejoin": "round" })
                ),
                "Tous les marchés"
              ),
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid #EDEDF0; border-radius: 14px; padding: 12px 20px; font-size: 17px; font-weight: 500; box-shadow: 0 6px 16px rgba(16,24,40,0.05);" },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true" },
                  $h("path", { "d": "M16 10a6 6 0 1 1-1.8-4.3", "fill": "none", "stroke": $v.blue, "stroke-width": "1.8", "stroke-linecap": "round" }),
                  $h("path", { "d": "M16 3.5v3.2h-3.2", "fill": "none", "stroke": $v.blue, "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "En ce moment, en continu"
              ),
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid #EDEDF0; border-radius: 14px; padding: 12px 20px; font-size: 17px; font-weight: 500; box-shadow: 0 6px 16px rgba(16,24,40,0.05);" },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 20 20", "aria-hidden": "true" },
                  $h("path", { "d": "M3 15l4.5-4.5 3 3L17 7", "fill": "none", "stroke": $v.blue, "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                  $h("path", { "d": "M12.5 7H17v4.5", "fill": "none", "stroke": $v.blue, "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Les créateurs derrière chaque app"
              )
            )
          )
        ),
        $h("div", { "id": "exemple", "style": "background-color: #F3F3F5; background-image: repeating-linear-gradient(135deg, rgba(14,15,18,0.05) 0 1px, transparent 1px 9px); overflow: hidden;" },
          $h("div", { "style": "max-width: 1320px; margin: 0 auto; background: #FAFAFA; border-left: 1px solid #E6E6EA; border-right: 1px solid #E6E6EA; box-sizing: border-box;" },
            $h("section", { "style": "padding: 104px 48px 80px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 24px; border-top: 1px solid #E6E6EA;" },
              $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: 0.04em; color: #5F656E;" },
                $h("span", { "style": `color: ${$t($v.blue)};` },
                  "["
                ),
                " PLAYBOOK ",
                $h("span", { "style": `color: ${$t($v.blue)};` },
                  "]"
                )
              ),
              $h("h2", { "style": "margin: 0; max-width: 1060px; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(44px, 5.6vw, 84px); line-height: 1.02; letter-spacing: -0.05em;" },
                "Les formats qui explosent, décortiqués."
              ),
              $h("p", { "style": "margin: 0; max-width: 640px; font-size: 20px; line-height: 1.55; color: #4A4F57;" },
                "Les hooks, les sons et les formats qui font exploser les vues en ce moment, et les créateurs qui les tournent. Tu sais quoi poster dès demain."
              ),
              $h("a", { "href": "/inscription", "class": "cta", "style": "margin-top: 16px; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 600; white-space: nowrap; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                "Voir les formats",
                $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          $h("div", { "style": "position: relative; background: radial-gradient(900px 420px at 50% 40%, rgba(11,111,224,0.07), transparent 70%), #FAFAFA; border-top: 1px solid #E6E6EA; border-bottom: 1px solid #E6E6EA; padding: 24px 0 72px;" },
            $h("div", { "aria-hidden": "true", "style": "position: relative; height: 520px; perspective: 1400px; -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%); mask-image: linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%);" },
              $h("div", { "style": "position: absolute; inset: 0; transform-style: preserve-3d;" },
                ($l($v.arc)).map((v) => [
                  $h("div", { "style": `position: absolute; left: 50%; top: 50%; width: 236px; height: 420px; margin-left: -118px; margin-top: -210px; animation: lp-arcMove 106s linear infinite; animation-delay: ${$t(v?.delay)};` },
                    $h("div", { "style": `position: relative; width: 100%; height: 100%; border-radius: 22px; overflow: hidden; background: #111216; outline: 2px solid rgba(11,111,224,0); outline-offset: 4px; animation: lp-arcRing 106s linear infinite; animation-delay: ${$t(v?.delay)};` },
                      $h("img", { "src": v?.img, "alt": "", "style": "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" }),
                      $h("div", { "style": "position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.30), transparent 28%, transparent 58%, rgba(0,0,0,0.65));" }),
                      $h("span", { "style": "position: absolute; top: 12px; left: 12px; display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.9); color: #111216; border-radius: 999px; padding: 4px 10px 4px 4px; font-size: 12px; font-weight: 600;" },
                        $h("img", { "src": v?.icon, "alt": "", "style": "width: 20px; height: 20px; border-radius: 6px; display: block;" }),
                        $t(v?.app)
                      ),
                      $h("div", { "style": "position: absolute; left: 14px; right: 14px; bottom: 16px; display: flex; justify-content: space-between; align-items: center; gap: 8px; color: #FFFFFF;" },
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-family: 'Inter Tight', sans-serif; font-size: 21px; font-weight: 700;" },
                          $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 12 12" },
                            $h("path", { "d": "M3 1.5v9l7-4.5z", "fill": "#FFFFFF" })
                          ),
                          $t(v?.views)
                        ),
                        $h("span", { "style": "font-size: 11px; color: #E4E7EC; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                          $t(v?.handle)
                        )
                      ),
                      $h("span", { "style": `position: absolute; left: 0; bottom: 0; height: 3px; background: rgba(255,255,255,0.9); animation: lp-progress ${$t(v?.dur)} linear infinite;` })
                    )
                  )
                ])
              )
            )
          )
        ),
        $h("div", { "class": "dk", "style": "position: relative; overflow: hidden; background-color: #05070C; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px); color: #FFFFFF;" },
          $h("div", { "aria-hidden": "true", "style": "position: absolute; left: -12%; top: 4%; width: 900px; height: 700px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.26), transparent); animation: lp-driftA 16s ease-in-out infinite; pointer-events: none;" }),
          $h("div", { "style": "position: relative; max-width: 1320px; margin: 0 auto; background: rgba(8,11,18,0.92); border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08); box-sizing: border-box;" },
            $h("section", { "style": "padding: 104px 48px 56px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 22px;" },
              $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: 0.04em; color: #9AA3B2;" },
                $h("span", { "style": "color: #4C9AFF;" },
                  "["
                ),
                " MUR D'AVIS ",
                $h("span", { "style": "color: #4C9AFF;" },
                  "]"
                )
              ),
              $h("h2", { "style": "margin: 0; max-width: 980px; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(44px, 5.4vw, 80px); line-height: 1.02; letter-spacing: -0.05em;" },
                "Ils ont trouvé leur app. ",
                $h("span", { "style": "color: #4C9AFF;" },
                  "Pourquoi pas toi ?"
                )
              ),
              $h("p", { "style": "margin: 0; max-width: 560px; font-size: 19px; line-height: 1.55; color: #9AA3B2;" },
                "Rejoins les membres qui savent déjà ce qui explose sur les réseaux, avant tout le monde."
              ),
              $h("div", { "role": "img", "aria-label": "Note moyenne des membres : 4,8 sur 5", "style": "display: inline-flex; align-items: center; border-radius: 999px; padding: 12px 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10);" },
                $h("span", { "style": "font-size: 15px; color: #E6E9EF;" },
                  $h("span", { "style": "color: #F5B941;" },
                    "★★★★★"
                  ),
                  " ",
                  $h("span", { "style": "font-weight: 700;" },
                    "4,8 / 5"
                  ),
                  $h("span", { "style": "color: #8A93A3;" },
                    " · note moyenne des membres"
                  )
                )
              )
            ),
            $h("div", { "aria-label": "Avis des membres", "style": "position: relative; height: 640px; overflow: hidden; padding: 0 48px; -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 14%, #000 82%, transparent 100%); mask-image: linear-gradient(to bottom, transparent 0%, #000 14%, #000 82%, transparent 100%);" },
              $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; max-width: 1180px; margin: 0 auto;" },
                ($l($v.avis)).map((c) => [
                  $h("div", { "style": `display: flex; flex-direction: column; gap: 20px; animation: ${$t(c?.anim)};` },
                    ($l(c?.cards)).map((r) => [
                      $h("figure", { "style": `margin: 0; border-radius: 24px; padding: 28px; background: linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.02)); border: 1px solid ${$t(r?.border)}; box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), ${$t(r?.glow)}; display: flex; flex-direction: column; gap: 20px;` },
                        $h("blockquote", { "style": "margin: 0; font-size: 19px; line-height: 1.55; color: #E6E9EF;" },
                          $t(r?.q)
                        ),
                        $h("figcaption", { "style": "display: flex; align-items: center; gap: 12px;" },
                          $h("span", { "style": "display: flex; flex-direction: column;" },
                            $h("span", { "style": "font-weight: 600; font-size: 16px;" },
                              $t(r?.name)
                            ),
                            $h("span", { "style": "font-size: 14px; color: #8A93A3;" },
                              $t(r?.role)
                            )
                          )
                        )
                      )
                    ])
                  )
                ])
              )
            ),
            $h("div", { "aria-hidden": "true", "style": "height: 104px;" })
          )
        ),
        $h("div", { "class": "dk", "style": "position: relative; overflow: hidden; background-color: #05070C; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px); color: #FFFFFF;" },
          $h("div", { "aria-hidden": "true", "style": "position: absolute; right: -10%; top: -20%; width: 900px; height: 700px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.30), transparent); animation: lp-driftB 14s ease-in-out infinite; pointer-events: none;" }),
          $h("div", { "style": "position: relative; max-width: 1320px; margin: 0 auto; background: rgba(8,11,18,0.92); border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.06); box-sizing: border-box;" },
            $h("div", { "aria-hidden": "true", "style": "position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 64px 64px; -webkit-mask-image: radial-gradient(70% 60% at 70% 30%, #000, transparent); mask-image: radial-gradient(70% 60% at 70% 30%, #000, transparent); pointer-events: none;" }),
            $h("section", { "id": "faq", "style": "position: relative; padding: 112px 72px 120px; display: flex; flex-wrap: wrap; gap: 56px 80px; align-items: flex-start;" },
              $h("div", { "style": "flex: 1 1 400px; min-width: 0; display: flex; flex-direction: column; gap: 22px;" },
                $h("span", { "style": "font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: 0.04em; color: #9AA3B2;" },
                  $h("span", { "style": "color: #4C9AFF;" },
                    "["
                  ),
                  " FAQ ",
                  $h("span", { "style": "color: #4C9AFF;" },
                    "]"
                  )
                ),
                $h("h2", { "style": "margin: 0; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: clamp(44px, 5vw, 76px); line-height: 1.02; letter-spacing: -0.05em;" },
                  "Les questions ",
                  $h("span", { "style": "color: #4C9AFF;" },
                    "fréquentes"
                  ),
                  "."
                ),
                $h("p", { "style": "margin: 0; max-width: 420px; font-size: 19px; line-height: 1.55; color: #9AA3B2;" },
                  "Tout ce qu'il faut savoir avant de trouver ton app. Le reste, on en parle par e-mail."
                ),
                $h("div", { "style": "margin-top: 28px; max-width: 420px; border-radius: 22px; padding: 24px; background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.10); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 30px 60px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 18px;" },
                  $h("div", { "style": "display: flex; align-items: center; gap: 12px;" },
                    $h("span", { "style": "width: 10px; height: 10px; border-radius: 50%; background: #4C9AFF; animation: lp-pulseDk 1.8s infinite;" }),
                    $h("span", { "style": "font-weight: 600; font-size: 17px;" },
                      "Une autre question ?"
                    )
                  ),
                  $h("p", { "style": "margin: 0; font-size: 15px; color: #9AA3B2; line-height: 1.55;" },
                    "Écris-nous, on te répond par e-mail."
                  ),
                  $h("div", { "style": "display: flex; gap: 10px; flex-wrap: wrap;" },
                    $h("a", { "href": "#contact", "class": "cta", "style": "display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 50px; box-sizing: border-box; padding: 0 4px 0 20px; border-radius: 999px; background: #FFFFFF; border: 1px solid #FFFFFF; color: #05070C; text-decoration: none; font-size: 15px; font-weight: 600; white-space: nowrap;" },
                      "Écrire à l'équipe",
                      $h("span", { "aria-hidden": "true", "style": "width: 40px; height: 40px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: #05070C; display: grid; place-items: center;" },
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              ),
              $h("div", { "style": "flex: 1.45 1 600px; min-width: 0; display: flex; flex-direction: column; gap: 10px;" },
                ($l($v.faqs)).map((f) => [
                  $h("div", { "style": `border-radius: 18px; background: ${$t(f?.bg)}; border: 1px solid ${$t(f?.border)}; box-shadow: ${$t(f?.shadow)}; transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;` },
                    $h("button", { "type": "button", "onClick": f?.toggle, "aria-expanded": f?.open, "style": "width: 100%; background: transparent; border: 0; padding: 22px 24px; display: flex; align-items: center; gap: 18px; font: inherit; color: #FFFFFF; text-align: left; cursor: pointer;" },
                      $h("span", { "style": "flex: 1 1 auto; font-size: 19px; font-weight: 500; letter-spacing: -0.01em;" },
                        $t(f?.q)
                      ),
                      $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 18 18", "aria-hidden": "true", "style": `flex-shrink: 0; transform: ${$t(f?.rot)}; transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                        $h("path", { "d": "M4.5 7l4.5 4.5L13.5 7", "fill": "none", "stroke": f?.chev, "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $h("div", { "style": `display: grid; grid-template-rows: ${$t(f?.rows)}; transition: grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);` },
                      $h("div", { "style": "overflow: hidden;" },
                        $h("p", { "style": "margin: 0; padding: 0 56px 24px 24px; font-size: 16px; line-height: 1.65; color: #B7BFCC;" },
                          $t(f?.a)
                        )
                      )
                    )
                  )
                ])
              )
            )
          )
        ),
        $h("footer", { "class": "dk", "style": "position: relative; overflow: hidden; flex: 1 0 auto; display: flex; flex-direction: column; background-color: #05070C; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 9px); color: #FFFFFF;" },
          $h("div", { "style": "position: relative; flex: 1 0 auto; width: 100%; max-width: 1320px; margin: 0 auto; background: rgba(8,11,18,0.94); border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.06); box-sizing: border-box;" },
            $h("div", { "style": "padding: 88px 56px 0;" },
              $h("div", { "style": "position: relative; overflow: hidden; border-radius: 32px; padding: 72px 64px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015)); border: 1px solid rgba(255,255,255,0.10); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 40px 90px rgba(0,0,0,0.45); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 40px;" },
                $h("div", { "aria-hidden": "true", "style": "position: absolute; left: 82%; top: 50%; width: 820px; height: 820px; border-radius: 50%; background: conic-gradient(from 0deg, transparent 0deg, transparent 290deg, rgba(76,154,255,0.04) 300deg, rgba(76,154,255,0.32) 360deg); animation: lp-spinC 8s linear infinite; pointer-events: none;" }),
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
                    "Trouver mon app",
                    $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              )
            ),
            $h("div", { "style": "padding: 72px 72px 48px; display: flex; flex-wrap: wrap; gap: 48px 64px; justify-content: space-between;" },
              $h("div", { "style": "flex: 1 1 300px; max-width: 360px; display: flex; flex-direction: column; gap: 18px;" },
                $h("a", { "href": "#top", "style": "display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #FFFFFF;" },
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
                    "swarm"
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
                "© 2026 Swarm"
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
