// Généré par scripts/dc2preact.py depuis design/app/MVideo.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MVideo extends DCLogic {
  // La courbe est dessinée à la largeur réelle de l'écran (le texte garde 12 à 16 px).
  componentDidMount() { this.fit = () => { const w = this.box ? Math.round(this.box.clientWidth) : 0; if (w && w !== (this.state || {}).cw) this.setState({ cw: w }); }; this.fit(); window.addEventListener('resize', this.fit); }
  componentWillUnmount() { window.removeEventListener('resize', this.fit); }

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
    const vid0 = (P.data && P.data.id) || (P.params && P.params.id) || '';
    const fsv = typeof P.saved === 'function' ? P.saved('folders') : null;
    const kept = !!vid0 && Array.isArray(fsv) && fsv.some((x) => (x.items || []).some((i) => i.kind === 'video' && i.id === vid0));
    return { ajItem: vid0 ? { kind: 'video', id: vid0, label: b.vid.hook || b.vid.who || '', cover: (b.v && b.v.src) || null } : null, saveLabel: kept ? 'Dans tes dossiers' : 'Enregistrer dans un dossier', setChartBox: (el) => { this.box = el; } };
  }

  baseVals() {
    let v = {"src": "/media/app/v-7705929733220994337.jpg"};
    let facts = [{"k": "Texte à l’écran", "v": "« POV: tienes EXAMEN ORAL y no has estudiado NADA », puis « la aplicación que uso es Astra Ai »"}, {"k": "Ce qui est dit", "v": "Un oral en visio. Elle fait répéter la question, « que se ha cortado », puis répond sans faute sur la glycolyse."}, {"k": "Son", "v": "original sound - learnwithjoel1"}, {"k": "Légende", "v": "« OTRO EXAMEN APROBADO, así de fácil » #studyhacks #buenasnotas #examenes"}, {"k": "Réactions", "v": "52,6 k j’aime · 3,2 k enregistrements · 846 partages · 325 commentaires"}];
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let nxt = [{"src": "/media/app/v-7705368869250075925.jpg", "x": "2 333×", "t": "TKA SD kelas 6 persiapannya bisa dimulai disini", "v": "2,0 M"}, {"src": "/media/app/v-7706010190566542612.jpg", "x": "1 226×", "t": "Mình sẽ xoá vid này trong 24h nữa", "v": "809 k"}, {"src": "/media/app/v-7706101547570171143.jpg", "x": "455×", "t": "Bí mật giúp bạn học giỏi hơn đứa mình ghét", "v": "1,2 M"}];
    nxt = nxt.map((x) => Object.assign({}, x, { href: '/app/videos/' + vkey(x.src) }));
    let au = { av: '/media/app/av-learnwithjoel1.jpg', noav: true };
    let vid = { embed: 'https://www.tiktok.com/player/v1/7705929733220994337?autoplay=1&rel=0&description=0&music_info=0&native_context_menu=0', pos: '1 sur 14', back: '/app/apps/astraai', hook: 'POV: tienes EXAMEN ORAL y no has estudiado NADA', hasApp: true, appName: 'Astra AI', where: 'Espagne · 08/11', mk: 'ES', paid: false, paidNote: '',
      views: '1,87 M', who: '@learnwithjoel1 · 12,2 k abonnés', hasDur: true, dur: '0:49', url: 'https://www.tiktok.com/@learnwithjoel1/video/7705929733220994337', hasX: true, x: '65×',
      story: '1,87 M vues en 92 heures, alors que le compte fait d’habitude 28,5 k vues. +38 % entre H+52 et H+92.',
      appHref: '/app/apps/astraai', appLink: 'Voir l’app Astra AI', copyText: 'POV: tienes EXAMEN ORAL y no has estudiado NADA' };
    // Sur le site : la vidéo (document « video:<id> »), lue comme VideoA ; « Ensuite » = la suite de la liste de lecture de l'app.
    const D = this.props && this.props.data;
    if (D && D.id) {
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
      const list = D.playlist || [];
      const idx = list.indexOf(D.id);
      const H = (ms) => Math.max(0, Math.round((ms - D.publishedAt) / 3600000));
      const hours = H(Date.now());
      const snaps = (D.snapshots || []).filter((p) => p.at >= D.publishedAt);
      let growth = '';
      if (snaps.length >= 2 && snaps[0].views > 0) {
        const g = (snaps[snaps.length - 1].views - snaps[0].views) / snaps[0].views;
        growth = ' ' + pct(g) + ' entre H+' + H(snaps[0].at) + ' et H+' + H(snaps[snaps.length - 1].at) + '.';
      }
      const dur = Math.round(D.durationSec || 0);
      au = { av: D.avatar || '', noav: true };
      vid = { embed: D.platform === 'instagram' ? 'https://www.instagram.com/reel/' + String(D.id).replace(/^ig:/, '') + '/embed/'
          : /^\d+$/.test(String(D.id)) ? 'https://www.tiktok.com/player/v1/' + D.id + '?autoplay=1&rel=0&description=0&music_info=0&native_context_menu=0' : '',
        pos: idx >= 0 ? (idx + 1) + ' sur ' + list.length : 'Vidéo', back: D.app ? '/app/apps/' + D.app.slug : '/app/apps',
        hook: D.hook || D.caption || '@' + D.handle, hasApp: !!D.app, appName: D.app ? D.app.name : '',
        // Placement payé : le compte a été payé pour cette vidéo, ce n'est pas un créateur de l'app.
        paid: !!D.paid, paidNote: 'Ce compte a été payé pour cette vidéo : elle compte dans les vues de ' + (D.app ? D.app.name : 'l’app') + ', mais il n’est pas compté parmi ses créateurs.',
        mk: D.market || '', where: [ML[D.market] || '', D.publishedAt ? day(D.publishedAt) : ''].filter(Boolean).join(' · '), views: nf(D.views || 0),
        who: '@' + D.handle + (D.fans ? ' · ' + nf(D.fans) + ' abonnés' : ''), hasDur: dur > 0, dur: Math.floor(dur / 60) + ':' + String(dur % 60).padStart(2, '0'),
        url: D.url || 'https://www.tiktok.com/@' + D.handle, hasX: !!D.x, x: D.x ? xf(D.x) : '',
        story: nf(D.views || 0) + ' vues ' + (hours >= 48 ? 'en ' + Math.round(hours / 24) + ' jours' : 'en ' + hours + ' heures')
          + (D.normal ? ', alors que le compte fait d’habitude ' + nf(D.normal) + ' vues.' : '.') + growth,
        appHref: D.app ? '/app/apps/' + D.app.slug : '/app/apps', appLink: D.app ? 'Voir l’app ' + D.app.name : '',
        copyText: [D.hook, D.caption, D.music ? 'Son : ' + D.music : ''].filter(Boolean).join('\n') || '@' + D.handle };
      v = { src: D.cover || '' };
      const rr = (n) => (n === null || n === undefined ? '' : nf(n));
      const said = D.transcript && D.transcript.length > 280 ? D.transcript.slice(0, 280).replace(/\s+\S*$/, '') + ' …' : D.transcript;
      facts = [['Texte à l’écran', D.hook], ['Ce qui est dit', said], ['Son', D.music], ['Légende', D.caption],
        ['Réactions', [rr(D.likes) && rr(D.likes) + ' j’aime', rr(D.saves) && rr(D.saves) + ' enregistrements', rr(D.shares) && rr(D.shares) + ' partages', rr(D.comments) && rr(D.comments) + ' commentaires'].filter(Boolean).join(' · ')]]
        .filter((f) => f[1]).map((f) => ({ k: f[0], v: f[1] }));
      const ap = D.app && this.props.get ? this.props.get('app:' + D.app.slug) : null;
      const cards = ap && ap.videos ? ap.videos : [];
      nxt = cards.filter((c) => c.id !== D.id).slice(Math.max(0, idx), Math.max(0, idx) + 3).map((c) => ({ src: c.cover || '', x: c.x ? xf(c.x) : nf(c.views),
        t: c.hook || '@' + c.handle, v: nf(c.views), href: '/app/videos/' + c.id }));
    }
    // Courbe : la publication, les relevés de vues, la normale du compte (modèle VideoA, makeChart), à la largeur réelle.
    const CW = Math.max(240, Math.min(600, (this.state || {}).cw || 314));
    const nfc = (n) => (n >= 999500 ? (n / 1e6).toFixed(2).replace(/0$/, '').replace('.', ',') + '\u202fM' : n >= 999.5 ? (n / 1e3).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fk' : String(Math.round(n)));
    const makeChart = (obs, views, normal) => {
      const W = CW, Y0 = 160, Y1 = 34, f = (n) => n.toFixed(1);
      const lastH = Math.max(1, obs.length ? obs[obs.length - 1].h : 1);
      const vmax = Math.max(1, views, normal || 0, ...obs.map((p) => p.v)) * 1.14;
      const X = (hh) => 6 + (hh / lastH) * (W - 12), Yv = (v) => Y0 - (v / vmax) * (Y0 - Y1);
      const PT = [{ x: X(0), y: Y0 }].concat(obs.map((p) => ({ x: X(p.h), y: Yv(p.v) })));
      const smooth = (pts) => (pts.length < 2 ? '' : pts.slice(1).reduce((d, q, i) => { const p = pts[i], dx = (q.x - p.x) / 2.4;
        return d + ' C' + f(p.x + dx) + ' ' + f(p.y) + ' ' + f(q.x - dx) + ' ' + f(q.y) + ' ' + f(q.x) + ' ' + f(q.y); }, 'M' + f(pts[0].x) + ' ' + f(pts[0].y)));
      const E = PT[PT.length - 1];
      const below = E.y < 56;
      const ny = normal ? Yv(normal) : 0;
      const days = (hh) => (hh >= 48 ? 'J+' + Math.round(hh / 24) : 'H+' + Math.round(hh));
      const ticks = [{ x: 6, a: 'start', label: 'Publiée' }];
      if (lastH >= 96) ticks.push({ x: f(X(lastH / 2)), a: 'middle', label: days(lastH / 2) });
      ticks.push({ x: W - 6, a: 'end', label: days(lastH) });
      return { w: W, area: PT.length > 1 ? smooth(PT) + ' L' + f(E.x) + ' ' + Y0 + ' L' + f(PT[0].x) + ' ' + Y0 + ' Z' : '',
        guess: PT.length > 1 ? smooth(PT.slice(0, 2)) : '', line: PT.length > 2 ? smooth(PT.slice(1)) : '',
        dots: PT.slice(1, -1).map((p) => ({ x: f(p.x), y: f(p.y) })), ex: f(E.x), ey: f(E.y), endLabel: nfc(views),
        lx: f(E.x > W - 60 ? E.x + 4 : E.x), ly: f(below ? E.y + 30 : E.y - 18), la: E.x > W - 60 ? 'end' : 'middle',
        // La normale basse : son étiquette va à droite, sous l'aire, là où le tronçon en pointillés ne passe pas.
        nx: ny > Y0 - (Y0 - Y1) * 0.35 && Math.abs(E.y - ny) > 28 ? f(W - 6) : '0', na: ny > Y0 - (Y0 - Y1) * 0.35 && Math.abs(E.y - ny) > 28 ? 'end' : 'start',
        hasNormal: !!normal && ny > Y1 - 4, ny: f(ny), nty: f(ny - 9 < 14 ? ny + 18 : ny - 9), nLabel: normal ? 'Sa normale · ' + nfc(normal) + ' vues' : '',
        ticks, aria: 'Vues : ' + nfc(views) + ' à ' + days(lastH) + (normal ? ', sa normale est de ' + nfc(normal) + ' vues' : '') };
    };
    let obs = [{ h: 52, v: 1360000 }, { h: 67, v: 1530000 }, { h: 92, v: 1870000 }];
    let chart = makeChart(obs, 1870000, 28500);
    if (D && D.id) {
      const HH = (ms) => Math.max(0, Math.round((ms - D.publishedAt) / 3600000));
      obs = (D.snapshots || []).filter((p) => p.at >= D.publishedAt).sort((p, q) => p.at - q.at).map((p) => ({ h: HH(p.at), v: p.views }));
      if (!obs.length || obs[obs.length - 1].v < D.views) obs.push({ h: Math.max(1, HH(Date.now())), v: D.views });
      chart = makeChart(obs, D.views, D.normal || 0);
    }
    // Sous la courbe : ce qu'elle fait en ce moment (gain sur les dernières 24 h environ).
    vid = Object.assign({}, vid, { growth: '' });
    if (obs.length >= 2) {
      const last = obs[obs.length - 1];
      const ref = obs.slice(0, -1).reverse().find((p) => last.h - p.h >= 20) || obs[0];
      const gain = last.v - ref.v, span = last.h - ref.h;
      const per = span >= 20 && span <= 30 ? 'sur les dernières 24 h' : span >= 48 ? 'en ' + Math.round(span / 24) + ' jours' : 'en ' + Math.max(1, span) + '\u202fh';
      vid.growth = gain > Math.max(50, last.v * 0.01) ? '+' + nfc(gain) + ' vues ' + per + ' : elle continue de monter.' : 'Presque plus de nouvelles vues ' + per + ' : l’essentiel est fait.';
    }
    const playing = !!((this.state || {}).playing && vid.embed); // lecteur officiel de la plateforme, au tap
    return { v, facts, nxt, vid, au, chart, hasNxt: nxt.length > 0, playing, notPlaying: !playing, play: () => { if (vid.embed) this.setState({ playing: true }); } };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(32px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("a", { "class": "sw-btn sw-btn-icon", "href": $v.vid?.back, "aria-label": "Retour", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-left: -10px;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              $t($v.vid?.pos)
            )
          )
        ),
        $h("div", { "style": "position: relative; margin: 0 auto; width: 100%; aspect-ratio: 9 / 13; overflow: hidden; background: #000;" },
          ($v.playing) ? [
            $h("iframe", { "src": $v.vid?.embed, "title": $v.vid?.hook, "allow": "autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write", "allowfullscreen": "true", "style": "position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #000;" })
          ] : null,
          ($v.notPlaying) ? [
            $h("span", { "aria-hidden": "true", "style": "position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 76px 28px 0; box-sizing: border-box; text-align: center; background: radial-gradient(60% 40% at 50% 42%, rgba(76,154,255,0.18), transparent 70%), linear-gradient(160deg, #142036, #0A0F19);" },
              $h("span", { "style": "max-width: 300px; font-size: 17px; font-weight: 600; line-height: 1.4; color: #E4E7EC; overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;" },
                $t($v.vid?.hook)
              )
            ),
            $h("img", { "src": $v.v?.src, "alt": "", "style": "position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;", "loading": "lazy", "decoding": "async" }),
            $h("span", { "class": "sw-video-shade" }),
            $h("button", { "type": "button", "onClick": $v.play, "aria-label": "Lire la vidéo", "style": "position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: pointer; color: #FFFFFF;" },
              $h("span", { "style": "position: absolute; left: 50%; top: 50%; width: 68px; height: 68px; margin: -34px 0 0 -34px; border-radius: 50%; background: rgba(5,7,12,0.5); backdrop-filter: blur(8px); display: inline-flex; align-items: center; justify-content: center; color: #FFFFFF;" },
                $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M9 7l9 5-9 5z", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("span", { "style": "position: absolute; top: 14px; left: 14px; display: flex; gap: 6px;" },
              ($v.vid?.hasApp) ? [
                $h("span", { "class": "sw-badge", "style": "background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: currentColor;" },
                    $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t($v.vid?.appName)
                )
              ] : null,
              $h("span", { "class": "sw-badge", "style": "gap: 6px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                $h("span", { "class": "sw-flag", "data-c": $v.vid?.mk, "aria-hidden": "true" }),
                $t($v.vid?.where)
              )
            ),
            $h("span", { "style": "position: absolute; left: 16px; right: 16px; bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; gap: 10px;" },
              $h("span", { "style": "flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 4px;" },
                $h("span", { "style": "font-family: var(--font-display); font-size: 34px; font-weight: 700; letter-spacing: -0.03em; color: #FFFFFF;" },
                  $t($v.vid?.views)
                ),
                $h("span", { "style": "display: flex; align-items: center; gap: 8px; min-width: 0; font-size: 13px; color: #E4E7EC;" },
                  $h("span", { "style": "width: 26px; height: 26px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                    ($v.au?.av) ? [
                      $h("img", { "src": $v.au?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    ($v.au?.noav) ? [
                      $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                        $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                      )
                    ] : null
                  ),
                  $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                    $t($v.vid?.who)
                  ),
                  ($v.vid?.paid) ? [
                    $h("span", { "style": "display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px 0 4px; border-radius: 999px; background: #F5B941; color: #1A1206; font-size: 10.5px; font-weight: 700; white-space: nowrap; flex-shrink: 0;" },
                      $h("span", { "aria-hidden": "true", "style": "width: 13px; height: 13px; border-radius: 50%; background: rgba(26,18,6,0.14); display: inline-flex; align-items: center; justify-content: center; font-size: 9px;" },
                        "€"
                      ),
                      "Placement payé"
                    )
                  ] : null
                )
              ),
              ($v.vid?.hasDur) ? [
                $h("span", { "style": "flex-shrink: 0; font-size: 12px; color: #E4E7EC;" },
                  $t($v.vid?.dur)
                )
              ] : null
            ),
            $h("a", { "class": "sw-btn sw-btn-icon", "href": $v.vid?.url, "target": "_blank", "rel": "noopener", "aria-label": "Ouvrir la vidéo sur sa plateforme", "style": "position: absolute; top: 8px; right: 8px; width: 44px; height: 44px; background: rgba(5,7,12,0.55); color: #FFFFFF; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "class": "sw-video-bar", "style": "width: 0;" })
          ] : null
        ),
        ($v.vid?.paid) ? [
          $h("div", { "style": "padding: 14px 20px 0;" },
            $h("span", { "style": "display: block; padding: 10px 14px; border-radius: 12px; background: rgba(245,185,65,0.08); box-shadow: inset 0 0 0 1px rgba(245,185,65,0.22); font-size: 13.5px; line-height: 1.5; color: var(--ink-soft);" },
              $t($v.vid?.paidNote)
            )
          )
        ] : null,
        $h("div", { "style": "padding: 16px 20px 0; display: flex; justify-content: center;" },
          $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.openAj },
            $t($v.saveLabel),
            $h("span", { "class": "sw-btn-tile" },
              $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linejoin": "round" })
              )
            )
          )
        ),
        $h("div", { "class": "sw-card is-featured", "style": "margin: 18px 20px 0; border-radius: 22px; padding: 18px; display: flex; flex-direction: column; gap: 12px;" },
          $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
            "Pourquoi elle sort du lot"
          ),
          ($v.vid?.hasX) ? [
            $h("span", { "style": "display: flex; align-items: baseline; gap: 10px;" },
              $h("span", { "style": "font-family: var(--font-display); font-size: 48px; line-height: 1; font-weight: 700; letter-spacing: -0.05em; color: var(--accent);" },
                $t($v.vid?.x)
              ),
              $h("span", { "style": "font-size: 15px; color: var(--ink-soft);" },
                "sa normale"
              )
            )
          ] : null,
          $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
            "Ses vues face à sa normale"
          ),
          $h("div", { "ref": $v.setChartBox, "style": "width: 100%;" },
            $h("svg", { "viewBox": `0 0 ${$t($v.chart?.w)} 200`, "width": "100%", "height": "200", "role": "img", "aria-label": $v.chart?.aria, "style": "display: block; overflow: visible;" },
              $h("defs", null,
                $h("linearGradient", { "id": "mv-area", "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                  $h("stop", { "offset": "0", "stop-color": "#4C9AFF", "stop-opacity": "0.32" }),
                  $h("stop", { "offset": "1", "stop-color": "#4C9AFF", "stop-opacity": "0" })
                )
              ),
              $h("line", { "x1": "0", "y1": "160", "x2": $v.chart?.w, "y2": "160", "stroke": "rgba(255,255,255,0.10)" }),
              $h("path", { "d": $v.chart?.area, "fill": "url(#mv-area)", "class": "va-fade", "style": "opacity: 0; animation: m-vid-va-fade .6s ease-out .5s forwards;" }),
              ($v.chart?.hasNormal) ? [
                $h("line", { "x1": "0", "y1": $v.chart?.ny, "x2": $v.chart?.w, "y2": $v.chart?.ny, "stroke": "rgba(255,255,255,0.32)", "stroke-width": "1.2", "stroke-dasharray": "4 6" }),
                $h("text", { "x": $v.chart?.nx, "y": $v.chart?.nty, "text-anchor": $v.chart?.na, "fill": "#A9B1BF", "font-family": "Inter, system-ui, sans-serif", "font-size": "12.5" },
                  $t($v.chart?.nLabel)
                )
              ] : null,
              $h("path", { "d": $v.chart?.guess, "fill": "none", "stroke": "#4C9AFF", "stroke-opacity": "0.5", "stroke-width": "2", "stroke-dasharray": "2 6", "stroke-linecap": "round" }),
              $h("path", { "d": $v.chart?.line, "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.75", "stroke-linecap": "round", "stroke-linejoin": "round", "pathLength": "1", "stroke-dasharray": "1", "stroke-dashoffset": "1", "class": "va-draw", "style": "animation: m-vid-va-draw 1.1s cubic-bezier(.2,.7,.2,1) .1s forwards;" }),
              ($l($v.chart?.dots)).map((d) => [
                $h("circle", { "cx": d?.x, "cy": d?.y, "r": "2.5", "fill": "#4C9AFF", "fill-opacity": "0.7" })
              ]),
              $h("circle", { "cx": $v.chart?.ex, "cy": $v.chart?.ey, "r": "12", "fill": "#4C9AFF", "fill-opacity": "0.16" }),
              $h("circle", { "cx": $v.chart?.ex, "cy": $v.chart?.ey, "r": "5.5", "fill": "#4C9AFF", "stroke": "#0D111A", "stroke-width": "2.5" }),
              $h("text", { "x": $v.chart?.lx, "y": $v.chart?.ly, "text-anchor": $v.chart?.la, "fill": "#FFFFFF", "font-family": "Inter Tight, Inter, system-ui, sans-serif", "font-size": "16", "font-weight": "700" },
                $t($v.chart?.endLabel)
              ),
              ($l($v.chart?.ticks)).map((t) => [
                $h("text", { "x": t?.x, "y": "188", "text-anchor": t?.a, "fill": "#8A93A3", "font-family": "Inter, system-ui, sans-serif", "font-size": "12" },
                  $t(t?.label)
                )
              ])
            )
          ),
          $h("span", { "style": "font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
            $t($v.vid?.growth)
          )
        ),
        $h("div", { "style": "padding: 24px 20px 0; display: flex; flex-direction: column; gap: 4px;" },
          $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; padding-bottom: 6px;" },
            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
              $h("path", { "d": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Ce qu’elle fait"
          ),
          ($l($v.facts)).map((f) => [
            $h("div", { "style": "padding: 12px 0; border-bottom: 1px solid var(--line); display: flex; flex-direction: column; gap: 4px;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
                $h("span", { "class": "m-ic", "data-i": f?.k, "aria-hidden": "true", "style": "width: 14px; height: 14px;" }),
                $t(f?.k)
              ),
              $h("span", { "style": "font-size: 15px; line-height: 1.5; color: var(--ink-soft);" },
                $t(f?.v)
              )
            )
          ])
        ),
        ($v.hasNxt) ? [
          $h("div", { "style": "padding-top: 24px; display: flex; flex-direction: column; gap: 12px;" },
            $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
              $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Ensuite"
              )
            ),
            $h("div", { "style": "display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
              ($l($v.nxt)).map((n) => [
                $h("a", { "href": n?.href, "style": "flex-shrink: 0; width: 150px; display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: inherit;" },
                  $h("span", { "class": "sw-video", "style": "display: block; border-radius: 16px;" },
                    $h("img", { "class": "sw-cover", "src": n?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-badge", "style": "position: absolute; top: 8px; left: 8px; height: 22px; font-size: 11px; background: var(--blue-600); color: #FFFFFF;" },
                      $t(n?.x)
                    ),
                    $h("span", { "class": "sw-video-foot" },
                      $h("span", { "class": "sw-video-views", "style": "font-size: 18px;" },
                        $t(n?.v)
                      )
                    )
                  ),
                  $h("span", { "style": "font-size: 12px; line-height: 1.4; color: var(--ink-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" },
                    $t(n?.t)
                  )
                )
              ])
            )
          )
        ] : null,
        $h("div", { "style": "padding: 22px 20px 0;" },
          $h("div", { "style": "display: flex; justify-content: center;" },
            ($v.vid?.hasApp) ? [
              $h("a", { "class": "sw-link", "href": $v.vid?.appHref, "style": "min-height: 44px; display: inline-flex; align-items: center;" },
                $t($v.vid?.appLink)
              )
            ] : null
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
