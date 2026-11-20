// Généré par scripts/dc2preact.py depuis design/app/Palette.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';

export default class Palette extends DCLogic {
  componentDidMount() { if (this.inp) this.inp.focus(); }
  renderVals() {
    let AP = (globalThis.__dcSample?.["Palette"]?.["AP"] ?? []);
    let FM = (globalThis.__dcSample?.["Palette"]?.["FM"] ?? []);
    let CR = (globalThis.__dcSample?.["Palette"]?.["CR"] ?? []);
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    FM = FM.map((f) => Object.assign({ sub: f.kind + ' · ' + f.n + ' comptes · ' + f.med + ' la normale', hasStats: true, hasCov: f.covs.length > 0 }, f));
    CR = CR.map((c) => Object.assign({ rytL: 'Rythme', hasCov: c.covs.length > 0 }, c));
    // Sur le site : l'index de recherche du Radar (document « search », lu par this.props.get), complété, quand ils
    // sont là, par les documents « apps » (marchés, vidéos les plus vues) et « formats » (multiplicateur, reprises,
    // vignettes). Un champ que ces documents ne donnent pas n'est pas affiché. Sur le canevas : l'exemple ci-dessus.
    const get = this.props && this.props.get;
    const S = get && get('search');
    // Les créateurs de l'index, par documents de 4 000 : « search », puis « search:creators:2 », « :3 »… (16/11 : Convex
    // refuse une liste de plus de 8 192 éléments).
    const SC = S && S.creatorPages > 1 ? Array.from({ length: S.creatorPages - 1 }, (_, j) => get('search:creators:' + (j + 2))) : [];
    const real = !!(S && S.apps);
    if (real) {
      const AD = get('apps'), FD = get('formats');
      const ix = this.ix;
      if (!ix || ix.S !== S || ix.AD !== AD || ix.FD !== FD || ix.SC.length !== SC.length || ix.SC.some((d, j) => d !== SC[j])) {
        const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n)));
        const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
        const has = (n) => n !== null && n !== undefined;
        const and = (ns) => (ns.length <= 3 ? ns.slice(0, -1).join(', ') + (ns.length > 1 ? ' et ' : '') + ns.slice(-1) : ns.slice(0, 2).join(', ') + ' et ' + (ns.length - 2) + ' autres apps');
        const byApp = AD && AD.apps ? Object.fromEntries(AD.apps.map((a) => [a.slug, a])) : {};
        const byFmt = FD && FD.formats ? Object.fromEntries(FD.formats.map((f) => [f.id, f])) : {};
        const KIND = { hook: 'Accroche', sound: 'Son' };
        const ICO = { hook: 'M5 6h14M12 6v13M9 19h6', sound: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' };
        const A2 = (S.apps || []).map((a) => {
          const full = byApp[a.slug];
          const covs = full && full.top ? full.top.filter((t) => t.cover).map((t) => ({ src: t.cover, v: nf(t.views) })) : [];
          return { k: 'app', n: a.name, niche: a.niche || '', logo: a.icon || '', nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank',
            mk: full && full.markets ? full.markets.map((m) => m[0]).filter((c) => c !== 'XX').slice(0, 3).map((c) => ({ c })) : [],
            v30: nf(a.views30 || 0), acc: full && typeof full.accounts === 'number' ? full.accounts.toLocaleString('fr-FR') : '—', hasCov: covs.length > 0, covs, href: '/app/apps/' + a.slug, key: a.name + ' ' + (a.niche || '') };
        });
        const F2 = (S.formats || []).map((f) => {
          const full = byFmt[f.id];
          const kind = KIND[f.kind] || 'Format';
          const names = full && full.apps ? full.apps.filter(Boolean).map((a) => a.name) : [];
          const covs = full && full.members ? full.members.filter((m) => m.cover).slice(0, 3).map((m) => ({ src: m.cover, v: nf(m.views) })) : [];
          return { k: 'fm', t: f.kind === 'sound' ? f.label : '« ' + f.label + ' »', kind, ico: ICO[f.kind] || ICO.hook, n: f.accounts,
            sub: kind + ' · ' + f.accounts + ' comptes' + (full && full.medX ? ' · ' + xf(full.medX) + ' la normale' : ''),
            hasStats: !!full, med: full && full.medX ? xf(full.medX) : '—', ok: full && full.n ? full.wins + ' sur ' + full.n : '—', max: full ? nf(full.maxViews || 0) : '',
            apps: and(names), hasCov: covs.length > 0, covs, href: '/app/formats/' + f.id, key: f.label + ' ' + names.join(' ') + ' ' + ((full && full.niche) || '') };
        });
        const C2 = (S.creators || []).concat(...SC.map((d) => (d && d.creators) || [])).map((c) => ({ k: 'cr', av: c.avatar || '', noav: true, h: '@' + c.handle, handle: c.handle, app: c.app || '',
          s: [c.app || '', has(c.fans) ? nf(c.fans) + ' abonnés' : '', c.median ? nf(c.median) + ' vues médianes' : ''].filter(Boolean).join(' · '),
          med: c.median ? nf(c.median) : '—', rytL: 'Abonnés', ryt: has(c.fans) ? nf(c.fans) : '—',
          hasCov: false, covs: [], href: '/app/createurs/' + c.handle, key: '@' + c.handle + ' ' + (c.app || '') }));
        [A2, F2, C2].forEach((l) => l.forEach((x) => { x.nk = norm(x.key); }));
        this.ix = { S, AD, FD, SC, AP: A2, FM: F2, CR: C2 };
      }
      AP = this.ix.AP; FM = this.ix.FM; CR = this.ix.CR;
    }
    const st = this.state || {};
    const q = st.q || '';
    const scope = st.scope || 'tout';
    const nq = norm(q.trim());
    const hit = (x) => !nq || (x.nk || norm(x.key)).indexOf(nq) >= 0;
    let apps = AP.filter(hit);
    let fms = FM.filter(hit);
    let crs = CR.filter(hit);
    const total = apps.length + fms.length + crs.length;
    apps = apps.slice(0, nq ? 6 : 5); fms = fms.slice(0, nq ? 4 : 3); crs = crs.slice(0, nq ? 4 : 3);
    if (scope === 'apps') { fms = []; crs = []; }
    if (scope === 'formats') { apps = []; crs = []; }
    if (scope === 'createurs') { apps = []; fms = []; }
    const flat = [].concat(apps, fms, crs);
    let sel = Math.min(st.sel || 0, Math.max(0, flat.length - 1));
    const mark = (list, off) => list.map((x, i) => Object.assign({}, x, {
      bg: i + off === sel ? 'var(--accent-soft)' : 'transparent', edge: i + off === sel ? 'var(--accent-edge)' : 'transparent',
      hover: () => { if ((this.state || {}).sel !== i + off) this.setState({ sel: i + off }); }
    }));
    const A2 = mark(apps, 0), F2 = mark(fms, apps.length), C2 = mark(crs, apps.length + fms.length);
    let cur = flat[sel] || null;
    // Un créateur : ses vidéos les plus récentes et son rythme, lus dans sa fiche (document « creator: »).
    if (cur && cur.k === 'cr' && cur.handle && this.props && this.props.get) {
      const d = this.props.get('creator:' + cur.handle);
      if (d) {
        const nf2 = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
        const covs = (d.videos || []).filter((v) => v.cover).slice(0, 3).map((v) => ({ src: v.cover, v: nf2(v.views) }));
        const p7 = d.posts7d || 0;
        cur = Object.assign({}, cur, { covs, hasCov: covs.length > 0, rytL: 'Rythme', ryt: p7 ? p7 + (p7 > 1 ? ' vidéos' : ' vidéo') + ' en 7 j' : 'Rien en 7 j', av: cur.av || d.avatar || '' });
      }
    }
    const close = () => { if (this.props.onClose) this.props.onClose(); };
    const scopes = [['tout', 'Tout'], ['apps', 'Apps'], ['formats', 'Formats'], ['createurs', 'Créateurs']]
      .map((s) => ({ l: s[1], on: s[0] === scope ? 'true' : 'false', pick: () => this.setState({ scope: s[0], sel: 0 }) }));
    return {
      q, scopes, close,
      onQ: (e) => this.setState({ q: e.target.value, sel: 0 }),
      setInput: (el) => { this.inp = el; },
      setGo: (el) => { this.go = el; },
      keys: (e) => {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); this.setState({ sel: Math.min(sel + 1, flat.length - 1) }); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); this.setState({ sel: Math.max(sel - 1, 0) }); }
        else if (e.key === 'Enter' && this.go && e.target === this.inp) { e.preventDefault(); this.go.click(); }
      },
      apps: A2, fms: F2, crs: C2, hasApps: A2.length > 0, hasFms: F2.length > 0, hasCrs: C2.length > 0,
      gApps: nq ? 'Apps' : 'Les plus vues en 30 jours', gFms: nq ? 'Formats' : (real ? 'Les plus repris' : 'Formats de la semaine'), gCrs: nq ? 'Créateurs' : (real ? 'Les plus vus' : 'Créateurs à suivre'),
      none: flat.length === 0, some: flat.length > 0,
      cur: cur || {}, pa: !!cur && cur.k === 'app', pf: !!cur && cur.k === 'fm', pc: !!cur && cur.k === 'cr',
      count: nq ? (total + (total > 1 ? ' résultats' : ' résultat')) : 'Tape pour chercher dans le Radar'
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: absolute; inset: 0; color: var(--ink); font-family: var(--font-body);" },
        $h("button", { "type": "button", "aria-label": "Fermer la recherche", "onClick": $v.close, "style": "position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);" }),
        $h("div", { "style": "position: absolute; inset: 0; display: flex; justify-content: center; align-items: flex-start; padding: 64px 24px 24px; box-sizing: border-box; pointer-events: none;" },
          $h("section", { "role": "dialog", "aria-modal": "true", "aria-label": "Recherche", "onKeyDown": $v.keys, "style": "pointer-events: auto; width: 100%; max-width: 1000px; border-radius: 26px; background: var(--surface-raised); border: 1px solid var(--line-strong); box-shadow: 0 40px 120px rgba(0,0,0,0.7), 0 0 0 6px rgba(76,154,255,0.05); overflow: hidden; animation: sw-rise 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
            $h("div", { "style": "display: flex; align-items: center; gap: 14px; height: 64px; padding: 0 16px 0 20px; border-bottom: 1px solid var(--line);" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent); flex-shrink: 0;" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "ref": $v.setInput, "type": "search", "value": $v.q, "onInput": $v.onQ, "aria-label": "Chercher une app, un format ou un créateur", "placeholder": "Cherche une app, un format, un créateur…", "autocomplete": "off", "style": "flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent; color: var(--ink); font-family: var(--font-body); font-size: 20px; font-weight: 500;" })
            ),
            $h("div", { "role": "tablist", "aria-label": "Chercher dans", "style": "display: flex; gap: 6px; padding: 12px 16px; border-bottom: 1px solid var(--line);" },
              ($l($v.scopes)).map((s) => [
                $h("button", { "class": "sw-pill", "type": "button", "role": "tab", "aria-pressed": s?.on, "aria-selected": s?.on, "onClick": s?.pick, "style": "height: 30px; padding: 0 12px; font-size: 13px;" },
                  $t(s?.l)
                )
              ])
            ),
            ($v.none) ? [
              $h("div", { "class": "sw-empty", "style": "padding: 48px 24px;" },
                $h("div", { "class": "sw-empty-radar" }),
                $h("p", { "class": "sw-empty-title" },
                  "Rien pour « ", $t($v.q), " »"
                ),
                $h("p", { "class": "sw-empty-text" },
                  "Essaie un nom d’app, un @compte ou un mot de l’accroche."
                )
              )
            ] : null,
            ($v.some) ? [
              $h("div", { "style": "display: grid; grid-template-columns: 420px minmax(0, 1fr);" },
                $h("div", { "style": "border-right: 1px solid var(--line); padding-bottom: 10px; max-height: 560px; overflow-y: auto;" },
                  ($v.hasApps) ? [
                    $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 12px 20px 6px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t($v.gApps)
                    ),
                    ($l($v.apps)).map((a) => [
                      $h("a", { "href": $u(a?.href), "onMouseEnter": a?.hover, "style": `display: flex; align-items: center; gap: 12px; margin: 0 8px; padding: 8px 12px; border-radius: 12px; text-decoration: none; color: inherit; background: ${$t(a?.bg)}; box-shadow: inset 0 0 0 1px ${$t(a?.edge)};` },
                        $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 32px; height: 32px; border-radius: 10px;" },
                          (a?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": $u(a?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (a?.nologo) ? [
                            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;" },
                          $h("span", { "style": "font-size: 15px; font-weight: 600;" },
                            $t(a?.n)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                            $t(a?.niche), " · ", $t(a?.v30), " vues en 30 j"
                          )
                        )
                      )
                    ])
                  ] : null,
                  ($v.hasFms) ? [
                    $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 12px 20px 6px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                        $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t($v.gFms)
                    ),
                    ($l($v.fms)).map((f) => [
                      $h("a", { "href": $u(f?.href), "onMouseEnter": f?.hover, "style": `display: flex; align-items: center; gap: 12px; margin: 0 8px; padding: 8px 12px; border-radius: 12px; text-decoration: none; color: inherit; background: ${$t(f?.bg)}; box-shadow: inset 0 0 0 1px ${$t(f?.edge)};` },
                        $h("span", { "style": "width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--ink-soft);" },
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ),
                        $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;" },
                          $h("span", { "style": "font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                            $t(f?.t)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                            $t(f?.sub)
                          )
                        )
                      )
                    ])
                  ] : null,
                  ($v.hasCrs) ? [
                    $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 12px 20px 6px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                        $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t($v.gCrs)
                    ),
                    ($l($v.crs)).map((c) => [
                      $h("a", { "href": $u(c?.href), "onMouseEnter": c?.hover, "style": `display: flex; align-items: center; gap: 12px; margin: 0 8px; padding: 8px 12px; border-radius: 12px; text-decoration: none; color: inherit; background: ${$t(c?.bg)}; box-shadow: inset 0 0 0 1px ${$t(c?.edge)};` },
                        $h("span", { "style": "position: relative; width: 32px; height: 32px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                          (c?.av) ? [
                            $h("img", { "src": $u(c?.av), "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                          ] : null,
                          (c?.noav) ? [
                            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                              $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;" },
                          $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                            $t(c?.h)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                            $t(c?.s)
                          )
                        )
                      )
                    ])
                  ] : null
                ),
                $h("div", { "style": "padding: 26px 28px; display: flex; flex-direction: column; gap: 18px; background: radial-gradient(80% 60% at 100% 0%, rgba(11,111,224,0.14), transparent);" },
                  ($v.pa) ? [
                    $h("div", { "style": "display: flex; align-items: center; gap: 16px;" },
                      $h("span", { "class": `sw-app-icon ${$t($v.cur?.blank)}`, "style": "width: 64px; height: 64px; border-radius: 18px;" },
                        ($v.cur?.logo) ? [
                          $h("img", { "class": "sw-logo-img", "src": $u($v.cur?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                        ] : null,
                        ($v.cur?.nologo) ? [
                          $h("svg", { "width": "32", "height": "32", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        ] : null
                      ),
                      $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 4px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.03em;" },
                          $t($v.cur?.n)
                        ),
                        $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-faint);" },
                          $t($v.cur?.niche),
                          ($l($v.cur?.mk)).map((m) => [
                            $h("span", { "class": "sw-flag", "data-c": m?.c, "style": "width: 22px; height: 16px; font-size: 8px;" },
                              $t(m?.c)
                            )
                          ])
                        )
                      )
                    ),
                    $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;" },
                      $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                        $h("span", { "class": "sw-tile-label" },
                          "Vues en 30 j"
                        ),
                        $h("span", { "class": "sw-tile-value", "style": "font-size: 20px;" },
                          $t($v.cur?.v30)
                        )
                      ),
                      $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                        $h("span", { "class": "sw-tile-label" },
                          "Comptes qui le poussent"
                        ),
                        $h("span", { "class": "sw-tile-value", "style": "font-size: 20px;" },
                          $t($v.cur?.acc)
                        )
                      )
                    ),
                    ($v.cur?.hasCov) ? [
                      $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px;" },
                        ($l($v.cur?.covs)).map((v) => [
                          $h("span", { "class": "sw-video", "style": "display: block; border-radius: 14px;" },
                            $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                            $h("span", { "class": "sw-video-shade" }),
                            $h("span", { "class": "sw-video-foot" },
                              $h("span", { "class": "sw-video-views", "style": "font-size: 17px;" },
                                $t(v?.v)
                              )
                            )
                          )
                        ])
                      )
                    ] : null,
                    $h("div", { "style": "display: flex; justify-content: flex-end;" },
                      $h("a", { "ref": $v.setGo, "class": "sw-btn sw-btn-primary", "href": $u($v.cur?.href) },
                        "Ouvrir la fiche",
                        $h("span", { "class": "sw-btn-tile" },
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    )
                  ] : null,
                  ($v.pf) ? [
                    $h("span", { "class": "sw-badge", "style": "align-self: flex-start; height: 24px; gap: 6px;" },
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": $v.cur?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t($v.cur?.kind)
                    ),
                    $h("span", { "style": "font-family: var(--font-display); font-size: 24px; line-height: 1.25; font-weight: 700; letter-spacing: -0.02em;" },
                      $t($v.cur?.t)
                    ),
                    ($v.cur?.hasStats) ? [
                      $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                        $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                          $h("span", { "class": "sw-tile-label" },
                            "× la normale"
                          ),
                          $h("span", { "class": "sw-tile-value", "style": "font-size: 20px; color: var(--accent);" },
                            $t($v.cur?.med)
                          )
                        ),
                        $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                          $h("span", { "class": "sw-tile-label" },
                            "Réussite"
                          ),
                          $h("span", { "class": "sw-tile-value", "style": "font-size: 20px;" },
                            $t($v.cur?.ok)
                          )
                        ),
                        $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                          $h("span", { "class": "sw-tile-label" },
                            "Meilleure"
                          ),
                          $h("span", { "class": "sw-tile-value", "style": "font-size: 20px;" },
                            $t($v.cur?.max)
                          )
                        )
                      )
                    ] : null,
                    ($v.cur?.hasCov) ? [
                      $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px;" },
                        ($l($v.cur?.covs)).map((v) => [
                          $h("span", { "class": "sw-video", "style": "display: block; border-radius: 14px;" },
                            $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                            $h("span", { "class": "sw-video-shade" }),
                            $h("span", { "class": "sw-video-foot" },
                              $h("span", { "class": "sw-video-views", "style": "font-size: 17px;" },
                                $t(v?.v)
                              )
                            )
                          )
                        ])
                      )
                    ] : null,
                    $h("div", { "style": "display: flex; justify-content: space-between; align-items: center;" },
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t($v.cur?.apps)
                      ),
                      $h("a", { "ref": $v.setGo, "class": "sw-btn sw-btn-primary", "href": $u($v.cur?.href) },
                        "Voir le format",
                        $h("span", { "class": "sw-btn-tile" },
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    )
                  ] : null,
                  ($v.pc) ? [
                    $h("div", { "style": "display: flex; align-items: center; gap: 16px;" },
                      $h("span", { "style": "position: relative; width: 64px; height: 64px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                        ($v.cur?.av) ? [
                          $h("img", { "src": $u($v.cur?.av), "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                        ] : null,
                        ($v.cur?.noav) ? [
                          $h("svg", { "width": "32", "height": "32", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                            $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                          )
                        ] : null
                      ),
                      $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 4px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.03em;" },
                          $t($v.cur?.h)
                        ),
                        $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                          $t($v.cur?.s)
                        )
                      )
                    ),
                    $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;" },
                      $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                        $h("span", { "class": "sw-tile-label" },
                          "Vues médianes"
                        ),
                        $h("span", { "class": "sw-tile-value", "style": "font-size: 20px;" },
                          $t($v.cur?.med)
                        )
                      ),
                      $h("span", { "class": "sw-tile", "style": "padding: 12px 14px;" },
                        $h("span", { "class": "sw-tile-label" },
                          $t($v.cur?.rytL)
                        ),
                        $h("span", { "class": "sw-tile-value", "style": "font-size: 16px; padding-top: 4px;" },
                          $t($v.cur?.ryt)
                        )
                      )
                    ),
                    ($v.cur?.hasCov) ? [
                      $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px;" },
                        ($l($v.cur?.covs)).map((v) => [
                          $h("span", { "class": "sw-video", "style": "display: block; border-radius: 14px;" },
                            $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                            $h("span", { "class": "sw-video-shade" }),
                            $h("span", { "class": "sw-video-foot" },
                              $h("span", { "class": "sw-video-views", "style": "font-size: 17px;" },
                                $t(v?.v)
                              )
                            )
                          )
                        ])
                      )
                    ] : null,
                    $h("div", { "style": "display: flex; justify-content: flex-end;" },
                      $h("a", { "ref": $v.setGo, "class": "sw-btn sw-btn-primary", "href": $u($v.cur?.href) },
                        "Voir la fiche",
                        $h("span", { "class": "sw-btn-tile" },
                          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                          )
                        )
                      )
                    )
                  ] : null
                )
              )
            ] : null,
            $h("div", { "style": "display: flex; align-items: center; gap: 18px; padding: 12px 20px; border-top: 1px solid var(--line); font-size: 12px; color: var(--ink-faint);" },
              $h("span", { "style": "margin-left: auto;" },
                $t($v.count)
              )
            )
          )
        )
      )
    ];
  }
}
