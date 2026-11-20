// Généré par scripts/dc2preact.py depuis design/app/MFormatFiche.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MFicheFormat extends DCLogic {

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
    // Suivre : sur le site, follows.formats (saved) ; sur le canevas, l'état local.
    const fid = (P.data && P.data.id) || (P.params && P.params.id) || (live ? '' : 'exemple');
    const fw = live ? P.saved('follows') : null;
    const f = live ? !!(fw && (fw.formats || []).indexOf(fid) >= 0) : !!st.follow;
    const toggleFollow = () => {
      if (!live) return this.setState({ follow: !f });
      const cur = P.saved('follows');
      if (cur === undefined || !fid) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.formats || [];
      next.formats = l.indexOf(fid) >= 0 ? l.filter((x) => x !== fid) : [fid].concat(l);
      P.save('follows', next);
    };
    const RP = b.reps || [];
    return Object.assign({ repsShown: st.allReps ? RP : RP.slice(0, 12), moreReps: !st.allReps && RP.length > 12, moreRepsLabel: 'Voir les ' + (RP.length - 12) + ' autres reprises', showReps: () => this.setState({ allReps: true }), followOn: f ? 'true' : 'false', toggleFollow, ajItem: fid ? { kind: 'format', id: fid, label: (b.f && b.f.raw) || '', cover: ((b.reps || []).filter((x) => x.src)[0] || {}).src || null } : null }, { followInk: f ? 'var(--accent)' : 'var(--ink-muted)', followYes: f, followNo: !f, followAria: f ? 'Ne plus suivre ce format' : 'Suivre ce format', followText: f ? 'Suivi' : 'Suivre',
      // La capsule retour (6C) : l'écran d'où l'on vient (history.state.from, posé par tabbar.js), sinon la liste des formats.
      backName: (typeof history !== 'undefined' && history.state && history.state.from && history.state.from.name) || '' || 'Formats', copyLabel: st.copied ? (b.f.kind === 'Son' ? 'Nom du son copié' : 'Accroche copiée') : (b.f.kind === 'Son' ? 'Copier le nom du son' : 'Copier l’accroche'), copy: () => { try { navigator.clipboard.writeText(b.f.raw); } catch (e) {} this.setState({ copied: true }); clearTimeout(this.tm); this.tm = setTimeout(() => this.setState({ copied: false }), 2400); } });
  }

  baseVals() {
    let f = (globalThis.__dcSample?.["MFicheFormat"]?.["f"] ?? {"rank":"","kind":"","ico":"","isHook":true,"isSon":false,"quote":"","raw":"","gloss":"","niche":"","mk":[],"n":3,"ok":"","okText":"","pips":[],"med":"","medInk":"","hot":true,"max":"","apps":[],"appLine":"","app0":{"name":"","logo":"","nologo":false,"blank":""},"last":"","cov":[],"cov4":[],"views":201780});
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let reps = (globalThis.__dcSample?.["MFicheFormat"]?.["reps"] ?? []);
    reps = reps.map((x) => Object.assign({}, x, { href: '/app/videos/' + vkey(x.src) }));
    let common = [{"d": "M5 6h14M12 6v13M9 19h6", "t": "Le même texte à l’écran", "s": "Mot pour mot sur les 4 vidéos, en allemand."}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Une seule app derrière", "s": "Les 3 comptes poussent Retain Cards, une app de révision."}, {"d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "t": "4 reprises en 4 jours", "s": "Du 06/11 au 10/11, chaque reprise a fait mieux que la précédente."}];
    f = Object.assign({ flag: 'DE', hasFr: true, accLabel: '3 comptes', spanTxt: 'en 4 jours', bestV: '106 k vues', bestH: (globalThis.__dcSample?.["MFicheFormat"]?.["$s2"] ?? ""), repsTitle: 'Les 4 reprises' }, f);
    // Sur le site : le format (document « format:<id> »), lu comme FormatFicheA.
    const D = this.props && this.props.data;
    if (D && D.members) {
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
      const hook = D.kind === 'hook';
      const ms = D.members;
      const whole = ms.length >= D.n;
      const dnum = (t) => { const d = new Date(t); return Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000); };
      const first = ms.length ? Math.min.apply(null, ms.map((x) => x.publishedAt)) : D.lastPostAt;
      const span = Math.max(1, dnum(D.lastPostAt) - dnum(first));
      const best = ms[0];
      const APPS = 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z';
      f = Object.assign({}, f, { kind: hook ? 'Accroche' : 'Son', ico: hook ? TXT : SON, quote: hook ? '« ' + D.label + ' »' : D.label, raw: D.label, niche: D.niche || '',
        flag: D.market || '', n: D.accounts, ok: D.wins + '/' + D.n, okText: D.wins + ' sur ' + D.n, med: D.medX ? xf(D.medX) : '—', max: nf(D.maxViews || 0),
        app0: D.apps && D.apps[0] ? Object.assign({ name: D.apps[0].name }, ico(D.apps[0])) : { name: '', logo: '', nologo: true, blank: 'sw-app-blank' }, appLine: names(D.apps),
        hasFr: false, accLabel: D.accounts + ' comptes', spanTxt: 'en ' + span + (span > 1 ? ' jours' : ' jour') + (whole ? '' : ' ou plus'),
        bestV: best ? nf(best.views) + ' vues' : '—', bestH: best ? '@' + best.handle : '',
        repsTitle: whole ? 'Les ' + ms.length + ' reprises' : 'Les ' + ms.length + ' reprises les plus vues, sur ' + D.n });
      reps = ms.map((x) => ({ src: x.cover || '', v: nf(x.views), h: '@' + x.handle, when: day(x.publishedAt) + ' · ' + String(new Date(x.publishedAt).getHours()).padStart(2, '0') + '\u202fh',
        href: '/app/videos/' + x.videoId }));
      common = [hook ? { d: TXT, t: 'Le même texte à l’écran', s: 'Sur les ' + D.n + ' reprises, chez ' + D.accounts + ' comptes.' }
          : { d: SON, t: 'Le même son', s: 'Posé sur les ' + D.n + ' reprises, par ' + D.accounts + ' comptes.' },
        (D.apps || []).length === 1 ? { d: APPS, t: 'Une seule app derrière', s: 'Les ' + D.accounts + ' comptes poussent ' + D.apps[0].name + '.' }
          : (D.apps || []).length > 1 ? { d: APPS, t: D.apps.length + ' apps derrière', s: 'Chaque compte pousse la sienne : ' + names(D.apps) + '.' } : null,
        D.n ? { d: 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6', t: D.wins + ' reprises sur ' + D.n + ' au-dessus de leur normale', s: D.medX ? 'En médiane, ' + xf(D.medX) + ' la normale du compte.' : 'Comparé aux vues habituelles de chaque compte.' } : null
      ].filter(Boolean);
    }
    return { f, reps, common, flag: f.flag };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              $t($v.f?.kind)
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
        $h("div", { "style": "padding: 18px 20px 0; display: flex; flex-direction: column; gap: 16px;" },
          $h("span", { "style": "display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" },
            $h("span", { "class": "sw-badge", "style": "height: 26px; gap: 6px;" },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": $v.f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.f?.kind)
            ),
            $h("span", { "class": "m-tagn" },
              $h("span", { "class": "m-ic", "data-i": $v.f?.niche, "aria-hidden": "true" }),
              $t($v.f?.niche)
            ),
            ($v.f?.flag) ? [
              $h("span", { "class": "sw-flag", "data-c": $v.f?.flag, "aria-hidden": "true" })
            ] : null,
            $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-muted);" },
              $h("span", { "class": `sw-app-icon ${$t($v.f?.app0?.blank)}`, "style": "width: 20px; height: 20px; border-radius: 6px;" },
                ($v.f?.app0?.logo) ? [
                  $h("img", { "class": "sw-logo-img", "src": $u($v.f?.app0?.logo), "alt": "", "loading": "lazy", "decoding": "async" })
                ] : null,
                ($v.f?.app0?.nologo) ? [
                  $h("svg", { "width": "10", "height": "10", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ] : null
              ),
              $t($v.f?.appLine)
            )
          ),
          $h("span", { "style": "line-height: 1.6;" },
            $h("span", { "style": "background: #FFFFFF; color: #111216; font-size: 30px; font-weight: 800; padding: 4px 10px; border-radius: 10px; -webkit-box-decoration-break: clone; box-decoration-break: clone;" },
              $t($v.f?.raw)
            )
          ),
          ($v.f?.hasFr) ? [
            $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--ink-muted);" },
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                  $h("path", { "d": "M4 5h8M8 3v2M5 9c1.5 3 4 5 7 6M11 5c-1 4-3.5 7-7 9M13 21l4-9 4 9M14.5 18h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "En français"
              ),
              $h("span", { "style": "font-size: 20px; font-weight: 600; color: var(--ink-soft);" },
                "« Je supprime ça dans 2 h ‼️ »"
              ),
              $h("span", { "style": "font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
                "Le principe : la vidéo va disparaître, il faut la regarder maintenant."
              )
            )
          ] : null,
          $h("div", { "style": "display: flex; align-items: center; gap: 8px; flex-wrap: wrap;" },
            $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.toggleFollow, "aria-label": $v.followAria, "aria-pressed": $v.followOn, "style": "height: 40px; gap: 7px;" },
              ($v.followYes) ? [
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ] : null,
              ($v.followNo) ? [
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round" })
                )
              ] : null,
              $t($v.followText)
            ),
            $h("button", { "class": "sw-pill", "type": "button", "onClick": $v.openAj, "style": "height: 40px; gap: 7px;" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Ajouter à un dossier"
            )
          )
        ),
        $h("div", { "style": "padding: 18px 20px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
          $h("span", { "class": "sw-tile" },
            $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; " },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M3 3v18h18M7 15l4-4 3 3 5-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "× la normale"
            ),
            $h("span", { "class": "sw-tile-value", "style": "color: var(--accent);" },
              $t($v.f?.med)
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              "médiane des reprises"
            )
          ),
          $h("span", { "class": "sw-tile" },
            $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; " },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Réussite"
            ),
            $h("span", { "class": "sw-tile-value" },
              $t($v.f?.okText)
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              "au-dessus de leur normale"
            )
          ),
          $h("span", { "class": "sw-tile" },
            $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; " },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Repris par"
            ),
            $h("span", { "class": "sw-tile-value" },
              $t($v.f?.accLabel)
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              $t($v.f?.spanTxt)
            )
          ),
          $h("span", { "class": "sw-tile" },
            $h("span", { "class": "sw-tile-label", "style": "display: flex; align-items: center; gap: 6px; " },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M13 2L4 14h7l-1 8 9-12h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Meilleure reprise"
            ),
            $h("span", { "class": "sw-tile-value" },
              $t($v.f?.bestV)
            ),
            $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
              $t($v.f?.bestH)
            )
          )
        ),
        $h("div", { "style": "padding: 26px 20px 12px;" },
          $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
              $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $t($v.f?.repsTitle)
          )
        ),
        $h("div", { "style": "padding: 0 20px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;" },
          ($l($v.repsShown)).map((v) => [
            $h("a", { "href": $u(v?.href), "style": "display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: inherit;" },
              $h("span", { "class": "sw-video", "style": "display: block; border-radius: 18px;" },
                $h("img", { "class": "sw-cover", "src": $u(v?.src), "alt": "", "loading": "lazy", "decoding": "async" }),
                $h("span", { "class": "sw-video-shade" }),
                $h("span", { "class": "sw-badge", "style": "position: absolute; top: 8px; left: 8px; height: 22px; font-size: 10px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                  $t(v?.when)
                ),
                $h("span", { "class": "sw-video-foot" },
                  $h("span", { "class": "sw-video-views", "style": "font-size: 22px;" },
                    $t(v?.v)
                  )
                )
              ),
              $h("span", { "style": "font-size: 13px; font-weight: 600; color: var(--ink-soft);" },
                $t(v?.h)
              )
            )
          ])
        ),
        ($v.moreReps) ? [
          $h("div", { "style": "display: flex; justify-content: center; padding: 6px 20px 0;" },
            $h("button", { "class": "sw-more", "type": "button", "onClick": $v.showReps, "style": "min-height: 44px; border: 0; background: transparent; cursor: pointer; font-family: inherit; font-size: 14px;" },
              $t($v.moreRepsLabel),
              $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          )
        ] : null,
        $h("div", { "style": "padding: 26px 20px 0; display: flex; flex-direction: column; gap: 10px;" },
          $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0 0 4px; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
              $h("path", { "d": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Ce que les reprises ont en commun"
          ),
          ($l($v.common)).map((c) => [
            $h("div", { "class": "sw-card", "style": "border-radius: 18px; padding: 16px; display: flex; gap: 14px; align-items: flex-start;" },
              $h("span", { "style": "width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                $h("svg", { "width": "19", "height": "19", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": c?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("span", { "style": "display: flex; flex-direction: column; gap: 3px;" },
                $h("span", { "style": "font-size: 15px; font-weight: 700;" },
                  $t(c?.t)
                ),
                $h("span", { "style": "font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
                  $t(c?.s)
                )
              )
            )
          ])
        ),
        $h("div", { "data-thumb": "", "style": "position: fixed; left: 14px; right: 14px; bottom: max(14px, env(safe-area-inset-bottom)); z-index: 30; display: flex; align-items: center; gap: 8px; pointer-events: none;" },
          $h("a", { "data-thumb-back": "", "href": "/app/formats", "aria-label": `Revenir à ${$t($v.backName)}`, "style": "pointer-events: auto; flex: 0 3 auto; min-width: 50px; height: 50px; box-sizing: border-box; padding: 0 18px 0 12px; display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 25px; background: rgba(22,27,38,0.9); backdrop-filter: blur(18px) saturate(1.4); -webkit-backdrop-filter: blur(18px) saturate(1.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12), 0 14px 36px rgba(0,0,0,0.5); color: #FFFFFF; font-family: inherit; font-size: 15px; font-weight: 600; line-height: 1; text-decoration: none; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
            $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
              $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
              $t($v.backName)
            )
          ),
          $h("span", { "aria-hidden": "true", "style": "flex: 1 1 0;" }),
          $h("span", { "data-thumb-act": "", "style": "pointer-events: auto; flex: 0 1 auto; min-width: 0; display: flex; align-items: center; gap: 8px;" },
            $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.copy, "style": "flex: 0 1 auto; min-width: 0; height: 50px; padding: 0 5px 0 18px; gap: 10px; font-size: 15px; text-decoration: none;" },
              $h("span", { "style": "min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                $t($v.copyLabel)
              ),
              $h("span", { "class": "sw-btn-tile", "style": "width: 36px; height: 36px;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
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
