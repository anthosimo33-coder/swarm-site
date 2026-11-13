// Généré par scripts/dc2preact.py depuis design/app/Main.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Accueil extends DCLogic {
  // La rangée de cartes défile à la flèche : la flèche n'apparaît que si des cartes dépassent.
  componentDidMount() {
    this.fit = () => this.measureRow();
    window.addEventListener('resize', this.fit);
    this.measureRow();
  }
  componentWillUnmount() { window.removeEventListener('resize', this.fit); }
  componentDidUpdate() { this.measureRow(); }
  measureRow() {
    const el = this.row;
    if (!el) return;
    const st = this.state || {};
    const max = el.scrollWidth - el.clientWidth;
    const more = max > 2;
    if (!more && el.scrollLeft) { el.scrollLeft = 0; this.rowAt = 0; }
    const end = more && !!st.rowEnd && (this.rowAt || 0) >= max - 2;
    if (!!st.rowMore !== more || !!st.rowEnd !== end) this.setState({ rowMore: more, rowEnd: end });
  }

  renderVals() {
    const b = this.baseVals();
    return Object.assign({}, b, this.shellVals(), this.extraVals(b));
  }
  shellVals() {
    const st = this.state || {};
    const u = this.props.user;
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: String(u.initiale || u.prenom || u.email || '?').charAt(0).toUpperCase() }
                 : { prenom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A' };
    const I = {"accueil": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "apps": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "formats": "M4 5h16v14H4zM10 9l5 3-5 3z", "createurs": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "alertes": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "dossiers": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"};
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'accueil' ? 'page' : 'false' }));
    return {
      sb, me, getFn: this.props && this.props.get,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const u = this.props.user;
    const p = u ? (u.prenom || null) : 'Anthony';
    const end = !!st.rowEnd;
    return {
      greet: p ? 'Bon retour, ' + p + '.' : 'Bon retour.',
      showAlert: !!(b.alert && b.alert.on),
      fol: this.followVals(), dos: this.folderVals(),
      setRow: (el) => { this.row = el; },
      rowMore: !!st.rowMore, rowD: end ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6', rowAria: end ? 'Revenir aux premières cartes' : 'Voir les cartes suivantes',
      nextCards: () => {
        const el = this.row;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        const to = end ? 0 : Math.min(max, (this.rowAt || 0) + 316);
        this.rowAt = to;
        el.scrollTo({ left: to, behavior: 'smooth' });
        this.setState({ rowEnd: to >= max - 2 });
      }
    };
  }

  // « Apps suivies » : les apps que la personne suit (saved('follows').apps), avec leurs vues sur 7 jours
  // (document « apps ») ; chacune mène à sa fiche. Sur le canevas : l'état vide, comme avant.
  followVals() {
    const P = this.props || {};
    const site = typeof P.saved === 'function';
    const fv = site ? P.saved('follows') : null;
    const slugs = fv && Array.isArray(fv.apps) ? fv.apps : [];
    const A = site && slugs.length && P.get ? P.get('apps') : null;
    const wait = site && (fv === undefined || (slugs.length > 0 && A === undefined));
    const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(Math.round(n)));
    const pct = (d) => (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' %';
    const by = A && A.apps ? Object.fromEntries(A.apps.map((a) => [a.slug, a])) : {};
    const apps = wait ? [] : slugs.map((s) => by[s]).filter(Boolean).sort((p, q) => (q.views7 || 0) - (p.views7 || 0));
    const rows = apps.slice(0, 4).map((a, i, xs) => ({ logo: a.icon || '', nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank', name: a.name,
      sub: nf(a.views7 || 0) + ' vues en 7 jours', v: typeof a.weekDelta === 'number' ? pct(a.weekDelta) : '', href: '/app/apps/' + a.slug,
      sep: i === xs.length - 1 ? 'transparent' : 'var(--line)' }));
    const n = apps.length;
    return { rows, list: n > 0, empty: !wait && n === 0, wait, title: n > 0 ? n + (n > 1 ? ' apps suivies' : ' app suivie') : 'Apps suivies' };
  }
  // « Dossiers » : ceux de la personne (saved('folders')), les plus récents d'abord ; ils mènent à l'écran Dossiers.
  folderVals() {
    const P = this.props || {};
    const site = typeof P.saved === 'function';
    const fv = site ? P.saved('folders') : null;
    const wait = site && fv === undefined;
    const fs = Array.isArray(fv) ? fv.filter((f) => f && typeof f === 'object').slice().sort((p, q) => (q.createdAt || 0) - (p.createdAt || 0)) : [];
    const rows = fs.slice(0, 4).map((f, i, xs) => { const k = Array.isArray(f.items) ? f.items.length : 0;
      return { name: f.name || 'Sans nom', sub: k === 0 ? 'Vide' : k + (k > 1 ? ' éléments' : ' élément'), sep: i === xs.length - 1 ? 'transparent' : 'var(--line)' }; });
    const n = fs.length;
    return { rows, list: n > 0, empty: !wait && n === 0, wait, title: n > 0 ? n + (n > 1 ? ' dossiers' : ' dossier') : 'Dossiers' };
  }

  baseVals() {
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
    let look = [
      { logo: '/media/app/app-luv-or-pop.jpg', ini: 'L', name: 'Luv or Pop', sub: 'Vidéo à 7,5 M vues', v: 'H+26', bg: 'var(--thumb-plum)' },
      { logo: '/media/app/app-dj-kartier.jpg', ini: 'D', name: 'DJ Kartier', sub: 'Vidéo à 5,5 M vues', v: 'H+43', bg: 'var(--thumb-navy)' },
      { logo: '/media/app/app-astra-ai.jpg', ini: 'A', name: 'Astra AI', sub: 'Une vidéo face à sa normale', v: '2 333×', bg: 'var(--blue-600)' },
      { logo: '/media/app/app-love8.jpg', ini: 'L', name: 'Love8', sub: 'Comptes en une recherche', v: '+69', bg: 'var(--thumb-pine)' }
    ].map((r) => Object.assign(r, { href: '/app/apps/astraai', blank: '', nologo: false }));
    let niches = ['Études', 'Couple', 'Séduction IA', 'Foi', 'Side hustle'];
    let alert = { on: true, cover: '/media/app/v-7705368869250075925.jpg', logo: '/media/app/app-astra-ai.jpg', app: 'Astra AI', views: '2,0 M',
      kicker: 'Alerte · Astra AI', text: 'Une vidéo à 2 333× sa normale', aria: 'Voir la vidéo', href: '/app/videos/7705929733220994337' };

    // Sur le site : l'accueil depuis le Radar (document « home », convex/radarModels.ts).
    // « Ça explose » = les 2 apps qui progressent le plus cette semaine, puis 2 vidéos qui décollent
    // (la 1re vidéo est dans la carte d'alerte) ; chaque ligne mène à sa fiche ou à sa vidéo.
    const D = this.props && this.props.data;
    if (D && D.apps) {
      const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 1e3 ? Math.round(n / 1e3) + ' k' : String(Math.round(n)));
      const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(x).replace('.', ',')) + '×';
      const pct = (d) => (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' %';
      const has = (d) => d !== null && d !== undefined;
      const appRow = (a) => ({ logo: a.icon || '', nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank', name: a.name,
        sub: nf(a.views7 || 0) + ' vues en 7 jours', v: has(a.weekDelta) ? pct(a.weekDelta) : (a.bestX ? xf(a.bestX) : ''), href: '/app/apps/' + a.slug });
      const vidRow = (v) => { const logo = (v.app && v.app.icon) || v.cover || '';
        return { logo, nologo: !logo, blank: logo ? '' : 'sw-app-blank', name: v.app ? v.app.name : '@' + v.handle,
          sub: 'Vidéo à ' + nf(v.views) + ' vues', v: v.x ? xf(v.x) : '', href: '/app/videos/' + v.id }; };
      const apps = D.apps.slice().sort((p, q) => (has(q.weekDelta) ? q.weekDelta : -Infinity) - (has(p.weekDelta) ? p.weekDelta : -Infinity));
      const vids = D.videos || [];
      look = apps.slice(0, 2).map(appRow).concat(vids.slice(1, 3).map(vidRow), apps.slice(2).map(appRow)).slice(0, 4);
      niches = D.niches || [];
      const v0 = vids[0];
      const who = v0 ? (v0.app ? v0.app.name : '@' + v0.handle) : '';
      alert = v0 ? { on: true, cover: v0.cover || '', logo: (v0.app && v0.app.icon) || '', app: who, views: nf(v0.views),
        kicker: 'Alerte · ' + who, text: v0.x ? 'Une vidéo à ' + xf(v0.x) + ' sa normale' : 'Une vidéo à ' + nf(v0.views) + ' vues',
        aria: 'Voir la vidéo de @' + v0.handle, href: '/app/videos/' + v0.id } : { on: false };
    }
    look = look.map((r, i, a) => Object.assign(r, { sep: i === a.length - 1 ? 'transparent' : 'var(--line)' }));
    // Une niche mène au classement des apps filtré sur elle (/app/apps?niche=…).
    niches = niches.map((n) => ({ label: n, href: '/app/apps?niche=' + encodeURIComponent(n) }));
    return {
      nav,
      look, hasLook: look.length > 0,
      niches, hasNiches: niches.length > 0,
      alert
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1120px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
          $h("button", { "class": "sw-side-item", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher, raccourci Commande K", "style": "border: 0; background: transparent; font-family: inherit; cursor: pointer;" },
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
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; position: relative; overflow: hidden; display: flex; flex-direction: column; background: var(--surface);" },
          $h("div", { "aria-hidden": "true", "style": "position: absolute; inset: 0; pointer-events: none;" },
            $h("div", { "style": "position: absolute; left: calc(50% - 560px); top: -300px; width: 1120px; height: 780px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.30), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
            $h("div", { "class": "sw-grid-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(44% 38% at 50% 30%, #000, transparent); mask-image: radial-gradient(44% 38% at 50% 30%, #000, transparent);" })
          ),
          $h("section", { "style": "position: relative; width: 100%; max-width: 940px; margin: 0 auto; padding: 122px 24px 0; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; text-align: center;" },
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
              $t($v.greet)
            ),
            $h("p", { "class": "sw-enter", "style": "margin: 14px 0 0; font-size: 19px; line-height: 1.55; color: var(--ink-muted); animation-delay: 0.2s;" },
              "Ce qui explose sur TikTok, Instagram et YouTube Shorts, app par app, marché par marché."
            ),
            $h("div", { "role": "search", "class": "sw-search sw-enter", "style": "margin-top: 40px; width: 100%; height: 72px; padding: 0 10px 0 26px; box-sizing: border-box; box-shadow: var(--shadow-float), 0 0 0 8px rgba(76,154,255,0.07); animation-delay: 0.3s;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "q", "type": "search", "aria-label": "Chercher une app, un format ou un créateur", "placeholder": "Cherche une app, un format, un créateur…", "style": "font-size: 18px;" }),
              $h("span", { "class": "sw-kbd" },
                "⌘ K"
              )
            ),
            ($v.hasNiches) ? [
              $h("div", { "class": "sw-enter", "style": "margin-top: 28px; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; animation-delay: 0.5s;" },
                $h("span", { "style": "font-size: 14px; color: var(--ink-faint); padding-right: 4px;" },
                  "Ça explose cette semaine :"
                ),
                ($l($v.niches)).map((t) => [
                  $h("a", { "class": "sw-pill", "href": t?.href },
                    $t(t?.label)
                  )
                ])
              )
            ] : null
          ),
          $h("section", { "aria-label": "Raccourcis", "style": "position: relative; margin-top: auto; padding: 64px 0 48px 32px;" },
            $h("div", { "ref": $v.setRow, "style": "display: flex; gap: 16px; overflow: hidden; padding: 4px 0 24px; -webkit-mask-image: linear-gradient(to right, #000 84%, transparent 100%); mask-image: linear-gradient(to right, #000 84%, transparent 100%);" },
              $h("article", { "class": "sw-card", "style": "flex: 0 0 300px; height: 340px; box-sizing: border-box; padding: 10px; display: flex; flex-direction: column;" },
                ($v.fol?.list) ? [
                  $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track); padding: 8px 14px; display: flex; flex-direction: column;" },
                    ($l($v.fol?.rows)).map((r) => [
                      $h("a", { "href": r?.href, "style": `height: 60px; display: flex; align-items: center; gap: 12px; text-decoration: none; border-bottom: 1px solid ${$t(r?.sep)};` },
                        $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 30px; height: 30px; border-radius: 9px;" },
                          (r?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": r?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (r?.nologo) ? [
                            $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column;" },
                          $h("span", { "class": "sw-app-name" },
                            $t(r?.name)
                          ),
                          $h("span", { "class": "sw-app-sub" },
                            $t(r?.sub)
                          )
                        ),
                        $h("span", { "style": "flex-shrink: 0; white-space: nowrap; font-family: var(--font-mono); font-size: 13px; color: var(--ink); font-variant-numeric: tabular-nums;" },
                          $t(r?.v)
                        )
                      )
                    ])
                  )
                ] : null,
                ($v.fol?.empty) ? [
                  $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 20px; text-align: center;" },
                    $h("span", { "class": "sw-empty-radar", "aria-hidden": "true", "style": "width: 72px; height: 72px;" }),
                    $h("p", { "style": "margin: 0; max-width: 220px; font-size: 14px; line-height: 1.55; color: var(--ink-muted);" },
                      "Suis une app depuis sa fiche pour voir ici ses vues de la semaine."
                    ),
                    $h("a", { "class": "sw-btn sw-btn-primary sw-btn-sm", "href": "/app/apps" },
                      "Parcourir les apps",
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                ] : null,
                ($v.fol?.wait) ? [
                  $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track);" })
                ] : null,
                $h("div", { "style": "height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px;" },
                  $h("span", { "class": "sw-eyebrow", "style": "font-size: 12px; letter-spacing: 0.08em;" },
                    $t($v.fol?.title)
                  )
                )
              ),
              $h("article", { "class": "sw-card", "style": "flex: 0 0 300px; height: 340px; box-sizing: border-box; padding: 10px; display: flex; flex-direction: column;" },
                ($v.dos?.list) ? [
                  $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track); padding: 8px 14px; display: flex; flex-direction: column;" },
                    ($l($v.dos?.rows)).map((f) => [
                      $h("a", { "href": "/app/dossiers", "style": `height: 60px; display: flex; align-items: center; gap: 12px; text-decoration: none; border-bottom: 1px solid ${$t(f?.sep)};` },
                        $h("span", { "class": "sw-app-icon sw-app-blank", "style": "width: 30px; height: 30px; border-radius: 9px;" },
                          $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ),
                        $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column;" },
                          $h("span", { "class": "sw-app-name" },
                            $t(f?.name)
                          ),
                          $h("span", { "class": "sw-app-sub" },
                            $t(f?.sub)
                          )
                        )
                      )
                    ])
                  )
                ] : null,
                ($v.dos?.empty) ? [
                  $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track); display: flex; flex-direction: column; padding: 14px;" },
                    $h("div", { "style": "flex: 1 1 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center;" },
                      $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                        $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                        "Aucun dossier pour l'instant"
                      )
                    )
                  )
                ] : null,
                ($v.dos?.wait) ? [
                  $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track);" })
                ] : null,
                $h("div", { "style": "height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px;" },
                  $h("span", { "class": "sw-eyebrow", "style": "font-size: 12px; letter-spacing: 0.08em;" },
                    $t($v.dos?.title)
                  ),
                  $h("a", { "class": "sw-more", "href": "/app/dossiers" },
                    "Tout voir",
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ),
              ($v.hasLook) ? [
                $h("article", { "class": "sw-card", "style": "flex: 0 0 300px; height: 340px; box-sizing: border-box; padding: 10px; display: flex; flex-direction: column;" },
                  $h("div", { "style": "flex: 1 1 auto; border-radius: 16px; background: var(--track); padding: 8px 14px; display: flex; flex-direction: column;" },
                    ($l($v.look)).map((r) => [
                      $h("a", { "href": r?.href, "style": `height: 60px; display: flex; align-items: center; gap: 12px; text-decoration: none; border-bottom: 1px solid ${$t(r?.sep)};` },
                        $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 30px; height: 30px; border-radius: 9px;" },
                          (r?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": r?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (r?.nologo) ? [
                            $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column;" },
                          $h("span", { "class": "sw-app-name" },
                            $t(r?.name)
                          ),
                          $h("span", { "class": "sw-app-sub" },
                            $t(r?.sub)
                          )
                        ),
                        $h("span", { "style": "flex-shrink: 0; white-space: nowrap; font-family: var(--font-mono); font-size: 13px; color: var(--ink); font-variant-numeric: tabular-nums;" },
                          $t(r?.v)
                        )
                      )
                    ])
                  ),
                  $h("div", { "style": "height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px;" },
                    $h("span", { "class": "sw-eyebrow", "style": "font-size: 12px; letter-spacing: 0.08em;" },
                      "Ça explose"
                    ),
                    $h("a", { "class": "sw-more", "href": "/app/apps" },
                      "Tout voir",
                      $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              ] : null,
              ($v.showAlert) ? [
                $h("article", { "class": "sw-card", "style": "flex: 0 0 300px; height: 340px; box-sizing: border-box; padding: 10px; display: flex; flex-direction: column;" },
                  $h("div", { "style": "position: relative; flex: 1 1 auto; border-radius: 16px; overflow: hidden; background: radial-gradient(60% 40% at 25% 80%, rgba(255,255,255,0.55), transparent 70%), radial-gradient(50% 35% at 85% 30%, rgba(255,255,255,0.45), transparent 70%), linear-gradient(180deg, #4C9AFF 0%, #8DC0FF 55%, #DCEDFF 100%); display: flex; align-items: center; justify-content: center;" },
                    $h("a", { "class": "sw-video", "href": $v.alert?.href, "aria-label": $v.alert?.aria, "style": "display: block; text-decoration: none; width: 118px; border-radius: 16px; box-shadow: 0 20px 40px rgba(5,7,12,0.35); animation: sw-float 6s ease-in-out infinite;" },
                      ($v.alert?.cover) ? [
                        $h("img", { "class": "sw-cover", "src": $v.alert?.cover, "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "class": "sw-video-app", "style": "font-size: 10px;" },
                        ($v.alert?.logo) ? [
                          $h("i", { "style": "overflow: hidden;" },
                            $h("img", { "class": "sw-logo-img", "src": $v.alert?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                          )
                        ] : null,
                        $t($v.alert?.app)
                      ),
                      $h("div", { "class": "sw-video-foot" },
                        $h("span", { "class": "sw-video-views", "style": "font-size: 16px;" },
                          $t($v.alert?.views)
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
                          $t($v.alert?.kicker)
                        ),
                        $h("span", { "class": "sw-toast-text", "style": "font-size: 12px;" },
                          $t($v.alert?.text)
                        )
                      )
                    )
                  ),
                  $h("div", { "style": "height: 52px; display: flex; align-items: center; padding: 0 12px;" },
                    $h("a", { "href": "/app/alertes", "style": "font-size: 15px; font-weight: 600; color: var(--ink); text-decoration: none;" },
                      "Voir les alertes de la semaine"
                    )
                  )
                )
              ] : null
            ),
            ($v.rowMore) ? [
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.nextCards, "aria-label": $v.rowAria, "style": "position: absolute; right: 32px; top: calc(50% - 8px); width: 52px; height: 52px; background: var(--surface-raised); border: 1px solid var(--line); color: var(--ink); box-shadow: var(--shadow-float);" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": $v.rowD, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ] : null
          )
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
