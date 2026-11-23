// Généré par scripts/dc2preact.py depuis design/app/Palette.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';

export default class Palette extends DCLogic {
  componentDidMount() {
    if (this.inp) this.inp.focus({ preventScroll: true });
    // Les créateurs de l'index (plus de 4 000) se mettent en forme juste après l'ouverture, dans un temps mort : la
    // fenêtre s'ouvre sans les attendre, et ils sont prêts avant la première lettre.
    const ix = this.constructor._ix;
    if (ix && ix.fill && typeof window !== 'undefined') (window.requestIdleCallback || ((f) => setTimeout(f, 1)))(() => ix.fill(), { timeout: 400 });
  }
  componentDidUpdate() {
    // La ligne choisie au clavier reste visible dans la liste.
    if (this.list && this.lastSel !== (this.state || {}).sel) {
      this.lastSel = (this.state || {}).sel;
      const el = this.list.querySelector('[data-sel="true"]');
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }
  }
  renderVals() {
    let AP = (globalThis.__dcSample?.["Palette"]?.["AP"] ?? []);
    let FM = (globalThis.__dcSample?.["Palette"]?.["FM"] ?? []);
    let CR = (globalThis.__dcSample?.["Palette"]?.["CR"] ?? []);
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    // Recherche instantanée (maquette 7A du 20/11) : l'index (apps, formats, plus de 4 000 créateurs) n'est mis en forme
    // qu'une fois, gardé d'une ouverture à l'autre (propriété du constructeur, comme MPalette), et refait seulement si un
    // document change ; chaque clé de recherche est normalisée une fois. Une lettre tapée ne fait que filtrer, puis
    // mettre en forme la dizaine de lignes affichées.
    // Sur le site : l'index de recherche du Radar (document « search », lu par this.props.get), complété, quand ils sont
    // là, par « apps » (comptes, vidéos par semaine, variation de la semaine, vignettes) et « formats » (multiplicateur).
    // Un champ que ces documents ne donnent pas n'est pas affiché. Sur le canevas : l'exemple ci-dessus.
    const get = this.props && this.props.get;
    const S = get && get('search');
    const real = !!(S && S.apps);
    const st = this.state || {};
    const q = st.q || '';
    const scope = st.scope || 'tout';
    const nq = norm(q.trim());
    const needCr = !!nq || scope === 'createurs';
    let ixNow = null; // l'index en cours (site seulement)
    if (real) {
      const AD = get('apps'), FD = get('formats');
      // Les créateurs de l'index, par documents de 4 000 : « search », puis « search:creators:2 », « :3 »… (16/11).
      const SC = S.creatorPages > 1 ? Array.from({ length: S.creatorPages - 1 }, (_, j) => get('search:creators:' + (j + 2))) : [];
      const docs = [S, AD, FD].concat(SC);
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
      const crOf = (c) => ({ k: 'cr', av: c.avatar || '', h: '@' + c.handle, handle: c.handle,
        sub: [c.app ? 'pousse ' + c.app : '', c.median ? nf(c.median) + ' vues médianes' : ''].filter(Boolean).join(' · '),
        id: c.handle, href: '/app/createurs/' + c.handle, key: '@' + c.handle + ' ' + (c.app || ''), _n: norm('@' + c.handle + ' ' + (c.app || '')) });
      const allCr = () => (S.creators || []).concat(...SC.map((d) => (d && d.creators) || [])).map(crOf);
      let ix = this.constructor._ix;
      if (ix && ix.docs.length === docs.length && ix.docs.every((d, i) => d === docs[i])) {
        if (ix.fill && needCr) ix.fill();
        AP = ix.AP; FM = ix.FM; CR = ix.CR;
      } else {
        const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
        const byApp = {}, byFmt = {};
        ((AD && AD.apps) || []).forEach((a) => { byApp[a.slug] = a; });
        ((FD && FD.formats) || []).forEach((f) => { byFmt[f.id] = f; });
        const KIND = { hook: 'Accroche', sound: 'Son' };
        const ICO = { hook: 'M5 6h14M12 6v13M9 19h6', sound: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
        AP = (S.apps || []).map((a) => {
          const full = byApp[a.slug];
          // La grande carte (comptes, vidéos par semaine, variation, vignettes) se met en forme à l'affichage, pour une app.
          return { k: 'app', n: a.name, niche: a.niche || '', logo: a.icon || '', nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank', full: full || null,
            v30: nf(a.views30 || 0), sub: (a.niche ? a.niche + ' · ' : '') + nf(a.views30 || 0) + ' vues en 30 j',
            id: a.slug, href: '/app/apps/' + a.slug, key: a.name + ' ' + (a.niche || '') };
        });
        FM = (S.formats || []).map((f) => {
          const full = byFmt[f.id];
          const kind = KIND[f.kind] || 'Format';
          const names = full && full.apps ? full.apps.filter(Boolean).map((a) => a.name) : [];
          return { k: 'fm', t: f.kind === 'sound' ? f.label : '« ' + f.label + ' »', ico: ICO[f.kind] || ICO.hook,
            sub: kind + ' · ' + f.accounts + ' comptes' + (full && full.medX ? ' · ' + xf(full.medX) + ' la normale' : ''),
            id: f.id, href: '/app/formats/' + f.id, key: f.label + ' ' + names.join(' ') + ' ' + ((full && full.niche) || '') };
        });
        [AP, FM].forEach((L) => L.forEach((x) => { x._n = norm(x.key); }));
        // Sans recherche, seuls les 3 premiers créateurs s'affichent : le reste attend un temps mort (componentDidMount),
        // ou la première lettre tapée.
        ix = { docs, AP, FM, CR: (S.creators || []).slice(0, 3).map(crOf) };
        ix.fill = () => { if (ix.fill) { ix.fill = null; ix.CR = allCr(); } };
        if (needCr) ix.fill();
        this.constructor._ix = ix;
        CR = ix.CR;
      }
      ixNow = this.constructor._ix;
    } else {
      // Le canevas : l'exemple, mis à la forme des données du site.
      AP = AP.map((a) => Object.assign({}, a, { sub: a.niche + ' · ' + a.v30 + ' vues en 30 j' }));
      FM = FM.map((f) => Object.assign({}, f, { sub: f.kind + ' · ' + f.n + ' comptes · ' + f.med + ' la normale' }));
      CR = CR.map((c) => Object.assign({}, c, { sub: c.s }));
    }
    const hit = (x) => !nq || (x._n !== undefined ? x._n : norm(x.key)).indexOf(nq) >= 0;
    const want = (k) => scope === 'tout' || scope === k;
    let apps = want('apps') ? AP.filter(hit) : [];
    let crs = want('createurs') ? CR.filter(hit) : [];
    let fms = want('formats') ? FM.filter(hit) : [];
    // Ouverts récemment (maquette 9B, 24/11) : sans recherche, les deux dernières fiches ouvertes d'ici (préférence
    // `recent`, src/app/recent.js), avec leurs chiffres du jour pris dans l'index ; une fiche sortie de l'index n'est plus montrée.
    const RS = real && !nq ? get('saved:recent') : null;
    let rec = [];
    if (Array.isArray(RS) && RS.length && ixNow) {
      if (RS.some((r) => r.kind === 'creator') && ixNow.fill) { ixNow.fill(); CR = ixNow.CR; }
      const L = { app: [AP, 'apps'], creator: [CR, 'createurs'], format: [FM, 'formats'] };
      rec = RS.map((r) => L[r.kind] && want(L[r.kind][1]) ? L[r.kind][0].find((x) => x.id === r.id) : null).filter(Boolean);
    }
    const total = apps.length + crs.length + fms.length;
    // Une recherche : la première app trouvée en grande carte, puis les autres groupes. Sans recherche : les plus vues.
    const big = nq && apps.length ? apps[0] : null;
    apps = nq ? apps.slice(1, 5) : apps.slice(0, 5);
    crs = crs.slice(0, nq ? 5 : 3);
    fms = fms.slice(0, nq ? 4 : 3);
    // La partie trouvée, surlignée (sur le texte d'origine : les accents ne comptent pas dans la recherche).
    const cut = (text) => {
      const t = String(text || '');
      if (!nq) return [{ t, c: '' }];
      let n = '';
      const at = [];
      for (let i = 0; i < t.length; i++) { const k = norm(t[i]); for (let j = 0; j < k.length; j++) at.push(i); n += k; }
      const p = n.indexOf(nq);
      if (p < 0) return [{ t, c: '' }];
      const a = at[p], b = (at[p + nq.length - 1] || a) + 1;
      return [{ t: t.slice(0, a), c: '' }, { t: t.slice(a, b), c: 'pal-hl' }, { t: t.slice(b), c: '' }].filter((s) => s.t);
    };
    const flat = [].concat(big ? [big] : [], rec, apps, crs, fms);
    const sel = Math.min(st.sel || 0, Math.max(0, flat.length - 1));
    let at = 0;
    const row = (x) => {
      const i = at++;
      const on = i === sel;
      const kind = { app: 'app', cr: 'creator', fm: 'format' }[x.k];
      return { sel: on ? 'true' : 'false', bg: on ? 'var(--accent-soft)' : 'transparent', edge: on ? 'var(--accent-edge)' : 'var(--card-edge)', href: x.href,
        open: () => { if (x.id && kind && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kopycat:opened', { detail: { kind, id: x.id } })); },
        hover: () => { if ((this.state || {}).sel !== i) this.setState({ sel: i }); },
        isApp: x.k === 'app', isCr: x.k === 'cr', isFm: x.k === 'fm', logo: x.logo, nologo: x.nologo, blank: x.blank, av: x.av || '', ini: x.h ? (Array.from(x.h.slice(1))[0] || '').toUpperCase() : '', ico: x.ico,
        nm: cut(x.k === 'cr' ? x.h : x.k === 'fm' ? x.t : x.n), sub: cut(x.sub) };
    };
    let B = {};
    if (big) {
      const full = big.full;
      const covs = full && full.top ? full.top.filter((t) => t.cover).slice(0, 3).map((t) => ({ src: t.cover })) : (big.covs || []).map((c) => ({ src: c.src }));
      // La variation de la semaine, comme Apps : la dernière semaine face à la précédente.
      const w = full && full.weeks;
      const d = w && w.length >= 2 && w[w.length - 2] > 0 ? (w[w.length - 1] - w[w.length - 2]) / w[w.length - 2] : null;
      const fr = (n) => n.toLocaleString('fr-FR');
      const net = full ? [typeof full.accounts === 'number' ? fr(full.accounts) + ' comptes' : '', typeof full.videosPerWeek === 'number' ? fr(full.videosPerWeek) + ' vidéos / sem.' : ''] : [big.acc ? big.acc + ' comptes' : ''];
      B = Object.assign(row(big), { sub: [big.niche].concat(net).filter(Boolean).join(' · '), v30: big.v30,
        delta: d === null ? '' : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + '\u202f%', dInk: d !== null && d >= 0 ? '#5CD394' : '#FF9A9A', hasCov: covs.length > 0, covs });
    }
    const groups = [
      [rec, 'Ouverts récemment', true],
      [apps, nq ? 'Autres apps' : 'Les plus vues en 30 jours'],
      [crs, nq ? 'Créateurs' : (real ? 'Les plus vus' : 'Créateurs à suivre')],
      [fms, nq ? 'Formats' : (real ? 'Les plus repris' : 'Formats de la semaine')],
    ].filter((g) => g[0].length).map((g) => ({ l: g[1], ic: !!g[2], rows: g[0].map(row) }));
    const close = () => { if (this.props.onClose) this.props.onClose(); };
    const scopes = [['tout', 'Tout'], ['apps', 'Apps'], ['formats', 'Formats'], ['createurs', 'Créateurs']]
      .map((s) => ({ l: s[1], on: s[0] === scope ? 'true' : 'false', pick: () => this.setState({ scope: s[0], sel: 0 }) }));
    return {
      q, scopes, close, big: B, pa: !!big, groups,
      onQ: (e) => this.setState({ q: e.target.value, sel: 0 }),
      setInput: (el) => { this.inp = el; },
      setList: (el) => { this.list = el; },
      keys: (e) => {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); this.setState({ sel: Math.min(sel + 1, flat.length - 1) }); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); this.setState({ sel: Math.max(sel - 1, 0) }); }
        else if (e.key === 'Enter' && e.target === this.inp && this.list) {
          const go = this.list.querySelector('[data-sel="true"]');
          if (go) { e.preventDefault(); go.click(); }
        }
      },
      none: flat.length === 0, count: nq ? total + (total > 1 ? ' résultats' : ' résultat') : ''
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: absolute; inset: 0; color: var(--ink); font-family: var(--font-body);" },
        $h("button", { "type": "button", "aria-label": "Fermer la recherche", "onClick": $v.close, "style": "position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);" }),
        $h("div", { "style": "position: absolute; inset: 0; display: flex; justify-content: center; align-items: flex-start; padding: 80px 24px 24px; box-sizing: border-box; pointer-events: none;" },
          $h("section", { "role": "dialog", "aria-modal": "true", "aria-label": "Recherche", "onKeyDown": $v.keys, "style": "pointer-events: auto; width: 100%; max-width: 760px; border-radius: 26px; background: var(--surface-raised); border: 1px solid var(--line-strong); box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 0 6px rgba(76,154,255,0.05); overflow: hidden; animation: sw-rise 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
            $h("div", { "style": "padding: 16px 16px 0;" },
              $h("div", { "style": "display: flex; align-items: center; gap: 12px; height: 52px; padding: 0 16px; border-radius: 14px; background: rgba(255,255,255,0.03); box-shadow: inset 0 0 0 1.5px var(--accent), 0 0 0 4px rgba(76,154,255,0.12);" },
                $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent); flex-shrink: 0;" },
                  $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $h("input", { "ref": $v.setInput, "type": "search", "value": $v.q, "onInput": $v.onQ, "aria-label": "Chercher une app, un format ou un créateur", "placeholder": "Cherche une app, un format, un créateur…", "autocomplete": "off", "spellcheck": "false", "style": "flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent; color: var(--ink); font-family: var(--font-body); font-size: 18px; font-weight: 500;" }),
                $h("span", { "aria-live": "polite", "style": "flex-shrink: 0; font-size: 12px; color: var(--ink-faint); font-variant-numeric: tabular-nums; white-space: nowrap;" },
                  $t($v.count)
                )
              ),
              $h("div", { "role": "tablist", "aria-label": "Chercher dans", "style": "display: flex; gap: 6px; padding: 12px 0 4px;" },
                ($l($v.scopes)).map((s) => [
                  $h("button", { "class": "sw-pill", "type": "button", "role": "tab", "aria-pressed": s?.on, "aria-selected": s?.on, "onClick": s?.pick, "style": "height: 28px; padding: 0 12px; font-size: 13px;" },
                    $t(s?.l)
                  )
                ])
              )
            ),
            $h("div", { "ref": $v.setList, "style": "max-height: min(560px, calc(100vh - 230px)); overflow-y: auto; overscroll-behavior: contain; padding: 8px 0 14px;" },
              ($v.none) ? [
                $h("div", { "class": "sw-empty", "style": "padding: 40px 24px;" },
                  $h("div", { "class": "sw-empty-radar" }),
                  $h("p", { "class": "sw-empty-title" },
                    "Rien pour « ", $t($v.q), " »"
                  ),
                  $h("p", { "class": "sw-empty-text" },
                    "Essaie un nom d’app, un @compte ou un mot de l’accroche."
                  )
                )
              ] : null,
              ($v.pa) ? [
                $h("a", { "class": "pal-row", "data-sel": $v.big?.sel, "href": $u($v.big?.href), "onClick": $v.big?.open, "onMouseEnter": $v.big?.hover, "style": `display: flex; align-items: center; gap: 16px; margin: 0 16px 6px; padding: 16px; border-radius: 18px; text-decoration: none; color: inherit; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px ${$t($v.big?.edge)};` },
                  $h("span", { "class": `sw-app-icon ${$t($v.big?.blank)}`, "style": "width: 56px; height: 56px; border-radius: 15px; align-self: flex-start;" },
                    ($v.big?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": $u($v.big?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    ($v.big?.nologo) ? [
                      $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                    $h("span", { "class": "pal-ell", "style": "font-family: var(--font-display); font-size: 22px; line-height: 1.15; font-weight: 700; letter-spacing: -0.025em;" },
                      ($l($v.big?.nm)).map((s) => [
                        $h("span", { "class": s?.c },
                          $t(s?.t)
                        )
                      ])
                    ),
                    $h("span", { "class": "pal-ell", "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t($v.big?.sub)
                    ),
                    $h("span", { "style": "display: flex; align-items: flex-end; gap: 22px; margin-top: 8px;" },
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 22px; line-height: 1; font-weight: 700; letter-spacing: -0.03em; font-variant-numeric: tabular-nums;" },
                          $t($v.big?.v30)
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                          "vues sur 30 jours"
                        )
                      ),
                      ($v.big?.delta) ? [
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                          $h("span", { "style": `font-family: var(--font-display); font-size: 22px; line-height: 1; font-weight: 700; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; color: ${$t($v.big?.dInk)};` },
                            $t($v.big?.delta)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                            "cette semaine"
                          )
                        )
                      ] : null
                    )
                  ),
                  ($v.big?.hasCov) ? [
                    $h("span", { "style": "display: flex; gap: 6px; flex-shrink: 0;" },
                      ($l($v.big?.covs)).map((v) => [
                        $h("span", { "style": "position: relative; display: block; width: 64px; height: 86px; border-radius: 10px; overflow: hidden; background: var(--track); box-shadow: inset 0 0 0 1px var(--line);" },
                          $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy", "decoding": "async" })
                        )
                      ])
                    )
                  ] : null
                )
              ] : null,
              ($l($v.groups)).map((g) => [
                $h("div", { "style": "padding: 10px 16px 0;" },
                  $h("span", { "style": "display: flex; align-items: center; gap: 7px; padding: 4px 4px 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint);" },
                    (g?.ic) ? [
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                        $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null,
                    $t(g?.l)
                  ),
                  ($l(g?.rows)).map((r) => [
                    $h("a", { "class": "pal-row", "data-sel": r?.sel, "href": $u(r?.href), "onClick": r?.open, "onMouseEnter": r?.hover, "style": `display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 8px 12px 8px 4px; margin: 0 -4px 0 0; border-radius: 12px; text-decoration: none; color: inherit; background: ${$t(r?.bg)};` },
                      (r?.isApp) ? [
                        $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 32px; height: 32px; border-radius: 9px;" },
                          (r?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": $u(r?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (r?.nologo) ? [
                            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        )
                      ] : null,
                      (r?.isCr) ? [
                        $h("span", { "aria-hidden": "true", "style": "position: relative; width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #23704F, #154733); color: #FFFFFF; font-size: 13px; font-weight: 700; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12);" },
                          $t(r?.ini),
                          (r?.av) ? [
                            $h("img", { "src": $u(r?.av), "alt": "", "style": "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                          ] : null
                        )
                      ] : null,
                      (r?.isFm) ? [
                        $h("span", { "style": "width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--ink-soft);" },
                          $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": r?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      ] : null,
                      $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;" },
                        $h("span", { "class": "pal-ell", "style": "font-size: 14px; font-weight: 600;" },
                          ($l(r?.nm)).map((s) => [
                            $h("span", { "class": s?.c },
                              $t(s?.t)
                            )
                          ])
                        ),
                        $h("span", { "class": "pal-ell", "style": "font-size: 12px; color: var(--ink-faint);" },
                          ($l(r?.sub)).map((s) => [
                            $h("span", { "class": s?.c },
                              $t(s?.t)
                            )
                          ])
                        )
                      ),
                      $h("span", { "class": "pal-go", "style": "flex-shrink: 0; font-size: 12px; color: var(--ink-muted);" },
                        "Voir"
                      )
                    )
                  ])
                )
              ])
            )
          )
        )
      )
    ];
  }
}
