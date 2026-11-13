// Généré par scripts/dc2preact.py depuis design/app/VideoA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import Palette from './Palette.js';

export default class Video extends DCLogic {
  // Raccourcis annoncés en bas : P passe à la suivante, G ouvre « Garder ».
  componentDidMount() {
    this.onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      const k = String(e.key || '').toLowerCase();
      if (k === 'p' && this.skipEl) { e.preventDefault(); this.skipEl.click(); }
      else if (k === 'g') { e.preventDefault(); this.setState({ aj: !(this.state || {}).aj }); }
    };
    document.addEventListener('keydown', this.onKey);
  }
  componentWillUnmount() { document.removeEventListener('keydown', this.onKey); clearTimeout(this.tm); }

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
      kept: kept ? 'true' : 'false', keepLabel: kept ? 'Gardée' : 'Garder',
      keepBg: kept ? 'var(--accent-soft)' : 'var(--track)', keepInk: kept ? 'var(--accent)' : 'var(--ink-muted)', keepFill: kept ? 'currentColor' : 'none',
      ajItem: { kind: 'video', id, label: b.vid.handle, cover: b.vid.cover || null },
      setSkip: (el) => { this.skipEl = el; },
      // Fermer : retour à l'écran d'où l'on vient, sinon à la fiche de l'app.
      close: () => { if (window.history.length > 1) window.history.back(); else window.location.href = b.vid.appHref; }
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
      growth: '+38 % entre H+52 et H+92', copyText: 'POV: tienes EXAMEN ORAL y no has estudiado NADA', copyParts: 'Texte à l’écran' };
    let chart = { line: 'M40 150 L266 54.9 L331 42.7 L440 19.1', mid: '1 M', top: '2 M', aria: 'Vues : 1,36 M à H+52, 1,53 M à H+67, 1,87 M à H+92',
      pts: [[266, 54.9, 'H+52', 'middle', 266], [331, 42.7, 'H+67', 'middle', 331], [440, 19.1, 'H+92', 'end', 436]].map((p, i, a) => ({ x: p[0], y: p[1], label: p[2], anchor: p[3], lx: p[4], r: i === a.length - 1 ? 5.5 : 4.5, fill: i === a.length - 1 ? '#4C9AFF' : '#0D111A' })) };

    // Sur le site : la vidéo depuis le Radar (document « video:<id> », convex/radarModels.ts).
    const D = this.props && this.props.data;
    if (D && D.id) {
      const M = { FR: 'France', US: 'Anglophone', MX: 'Amérique latine', ES: 'Espagne', BR: 'Brésil et Portugal', XX: 'Autres langues' };
      const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2).replace(/0$/, '').replace('.', ',') + ' M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' k' : String(Math.round(n)));
      const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(x).replace('.', ',')) + '×';
      const list = D.playlist || [];
      const idx = list.indexOf(D.id);
      const href = (id) => '/app/videos/' + id;
      const H = (ms) => Math.max(0, Math.round((ms - D.publishedAt) / 3600000));
      const hours = H(Date.now());
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
        market: M[D.market] || 'Autres langues', date: D.publishedAt ? new Date(D.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '—',
        handle: '@' + D.handle, whoMeta: (D.fans ? ' · ' + nf(D.fans) + ' abonnés' : '') + (D.normal ? " · fait d'habitude " + nf(D.normal) + ' vues' : ''),
        x: D.x ? xf(D.x) : '—', views: nf(D.views) + ' vues',
        age: (hours >= 48 ? 'en ' + Math.round(hours / 24) + ' jours' : 'en ' + hours + ' heures') + (D.fans ? ' · ' + xf(Math.round(D.views / Math.max(D.fans, 100))) + ' ses abonnés' : ''),
        growth: '',
        copyText: [D.hook, D.caption, D.music ? 'Son : ' + D.music : ''].filter(Boolean).join('\n'),
        copyParts: ((p) => (p.length ? (p.slice(0, -1).join(', ') + (p.length > 1 ? ' et ' : '') + p[p.length - 1]).replace(/^./, (c) => c.toUpperCase()) : 'Rien à copier'))(
          [D.hook ? 'texte à l’écran' : '', D.caption ? 'légende' : '', D.music ? 'son' : ''].filter(Boolean))
      };
      // Courbe : les relevés de vues, du dépôt au dernier relevé.
      const snaps = (D.snapshots || []).filter((p) => p.at >= D.publishedAt);
      const pts = [{ h: 0, v: 0 }].concat(snaps.map((p) => ({ h: H(p.at), v: p.views })));
      const maxH = Math.max(1, pts[pts.length - 1].h), maxV = Math.max(1, D.views);
      const top = Math.pow(10, Math.floor(Math.log10(maxV))) * Math.ceil(maxV / Math.pow(10, Math.floor(Math.log10(maxV))));
      const XY = pts.map((p) => [40 + p.h / maxH * 400, 150 - p.v / top * 140]);
      chart = {
        line: 'M' + XY.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'), top: nf(top), mid: nf(top / 2),
        aria: 'Vues : ' + snaps.map((p) => nf(p.views) + ' à H+' + H(p.at)).join(', '),
        pts: XY.slice(1).map((p, i, a) => ({ x: p[0].toFixed(1), y: p[1].toFixed(1), label: 'H+' + pts[i + 1].h, anchor: i === a.length - 1 ? 'end' : 'middle', lx: i === a.length - 1 ? 436 : p[0].toFixed(1), r: i === a.length - 1 ? 5.5 : 4.5, fill: i === a.length - 1 ? '#4C9AFF' : '#0D111A' }))
      };
      // Une étiquette d'heure par point, sauf si elle mordrait sur la suivante (la dernière gagne).
      for (let i = chart.pts.length - 2, last = 436; i >= 0; i--) {
        if (last - chart.pts[i].x < 44) chart.pts[i].label = '';
        else last = +chart.pts[i].x;
      }
      if (snaps.length >= 2 && snaps[0].views > 0) {
        const g = (snaps[snaps.length - 1].views - snaps[0].views) / snaps[0].views;
        vid.growth = (g >= 0 ? '+' : '−') + Math.round(Math.abs(g) * 100) + ' % entre H+' + H(snaps[0].at) + ' et H+' + H(snaps[snaps.length - 1].at);
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
      facts, next,
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
      $h("div", { "class": "sw", "style": "position: relative; min-height: 1060px; background: var(--ground); color: var(--ink); font-family: var(--font-body);" },
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
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher, raccourci Commande K", "title": "Chercher (⌘ K)", "style": "width: 40px; height: 40px; background: var(--track);" },
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
          $h("div", { "style": "flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 360px minmax(0, 1fr) 300px; gap: 28px; padding: 24px;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 12px;" },
              $h("div", { "class": "sw-video t-umber", "style": "border-radius: 22px; box-shadow: 0 30px 60px rgba(0,0,0,0.5);" },
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
              ),
              $h("a", { "class": "sw-link", "href": $v.vid?.url, "target": "_blank", "rel": "noopener", "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 14px;" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Ouvrir la vidéo"
              )
            ),
            $h("div", { "style": "min-width: 0; display: flex; flex-direction: column; gap: 18px; overflow: hidden;" },
              $h("div", { "style": "display: flex; gap: 6px; flex-wrap: wrap;" },
                ($v.vid?.appName) ? [
                  $h("a", { "class": "sw-badge", "href": $v.vid?.appHref, "style": "text-decoration: none; color: var(--ink);" },
                    $t($v.vid?.appName)
                  )
                ] : null,
                $h("span", { "class": "sw-badge" },
                  $t($v.vid?.market)
                ),
                $h("span", { "class": "sw-badge" },
                  "Publiée le ", $t($v.vid?.date)
                ),
                ($v.vid?.dur) ? [
                  $h("span", { "class": "sw-badge" },
                    $t($v.vid?.dur)
                  )
                ] : null
              ),
              $h("span", { "style": "font-size: 15px; color: var(--ink-muted);" },
                $h("span", { "style": "color: var(--ink); font-weight: 700;" },
                  $t($v.vid?.handle)
                ),
                $t($v.vid?.whoMeta)
              ),
              $h("div", { "class": "sw-card", "style": "padding: 22px; display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 24px;" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                    "Pourquoi elle sort du lot"
                  ),
                  $h("span", { "style": "align-self: flex-start; padding: 6px 14px; border-radius: 14px; background: linear-gradient(180deg, var(--blue-400), var(--blue-600)); font-family: var(--font-display); font-size: 40px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; box-shadow: var(--glow-rest);" },
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
                  $h("svg", { "viewBox": "0 0 440 180", "width": "100%", "height": "180", "role": "img", "aria-label": $v.chart?.aria },
                    $h("line", { "x1": "40", "y1": "150", "x2": "440", "y2": "150", "stroke": "rgba(255,255,255,0.14)" }),
                    $h("line", { "x1": "40", "y1": "80", "x2": "440", "y2": "80", "stroke": "rgba(255,255,255,0.06)" }),
                    $h("line", { "x1": "40", "y1": "10", "x2": "440", "y2": "10", "stroke": "rgba(255,255,255,0.06)" }),
                    $h("text", { "x": "0", "y": "154", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                      "0"
                    ),
                    $h("text", { "x": "0", "y": "84", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                      $t($v.chart?.mid)
                    ),
                    $h("text", { "x": "0", "y": "14", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                      $t($v.chart?.top)
                    ),
                    $h("path", { "d": $v.chart?.line, "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "600", "style": "animation: sw-draw 6s ease-in-out infinite;" }),
                    ($l($v.chart?.pts)).map((p) => [
                      $h("circle", { "cx": p?.x, "cy": p?.y, "r": p?.r, "fill": p?.fill, "stroke": "#4C9AFF", "stroke-width": "2" }),
                      $h("text", { "x": p?.lx, "y": "174", "text-anchor": p?.anchor, "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                        $t(p?.label)
                      )
                    ])
                  ),
                  $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                    $t($v.vid?.growth)
                  )
                )
              ),
              $h("div", { "style": "display: flex; flex-direction: column;" },
                $h("span", { "style": "font-size: 15px; font-weight: 700; padding-bottom: 6px;" },
                  "Ce qu'elle fait"
                ),
                ($l($v.facts)).map((f) => [
                  $h("div", { "style": "display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 16px; padding: 12px 0; border-top: 1px solid var(--line); font-size: 14px;" },
                    $h("span", { "style": "color: var(--ink-faint);" },
                      $t(f?.k)
                    ),
                    $h("span", { "style": "color: var(--ink-soft); line-height: 1.5;" },
                      $t(f?.v)
                    )
                  )
                ])
              )
            ),
            $h("aside", { "aria-label": "Ensuite", "style": "display: flex; flex-direction: column; gap: 10px; min-width: 0;" },
              $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint);" },
                "Ensuite"
              ),
              ($l($v.next)).map((n) => [
                $h("a", { "href": n?.href, "style": "display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 12px; padding: 10px; border-radius: 16px; border: 1px solid var(--line); background: var(--row-hover); text-decoration: none; color: var(--ink);" },
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
            $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px;" },
              $h("a", { "ref": $v.setSkip, "class": "sw-btn sw-btn-icon", "href": $v.vid?.nextHref, "aria-label": "Passer cette vidéo", "title": "Passer (P)", "style": "background: var(--track);" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                )
              ),
              $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                "Passer"
              ),
              $h("span", { "class": "sw-kbd", "style": "height: 22px;" },
                "P"
              )
            ),
            $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 24px; background: var(--line);" }),
            $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px;" },
              $h("span", { "style": "position: relative; display: inline-flex;" },
                $h("button", { "data-aj-trigger": "true", "onClick": $v.toggleAj, "aria-expanded": $v.ajOpen, "aria-haspopup": "dialog", "class": "sw-btn sw-btn-icon", "type": "button", "aria-pressed": $v.kept, "aria-label": "Garder cette vidéo", "title": "Garder (G)", "style": `background: ${$t($v.keepBg)}; color: ${$t($v.keepInk)};` },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": $v.keepFill, "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                  )
                ),
                ($v.aj) ? [
                  $h("span", { "style": "position: absolute; bottom: calc(100% + 10px); left: 0; z-index: 45;" },
                    $h(AjoutDossier, { "onClose": $v.closeAj, "item": $v.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
                  )
                ] : null
              ),
              $h("span", { "style": `font-size: 13px; color: ${$t($v.keepInk)};` },
                $t($v.keepLabel)
              ),
              $h("span", { "class": "sw-kbd", "style": "height: 22px;" },
                "G"
              )
            ),
            $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.copy, "style": "margin-left: 12px;" },
              $t($v.copyLabel),
              $h("span", { "class": "sw-btn-tile" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("span", { "style": "margin-left: auto;" }),
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
