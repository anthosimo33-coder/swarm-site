// Généré par scripts/dc2preact.py depuis design/app/CreateursA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Createurs extends DCLogic {

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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'createurs' ? 'page' : 'false' }));
    return {
      sb, me,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const market = st.market || 'FR';
    const active = !!st.active;
    const mkt = (b.mkt || []).map((m) => Object.assign({}, m, { on: m.c === market ? 'true' : 'false', pick: () => this.setState({ market: m.c }) }));
    const pool = (xs) => (market === 'FR' ? (xs || []) : []).filter((c) => !active || c.active);
    const rows = pool(b.rows).map((c, i) => Object.assign({}, c, { rank: String(i + 1).padStart(2, '0') }));
    const name = (b.mkt || []).filter((m) => m.c === market).map((m) => m.l)[0] || market;
    return { mkt, rows, cards: pool(b.cards), live: pool(b.live), none: (market !== 'FR'), noneLabel: 'Aucun compte relevé pour ce marché.',
      activeOn: active ? 'true' : 'false', toggleActive: () => this.setState({ active: !active }),
      countLabel: market === 'FR' ? (rows.length + ' comptes suivis en France') : ('0 compte relevé pour ce marché') };
  }

  baseVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "page"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "false"}];
    const mkt = [{"c": "FR", "l": "France", "on": "true"}, {"c": "US", "l": "États-Unis", "on": "false"}, {"c": "MX", "l": "Mexique", "on": "false"}, {"c": "BR", "l": "Brésil", "on": "false"}, {"c": "ES", "l": "Espagne", "on": "false"}, {"c": "ID", "l": "Indonésie", "on": "false"}];
    const filters = [{"k": "Niche", "v": "Toutes"}, {"k": "App", "v": "Toutes"}, {"k": "Abonnés", "v": "Tous"}];
    const rows = [{"av": "", "noav": true, "rank": "01", "h": "@bobbybinks21", "bio": "Que du concret. Je teste des business", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "13 588", "fansK": "14 k", "med": "197 k", "medN": "197 157", "rev": "Entre 490 et 690 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 13 j", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7698888566214069536.jpg", "v": "564 k"}, {"src": "/media/app/v-7675164782881705249.jpg", "v": "396 k"}, {"src": "/media/app/v-7677716930513390881.jpg", "v": "375 k"}], "cov1": [{"src": "/media/app/v-7698888566214069536.jpg", "v": "564 k"}]}, {"av": "/media/app/av-meli83.fit.jpg", "noav": false, "rank": "02", "h": "@meli83.fit", "bio": "Réponse jeux Stalkie 🫶🏼🩷", "app": {"name": "Stalkie", "logo": "/media/app/stalkie.jpg", "nologo": false, "blank": ""}, "appName": "Stalkie", "niche": "Jalousie et ex", "fans": "667", "fansK": "667", "med": "78 k", "medN": "78 037", "rev": "Entre 200 et 270 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 26 j", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7620013053966355734.jpg", "v": "214 k"}, {"src": "/media/app/v-7620350138447482115.jpg", "v": "157 k"}, {"src": "/media/app/v-7621474381801245974.jpg", "v": "109 k"}], "cov1": [{"src": "/media/app/v-7620013053966355734.jpg", "v": "214 k"}]}, {"av": "", "noav": true, "rank": "03", "h": "@paul.crown4", "bio": "Dégât dégât · The Cringe app", "app": {"name": "The Cringe", "logo": "/media/app/app-the-cringe.jpg", "nologo": false, "blank": ""}, "appName": "The Cringe", "niche": "Jalousie et ex", "fans": "104", "fansK": "104", "med": "33 k", "medN": "33 347", "rev": "Entre 80 et 120 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 5 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7641650700862213408.jpg", "v": "76 k"}, {"src": "/media/app/v-7641285202513251616.jpg", "v": "72 k"}], "cov1": [{"src": "/media/app/v-7641650700862213408.jpg", "v": "76 k"}]}, {"av": "/media/app/av-laure_acc2.jpg", "noav": false, "rank": "04", "h": "@laure_acc2", "bio": "E-mail pro dans la bio", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "300", "fansK": "300", "med": "32 k", "medN": "31 520", "rev": "Entre 80 et 110 €", "rythme": "7 vidéos en 7 j", "last": "Dernière il y a 8 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7704726091851648288.jpg", "v": "105 k"}, {"src": "/media/app/v-7705018413185355040.jpg", "v": "92 k"}, {"src": "/media/app/v-7703942570576989472.jpg", "v": "58 k"}], "cov1": [{"src": "/media/app/v-7704726091851648288.jpg", "v": "105 k"}]}, {"av": "/media/app/av-enjoy.gossip.jpg", "noav": false, "rank": "05", "h": "@enjoy.gossip", "bio": "Les trompeurs me détestent 👀", "app": {"name": "Katch", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Katch", "niche": "Jalousie et ex", "fans": "449", "fansK": "449", "med": "24 k", "medN": "23 664", "rev": "Entre 60 et 85 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 6 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7633896569149934870.jpg", "v": "606 k"}], "cov1": [{"src": "/media/app/v-7633896569149934870.jpg", "v": "606 k"}]}, {"av": "/media/app/av-noah_031108.jpg", "noav": false, "rank": "06", "h": "@noah_031108", "bio": "Books, work… and others ⭐️", "app": {"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}, "appName": "Knowunity", "niche": "Études", "fans": "13 409", "fansK": "13 k", "med": "13 k", "medN": "12 796", "rev": "Entre 30 et 45 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 40 j", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7663069674338372896.jpg", "v": "200 k"}, {"src": "/media/app/v-7631504730258214166.jpg", "v": "114 k"}, {"src": "/media/app/v-7647175218573692192.jpg", "v": "21 k"}], "cov1": [{"src": "/media/app/v-7663069674338372896.jpg", "v": "200 k"}]}, {"av": "/media/app/av-stalkie_fr.jpg", "noav": false, "rank": "07", "h": "@stalkie_fr", "bio": "Deviens ambassadrice Stalkie 👇", "app": {"name": "Stalkie", "logo": "/media/app/stalkie.jpg", "nologo": false, "blank": ""}, "appName": "Stalkie", "niche": "Jalousie et ex", "fans": "3 673", "fansK": "4 k", "med": "9 k", "medN": "9 295", "rev": "Entre 25 et 35 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 7 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7626492369076260119.jpg", "v": "13 k"}, {"src": "/media/app/v-7628297994512747798.jpg", "v": "11 k"}, {"src": "/media/app/v-7627904478116613398.jpg", "v": "10 k"}], "cov1": [{"src": "/media/app/v-7626492369076260119.jpg", "v": "13 k"}]}, {"av": "/media/app/av-emma.studytips.jpg", "noav": false, "rank": "08", "h": "@emma.studytips", "bio": "Dernière année de master 🙌🏼", "app": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "appName": "Retain Cards", "niche": "Études", "fans": "4 385", "fansK": "4 k", "med": "8 k", "medN": "7 814", "rev": "Entre 20 et 25 €", "rythme": "Rien en 7 j", "last": "Dernière il y a 6 mois", "dot": "var(--line-strong)", "active": false, "cov": [{"src": "/media/app/v-7641320209013345569.jpg", "v": "24 k"}], "cov1": [{"src": "/media/app/v-7641320209013345569.jpg", "v": "24 k"}]}, {"av": "/media/app/av-zinedine.gsbb.jpg", "noav": false, "rank": "09", "h": "@zinedine.gsbb", "bio": "L'ia c'est 👇", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "16 200", "fansK": "16 k", "med": "8 k", "medN": "7 792", "rev": "Entre 20 et 25 €", "rythme": "3 vidéos en 7 j", "last": "Dernière il y a 2 j", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M"}, {"src": "/media/app/v-7701347136323013921.jpg", "v": "841 k"}, {"src": "/media/app/v-7702800263538560289.jpg", "v": "791 k"}], "cov1": [{"src": "/media/app/v-7700172397613288736.jpg", "v": "2,85 M"}]}, {"av": "/media/app/av-toma.ia.jpg", "noav": false, "rank": "10", "h": "@toma.ia", "bio": "J'automatise mes vidéos avec l'IA", "app": {"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}, "appName": "Shortfy", "niche": "Side hustle", "fans": "2 596", "fansK": "3 k", "med": "8 k", "medN": "7 583", "rev": "Entre 20 et 25 €", "rythme": "3 vidéos en 7 j", "last": "Dernière il y a 23 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7704068190380379424.jpg", "v": "100 k"}, {"src": "/media/app/v-7703174889695497505.jpg", "v": "12 k"}, {"src": "/media/app/v-7703522210333429024.jpg", "v": "11 k"}], "cov1": [{"src": "/media/app/v-7704068190380379424.jpg", "v": "100 k"}]}, {"av": "/media/app/av-remistudy.jpg", "noav": false, "rank": "11", "h": "@remistudy", "bio": "eco-droit 📚", "app": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "appName": "Astra AI", "niche": "Études", "fans": "1 111", "fansK": "1 k", "med": "7 k", "medN": "7 146", "rev": "Entre 20 et 25 €", "rythme": "6 vidéos en 7 j", "last": "Dernière il y a 22 h", "dot": "var(--accent)", "active": true, "cov": [{"src": "/media/app/v-7686951603688983840.jpg", "v": "645 k"}, {"src": "/media/app/v-7688445041966157088.jpg", "v": "134 k"}, {"src": "/media/app/v-7692158250019573024.jpg", "v": "130 k"}], "cov1": [{"src": "/media/app/v-7686951603688983840.jpg", "v": "645 k"}]}];
    return { nav, mkt, filters, rows };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1480px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
          $h("button", { "class": "sw-side-item", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher, raccourci Commande K", "style": "border: 0; background: transparent; font-family: inherit; cursor: pointer;" },
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
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Passer au thème clair" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("a", { "class": "sw-avatar", "href": "/app/compte", "aria-label": "Mon compte", "style": "text-decoration: none;" },
              $t($v.me?.initiale)
            )
          )
        ),
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; background: var(--surface);" },
          $h("header", { "style": "display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 20px; padding: 32px 32px 0;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
              $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 40px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em;" },
                "Créateurs"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Les comptes qui font des vues pour des apps. Regarde ce qu’ils publient, et copie ce qui marche."
              )
            ),
            $h("div", { "role": "search", "class": "sw-search", "style": "flex: 0 1 400px; height: 48px; padding: 0 8px 0 16px; box-shadow: none;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "class": "sw-search-input", "onFocus": $v.openPal, "id": "qc", "type": "search", "aria-label": "Chercher un compte", "placeholder": "Chercher un compte…", "style": "font-size: 15px;" }),
              $h("span", { "class": "sw-kbd" },
                "⌘ K"
              )
            )
          ),
          $h("div", { "style": "padding: 24px 32px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
            $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Marché" },
              ($l($v.mkt)).map((m) => [
                $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": m?.on, "onClick": m?.pick, "style": "height: 36px; display: inline-flex; align-items: center; gap: 8px;" },
                  $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px;" },
                    $t(m?.c)
                  ),
                  $t(m?.l)
                )
              ])
            ),
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              $t($v.countLabel)
            )
          ),
          $h("div", { "style": "padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;" },
            $h("div", { "style": "display: flex; gap: 8px; flex-wrap: wrap;" },
              ($l($v.filters)).map((f) => [
                $h("button", { "class": "sw-pill", "type": "button", "aria-haspopup": "listbox", "style": "height: 40px; padding: 0 12px 0 14px; gap: 6px; background: var(--track); border-color: var(--line);" },
                  $h("span", { "style": "color: var(--ink-faint);" },
                    $t(f?.k)
                  ),
                  $h("span", { "style": "font-weight: 600;" },
                    $t(f?.v)
                  ),
                  $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--ink-faint);" },
                    $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ]),
              $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": $v.activeOn, "onClick": $v.toggleActive, "style": "height: 40px; gap: 8px;" },
                $h("span", { "aria-hidden": "true", "style": "width: 8px; height: 8px; border-radius: 50%; background: var(--accent);" }),
                "Actifs cette semaine"
              )
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 16px;" },
              $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                "Trier par ",
                $h("span", { "style": "color: var(--ink); font-weight: 600;" },
                  "vues médianes"
                )
              ),
              $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Affichage" },
                $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "true", "href": "/app/createurs", "style": "height: 32px; display: inline-flex; align-items: center; gap: 7px; text-decoration: none;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 5h16v14H4zM4 10h16M4 15h16M10 10v9", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Tableau"
                ),
                $h("a", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "href": "/app/createurs/cartes", "style": "height: 32px; display: inline-flex; align-items: center; gap: 7px; text-decoration: none;" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Cartes"
                )
              )
            )
          ),
          $h("div", { "style": "margin: 0 32px 16px; padding: 14px 18px; border-radius: 16px; display: flex; align-items: center; gap: 14px; background: linear-gradient(90deg, var(--accent-soft), transparent 70%); border: 1px solid var(--accent-edge);" },
            $h("span", { "style": "width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--blue-600); color: #FFFFFF;" },
              $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "font-size: 14px; color: var(--ink-soft);" },
              $h("span", { "style": "font-weight: 700; color: var(--ink);" },
                "Les abonnés ne comptent pas."
              ),
              " @paul.crown4 a 104 abonnés et 33 k vues médianes par vidéo."
            )
          ),
          $h("div", { "style": "margin: 0 32px 48px; overflow-x: auto; border: 1px solid var(--line); border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom));" },
            $h("table", { "class": "sw-table", "style": "table-layout: fixed; min-width: 1050px;" },
              $h("thead", null,
                $h("tr", null,
                  $h("th", { "style": "width: 44px; padding-left: 20px;" },
                    "#"
                  ),
                  $h("th", { "style": "width: 306px;" },
                    "Créateur"
                  ),
                  $h("th", { "style": "width: 150px;" },
                    "Pousse"
                  ),
                  $h("th", { "class": "sw-num", "style": "width: 90px;" },
                    "Abonnés"
                  ),
                  $h("th", { "class": "sw-num", "style": "width: 110px;" },
                    "Vues médianes"
                  ),
                  $h("th", { "style": "width: 150px;" },
                    "Rythme"
                  ),
                  $h("th", { "style": "width: 140px; padding-right: 20px;" },
                    "Ses meilleures"
                  )
                )
              ),
              $h("tbody", null,
                ($l($v.rows)).map((c) => [
                  $h("tr", null,
                    $h("td", { "style": "padding-left: 20px; font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                      $t(c?.rank)
                    ),
                    $h("td", null,
                      $h("a", { "href": "/app/createurs/zinedine-gsbb", "style": "display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit; min-width: 0;" },
                        $h("span", { "style": "width: 44px; height: 44px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                          (c?.av) ? [
                            $h("img", { "src": c?.av, "alt": "", "style": "width: 100%; height: 100%; object-fit: cover; display: block;" })
                          ] : null,
                          (c?.noav) ? [
                            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                              $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 3px; min-width: 0;" },
                          $h("span", { "style": "font-size: 15px; font-weight: 600; color: var(--ink);" },
                            $t(c?.h)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                            $t(c?.bio)
                          )
                        )
                      )
                    ),
                    $h("td", null,
                      $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px;" },
                        $h("span", { "class": `sw-app-icon ${$t(c?.app?.blank)}`, "style": "width: 20px; height: 20px; border-radius: 6px;" },
                          (c?.app?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": c?.app?.logo, "alt": "" })
                          ] : null,
                          (c?.app?.nologo) ? [
                            $h("svg", { "width": "10", "height": "10", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 1px;" },
                          $h("span", { "style": "font-size: 13px; font-weight: 600; color: var(--ink);" },
                            $t(c?.appName)
                          ),
                          $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                            $t(c?.niche)
                          )
                        )
                      )
                    ),
                    $h("td", { "class": "sw-num" },
                      $h("span", { "style": "font-size: 14px; color: var(--ink-soft); font-weight: 500;" },
                        $t(c?.fans)
                      )
                    ),
                    $h("td", { "class": "sw-num" },
                      $h("span", { "style": "font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink);" },
                        $t(c?.med)
                      )
                    ),
                    $h("td", null,
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 3px;" },
                        $h("span", { "style": "display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--ink);" },
                          $h("span", { "style": `width: 7px; height: 7px; border-radius: 50%; background: ${$t(c?.dot)};` }),
                          $t(c?.rythme)
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                          $t(c?.last)
                        )
                      )
                    ),
                    $h("td", { "style": "padding-right: 20px;" },
                      $h("span", { "style": "display: flex; gap: 5px;" },
                        ($l(c?.cov)).map((v) => [
                          $h("span", { "class": "sw-video", "style": "display: block; width: 40px; border-radius: 8px; flex-shrink: 0;" },
                            $h("img", { "class": "sw-cover", "src": v?.src, "alt": "" }),
                            $h("span", { "class": "sw-video-shade" }),
                            $h("span", { "style": "position: absolute; left: 4px; bottom: 3px; font-size: 9px; font-weight: 700;" },
                              $t(v?.v)
                            )
                          )
                        ])
                      )
                    )
                  )
                ]),
                ($v.none) ? [
                  $h("tr", null,
                    $h("td", { "colspan": "9", "style": "padding: 48px 20px; text-align: center; color: var(--ink-muted);" },
                      $t($v.noneLabel)
                    )
                  )
                ] : null
              )
            )
          )
        ),
        ($v.pal) ? [
          $h("div", { "style": "position: fixed; inset: 0; z-index: 60;" },
            $h(Palette, { "onClose": $v.closePal })
          )
        ] : null
      )
    ];
  }
}
