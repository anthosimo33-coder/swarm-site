// Généré par scripts/dc2preact.py depuis design/app/FormatsB.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Formats extends DCLogic {
  componentDidMount() {
    // Menu du marché : un clic ailleurs le ferme.
    this.out = (e) => {
      const st = this.state || {};
      if (!st.open || !this.menuEl || this.menuEl.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-menu-trigger]')) return;
      this.setState({ open: '' });
    };
    document.addEventListener('mousedown', this.out);
  }
  componentWillUnmount() { document.removeEventListener('mousedown', this.out); }
  componentDidUpdate(pp, ps) {
    const st = this.state || {};
    ps = ps || {};
    // Menu ouvert : le focus y reste (Safari ne le donne pas au bouton cliqué), pour qu'Échap le ferme.
    if (st.open && this.menuInput && (st.open !== ps.open || !(this.menuEl && this.menuEl.contains(document.activeElement)))) this.menuInput.focus();
  }

  renderVals() {
    const b = this.baseVals();
    return Object.assign({}, b, this.shellVals(), this.extraVals(b));
  }
  shellVals() {
    const st = this.state || {};
    const u = this.props.user;
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: (Array.from(String(u.initiale || u.prenom || u.email || '?'))[0] || '?').toUpperCase() }
                 : { prenom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A' };
    const I = {"accueil": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "apps": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "formats": "M4 5h16v14H4zM10 9l5 3-5 3z", "createurs": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "alertes": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "dossiers": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"};
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'formats' ? 'page' : 'false' }));
    return {
      sb, me,
      getFn: this.props && this.props.get,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const niche = st.niche || 'Toutes';
    const type = st.type || 'Tout';
    const market = st.market || 'ALL';
    const open = st.open || '';
    const mq = (st.mq || '').toLowerCase();
    const all = b.all || [];
    const okN = (c, nm) => nm === 'Toutes' || c.niche === nm;
    const okT = (c) => type === 'Tout' || (type === 'Accroches' ? c.kind === 'Accroche' : c.kind === 'Son');
    const okM = (c, m) => m === 'ALL' || c.codes.indexOf(m) >= 0;
    const count = (n) => n + (n > 1 ? ' formats' : ' format');
    // À la une : le premier de la liste filtrée ; les cartes : les suivants.
    const list = all.filter((c) => okN(c, niche) && okT(c) && okM(c, market));
    const hero = list[0] || { cov4: [] };
    // Les cartes : 30 d'abord, puis 30 de plus à chaque clic. Les filtres portent sur toute la liste.
    const PAGE = 30;
    const shown = st.shown || PAGE;
    const rest = list.slice(1);
    const cards = rest.slice(0, shown);
    const more = Math.min(PAGE, rest.length - cards.length);
    const P = b.fanPos; // positions de l’éventail (vraies données comme exemple)
    const fan = (hero.cov4 || []).slice(0, 4).map((v, i) => Object.assign({}, v, { l: P[i].l, t: P[i].t, r: P[i].r, z: P[i].z }));
    // Niches : les nombres tiennent compte du type et du marché (sur le canevas : ceux de l'exemple).
    const niches = b.live
      ? ['Toutes'].concat(b.nicheNames).map((l) => ({ l, n: all.filter((c) => okN(c, l) && okT(c) && okM(c, market)).length })).filter((c) => c.l === 'Toutes' || c.n > 0 || c.l === niche)
      : (b.niches || []);
    const MKS = b.MKS;
    const mSel = MKS.filter((m) => m[0] === market)[0] || MKS[0];
    const mkBar = { v: market === 'ALL' ? 'Tous' : mSel[1], open: open === 'marche' ? 'true' : 'false', bg: open === 'marche' ? 'var(--tab-on)' : 'var(--track)', edge: open === 'marche' ? 'var(--accent-edge)' : 'var(--line)',
      toggle: () => this.setState({ open: open === 'marche' ? '' : 'marche', mq: '' }) };
    const radio = (on) => ({ box: on ? '#4C9AFF' : 'var(--line-strong)', fill: on ? '#4C9AFF' : 'transparent', tick: on ? '#05070C' : 'transparent' });
    const keep = (label) => !mq || label.toLowerCase().indexOf(mq) >= 0;
    let menu = { on: false, items: [], total: count(list.length) };
    if (open === 'marche') {
      menu = { on: true, total: count(list.length),
        items: MKS.filter((m) => keep(m[1])).map((m) => { const n = all.filter((c) => okN(c, niche) && okT(c) && okM(c, m[0])).length; const on = market === m[0];
          return Object.assign({ label: m[1], flag: m[2] || false, n: count(n), sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', w: on ? 600 : 500, o: n === 0 ? 0.45 : 1, pick: () => this.setState({ market: m[0], shown: PAGE }) }, radio(on)); }) };
    }
    const NIC = { 'Rencontres': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Bien-être mental': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01', 'Finance': 'M12 2v20M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6', 'Productivité': 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', 'Création de contenu': 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', 'Séduction IA': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', 'Couple': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
      'Études': 'M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7', 'Jalousie et ex': 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      'Side hustle': 'M3 17l6-6 4 4 8-8M15 7h6v6', 'Langues': 'M4 5h8M8 3v2M5 9c1.5 3 4 5 7 6M11 5c-1 4-3.5 7-7 9M13 21l4-9 4 9M14.5 18h5', 'Foi': 'M12 3v18M7 8h10',
      'Social et loisirs': 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3', 'Santé et physique': 'M3 12h4l3-8 4 16 3-8h4',
      'Beauté IA': 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z', 'Toutes': 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5' };
    const NIC0 = 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z';
    const TIC = { Tout: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', Accroches: 'M5 6h14M12 6v13M9 19h6', Sons: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
    return {
      hero, fan, cards, hasHero: list.length > 0, noCards: cards.length === 0,
      moreOn: more > 0, moreLabel: 'Voir ' + more + (more > 1 ? ' formats de plus' : ' format de plus'), gridPad: more > 0 ? '0 32px 24px' : '0 32px 48px',
      showMore: () => this.setState({ shown: shown + PAGE }),
      noCardsText: list.length === 0 ? 'Aucun format pour ces filtres.' : (b.live ? 'Aucun autre format pour ces filtres.' : 'Aucun autre format pour ce filtre cette semaine.'),
      heroEyebrow: b.live ? 'Le plus repris en ce moment' : 'Le plus fort cette semaine',
      listTitle: b.live ? 'Les autres formats du moment' : 'Les autres formats de la semaine',
      listSort: b.live ? 'Triés par nombre de comptes' : 'Triés par × la normale',
      niches: niches.map((c) => { const on = c.l === niche; return Object.assign({}, c, { on: on ? 'true' : 'false', d: NIC[c.l] || NIC0, bg: on ? 'var(--accent-soft)' : 'var(--track)', edge: on ? 'var(--accent-edge)' : 'var(--line)', ink: on ? 'var(--ink)' : 'var(--ink-soft)', fw: on ? '600' : '500', ic: on ? 'var(--accent)' : 'var(--ink-faint)', pick: () => this.setState({ niche: c.l, shown: PAGE }) }); }),
      types: ['Tout', 'Accroches', 'Sons'].map((l) => ({ l, d: TIC[l], on: l === type ? 'true' : 'false', bg: l === type ? 'rgba(255,255,255,0.10)' : 'transparent', ink: l === type ? 'var(--ink)' : 'var(--ink-muted)', fw: l === type ? '600' : '500', ic: l === type ? 'var(--accent)' : 'var(--ink-faint)', pick: () => this.setState({ type: l, shown: PAGE }) })),
      mkBar, menu,
      closeMenu: () => this.setState({ open: '' }), onMq: (e) => this.setState({ mq: e.target.value }),
      menuKeys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.setState({ open: '' }); } },
      setMenu: (el) => { this.menuEl = el; }, setMenuInput: (el) => { this.menuInput = el; }
    };
  }

  baseVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "page"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const niches = [{"l": "Toutes", "n": 10, "on": "true"}, {"l": "Études", "n": 5, "on": "false"}, {"l": "Couple", "n": 3, "on": "false"}, {"l": "Jalousie et ex", "n": 2, "on": "false"}];
    const hero = (globalThis.__dcSample?.["Formats"]?.["hero"] ?? {"rank":"","kind":"","ico":"","isHook":true,"isSon":false,"quote":"","raw":"","gloss":"","niche":"","mk":[],"n":3,"ok":"","okText":"","pips":[],"med":"","medInk":"","hot":true,"max":"","apps":[],"appLine":"","app0":{"name":"","logo":"","nologo":false,"blank":""},"last":"","cov":[],"cov4":[],"views":201780});
    // L’éventail de la une : ses positions, à part de l’exemple (retiré de l’app par scripts/dc2preact.py, audit S4).
    const fanPos = [{"l": 20, "t": 26, "r": -7, "z": 1}, {"l": 132, "t": 6, "r": -2.5, "z": 2}, {"l": 244, "t": 0, "r": 2.5, "z": 3}, {"l": 356, "t": 30, "r": 7, "z": 4}];
    const fan = (globalThis.__dcSample?.["Formats"]?.["fan"] ?? []);
    const cards = (globalThis.__dcSample?.["Formats"]?.["cards"] ?? []);
    // Sur le canevas : l'exemple ci-dessus (la une puis les cartes), filtrable comme sur le site.
    let all = [hero].concat(cards).map((c) => Object.assign({}, c, {
      codes: c.mk.map((m) => m.c), href: '/app/formats', fr: c.rank === '01',
      apps: c.apps.map((a) => Object.assign({ tile: true }, a)),
      cov: c.cov.map((v) => Object.assign({ href: '/app/videos' }, v)), cov4: c.cov4.map((v) => Object.assign({ href: '/app/videos' }, v))
    }));
    let nicheNames = niches.slice(1).map((c) => c.l);
    let MKS = [['ALL', 'Tous les marchés', ''], ['US', 'États-Unis', 'US'], ['MX', 'Mexique', 'MX'], ['BR', 'Brésil', 'BR'], ['DE', 'Allemagne', 'DE'], ['ID', 'Indonésie', 'ID']];
    let live = false;

    // Sur le site : les vraies données du Radar (document « formats », convex/radarModels.ts).
    const D = this.props && this.props.data;
    if (D && D.formats) {
      const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n)));
      const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ICO = { hook: 'M5 6h14M12 6v13M9 19h6', sound: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
      const appOf = (a) => ({ name: a.name, tile: true, logo: a.icon || false, nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank' });
      const others = (n) => 'et ' + n + (n > 1 ? ' autres' : ' autre');
      const names = (as) => (as.length > 3 ? as.slice(0, 2).map((a) => a.name).join(', ') + ' ' + others(as.length - 2)
        : as.length > 1 ? as.slice(0, -1).map((a) => a.name).join(', ') + ' et ' + as[as.length - 1].name : as.map((a) => a.name).join(''));
      const cover = (m) => ({ src: m.cover || '', v: nf(m.views), h: '@' + m.handle, href: '/app/videos/' + m.videoId });
      all = D.formats.map((f) => {
        const hook = f.kind === 'hook';
        const more = f.apps.length - 2;
        // Les cartes montrent 3 reprises sur 4 : on écarte de préférence une sans miniature, l'ordre reste celui des vues.
        const drop = f.members.length > 3 ? f.members.map((m) => !!m.cover).lastIndexOf(false) : -1;
        const three = f.members.filter((m, i) => i !== (drop >= 0 ? drop : 3)).slice(0, 3);
        return {
          kind: hook ? 'Accroche' : 'Son', ico: ICO[f.kind] || ICO.hook, quote: hook ? '« ' + f.label + ' »' : f.label,
          niche: f.niche, codes: [f.market], mk: f.market === 'XX' ? [] : [{ c: f.market }],
          n: f.accounts, ok: f.wins + '/' + f.n, okText: f.wins + ' sur ' + f.n,
          med: f.medX ? xf(f.medX) : '—', medInk: f.medX >= 10 ? 'var(--accent)' : 'var(--ink)', max: nf(f.maxViews),
          apps: f.apps.slice(0, 2).map(appOf).concat(more > 0 ? [{ name: others(more), tile: false, logo: false, nologo: false, blank: '' }] : []),
          app0: f.apps[0] ? appOf(f.apps[0]) : { name: '', logo: false, nologo: true, blank: 'sw-app-blank' }, appLine: names(f.apps),
          last: 'repris le ' + day(f.lastPostAt), cov: three.map(cover), cov4: f.members.slice(0, 4).map(cover),
          href: '/app/formats/' + f.id, fr: false
        };
      });
      const cnt = {};
      D.formats.forEach((f) => { cnt[f.niche] = (cnt[f.niche] || 0) + 1; });
      nicheNames = Object.keys(cnt).sort((p, q) => (p === 'Autres') - (q === 'Autres') || cnt[q] - cnt[p]);
      MKS = [['ALL', 'Tous les marchés', '']].concat(D.markets.map(([c, l]) => [c, l, c]));
      live = true;
    }
    return { nav, niches, hero, fan, fanPos, cards, all, nicheNames, MKS, live };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 2320px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("nav", { "class": "sw-sidebar", "aria-label": "Navigation principale" },
          $h("a", { "class": "sw-side-logo", "href": "/app", "aria-label": "Kopycat, accueil" },
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
          $h("button", { "class": "sw-side-item", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher", "style": "border: 0; background: transparent; font-family: inherit; cursor: pointer;" },
            $h("span", { "class": "sw-side-ico" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            "Chercher"
          ),
          ($l($v.sb)).map((n) => [
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
            $h("a", { "class": "sw-avatar", "href": "/app/compte", "aria-label": "Mon compte", "style": "text-decoration: none;" },
              $t($v.me?.initiale)
            )
          )
        ),
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; background: var(--surface);" },
          $h("header", { "style": "display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; padding: 32px 32px 0;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 40px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em;" },
                "Formats"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Ce que plusieurs comptes reprennent en même temps. Un format qui marche chez trois inconnus marchera chez toi."
              )
            ),
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 440px; height: 48px; padding: 0 18px; border: 0; border-radius: 14px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); backdrop-filter: none; -webkit-backdrop-filter: none;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "qfb", "type": "search", "aria-label": "Chercher une accroche ou un son", "placeholder": "Chercher une accroche ou un son…", "style": "font-size: 15px;" })
            )
          ),
          $h("section", { "aria-label": "Filtres", "style": "margin: 24px 32px 0; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
            $h("div", { "style": "display: flex; gap: 8px; flex-wrap: wrap; padding: 12px 14px;" },
              ($l($v.niches)).map((c) => [
                $h("button", { "type": "button", "aria-pressed": c?.on, "onClick": c?.pick, "style": `display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 12px; border: 0; border-radius: 999px; background: ${$t(c?.bg)}; box-shadow: inset 0 0 0 1px ${$t(c?.edge)}; color: ${$t(c?.ink)}; font: inherit; font-size: 13px; font-weight: ${$t(c?.fw)}; cursor: pointer;` },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t(c?.ic)};` },
                    $h("path", { "d": c?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t(c?.l),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; color: var(--ink-faint);" },
                    $t(c?.n)
                  )
                )
              ])
            ),
            $h("span", { "aria-hidden": "true", "style": "display: block; height: 1px; background: var(--line);" }),
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 14px;" },
              $h("div", { "style": "display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" },
                $h("div", { "role": "tablist", "aria-label": "Type", "style": "display: flex; gap: 4px;" },
                  ($l($v.types)).map((t) => [
                    $h("button", { "type": "button", "role": "tab", "aria-selected": t?.on, "onClick": t?.pick, "style": `display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 14px; border: 0; border-radius: 10px; background: ${$t(t?.bg)}; color: ${$t(t?.ink)}; font: inherit; font-size: 14px; font-weight: ${$t(t?.fw)}; cursor: pointer;` },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": `flex-shrink: 0; color: ${$t(t?.ic)};` },
                        $h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t(t?.l)
                    )
                  ])
                ),
                $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 24px; margin: 0 4px; background: var(--line);" }),
                $h("span", { "style": "position: relative; display: inline-flex;" },
                  $h("button", { "type": "button", "data-menu-trigger": "true", "onClick": $v.mkBar?.toggle, "aria-expanded": $v.mkBar?.open, "aria-haspopup": "listbox", "style": `display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border: 0; border-radius: 10px; background: ${$t($v.mkBar?.bg)}; box-shadow: inset 0 0 0 1px ${$t($v.mkBar?.edge)}; color: var(--ink); font: inherit; font-size: 13px; cursor: pointer;` },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $h("span", { "style": "color: var(--ink-muted);" },
                      "Marché"
                    ),
                    $h("span", { "style": "font-weight: 600;" },
                      $t($v.mkBar?.v)
                    ),
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                      $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  ($v.menu?.on) ? [
                    $h("div", { "ref": $v.setMenu, "role": "listbox", "aria-label": "Marché", "style": "position: absolute; top: 46px; left: 0; z-index: 30; width: 360px; box-sizing: border-box; padding: 8px; border-radius: 22px; background: rgba(13,17,26,0.96); border: 1px solid var(--glass-edge); backdrop-filter: var(--glass-blur-strong); -webkit-backdrop-filter: var(--glass-blur-strong); box-shadow: var(--shadow-float), 0 0 0 1px rgba(0,0,0,0.3); animation: sw-rise .3s cubic-bezier(.2,.8,.2,1) both;" },
                      $h("div", { "style": "display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px; margin-bottom: 6px; border-radius: 14px; background: var(--track);" },
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                          $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        $h("input", { "ref": $v.setMenuInput, "type": "search", "onInput": $v.onMq, "onKeyDown": $v.menuKeys, "aria-label": "Chercher un marché", "placeholder": "Chercher un marché", "style": "flex: 1; min-width: 0; border: 0; background: transparent; outline: none; color: var(--ink); font: inherit; font-size: 14px;" })
                      ),
                      ($l($v.menu?.items)).map((it) => [
                        $h("button", { "type": "button", "role": "option", "aria-selected": it?.sel, "onClick": it?.pick, "onKeyDown": $v.menuKeys, "style": `width: 100%; height: 46px; display: flex; align-items: center; gap: 12px; padding: 0 12px; border: 0; border-radius: 12px; background: ${$t(it?.bg)}; color: var(--ink); font: inherit; font-size: 14px; text-align: left; cursor: pointer; opacity: ${$t(it?.o)};` },
                          $h("span", { "aria-hidden": "true", "style": `width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid ${$t(it?.box)}; background: ${$t(it?.fill)}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;` },
                            $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": it?.tick, "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ),
                          (it?.flag) ? [
                            $h("span", { "class": "sw-flag", "data-c": it?.flag, "aria-hidden": "true" })
                          ] : null,
                          $h("span", { "style": `flex: 1 1 auto; min-width: 0; font-weight: ${$t(it?.w)};` },
                            $t(it?.label)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint); font-variant-numeric: tabular-nums;" },
                            $t(it?.n)
                          )
                        )
                      ]),
                      $h("div", { "style": "margin-top: 6px; padding: 12px 12px 6px; border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                        $h("span", { "style": "font-size: 12px; line-height: 1.4; color: var(--ink-faint); max-width: 190px;" },
                          "Le marché d’un compte, c’est la langue de ses vidéos."
                        ),
                        $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.closeMenu },
                          "Voir ", $t($v.menu?.total),
                          $h("span", { "class": "sw-btn-tile" },
                            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        )
                      )
                    )
                  ] : null
                )
              ),
              $h("div", { "style": "display: flex; align-items: center; gap: 18px;" },
                $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; line-height: 1.25;" },
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    "Affichés"
                  ),
                  $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                    $t($v.menu?.total)
                  )
                ),
                $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 28px; background: var(--line);" }),
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-muted);" },
                  $t($v.listSort),
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                    $h("path", { "d": "M12 5v14M6 13l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          ($v.hasHero) ? [
            $h("section", { "class": "sw-card is-featured", "style": "margin: 16px 32px 0; padding: 44px 44px 44px 48px; border-radius: 28px; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) 520px; gap: 40px; align-items: center;" },
              $h("div", { "aria-hidden": "true", "style": "position: absolute; right: -140px; top: -200px; width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.30), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
              $h("div", { "style": "position: relative; display: flex; flex-direction: column; gap: 22px;" },
                $h("span", { "class": "sw-eyebrow" },
                  $h("b", null,
                    "["
                  ),
                  " ", $t($v.heroEyebrow), " ",
                  $h("b", null,
                    "]"
                  )
                ),
                $h("h2", { "style": "margin: 0; font-family: var(--font-display); font-size: 54px; line-height: 1.02; font-weight: 700; letter-spacing: -0.045em;" },
                  $t($v.hero?.quote)
                ),
                ($v.hero?.fr) ? [
                  $h("p", { "style": "margin: 0; max-width: 520px; font-size: 16px; line-height: 1.6; color: var(--ink-muted);" },
                    "En français : « Je supprime ça dans 2 h ». Le principe : la vidéo va disparaître, il faut la regarder maintenant."
                  )
                ] : null,
                $h("div", { "style": "display: flex; gap: 32px; flex-wrap: wrap; padding: 4px 0;" },
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                    $h("span", { "class": "sw-stat", "style": "color: var(--accent);" },
                      $t($v.hero?.med)
                    ),
                    $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                      "la normale des comptes"
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                    $h("span", { "class": "sw-stat" },
                      $t($v.hero?.okText)
                    ),
                    $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                      "reprises réussies"
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                    $h("span", { "class": "sw-stat" },
                      $t($v.hero?.max)
                    ),
                    $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                      "vues, la meilleure"
                    )
                  )
                ),
                $h("div", { "style": "display: flex; align-items: center; gap: 18px; flex-wrap: wrap;" },
                  $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg", "href": $v.hero?.href },
                    "Voir le format",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  ),
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-muted);" },
                    $h("span", { "class": `sw-app-icon ${$t($v.hero?.app0?.blank)}`, "style": "width: 22px; height: 22px; border-radius: 7px;" },
                      ($v.hero?.app0?.logo) ? [
                        $h("img", { "class": "sw-logo-img", "src": $v.hero?.app0?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      ($v.hero?.app0?.nologo) ? [
                        $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null
                    ),
                    $t($v.hero?.appLine), " · ", $t($v.hero?.n), " comptes · ", $t($v.hero?.niche)
                  )
                )
              ),
              $h("div", { "style": "position: relative; height: 400px;", "aria-label": "Les quatre reprises" },
                ($l($v.fan)).map((c) => [
                  $h("a", { "class": "sw-video", "href": c?.href, "style": `position: absolute; left: ${$t(c?.l)}px; top: ${$t(c?.t)}px; width: 176px; z-index: ${$t(c?.z)}; transform: rotate(${$t(c?.r)}deg); border-radius: 18px; box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08); text-decoration: none;` },
                    $h("img", { "class": "sw-cover", "src": c?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-video-foot" },
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 4px; min-width: 0;" },
                        $h("span", { "class": "sw-video-views" },
                          $t(c?.v)
                        ),
                        $h("span", { "class": "sw-video-handle" },
                          $t(c?.h)
                        )
                      )
                    )
                  )
                ])
              )
            )
          ] : null,
          $h("div", { "style": "padding: 36px 32px 12px; display: flex; align-items: baseline; justify-content: space-between;" },
            $h("h2", { "class": "sw-card-title", "style": "font-size: 20px;" },
              $t($v.listTitle)
            ),
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              $t($v.listSort)
            )
          ),
          $h("div", { "style": `padding: ${$t($v.gridPad)}; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;` },
            ($v.noCards) ? [
              $h("p", { "style": "grid-column: 1 / -1; margin: 24px 0; font-size: 15px; color: var(--ink-muted);" },
                $t($v.noCardsText)
              )
            ] : null,
            ($l($v.cards)).map((f) => [
              $h("div", { "class": "sw-card", "style": "display: flex; flex-direction: column; overflow: hidden; text-decoration: none; color: inherit; border-radius: 24px;" },
                $h("span", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2px; height: 230px; overflow: hidden; background: var(--ground);" },
                  ($l(f?.cov)).map((v) => [
                    $h("a", { "href": v?.href, "style": "position: relative; overflow: hidden; display: block; text-decoration: none;" },
                      $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "style": "position: absolute; left: 10px; bottom: 10px; font-family: var(--font-display); font-size: 16px; font-weight: 700; color: #FFFFFF;" },
                        $t(v?.v)
                      )
                    )
                  ])
                ),
                $h("a", { "href": f?.href, "style": "padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 14px; flex: 1; text-decoration: none; color: inherit;" },
                  $h("span", { "style": "display: flex; align-items: center; gap: 8px;" },
                    $h("span", { "class": "sw-badge", "style": "height: 24px; gap: 6px; padding: 0 9px 0 7px;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t(f?.kind)
                    ),
                    ($l(f?.mk)).map((m) => [
                      $h("span", { "class": "sw-flag", "data-c": m?.c, "style": "width: 24px; height: 18px; font-size: 9px;" },
                        $t(m?.c)
                      )
                    ]),
                    $h("span", { "style": "margin-left: auto; font-size: 12px; color: var(--ink-faint);" },
                      $t(f?.niche)
                    )
                  ),
                  $h("span", { "style": "font-size: 18px; font-weight: 600; line-height: 1.38; letter-spacing: -0.01em; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 50px;" },
                    $t(f?.quote)
                  ),
                  $h("span", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                    $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                      $h("span", { "class": "sw-tile-label" },
                        "× la normale"
                      ),
                      $h("span", { "class": "sw-tile-value", "style": `font-size: 19px; color: ${$t(f?.medInk)};` },
                        $t(f?.med)
                      )
                    ),
                    $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                      $h("span", { "class": "sw-tile-label" },
                        "Réussite"
                      ),
                      $h("span", { "class": "sw-tile-value", "style": "font-size: 19px;" },
                        $t(f?.ok)
                      )
                    ),
                    $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                      $h("span", { "class": "sw-tile-label" },
                        "Meilleure"
                      ),
                      $h("span", { "class": "sw-tile-value", "style": "font-size: 19px;" },
                        $t(f?.max)
                      )
                    )
                  ),
                  $h("span", { "style": "margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 4px;" },
                    $h("span", { "style": "display: flex; flex-wrap: wrap; gap: 4px 10px;" },
                      ($l(f?.apps)).map((a) => [
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                          (a?.tile) ? [
                            $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 18px; height: 18px; border-radius: 6px;" },
                              (a?.logo) ? [
                                $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                              ] : null,
                              (a?.nologo) ? [
                                $h("svg", { "width": "9", "height": "9", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                  $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                )
                              ] : null
                            )
                          ] : null,
                          $h("span", { "style": "font-size: 12px; color: var(--ink-soft);" },
                            $t(a?.name)
                          )
                        )
                      ])
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap;" },
                      $t(f?.n), " comptes · ", $t(f?.last)
                    )
                  )
                )
              )
            ])
          ),
          ($v.moreOn) ? [
            $h("div", { "style": "padding: 0 32px 48px; display: flex; justify-content: center;" },
              $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.showMore, "style": "height: 44px; padding: 0 20px; font-weight: 600;" },
                $t($v.moreLabel),
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                  $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ] : null
        ),
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(Palette, { "onClose": $v.closePal, "get": $v.getFn })
          )
        ] : null
      )
    ];
  }
}
