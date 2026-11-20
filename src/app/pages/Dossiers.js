// Généré par scripts/dc2preact.py depuis design/app/DossiersA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Dossiers extends DCLogic {

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
    const raw = this.folders();
    const loading = raw === undefined;
    const all = Array.isArray(raw) ? raw : [];
    // « Nouveau dossier » depuis un dossier : /app/dossiers?nouveau=1 ouvre la création.
    const query = P.query || (typeof location !== 'undefined' ? Object.fromEntries(new URLSearchParams(location.search)) : {});
    const creating = st.creating === undefined ? !!query.nouveau : st.creating;
    const newName = st.newName || '';
    const createNew = () => {
      const name = newName.trim();
      if (!name || this.folders() === undefined) return;
      const now = Date.now();
      this.change((fs) => [{ id: now.toString(36) + Math.random().toString(36).slice(2, 6), name, createdAt: now, items: [] }].concat(fs));
      this.setState({ creating: false, newName: '' });
    };
    const DAY = 86400000;
    const dayTxt = (ms) => {
      const d = new Date(ms), z = new Date();
      const n = Math.round((new Date(z.getFullYear(), z.getMonth(), z.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / DAY);
      return n <= 0 ? 'aujourd’hui' : n === 1 ? 'hier' : 'le ' + d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };
    const last = (f) => Math.max(f.createdAt || 0, ...(f.items || []).map((x) => x.at || 0));
    const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');
    const NAMES = { app: 'app', format: 'format', creator: 'créateur', video: 'vidéo' };
    const KIND = { app: 'App', format: 'Format', creator: 'Créateur', video: 'Vidéo' };
    const HREF = { app: '/app/apps/', video: '/app/videos/', format: '/app/formats/', creator: '/app/createurs/' };
    const icon = (x) => ({ name: x.label, logo: x.cover || false, nologo: !x.cover, blank: x.cover ? '' : 'sw-app-blank' });
    const sort = st.sort || 'recent';
    let list = all.slice().sort((x, y) => last(y) - last(x));
    if (sort === 'az') list = list.sort((x, y) => String(x.name).localeCompare(String(y.name), 'fr'));
    const folders = list.map((f) => {
      const items = f.items || [];
      const editing = st.edit === f.id, confirming = st.del === f.id;
      const mos = items.filter((x) => x.kind !== 'app' && x.cover).slice(0, 4).map((x) => ({ src: x.cover }));
      const icons = mos.length ? [] : items.filter((x) => x.kind === 'app').slice(0, 4).map(icon);
      const counts = ['app', 'format', 'creator', 'video'].map((k) => [k, items.filter((x) => x.kind === k).length]).filter((c) => c[1] > 0);
      const draft = st.draft === undefined ? f.name : st.draft;
      const commitEdit = () => { const name = draft.trim(); if (!name) return; this.change((fs) => fs.map((x) => (x.id === f.id ? Object.assign({}, x, { name }) : x))); this.setState({ edit: null, draft: undefined }); };
      return {
        id: f.id, name: f.name, href: '/app/dossiers/' + f.id,
        normal: !editing && !confirming, editing, confirming,
        full: mos.length > 0, empty: mos.length === 0, cols: Math.max(1, mos.length), mos,
        icons, hasIcons: icons.length > 0, noIcons: icons.length === 0, hole: items.length ? '' : 'Vide pour l’instant',
        logos: items.filter((x) => x.kind === 'app').slice(0, 3).map(icon),
        mix: counts.length ? counts.map((c) => plural(c[1], NAMES[c[0]])).join(' · ') : 'Aucun élément',
        count: plural(items.length, 'élément'), when: (items.length ? 'modifié ' : 'créé ') + dayTxt(last(f)),
        askEdit: () => this.setState({ edit: f.id, draft: f.name, del: null }),
        askDel: () => this.setState({ del: f.id, edit: null }),
        draft, onDraft: (e) => this.setState({ draft: e.target.value }), commitEdit,
        cancelEdit: () => this.setState({ edit: null, draft: undefined }),
        editKeys: (e) => { if (e.key === 'Enter') { e.preventDefault(); commitEdit(); } else if (e.key === 'Escape') { e.preventDefault(); this.setState({ edit: null, draft: undefined }); } },
        delText: items.length ? plural(items.length, 'élément') + ' dedans.' : 'Il est vide.',
        cancelDel: () => this.setState({ del: null }),
        commitDel: () => { this.change((fs) => fs.filter((x) => x.id !== f.id)); this.setState({ del: null }); }
      };
    });
    // Ajouté récemment : les derniers éléments rangés, une fois chacun, tous dossiers confondus.
    const seen = {};
    const recent = [];
    all.map((f) => (f.items || []).map((x) => ({ x, f }))).reduce((a, l) => a.concat(l), []).sort((p, q) => (q.x.at || 0) - (p.x.at || 0)).forEach(({ x, f }) => {
      const k = x.kind + ':' + x.id;
      if (seen[k] || recent.length >= 6 || !HREF[x.kind]) return;
      seen[k] = true;
      const app = x.kind === 'app';
      recent.push({ kind: KIND[x.kind], t: x.label, folder: f.name, href: HREF[x.kind] + x.id, src: x.cover || '', full: !app && !!x.cover, isApp: app, logo: app && x.cover ? x.cover : false, nologo: app && !x.cover, blank: x.cover ? '' : 'sw-app-blank' });
    });
    return {
      folders, recent, hasRecent: recent.length > 0, many: all.length > 1,
      none: !loading && all.length === 0 && !creating, grid: creating || all.length > 0,
      creating, newName, createNew,
      startNew: () => this.setState({ creating: true, edit: null, del: null }), cancelNew: () => this.setState({ creating: false, newName: '' }),
      onNew: (e) => this.setState({ newName: e.target.value }),
      newKeys: (e) => { if (e.key === 'Enter') { e.preventDefault(); createNew(); } else if (e.key === 'Escape') { e.preventDefault(); this.setState({ creating: false, newName: '' }); } },
      setNew: (el) => { if (el && el !== this.newEl) { this.newEl = el; el.focus(); } },
      setEdit: (el) => { if (el && el !== this.editEl) { this.editEl = el; el.focus(); el.select(); } },
      setDel: (el) => { if (el && el !== this.delEl) { this.delEl = el; el.focus(); } },
      sorts: [['recent', 'Récents'], ['az', 'De A à Z']].map((s) => ({ l: s[1], on: sort === s[0] ? 'true' : 'false', pick: () => this.setState({ sort: s[0] }) }))
    };
  }
  // L'exemple du canevas, à la forme de saved('folders') (docs/donnees-app.md).
  example() {
    const H = 3600000, now = Date.now();
    const it = (kind, id, label, cover, h) => ({ kind, id, label, cover: cover || null, at: now - h * H });
    return [
      { id: 'etudes', name: 'Études, ce qui marche', createdAt: now - 400 * H, items: [
        it('format', 'ich-losche', '« Ich lösche das in 2h‼️ »', (globalThis.__dcSample?.["Dossiers"]?.["$s0"] ?? ""), 2),
        it('format', 'guarda-partilha', '« ‼️🚨GUARDA E PARTILHA🚨‼️ »', (globalThis.__dcSample?.["Dossiers"]?.["$s1"] ?? ""), 3),
        it('video', (globalThis.__dcSample?.["Dossiers"]?.["$s2"] ?? ""), (globalThis.__dcSample?.["Dossiers"]?.["$s3"] ?? ""), (globalThis.__dcSample?.["Dossiers"]?.["$s4"] ?? ""), 5),
        it('app', 'astraai', 'Astra AI', (globalThis.__dcSample?.["Dossiers"]?.["$s5"] ?? ""), 30),
        it('app', 'knowunity', 'Knowunity', (globalThis.__dcSample?.["Dossiers"]?.["$s6"] ?? ""), 31),
        it('app', 'retaincards', 'Retain Cards', (globalThis.__dcSample?.["Dossiers"]?.["$s7"] ?? ""), 32),
        it('creator', 'learnwithjoel1', (globalThis.__dcSample?.["Dossiers"]?.["$s8"] ?? ""), (globalThis.__dcSample?.["Dossiers"]?.["$s9"] ?? ""), 33)] },
      { id: 'side', name: 'Side hustle', createdAt: now - 300 * H, items: [
        it('video', (globalThis.__dcSample?.["Dossiers"]?.["$s10"] ?? ""), (globalThis.__dcSample?.["Dossiers"]?.["$s11"] ?? ""), (globalThis.__dcSample?.["Dossiers"]?.["$s12"] ?? ""), 20),
        it('app', 'shortfy', 'Shortfy', null, 40),
        it('creator', 'zinedine.gsbb', (globalThis.__dcSample?.["Dossiers"]?.["$s13"] ?? ""), (globalThis.__dcSample?.["Dossiers"]?.["$s14"] ?? ""), 41),
        it('creator', 'toma.ia', (globalThis.__dcSample?.["Dossiers"]?.["$s15"] ?? ""), (globalThis.__dcSample?.["Dossiers"]?.["$s16"] ?? ""), 42),
        it('creator', 'laure_acc2', (globalThis.__dcSample?.["Dossiers"]?.["$s17"] ?? ""), (globalThis.__dcSample?.["Dossiers"]?.["$s18"] ?? ""), 43)] },
      { id: 'jalousie', name: 'Jalousie et ex', createdAt: now - 200 * H, items: [
        it('format', 'ojala', '« Ojalá entendieras que no siempre te reclamo porqu… »', (globalThis.__dcSample?.["Dossiers"]?.["$s19"] ?? ""), 50),
        it('app', 'recentfollow', 'RecentFollow', null, 60),
        it('app', 'thecringe', 'The Cringe', (globalThis.__dcSample?.["Dossiers"]?.["$s20"] ?? ""), 61),
        it('app', 'stalkie', 'Stalkie', (globalThis.__dcSample?.["Dossiers"]?.["$s21"] ?? ""), 62),
        it('creator', 'meli83.fit', (globalThis.__dcSample?.["Dossiers"]?.["$s22"] ?? ""), (globalThis.__dcSample?.["Dossiers"]?.["$s23"] ?? ""), 63)] },
      { id: 'couple', name: 'Couple', createdAt: now - 150 * H, items: [
        it('format', 'dicsovn', 'original sound - dicsovn', (globalThis.__dcSample?.["Dossiers"]?.["$s24"] ?? ""), 70),
        it('app', 'love8', 'Love8', (globalThis.__dcSample?.["Dossiers"]?.["$s25"] ?? ""), 80),
        it('app', 'loverzz', 'Loverzz', (globalThis.__dcSample?.["Dossiers"]?.["$s26"] ?? ""), 81),
        it('creator', 'johan_love8', (globalThis.__dcSample?.["Dossiers"]?.["$s27"] ?? ""), null, 82)] }
    ];
  }

  baseVals() {
    return {};
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1060px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
                "Dossiers"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Ce que tu as mis de côté : apps, formats, créateurs et vidéos."
              )
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 12px;" },
              ($v.many) ? [
                $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Tri" },
                  ($l($v.sorts)).map((s) => [
                    $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": s?.on, "onClick": s?.pick, "style": "height: 32px;" },
                      $t(s?.l)
                    )
                  ])
                )
              ] : null,
              $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.startNew },
                "Nouveau dossier",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          ($v.none) ? [
            $h("div", { "class": "sw-empty", "style": "padding: 96px 24px;" },
              $h("div", { "class": "sw-empty-radar" }),
              $h("p", { "class": "sw-empty-title" },
                "Aucun dossier"
              ),
              $h("p", { "class": "sw-empty-text" },
                "Garde des apps, des vidéos, des formats et des créateurs pour les retrouver ici."
              ),
              $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.startNew },
                "Créer un dossier",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ] : null,
          ($v.grid) ? [
            $h("div", { "style": "padding: 28px 32px 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;" },
              ($v.creating) ? [
                $h("div", { "class": "sw-card is-featured", "style": "border-radius: 26px; padding: 22px; display: flex; flex-direction: column; justify-content: center; gap: 14px; min-height: 330px; box-sizing: border-box;" },
                  $h("label", { "class": "sw-label", "for": "nd-nom" },
                    "Nom du dossier"
                  ),
                  $h("input", { "ref": $v.setNew, "class": "sw-input", "id": "nd-nom", "type": "text", "value": $v.newName, "onInput": $v.onNew, "onKeyDown": $v.newKeys, "maxlength": "60", "placeholder": "Une idée d’app, une niche, un marché", "autocomplete": "off" }),
                  $h("div", { "style": "display: flex; justify-content: flex-end; align-items: center; gap: 14px;" },
                    $h("button", { "class": "sw-link-quiet", "type": "button", "onClick": $v.cancelNew, "style": "border: 0; background: transparent; cursor: pointer; font: inherit; font-size: 14px;" },
                      "Annuler"
                    ),
                    $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.createNew },
                      "Créer",
                      $h("span", { "class": "sw-btn-tile" },
                        $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                )
              ] : null,
              ($l($v.folders)).map((f) => [
                (f?.editing) ? [
                  $h("div", { "class": "sw-card is-featured", "style": "border-radius: 26px; padding: 22px; display: flex; flex-direction: column; justify-content: center; gap: 14px; min-height: 330px; box-sizing: border-box;" },
                    $h("label", { "class": "sw-label", "for": "nd-renommer" },
                      "Renommer le dossier"
                    ),
                    $h("input", { "ref": $v.setEdit, "class": "sw-input", "id": "nd-renommer", "type": "text", "value": f?.draft, "onInput": f?.onDraft, "onKeyDown": f?.editKeys, "maxlength": "60", "placeholder": "Une idée d’app, une niche, un marché", "autocomplete": "off" }),
                    $h("div", { "style": "display: flex; justify-content: flex-end; align-items: center; gap: 14px;" },
                      $h("button", { "class": "sw-link-quiet", "type": "button", "onClick": f?.cancelEdit, "style": "border: 0; background: transparent; cursor: pointer; font: inherit; font-size: 14px;" },
                        "Annuler"
                      ),
                      $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": f?.commitEdit },
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
                (f?.confirming) ? [
                  $h("div", { "class": "sw-card is-featured", "role": "alertdialog", "aria-label": `Supprimer le dossier ${$t(f?.name)}`, "style": "border-radius: 26px; padding: 22px; display: flex; flex-direction: column; justify-content: center; gap: 14px; min-height: 330px; box-sizing: border-box;" },
                    $h("span", { "style": "font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink);" },
                      "Supprimer « ", $t(f?.name), " » ?"
                    ),
                    $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                      $t(f?.delText)
                    ),
                    $h("div", { "style": "display: flex; justify-content: flex-end; align-items: center; gap: 14px;" },
                      $h("button", { "class": "sw-link-quiet", "type": "button", "onClick": f?.cancelDel, "style": "border: 0; background: transparent; cursor: pointer; font: inherit; font-size: 14px;" },
                        "Annuler"
                      ),
                      $h("button", { "ref": $v.setDel, "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": f?.commitDel },
                        "Supprimer",
                        $h("span", { "class": "sw-btn-tile" },
                          $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    )
                  )
                ] : null,
                (f?.normal) ? [
                  $h("div", { "class": "sw-card", "style": "display: flex; flex-direction: column; overflow: hidden; border-radius: 26px;" },
                    $h("a", { "href": f?.href, "style": "flex: 1; display: flex; flex-direction: column; text-decoration: none; color: inherit;" },
                      (f?.full) ? [
                        $h("span", { "style": `display: grid; grid-template-columns: repeat(${$t(f?.cols)}, minmax(0, 1fr)); gap: 2px; height: 210px; overflow: hidden; background: var(--ground);` },
                          ($l(f?.mos)).map((m) => [
                            $h("span", { "style": "position: relative; overflow: hidden; display: block;" },
                              $h("img", { "class": "sw-cover", "src": m?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                            )
                          ])
                        )
                      ] : null,
                      (f?.empty) ? [
                        $h("span", { "style": "height: 210px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: var(--ground); color: var(--ink-faint); font-size: 13px;" },
                          (f?.hasIcons) ? [
                            $h("span", { "style": "display: flex; gap: 10px;" },
                              ($l(f?.icons)).map((a) => [
                                $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 56px; height: 56px; border-radius: 16px;" },
                                  (a?.logo) ? [
                                    $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                                  ] : null,
                                  (a?.nologo) ? [
                                    $h("svg", { "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                    )
                                  ] : null
                                )
                              ])
                            )
                          ] : null,
                          (f?.noIcons) ? [
                            $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            ),
                            $t(f?.hole)
                          ] : null
                        )
                      ] : null,
                      $h("span", { "style": "padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 12px;" },
                        $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                          $h("span", { "style": "min-width: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                            $t(f?.name)
                          ),
                          $h("span", { "style": "display: flex; flex-shrink: 0;" },
                            ($l(f?.logos)).map((a) => [
                              $h("span", { "style": "margin-left: -6px; border-radius: 9px; box-shadow: 0 0 0 2px var(--surface-raised); display: inline-flex;" },
                                $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 28px; height: 28px; border-radius: 9px;" },
                                  (a?.logo) ? [
                                    $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                                  ] : null,
                                  (a?.nologo) ? [
                                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                                    )
                                  ] : null
                                )
                              )
                            ])
                          )
                        ),
                        $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                          $t(f?.mix)
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                          $t(f?.count), " · ", $t(f?.when)
                        )
                      )
                    ),
                    $h("span", { "style": "position: absolute; top: 12px; right: 12px; display: flex; gap: 6px;" },
                      $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "style": "width: 36px; height: 36px; background: rgba(5,7,12,0.55); color: #FFFFFF; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);", "onClick": f?.askEdit, "aria-label": `Renommer ${$t(f?.name)}`, "title": "Renommer" },
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 20h4L19 9l-4-4L4 16zM14 6l4 4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "style": "width: 36px; height: 36px; background: rgba(5,7,12,0.55); color: #FFFFFF; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);", "onClick": f?.askDel, "aria-label": `Supprimer ${$t(f?.name)}`, "title": "Supprimer" },
                        $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                ] : null
              ]),
              $h("button", { "type": "button", "onClick": $v.startNew, "style": "min-height: 330px; border-radius: 26px; border: 1.5px dashed var(--line-strong); background: transparent; color: var(--ink-muted); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; font-family: var(--font-body); font-size: 15px; font-weight: 600; cursor: pointer;" },
                $h("span", { "style": "width: 52px; height: 52px; border-radius: 16px; background: var(--track); display: inline-flex; align-items: center; justify-content: center; color: var(--accent);" },
                  $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                "Nouveau dossier",
                $h("span", { "style": "font-size: 13px; font-weight: 400; color: var(--ink-faint);" },
                  "Une idée d’app, une niche, un marché"
                )
              )
            )
          ] : null,
          ($v.hasRecent) ? [
            $h("div", { "style": "padding: 36px 32px 14px; display: flex; justify-content: space-between; align-items: baseline;" },
              $h("h2", { "class": "sw-card-title", "style": "display: flex; align-items: center; gap: 9px; font-size: 20px;" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Ajouté récemment"
              ),
              $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                "Dans tous tes dossiers"
              )
            ),
            $h("div", { "style": "padding: 0 32px 48px; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px;" },
              ($l($v.recent)).map((r) => [
                $h("a", { "href": r?.href, "style": "display: flex; flex-direction: column; gap: 8px; min-width: 0; text-decoration: none; color: inherit;" },
                  $h("span", { "class": "sw-video", "style": "display: block; border-radius: 16px;" },
                    (r?.full) ? [
                      $h("img", { "class": "sw-cover", "src": r?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    (r?.isApp) ? [
                      $h("span", { "style": "position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;" },
                        $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 64px; height: 64px; border-radius: 18px;" },
                          (r?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": r?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (r?.nologo) ? [
                            $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        )
                      )
                    ] : null,
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-badge", "style": "position: absolute; top: 8px; left: 8px; height: 22px; font-size: 11px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                      $t(r?.kind)
                    )
                  ),
                  $h("span", { "style": "font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(r?.t)
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(r?.folder)
                  )
                )
              ])
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
