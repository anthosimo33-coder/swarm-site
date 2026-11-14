// Généré par scripts/dc2preact.py depuis design/app/FormatFicheA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import Palette from './Palette.js';

export default class FicheFormat extends DCLogic {

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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'formats' ? 'page' : 'false' }));
    return {
      sb, me,
      getFn: this.props && this.props.get, savedFn: this.props && this.props.saved, saveFn: this.props && this.props.save,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const P = this.props || {};
    const live = typeof P.saved === 'function' && typeof P.save === 'function';
    const D = P.data;
    const id = (D && D.id) || (P.params && P.params.id) || (live ? '' : 'ich-losche');
    // Suivre : sur le site, follows.formats (saved) ; sur le canevas, l'état local.
    const fw = live ? P.saved('follows') : null;
    const f = live ? !!(fw && (fw.formats || []).indexOf(id) >= 0) : !!st.follow;
    const toggleFollow = () => {
      if (!live) return this.setState({ follow: !f });
      const cur = P.saved('follows');
      if (cur === undefined || !id) return;
      const next = Object.assign({ apps: [], creators: [], formats: [] }, cur || {});
      const l = next.formats || [];
      next.formats = l.indexOf(id) >= 0 ? l.filter((x) => x !== id) : [id].concat(l);
      P.save('follows', next);
    };
    // Ce que « Ajouter à un dossier » range : le format, tel que la liste l'affiche, avec la miniature d'une reprise.
    const cover = D ? (((D.members || []).filter((m) => m.cover)[0] || {}).cover || null) : ((b.reps[0] || {}).src || null);
    const label = D ? (D.kind === 'hook' ? '« ' + D.label + ' »' : D.label) : '« ' + b.f.quote + ' »';
    return Object.assign({ followOn: f ? 'true' : 'false', toggleFollow, ajItem: { kind: 'format', id, label, cover } }, { followAria: f ? 'Ne plus suivre ce format' : 'Suivre ce format', followInk: f ? 'var(--accent)' : 'var(--ink-muted)',
      copyLabel: b.f.isSound ? (st.copied ? 'Nom du son copié' : 'Copier le nom du son') : (st.copied ? 'Accroche copiée' : 'Copier l’accroche'),
      copyHook: () => { try { navigator.clipboard.writeText(b.f.quote); } catch (e) {} this.setState({ copied: true }); clearTimeout(this.tm); this.tm = setTimeout(() => this.setState({ copied: false }), 2400); } });
  }

  baseVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "page"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    let f = {"quote": "Ich lösche das in 2h‼️", "fr": "Je supprime ça dans 2 h ‼️", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "mk": [{"c": "DE"}], "med": "39×", "okText": "3 sur 4", "n": 3, "max": "106 k", "rev": "Entre 500 et 710 €", "niche": "Études", "last": "vu le 10/11"};
    let tiles = [{"l": "Repris par", "v": "3 comptes", "s": "en 4 jours", "ink": "var(--ink)"}, {"l": "Réussite", "v": "3 sur 4", "s": "au-dessus de leur normale", "ink": "var(--ink)"}, {"l": "× la normale", "v": "39×", "s": "médiane des reprises", "ink": "var(--accent)"}, {"l": "Meilleure reprise", "v": "106 k vues", "s": "@studywithdenise, 10/11", "ink": "var(--ink)"}];
    let reps = [{"src":"/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards", "when": "10/11 · 17 h", "day": "10/11"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards", "when": "08/11 · 09 h", "day": "08/11"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards", "when": "06/11 · 19 h", "day": "06/11"}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "h": "@study.mit.sophia", "raw": 1064, "date": "06/11", "app": "Retain Cards", "when": "06/11 · 09 h", "day": "06/11"}];
    let common = [{"d":"M5 6h14M12 6v13M9 19h6", "t": "Le même texte à l’écran", "s": "Mot pour mot sur les 4 vidéos, en allemand."}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Une seule app derrière", "s": "Les 3 comptes poussent Retain Cards, une app de révision."}, {"d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "t": "4 reprises en 4 jours", "s": "Du 06/11 au 10/11, chaque reprise a fait mieux que la précédente."}];
    const HOOK = 'M5 6h14M12 6v13M9 19h6';
    const SON = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
    // Sur le canevas : l'exemple ci-dessus.
    f = Object.assign({ kind: 'Accroche', ico: HOOK, isSound: false, hasFr: true, moreApps: '', apps: [Object.assign({ href: '/app/apps/' + 'retaincards' }, f.app0)] }, f);
    reps = reps.map((v) => Object.assign({ href: '/app/videos/7705929733220994337' }, v));
    let repsTitle = 'Les 4 reprises';

    // Sur le site : la fiche du format depuis le Radar (document « format:<id> », convex/radarModels.ts).
    const D = this.props && this.props.data;
    if (D && D.members) {
      const nf = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 1e3 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n)));
      const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('fr-FR') : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const dnum = (ms) => { const d = new Date(ms); return Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000); };
      const APPS = 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z';
      const TREND = 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6';
      const hook = D.kind === 'hook';
      const ms = D.members;
      // La fiche porte 30 reprises au plus (les plus vues) : au-delà, la plus ancienne peut manquer.
      const whole = ms.length >= D.n;
      const others = (n) => 'et ' + n + (n > 1 ? ' autres' : ' autre');
      const names = (as) => (as.length > 3 ? as.slice(0, 2).map((a) => a.name).join(', ') + ' ' + others(as.length - 2)
        : as.length > 1 ? as.slice(0, -1).map((a) => a.name).join(', ') + ' et ' + as[as.length - 1].name : as.map((a) => a.name).join(''));
      const shown = D.apps.slice(0, 4);
      const more = D.apps.length - shown.length;
      f = {
        quote: D.label, kind: hook ? 'Accroche' : 'Son', ico: hook ? HOOK : SON, isSound: !hook, niche: D.niche,
        mk: D.market === 'XX' ? [] : [{ c: D.market }], hasFr: false, fr: '',
        apps: shown.map((a) => ({ name: a.name, logo: a.icon || false, nologo: !a.icon, blank: a.icon ? '' : 'sw-app-blank', href: '/app/apps/' + a.slug })),
        moreApps: more > 0 ? others(more) : '', last: 'dernière reprise le ' + day(D.lastPostAt)
      };
      // De la première reprise connue à la dernière (dates de publication).
      const first = ms.length ? Math.min.apply(null, ms.map((m) => m.publishedAt)) : D.lastPostAt;
      const span = Math.max(1, dnum(D.lastPostAt) - dnum(first));
      const spanTxt = 'en ' + span + (span > 1 ? ' jours' : ' jour') + (whole ? '' : ' ou plus');
      const best = ms[0];
      tiles = [
        { l: 'Repris par', v: D.accounts + ' comptes', s: spanTxt, ink: 'var(--ink)' },
        { l: 'Réussite', v: D.wins + ' sur ' + D.n, s: 'au-dessus de leur normale', ink: 'var(--ink)' },
        D.medX ? { l: '× la normale', v: xf(D.medX), s: 'médiane des reprises', ink: D.medX >= 10 ? 'var(--accent)' : 'var(--ink)' } : null,
        best ? { l: 'Meilleure reprise', v: nf(best.views) + ' vues', s: '@' + best.handle + ', ' + day(best.publishedAt), ink: 'var(--ink)' } : null,
      ].filter(Boolean); // pas de revenus pour un format (décision du 13/11) : seulement par app
      const one = D.apps.length === 1 ? D.apps[0].name : '';
      reps = ms.map((m) => ({ src: m.cover || '', v: nf(m.views), h: '@' + m.handle, app: one, href: '/app/videos/' + m.videoId,
        when: day(m.publishedAt) + ' · ' + String(new Date(m.publishedAt).getHours()).padStart(2, '0') + '\u202fh' }));
      repsTitle = whole ? 'Les ' + ms.length + ' reprises' : 'Les ' + ms.length + ' reprises les plus vues, sur ' + D.n;
      common = [
        hook ? { d: HOOK, t: 'Le même texte à l’écran', s: 'Sur les ' + D.n + ' reprises, chez ' + D.accounts + ' comptes.' }
          : { d: SON, t: 'Le même son', s: 'Posé sur les ' + D.n + ' reprises, par ' + D.accounts + ' comptes.' },
        D.apps.length === 1 ? { d: APPS, t: 'Une seule app derrière', s: 'Les ' + D.accounts + ' comptes poussent ' + D.apps[0].name + '.' }
          : D.apps.length > 1 ? { d: APPS, t: D.apps.length + ' apps derrière', s: 'Chaque compte pousse la sienne : ' + names(D.apps) + '.' } : null,
        ms.length ? { d: TREND, t: D.n + ' reprises ' + spanTxt,
          s: !whole ? 'Dernière reprise le ' + day(D.lastPostAt) + '.' : span === 1 && dnum(first) === dnum(D.lastPostAt) ? 'Toutes publiées le ' + day(first) + '.' : 'Du ' + day(first) + ' au ' + day(D.lastPostAt) + '.' } : null
      ].filter(Boolean);
    }
    const TIL = { 'Repris par': 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c1-4 4-6 7-6s6 2 7 6M16 3.5a4 4 0 0 1 0 7.5M22 21c-.6-2.6-2-4.4-4-5.3', 'Réussite': 'M5 12l5 5 9-10', '× la normale': 'M3 3v18h18M7 15l4-4 3 3 5-6', 'Meilleure reprise': 'M13 2L4 14h7l-1 8 9-12h-7z' };
    return { nav, f, tiles: tiles.map((t) => Object.assign({}, t, { ic: TIL[t.l] || '' })), tileN: tiles.length || 1, reps, common, repsTitle };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1400px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("nav", { "class": "sw-sidebar", "aria-label": "Navigation principale" },
          $h("a", { "class": "sw-side-logo", "href": "/app", "aria-label": "Swarm, accueil" },
            $h("span", { "class": "sw-app-tile" },
              $h("svg", { "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#FFFFFF" }),
                $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" }),
                $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF", "fill-opacity": "0.6" })
              )
            )
          ),
          $h("button", { "class": "sw-side-item", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher", "style": "border: 0; background: transparent; font-family: inherit; cursor: pointer;" },
            $h("span", { "class": "sw-side-ico" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            "Chercher"
          ),
          ($l($v.sb)).map((n) => [
            $h("a", { "class": "sw-side-item", "href": n?.href, "aria-current": n?.cur },
              $h("span", { "class": "sw-side-ico" },
                $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": n?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $t(n?.label)
            )
          ]),
          $h("div", { "class": "sw-side-foot" },
            $h("a", { "class": "sw-avatar", "href": "/app/compte", "aria-label": "Mon compte", "style": "text-decoration: none;" },
              $t($v.me?.initiale)
            )
          )
        ),
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; background: var(--surface);" },
          $h("nav", { "aria-label": "Fil d’Ariane", "style": "padding: 28px 32px 0; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-faint);" },
            $h("a", { "class": "sw-link-quiet", "href": "/app/formats" },
              "Formats"
            ),
            $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M9 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("span", { "style": "color: var(--ink-soft);" },
              $t($v.f?.kind)
            )
          ),
          $h("section", { "class": "sw-card", "style": "margin: 18px 32px 0; padding: 36px 40px; border-radius: 28px; overflow: hidden; display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; flex-wrap: wrap;" },
            $h("div", { "aria-hidden": "true", "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(60% 90% at 85% 0%, #000, transparent); mask-image: radial-gradient(60% 90% at 85% 0%, #000, transparent);" }),
            $h("div", { "style": "position: relative; display: flex; flex-direction: column; gap: 22px; min-width: 0; max-width: 760px;" },
              $h("span", { "style": "display: flex; align-items: center; gap: 10px; flex-wrap: wrap;" },
                $h("span", { "class": "sw-badge", "style": "height: 26px; gap: 6px;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": $v.f?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t($v.f?.kind)
                ),
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 11px; border-radius: 999px; background: var(--track); box-shadow: inset 0 0 0 1px var(--line); font-size: 13px; font-weight: 500; color: var(--ink);" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-muted);" },
                    $h("path", { "d": "M3 12V4h8l10 10-8 8zM7.5 7.5h.01", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t($v.f?.niche)
                ),
                ($l($v.f?.mk)).map((m) => [
                  $h("span", { "class": "sw-flag", "data-c": m?.c, "style": "width: 26px; height: 20px; font-size: 10px;" },
                    $t(m?.c)
                  )
                ]),
                ($l($v.f?.apps)).map((a) => [
                  $h("a", { "href": a?.href, "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-muted); text-decoration: none;" },
                    $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 22px; height: 22px; border-radius: 7px;" },
                      (a?.logo) ? [
                        $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null,
                      (a?.nologo) ? [
                        $h("svg", { "width": "11", "height": "11", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ] : null
                    ),
                    $t(a?.name)
                  )
                ]),
                ($v.f?.moreApps) ? [
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                    $t($v.f?.moreApps)
                  )
                ] : null,
                $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                  "· ", $t($v.f?.last)
                )
              ),
              $h("span", { "style": "line-height: 1.55;" },
                $h("span", { "style": "background: #FFFFFF; color: #111216; font-family: var(--font-body); font-size: 44px; font-weight: 800; letter-spacing: -0.01em; padding: 6px 14px; border-radius: 12px; -webkit-box-decoration-break: clone; box-decoration-break: clone;" },
                  $t($v.f?.quote)
                )
              ),
              ($v.f?.hasFr) ? [
                $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                  $h("span", { "style": "font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
                    "En français"
                  ),
                  $h("span", { "style": "font-size: 22px; font-weight: 600; letter-spacing: -0.01em; color: var(--ink-soft);" },
                    "« ", $t($v.f?.fr), " »"
                  ),
                  $h("span", { "style": "font-size: 15px; color: var(--ink-muted);" },
                    "Le principe : la vidéo va disparaître, il faut la regarder maintenant."
                  )
                )
              ] : null
            ),
            $h("div", { "style": "position: relative; display: flex; flex-direction: column; align-items: flex-end; gap: 14px;" },
              $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.copyHook },
                $t($v.copyLabel),
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              $h("span", { "style": "display: flex; gap: 4px;" },
                $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.toggleFollow, "aria-pressed": $v.followOn, "aria-label": $v.followAria, "style": `color: ${$t($v.followInk)};` },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("span", { "style": "position: relative; display: inline-flex;" },
                  $h("button", { "data-aj-trigger": "true", "onClick": $v.toggleAj, "aria-expanded": $v.ajOpen, "aria-haspopup": "dialog", "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Ajouter à un dossier" },
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  ($v.aj) ? [
                    $h("span", { "style": "position: absolute; top: calc(100% + 10px); right: 0; z-index: 45;" },
                      $h(AjoutDossier, { "onClose": $v.closeAj, "item": $v.ajItem, "saved": $v.savedFn, "save": $v.saveFn })
                    )
                  ] : null
                )
              )
            )
          ),
          $h("div", { "style": `margin: 16px 32px 0; display: grid; grid-template-columns: repeat(${$t($v.tileN)}, minmax(0, 1fr)); gap: 12px;` },
            ($l($v.tiles)).map((t) => [
              $h("div", { "class": "sw-card", "style": "padding: 18px 20px; border-radius: 20px; display: flex; flex-direction: column; gap: 6px;" },
                $h("span", { "class": "sw-tile-label", "style": "display: inline-flex; align-items: center; gap: 7px;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                    $h("path", { "d": t?.ic, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t(t?.l)
                ),
                $h("span", { "class": "sw-tile-value", "style": `color: ${$t(t?.ink)};` },
                  $t(t?.v)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  $t(t?.s)
                )
              )
            ])
          ),
          $h("div", { "style": "padding: 36px 32px 14px; display: flex; align-items: baseline; justify-content: space-between;" },
            $h("h2", { "class": "sw-card-title", "style": "display: flex; align-items: center; gap: 9px; font-size: 20px;" },
              $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.repsTitle)
            ),
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              "Triées par vues"
            )
          ),
          $h("div", { "style": "padding: 0 32px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px;" },
            ($l($v.reps)).map((v) => [
              $h("a", { "href": v?.href, "style": "display: flex; flex-direction: column; gap: 10px; text-decoration: none; color: inherit;" },
                $h("span", { "class": "sw-video", "style": "display: block; border-radius: 20px;" },
                  $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                  $h("span", { "class": "sw-video-shade" }),
                  $h("span", { "class": "sw-badge", "style": "position: absolute; top: 12px; left: 12px; height: 24px; font-size: 11px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                    $t(v?.when)
                  ),
                  $h("span", { "class": "sw-video-foot" },
                    $h("span", { "class": "sw-video-views", "style": "font-size: 26px;" },
                      $t(v?.v)
                    )
                  )
                ),
                $h("span", { "style": "display: flex; justify-content: space-between; font-size: 13px;" },
                  $h("span", { "style": "color: var(--ink-soft); font-weight: 600;" },
                    $t(v?.h)
                  ),
                  $h("span", { "style": "color: var(--ink-faint);" },
                    $t(v?.app)
                  )
                )
              )
            ])
          ),
          $h("div", { "style": "padding: 36px 32px 48px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;" },
            ($l($v.common)).map((c) => [
              $h("div", { "class": "sw-card", "style": "padding: 22px 24px; border-radius: 20px; display: flex; gap: 16px; align-items: flex-start;" },
                $h("span", { "style": "width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": c?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 700; letter-spacing: -0.01em;" },
                    $t(c?.t)
                  ),
                  $h("span", { "style": "font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
                    $t(c?.s)
                  )
                )
              )
            ])
          )
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
