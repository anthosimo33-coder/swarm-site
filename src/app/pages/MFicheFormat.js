// Généré par scripts/dc2preact.py depuis design/app/MFormatFiche.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
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
    return Object.assign({ repsShown: st.allReps ? RP : RP.slice(0, 12), moreReps: !st.allReps && RP.length > 12, moreRepsLabel: 'Voir les ' + (RP.length - 12) + ' autres reprises', showReps: () => this.setState({ allReps: true }), followOn: f ? 'true' : 'false', toggleFollow, ajItem: fid ? { kind: 'format', id: fid, label: (b.f && b.f.raw) || '', cover: ((b.reps || []).filter((x) => x.src)[0] || {}).src || null } : null }, { followInk: f ? 'var(--accent)' : 'var(--ink-muted)', copyLabel: st.copied ? (b.f.kind === 'Son' ? 'Nom du son copié' : 'Accroche copiée') : (b.f.kind === 'Son' ? 'Copier le nom du son' : 'Copier l’accroche'), copy: () => { try { navigator.clipboard.writeText(b.f.raw); } catch (e) {} this.setState({ copied: true }); clearTimeout(this.tm); this.tm = setTimeout(() => this.setState({ copied: false }), 2400); } });
  }

  baseVals() {
    let f = {"rank": "01", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« Ich lösche das in 2h‼️ »", "raw": "Ich lösche das in 2h‼️", "gloss": "Vidéo supprimée dans 24 heures", "niche": "Études", "mk": [{"c": "DE"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "39×", "medInk": "var(--accent)", "hot": true, "max": "106 k", "apps": [{"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}], "appLine": "Retain Cards", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "last": "vu le 10/11", "cov": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}], "cov4": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "h": "@study.mit.sophia", "raw": 1064, "date": "06/11", "app": "Retain Cards"}], "views": 201780};
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let reps = [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "when": "10/11 · 17 h"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "when": "08/11 · 09 h"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "when": "06/11 · 19 h"}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "h": "@study.mit.sophia", "when": "06/11 · 09 h"}];
    reps = reps.map((x) => Object.assign({}, x, { href: '/app/videos/' + vkey(x.src) }));
    let common = [{"d": "M5 6h14M12 6v13M9 19h6", "t": "Le même texte à l’écran", "s": "Mot pour mot sur les 4 vidéos, en allemand."}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Une seule app derrière", "s": "Les 3 comptes poussent Retain Cards, une app de révision."}, {"d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "t": "4 reprises en 4 jours", "s": "Du 06/11 au 10/11, chaque reprise a fait mieux que la précédente."}];
    f = Object.assign({ flag: 'DE', hasFr: true, accLabel: '3 comptes', spanTxt: 'en 4 jours', bestV: '106 k vues', bestH: '@studywithdenise', repsTitle: 'Les 4 reprises' }, f);
    // Sur le site : le format (document « format:<id> »), lu comme FormatFicheA.
    const D = this.props && this.props.data;
    if (D && D.members) {
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
      const hook = D.kind === 'hook';
      const ms = D.members;
      const whole = ms.length >= D.n;
      const dnum = (t) => { const d = new Date(t); return Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000); };
      const first = ms.length ? Math.min.apply(null, ms.map((x) => x.publishedAt)) : D.lastPostAt;
      const span = Math.max(1, dnum(D.lastPostAt) - dnum(first));
      const best = ms[0];
      const APPS = 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z';
      f = Object.assign({}, f, { kind: hook ? 'Accroche' : 'Son', ico: hook ? TXT : SON, quote: hook ? '« ' + D.label + ' »' : D.label, raw: D.label, niche: D.niche || '',
        flag: D.market && D.market !== 'XX' ? D.market : '', n: D.accounts, ok: D.wins + '/' + D.n, okText: D.wins + ' sur ' + D.n, med: D.medX ? xf(D.medX) : '—', max: nf(D.maxViews || 0),
        app0: D.apps && D.apps[0] ? Object.assign({ name: D.apps[0].name }, ico(D.apps[0])) : { name: '', logo: '', nologo: true, blank: 'sw-app-blank' }, appLine: names(D.apps),
        hasFr: false, accLabel: D.accounts + ' comptes', spanTxt: 'en ' + span + (span > 1 ? ' jours' : ' jour') + (whole ? '' : ' ou plus'),
        bestV: best ? nf(best.views) + ' vues' : '—', bestH: best ? '@' + best.handle : '',
        repsTitle: whole ? 'Les ' + ms.length + ' reprises' : 'Les ' + ms.length + ' reprises les plus vues, sur ' + D.n });
      reps = ms.map((x) => ({ src: x.cover || '', v: nf(x.views), h: '@' + x.handle, when: day(x.publishedAt) + ' · ' + String(new Date(x.publishedAt).getHours()).padStart(2, '0') + ' h',
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
            $h("a", { "class": "sw-btn sw-btn-icon", "href": "/app/formats", "aria-label": "Retour", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-left: -10px;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
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
            $h("span", { "class": "sw-badge", "style": "height: 26px;" },
              $t($v.f?.niche)
            ),
            ($v.f?.flag) ? [
              $h("span", { "class": "sw-flag" },
                $t($v.f?.flag)
              )
            ] : null,
            $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--ink-muted);" },
              $h("span", { "class": `sw-app-icon ${$t($v.f?.app0?.blank)}`, "style": "width: 20px; height: 20px; border-radius: 6px;" },
                ($v.f?.app0?.logo) ? [
                  $h("img", { "class": "sw-logo-img", "src": $v.f?.app0?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
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
              $h("span", { "style": "font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
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
          $h("div", { "style": "display: flex; align-items: center; justify-content: center; gap: 8px;" },
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.toggleFollow, "aria-label": "Suivre ce format", "aria-pressed": $v.followOn, "style": `width: 44px; height: 44px; flex-shrink: 0; color: ${$t($v.followInk)};` },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.copy },
              $t($v.copyLabel),
              $h("span", { "class": "sw-btn-tile" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.openAj, "aria-label": "Ajouter à un dossier", "style": "width: 44px; height: 44px; flex-shrink: 0;" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          )
        ),
        $h("div", { "style": "padding: 18px 20px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
          $h("span", { "class": "sw-tile" },
            $h("span", { "class": "sw-tile-label" },
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
            $h("span", { "class": "sw-tile-label" },
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
            $h("span", { "class": "sw-tile-label" },
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
            $h("span", { "class": "sw-tile-label" },
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
          $h("h2", { "style": "margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
            $t($v.f?.repsTitle)
          )
        ),
        $h("div", { "style": "padding: 0 20px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;" },
          ($l($v.repsShown)).map((v) => [
            $h("a", { "href": v?.href, "style": "display: flex; flex-direction: column; gap: 6px; text-decoration: none; color: inherit;" },
              $h("span", { "class": "sw-video", "style": "display: block; border-radius: 18px;" },
                $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
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
          $h("h2", { "style": "margin: 0 0 4px; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
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
          $h("a", { "href": "/app/formats", "aria-current": "page", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--accent); font-size: 11px; font-weight: 700;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
