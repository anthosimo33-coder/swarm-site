// Généré par scripts/dc2preact.py depuis design/app/MDossiers.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MDossiers extends DCLogic {

  renderVals() {
    const b = this.baseVals();
    return Object.assign({}, b, this.shellVals(), this.extraVals(b));
  }
  shellVals() {
    const st = this.state || {};
    const u = this.props.user;
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: (Array.from(String(u.initiale || u.prenom || u.email || '?'))[0] || '?').toUpperCase() }
                 : { prenom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A' };
    return {
      me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save, ajItem: null, pal: !!st.pal, openPal: () => this.setState({ pal: true }), closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, openAj: () => this.setState({ aj: true }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    const live = typeof P.saved === 'function' && typeof P.save === 'function';
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    const DAY = 86400000;
    const dayTxt = (ms) => { if (!ms) return ''; const d = new Date(ms), z = new Date();
      const n = Math.round((new Date(z.getFullYear(), z.getMonth(), z.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / DAY);
      return n <= 0 ? 'aujourd’hui' : n === 1 ? 'hier' : 'le ' + d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }); };
    const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');
    const KL = { app: 'App', format: 'Format', creator: 'Créateur', video: 'Vidéo' };
    const hrefOf = (x) => (x.kind === 'app' ? '/app/apps/' + x.id : x.kind === 'format' ? '/app/formats/' + x.id : x.kind === 'creator' ? '/app/createurs/' + x.id : '/app/videos/' + x.id);
    const newName = st.newName || '';
    // « Créer un dossier » de l'accueil : /app/dossiers?nouveau=1 ouvre la création, comme sur ordinateur (DossiersA).
    const creating = st.creating === undefined ? !!(P.query && P.query.nouveau) : !!st.creating;
    const raw = live ? P.saved('folders') : null;
    const loading = live && raw === undefined;
    let folders, recent, create;
    if (live) {
      // Les vrais dossiers (saved('folders')) ; jamais les dossiers d'exemple sur le site.
      const all = Array.isArray(raw) ? raw : [];
      const last = (f) => Math.max(f.createdAt || 0, ...(f.items || []).map((x) => x.at || 0));
      folders = all.map((f) => { const its = f.items || []; const cnt = {};
        its.forEach((x) => { cnt[x.kind] = (cnt[x.kind] || 0) + 1; });
        const mix = [['app', 'app', 'apps'], ['format', 'format', 'formats'], ['creator', 'créateur', 'créateurs'], ['video', 'vidéo', 'vidéos']].filter((k) => cnt[k[0]])
          .map((k) => cnt[k[0]] + ' ' + (cnt[k[0]] > 1 ? k[2] : k[1])).join(' · ');
        return { ck: 'd:' + f.id, name: f.name, href: '/app/dossiers/' + f.id, full: its.length > 0, empty: its.length === 0, mos: its.slice(0, 4).map((x) => ({ src: x.cover || '' })),
          logos: its.filter((x) => x.kind === 'app' && x.cover).slice(0, 3).map((x) => ({ logo: x.cover, nologo: false, blank: '' })),
          mix: mix || 'Aucun élément', count: plural(its.length, 'élément'), when: 'modifié ' + dayTxt(last(f)), at: last(f) }; });
      folders = st.sort === 'az' ? folders.sort((x, y) => x.name.localeCompare(y.name, 'fr')) : folders.sort((x, y) => y.at - x.at);
      recent = [].concat(...all.map((f) => (f.items || []).map((x) => ({ x, folder: f.name })))).sort((p, q) => (q.x.at || 0) - (p.x.at || 0)).slice(0, 8)
        .map((o) => ({ kind: KL[o.x.kind] || '', t: o.x.label || o.x.id, src: o.x.cover || '', href: hrefOf(o.x), folder: o.folder }));
      create = () => { const n = newName.trim(); const cur = P.saved('folders'); if (!n || cur === undefined) return; const now = Date.now();
        P.save('folders', [{ id: now.toString(36) + Math.random().toString(36).slice(2, 6), name: n, createdAt: now, items: [] }].concat(Array.isArray(cur) ? cur : []));
        this.setState({ creating: false, newName: '' }); };
    } else {
      const made = st.made || [];
      folders = made.map((name) => ({ ck: 'n:' + name, name, mos: [], logos: [], mix: 'Aucun élément', count: '0 élément', when: 'créé à l’instant', full: false, empty: true }))
        .concat((b.folders || []).map((f) => Object.assign({}, f, { full: true, empty: false })));
      if (st.sort === 'az') folders = folders.slice().sort((x, y) => x.name.localeCompare(y.name, 'fr'));
      folders = folders.map((f, i) => Object.assign({ ck: 'x:' + i, href: '/app/dossiers' }, f));
      recent = (b.recent || []).map((r) => Object.assign({}, r, { href: r.kind === 'Vidéo' ? '/app/videos/' + vkey(r.src) : '/app/formats' }));
      create = () => { const n = newName.trim(); if (!n) return; this.setState({ made: [n].concat(made), creating: false, newName: '' }); };
    }
    // Aucun dossier (maquette V3 du 20/11) : le geste montré sur l'app la plus vue sur 30 jours (document « apps »), et
    // « Garder <app> » (ou son signet) qui crée en un clic le dossier « Mes idées » avec elle, à la forme qu'écrit MAjout
    // (saved('folders'), docs/donnees-app.md). Sans liste d'apps lisible : « Créer un dossier ». Même règle que DossiersA.
    const none = live && !loading && folders.length === 0 && !creating;
    const A = none && typeof P.get === 'function' ? P.get('apps') : null;
    const top = A && Array.isArray(A.apps) ? A.apps.filter((a) => a && a.slug && a.name).reduce((m, a) => (!m || (a.views30 || 0) > (m.views30 || 0) ? a : m), null) : null;
    const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
    const keepTop = () => {
      const cur = live ? P.saved('folders') : undefined;
      if (!top || cur === undefined || (Array.isArray(cur) && cur.length)) return; // un double toucher ne crée pas deux « Mes idées »
      const now = Date.now();
      P.save('folders', [{ id: now.toString(36) + Math.random().toString(36).slice(2, 6), name: 'Mes idées', createdAt: now,
        items: [{ kind: 'app', id: top.slug, label: top.name, cover: top.icon || null, at: now }] }].concat(Array.isArray(cur) ? cur : []));
    };
    const vd = { app: !!top, wait: none && A === undefined, noApp: none && !top && A !== undefined, slotOn: !!top, slot: 'se crée d’un clic sur Garder',
      name: top ? top.name : '', sub: top ? nf(top.views30 || 0) + ' vues sur 30 jours' : '', href: top ? '/app/apps/' + top.slug : '',
      logo: (top && top.icon) || '', nologo: !(top && top.icon), blank: top && top.icon ? '' : 'sw-app-blank',
      cta: top ? 'Garder ' + top.name : '', label: top ? 'Garder ' + top.name + ' dans « Mes idées »' : '', keep: keepTop };
    return { folders, recent, hasRecent: recent.length > 0, noFolders: none, hasSorts: !live || folders.length > 0, btnMain: !none, vd, creating, newName, createNew: create,
      startNew: () => this.setState({ creating: true }), cancelNew: () => this.setState({ creating: false, newName: '' }), onNew: (e) => this.setState({ newName: e.target.value }),
      newKeys: (e) => { if (e.key === 'Enter') { e.preventDefault(); create(); } else if (e.key === 'Escape') { e.preventDefault(); this.setState({ creating: false, newName: '' }); } },
      setNew: (el) => { if (el && el !== this.newEl) { this.newEl = el; el.focus(); } },
      sorts: [['recent', 'Récents'], ['az', 'De A à Z']].map((s) => ({ l: s[1], on: (st.sort || 'recent') === s[0] ? 'true' : 'false', pick: () => this.setState({ sort: s[0] }) })) };
  }

  baseVals() {
    const folders = (globalThis.__dcSample?.["MDossiers"]?.["folders"] ?? []);
    const recent = (globalThis.__dcSample?.["MDossiers"]?.["recent"] ?? []);
    return { folders, recent };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Dossiers"
            )
          ),
          $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.openPal, "aria-label": "Chercher", "style": "flex-shrink: 0; width: 44px; height: 44px;" },
            $h("svg", { "width": "21", "height": "21", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          ),
          $h("a", { "class": "sw-btn sw-btn-icon", "href": "/app/alertes", "aria-label": "Alertes", "style": "flex-shrink: 0; position: relative; width: 44px; height: 44px;" },
            $h("svg", { "width": "21", "height": "21", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          ),
          $h("a", { "href": "/app/compte", "aria-label": "Mon compte", "style": "width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; margin-right: -4px;" },
            $h("span", { "class": "sw-avatar", "style": "width: 36px; height: 36px; font-size: 14px;" },
              $t($v.me?.initiale)
            )
          )
        ),
        $h("div", { "style": "padding: 18px 20px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
          $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
            "Apps, formats, créateurs et vidéos mis de côté."
          )
        ),
        $h("div", { "style": "padding: 14px 20px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;" },
          ($v.hasSorts) ? [
            $h("div", { "class": "m-tc is-scroll", "role": "tablist", "aria-label": "Tri" },
              ($l($v.sorts)).map((s) => [
                $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": s?.on, "onClick": s?.pick, "style": "height: 44px;" },
                  $h("span", { "class": "m-ic", "data-i": s?.l, "aria-hidden": "true" }),
                  $t(s?.l)
                )
              ])
            )
          ] : null,
          ($v.btnMain) ? [
            $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.startNew },
              "Nouveau dossier",
              $h("span", { "class": "sw-btn-tile" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ] : null,
          ($v.noFolders) ? [
            $h("button", { "class": "sw-btn sw-btn-sm", "type": "button", "onClick": $v.startNew, "style": "height: 42px; gap: 10px; padding: 0 16px; border-radius: 12px; background: var(--track); box-shadow: inset 0 0 0 1px var(--glass-edge); color: var(--ink);" },
              "Nouveau dossier",
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          ] : null
        ),
        $h("div", { "style": "padding: 16px 20px 0; display: flex; flex-direction: column; gap: 12px;" },
          ($v.creating) ? [
            $h("div", { "class": "sw-card is-featured", "style": "border-radius: 22px; padding: 18px; display: flex; flex-direction: column; gap: 12px;" },
              $h("label", { "class": "sw-label", "for": "m-nd" },
                "Nom du dossier"
              ),
              $h("input", { "ref": $v.setNew, "class": "sw-input", "id": "m-nd", "type": "text", "value": $v.newName, "onInput": $v.onNew, "onKeyDown": $v.newKeys, "placeholder": "Une idée d’app, une niche…", "autocomplete": "off", "style": "font-size: 16px;" }),
              $h("div", { "style": "display: flex; justify-content: flex-end; align-items: center; gap: 14px;" },
                $h("button", { "type": "button", "onClick": $v.cancelNew, "style": "min-height: 44px; border: 0; background: transparent; color: var(--ink-muted); font-family: inherit; font-size: 15px; cursor: pointer;" },
                  "Annuler"
                ),
                $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.createNew },
                  "Créer",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          ] : null,
          ($v.noFolders) ? [
            $h("section", { "data-lq-card": "vide", "aria-labelledby": "md-v-t", "style": "padding: 20px; border-radius: 22px; display: flex; flex-direction: column; gap: 14px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6FB0FF;" },
                $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Aucun dossier"
              ),
              $h("h2", { "id": "md-v-t", "style": "margin: 0; font-size: 19px; line-height: 1.3; font-weight: 600; letter-spacing: -0.01em; color: var(--ink);" },
                "Le signet de chaque fiche range ici"
              ),
              ($v.vd?.app) ? [
                $h("div", { "style": "margin-top: 4px; display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 18px; background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);" },
                  $h("a", { "href": $u($v.vd?.href), "style": "flex: 1 1 auto; min-width: 0; display: flex; align-items: center; gap: 12px; color: inherit; text-decoration: none; -webkit-tap-highlight-color: transparent;" },
                    $h("span", { "class": `sw-app-icon ${$t($v.vd?.blank)}`, "style": "width: 42px; height: 42px; border-radius: 12px;" },
                      ($v.vd?.logo) ? [
                        $h("img", { "class": "sw-logo-img", "src": $u($v.vd?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      ($v.vd?.nologo) ? [
                        $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                      $h("span", { "class": "sw-app-name", "style": "font-size: 15px;" },
                        $t($v.vd?.name)
                      ),
                      $h("span", { "class": "sw-app-sub" },
                        $t($v.vd?.sub)
                      )
                    )
                  ),
                  $h("button", { "type": "button", "onClick": $v.vd?.keep, "aria-label": $v.vd?.label, "style": "flex-shrink: 0; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 13px; display: flex; align-items: center; justify-content: center; background: rgba(76,154,255,0.18); color: #FFFFFF; box-shadow: 0 0 0 6px rgba(76,154,255,0.12), 0 0 30px rgba(76,154,255,0.45); cursor: pointer; -webkit-tap-highlight-color: transparent;" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                    )
                  )
                ),
                $h("span", { "aria-hidden": "true", "style": "align-self: center; display: flex; margin: -4px 0; color: var(--ink-faint);" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M7 7l10 10M17 9v8H9", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ] : null,
              ($v.vd?.wait) ? [
                $h("div", { "style": "height: 106px;" })
              ] : null,
              ($v.vd?.slotOn) ? [
                $h("div", { "style": "display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 18px; border: 1.5px dashed rgba(76,154,255,0.4); background: rgba(76,154,255,0.05);" },
                  $h("span", { "style": "flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(76,154,255,0.14); color: #4C9AFF;" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                    $h("span", { "class": "sw-app-name", "style": "font-size: 15px;" },
                      "Mes idées"
                    ),
                    $h("span", { "class": "sw-app-sub" },
                      $t($v.vd?.slot)
                    )
                  )
                )
              ] : null,
              ($v.vd?.app) ? [
                $h("div", { "style": "padding-top: 8px;" },
                  $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.vd?.keep, "style": "max-width: 100%; -webkit-tap-highlight-color: transparent;" },
                    $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis;" },
                      $t($v.vd?.cta)
                    ),
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              ] : null,
              ($v.vd?.noApp) ? [
                $h("div", { "style": "padding-top: 4px;" },
                  $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.startNew, "style": "-webkit-tap-highlight-color: transparent;" },
                    "Créer un dossier",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              ] : null
            )
          ] : null,
          ($l($v.folders)).map((f) => [
            $h("a", { "href": $u(f?.href), "data-lq-card": f?.ck, "class": "sw-card", "style": "border-radius: 22px; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; color: inherit;" },
              (f?.full) ? [
                $h("span", { "style": "display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; height: 116px; overflow: hidden;" },
                  ($l(f?.mos)).map((m) => [
                    $h("span", { "class": "m-ph", "style": "position: relative; background: linear-gradient(150deg, #28405E, #0A0C12 58%, #28405E 130%); position: relative; overflow: hidden; display: block;" },
                      $h("img", { "class": "sw-cover", "src": $u(m?.src), "alt": "", "loading": "lazy", "decoding": "async" })
                    )
                  ])
                )
              ] : null,
              (f?.empty) ? [
                $h("span", { "style": "height: 116px; display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--ground); color: var(--ink-faint); font-size: 14px;" },
                  $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Vide pour l’instant"
                )
              ] : null,
              $h("span", { "style": "padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 6px;" },
                $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 10px;" },
                  $h("span", { "style": "font-size: 17px; font-weight: 700; letter-spacing: -0.01em;" },
                    $t(f?.name)
                  ),
                  $h("span", { "style": "display: flex;" },
                    ($l(f?.logos)).map((a) => [
                      $h("span", { "style": "margin-left: -6px; border-radius: 8px; box-shadow: 0 0 0 2px var(--surface-raised); display: inline-flex;" },
                        $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 24px; height: 24px; border-radius: 8px;" },
                          (a?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": $u(a?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (a?.nologo) ? [
                            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
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
            )
          ])
        ),
        ($v.hasRecent) ? [
          $h("div", { "style": "padding-top: 26px; display: flex; flex-direction: column; gap: 12px;" },
            $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
              $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Ajouté récemment"
              )
            ),
            $h("div", { "style": "display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
              ($l($v.recent)).map((r) => [
                $h("a", { "href": $u(r?.href), "style": "flex-shrink: 0; width: 112px; display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: inherit;" },
                  $h("span", { "class": "sw-video", "style": "display: block; border-radius: 14px;" },
                    $h("img", { "class": "sw-cover", "src": $u(r?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-badge", "style": "position: absolute; top: 6px; left: 6px; height: 20px; padding: 0 7px; font-size: 10px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                      $h("span", { "class": "m-ic", "data-i": r?.kind, "aria-hidden": "true", "style": "width: 13px; height: 13px;" }),
                      $t(r?.kind)
                    )
                  ),
                  $h("span", { "style": "font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(r?.t)
                  ),
                  $h("span", { "style": "font-size: 11px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(r?.folder)
                  )
                )
              ])
            )
          )
        ] : null,
        $h("nav", { "data-tabbar": "", "aria-label": "Navigation principale", "style": "position: fixed; left: 12px; right: 12px; bottom: max(12px, env(safe-area-inset-bottom)); z-index: 30; height: 64px; padding: 0 6px; box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); align-items: center; border-radius: 32px; background: rgba(22,27,38,0.84); backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10), 0 20px 50px rgba(0,0,0,0.55);" },
          $h("a", { "href": "/app", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Accueil"
          ),
          $h("a", { "href": "/app/apps", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          $h("a", { "href": "/app/formats", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Formats"
          ),
          $h("a", { "href": "/app/createurs", "data-tab": "", "aria-current": "false", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 10.5px; font-weight: 600;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Créateurs"
          ),
          $h("a", { "href": "/app/dossiers", "data-tab": "", "aria-current": "page", "style": "height: 52px; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: #FFFFFF; font-size: 10.5px; font-weight: 700;" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Dossiers"
          )
        ),
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(MPalette, { "onClose": $v.closePal, "get": $v.getFn })
          )
        ] : null,
        ($v.aj) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 70;" },
            $h(MAjout, { "onClose": $v.closeAj, "item": $v.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
          )
        ] : null
      )
    ];
  }
}
