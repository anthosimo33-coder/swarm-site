// Généré par scripts/dc2preact.py depuis design/app/DossiersB.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Dossier extends DCLogic {

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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'dossiers' ? 'page' : 'false' }));
    return {
      sb, me, getFn: this.props && this.props.get,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false })
    };
  }
  // Les dossiers : sur le site, saved('folders') de la personne ; sur le canevas, l'exemple dans l'état local.
  live() { const P = this.props || {}; return typeof P.saved === 'function' && typeof P.save === 'function'; }
  folders() { return this.live() ? this.props.saved('folders') : ((this.state || {}).local || this.example()); }
  // Réécrit la valeur entière, à partir de la dernière connue ; rien tant qu'elle n'est pas arrivée.
  change(fn) {
    const cur = this.folders();
    if (cur === undefined) return;
    const next = fn(Array.isArray(cur) ? cur : []);
    if (this.live()) this.props.save('folders', next); else this.setState({ local: next });
  }
  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    const live = this.live();
    const raw = this.folders();
    const loading = raw === undefined;
    const all = Array.isArray(raw) ? raw : [];
    // Le dossier de l'adresse (/app/dossiers/<id>) ; sur le canevas, ?d=<id> ou le premier de l'exemple.
    let id = P.params && P.params.id;
    if (!id && !live && typeof location !== 'undefined') id = new URLSearchParams(location.search).get('d');
    if (!id && !live && all[0]) id = all[0].id;
    const folder = all.filter((f) => f.id === id)[0] || null;
    const DAY = 86400000;
    const dayTxt = (ms) => {
      const d = new Date(ms), z = new Date();
      const n = Math.round((new Date(z.getFullYear(), z.getMonth(), z.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / DAY);
      return n <= 0 ? 'aujourd’hui' : n === 1 ? 'hier' : 'le ' + d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };
    const last = (f) => Math.max(f.createdAt || 0, ...(f.items || []).map((x) => x.at || 0));
    const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');
    const side = all.slice().sort((x, y) => last(y) - last(x)).map((f) => {
      const on = f.id === id;
      const src = ((f.items || []).filter((x) => x.cover)[0] || {}).cover || '';
      return { name: f.name, count: (f.items || []).length, src, nosrc: !src, href: '/app/dossiers/' + f.id, cur: on ? 'page' : 'false',
        bg: on ? 'var(--accent-soft)' : 'transparent', edge: on ? 'var(--accent-edge)' : 'transparent', ink: on ? 'var(--ink)' : 'var(--ink-soft)' };
    });
    const out = { side, gone: !loading && !folder && !st.deleted, has: !!folder };
    if (!folder) return Object.assign(out, { apps: [], fmts: [], crs: [], vids: [], tabs: [] });

    // Ce que l'on sait de chaque élément : les listes du Radar (apps, formats), sinon sa fiche, sinon ce qui a été gardé.
    const G = (k) => (live && typeof P.get === 'function' ? P.get(k) : undefined);
    const byKey = (doc, list, key) => { const m = {}; ((doc && doc[list]) || []).forEach((x) => { m[x[key]] = x; }); return m; };
    const A = byKey(G('apps'), 'apps', 'slug');
    const F = byKey(G('formats'), 'formats', 'id');
    let budget = 60; // une fiche lue par créateur ou vidéo, pas plus de 60
    const one = (k) => (budget-- > 0 ? G(k) : undefined);
    const EX = live ? {} : b.exd;
    const MKN = (c) => ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
    const MKW = (t) => new Proxy(t, { get: (o, c) => o[c] || MKN(String(c)) }); // un nom pour chaque pays, pas de « autres langues »
    const M = MKW({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil' });
    const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n)));
    const xf = (x) => (x >= 10 ? Math.round(x).toLocaleString('fr-FR') : x.toFixed(1).replace(/\.0$/, '').replace('.', ',')) + '×';
    const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    const items = folder.items || [];
    const drop = (it) => this.change((fs) => fs.map((f) => (f.id !== folder.id ? f : Object.assign({}, f, { items: (f.items || []).filter((x) => !(x.kind === it.kind && x.id === it.id)) }))));
    const base = (it, href) => ({ href: href + it.id, remove: () => drop(it), rmLabel: 'Retirer ' + it.label + ' du dossier' });
    const apps = items.filter((x) => x.kind === 'app').map((it) => {
      const a = A[it.id], ex = EX['app:' + it.id] || {};
      const logo = (a && a.icon) || it.cover || '';
      return Object.assign(base(it, '/app/apps/'), { n: a ? a.name : it.label, niche: a ? a.niche : (ex.niche || ''), logo: logo || false, nologo: !logo, blank: logo ? '' : 'sw-app-blank',
        v: a ? nf(a.views30) : (ex.v || '—'),
        covs: (a ? (a.top || []).map((t) => t.cover) : (ex.covs || [])).filter(Boolean).slice(0, 3).map((src) => ({ src })) });
    });
    const fmts = items.filter((x) => x.kind === 'format').map((it) => {
      const f = F[it.id] || one('format:' + it.id), ex = EX['format:' + it.id] || {};
      const cov = (f ? (f.members || []).map((m) => m.cover) : (ex.cov || [it.cover])).filter(Boolean).slice(0, 3).map((src) => ({ src }));
      return Object.assign(base(it, '/app/formats/'), { quote: f ? (f.kind === 'hook' ? '« ' + f.label + ' »' : f.label) : it.label,
        meta: f ? (f.kind === 'hook' ? 'Accroche' : 'Son') + ' · ' + f.accounts + ' comptes' : (ex.meta || 'Format'), med: f && f.medX ? xf(f.medX) : (ex.med || ''), cov, hasCov: cov.length > 0 });
    });
    const crs = items.filter((x) => x.kind === 'creator').map((it) => {
      const c = one('creator:' + it.id), ex = EX['creator:' + it.id] || {};
      return Object.assign(base(it, '/app/createurs/'), { h: c ? '@' + c.handle : it.label, av: ex.av || '', noav: !ex.av,
        s: c ? [typeof c.fans === 'number' ? nf(c.fans) + ' abonnés' : '', c.app ? c.app.name : '', M[c.market] || ''].filter(Boolean).join(' · ') : (ex.s || ''),
        big: c && c.median ? nf(c.median) : (ex.big || ''), bigLabel: 'vues d’habitude' });
    });
    const vids = items.filter((x) => x.kind === 'video').map((it) => {
      const d = one('video:' + it.id), ex = EX['video:' + it.id] || {};
      return Object.assign(base(it, '/app/videos/'), { h: d ? '@' + d.handle : it.label, src: (d && d.cover) || it.cover || '',
        s: d ? [d.app ? d.app.name : '', d.publishedAt ? day(d.publishedAt) : ''].filter(Boolean).join(' · ') : (ex.s || ''),
        v: d ? nf(d.views) : (ex.v || ''), x: d && typeof d.x === 'number' ? xf(d.x) : (ex.x || '') });
    });
    const N = { Apps: apps.length, Formats: fmts.length, 'Créateurs': crs.length, 'Vidéos': vids.length };
    const kinds = Object.keys(N).filter((k) => N[k] > 0);
    const tab = N[st.tab] ? st.tab : 'Tout';
    const see = (k) => N[k] > 0 && (tab === 'Tout' || tab === k);
    const editing = !!st.editing, confirming = !!st.confirm;
    const draft = st.draft === undefined ? folder.name : st.draft;
    const commitEdit = () => { const name = draft.trim(); if (!name) return; this.change((fs) => fs.map((f) => (f.id === folder.id ? Object.assign({}, f, { name }) : f))); this.setState({ editing: false, draft: undefined }); };
    return Object.assign(out, {
      name: folder.name, meta: 'Dossier · ' + plural(items.length, 'élément') + ' · ' + (items.length ? 'modifié ' : 'créé ') + dayTxt(last(folder)),
      apps, fmts, crs, vids, nApps: apps.length, nFmts: fmts.length, nCr: crs.length, nVid: vids.length,
      tabs: [['Tout', items.length]].concat(kinds.map((k) => [k, N[k]])).map((t) => ({ l: t[0], n: t[1], on: t[0] === tab ? 'true' : 'false', pick: () => this.setState({ tab: t[0] }) })),
      hasTabs: kinds.length > 1, bare: items.length === 0,
      showApps: see('Apps'), showFmts: see('Formats'), showCr: see('Créateurs'), showVid: see('Vidéos'), showPeople: see('Créateurs') || see('Vidéos'),
      titleOn: !editing && !confirming, editing, confirming, draft,
      askEdit: () => this.setState({ editing: true, confirm: false, draft: folder.name }),
      onDraft: (e) => this.setState({ draft: e.target.value }), commitEdit,
      cancelEdit: () => this.setState({ editing: false, draft: undefined }),
      editKeys: (e) => { if (e.key === 'Enter') { e.preventDefault(); commitEdit(); } else if (e.key === 'Escape') { e.preventDefault(); this.setState({ editing: false, draft: undefined }); } },
      setEdit: (el) => { if (el && el !== this.editEl) { this.editEl = el; el.focus(); el.select(); } },
      askDel: () => this.setState({ confirm: true, editing: false }),
      cancelDel: () => this.setState({ confirm: false }),
      setDel: (el) => { if (el && el !== this.delEl) { this.delEl = el; el.focus(); } },
      delText: items.length ? plural(items.length, 'élément') + ' dedans' : 'Dossier vide',
      // Le lien mène à /app/dossiers ; le dossier part avant.
      commitDel: () => { this.setState({ deleted: true, confirm: false }); this.change((fs) => fs.filter((f) => f.id !== folder.id)); }
    });
  }
  // L'exemple du canevas, à la forme de saved('folders') (docs/donnees-app.md).
  example() {
    const H = 3600000, now = Date.now();
    const it = (kind, id, label, cover, h) => ({ kind, id, label, cover: cover || null, at: now - h * H });
    return [
      { id: 'etudes', name: 'Études, ce qui marche', createdAt: now - 400 * H, items: [
        it('format', 'ich-losche', '« Ich lösche das in 2h‼️ »', '/media/app/v-7706579888727231777.jpg', 2),
        it('format', 'guarda-partilha', '« ‼️🚨GUARDA E PARTILHA🚨‼️ »', '/media/app/v-7705159364558081313.jpg', 3),
        it('video', '7705368869250075925', '@belajarbersamaespi', '/media/app/v-7705368869250075925.jpg', 5),
        it('app', 'astraai', 'Astra AI', '/media/app/app-astra-ai.jpg', 30),
        it('app', 'knowunity', 'Knowunity', '/media/app/app-knowunity.jpg', 31),
        it('app', 'retaincards', 'Retain Cards', '/media/app/retain-cards.jpg', 32),
        it('creator', 'learnwithjoel1', '@learnwithjoel1', '/media/app/av-learnwithjoel1.jpg', 33)] },
      { id: 'side', name: 'Side hustle', createdAt: now - 300 * H, items: [
        it('video', '7566200000000000001', '@zinedine.gsbb', '/media/app/v-7700172397613288736.jpg', 20),
        it('app', 'shortfy', 'Shortfy', null, 40),
        it('creator', 'zinedine.gsbb', '@zinedine.gsbb', '/media/app/av-zinedine.gsbb.jpg', 41),
        it('creator', 'toma.ia', '@toma.ia', '/media/app/av-toma.ia.jpg', 42),
        it('creator', 'laure_acc2', '@laure_acc2', '/media/app/av-laure_acc2.jpg', 43)] },
      { id: 'jalousie', name: 'Jalousie et ex', createdAt: now - 200 * H, items: [
        it('format', 'ojala', '« Ojalá entendieras que no siempre te reclamo porqu… »', '/media/app/v-7705537368907959573.jpg', 50),
        it('app', 'recentfollow', 'RecentFollow', null, 60),
        it('app', 'thecringe', 'The Cringe', '/media/app/app-the-cringe.jpg', 61),
        it('app', 'stalkie', 'Stalkie', '/media/app/stalkie.jpg', 62),
        it('creator', 'meli83.fit', '@meli83.fit', '/media/app/av-meli83.fit.jpg', 63)] },
      { id: 'couple', name: 'Couple', createdAt: now - 150 * H, items: [
        it('format', 'dicsovn', 'original sound - dicsovn', '/media/app/v-7703975267911421191.jpg', 70),
        it('app', 'love8', 'Love8', '/media/app/app-love8.jpg', 80),
        it('app', 'loverzz', 'Loverzz', '/media/app/loverzz.jpg', 81),
        it('creator', 'johan_love8', '@johan_love8', null, 82)] }
    ];
  }

  baseVals() {
    // Sur le canevas : ce que le site lirait dans les listes du Radar, pour les éléments du premier dossier.
    const exd = {
      'app:astraai': { niche: 'Études', v: '57,7 M', covs: ['/media/app/v-7700392351268752661.jpg', '/media/app/v-7697654738124442896.jpg', '/media/app/v-7702743575934684437.jpg'] },
      'app:knowunity': { niche: 'Études', v: '44,4 M', covs: ['/media/app/v-7699151144400244000.jpg', '/media/app/v-7702625361716170002.jpg', '/media/app/v-7698010148391947552.jpg'] },
      'app:retaincards': { niche: 'Études' },
      'format:ich-losche': { meta: 'Accroche · 3 comptes', med: '39×', cov: ['/media/app/v-7706579888727231777.jpg', '/media/app/v-7705712961511263521.jpg', '/media/app/v-7705122381735513376.jpg'] },
      'format:guarda-partilha': { meta: 'Accroche · 3 comptes', med: '17×', cov: ['/media/app/v-7705159364558081313.jpg', '/media/app/v-7702530293768523041.jpg', '/media/app/v-7701734315805166880.jpg'] },
      'creator:learnwithjoel1': { av: '/media/app/av-learnwithjoel1.jpg', s: '12,2 k abonnés · Astra AI · Espagne', big: '28,5 k' },
      'video:7705368869250075925': { s: 'Astra AI · 07/11', v: '1,99 M', x: '2 333×' }
    };
    return { exd };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 960px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
          $h("div", { "style": "display: flex; min-height: 100%; flex: 1;" },
            $h("aside", { "style": "width: 280px; flex-shrink: 0; border-right: 1px solid var(--line); padding: 28px 16px; display: flex; flex-direction: column; gap: 6px;" },
              $h("span", { "style": "padding: 0 12px 10px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
                "Mes dossiers"
              ),
              ($l($v.side)).map((d) => [
                $h("a", { "href": d?.href, "aria-current": d?.cur, "style": `display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 8px; border-radius: 14px; background: ${$t(d?.bg)}; box-shadow: inset 0 0 0 1px ${$t(d?.edge)}; text-decoration: none; color: ${$t(d?.ink)};` },
                  $h("span", { "style": "width: 36px; height: 36px; border-radius: 10px; overflow: hidden; flex-shrink: 0; position: relative; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--ink-faint);" },
                    (d?.src) ? [
                      $h("img", { "class": "sw-cover", "src": d?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    (d?.nosrc) ? [
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $h("span", { "style": "flex: 1; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(d?.name)
                  ),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    $t(d?.count)
                  )
                )
              ]),
              $h("a", { "class": "sw-more", "href": "/app/dossiers?nouveau=1", "style": "padding: 12px; gap: 10px;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Nouveau dossier"
              )
            ),
            $h("div", { "style": "flex: 1; min-width: 0; padding: 32px 32px 48px; display: flex; flex-direction: column; gap: 18px;" },
              ($v.gone) ? [
                $h("div", { "class": "sw-empty", "style": "padding: 96px 24px;" },
                  $h("div", { "class": "sw-empty-radar" }),
                  $h("p", { "class": "sw-empty-title" },
                    "Ce dossier n’existe plus"
                  ),
                  $h("a", { "class": "sw-btn sw-btn-primary sw-btn-sm", "href": "/app/dossiers" },
                    "Voir mes dossiers",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              ] : null,
              ($v.has) ? [
                $h("div", { "style": "display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;" },
                  ($v.titleOn) ? [
                    $h("div", { "style": "display: flex; flex-direction: column; gap: 6px; min-width: 0;" },
                      $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                        $t($v.meta)
                      ),
                      $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 38px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em; overflow-wrap: anywhere;" },
                        $t($v.name)
                      )
                    ),
                    $h("span", { "style": "display: flex; gap: 4px; flex-shrink: 0;" },
                      $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.askEdit, "aria-label": "Renommer le dossier", "title": "Renommer" },
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 20h4L19 9l-4-4L4 16zM14 6l4 4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.askDel, "aria-label": "Supprimer le dossier", "title": "Supprimer" },
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  ] : null,
                  ($v.editing) ? [
                    $h("div", { "style": "flex: 1; display: flex; flex-direction: column; gap: 10px; max-width: 560px;" },
                      $h("label", { "class": "sw-label", "for": "db-nom" },
                        "Renommer le dossier"
                      ),
                      $h("div", { "style": "display: flex; align-items: center; gap: 14px;" },
                        $h("input", { "ref": $v.setEdit, "class": "sw-input", "id": "db-nom", "type": "text", "value": $v.draft, "onInput": $v.onDraft, "onKeyDown": $v.editKeys, "maxlength": "60", "autocomplete": "off" }),
                        $h("button", { "class": "sw-link-quiet", "type": "button", "onClick": $v.cancelEdit, "style": "border: 0; background: transparent; cursor: pointer; font: inherit; font-size: 14px;" },
                          "Annuler"
                        ),
                        $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.commitEdit },
                          "Renommer",
                          $h("span", { "class": "sw-btn-tile" },
                            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        )
                      )
                    )
                  ] : null,
                  ($v.confirming) ? [
                    $h("div", { "role": "alertdialog", "aria-label": "Supprimer le dossier", "style": "flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;" },
                      $h("div", { "style": "display: flex; flex-direction: column; gap: 6px; min-width: 0;" },
                        $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                          $t($v.delText)
                        ),
                        $h("span", { "style": "font-family: var(--font-display); font-size: 30px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em;" },
                          "Supprimer « ", $t($v.name), " » ?"
                        )
                      ),
                      $h("span", { "style": "display: flex; align-items: center; gap: 14px;" },
                        $h("button", { "class": "sw-link-quiet", "type": "button", "onClick": $v.cancelDel, "style": "border: 0; background: transparent; cursor: pointer; font: inherit; font-size: 14px;" },
                          "Annuler"
                        ),
                        $h("a", { "ref": $v.setDel, "class": "sw-btn sw-btn-primary sw-btn-sm", "href": "/app/dossiers", "onClick": $v.commitDel },
                          "Supprimer",
                          $h("span", { "class": "sw-btn-tile" },
                            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          )
                        )
                      )
                    )
                  ] : null
                ),
                ($v.hasTabs) ? [
                  $h("div", { "style": "display: flex; gap: 8px; flex-wrap: wrap;" },
                    ($l($v.tabs)).map((t) => [
                      $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": t?.on, "onClick": t?.pick, "style": "height: 36px;" },
                        $t(t?.l),
                        $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                          $t(t?.n)
                        )
                      )
                    ])
                  )
                ] : null,
                ($v.bare) ? [
                  $h("div", { "class": "sw-empty", "style": "padding: 72px 24px;" },
                    $h("div", { "class": "sw-empty-radar" }),
                    $h("p", { "class": "sw-empty-title" },
                      "Dossier vide"
                    ),
                    $h("p", { "class": "sw-empty-text" },
                      "Garde une app, une vidéo, un format ou un créateur depuis sa page."
                    ),
                    $h("a", { "class": "sw-btn sw-btn-primary sw-btn-sm", "href": "/app/apps" },
                      "Voir les apps",
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                ] : null,
                ($v.showApps) ? [
                  $h("div", { "style": "display: flex; align-items: baseline; gap: 10px; margin-top: 8px;" },
                    $h("h2", { "class": "sw-card-title", "style": "display: flex; align-items: center; gap: 9px; font-size: 17px;" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Apps"
                    ),
                    $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                      $t($v.nApps)
                    )
                  ),
                  $h("div", { "class": "sw-card", "style": "border-radius: 22px; padding: 4px 0;" },
                    ($l($v.apps)).map((a) => [
                      $h("div", { "style": "display: flex; align-items: center; gap: 8px; padding-right: 12px; border-bottom: 1px solid var(--line);" },
                        $h("a", { "href": a?.href, "style": "flex: 1; min-width: 0; display: grid; grid-template-columns: minmax(0, 1.6fr) 1fr 150px; align-items: center; gap: 16px; padding: 14px 4px 14px 20px; text-decoration: none; color: inherit;" },
                          $h("span", { "style": "display: flex; align-items: center; gap: 14px; min-width: 0;" },
                            $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 44px; height: 44px; border-radius: 12px;" },
                              (a?.logo) ? [
                                $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                              ] : null,
                              (a?.nologo) ? [
                                $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                  $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                )
                              ] : null
                            ),
                            $h("span", { "style": "display: flex; flex-direction: column; gap: 2px; min-width: 0;" },
                              $h("span", { "style": "font-size: 15px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                                $t(a?.n)
                              ),
                              $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                                $t(a?.niche)
                              )
                            )
                          ),
                          $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                            $h("span", { "style": "font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--ink);" },
                              $t(a?.v)
                            ),
                            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                              "vues en 30 j"
                            )
                          ),
                          $h("span", { "style": "display: flex; gap: 4px; justify-content: flex-end;" },
                            ($l(a?.covs)).map((c) => [
                              $h("span", { "class": "sw-video", "style": "display: block; width: 34px; border-radius: 7px;" },
                                $h("img", { "class": "sw-cover", "src": c?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                              )
                            ])
                          )
                        ),
                        $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": a?.remove, "aria-label": a?.rmLabel, "title": "Retirer du dossier", "style": "width: 36px; height: 36px; flex-shrink: 0;" },
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    ])
                  )
                ] : null,
                ($v.showFmts) ? [
                  $h("div", { "style": "display: flex; align-items: baseline; gap: 10px; margin-top: 8px;" },
                    $h("h2", { "class": "sw-card-title", "style": "display: flex; align-items: center; gap: 9px; font-size: 17px;" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                        $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      "Formats"
                    ),
                    $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                      $t($v.nFmts)
                    )
                  ),
                  $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;" },
                    ($l($v.fmts)).map((f) => [
                      $h("div", { "class": "sw-card", "style": "border-radius: 22px; padding: 16px 12px 16px 16px; display: flex; gap: 8px; align-items: center;" },
                        $h("a", { "href": f?.href, "style": "flex: 1; min-width: 0; display: flex; gap: 16px; align-items: center; text-decoration: none; color: inherit;" },
                          (f?.hasCov) ? [
                            $h("span", { "style": "display: flex; gap: 4px;" },
                              ($l(f?.cov)).map((v) => [
                                $h("span", { "class": "sw-video", "style": "display: block; width: 52px; border-radius: 10px;" },
                                  $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                                )
                              ])
                            )
                          ] : null,
                          $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px;" },
                            $h("span", { "style": "font-size: 15px; font-weight: 600; line-height: 1.4; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" },
                              $t(f?.quote)
                            ),
                            $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                              $t(f?.meta),
                              (f?.med) ? [
                                " · ",
                                $h("span", { "style": "color: var(--accent); font-weight: 600;" },
                                  $t(f?.med), " la normale"
                                )
                              ] : null
                            )
                          )
                        ),
                        $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": f?.remove, "aria-label": f?.rmLabel, "title": "Retirer du dossier", "style": "width: 36px; height: 36px; flex-shrink: 0;" },
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    ])
                  )
                ] : null,
                ($v.showPeople) ? [
                  $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: start;" },
                    ($v.showCr) ? [
                      $h("div", { "style": "display: flex; flex-direction: column; gap: 14px;" },
                        $h("div", { "style": "display: flex; align-items: baseline; gap: 10px; margin-top: 8px;" },
                          $h("h2", { "class": "sw-card-title", "style": "display: flex; align-items: center; gap: 9px; font-size: 17px;" },
                            $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                              $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            ),
                            "Créateurs"
                          ),
                          $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                            $t($v.nCr)
                          )
                        ),
                        ($l($v.crs)).map((c) => [
                          $h("div", { "class": "sw-card", "style": "border-radius: 22px; padding: 18px 12px 18px 20px; display: flex; align-items: center; gap: 8px;" },
                            $h("a", { "href": c?.href, "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit;" },
                              $h("span", { "style": "width: 52px; height: 52px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                                (c?.av) ? [
                                  $h("img", { "src": c?.av, "alt": "", "style": "width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                                ] : null,
                                (c?.noav) ? [
                                  $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                    $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                                    $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                                  )
                                ] : null
                              ),
                              $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                                $h("span", { "style": "font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                                  $t(c?.h)
                                ),
                                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                                  $t(c?.s)
                                )
                              ),
                              (c?.big) ? [
                                $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end;" },
                                  $h("span", { "style": "font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--accent);" },
                                    $t(c?.big)
                                  ),
                                  $h("span", { "style": "font-size: 11px; color: var(--ink-faint); white-space: nowrap;" },
                                    $t(c?.bigLabel)
                                  )
                                )
                              ] : null
                            ),
                            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": c?.remove, "aria-label": c?.rmLabel, "title": "Retirer du dossier", "style": "width: 36px; height: 36px; flex-shrink: 0;" },
                              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            )
                          )
                        ])
                      )
                    ] : null,
                    ($v.showVid) ? [
                      $h("div", { "style": "display: flex; flex-direction: column; gap: 14px;" },
                        $h("div", { "style": "display: flex; align-items: baseline; gap: 10px; margin-top: 8px;" },
                          $h("h2", { "class": "sw-card-title", "style": "display: flex; align-items: center; gap: 9px; font-size: 17px;" },
                            $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                              $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            ),
                            "Vidéos"
                          ),
                          $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                            $t($v.nVid)
                          )
                        ),
                        ($l($v.vids)).map((v) => [
                          $h("div", { "class": "sw-card", "style": "border-radius: 22px; padding: 14px 12px 14px 14px; display: flex; align-items: center; gap: 8px;" },
                            $h("a", { "href": v?.href, "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 16px; text-decoration: none; color: inherit;" },
                              $h("span", { "class": "sw-video", "style": "display: block; width: 56px; flex-shrink: 0; border-radius: 10px;" },
                                (v?.src) ? [
                                  $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                                ] : null
                              ),
                              $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                                $h("span", { "style": "font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                                  $t(v?.h)
                                ),
                                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                                  $t(v?.s)
                                )
                              ),
                              (v?.v) ? [
                                $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end;" },
                                  $h("span", { "style": "font-family: var(--font-display); font-size: 20px; font-weight: 700;" },
                                    $t(v?.v)
                                  ),
                                  (v?.x) ? [
                                    $h("span", { "style": "font-size: 11px; font-weight: 600; color: var(--accent); white-space: nowrap;" },
                                      $t(v?.x), " sa normale"
                                    )
                                  ] : null
                                )
                              ] : null
                            ),
                            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": v?.remove, "aria-label": v?.rmLabel, "title": "Retirer du dossier", "style": "width: 36px; height: 36px; flex-shrink: 0;" },
                              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            )
                          )
                        ])
                      )
                    ] : null
                  )
                ] : null
              ] : null
            )
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
