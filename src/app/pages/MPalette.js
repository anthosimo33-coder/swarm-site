// Généré par scripts/dc2preact.py depuis design/app/MPalette.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';

export default class MPalette extends DCLogic {
  componentDidMount() { if (this.inp) this.inp.focus(); }
  renderVals() {
    let AP = (globalThis.__dcSample?.["MPalette"]?.["AP"] ?? []);
    let FM = (globalThis.__dcSample?.["MPalette"]?.["FM"] ?? []);
    let CR = (globalThis.__dcSample?.["MPalette"]?.["CR"] ?? []);
    FM = FM.map((f) => Object.assign({ sub: f.kind + ' · ' + f.n + ' comptes · ' + f.med + ' la normale' }, f));
    // Sur le site : l'index de recherche du Radar (document « search », lu par get), complété par « apps » (marchés, vidéos)
    // et « formats » (multiplicateur) quand ils sont là. Sur le canevas : l'exemple.
    const get = this.props && this.props.get;
    const S = get ? get('search') : null;
    if (S && S.apps) {
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
      const xf = (x) => (x < 0.05 ? '< 0,1' : x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const pct = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + '\u202f%');
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / 86400000)); return d === 0 ? 'aujourd’hui' : 'il y a ' + d + '\u202fj'; };
      const MKN = (c) => ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
      const ML = new Proxy({}, { get: (o, c) => MKN(String(c)) });
      const ico = (o) => ({ logo: (o && o.icon) || '', nologo: !(o && o.icon), blank: o && o.icon ? '' : 'sw-app-blank' });
      const flags = (cs) => (cs || []).filter((c) => c).slice(0, 3).map((c) => ({ c }));
      const names = (as) => { const n = (as || []).map((a) => a.name); return n.length > 3 ? n.slice(0, 2).join(', ') + ' et ' + (n.length - 2) + ' autres' : n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : n.join(''); };
      const TXT = 'M5 6h14M12 6v13M9 19h6', SON = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
      const AD = get('apps'), FD = get('formats');
      // Les listes mises en forme ne se refont que si un document a changé : la recherche se redessine à chaque lettre
      // tapée (4 000 créateurs et plus), et l'ouverture ne doit pas les refaire deux fois (fluidité, téléphone).
      const SC0 = S.creatorPages > 1 ? Array.from({ length: S.creatorPages - 1 }, (_, j) => get('search:creators:' + (j + 2))) : [];
      const docs = [S, AD, FD].concat(SC0);
      const ix = this.constructor._ix; // gardé d’une ouverture à l’autre
      if (ix && ix.docs.length === docs.length && ix.docs.every((d, i) => d === docs[i])) { AP = ix.AP; FM = ix.FM; CR = ix.CR; } else {
      const byApp = {}, byFmt = {};
      ((AD && AD.apps) || []).forEach((a) => { byApp[a.slug] = a; });
      ((FD && FD.formats) || []).forEach((f) => { byFmt[f.id] = f; });
      AP = S.apps.map((a) => { const full = byApp[a.slug];
        const covs = full ? (full.top || []).filter((t) => t.cover).map((t) => ({ src: t.cover, v: nf(t.views) })) : [];
        return Object.assign({ k: 'app', n: a.name, niche: a.niche || '', mk: full ? flags(full.markets.map((x) => x[0])) : [], v30: nf(a.views30 || 0), acc: full && typeof full.accounts === 'number' ? full.accounts.toLocaleString('en-US').replace(/,/g, '\u202f') : '—',
          hasCov: covs.length > 0, covs, id: a.slug, href: '/app/apps/' + a.slug, key: a.name + ' ' + (a.niche || '') }, ico(a)); });
      FM = S.formats.map((f) => { const full = byFmt[f.id]; const hook = f.kind !== 'sound';
        return { k: 'fm', t: hook ? '« ' + f.label + ' »' : 'Son « ' + f.label + ' »', kind: hook ? 'Accroche' : 'Son', ico: hook ? TXT : SON,
          sub: [hook ? 'Accroche' : 'Son', f.accounts + ' comptes', full && full.medX ? xf(full.medX) + ' la normale' : ''].filter(Boolean).join(' · '),
          id: f.id, href: '/app/formats/' + f.id, key: f.label }; });
      // Les créateurs de l'index, par documents de 4 000 : « search », puis « search:creators:2 », « :3 »… (16/11).
      const SC = SC0;
      CR = (S.creators || []).concat(...SC.map((d) => (d && d.creators) || [])).map((c) => ({ av: c.avatar || '', noav: true, handle: c.handle, k: 'cr', h: '@' + c.handle, s: [c.app, nf(c.fans || 0) + ' abonnés', c.median ? nf(c.median) + ' vues médianes' : ''].filter(Boolean).join(' · '),
        id: c.handle, href: '/app/createurs/' + c.handle, key: '@' + c.handle + ' ' + (c.app || '') }));
      [AP, FM, CR].forEach((L) => L.forEach((x) => { x._n = String(x.key || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }));
      this.constructor._ix = { docs, AP, FM, CR };
      }
    }
    const st = this.state || {};
    const q = st.q || '';
    const scope = st.scope || 'tout';
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nq = norm(q.trim());
    const hit = (x) => !nq || (x._n !== undefined ? x._n : norm(x.key)).indexOf(nq) >= 0;
    let apps = AP.filter(hit), fms = FM.filter(hit), crs = CR.filter(hit);
    apps = apps.slice(0, nq ? 8 : 5); fms = fms.slice(0, nq ? 5 : 3); crs = crs.slice(0, nq ? 5 : 3);
    if (scope === 'apps') { fms = []; crs = []; }
    if (scope === 'formats') { apps = []; crs = []; }
    if (scope === 'createurs') { apps = []; fms = []; }
    const cur = apps[0] || null;
    // Un créateur trouvé (onglet Créateurs, ou aucune app) : sa photo, son rythme et ses 3 dernières vidéos avec image (document « creator: »).
    const crHit = nq && (scope === 'createurs' || !cur) ? crs[0] || null : null;
    let cc = {};
    if (crHit) {
      const g = this.props && typeof this.props.get === 'function' ? this.props.get : null;
      const d = g && crHit.handle ? g('creator:' + crHit.handle) : null;
      const nfc = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
      const covs = d && d.videos ? d.videos.filter((v) => v.cover).slice(0, 3).map((v) => ({ src: v.cover, v: nfc(v.views) })) : (crHit.covs || []);
      const p7 = d ? d.posts7d || 0 : null;
      cc = Object.assign({}, crHit, { av: crHit.av || (d && d.avatar) || '', noav: true, covs, hasCov: covs.length > 0,
        ryt: p7 === null ? (crHit.ryt || '—') : p7 ? (p7 >= 30 ? 'au moins 30 vidéos' : p7 + (p7 > 1 ? ' vidéos' : ' vidéo')) + ' en 7 j' : 'Rien en 7 j' }); // 30 = au moins 30 (7C)
    }
    const KIND = { app: 'app', cr: 'creator', fm: 'format' };
    const opener = (x) => () => { if (x && x.id && KIND[x.k] && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kopycat:opened', { detail: { kind: KIND[x.k], id: x.id } })); };
    const withOpen = (L) => L.map((x) => Object.assign({}, x, { open: opener(x) }));
    // Ouverts récemment (maquette 9B, 24/11) : sans recherche, les deux dernières fiches ouvertes d'ici (préférence
    // `recent`, src/app/recent.js), chiffres du jour pris dans l'index ; une fiche sortie de l'index n'est plus montrée.
    const RS = !nq && S && S.apps ? get('saved:recent') : null;
    const want = (k) => scope === 'tout' || scope === k;
    const LR = { app: [AP, 'apps'], creator: [CR, 'createurs'], format: [FM, 'formats'] };
    const rec = Array.isArray(RS) ? RS.map((r) => (LR[r.kind] && want(LR[r.kind][1]) ? LR[r.kind][0].find((x) => x.id === r.id) : null)).filter(Boolean).map((x) => ({
      href: x.href, open: opener(x), isApp: x.k === 'app', isCr: x.k === 'cr', isFm: x.k === 'fm', logo: x.logo || '', nologo: !!x.nologo, blank: x.blank || '', av: x.av || '', ico: x.ico || '',
      nm: x.k === 'cr' ? x.h : x.k === 'fm' ? x.t : x.n, sub: x.k === 'cr' ? x.s : x.k === 'fm' ? x.sub : (x.niche ? x.niche + ' · ' : '') + x.v30 + ' vues en 30 j' })) : [];
    const close = () => { if (this.props.onClose) this.props.onClose(); };
    return {
      q, close, rec, hasRec: rec.length > 0, onQ: (e) => this.setState({ q: e.target.value }), setInput: (el) => { this.inp = el; },
      keys: (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } },
      scopes: [['tout', 'Tout'], ['apps', 'Apps'], ['formats', 'Formats'], ['createurs', 'Créateurs']].map((s) => ({ l: s[1], on: s[0] === scope ? 'true' : 'false', pick: () => this.setState({ scope: s[0] }) })),
      apps: withOpen(apps.slice(cur && nq ? 1 : 0)), fms: withOpen(fms), crs: withOpen(crHit ? crs.slice(1) : crs), pc: !!crHit, cc: Object.assign({}, cc, { open: opener(crHit) }), hasApps: apps.length > (cur && nq ? 1 : 0), hasFms: fms.length > 0, hasCrs: crs.length > (crHit ? 1 : 0),
      gApps: nq ? 'Autres apps' : 'Les plus vues en 30 jours', gFms: nq ? 'Formats' : 'Formats de la semaine', gCrs: nq ? 'Créateurs' : 'Créateurs à suivre',
      pa: !!cur && !!nq, cur: Object.assign({}, cur || {}, { open: opener(cur) }), none: apps.length + fms.length + crs.length === 0
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: fixed; inset: 0; z-index: 60; overflow-y: auto; overscroll-behavior: contain; background: var(--ground); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "role": "search", "onKeyDown": $v.keys, "style": "position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 8px; padding: 10px 12px 10px 16px; background: rgba(5,7,12,0.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("div", { "class": "sw-search", "style": "flex: 1; min-width: 0; height: 48px; padding: 0 12px; box-shadow: none; border-radius: 14px; border-color: var(--accent-edge);" },
            $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent); flex-shrink: 0;" },
              $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("input", { "ref": $v.setInput, "type": "search", "enterkeyhint": "search", "value": $v.q, "onInput": $v.onQ, "aria-label": "Chercher une app, un format ou un créateur", "placeholder": "Une app, un format, un compte…", "autocomplete": "off", "style": "flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent; color: var(--ink); font-family: var(--font-body); font-size: 17px;" })
          ),
          $h("button", { "type": "button", "onClick": $v.close, "style": "min-height: 44px; padding: 0 6px; border: 0; background: transparent; color: var(--accent); font-family: inherit; font-size: 16px; font-weight: 600; cursor: pointer;" },
            "Annuler"
          )
        ),
        $h("div", { "style": "display: flex; gap: 8px; overflow-x: auto; padding: 12px 16px 4px; scrollbar-width: none;" },
          ($l($v.scopes)).map((s) => [
            $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": s?.on, "onClick": s?.pick, "style": "height: 44px; flex-shrink: 0;" },
              $t(s?.l)
            )
          ])
        ),
        ($v.none) ? [
          $h("div", { "class": "sw-empty", "style": "padding: 56px 24px;" },
            $h("div", { "class": "sw-empty-radar" }),
            $h("p", { "class": "sw-empty-title" },
              "Rien pour « ", $t($v.q), " »"
            ),
            $h("p", { "class": "sw-empty-text" },
              "Essaie un nom d’app, un @compte ou un mot de l’accroche."
            )
          )
        ] : null,
        $h("div", { "style": "padding: 0 16px 32px;" },
          ($v.pa) ? [
            $h("a", { "href": $u($v.cur?.href), "onClick": $v.cur?.open, "class": "sw-card is-featured", "style": "margin-top: 12px; border-radius: 22px; padding: 16px; display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: inherit;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 12px;" },
                $h("span", { "class": `sw-app-icon ${$t($v.cur?.blank)}`, "style": "width: 52px; height: 52px; border-radius: 15px;" },
                  ($v.cur?.logo) ? [
                    $h("img", { "class": "sw-logo-img", "src": $u($v.cur?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  ($v.cur?.nologo) ? [
                    $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.03em;" },
                    $t($v.cur?.n)
                  ),
                  $h("span", { "style": "display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--ink-faint);" },
                    $t($v.cur?.niche),
                    ($l($v.cur?.mk)).map((m) => [
                      $h("span", { "class": "sw-flag", "data-c": m?.c, "aria-hidden": "true" })
                    ])
                  )
                )
              ),
              $h("span", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;" },
                $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                  $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; min-height: 30px; line-height: 15px;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Vues en 30 j"
                  ),
                  $h("span", { "class": "sw-tile-value", "style": "font-size: 18px;" },
                    $t($v.cur?.v30)
                  )
                ),
                $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                  $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; min-height: 30px; line-height: 15px;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                      $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Comptes qui le poussent"
                  ),
                  $h("span", { "class": "sw-tile-value", "style": "font-size: 18px;" },
                    $t($v.cur?.acc)
                  )
                )
              ),
              ($v.cur?.hasCov) ? [
                $h("span", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                  ($l($v.cur?.covs)).map((v) => [
                    $h("span", { "class": "sw-video", "style": "display: block; border-radius: 12px;" },
                      $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "style": "position: absolute; left: 7px; bottom: 6px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #FFFFFF;" },
                        $t(v?.v)
                      )
                    )
                  ])
                )
              ] : null,
              $h("span", { "style": "align-self: flex-end; display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: var(--accent);" },
                "Ouvrir la fiche",
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ] : null,
          ($v.pc) ? [
            $h("a", { "href": $u($v.cc?.href), "onClick": $v.cc?.open, "class": "sw-card is-featured", "style": "margin-top: 12px; border-radius: 22px; padding: 16px; display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: inherit;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 12px;" },
                $h("span", { "style": "width: 56px; height: 56px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                  ($v.cc?.av) ? [
                    $h("img", { "src": $u($v.cc?.av), "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  ($v.cc?.noav) ? [
                    $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                      $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 21px; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t($v.cc?.h)
                  ),
                  $h("span", { "style": "font-size: 12px; line-height: 1.4; color: var(--ink-faint);" },
                    $t($v.cc?.s)
                  )
                )
              ),
              $h("span", { "class": "sw-tile", "style": "padding: 10px 12px;" },
                $h("span", { "class": "sw-tile-label" },
                  "Rythme"
                ),
                $h("span", { "class": "sw-tile-value", "style": "font-size: 18px;" },
                  $t($v.cc?.ryt)
                )
              ),
              ($v.cc?.hasCov) ? [
                $h("span", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px;" },
                  ($l($v.cc?.covs)).map((v) => [
                    $h("span", { "class": "sw-video", "style": "display: block; border-radius: 12px;" },
                      $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                      $h("span", { "class": "sw-video-shade" }),
                      $h("span", { "style": "position: absolute; left: 7px; bottom: 6px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #FFFFFF;" },
                        $t(v?.v)
                      )
                    )
                  ])
                )
              ] : null,
              $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; min-height: 24px; font-size: 14px; font-weight: 600; color: var(--accent);" },
                "Ouvrir la fiche",
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ] : null,
          ($v.hasRec) ? [
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 18px 0 4px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Ouverts récemment"
            ),
            ($l($v.rec)).map((r) => [
              $h("a", { "href": $u(r?.href), "onClick": r?.open, "style": "display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 0; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                (r?.isApp) ? [
                  $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 40px; height: 40px; border-radius: 12px;" },
                    (r?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": $u(r?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    (r?.nologo) ? [
                      $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  )
                ] : null,
                (r?.isCr) ? [
                  $h("span", { "style": "width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                    (r?.av) ? [
                      $h("img", { "src": $u(r?.av), "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                      $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                    )
                  )
                ] : null,
                (r?.isFm) ? [
                  $h("span", { "style": "width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--ink-muted);" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": r?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ] : null,
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(r?.nm)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(r?.sub)
                  )
                ),
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint); flex-shrink: 0;" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ])
          ] : null,
          ($v.hasApps) ? [
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 18px 0 4px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.gApps)
            ),
            ($l($v.apps)).map((a) => [
              $h("a", { "href": $u(a?.href), "onClick": a?.open, "style": "display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 0; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 40px; height: 40px; border-radius: 12px;" },
                  (a?.logo) ? [
                    $h("img", { "class": "sw-logo-img", "src": $u(a?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  (a?.nologo) ? [
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(a?.n)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(a?.niche), " · ", $t(a?.v30), " vues en 30 j"
                  )
                ),
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint); flex-shrink: 0;" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ])
          ] : null,
          ($v.hasFms) ? [
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 18px 0 4px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.gFms)
            ),
            ($l($v.fms)).map((f) => [
              $h("a", { "href": $u(f?.href), "onClick": f?.open, "style": "display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 0; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                $h("span", { "style": "width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--ink-soft);" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(f?.t)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(f?.sub)
                  )
                ),
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint); flex-shrink: 0;" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ])
          ] : null,
          ($v.hasCrs) ? [
            $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 18px 0 4px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.gCrs)
            ),
            ($l($v.crs)).map((c) => [
              $h("a", { "href": $u(c?.href), "onClick": c?.open, "style": "display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 0; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                $h("span", { "style": "width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                  (c?.av) ? [
                    $h("img", { "src": $u(c?.av), "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  (c?.noav) ? [
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                      $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(c?.h)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(c?.s)
                  )
                ),
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint); flex-shrink: 0;" },
                  $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ])
          ] : null
        )
      )
    ];
  }
}
