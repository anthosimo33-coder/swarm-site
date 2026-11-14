// Généré par scripts/dc2preact.py depuis design/app/MCreateurFiche.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MFicheCreateur extends DCLogic {

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
    // Suivre : sur le site, follows.creators (saved) ; sur le canevas, l'état local.
    const fid = (P.data && P.data.handle) || (P.params && P.params.handle) || (live ? '' : 'zinedine.gsbb');
    const fw = live ? P.saved('follows') : null;
    const f = live ? !!(fw && (fw.creators || []).indexOf(fid) >= 0) : !!st.follow;
    const toggleFollow = () => {
      if (!live) return this.setState({ follow: !f });
      const cur = P.saved('follows');
      if (cur === undefined || !fid) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.creators || [];
      next.creators = l.indexOf(fid) >= 0 ? l.filter((x) => x !== fid) : [fid].concat(l);
      P.save('follows', next);
    };
    return Object.assign({ followOn: f ? 'true' : 'false', toggleFollow, ajItem: fid ? { kind: 'creator', id: fid, label: '@' + fid, cover: null } : null }, { followInk: f ? 'var(--accent)' : 'var(--ink-muted)' });
  }

  baseVals() {

    let z = {"av": "/media/app/av-zinedine.gsbb.jpg", "noav": false, "h": "@zinedine.gsbb", "bio": "L'ia c'est 👇", "fans": "16 200", "med": "7 792", "p7": "3 vidéos en 7 j", "views": "4,7 M", "best": "2,85 M", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "hits": 4};
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let vids = [{"src": "/media/app/v-7706797723294420256.jpg", "v": "2 k", "raw": 2042.0, "x": "0,3×", "xr": 0.2620636550308008, "hit": false, "date": "11/11", "ago": "il y a 2 j", "t": "Job Alimentaire ❌ Vidéo YTB pour enfants ✅", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7706656919259319585.jpg", "v": "5 k", "raw": 4676.0, "x": "0,6×", "xr": 0.6001026694045175, "hit": false, "date": "10/11", "ago": "il y a 2 j", "t": "Il vit en 2098 😳", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7704799316795477280.jpg", "v": "2 k", "raw": 1635.0, "x": "0,2×", "xr": 0.2098305954825462, "hit": false, "date": "05/11", "ago": "il y a 7 j", "t": "Shortfy.io", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7703924847239269664.jpg", "v": "8 k", "raw": 8017.0, "x": "1×", "xr": 1.028875770020534, "hit": false, "date": "03/11", "ago": "il y a 9 j", "t": "Shortfy.io", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7702800263538560289.jpg", "v": "791 k", "raw": 791173.0, "x": "102×", "xr": 101.53657597535934, "hit": true, "date": "31/10", "ago": "il y a 12 j", "t": "Shortfy.io", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7702109191736986913.jpg", "v": "191 k", "raw": 190605.0, "x": "24×", "xr": 24.4616273100616, "hit": true, "date": "29/10", "ago": "il y a 14 j", "t": "Vous avez plus d’excuses, il vient d’expliquer comment faire en même p", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7701347136323013921.jpg", "v": "841 k", "raw": 841262.0, "x": "108×", "xr": 107.96483572895278, "hit": true, "date": "27/10", "ago": "il y a 16 j", "t": "J’ai enregistré pour vous, me remerciez pas 🤝 #Argent #shortfy #TikTok", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M", "raw": 2848785.0, "x": "366×", "xr": 365.6038244353183, "hit": true, "date": "24/10", "ago": "il y a 19 j", "t": "Pourquoi personne nous apprend ça à l’école? 😭 #Argent #shortfy #TikTo", "badge": "var(--blue-600)"}, {"src": "/media/app/v-7699871031615360288.jpg", "v": "8 k", "raw": 7567.0, "x": "1×", "xr": 0.9711242299794661, "hit": false, "date": "23/10", "ago": "il y a 20 j", "t": "Shortfy.io", "badge": "rgba(5,7,12,0.55)"}, {"src": "/media/app/v-7699388137767734561.jpg", "v": "7 k", "raw": 6941.0, "x": "0,9×", "xr": 0.8907854209445585, "hit": false, "date": "22/10", "ago": "il y a 22 j", "t": "c’est une dinguerie ce qu’il fait 🤯", "badge": "rgba(5,7,12,0.55)"}];
    vids = vids.map((x) => Object.assign({}, x, { href: '/app/videos/' + vkey(x.src) }));
    z = Object.assign({ appLine: 'Pousse Shortfy', hasApp: true, niche: 'Side hustle', flag: 'FR', tt: 'https://www.tiktok.com/@zinedine.gsbb', bestX: '366× sa normale',
      hasTip: true, tipB: '4 vidéos sur 10 à plus de 10× sa normale,',
      tipT: 'toutes entre le 24/10 et le 31/10. Depuis, aucune n’a dépassé 2×.', nv: '10' }, z);
    // Sur le site : le créateur (document « creator:<handle> »), lu comme CreateurFicheA.
    const D = this.props && this.props.data;
    if (D && D.handle) {
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
      const xf = (x) => (x < 0.05 ? '< 0,1' : x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const pct = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + '\u202f%');
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / 86400000)); return d === 0 ? 'aujourd’hui' : 'il y a ' + d + '\u202fj'; };
      const MKN = (c) => c === 'XX' ? 'Pays inconnu' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
      // « depuis la France », « depuis les États-Unis », « depuis l’Allemagne », « depuis Singapour » ; rien pour un pays inconnu.
      const DEPUIS = (n) => { n = String(n || ''); if (!n || n === 'Pays inconnu' || /^[A-Z]{2}$/.test(n)) return ''; if (/^(Singapour|Chypre|Cuba|Madagascar|Taïwan|Porto Rico|Malte|Haïti|Bahreïn|Israël|Monaco|Oman|Hong Kong|Maurice|La Réunion|Djibouti)$/.test(n)) return 'depuis ' + n;
        if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return 'depuis les ' + n; if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return 'depuis l’' + n;
        return 'depuis ' + (/e$/.test(n.split(/[\s-]/)[0]) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize)$/.test(n) ? 'la ' : 'le ') + n; };
      // La langue de ses vidéos quand ce n'en est pas une de son pays (otherLang, calculé par la synchro) : « en espagnol ».
      const LANGN = (l) => { if (!l) return ''; try { return 'en ' + new Intl.DisplayNames(['fr'], { type: 'language' }).of(l); } catch (e) { return ''; } };
      const ML = new Proxy({}, { get: (o, c) => MKN(String(c)) });
      const ico = (o) => ({ logo: (o && o.icon) || '', nologo: !(o && o.icon), blank: o && o.icon ? '' : 'sw-app-blank' });
      const flags = (cs) => (cs || []).filter((c) => c).slice(0, 3).map((c) => ({ c }));
      const names = (as) => { const n = (as || []).map((a) => a.name); return n.length > 3 ? n.slice(0, 2).join(', ') + ' et ' + (n.length - 2) + ' autres' : n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : n.join(''); };
      const TXT = 'M5 6h14M12 6v13M9 19h6', SON = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
      const DAY = 86400000;
      const big = (n) => (n >= 1e6 ? nf(n) : Math.round(n).toLocaleString('en-US').replace(/,/g, '\u202f'));
      const V = (D.videos || []).slice().sort((p, q) => q.publishedAt - p.publishedAt);
      const ref = D.updatedAt || Date.now();
      const a = D.app;
      const n7 = Math.max(D.posts7d || 0, V.filter((x) => x.publishedAt >= ref - 7 * DAY).length);
      const top = V.concat(D.best || []).reduce((m, x) => (!m || x.views > m.views ? x : m), null);
      const hits = V.filter((x) => x.x >= 10);
      // Pas de moyen de contacter un créateur : les e-mails et numéros de sa bio ne sont pas repris.
      const noContact = (s) => String(s || '').replace(/(?:📧|✉️?|📩|📬|e-?mail|mail|contact|business|pro)?\s*[:：]?\s*[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi, ' ').replace(/\+?\d[\d .-]{7,}\d/g, ' ').replace(/\s+/g, ' ').trim();
      z = Object.assign({}, z, { av: D.avatar || '', noav: true, h: '@' + D.handle, bio: noContact(D.bio),
        fans: typeof D.fans === 'number' ? big(D.fans) : '—', med: D.median ? big(D.median) : '—', p7: n7 ? n7 + (n7 > 1 ? ' vidéos' : ' vidéo') + ' en 7 j' : 'Rien en 7 j',
        best: top ? nf(top.views) : '—', bestX: top && top.x ? xf(top.x) + ' sa normale' : (top ? day(top.publishedAt) : ''),
        app: a ? ico(a) : { logo: '', nologo: true, blank: 'sw-app-blank' }, hasApp: !!a, appLine: a ? 'Pousse ' + a.name : '', niche: (a && a.niche) || '',
        flag: D.market || '', lang: LANGN(D.otherLang), tt: 'https://www.tiktok.com/@' + D.handle,
        hasTip: hits.length > 0 && V.length > 1, tipB: hits.length + (hits.length > 1 ? ' vidéos' : ' vidéo') + ' sur ' + V.length + ' à plus de 10× sa normale,',
        tipT: hits.length ? (hits.length > 1 ? 'la dernière le ' : 'le ') + day(hits[0].publishedAt) + '.' : '', nv: String(V.length) });
      vids = V.map((x) => { const hit = x.x >= 10;
        return { src: x.cover || '', v: nf(x.views), x: typeof x.x === 'number' ? xf(x.x) : '', hit, date: day(x.publishedAt), ago: ago(x.publishedAt), t: x.hook || '',
          badge: hit ? 'var(--blue-600)' : 'rgba(5,7,12,0.55)', href: '/app/videos/' + x.id, car: x.carousel ? String(x.carousel) : '' }; });
    }
    return { z, vids, hasVids: vids.length > 0 };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("a", { "class": "sw-btn sw-btn-icon", "href": "/app/createurs", "aria-label": "Retour", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-left: -10px;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              $t($v.z?.h)
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
        $h("div", { "style": "padding: 22px 20px 0; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;" },
          $h("span", { "style": "padding: 4px; border-radius: 50%; background: conic-gradient(from 200deg, var(--blue-400), var(--blue-700), var(--blue-400));" },
            $h("span", { "style": "width: 96px; height: 96px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); box-shadow: 0 0 0 4px var(--surface); position: relative;" },
              ($v.z?.av) ? [
                $h("img", { "src": $v.z?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
              ] : null,
              ($v.z?.noav) ? [
                $h("svg", { "width": "48", "height": "48", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                  $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                )
              ] : null
            )
          ),
          $h("h1", { "style": "margin: 6px 0 0; font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.04em;" },
            $t($v.z?.h)
          ),
          $h("span", { "style": "font-size: 15px; color: var(--ink-muted);" },
            $t($v.z?.bio)
          ),
          $h("span", { "style": "display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;" },
            ($v.z?.hasApp) ? [
              $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-soft);" },
                $h("span", { "class": `sw-app-icon ${$t($v.z?.app?.blank)}`, "style": "width: 20px; height: 20px; border-radius: 6px;" },
                  ($v.z?.app?.logo) ? [
                    $h("img", { "class": "sw-logo-img", "src": $v.z?.app?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  ($v.z?.app?.nologo) ? [
                    $h("svg", { "width": "10", "height": "10", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ] : null
                ),
                $t($v.z?.appLine)
              )
            ] : null,
            ($v.z?.niche) ? [
              $h("span", { "class": "m-tagn" },
                $h("span", { "class": "m-ic", "data-i": $v.z?.niche, "aria-hidden": "true" }),
                $t($v.z?.niche)
              )
            ] : null,
            ($v.z?.flag) ? [
              $h("span", { "class": "sw-flag", "data-c": $v.z?.flag, "aria-hidden": "true" })
            ] : null,
            ($v.z?.lang) ? [
              $h("span", { "style": "font-size: 12px; color: var(--ink-soft); white-space: nowrap;" },
                $t($v.z?.lang)
              )
            ] : null
          ),
          $h("span", { "style": "display: flex; gap: 6px;" },
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.toggleFollow, "aria-label": "Suivre ce compte", "aria-pressed": $v.followOn, "style": `width: 44px; height: 44px; flex-shrink: 0; color: ${$t($v.followInk)};` },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.openAj, "aria-label": "Ajouter à un dossier", "style": "width: 44px; height: 44px; flex-shrink: 0;" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("a", { "class": "sw-btn sw-btn-icon", "href": $v.z?.tt, "target": "_blank", "rel": "noopener", "aria-label": "Ouvrir le profil", "style": "width: 44px; height: 44px; flex-shrink: 0;" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          )
        ),
        $h("div", { "style": "padding: 14px 20px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
          $h("span", { "class": "sw-tile" },
            $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; " },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Abonnés"
            ),
            $h("span", { "class": "sw-tile-value" },
              $t($v.z?.fans)
            )
          ),
          $h("span", { "class": "sw-tile" },
            $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; " },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M3 3v18h18M7 15l4-4 3 3 5-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Vues médianes"
            ),
            $h("span", { "class": "sw-tile-value" },
              $t($v.z?.med)
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              "sa normale"
            )
          ),
          $h("span", { "class": "sw-tile" },
            $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; " },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M3 12h4l3-8 4 16 3-8h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Rythme"
            ),
            $h("span", { "class": "sw-tile-value", "style": "font-size: 18px;" },
              $t($v.z?.p7)
            )
          ),
          $h("span", { "class": "sw-tile" },
            $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; " },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M13 2L4 14h7l-1 8 9-12h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Meilleure vidéo"
            ),
            $h("span", { "class": "sw-tile-value", "style": "color: var(--accent);" },
              $t($v.z?.best)
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              $t($v.z?.bestX)
            )
          )
        ),
        ($v.z?.hasTip) ? [
          $h("div", { "style": "margin: 14px 20px 0; padding: 12px 14px; border-radius: 16px; display: flex; gap: 12px; align-items: flex-start; background: linear-gradient(90deg, var(--accent-soft), transparent); border: 1px solid var(--accent-edge);" },
            $h("span", { "style": "width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--blue-600); color: #FFFFFF;" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "font-size: 13px; line-height: 1.5; color: var(--ink-soft);" },
              $h("span", { "style": "font-weight: 700; color: var(--ink);" },
                $t($v.z?.tipB)
              ),
              " ", $t($v.z?.tipT)
            )
          )
        ] : null,
        $h("div", { "style": "padding: 24px 20px 0; display: flex; align-items: baseline; gap: 8px;" },
          $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
              $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Ses vidéos"
          ),
          $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
            $t($v.z?.nv)
          )
        ),
        $h("div", { "style": "padding: 12px 20px 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px;" },
          ($l($v.vids)).map((v) => [
            $h("a", { "href": v?.href, "class": "sw-video", "style": "display: block; border-radius: 12px;" },
              $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
              $h("span", { "class": "sw-video-shade" }),
              (v?.car) ? [
                $h("span", { "title": `Carrousel de ${$t(v?.car)} photos`, "aria-label": "Carrousel", "style": "position: absolute; top: 6px; right: 6px; z-index: 2; height: 20px; padding: 0 7px; border-radius: 999px; background: rgba(5,7,12,0.62); color: #FFFFFF; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;" },
                  $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M8 8h12v12H8zM4 16V4h12", "fill": "none", "stroke": "currentColor", "stroke-width": "2.6", "stroke-linejoin": "round" })
                  ),
                  $t(v?.car)
                )
              ] : null,
              $h("span", { "class": "sw-badge", "style": `position: absolute; top: 6px; left: 6px; height: 20px; padding: 0 6px; font-size: 10px; background: ${$t(v?.badge)}; color: #FFFFFF;` },
                $t(v?.x)
              ),
              $h("span", { "style": "position: absolute; left: 7px; bottom: 6px; display: flex; flex-direction: column;" },
                $h("span", { "style": "font-family: var(--font-display); font-size: 15px; font-weight: 700; color: #FFFFFF;" },
                  $t(v?.v)
                ),
                $h("span", { "style": "font-size: 10px; color: #E4E7EC;" },
                  $t(v?.date)
                )
              )
            )
          ])
        ),
        $h("nav", { "aria-label": "Navigation principale", "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding: 6px 6px max(10px, env(safe-area-inset-bottom)); box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); background: rgba(8,11,18,0.9); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-top: 1px solid var(--line);" },
          $h("a", { "href": "/app", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Accueil"
          ),
          $h("a", { "href": "/app/apps", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          $h("a", { "href": "/app/formats", "aria-current": "false", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--ink-faint); font-size: 11px; font-weight: 500;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Formats"
          ),
          $h("a", { "href": "/app/createurs", "aria-current": "page", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--accent); font-size: 11px; font-weight: 700;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
