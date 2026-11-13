// Généré par scripts/dc2preact.py depuis design/app/MFiche.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MFicheApp extends DCLogic {

  renderVals() {
    const b = this.baseVals();
    return Object.assign({}, b, this.shellVals(), this.extraVals(b));
  }
  shellVals() {
    const st = this.state || {};
    const u = this.props.user;
    const me = u ? { prenom: u.prenom || null, email: u.email || '', initiale: String(u.initiale || u.prenom || u.email || '?').charAt(0).toUpperCase() }
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
    // Suivre : sur le site, follows.apps (saved) ; sur le canevas, l'état local.
    const fid = (P.data && P.data.slug) || (P.params && P.params.slug) || (live ? '' : 'astraai');
    const fw = live ? P.saved('follows') : null;
    const f = live ? !!(fw && (fw.apps || []).indexOf(fid) >= 0) : !!st.follow;
    const toggleFollow = () => {
      if (!live) return this.setState({ follow: !f });
      const cur = P.saved('follows');
      if (cur === undefined || !fid) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.apps || [];
      next.apps = l.indexOf(fid) >= 0 ? l.filter((x) => x !== fid) : [fid].concat(l);
      P.save('follows', next);
    };
    return Object.assign({ followOn: f ? 'true' : 'false', toggleFollow, ajItem: fid ? { kind: 'app', id: fid, label: b.app.name, cover: (b.a && b.a.logo) || null } : null }, { followLabel: f ? 'Suivie' : 'Suivre ' + b.app.name,
      secs: (b.secs || []).map((s, i) => Object.assign({}, s, { href: ['#m-vues', '#m-vid', '#m-fmt', '#m-cr'][i] || '#m-vues', on: (st.sec || 0) === i ? 'true' : 'false', pick: () => this.setState({ sec: i }) })) });
  }

  baseVals() {
    let a = {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": "", "mk": [{"c": "ID"}, {"c": "US"}, {"c": "ES"}]};
    let secs = [{"l": "Vue d’ensemble", "n": "", "on": "true"}, {"l": "Vidéos", "n": "2 542", "on": "false"}, {"l": "Formats", "n": "5", "on": "false"}, {"l": "Créateurs", "n": "269", "on": "false"}];
    let wk = [{"h": 69, "v": "10,6 M", "l": "1 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 64, "v": "9,8 M", "l": "8 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 58, "v": "8,9 M", "l": "15 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 55, "v": "8,5 M", "l": "22 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 113, "v": "17,3 M", "l": "29 oct.", "bg": "var(--line-strong)", "ink": "var(--ink-faint)"}, {"h": 120, "v": "18,4 M", "l": "5 nov.", "bg": "var(--accent)", "ink": "var(--ink)"}];
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let fv = [{"src": "/media/app/v-7700392351268752661.jpg", "v": "2,6 M", "h": "@ivylearns8", "age": "il y a 19 j"}, {"src": "/media/app/v-7697654738124442896.jpg", "v": "2,6 M", "h": "@ira.belajaryuk", "age": "il y a 26 j"}, {"src": "/media/app/v-7702743575934684437.jpg", "v": "2,3 M", "h": "@studywithruney", "age": "il y a 12 j"}, {"src": "/media/app/v-7705368869250075925.jpg", "v": "2,0 M", "h": "@belajarbersamaespi", "age": "il y a 5 j"}, {"src": "/media/app/v-7696248791560703252.jpg", "v": "1,9 M", "h": "@belajarbarengjames", "age": "il y a 30 j"}, {"src": "/media/app/v-7705929733220994337.jpg", "v": "1,9 M", "h": "@learnwithjoel1", "age": "il y a 4 j"}];
    fv = fv.map((x) => Object.assign({}, x, { href: '/app/videos/' + vkey(x.src) }));
    let ff = [{"ico": "M5 6h14M12 6v13M9 19h6", "t": "« Je supprime cette vidéo dans 24 h »", "m": "La même idée en vietnamien chez Astra AI et en allemand chez Retain Cards", "x": "1 226×", "o": "809 k vues"}, {"ico": "M5 6h14M12 6v13M9 19h6", "t": "« TRATA ESTE VÍDEO COMO QUERES QUE SEJAM AS TUAS NOTAS »", "m": "Portugais · 4 comptes", "x": "11× en médiane", "o": "2 reprises sur 4"}, {"ico": "M5 6h14M12 6v13M9 19h6", "t": "« GUARDA E PARTILHA »", "m": "Portugais · 3 comptes", "x": "17× en médiane", "o": "3 reprises sur 4"}, {"ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "t": "Son « exam vibes »", "m": "5 comptes · le son de la révision qui stresse", "x": "7× en médiane", "o": "4 reprises sur 6"}];
    let fm = [{"c": "ID", "l": "Indonésie et Vietnam", "v": "37,5 M", "p": "65 %", "w": "65.0%", "bg": "var(--accent)"}, {"c": "US", "l": "États-Unis", "v": "10,7 M", "p": "19 %", "w": "18.6%", "bg": "var(--line-strong)"}, {"c": "ES", "l": "Espagne", "v": "4,8 M", "p": "8 %", "w": "8.4%", "bg": "var(--line-strong)"}, {"c": "BR", "l": "Brésil et Portugal", "v": "2,9 M", "p": "5 %", "w": "5.0%", "bg": "var(--line-strong)"}, {"c": "FR", "l": "France", "v": "1,3 M", "p": "2 %", "w": "2.3%", "bg": "var(--line-strong)"}, {"c": "MX", "l": "Amérique latine", "v": "0,4 M", "p": "1 %", "w": "0.7%", "bg": "var(--line-strong)"}];
    let fc = [{"av": "", "noav": true, "h": "@ivylearns8", "mk": "US", "s": "3,1 k abonnés · 4,9 M vues en 30 j", "med": "17,9 k"}, {"av": "/media/app/av-ira.belajaryuk.jpg", "noav": false, "h": "@ira.belajaryuk", "mk": "ID", "s": "4,2 k abonnés · 3,3 M vues en 30 j", "med": "550"}, {"av": "/media/app/av-learnwithjoel1.jpg", "noav": false, "h": "@learnwithjoel1", "mk": "ES", "s": "12,2 k abonnés · 3,2 M vues en 30 j", "med": "28,5 k"}, {"av": "/media/app/av-studywithruney.jpg", "noav": false, "h": "@studywithruney", "mk": "ID", "s": "2,4 k abonnés · 2,7 M vues en 30 j", "med": "418"}, {"av": "/media/app/av-studyclubbyinda.jpg", "noav": false, "h": "@studyclubbyinda", "mk": "ID", "s": "26,4 k abonnés · 2,3 M vues en 30 j", "med": "4,6 k"}, {"av": "/media/app/av-belajarbersamaespi.jpg", "noav": false, "h": "@belajarbersamaespi", "mk": "ID", "s": "6,5 k abonnés · 2,0 M vues en 30 j", "med": "855"}];
    let app = { name: 'Astra AI', niche: 'Études', hasDelta: true, delta: '+6 % cette semaine', hasDesc: true, desc: 'Aide aux révisions par IA',
      hasStore: true, store: 'https://apps.apple.com/fr/app/astra-ai-r%C3%A9vision-examens/id6751030141', play: 'https://play.google.com/store/search?q=Astra%20AI&c=apps',
      hasSite: true, site: 'https://astra-ai.fr', v30: '57,7 M', ig: 'dont 2,8 M sur Instagram', lo: '144', hi: '202 k€', week: '18,4 M', wd: '+6 % face à la semaine d’avant',
      acc: '269', ppw: '1 360 vidéos par semaine' };
    ff = ff.map((f) => Object.assign({ href: '/app/formats' }, f));
    fc = fc.map((c) => Object.assign({ page: true, nopage: false, href: '/app/createurs/zinedine.gsbb' }, c));
    // Sur le site : la fiche de l'app (document « app:<slug> »), lue comme FicheA.
    const D = this.props && this.props.data;
    if (D && D.name) {
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
      const xf = (x) => (x < 0.05 ? '< 0,1' : x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const pct = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' %');
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / 86400000)); return d === 0 ? 'aujourd’hui' : 'il y a ' + d + ' j'; };
      const ML = { FR: 'France', US: 'États-Unis et anglophones', MX: 'Amérique latine', ES: 'Espagne', BR: 'Brésil et Portugal', XX: 'Autres langues' };
      const ico = (o) => ({ logo: (o && o.icon) || '', nologo: !(o && o.icon), blank: o && o.icon ? '' : 'sw-app-blank' });
      const flags = (cs) => (cs || []).filter((c) => c && c !== 'XX').slice(0, 3).map((c) => ({ c }));
      const eur = (v) => { const lo = v / 1000 * 2.5, hi = v / 1000 * 3.5; if (hi < 1000) return [String(Math.round(lo)), Math.round(hi) + ' €'];
        const k = (e) => (hi >= 1e4 ? String(Math.round(e / 1000)) : (e / 1000).toFixed(1).replace('.', ',').replace(/,0$/, '')); return [k(lo), k(hi) + ' k€']; };
      const names = (as) => { const n = (as || []).map((a) => a.name); return n.length > 3 ? n.slice(0, 2).join(', ') + ' et ' + (n.length - 2) + ' autres' : n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : n.join(''); };
      const TXT = 'M5 6h14M12 6v13M9 19h6', SON = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
      const hasD = D.weekDelta !== null && D.weekDelta !== undefined;
      const r = eur(D.views30 || 0);
      const W = D.weeks || [];
      a = Object.assign({ name: D.name, mk: flags((D.markets || []).map((x) => x[0])) }, ico(D));
      app = { name: D.name, niche: D.niche || '', hasDelta: hasD, delta: hasD ? pct(D.weekDelta) + ' cette semaine' : '', hasDesc: false, desc: '',
        hasStore: !!D.store, store: D.store || '', play: 'https://play.google.com/store/search?q=' + encodeURIComponent(D.name) + '&c=apps', hasSite: false, site: '',
        v30: nf(D.views30 || 0), ig: D.views30Ig > 0 ? 'dont ' + nf(D.views30Ig) + ' sur Instagram' : 'vidéos publiées ces 30 jours', lo: r[0], hi: r[1],
        week: nf(W[W.length - 1] || 0), wd: hasD ? pct(D.weekDelta) + ' face à la semaine d’avant' : 'première semaine suivie',
        acc: (D.accounts || 0).toLocaleString('en-US').replace(/,/g, '\u202f'), ppw: (D.videosPerWeek || 0).toLocaleString('en-US').replace(/,/g, '\u202f') + ' vidéos par semaine' };
      const mx = Math.max.apply(null, W.concat([1]));
      wk = W.map((w, j) => ({ h: Math.max(4, Math.round(w / mx * 120)), v: nf(w), bg: j === W.length - 1 ? 'var(--accent)' : 'var(--line-strong)', ink: j === W.length - 1 ? 'var(--ink)' : 'var(--ink-faint)',
        l: new Date((D.updatedAt || Date.now()) - (W.length - 1 - j) * 7 * 86400000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }));
      fv = (D.videos || []).slice(0, 6).map((v) => ({ src: v.cover || '', v: nf(v.views), h: '@' + v.handle, age: ago(v.publishedAt), href: '/app/videos/' + v.id }));
      ff = (D.formats || []).slice(0, 4).map((f) => ({ ico: f.kind === 'sound' ? SON : TXT, t: f.kind === 'sound' ? 'Son « ' + f.label + ' »' : '« ' + f.label + ' »',
        m: f.accounts + ' comptes', x: f.medX ? xf(f.medX) + ' en médiane' : '', o: nf(f.maxViews || 0) + ' vues au mieux', href: '/app/formats/' + f.id }));
      fm = (D.markets || []).map(([c, p], i) => ({ c: c === 'XX' ? '…' : c, l: ML[c] || c, v: nf((D.views30 || 0) * p / 100), p: p + ' %', w: p + '%', bg: i === 0 ? 'var(--accent)' : 'var(--line-strong)' }));
      fc = (D.creators || []).slice(0, 6).map((c) => ({ av: c.avatar || '', noav: true, h: '@' + c.handle, mk: c.market && c.market !== 'XX' ? c.market : '',
        s: nf(c.fans || 0) + ' abonnés' + (c.median ? ' · ' + nf(c.median) + ' vues médianes' : ''), page: !!c.page, nopage: !c.page, href: '/app/createurs/' + c.handle }));
      secs = secs.map((x, i) => Object.assign({}, x, { n: ['', String(D.videoCount || (D.videos || []).length), String((D.formats || []).length), (D.accounts || 0).toLocaleString('en-US').replace(/,/g, '\u202f')][i] || '' }));
    }
    return { a, secs, wk, fv, ff, fm, fc, app, hasFv: fv.length > 0, hasFf: ff.length > 0, hasFc: fc.length > 0 };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("a", { "class": "sw-btn sw-btn-icon", "href": "/app/apps", "aria-label": "Retour", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-left: -10px;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              $t($v.app?.name)
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
        $h("div", { "style": "padding: 20px 20px 0; display: flex; flex-direction: column; gap: 14px;" },
          $h("div", { "style": "display: flex; align-items: center; gap: 14px;" },
            $h("span", { "class": `sw-app-icon ${$t($v.a?.blank)}`, "style": "width: 68px; height: 68px; border-radius: 18px;" },
              ($v.a?.logo) ? [
                $h("img", { "class": "sw-logo-img", "src": $v.a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
              ] : null,
              ($v.a?.nologo) ? [
                $h("svg", { "width": "34", "height": "34", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ] : null
            ),
            $h("span", { "style": "display: flex; flex-direction: column; gap: 5px;" },
              $h("span", { "style": "font-family: var(--font-display); font-size: 30px; font-weight: 700; letter-spacing: -0.04em;" },
                $t($v.app?.name)
              ),
              $h("span", { "style": "display: flex; align-items: center; gap: 6px; flex-wrap: wrap;" },
                $h("span", { "class": "sw-badge", "style": "height: 24px;" },
                  $t($v.app?.niche)
                ),
                ($v.app?.hasDelta) ? [
                  $h("span", { "class": "sw-badge sw-badge-accent", "style": "height: 24px;" },
                    $t($v.app?.delta)
                  )
                ] : null
              )
            )
          ),
          ($v.app?.hasDesc) ? [
            $h("p", { "style": "margin: 0; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
              $t($v.app?.desc)
            )
          ] : null,
          $h("div", { "style": "display: flex; gap: 8px;" },
            ($v.app?.hasStore) ? [
              $h("a", { "class": "sw-pill", "href": $v.app?.store, "target": "_blank", "rel": "noopener", "style": "height: 44px;" },
                "App Store"
              )
            ] : null,
            $h("a", { "class": "sw-pill", "href": $v.app?.play, "target": "_blank", "rel": "noopener", "style": "height: 44px;" },
              "Google Play"
            ),
            ($v.app?.hasSite) ? [
              $h("a", { "class": "sw-pill", "href": $v.app?.site, "target": "_blank", "rel": "noopener", "style": "height: 44px;" },
                "Site"
              )
            ] : null
          ),
          $h("div", { "style": "display: flex; justify-content: center; align-items: center; gap: 10px;" },
            $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.toggleFollow, "aria-pressed": $v.followOn },
              $t($v.followLabel),
              $h("span", { "class": "sw-btn-tile" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.openAj, "aria-label": "Ajouter à un dossier", "style": "flex-shrink: 0; width: 52px; height: 52px; box-shadow: inset 0 0 0 1px var(--line);" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          )
        ),
        $h("div", { "style": "margin-top: 18px; border-bottom: 1px solid var(--line);" },
          $h("div", { "class": "sw-tabs sw-tabs-line", "role": "tablist", "style": "border-bottom: 0; gap: 22px; overflow-x: auto; padding: 0 20px; scrollbar-width: none;" },
            ($l($v.secs)).map((s) => [
              $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": s?.on, "href": s?.href, "onClick": s?.pick, "style": "flex-shrink: 0; display: inline-flex; gap: 6px; align-items: center; text-decoration: none;" },
                $t(s?.l),
                $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; color: var(--ink-faint);" },
                  $t(s?.n)
                )
              )
            ])
          )
        ),
        $h("div", { "style": "padding: 18px 20px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
          $h("span", { "class": "sw-card", "style": "border-radius: 18px; padding: 14px; display: flex; flex-direction: column; gap: 4px;" },
            $h("span", { "class": "sw-tile-label", "style": "min-height: 30px; line-height: 15px;" },
              "Vues 30 j"
            ),
            $h("span", { "class": "sw-tile-value", "style": "font-size: 21px; color: var(--ink);" },
              $t($v.app?.v30)
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              $t($v.app?.ig)
            )
          ),
          $h("span", { "class": "sw-card", "style": "border-radius: 18px; padding: 14px; display: flex; flex-direction: column; gap: 4px;" },
            $h("span", { "class": "sw-tile-label", "style": "min-height: 30px; line-height: 15px;" },
              "Revenus estimés"
            ),
            $h("span", { "class": "sw-tile-value", "style": "font-size: 19px;" },
              $h("span", { "style": "white-space: nowrap;" },
                $h("span", { "style": "font-size: 11px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                  "Entre "
                ),
                $t($v.app?.lo),
                $h("span", { "style": "font-size: 11px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                  " et "
                ),
                $t($v.app?.hi)
              )
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              "sur 30 jours"
            )
          ),
          $h("span", { "class": "sw-card", "style": "border-radius: 18px; padding: 14px; display: flex; flex-direction: column; gap: 4px;" },
            $h("span", { "class": "sw-tile-label", "style": "min-height: 30px; line-height: 15px;" },
              "Cette semaine"
            ),
            $h("span", { "class": "sw-tile-value", "style": "font-size: 21px; color: var(--accent);" },
              $t($v.app?.week)
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              $t($v.app?.wd)
            )
          ),
          $h("span", { "class": "sw-card", "style": "border-radius: 18px; padding: 14px; display: flex; flex-direction: column; gap: 4px;" },
            $h("span", { "class": "sw-tile-label", "style": "min-height: 30px; line-height: 15px;" },
              "Comptes qui la poussent"
            ),
            $h("span", { "class": "sw-tile-value", "style": "font-size: 21px; color: var(--ink);" },
              $t($v.app?.acc)
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              $t($v.app?.ppw)
            )
          )
        ),
        $h("div", { "id": "m-vues", "class": "sw-card", "style": "scroll-margin-top: 72px; margin: 12px 20px 0; border-radius: 22px; padding: 16px; display: flex; flex-direction: column; gap: 10px;" },
          $h("span", { "style": "font-size: 15px; font-weight: 700;" },
            "Vues par semaine de publication"
          ),
          $h("div", { "style": "display: flex; align-items: flex-end; gap: 8px; height: 150px;" },
            ($l($v.wk)).map((b) => [
              $h("span", { "style": "flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 5px; height: 100%;" },
                $h("span", { "style": `font-size: 10px; font-weight: 700; color: ${$t(b?.ink)};` },
                  $t(b?.v)
                ),
                $h("span", { "style": `width: 100%; height: ${$t(b?.h)}px; border-radius: 7px 7px 3px 3px; background: ${$t(b?.bg)};` })
              )
            ])
          ),
          $h("div", { "style": "display: flex; gap: 8px;" },
            ($l($v.wk)).map((b) => [
              $h("span", { "style": "flex: 1; text-align: center; font-size: 10px; color: var(--ink-faint);" },
                $t(b?.l)
              )
            ])
          )
        ),
        ($v.hasFv) ? [
          $h("div", { "style": "padding-top: 26px; display: flex; flex-direction: column; gap: 12px;" },
            $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
              $h("h2", { "id": "m-vid", "style": "scroll-margin-top: 72px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
                "Ses vidéos qui cartonnent"
              )
            ),
            $h("div", { "style": "display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
              ($l($v.fv)).map((v) => [
                $h("a", { "href": v?.href, "style": "flex-shrink: 0; width: 132px; display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: inherit;" },
                  $h("span", { "class": "sw-video", "style": "display: block; border-radius: 16px;" },
                    $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-video-foot" },
                      $h("span", { "class": "sw-video-views", "style": "font-size: 18px;" },
                        $t(v?.v)
                      )
                    )
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(v?.h)
                  ),
                  $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                    $t(v?.age)
                  )
                )
              ])
            )
          )
        ] : null,
        ($v.hasFf) ? [
          $h("div", { "style": "padding-top: 26px; display: flex; flex-direction: column; gap: 10px;" },
            $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
              $h("h2", { "id": "m-fmt", "style": "scroll-margin-top: 72px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
                "Les formats qui marchent chez elle"
              )
            ),
            $h("div", { "style": "padding: 0 20px; display: flex; flex-direction: column; gap: 8px;" },
              ($l($v.ff)).map((f) => [
                $h("a", { "href": f?.href, "class": "sw-card", "style": "border-radius: 18px; padding: 14px; display: flex; gap: 12px; align-items: flex-start; text-decoration: none; color: inherit;" },
                  $h("span", { "style": "width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                    $h("span", { "style": "font-size: 14px; font-weight: 600; line-height: 1.35;" },
                      $t(f?.t)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t(f?.m)
                    ),
                    $h("span", { "style": "font-size: 12px;" },
                      $h("span", { "style": "font-weight: 700; color: var(--accent);" },
                        $t(f?.x)
                      ),
                      " ",
                      $h("span", { "style": "color: var(--ink-faint);" },
                        "· ", $t(f?.o)
                      )
                    )
                  )
                )
              ])
            )
          )
        ] : null,
        $h("div", { "style": "padding-top: 26px; display: flex; flex-direction: column; gap: 10px;" },
          $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
            $h("h2", { "style": "margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
              "Où ses vues se font"
            )
          ),
          $h("div", { "style": "padding: 0 20px; display: flex; flex-direction: column; gap: 10px;" },
            ($l($v.fm)).map((m) => [
              $h("span", { "style": "display: flex; flex-direction: column; gap: 5px;" },
                $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px;" },
                  $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                    $t(m?.c)
                  ),
                  $h("span", { "style": "flex: 1; color: var(--ink-soft);" },
                    $t(m?.l)
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t(m?.v)
                  ),
                  $h("span", { "style": "width: 36px; text-align: right; color: var(--ink-faint);" },
                    $t(m?.p)
                  )
                ),
                $h("span", { "style": "height: 6px; border-radius: 3px; background: var(--track); overflow: hidden;" },
                  $h("span", { "style": `display: block; height: 100%; width: ${$t(m?.w)}; background: ${$t(m?.bg)};` })
                )
              )
            ])
          )
        ),
        ($v.hasFc) ? [
          $h("div", { "style": "padding-top: 26px; display: flex; flex-direction: column; gap: 10px;" },
            $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
              $h("h2", { "id": "m-cr", "style": "scroll-margin-top: 72px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
                "Les créateurs qui la poussent"
              )
            ),
            $h("div", { "class": "sw-card", "style": "margin: 0 20px; border-radius: 20px; padding: 4px 0;" },
              ($l($v.fc)).map((c) => [
                (c?.page) ? [
                  $h("a", { "href": c?.href, "style": "display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                    $h("span", { "style": "width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                      (c?.av) ? [
                        $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      (c?.noav) ? [
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                          $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                        )
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                      $h("span", { "style": "display: flex; align-items: center; gap: 6px;" },
                        $h("span", { "style": "font-size: 15px; font-weight: 600;" },
                          $t(c?.h)
                        ),
                        (c?.mk) ? [
                          $h("span", { "class": "sw-flag", "style": "width: 22px; height: 16px; font-size: 8px;" },
                            $t(c?.mk)
                          )
                        ] : null
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t(c?.s)
                      )
                    ),
                    $h("span", { "style": "color: var(--ink-faint); display: inline-flex;" },
                      $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                ] : null,
                (c?.nopage) ? [
                  $h("div", { "style": "display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                    $h("span", { "style": "width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                      (c?.av) ? [
                        $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      (c?.noav) ? [
                        $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                          $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                        )
                      ] : null
                    ),
                    $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                      $h("span", { "style": "display: flex; align-items: center; gap: 6px;" },
                        $h("span", { "style": "font-size: 15px; font-weight: 600;" },
                          $t(c?.h)
                        ),
                        (c?.mk) ? [
                          $h("span", { "class": "sw-flag", "style": "width: 22px; height: 16px; font-size: 8px;" },
                            $t(c?.mk)
                          )
                        ] : null
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                        $t(c?.s)
                      )
                    )
                  )
                ] : null
              ])
            )
          )
        ] : null,
        $h("nav", { "aria-label": "Navigation principale", "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding: 6px 6px max(10px, env(safe-area-inset-bottom)); box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); background: rgba(8,11,18,0.9); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-top: 1px solid var(--line);" },
          $h("a", { "href": "/app", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Accueil"
          ),
          $h("a", { "href": "/app/apps", "aria-current": "page", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--accent); font-size: 11px; font-weight: 700;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          $h("a", { "href": "/app/formats", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Formats"
          ),
          $h("a", { "href": "/app/createurs", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Créateurs"
          ),
          $h("a", { "href": "/app/dossiers", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
