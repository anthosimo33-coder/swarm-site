// Généré par scripts/dc2preact.py depuis design/app/MDossier.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MDossier extends DCLogic {

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
    const DAY = 86400000;
    const dayTxt = (ms) => { if (!ms) return ''; const d = new Date(ms), z = new Date();
      const n = Math.round((new Date(z.getFullYear(), z.getMonth(), z.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / DAY);
      return n <= 0 ? 'aujourd’hui' : n === 1 ? 'hier' : 'le ' + d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }); };
    const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');
    const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + '\u202fM' : n >= 999.5 ? Math.round(n / 1e3) + '\u202fk' : String(Math.round(n || 0)));
    const xf = (x) => (x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
    const ICO = { app: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', format: 'M5 6h14M12 6v13M9 19h6', sound: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
      creator: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6', video: 'M8 5.5l11 6.5-11 6.5z' };
    // Sur le canevas : le dossier d'exemple, en état local.
    const EX = [{ id: 'etudes', name: 'Études, ce qui marche', createdAt: 0, items: []
      .concat((b.apps || []).map((a) => ({ kind: 'app', id: a.n, label: a.n, cover: a.logo || null, at: 0, s: a.niche + ' · ' + a.v })))
      .concat((b.fmts || []).map((f) => ({ kind: 'format', id: f.raw, label: f.quote, cover: ((f.cov || [])[0] || {}).src || null, at: 0, s: f.n + ' comptes · ' + f.med + ' la normale' })))
      .concat(b.joel ? [{ kind: 'creator', id: 'learnwithjoel1', label: b.joel.h, cover: b.joel.av || null, at: 0, s: b.joel.s }] : [])
      .concat(b.vid ? [{ kind: 'video', id: b.vid.id, label: b.vid.h, cover: b.vid.src || null, at: 0, s: b.vid.app + ' · ' + b.vid.when }] : []) }];
    const read = () => (live ? P.saved('folders') : ((this.state || {}).local || EX));
    const change = (fn) => { const cur = read(); if (cur === undefined) return; const next = fn(Array.isArray(cur) ? cur : []); if (live) P.save('folders', next); else this.setState({ local: next }); };
    const raw = read();
    const loading = raw === undefined;
    const all = Array.isArray(raw) ? raw : [];
    // Le dossier de l'adresse (/app/dossiers/<id>) ; sur le canevas, ?d=<id> ou le dossier d'exemple.
    let id = P.params && P.params.id;
    if (!id && !live) { try { id = new URLSearchParams(location.search).get('d'); } catch (e) {} }
    let folder = all.filter((f) => f.id === id)[0] || null;
    if (!folder && !live) folder = all[0] || null;
    const gone = !loading && !folder;
    const goneText = st.deleted ? 'Dossier supprimé.' : 'Ce dossier n’existe plus.';
    if (!folder) return { has: false, gone, goneText, folderName: st.deleted ? 'Dossier supprimé' : 'Dossier', metaLabel: '', secs: [], tabs: [], empty: false };
    const G = (k) => (live && typeof P.get === 'function' ? P.get(k) : undefined);
    const byKey = (doc, list, key) => { const m = {}; ((doc && doc[list]) || []).forEach((x) => { m[x[key]] = x; }); return m; };
    const A = byKey(G('apps'), 'apps', 'slug'), F = byKey(G('formats'), 'formats', 'id');
    const items = folder.items || [];
    const drop = (it) => change((fs) => fs.map((f) => (f.id !== folder.id ? f : Object.assign({}, f, { items: (f.items || []).filter((x) => !(x.kind === it.kind && x.id === it.id)) }))));
    const row = (x) => {
      let t = x.label || x.id, s = x.s || '', src = x.cover || '', ico = ICO[x.kind] || ICO.video, href = '/app/videos/' + x.id;
      if (x.kind === 'app') { const a = A[x.id]; t = a ? a.name : t; s = a ? a.niche + ' · ' + nf(a.views30) + ' vues en 30 j' : s || 'App'; src = (a && a.icon) || src; href = live ? '/app/apps/' + x.id : '/app/apps/astraai'; }
      else if (x.kind === 'format') { const f = F[x.id]; if (f) { t = f.kind === 'sound' ? 'Son « ' + f.label + ' »' : '« ' + f.label + ' »'; ico = f.kind === 'sound' ? ICO.sound : ICO.format;
          s = f.accounts + ' comptes' + (f.medX ? ' · ' + xf(f.medX) + ' la normale' : ''); src = src || ((f.members || []).filter((m) => m.cover)[0] || {}).cover || ''; }
        s = s || 'Format'; href = live ? '/app/formats/' + x.id : '/app/formats'; }
      else if (x.kind === 'creator') { s = s || 'Ajouté ' + dayTxt(x.at); href = live ? '/app/createurs/' + x.id : '/app/createurs/zinedine.gsbb'; }
      else { s = s || 'Ajoutée ' + dayTxt(x.at); }
      return { t, s, src, ico, href, rad: x.kind === 'creator' ? '50%' : '12px', remove: () => drop(x), rmLabel: 'Retirer ' + t + ' du dossier' };
    };
    const GR = [['app', 'Apps'], ['format', 'Formats'], ['creator', 'Créateurs'], ['video', 'Vidéos']];
    const tab = st.tab || 'Tout';
    const TL = { Apps: 'app', Formats: 'format', 'Créateurs': 'creator', 'Vidéos': 'video' };
    const secs = GR.filter((g) => tab === 'Tout' || TL[tab] === g[0]).map((g) => { const its = items.filter((x) => x.kind === g[0]).map(row);
      return { title: g[1], n: String(its.length), items: its.map((r, i) => Object.assign(r, { sep: i === 0 ? 'transparent' : 'var(--line)' })) }; }).filter((g) => g.items.length);
    const last = Math.max(folder.createdAt || 0, ...items.map((x) => x.at || 0));
    const name = folder.name, draft = st.draft == null ? name : st.draft;
    const saveName = () => { const n = draft.trim(); if (!n) return; change((fs) => fs.map((f) => (f.id === folder.id ? Object.assign({}, f, { name: n }) : f))); this.setState({ renaming: false, draft: null }); };
    return { has: true, gone: false, goneText, folderName: name, empty: items.length === 0, secs,
      metaLabel: plural(items.length, 'élément') + (last ? ' · modifié ' + dayTxt(last) : ''),
      tabs: [['Tout', items.length]].concat(GR.map((g) => [g[1], items.filter((x) => x.kind === g[0]).length])).filter((t, i) => i === 0 || t[1] > 0)
        .map((t) => ({ l: t[0], n: t[1], on: t[0] === tab ? 'true' : 'false', pick: () => this.setState({ tab: t[0] }) })),
      renaming: !!st.renaming, draft, startRename: () => this.setState({ renaming: true, confirming: false, draft: name }), cancelRename: () => this.setState({ renaming: false, draft: null }),
      onDraft: (e) => this.setState({ draft: e.target.value }), saveName,
      draftKeys: (e) => { if (e.key === 'Enter') { e.preventDefault(); saveName(); } else if (e.key === 'Escape') { e.preventDefault(); this.setState({ renaming: false, draft: null }); } },
      setDraft: (el) => { if (el && el !== this.draftEl) { this.draftEl = el; el.focus(); el.select(); } },
      confirming: !!st.confirming, confirmText: 'Supprimer « ' + name + ' » ?',
      confirmSub: items.length ? 'Les ' + plural(items.length, 'élément') + ' qu’il range ne seront plus gardés ici.' : 'Il est vide.',
      askDelete: () => this.setState({ confirming: true, renaming: false }), cancelDelete: () => this.setState({ confirming: false }),
      doDelete: () => { change((fs) => fs.filter((f) => f.id !== folder.id)); this.setState({ confirming: false, deleted: true }); } };
  }

  baseVals() {
    const tabs = [{"l": "Tout", "n": 7, "on": "true"}, {"l": "Apps", "n": 3, "on": "false"}, {"l": "Formats", "n": 2, "on": "false"}, {"l": "Créateurs", "n": 1, "on": "false"}, {"l": "Vidéos", "n": 1, "on": "false"}];
    const apps = [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": "", "n": "Astra AI", "niche": "Études", "v": "57,7 M vues en 30 j"}, {"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": "", "n": "Knowunity", "niche": "Études", "v": "44,4 M vues en 30 j"}, {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": "", "n": "Retain Cards", "niche": "Études", "v": "Vues pas encore relevées"}];
    const fmts = [{"rank": "01", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« Ich lösche das in 2h‼️ »", "raw": "Ich lösche das in 2h‼️", "gloss": "Vidéo supprimée dans 24 heures", "niche": "Études", "mk": [{"c": "DE"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "39×", "medInk": "var(--accent)", "hot": true, "max": "106 k", "apps": [{"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}], "appLine": "Retain Cards", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "last": "vu le 10/11", "cov": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}], "cov4": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "h": "@study.mit.sophia", "raw": 1064, "date": "06/11", "app": "Retain Cards"}], "views": 201780}, {"rank": "02", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« ‼️🚨GUARDA E PARTILHA🚨‼️ »", "raw": "‼️🚨GUARDA E PARTILHA🚨‼️", "gloss": "Appel à sauvegarder et partager la vidéo", "niche": "Études", "mk": [{"c": "BR"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "17×", "medInk": "var(--accent)", "hot": true, "max": "38 k", "apps": [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}], "appLine": "Astra AI", "app0": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}], "cov4": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}, {"src": "/media/app/v-7706231148648647969.jpg", "v": "1 k", "h": "@studywithninaa_", "raw": 1233, "date": "09/11", "app": "Astra AI"}], "views": 101659}];
    const joel = {"av": "/media/app/av-learnwithjoel1.jpg", "noav": false, "h": "@learnwithjoel1", "s": "Astra AI · Espagne · 12,2 k abonnés", "x": "65×"};
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let vid = {"src": "/media/app/v-7705368869250075925.jpg", "h": "@belajarbersamaespi", "app": "Astra AI", "v": "1,99 M", "x": "2 333×", "id": "7705368869250075925", "mk": "ID", "date": "07/11", "when": "07/11 · 11 h"};
    vid = Object.assign({}, vid, { href: '/app/videos/' + vkey(vid.src) });
    return { tabs, apps, fmts, joel, vid };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("a", { "class": "sw-btn sw-btn-icon", "href": "/app/dossiers", "aria-label": "Retour", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-left: -10px;" },
              $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            $h("span", { "style": "flex: 1; min-width: 0; font-family: var(--font-display); font-size: 19px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
              $t($v.folderName)
            )
          )
        ),
        ($v.gone) ? [
          $h("div", { "style": "padding: 56px 24px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center;" },
            $h("p", { "style": "margin: 0; font-size: 17px; font-weight: 600;" },
              $t($v.goneText)
            ),
            $h("a", { "class": "sw-link", "href": "/app/dossiers", "style": "min-height: 44px; display: inline-flex; align-items: center;" },
              "Voir mes dossiers"
            )
          )
        ] : null,
        ($v.has) ? [
          $h("div", { "style": "padding: 14px 20px 0; display: flex; align-items: center; justify-content: space-between;" },
            $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
              $t($v.metaLabel)
            ),
            $h("span", { "style": "display: flex; gap: 2px;" },
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.startRename, "aria-label": "Renommer le dossier", "style": "width: 44px; height: 44px; flex-shrink: 0;" },
                $h("svg", { "width": "19", "height": "19", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M4 20h4L19 9l-4-4L4 16zM14 6l4 4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.askDelete, "aria-label": "Supprimer le dossier", "style": "width: 44px; height: 44px; flex-shrink: 0;" },
                $h("svg", { "width": "19", "height": "19", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          ),
          ($v.renaming) ? [
            $h("div", { "class": "sw-card is-featured", "style": "margin: 12px 20px 0; border-radius: 22px; padding: 18px; display: flex; flex-direction: column; gap: 12px;" },
              $h("label", { "class": "sw-label", "for": "m-rn" },
                "Nouveau nom"
              ),
              $h("input", { "ref": $v.setDraft, "class": "sw-input", "id": "m-rn", "type": "text", "value": $v.draft, "onInput": $v.onDraft, "onKeyDown": $v.draftKeys, "autocomplete": "off", "style": "font-size: 16px;" }),
              $h("div", { "style": "display: flex; justify-content: flex-end; align-items: center; gap: 14px;" },
                $h("button", { "type": "button", "onClick": $v.cancelRename, "style": "min-height: 44px; border: 0; background: transparent; color: var(--ink-muted); font-family: inherit; font-size: 15px; cursor: pointer;" },
                  "Annuler"
                ),
                $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.saveName },
                  "Enregistrer",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          ] : null,
          ($v.confirming) ? [
            $h("div", { "class": "sw-card is-featured", "style": "margin: 12px 20px 0; border-radius: 22px; padding: 18px; display: flex; flex-direction: column; gap: 10px;" },
              $h("span", { "style": "font-size: 16px; font-weight: 600; line-height: 1.4;" },
                $t($v.confirmText)
              ),
              $h("span", { "style": "font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
                $t($v.confirmSub)
              ),
              $h("div", { "style": "display: flex; justify-content: flex-end; align-items: center; gap: 14px;" },
                $h("button", { "type": "button", "onClick": $v.cancelDelete, "style": "min-height: 44px; border: 0; background: transparent; color: var(--ink-muted); font-family: inherit; font-size: 15px; cursor: pointer;" },
                  "Annuler"
                ),
                $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.doDelete },
                  "Supprimer",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          ] : null,
          $h("div", { "style": "padding-top: 8px; display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
            ($l($v.tabs)).map((t) => [
              $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": t?.on, "onClick": t?.pick, "style": "height: 44px; flex-shrink: 0;" },
                $t(t?.l),
                $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                  $t(t?.n)
                )
              )
            ])
          ),
          ($v.empty) ? [
            $h("p", { "style": "margin: 24px 20px 0; font-size: 15px; line-height: 1.5; color: var(--ink-muted);" },
              "Ce dossier est vide. Range-y une app, un format, un créateur ou une vidéo depuis sa fiche, avec le bouton dossier."
            )
          ] : null,
          ($l($v.secs)).map((g) => [
            $h("div", { "style": "padding: 22px 20px 10px; display: flex; align-items: baseline; gap: 8px;" },
              $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 17px; font-weight: 700;" },
                $h("span", { "class": "m-ic", "data-i": g?.title, "aria-hidden": "true", "style": "width: 16px; height: 16px;" }),
                $t(g?.title)
              ),
              $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                $t(g?.n)
              )
            ),
            $h("div", { "class": "sw-card", "style": "margin: 0 20px; border-radius: 20px; padding: 0; overflow: hidden;" },
              ($l(g?.items)).map((x) => [
                $h("div", { "style": `display: flex; align-items: center; gap: 4px; padding: 0 6px 0 14px; border-top: 1px solid ${$t(x?.sep)};` },
                  $h("a", { "href": x?.href, "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; min-height: 64px; text-decoration: none; color: inherit;" },
                    $h("span", { "style": `position: relative; width: 44px; height: 44px; border-radius: ${$t(x?.rad)}; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(150deg, #28405E, #0A0C12 58%, #28405E 130%); color: #E4E7EC;` },
                      $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": x?.ico, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      ),
                      (x?.src) ? [
                        $h("img", { "class": "sw-cover", "src": x?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                      ] : null
                    ),
                    $h("span", { "style": "min-width: 0; display: flex; flex-direction: column; gap: 3px;" },
                      $h("span", { "style": "font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t(x?.t)
                      ),
                      $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                        $t(x?.s)
                      )
                    )
                  ),
                  $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": x?.remove, "aria-label": x?.rmLabel, "style": "width: 44px; height: 44px; flex-shrink: 0;" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ])
            )
          ])
        ] : null,
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
