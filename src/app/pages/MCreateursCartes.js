// Généré par scripts/dc2preact.py depuis design/app/MCreateursCartes.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MCreateursCartes extends DCLogic {

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
    const LIM = 30;
    const P = this.props || {};
    const D = P.data;
    const site = D !== undefined || typeof P.get === 'function';
    const market = st.market || (D && D.market) || 'FR';
    const active = !!st.active, lim = st.lim || LIM;
    const PH = { FR: 'en France', US: 'anglophones', MX: 'en Amérique latine', ES: 'en Espagne', BR: 'au Brésil et au Portugal', XX: 'dans d’autres langues' };
    let src = { rows: b.rows, cards: b.cards, live: b.live }, none = market !== 'FR', total = null, tip = { on: true, text: '@paul.crown4 : 104 abonnés, 33 k vues médianes.' };
    let MK = b.mkt || [];
    if (!site && none) src = { rows: [], cards: [], live: [] };
    if (site) {
      // Sur le site : les créateurs d'un marché (document « creators:<marché> ») ; un autre marché se lit avec get(),
      // et la liste d'avant reste affichée pendant qu'il charge. Lu comme CreateursA.
      MK = [['FR', 'France'], ['US', 'Anglophones'], ['MX', 'Amérique latine'], ['ES', 'Espagne'], ['BR', 'Brésil et Portugal'], ['XX', 'Autres langues']].map((x) => ({ c: x[0], l: x[1] }));
      let doc = D && D.market === market ? D : (P.get ? P.get('creators:' + market) : null);
      if (doc === undefined) doc = this.lastDoc === undefined ? null : this.lastDoc;
      else this.lastDoc = doc;
      const list = doc && doc.creators ? doc.creators : [];
      none = list.length === 0;
      total = doc && doc.total ? doc.total : list.length;
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
      const isN = (n) => typeof n === 'number' && isFinite(n);
      const ago = (ms) => { const hr = Math.max(1, Math.round((Date.now() - ms) / 3600000)); const d = Math.round(hr / 24);
        return hr < 24 ? 'il y a ' + hr + ' h' : d < 60 ? 'il y a ' + d + ' j' : d < 365 ? 'il y a ' + Math.round(d / 30.4) + ' mois' : 'il y a ' + Math.round(d / 365) + (d < 548 ? ' an' : ' ans'); };
      const line = (s) => { const ls = String(s || '').split('\n').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean); return ls.filter((x) => /\p{L}/u.test(x))[0] || ls[0] || ''; };
      const all = list.map((c) => {
        const a = c.app || null, ic = (a && a.icon) || '', on = c.posts7d > 0, bst = (c.best || [])[0];
        return { av: c.avatar || '', noav: true, h: '@' + c.handle, href: '/app/createurs/' + c.handle, bio: line(c.bio),
          app: { name: a ? a.name : '', logo: ic, nologo: !ic, blank: ic ? '' : 'sw-app-blank' }, appName: a ? a.name : 'Sans app repérée', niche: (a && a.niche) || '',
          fans: isN(c.fans) ? Math.round(c.fans).toLocaleString('en-US').replace(/,/g, '\u202f') : '', fansK: isN(c.fans) ? nf(c.fans) : '—', nFans: isN(c.fans) ? c.fans : -1,
          med: isN(c.median) ? nf(c.median) : '—', nMed: isN(c.median) ? c.median : 0,
          rythme: isN(c.posts7d) ? (on ? c.posts7d + (c.posts7d > 1 ? ' vidéos' : ' vidéo') + ' en 7 j' : 'Rien en 7 j') : '',
          last: c.lastPostAt ? 'Dernière ' + ago(c.lastPostAt) : '', lastAt: c.lastPostAt || 0, dot: on ? 'var(--accent)' : 'var(--line-strong)', active: on,
          cov1: [{ src: bst ? bst.cover || '' : '', v: bst ? nf(bst.views) : '' }] };
      });
      src = { rows: all, cards: all, live: all.filter((c) => c.active).slice().sort((p, q) => q.lastAt - p.lastAt).slice(0, 8) };
      const star = all.filter((c) => c.nFans > 0 && c.nMed >= 1e4 && c.nMed >= 10 * c.nFans).sort((x, y) => y.nMed / y.nFans - x.nMed / x.nFans)[0];
      tip = star ? { on: true, text: star.h + ' : ' + star.fans + (star.nFans > 1 ? ' abonnés' : ' abonné') + ', ' + star.med + ' vues médianes.' } : { on: false, text: '' };
    }
    const pool = (xs) => (xs || []).filter((c) => !active || c.active);
    const rowsAll = pool(src.rows).map((c, i) => Object.assign({ href: '/app/createurs/zinedine.gsbb' }, c, { rank: String(i + 1).padStart(2, '0') }));
    const cardsAll = pool(src.cards).map((c) => Object.assign({ href: '/app/createurs/zinedine.gsbb' }, c));
    const shownAll = b.rows ? rowsAll : cardsAll;
    const more = shownAll.length - lim;
    return { mkt: MK.map((m) => Object.assign({}, m, { flag: m.c === 'XX' ? '' : m.c, on: m.c === market ? 'true' : 'false', pick: () => this.setState({ market: m.c, lim: LIM }) })),
      rows: rowsAll.slice(0, lim), cards: cardsAll.slice(0, lim), live: pool(src.live).map((c) => Object.assign({ href: '/app/createurs/zinedine.gsbb' }, c)), none, tip,
      hasMore: more > 0, moreLabel: 'Voir ' + Math.min(LIM, more) + ' comptes de plus', showMore: () => this.setState({ lim: lim + LIM }),
      activeOn: active ? 'true' : 'false', toggleActive: () => this.setState({ active: !active, lim: LIM }),
      countLabel: total !== null ? (none ? 'Aucun compte suivi ' + (PH[market] || '') : total.toLocaleString('en-US').replace(/,/g, '\u202f') + ' comptes ' + (PH[market] || ''))
        : (market === 'FR' ? shownAll.length + ' comptes en France' : 'Aucun compte suivi ici') };
  }

  baseVals() {
    const mkt = [{"c": "FR", "l": "France", "on": "true"}, {"c": "US", "l": "États-Unis", "on": "false"}, {"c": "MX", "l": "Mexique", "on": "false"}, {"c": "BR", "l": "Brésil", "on": "false"}, {"c": "ES", "l": "Espagne", "on": "false"}, {"c": "ID", "l": "Indonésie", "on": "false"}];
    const live = [{"av": "/media/app/av-zinedine.gsbb.jpg", "noav": false, "rank": "09", "h": "@zinedine.gsbb", "bio": "L'ia c'est 👇", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "16 200", "fansK": "16 k", "med": "8 k", "medN": "7 792", "rythme": "3 vidéos en 7 j", "last": "Dernière il y a 2 j", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M"}, {"src": "/media/app/v-7701347136323013921.jpg", "v": "841 k"}, {"src": "/media/app/v-7702800263538560289.jpg", "v": "791 k"}], "cov1": [{"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M"}]}, {"av": "/media/app/av-remistudy.jpg", "noav": false, "rank": "11", "h": "@remistudy", "bio": "eco-droit 📚", "app": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "appName": "Astra AI", "niche": "Études", "fans": "1 111", "fansK": "1 k", "med": "7 k", "medN": "7 146", "rythme": "6 vidéos en 7 j", "last": "Dernière il y a 22 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7686951603688983840.jpg", "v": "645 k"}, {"src": "/media/app/v-7688445041966157088.jpg", "v": "134 k"}, {"src": "/media/app/v-7692158250019573024.jpg", "v": "130 k"}], "cov1": [{"src": "/media/app/v-7686951603688983840.jpg", "v": "645 k"}]}, {"av": "/media/app/av-toma.ia.jpg", "noav": false, "rank": "10", "h": "@toma.ia", "bio": "J'automatise mes vidéos avec l'IA", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "2 596", "fansK": "3 k", "med": "8 k", "medN": "7 583", "rythme": "3 vidéos en 7 j", "last": "Dernière il y a 23 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7704068190380379424.jpg", "v": "100 k"}, {"src": "/media/app/v-7703174889695497505.jpg", "v": "12 k"}, {"src": "/media/app/v-7703522210333429024.jpg", "v": "11 k"}], "cov1": [{"src": "/media/app/v-7704068190380379424.jpg", "v": "100 k"}]}, {"av": "/media/app/av-laure_acc2.jpg", "noav": false, "rank": "04", "h": "@laure_acc2", "bio": "E-mail pro dans la bio", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "300", "fansK": "300", "med": "32 k", "medN": "31 520", "rythme": "7 vidéos en 7 j", "last": "Dernière il y a 8 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7704726091851648288.jpg", "v": "105 k"}, {"src": "/media/app/v-7705018413185355040.jpg", "v": "92 k"}, {"src": "/media/app/v-7703942570576989472.jpg", "v": "58 k"}], "cov1": [{"src": "/media/app/v-7704726091851648288.jpg", "v": "105 k"}]}];
    const cards = [{"av": "", "noav": true, "rank": "01", "h": "@bobbybinks21", "bio": "Que du concret. Je teste des business", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "13 588", "fansK": "14 k", "med": "197 k", "medN": "197 157", "rythme": "Rien en 7 j", "last": "Dernière il y a 13 j", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7698888566214069536.jpg", "v": "564 k"}, {"src": "/media/app/v-7675164782881705249.jpg", "v": "396 k"}, {"src": "/media/app/v-7677716930513390881.jpg", "v": "375 k"}], "cov1": [{"src": "/media/app/v-7698888566214069536.jpg", "v": "564 k"}]}, {"av": "/media/app/av-meli83.fit.jpg", "noav": false, "rank": "02", "h": "@meli83.fit", "bio": "Réponse jeux Stalkie 🫶🏼🩷", "app": {"name": "Stalkie", "logo": "/media/app/stalkie.jpg", "nologo": false, "blank": ""}, "appName": "Stalkie", "niche": "Jalousie et ex", "fans": "667", "fansK": "667", "med": "78 k", "medN": "78 037", "rythme": "Rien en 7 j", "last": "Dernière il y a 26 j", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7620013053966355734.jpg", "v": "214 k"}, {"src": "/media/app/v-7620350138447482115.jpg", "v": "157 k"}, {"src": "/media/app/v-7621474381801245974.jpg", "v": "109 k"}], "cov1": [{"src": "/media/app/v-7620013053966355734.jpg", "v": "214 k"}]}, {"av": "", "noav": true, "rank": "03", "h": "@paul.crown4", "bio": "Dégât dégât · The Cringe app", "app": {"name": "The Cringe", "logo": "/media/app/app-the-cringe.jpg", "nologo": false, "blank": ""}, "appName": "The Cringe", "niche": "Jalousie et ex", "fans": "104", "fansK": "104", "med": "33 k", "medN": "33 347", "rythme": "Rien en 7 j", "last": "Dernière il y a 5 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7641650700862213408.jpg", "v": "76 k"}, {"src": "/media/app/v-7641285202513251616.jpg", "v": "72 k"}], "cov1": [{"src": "/media/app/v-7641650700862213408.jpg", "v": "76 k"}]}, {"av": "/media/app/av-laure_acc2.jpg", "noav": false, "rank": "04", "h": "@laure_acc2", "bio": "E-mail pro dans la bio", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "300", "fansK": "300", "med": "32 k", "medN": "31 520", "rythme": "7 vidéos en 7 j", "last": "Dernière il y a 8 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7704726091851648288.jpg", "v": "105 k"}, {"src": "/media/app/v-7705018413185355040.jpg", "v": "92 k"}, {"src": "/media/app/v-7703942570576989472.jpg", "v": "58 k"}], "cov1": [{"src": "/media/app/v-7704726091851648288.jpg", "v": "105 k"}]}, {"av": "/media/app/av-noah_031108.jpg", "noav": false, "rank": "06", "h": "@noah_031108", "bio": "Books, work… and others ⭐️", "app": {"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}, "appName": "Knowunity", "niche": "Études", "fans": "13 409", "fansK": "13 k", "med": "13 k", "medN": "12 796", "rythme": "Rien en 7 j", "last": "Dernière il y a 40 j", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7663069674338372896.jpg", "v": "200 k"}, {"src": "/media/app/v-7631504730258214166.jpg", "v": "114 k"}, {"src": "/media/app/v-7647175218573692192.jpg", "v": "21 k"}], "cov1": [{"src": "/media/app/v-7663069674338372896.jpg", "v": "200 k"}]}, {"av": "/media/app/av-stalkie_fr.jpg", "noav": false, "rank": "07", "h": "@stalkie_fr", "bio": "Deviens ambassadrice Stalkie 👇", "app": {"name": "Stalkie", "logo": "/media/app/stalkie.jpg", "nologo": false, "blank": ""}, "appName": "Stalkie", "niche": "Jalousie et ex", "fans": "3 673", "fansK": "4 k", "med": "9 k", "medN": "9 295", "rythme": "Rien en 7 j", "last": "Dernière il y a 7 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7626492369076260119.jpg", "v": "13 k"}, {"src": "/media/app/v-7628297994512747798.jpg", "v": "11 k"}, {"src": "/media/app/v-7627904478116613398.jpg", "v": "10 k"}], "cov1": [{"src": "/media/app/v-7626492369076260119.jpg", "v": "13 k"}]}, {"av": "/media/app/av-zinedine.gsbb.jpg", "noav": false, "rank": "09", "h": "@zinedine.gsbb", "bio": "L'ia c'est 👇", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "16 200", "fansK": "16 k", "med": "8 k", "medN": "7 792", "rythme": "3 vidéos en 7 j", "last": "Dernière il y a 2 j", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M"}, {"src": "/media/app/v-7701347136323013921.jpg", "v": "841 k"}, {"src": "/media/app/v-7702800263538560289.jpg", "v": "791 k"}], "cov1": [{"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M"}]}, {"av": "/media/app/av-toma.ia.jpg", "noav": false, "rank": "10", "h": "@toma.ia", "bio": "J'automatise mes vidéos avec l'IA", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "2 596", "fansK": "3 k", "med": "8 k", "medN": "7 583", "rythme": "3 vidéos en 7 j", "last": "Dernière il y a 23 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7704068190380379424.jpg", "v": "100 k"}, {"src": "/media/app/v-7703174889695497505.jpg", "v": "12 k"}, {"src": "/media/app/v-7703522210333429024.jpg", "v": "11 k"}], "cov1": [{"src": "/media/app/v-7704068190380379424.jpg", "v": "100 k"}]}, {"av": "/media/app/av-remistudy.jpg", "noav": false, "rank": "11", "h": "@remistudy", "bio": "eco-droit 📚", "app": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "appName": "Astra AI", "niche": "Études", "fans": "1 111", "fansK": "1 k", "med": "7 k", "medN": "7 146", "rythme": "6 vidéos en 7 j", "last": "Dernière il y a 22 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7686951603688983840.jpg", "v": "645 k"}, {"src": "/media/app/v-7688445041966157088.jpg", "v": "134 k"}, {"src": "/media/app/v-7692158250019573024.jpg", "v": "130 k"}], "cov1": [{"src": "/media/app/v-7686951603688983840.jpg", "v": "645 k"}]}];
    return { mkt, live, cards };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              "Créateurs"
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
        $h("div", { "style": "padding: 14px 20px 0; display: flex; align-items: center; justify-content: space-between; gap: 10px;" },
          $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
            $t($v.countLabel)
          ),
          $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Affichage" },
            $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "href": "/app/createurs", "aria-label": "Vue liste", "style": "height: 44px; padding: 0 12px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M4 6h16M4 12h16M4 18h16", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Liste"
            ),
            $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "true", "href": "/app/createurs/cartes", "aria-label": "Vue cartes", "style": "height: 44px; padding: 0 12px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;" },
              $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Cartes"
            )
          )
        ),
        $h("div", { "style": "padding-top: 12px; display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
          ($l($v.mkt)).map((m) => [
            $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": m?.on, "onClick": m?.pick, "style": "height: 44px; flex-shrink: 0; gap: 8px; padding: 0 14px 0 8px;" },
              (m?.flag) ? [
                $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                  $t(m?.c)
                )
              ] : null,
              $t(m?.l)
            )
          ])
        ),
        $h("div", { "style": "padding-top: 10px; display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
          $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": $v.activeOn, "onClick": $v.toggleActive, "style": "height: 44px; flex-shrink: 0; gap: 8px;" },
            $h("span", { "style": "width: 8px; height: 8px; border-radius: 50%; background: var(--accent);" }),
            "Actifs cette semaine"
          )
        ),
        $h("div", { "style": "margin-top: 14px; display: flex; flex-direction: column; gap: 10px;" },
          $h("span", { "class": "sw-live", "style": "padding: 0 20px;" },
            $h("span", { "aria-hidden": "true", "style": "width: 8px; height: 8px; border-radius: 50%; background: var(--accent);" }),
            "Les plus actifs"
          ),
          $h("div", { "style": "display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
            ($l($v.live)).map((c) => [
              $h("a", { "href": c?.href, "style": "flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px 7px 7px; border-radius: 999px; background: var(--track); border: 1px solid var(--line); text-decoration: none; color: inherit;" },
                $h("span", { "style": "width: 30px; height: 30px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); position: relative;" },
                  (c?.av) ? [
                    $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  (c?.noav) ? [
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                      $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                    )
                  ] : null
                ),
                $h("span", { "style": "display: flex; flex-direction: column;" },
                  $h("span", { "style": "font-size: 12px; font-weight: 600;" },
                    $t(c?.h)
                  ),
                  $h("span", { "style": "font-size: 10px; color: var(--ink-faint);" },
                    $t(c?.last)
                  )
                )
              )
            ])
          )
        ),
        $h("div", { "style": "padding: 16px 20px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;" },
          $h("div", { "style": "grid-column: 1 / -1;" },
            ($v.none) ? [
              $h("p", { "style": "margin: 0; padding: 28px 16px; text-align: center; font-size: 15px; color: var(--ink-muted);" },
                "Aucun compte suivi pour ce marché pour l’instant."
              )
            ] : null
          ),
          ($l($v.cards)).map((c) => [
            $h("a", { "href": c?.href, "class": "sw-card", "style": "border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; color: inherit;" },
              $h("span", { "class": "m-ph", "style": "position: relative; height: 150px; overflow: hidden; display: block; background: linear-gradient(150deg, #28405E, #0A0C12 58%, #28405E 130%);" },
                ($l(c?.cov1)).map((v) => [
                  $h("img", { "class": "sw-cover", "src": v?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
                  $h("span", { "class": "sw-video-shade" }),
                  $h("span", { "style": "position: absolute; right: 8px; bottom: 8px; font-family: var(--font-display); font-size: 14px; font-weight: 700; color: #FFFFFF;" },
                    $t(v?.v)
                  )
                ])
              ),
              $h("span", { "style": "padding: 0 12px 14px; display: flex; flex-direction: column; gap: 8px;" },
                $h("span", { "style": "margin-top: -22px;" },
                  $h("span", { "style": "width: 44px; height: 44px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10); box-shadow: 0 0 0 3px var(--surface-raised); position: relative;" },
                    (c?.av) ? [
                      $h("img", { "src": c?.av, "alt": "", "style": "position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; object-fit: cover; display: block;", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    (c?.noav) ? [
                      $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                        $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                      )
                    ] : null
                  )
                ),
                $h("span", { "style": "font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t(c?.h)
                ),
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-faint);" },
                  $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 16px; height: 16px; border-radius: 5px;" },
                    (c?.app?.logo) ? [
                      $h("img", { "class": "sw-logo-img", "src": c?.app?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                    ] : null,
                    (c?.app?.nologo) ? [
                      $h("svg", { "width": "8", "height": "8", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ] : null
                  ),
                  $t(c?.appName)
                ),
                $h("span", { "style": "display: flex; align-items: baseline; gap: 6px;" },
                  $h("span", { "style": "font-family: var(--font-display); font-size: 19px; font-weight: 700;" },
                    $t(c?.med)
                  ),
                  $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                    "médiane"
                  )
                ),
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-soft);" },
                  $h("span", { "style": `width: 6px; height: 6px; border-radius: 50%; background: ${$t(c?.dot)};` }),
                  $t(c?.rythme)
                )
              )
            )
          ])
        ),
        ($v.hasMore) ? [
          $h("div", { "style": "display: flex; justify-content: center; padding: 8px 20px 0;" },
            $h("button", { "class": "sw-more", "type": "button", "onClick": $v.showMore, "style": "min-height: 44px; border: 0; background: transparent; cursor: pointer; font-family: inherit; font-size: 14px;" },
              $t($v.moreLabel),
              $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
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
