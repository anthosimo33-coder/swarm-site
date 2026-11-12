// Généré par scripts/dc2preact.py depuis design/app/DossiersA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Dossiers extends DCLogic {

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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'dossiers' ? 'page' : 'false' }));
    return {
      sb, me,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
    const made = st.made || [];
    const created = made.map((name) => ({ name, mos: [], logos: [], mix: 'Aucun élément', count: '0 élément', when: 'créé à l’instant', full: false, empty: true }));
    let folders = created.concat((b.folders || []).map((f) => Object.assign({}, f, { full: true, empty: false })));
    if (st.sort === 'az') folders = folders.slice().sort((x, y) => x.name.localeCompare(y.name, 'fr'));
    const newName = st.newName || '';
    const createNew = () => { const n = newName.trim(); if (!n) return; this.setState({ made: [n].concat(made), creating: false, newName: '' }); };
    return {
      folders, creating: !!st.creating, newName,
      startNew: () => this.setState({ creating: true }), cancelNew: () => this.setState({ creating: false, newName: '' }),
      onNew: (e) => this.setState({ newName: e.target.value }), createNew,
      newKeys: (e) => { if (e.key === 'Enter') { e.preventDefault(); createNew(); } else if (e.key === 'Escape') { e.preventDefault(); this.setState({ creating: false, newName: '' }); } },
      setNew: (el) => { if (el && el !== this.newEl) { this.newEl = el; el.focus(); } },
      sorts: [['recent', 'Récents'], ['az', 'De A à Z']].map((s) => ({ l: s[1], on: (st.sort || 'recent') === s[0] ? 'true' : 'false', pick: () => this.setState({ sort: s[0] }) })),
      recent: (b.recent || []).map((r) => Object.assign({}, r, { href: r.kind === 'Vidéo' ? '/app/videos/learnwithjoel1' : '/app/formats/ich-losche-das-in-2h' }))
    };
  }

  baseVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "page"}];
    const folders = [{"name": "Études, ce qui marche", "items": [{"kind": "App", "ico": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Astra AI", "s": "Études · 57,7 M vues en 30 j", "isLogo": true, "isCover": false, "isAv": false, "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": "", "src": "", "av": "", "noav": false}, {"kind": "App", "ico": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Knowunity", "s": "Études · 44,4 M vues en 30 j", "isLogo": true, "isCover": false, "isAv": false, "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": "", "src": "", "av": "", "noav": false}, {"kind": "App", "ico": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Retain Cards", "s": "Études", "isLogo": true, "isCover": false, "isAv": false, "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": "", "src": "", "av": "", "noav": false}, {"kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "t": "« Ich lösche das in 2h‼️ »", "s": "3 comptes · 39× la normale", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7706579888727231777.jpg", "av": "", "noav": false}, {"kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "t": "« ‼️🚨GUARDA E PARTILHA🚨‼️ »", "s": "3 comptes · 17× la normale", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7705159364558081313.jpg", "av": "", "noav": false}, {"kind": "Créateur", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "t": "@learnwithjoel1", "s": "Astra AI · Espagne · 65× sa normale", "isLogo": false, "isCover": false, "isAv": true, "logo": "", "nologo": false, "blank": "", "src": "", "av": "/media/app/av-learnwithjoel1.jpg", "noav": false}, {"kind": "Vidéo", "ico": "M4 5h16v14H4zM10 9l5 3-5 3z", "t": "@belajarbersamaespi", "s": "Astra AI · 1,99 M vues", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7705368869250075925.jpg", "av": "", "noav": false}], "mosaic": ["/media/app/v-7705368869250075925.jpg", "/media/app/v-7705929733220994337.jpg", "/media/app/v-7706579888727231777.jpg", "/media/app/v-7705159364558081313.jpg"], "apps": ["Astra AI", "Knowunity", "Retain Cards"], "when": "modifié le 12/11", "count": "7 éléments", "mix": "3 apps · 2 formats · 1 créateur · 1 vidéo", "mos": [{"src": "/media/app/v-7705368869250075925.jpg"}, {"src": "/media/app/v-7705929733220994337.jpg"}, {"src": "/media/app/v-7706579888727231777.jpg"}, {"src": "/media/app/v-7705159364558081313.jpg"}], "logos": [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, {"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": ""}, {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}]}, {"name": "Side hustle", "items": [{"kind": "App", "ico": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Shortfy", "s": "Side hustle", "isLogo": true, "isCover": false, "isAv": false, "logo": "", "nologo": true, "blank": "sw-app-blank", "src": "", "av": "", "noav": false}, {"kind": "Créateur", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "t": "@zinedine.gsbb", "s": "Shortfy · 8 k vues médianes", "isLogo": false, "isCover": false, "isAv": true, "logo": "", "nologo": false, "blank": "", "src": "", "av": "/media/app/av-zinedine.gsbb.jpg", "noav": false}, {"kind": "Créateur", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "t": "@toma.ia", "s": "Shortfy · 8 k vues médianes", "isLogo": false, "isCover": false, "isAv": true, "logo": "", "nologo": false, "blank": "", "src": "", "av": "/media/app/av-toma.ia.jpg", "noav": false}, {"kind": "Créateur", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "t": "@laure_acc2", "s": "Shortfy · 32 k vues médianes", "isLogo": false, "isCover": false, "isAv": true, "logo": "", "nologo": false, "blank": "", "src": "", "av": "/media/app/av-laure_acc2.jpg", "noav": false}, {"kind": "Vidéo", "ico": "M4 5h16v14H4zM10 9l5 3-5 3z", "t": "@zinedine.gsbb", "s": "Shortfy · 2,85 M vues", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7700172397613288736.jpg", "av": "", "noav": false}], "mosaic": ["/media/app/v-7700172397613288736.jpg", "/media/app/v-7701347136323013921.jpg", "/media/app/v-7702800263538560289.jpg", "/media/app/v-7704726091851648288.jpg"], "apps": ["Shortfy"], "when": "modifié le 11/11", "count": "5 éléments", "mix": "1 app · 3 créateurs · 1 vidéo", "mos": [{"src": "/media/app/v-7700172397613288736.jpg"}, {"src": "/media/app/v-7701347136323013921.jpg"}, {"src": "/media/app/v-7702800263538560289.jpg"}, {"src": "/media/app/v-7704726091851648288.jpg"}], "logos": [{"name": "Shortfy", "logo": "", "nologo": true, "blank": "sw-app-blank"}]}, {"name": "Jalousie et ex", "items": [{"kind": "App", "ico": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "RecentFollow", "s": "Jalousie et ex · 13,1 M vues en 30 j", "isLogo": true, "isCover": false, "isAv": false, "logo": "", "nologo": true, "blank": "sw-app-blank", "src": "", "av": "", "noav": false}, {"kind": "App", "ico": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "The Cringe", "s": "Jalousie et ex · 12,2 M vues en 30 j", "isLogo": true, "isCover": false, "isAv": false, "logo": "/media/app/app-the-cringe.jpg", "nologo": false, "blank": "", "src": "", "av": "", "noav": false}, {"kind": "App", "ico": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Stalkie", "s": "Jalousie et ex", "isLogo": true, "isCover": false, "isAv": false, "logo": "/media/app/stalkie.jpg", "nologo": false, "blank": "", "src": "", "av": "", "noav": false}, {"kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "t": "« Ojalá entendieras que no siempre te reclamo porqu…", "s": "3 comptes · 3,3× la normale", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7705537368907959573.jpg", "av": "", "noav": false}, {"kind": "Créateur", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "t": "@meli83.fit", "s": "Stalkie · 78 k vues médianes", "isLogo": false, "isCover": false, "isAv": true, "logo": "", "nologo": false, "blank": "", "src": "", "av": "/media/app/av-meli83.fit.jpg", "noav": false}], "mosaic": ["/media/app/v-7705376808862076182.jpg", "/media/app/v-7703301496879861014.jpg", "/media/app/v-7705537368907959573.jpg", "/media/app/v-7620013053966355734.jpg"], "apps": ["RecentFollow", "The Cringe", "Stalkie"], "when": "modifié le 10/11", "count": "5 éléments", "mix": "3 apps · 1 format · 1 créateur", "mos": [{"src": "/media/app/v-7705376808862076182.jpg"}, {"src": "/media/app/v-7703301496879861014.jpg"}, {"src": "/media/app/v-7705537368907959573.jpg"}, {"src": "/media/app/v-7620013053966355734.jpg"}], "logos": [{"name": "RecentFollow", "logo": "", "nologo": true, "blank": "sw-app-blank"}, {"name": "The Cringe", "logo": "/media/app/app-the-cringe.jpg", "nologo": false, "blank": ""}, {"name": "Stalkie", "logo": "/media/app/stalkie.jpg", "nologo": false, "blank": ""}]}, {"name": "Couple", "items": [{"kind": "App", "ico": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Love8", "s": "Couple · 35,1 M vues en 30 j", "isLogo": true, "isCover": false, "isAv": false, "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": "", "src": "", "av": "", "noav": false}, {"kind": "App", "ico": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "t": "Loverzz", "s": "Couple", "isLogo": true, "isCover": false, "isAv": false, "logo": "/media/app/loverzz.jpg", "nologo": false, "blank": "", "src": "", "av": "", "noav": false}, {"kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "t": "original sound - dicsovn", "s": "3 comptes · 5,7× la normale", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7703975267911421191.jpg", "av": "", "noav": false}, {"kind": "Créateur", "ico": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "t": "@johan_love8", "s": "Love8 · France · 253 k vues", "isLogo": false, "isCover": false, "isAv": true, "logo": "", "nologo": false, "blank": "", "src": "", "av": "", "noav": true}], "mosaic": ["/media/app/v-7705441234847862037.jpg", "/media/app/v-7706331130374540577.jpg", "/media/app/v-7703975267911421191.jpg", "/media/app/v-7705024255746002182.jpg"], "apps": ["Love8", "Loverzz"], "when": "modifié le 09/11", "count": "4 éléments", "mix": "2 apps · 1 format · 1 créateur", "mos": [{"src": "/media/app/v-7705441234847862037.jpg"}, {"src": "/media/app/v-7706331130374540577.jpg"}, {"src": "/media/app/v-7703975267911421191.jpg"}, {"src": "/media/app/v-7705024255746002182.jpg"}], "logos": [{"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": ""}, {"name": "Loverzz", "logo": "/media/app/loverzz.jpg", "nologo": false, "blank": ""}]}];
    const recent = [{"kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "t": "« Ich lösche das in 2h‼️ »", "s": "3 comptes · 39× la normale", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7706579888727231777.jpg", "av": "", "noav": false, "folder": "Études, ce qui marche"}, {"kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "t": "« ‼️🚨GUARDA E PARTILHA🚨‼️ »", "s": "3 comptes · 17× la normale", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7705159364558081313.jpg", "av": "", "noav": false, "folder": "Études, ce qui marche"}, {"kind": "Vidéo", "ico": "M4 5h16v14H4zM10 9l5 3-5 3z", "t": "@belajarbersamaespi", "s": "Astra AI · 1,99 M vues", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7705368869250075925.jpg", "av": "", "noav": false, "folder": "Études, ce qui marche"}, {"kind": "Vidéo", "ico": "M4 5h16v14H4zM10 9l5 3-5 3z", "t": "@zinedine.gsbb", "s": "Shortfy · 2,85 M vues", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7700172397613288736.jpg", "av": "", "noav": false, "folder": "Side hustle"}, {"kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "t": "« Ojalá entendieras que no siempre te reclamo porqu…", "s": "3 comptes · 3,3× la normale", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7705537368907959573.jpg", "av": "", "noav": false, "folder": "Jalousie et ex"}, {"kind": "Son", "ico": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "t": "original sound - dicsovn", "s": "3 comptes · 5,7× la normale", "isLogo": false, "isCover": true, "isAv": false, "logo": "", "nologo": false, "blank": "", "src": "/media/app/v-7703975267911421191.jpg", "av": "", "noav": false, "folder": "Couple"}];
    return { nav, folders, recent };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1060px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
                "Dossiers"
              ),
              $h("p", { "style": "margin: 0; font-size: 15px; color: var(--ink-muted);" },
                "Ce que tu as mis de côté : apps, formats, créateurs et vidéos."
              )
            ),
            $h("div", { "style": "display: flex; align-items: center; gap: 12px;" },
              $h("div", { "class": "sw-tabs", "role": "tablist", "aria-label": "Tri" },
                ($l($v.sorts)).map((s) => [
                  $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": s?.on, "onClick": s?.pick, "style": "height: 32px;" },
                    $t(s?.l)
                  )
                ])
              ),
              $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.startNew },
                "Nouveau dossier",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          $h("div", { "style": "padding: 28px 32px 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;" },
            ($v.creating) ? [
              $h("div", { "class": "sw-card is-featured", "style": "border-radius: 26px; padding: 22px; display: flex; flex-direction: column; justify-content: center; gap: 14px; min-height: 330px; box-sizing: border-box;" },
                $h("label", { "class": "sw-label", "for": "nd-nom" },
                  "Nom du dossier"
                ),
                $h("input", { "ref": $v.setNew, "class": "sw-input", "id": "nd-nom", "type": "text", "value": $v.newName, "onInput": $v.onNew, "onKeyDown": $v.newKeys, "placeholder": "Une idée d’app, une niche, un marché", "autocomplete": "off" }),
                $h("div", { "style": "display: flex; justify-content: flex-end; align-items: center; gap: 14px;" },
                  $h("button", { "class": "sw-link-quiet", "type": "button", "onClick": $v.cancelNew, "style": "border: 0; background: transparent; cursor: pointer; font: inherit; font-size: 14px;" },
                    "Annuler"
                  ),
                  $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button", "onClick": $v.createNew },
                    "Créer",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              )
            ] : null,
            ($l($v.folders)).map((f) => [
              $h("a", { "href": "/app/dossiers/etudes", "class": "sw-card", "style": "display: flex; flex-direction: column; overflow: hidden; border-radius: 26px; text-decoration: none; color: inherit;" },
                (f?.full) ? [
                  $h("span", { "style": "display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; height: 210px; overflow: hidden; background: var(--ground);" },
                    ($l(f?.mos)).map((m) => [
                      $h("span", { "style": "position: relative; overflow: hidden; display: block;" },
                        $h("img", { "class": "sw-cover", "src": m?.src, "alt": "" })
                      )
                    ])
                  )
                ] : null,
                (f?.empty) ? [
                  $h("span", { "style": "height: 210px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: var(--ground); color: var(--ink-faint); font-size: 13px;" },
                    $h("svg", { "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Vide pour l’instant"
                  )
                ] : null,
                $h("span", { "style": "padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 12px;" },
                  $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px;" },
                    $h("span", { "style": "font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink);" },
                      $t(f?.name)
                    ),
                    $h("span", { "style": "display: flex;" },
                      ($l(f?.logos)).map((a) => [
                        $h("span", { "style": "margin-left: -6px; border-radius: 9px; box-shadow: 0 0 0 2px var(--surface-raised); display: inline-flex;" },
                          $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 28px; height: 28px; border-radius: 9px;" },
                            (a?.logo) ? [
                              $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "" })
                            ] : null,
                            (a?.nologo) ? [
                              $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                                $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                              )
                            ] : null
                          )
                        )
                      ])
                    )
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                    $t(f?.mix)
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    $t(f?.count), " · ", $t(f?.when)
                  )
                )
              )
            ]),
            $h("button", { "type": "button", "onClick": $v.startNew, "style": "min-height: 330px; border-radius: 26px; border: 1.5px dashed var(--line-strong); background: transparent; color: var(--ink-muted); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; font-family: var(--font-body); font-size: 15px; font-weight: 600; cursor: pointer;" },
              $h("span", { "style": "width: 52px; height: 52px; border-radius: 16px; background: var(--track); display: inline-flex; align-items: center; justify-content: center; color: var(--accent);" },
                $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              "Nouveau dossier",
              $h("span", { "style": "font-size: 13px; font-weight: 400; color: var(--ink-faint);" },
                "Une idée d’app, une niche, un marché"
              )
            )
          ),
          $h("div", { "style": "padding: 36px 32px 14px; display: flex; justify-content: space-between; align-items: baseline;" },
            $h("h2", { "class": "sw-card-title", "style": "font-size: 20px;" },
              "Ajouté récemment"
            ),
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              "Dans tous tes dossiers"
            )
          ),
          $h("div", { "style": "padding: 0 32px 48px; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 14px;" },
            ($l($v.recent)).map((r) => [
              $h("a", { "href": r?.href, "style": "display: flex; flex-direction: column; gap: 8px; min-width: 0; text-decoration: none; color: inherit;" },
                $h("span", { "class": "sw-video", "style": "display: block; border-radius: 16px;" },
                  $h("img", { "class": "sw-cover", "src": r?.src, "alt": "" }),
                  $h("span", { "class": "sw-video-shade" }),
                  $h("span", { "class": "sw-badge", "style": "position: absolute; top: 8px; left: 8px; height: 22px; font-size: 11px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                    $t(r?.kind)
                  )
                ),
                $h("span", { "style": "font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t(r?.t)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t(r?.folder)
                )
              )
            ])
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
