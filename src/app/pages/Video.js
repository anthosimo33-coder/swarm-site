// Généré par scripts/dc2preact.py depuis design/app/VideoA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import Palette from './Palette.js';

export default class Video extends DCLogic {
  componentWillUnmount() { clearTimeout(this.tm); }

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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'apps' ? 'page' : 'false' }));
    return {
      sb, me, getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    const live = typeof P.saved === 'function' && typeof P.save === 'function';
    const D = P.data;
    const id = (D && D.id) || (P.params && P.params.id) || (live ? '' : '7705929733220994337');
    // Gardée : la vidéo est dans au moins un dossier (saved('folders')) ; sur le canevas, l'état local.
    const fs = live ? P.saved('folders') : null;
    const kept = live ? (Array.isArray(fs) ? fs : []).some((x) => (x.items || []).some((i) => i.kind === 'video' && i.id === id)) : !!st.kept;
    return {
      kept: kept ? 'true' : 'false', keepLabel: kept ? 'Gardée' : 'Garder', saveLabel: kept ? 'Dans tes dossiers' : 'Enregistrer dans un dossier',
      keepBg: kept ? 'var(--accent-soft)' : 'var(--track)', keepInk: kept ? 'var(--accent)' : 'var(--ink-muted)', keepFill: kept ? 'currentColor' : 'none',
      ajItem: { kind: 'video', id, label: b.vid.handle, cover: b.vid.cover || null },
      setSkip: (el) => { this.skipEl = el; },
      // Fermer : retour d'un coup à l'écran d'où la visionneuse a été ouverte (même après plusieurs vidéos), sinon à la
      // fiche de l'app. Revenir à la vidéo d'avant, c'est la flèche ← (demande du 14/11).
      close: () => {
        const n = (window.history.state && window.history.state.viewer) || 0;
        if (n > 0) { window.history.go(-n); return; }
        window.history.pushState(null, '', b.vid.appHref);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };
  }

  baseVals() {
    const st = this.state || {};
    const copied = !!st.copied;
    let facts = [
      ['Texte à l’écran', '« POV: tienes EXAMEN ORAL y no has estudiado NADA », puis « la aplicación que uso es Astra Ai »'],
      ['Ce qui est dit', 'Un oral en visio. Elle fait répéter la question, « que se ha cortado », puis répond sans faute sur la glycolyse.'],
      ['Son', 'original sound - learnwithjoel1'],
      ['Légende', '« OTRO EXAMEN APROBADO, así de fácil » #studyhacks #buenasnotas #examenes'],
      ['Réactions', '52,6 k j’aime · 3,2 k enregistrements · 846 partages · 325 commentaires']
    ].map((f) => ({ k: f[0], v: f[1] }));
    let next = [['t-navy', '2 333×', 'TKA SD kelas 6 persiapannya bisa dimulai disini', 'Astra AI', '2,0 M'], ['t-pine', '1 226×', 'Mình sẽ xoá vid này trong 24h nữa', 'Astra AI', '809 k'], ['t-violet', '455×', 'Bí mật giúp bạn học giỏi hơn đứa mình ghét', 'Astra AI', '1,2 M'], ['t-plum', '100×', 'Imagine being in a relationship where you stop telling your partner…', 'RecentFollow', '1,2 M']]
      .map((n, i) => ({ t: n[0], x: n[1], hook: n[2], app: n[3], v: n[4], src: ["/media/app/v-7705368869250075925.jpg", "/media/app/v-7706010190566542612.jpg", "/media/app/v-7706101547570171143.jpg", "/media/app/v-7705376808862076182.jpg"][i] }));
    next = next.map((n) => Object.assign({ href: '/app/videos/7705929733220994337' }, n));
    // L'exemple de la maquette (le canevas n'a pas de données).
    let vid = { pos: '1 sur 14', progress: '7%', prevHref: '/app/videos/7705929733220994337', prevO: 0.4, nextHref: '/app/videos/7705929733220994337', nextO: 1,
      cover: '/media/app/v-7705929733220994337.jpg', hook: 'POV: tienes EXAMEN ORAL y no has estudiado NADA', durS: '49s', dur: '0:49',
      url: 'https://www.tiktok.com/@learnwithjoel1/video/7705929733220994337', appName: 'Astra AI', appHref: '/app/apps/astraai', market: 'Espagne', date: '08/11',
      handle: '@learnwithjoel1', whoMeta: " · 12,2 k abonnés · fait d'habitude 28,5 k vues", x: '65×', views: '1,87 M vues', age: 'en 92 heures · 154× ses abonnés',
      growth: '+340 k vues sur les dernières 24 h : elle continue de monter.', copyText: 'POV: tienes EXAMEN ORAL y no has estudiado NADA', copyParts: 'Texte à l’écran' };
    // Courbe « ses vues face à sa normale » : la publication, les relevés, la normale du compte.
    // obs = [{ h: heures depuis la publication, v: vues }]. Le tronçon publication -> premier relevé
    // n'a pas été relevé : il est en pointillés. Une seule étiquette (la dernière valeur), 3 repères de temps.
    const makeChart = (obs, views, normal, nfmt) => {
      const W = 380, Y0 = 146, Y1 = 30, f = (n) => n.toFixed(1);
      const lastH = Math.max(1, obs.length ? obs[obs.length - 1].h : 1);
      const vmax = Math.max(1, views, normal || 0, ...obs.map((p) => p.v)) * 1.14;
      const X = (h) => 6 + (h / lastH) * (W - 12), Yv = (v) => Y0 - (v / vmax) * (Y0 - Y1);
      const P = [{ x: X(0), y: Y0 }].concat(obs.map((p) => ({ x: X(p.h), y: Yv(p.v) })));
      const smooth = (pts) => pts.length < 2 ? '' : pts.slice(1).reduce((d, b, i) => { const a = pts[i], dx = (b.x - a.x) / 2.4;
        return d + ' C' + f(a.x + dx) + ' ' + f(a.y) + ' ' + f(b.x - dx) + ' ' + f(b.y) + ' ' + f(b.x) + ' ' + f(b.y); }, 'M' + f(pts[0].x) + ' ' + f(pts[0].y));
      const E = P[P.length - 1];
      const below = E.y < 50;
      const ny = normal ? Yv(normal) : 0;
      const days = (h) => (h >= 48 ? 'J+' + Math.round(h / 24) : 'H+' + Math.round(h));
      const ticks = [{ x: 6, a: 'start', label: 'Publiée' }];
      if (lastH >= 96) ticks.push({ x: f(X(lastH / 2)), a: 'middle', label: days(lastH / 2) });
      ticks.push({ x: W - 6, a: 'end', label: days(lastH) });
      return {
        area: P.length > 1 ? smooth(P) + ' L' + f(E.x) + ' ' + Y0 + ' L' + f(P[0].x) + ' ' + Y0 + ' Z' : '',
        guess: P.length > 1 ? smooth(P.slice(0, 2)) : '',
        line: P.length > 2 ? smooth(P.slice(1)) : '',
        dots: P.slice(1, -1).map((p) => ({ x: f(p.x), y: f(p.y) })),
        ex: f(E.x), ey: f(E.y), endLabel: nfmt(views),
        lx: f(E.x > W - 60 ? E.x + 4 : E.x), ly: f(below ? E.y + 30 : E.y - 18), la: E.x > W - 60 ? 'end' : 'middle',
        hasNormal: !!normal && ny > Y1 - 4, ny: f(ny), nty: f(ny - 9 < 14 ? ny + 18 : ny - 9), nLabel: normal ? 'Sa normale · ' + nfmt(normal) + ' vues' : '',
        ticks, aria: 'Vues : ' + nfmt(views) + ' à ' + days(lastH) + (normal ? ', sa normale est de ' + nfmt(normal) + ' vues' : ''),
      };
    };
    let chart = makeChart([{ h: 52, v: 1360000 }, { h: 67, v: 1530000 }, { h: 92, v: 1870000 }], 1870000, 28500,
      (n) => (n >= 1e6 ? (n / 1e6).toFixed(2).replace(/0$/, '').replace('.', ',') + '\u202fM' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fk' : String(n)));

    // Sur le site : la vidéo depuis le Radar (document « video:<id> », convex/radarModels.ts).
    const D = this.props && this.props.data;
    if (D && D.id) {
      const MKN = (c) => c === 'XX' ? 'Pays inconnu' : ({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil', DE: 'Allemagne', SA: 'Arabie saoudite', RU: 'Russie' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
      // « depuis la France », « depuis les États-Unis », « depuis l’Allemagne », « depuis Singapour » ; rien pour un pays inconnu.
      const DEPUIS = (n) => { n = String(n || ''); if (!n || n === 'Pays inconnu' || /^[A-Z]{2}$/.test(n)) return ''; if (/^(Singapour|Chypre|Cuba|Madagascar|Taïwan|Porto Rico|Malte|Haïti|Bahreïn|Israël|Monaco|Oman|Hong Kong|Maurice|La Réunion|Djibouti)$/.test(n)) return 'depuis ' + n;
        if (/^(États-Unis|Pays-Bas|Philippines|Émirats arabes unis|Comores|Maldives|Seychelles|Bahamas)$/.test(n)) return 'depuis les ' + n; if (/^[AEÉÈIÎOUYH]/.test(n) && !/^(Honduras|Hongrie)$/.test(n)) return 'depuis l’' + n;
        return 'depuis ' + (/e$/.test(n.split(/[\s-]/)[0]) && !/^(Mexique|Mozambique|Cambodge|Zimbabwe|Belize|Royaume-Uni|Suriname)$/.test(n) ? 'la ' : 'le ') + n; };
      // La langue de ses vidéos quand ce n'en est pas une de son pays (otherLang, calculé par la synchro) : « en espagnol ».
      const LANGN = (l) => { if (!l) return ''; try { return 'en ' + new Intl.DisplayNames(['fr'], { type: 'language' }).of(l); } catch (e) { return ''; } };
      const MKW = (t) => new Proxy(t, { get: (o, c) => o[c] || MKN(String(c)) }); // un nom pour chaque pays, pas de « autres langues »
      const M = MKW({ FR: 'France', US: 'États-Unis', MX: 'Mexique', ES: 'Espagne', BR: 'Brésil' });
      const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2).replace(/0$/, '').replace('.', ',') + '\u202fM' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fk' : String(Math.round(n)));
      const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const list = D.playlist || [];
      const idx = list.indexOf(D.id);
      const href = (id) => '/app/videos/' + id;
      const H = (ms) => Math.max(0, Math.round((ms - D.publishedAt) / 3600000));
      const hours = H(Date.now());
      // Type de contenu de la vidéo (lu sur sa miniature ; le carrousel a sa propre puce).
      const KINDL = (k, g) => ({ ambassadeur: g === 'femme' ? 'Ambassadrice' : 'Ambassadeur', carrousel: 'Carrousel', extrait_repris: 'Extrait repris', histoire_messages: 'Histoire en messages', demo_ecran: 'Démo d’écran', motion: 'Motion', ambiance_texte: 'Ambiance + texte' })[k] || '';
      vid = {
        pos: idx >= 0 ? (idx + 1) + ' sur ' + list.length : '', progress: idx >= 0 ? Math.round((idx + 1) / list.length * 100) + '%' : '0%',
        prevHref: idx > 0 ? href(list[idx - 1]) : href(D.id), prevO: idx > 0 ? 1 : 0.4,
        nextHref: idx >= 0 && idx < list.length - 1 ? href(list[idx + 1]) : href(D.id), nextO: idx >= 0 && idx < list.length - 1 ? 1 : 0.4,
        cover: D.cover || '', hook: D.hook || D.caption || '',
        durS: Math.round(D.durationSec || 30) + 's', dur: D.durationSec ? Math.floor(Math.round(D.durationSec) / 60) + ':' + String(Math.round(D.durationSec) % 60).padStart(2, '0') : '',
        // Le lecteur officiel de la plateforme, qui démarre au clic sur lecture.
        embed: D.platform === 'instagram' ? 'https://www.instagram.com/reel/' + String(D.id).replace(/^ig:/, '') + '/embed/'
          : /^\d+$/.test(String(D.id)) ? 'https://www.tiktok.com/player/v1/' + D.id + '?autoplay=1&rel=0&description=0&music_info=0&native_context_menu=0' : '',
        url: D.url, appName: D.app ? D.app.name : '', appHref: D.app ? '/app/apps/' + D.app.slug : '/app/apps',
        market: D.market && DEPUIS(M[D.market]) ? ['Publiée ' + DEPUIS(M[D.market]), LANGN(D.otherLang)].filter(Boolean).join(' · ') : '', mk: D.market || '', date: D.publishedAt ? new Date(D.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '—',
        handle: '@' + D.handle, whoMeta: (D.fans ? ' · ' + nf(D.fans) + ' abonnés' : '') + (D.normal ? " · fait d'habitude " + nf(D.normal) + ' vues' : ''),
        // Placement payé : le compte a été payé pour cette vidéo, ce n'est pas un créateur de l'app.
        car: D.carousel ? 'Carrousel · ' + D.carousel + ' photos' : '', kindL: D.kind && D.kind !== 'carrousel' ? KINDL(D.kind) : '', paid: !!D.paid, paidNote: 'Ce compte a été payé pour cette vidéo : elle compte dans les vues de ' + (D.app ? D.app.name : 'l’app') + ', mais il n’est pas compté parmi ses créateurs.',
        x: D.x ? xf(D.x) : '—', views: nf(D.views) + ' vues',
        age: (hours >= 48 ? 'en ' + Math.round(hours / 24) + ' jours' : 'en ' + hours + ' heures') + (D.fans ? ' · ' + xf(Math.round(D.views / Math.max(D.fans, 100))) + ' ses abonnés' : ''),
        growth: '',
        copyText: [D.hook, D.caption, D.music ? 'Son : ' + D.music : ''].filter(Boolean).join('\n'),
        copyParts: ((p) => (p.length ? (p.slice(0, -1).join(', ') + (p.length > 1 ? ' et ' : '') + p[p.length - 1]).replace(/^./, (c) => c.toUpperCase()) : 'Rien à copier'))(
          [D.hook ? 'texte à l’écran' : '', D.caption ? 'légende' : '', D.music ? 'son' : ''].filter(Boolean))
      };
      // Courbe : la publication, les relevés de vues, la normale du compte.
      const obs = (D.snapshots || []).filter((p) => p.at >= D.publishedAt).sort((a, b) => a.at - b.at).map((p) => ({ h: H(p.at), v: p.views }));
      if (!obs.length || obs[obs.length - 1].v < D.views) obs.push({ h: Math.max(1, hours), v: D.views });
      chart = makeChart(obs, D.views, D.normal || 0, nf);
      // Sous la courbe : ce qu'elle fait en ce moment (gain sur les dernières 24 h environ).
      if (obs.length >= 2) {
        const last = obs[obs.length - 1];
        const ref = obs.slice(0, -1).reverse().find((p) => last.h - p.h >= 20) || obs[0];
        const gain = last.v - ref.v, span = last.h - ref.h;
        const per = span >= 20 && span <= 30 ? 'sur les dernières 24 h' : span >= 48 ? 'en ' + Math.round(span / 24) + ' jours' : 'en ' + Math.max(1, span) + '\u202fh';
        vid.growth = gain > Math.max(50, last.v * 0.01) ? '+' + nf(gain) + ' vues ' + per + ' : elle continue de monter.'
          : 'Presque plus de nouvelles vues ' + per + ' : l’essentiel est fait.';
      }
      const r = (n) => (n === null || n === undefined ? null : nf(n));
      facts = [
        ['Texte à l’écran', D.hook], ['Ce qui est dit', D.transcript], ['Son', D.music], ['Légende', D.caption],
        ['Réactions', [r(D.likes) && r(D.likes) + ' j’aime', r(D.saves) && r(D.saves) + ' enregistrements', r(D.shares) && r(D.shares) + ' partages', r(D.comments) && r(D.comments) + ' commentaires'].filter(Boolean).join(' · ')]
      ].filter((f) => f[1]).map((f) => ({ k: f[0], v: f[1] }));
      const ap = D.app && this.props.get ? this.props.get('app:' + D.app.slug) : null;
      const cards = ap && ap.videos ? ap.videos : [];
      const T = ['t-navy', 't-pine', 't-violet', 't-plum'];
      next = cards.filter((c) => c.id !== D.id).slice(Math.max(0, idx), Math.max(0, idx) + 4).map((c, i) => ({
        t: T[i % T.length], x: c.x ? xf(c.x) : nf(c.views), hook: c.hook || '@' + c.handle, app: D.app ? D.app.name : '', v: nf(c.views), src: c.cover || '', href: href(c.id) }));
    }
    const playing = !!(st.playing && vid.embed);
    return {
      vid, chart,
      facts: facts.map((x) => Object.assign({}, x, { ic: { 'Texte à l’écran': 'M5 6h14M12 6v13M9 19h6', 'Ce qui est dit': 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z', 'Son': 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z', 'Légende': 'M4 6h16M4 12h16M4 18h10', 'Réactions': 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z' }[x.k] || '' })), next,
      playing, notPlaying: !playing, play: () => { if (vid.embed) this.setState({ playing: true }); },
      toastText: vid.copyParts,
      copyLabel: copied ? 'Format copié' : 'Copier le format',
      toast: copied,
      copy: () => { try { navigator.clipboard.writeText(vid.copyText); } catch (e) {} this.setState({ copied: true }); clearTimeout(this.tm); this.tm = setTimeout(() => this.setState({ copied: false }), 2600); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: relative; height: 100vh; min-height: 620px; overflow: hidden; background: var(--ground); color: var(--ink); font-family: var(--font-body);" },
        $h("div", { "aria-hidden": "true", "style": "position: absolute; left: -10%; top: -20%; width: 900px; height: 700px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.20), transparent);" }),
        $h("section", { "role": "dialog", "aria-labelledby": "va-t", "style": "position: absolute; inset: 20px; display: flex; flex-direction: column; border-radius: 28px; background: var(--surface-raised); border: 1px solid var(--line); box-shadow: var(--shadow-float); overflow: hidden;" },
          $h("header", { "style": "display: flex; align-items: center; gap: 20px; padding: 18px 24px; border-bottom: 1px solid var(--line);" },
            $h("h1", { "id": "va-t", "style": "margin: 0; font-size: 17px; font-weight: 700; white-space: nowrap;" },
              "Regarder une par une"
            ),
            $h("span", { "style": "font-family: var(--font-mono); font-size: 13px; color: var(--ink-faint); white-space: nowrap;" },
              $t($v.vid?.pos)
            ),
            $h("span", { "aria-hidden": "true", "style": "flex: 1; height: 4px; border-radius: 2px; background: var(--track); overflow: hidden;" },
              $h("span", { "style": `display: block; width: ${$t($v.vid?.progress)}; height: 4px; background: var(--accent); border-radius: 2px;` })
            ),
            $h("span", { "style": "display: flex; gap: 6px;" },
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher", "style": "width: 40px; height: 40px; background: var(--track);" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 24px; margin: 8px 4px; background: var(--line);" }),
              $h("a", { "class": "sw-btn sw-btn-icon", "href": $v.vid?.prevHref, "aria-label": "Vidéo précédente", "style": `width: 40px; height: 40px; background: var(--track); opacity: ${$t($v.vid?.prevO)};` },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M19 12H5M11 18l-6-6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("a", { "class": "sw-btn sw-btn-icon", "href": $v.vid?.nextHref, "aria-label": "Vidéo suivante", "style": `width: 40px; height: 40px; background: var(--tab-on); color: var(--ink); opacity: ${$t($v.vid?.nextO)};` },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.close, "aria-label": "Fermer", "style": "width: 40px; height: 40px;" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                )
              )
            )
          ),
          $h("div", { "style": "flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) 300px; grid-template-rows: minmax(0, 1fr); gap: 28px; padding: 22px 24px; overflow: hidden;" },
            $h("div", { "style": "min-height: 0; display: flex; align-items: flex-start;" },
              $h("div", { "class": "sw-video t-umber va-frame", "style": "border-radius: 22px; box-shadow: 0 30px 60px rgba(0,0,0,0.5);" },
                ($v.playing) ? [
                  $h("iframe", { "src": $v.vid?.embed, "title": $v.vid?.hook, "allow": "autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write", "allowfullscreen": "true", "style": "position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #000;" })
                ] : null,
                ($v.notPlaying) ? [
                  $h("img", { "class": "sw-cover", "src": $v.vid?.cover, "alt": $v.vid?.hook, "loading": "lazy", "decoding": "async" }),
                  $h("span", { "class": "sw-video-shade" }),
                  $h("button", { "type": "button", "onClick": $v.play, "aria-label": "Lire la vidéo", "style": "position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: pointer;" },
                    $h("span", { "style": "position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%); width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.4); display: inline-flex; align-items: center; justify-content: center;" },
                      $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 12 12", "aria-hidden": "true" },
                        $h("path", { "d": "M4 2.5v7l5.5-3.5z", "fill": "#FFFFFF" })
                      )
                    )
                  ),
                  ($v.vid?.dur) ? [
                    $h("span", { "style": "position: absolute; right: 14px; bottom: 14px; padding: 4px 8px; border-radius: 8px; background: rgba(0,0,0,0.55); font-family: var(--font-mono); font-size: 11px; color: #E4E7EC; pointer-events: none;" },
                      $t($v.vid?.dur)
                    )
                  ] : null
                ] : null
              )
            ),
            $h("div", { "class": "va-mid", "style": "min-width: 0; min-height: 0; display: flex; flex-direction: column; gap: 14px; overflow-y: auto;" },
              $h("div", { "style": "display: flex; gap: 6px; flex-wrap: wrap;" },
                ($v.vid?.appName) ? [
                  $h("a", { "class": "sw-badge", "href": $v.vid?.appHref, "style": "display: inline-flex; align-items: center; gap: 6px; text-decoration: none; color: var(--ink);" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t($v.vid?.appName)
                  )
                ] : null,
                ($v.vid?.market) ? [
                  $h("span", { "class": "sw-badge", "style": "display: inline-flex; align-items: center; gap: 6px;" },
                    $h("span", { "class": "sw-flag", "data-c": $v.vid?.mk, "aria-hidden": "true", "style": "width: 14px; height: 14px;" }),
                    $t($v.vid?.market)
                  )
                ] : null,
                ($v.vid?.kindL) ? [
                  $h("span", { "class": "sw-badge", "title": "Type de contenu, lu sur la vidéo", "style": "display: inline-flex; align-items: center; gap: 6px;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                      $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                    ),
                    $t($v.vid?.kindL)
                  )
                ] : null,
                ($v.vid?.car) ? [
                  $h("span", { "class": "sw-badge", "style": "display: inline-flex; align-items: center; gap: 6px;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                      $h("path", { "d": "M8 8h12v12H8zM4 16V4h12", "fill": "none", "stroke": "currentColor", "stroke-width": "2.6", "stroke-linejoin": "round" })
                    ),
                    $t($v.vid?.car)
                  )
                ] : null,
                $h("span", { "class": "sw-badge", "style": "display: inline-flex; align-items: center; gap: 6px;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                    $h("path", { "d": "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Le ", $t($v.vid?.date)
                ),
                ($v.vid?.dur) ? [
                  $h("span", { "class": "sw-badge", "style": "display: inline-flex; align-items: center; gap: 6px;" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                      $h("path", { "d": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t($v.vid?.dur)
                  )
                ] : null
              ),
              $h("span", { "style": "display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 15px; color: var(--ink-muted);" },
                $h("span", null,
                  $h("span", { "style": "color: var(--ink); font-weight: 700;" },
                    $t($v.vid?.handle)
                  ),
                  $t($v.vid?.whoMeta)
                ),
                ($v.vid?.paid) ? [
                  $h("span", { "style": "display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px 0 5px; border-radius: 999px; background: #F5B941; color: #1A1206; font-size: 12px; font-weight: 700; white-space: nowrap; flex-shrink: 0;" },
                    $h("span", { "aria-hidden": "true", "style": "width: 16px; height: 16px; border-radius: 50%; background: rgba(26,18,6,0.14); display: inline-flex; align-items: center; justify-content: center; font-size: 10px;" },
                      "€"
                    ),
                    "Placement payé"
                  )
                ] : null
              ),
              ($v.vid?.paid) ? [
                $h("span", { "style": "padding: 10px 14px; border-radius: 12px; background: rgba(245,185,65,0.08); box-shadow: inset 0 0 0 1px rgba(245,185,65,0.22); font-size: 13.5px; line-height: 1.5; color: var(--ink-soft);" },
                  $t($v.vid?.paidNote)
                )
              ] : null,
              $h("div", { "class": "sw-card", "style": "padding: 18px 22px; display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 24px;" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                    "Pourquoi elle sort du lot"
                  ),
                  $h("span", { "style": "align-self: flex-start; padding: 6px 14px; border-radius: 14px; background: linear-gradient(180deg, var(--blue-400), var(--blue-600)); font-family: var(--font-display); font-size: 40px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em;" },
                    $t($v.vid?.x)
                  ),
                  $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                    "sa normale"
                  ),
                  $h("span", { "style": "margin-top: 10px; font-family: var(--font-display); font-size: 30px; font-weight: 700; letter-spacing: -0.03em;" },
                    $t($v.vid?.views)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                    $t($v.vid?.age)
                  )
                ),
                $h("div", { "style": "display: flex; flex-direction: column; gap: 8px;" },
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                    "Ses vues face à sa normale"
                  ),
                  $h("svg", { "class": "va-chart", "viewBox": "0 0 380 176", "width": "100%", "role": "img", "aria-label": $v.chart?.aria, "style": "overflow: visible;" },
                    $h("defs", null,
                      $h("linearGradient", { "id": "va-area", "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                        $h("stop", { "offset": "0", "stop-color": "#4C9AFF", "stop-opacity": "0.30" }),
                        $h("stop", { "offset": "1", "stop-color": "#4C9AFF", "stop-opacity": "0" })
                      )
                    ),
                    $h("line", { "x1": "0", "y1": "146", "x2": "380", "y2": "146", "stroke": "rgba(255,255,255,0.10)" }),
                    $h("path", { "d": $v.chart?.area, "fill": "url(#va-area)", "class": "va-fade" }),
                    ($v.chart?.hasNormal) ? [
                      $h("line", { "x1": "0", "y1": $v.chart?.ny, "x2": "380", "y2": $v.chart?.ny, "stroke": "rgba(255,255,255,0.32)", "stroke-width": "1.2", "stroke-dasharray": "4 6" }),
                      $h("text", { "x": "0", "y": $v.chart?.nty, "fill": "#A9B1BF", "font-family": "Inter, system-ui, sans-serif", "font-size": "12.5" },
                        $t($v.chart?.nLabel)
                      )
                    ] : null,
                    $h("path", { "d": $v.chart?.guess, "fill": "none", "stroke": "#4C9AFF", "stroke-opacity": "0.5", "stroke-width": "2", "stroke-dasharray": "2 6", "stroke-linecap": "round" }),
                    $h("path", { "d": $v.chart?.line, "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.75", "stroke-linecap": "round", "stroke-linejoin": "round", "pathLength": "1", "class": "va-draw" }),
                    ($l($v.chart?.dots)).map((d) => [
                      $h("circle", { "cx": d?.x, "cy": d?.y, "r": "2.5", "fill": "#4C9AFF", "fill-opacity": "0.7" })
                    ]),
                    $h("circle", { "cx": $v.chart?.ex, "cy": $v.chart?.ey, "r": "12", "fill": "#4C9AFF", "fill-opacity": "0.16" }),
                    $h("circle", { "cx": $v.chart?.ex, "cy": $v.chart?.ey, "r": "5.5", "fill": "#4C9AFF", "stroke": "#0D111A", "stroke-width": "2.5" }),
                    $h("text", { "x": $v.chart?.lx, "y": $v.chart?.ly, "text-anchor": $v.chart?.la, "fill": "#FFFFFF", "font-family": "Inter Tight, Inter, system-ui, sans-serif", "font-size": "16", "font-weight": "700", "letter-spacing": "-0.01em" },
                      $t($v.chart?.endLabel)
                    ),
                    ($l($v.chart?.ticks)).map((t) => [
                      $h("text", { "x": t?.x, "y": "168", "text-anchor": t?.a, "fill": "#8A93A3", "font-family": "Inter, system-ui, sans-serif", "font-size": "12" },
                        $t(t?.label)
                      )
                    ])
                  ),
                  $h("span", { "style": "font-size: 14px; line-height: 1.45; color: var(--ink-muted);" },
                    $t($v.vid?.growth)
                  )
                )
              ),
              $h("div", { "class": "va-facts", "style": "display: flex; flex-direction: column;" },
                $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; padding-bottom: 6px;" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Ce qu'elle fait"
                ),
                ($l($v.facts)).map((f) => [
                  $h("div", { "style": "display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 16px; padding: 10px 0; border-top: 1px solid var(--line); font-size: 14px;" },
                    $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px; color: var(--ink-faint);" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                        $h("path", { "d": f?.ic, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      $t(f?.k)
                    ),
                    $h("span", { "style": "color: var(--ink-soft); line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; user-select: text;" },
                      $t(f?.v)
                    )
                  )
                ])
              )
            ),
            $h("aside", { "aria-label": "Ensuite", "style": "display: flex; flex-direction: column; gap: 10px; min-width: 0; min-height: 0; overflow: hidden;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--ink-muted);" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Ensuite"
              ),
              ($l($v.next)).map((n) => [
                $h("a", { "class": "va-next", "href": n?.href, "style": "display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 12px; padding: 10px; border-radius: 16px; border: 1px solid var(--line); background: var(--row-hover); text-decoration: none; color: var(--ink);" },
                  $h("span", { "class": `sw-video ${$t(n?.t)}`, "style": "display: block; width: 58px; border-radius: 10px;" },
                    $h("img", { "class": "sw-cover", "src": n?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 6px; min-width: 0;" },
                    $h("span", { "class": "sw-badge sw-badge-solid", "style": "align-self: flex-start; height: 22px; font-size: 11px;" },
                      $t(n?.x)
                    ),
                    $h("span", { "style": "font-size: 13px; font-weight: 600; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" },
                      $t(n?.hook)
                    ),
                    $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                      $t(n?.app), " · ", $t(n?.v)
                    )
                  )
                )
              ])
            )
          ),
          $h("footer", { "style": "display: flex; align-items: center; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--line); background: rgba(255,255,255,0.02);" },
            $h("span", { "style": "position: relative; display: inline-flex;" },
              $h("button", { "data-aj-trigger": "true", "onClick": $v.toggleAj, "aria-expanded": $v.ajOpen, "aria-haspopup": "dialog", "class": "sw-btn sw-btn-primary", "type": "button", "aria-pressed": $v.kept },
                $t($v.saveLabel),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": $v.keepFill, "stroke": "currentColor", "stroke-width": "2", "stroke-linejoin": "round" })
                  )
                )
              ),
              ($v.aj) ? [
                $h("span", { "style": "position: absolute; bottom: calc(100% + 10px); left: 0; z-index: 45;" },
                  $h(AjoutDossier, { "onClose": $v.closeAj, "item": $v.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
                )
              ] : null
            ),
            $h("span", { "style": "margin-left: auto;" }),
            $h("a", { "class": "sw-link", "href": $v.vid?.url, "target": "_blank", "rel": "noopener", "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 14px; margin-right: 18px;" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Ouvrir la vidéo"
            ),
            ($v.vid?.appName) ? [
              $h("a", { "class": "sw-more", "href": $v.vid?.appHref, "style": "font-size: 14px;" },
                "Voir l'app ", $t($v.vid?.appName),
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ] : null
          ),
          ($v.toast) ? [
            $h("div", { "class": "sw-toast", "role": "status", "style": "position: absolute; left: calc(50% - 170px); bottom: 92px;" },
              $h("span", { "class": "sw-toast-ico" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("span", null,
                $h("span", { "class": "sw-toast-kicker" },
                  "Dans le presse-papiers"
                ),
                $h("span", { "class": "sw-toast-text" },
                  $t($v.toastText)
                )
              )
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
