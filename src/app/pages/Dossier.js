// Généré par scripts/dc2preact.py depuis design/app/DossiersB.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import Palette from './Palette.js';

export default class Dossier extends DCLogic {

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
    const tab = st.tab || 'Tout';
    return {
      tabs: (b.tabs || []).map((t) => Object.assign({}, t, { on: t.l === tab ? 'true' : 'false', pick: () => this.setState({ tab: t.l }) })),
      showApps: tab === 'Tout' || tab === 'Apps', showFmts: tab === 'Tout' || tab === 'Formats', showCr: tab === 'Tout' || tab === 'Créateurs', showVid: tab === 'Tout' || tab === 'Vidéos'
    };
  }

  baseVals() {
    const nav = [{"d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "label": "Accueil", "href": "/app", "cur": "false"}, {"d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "label": "Apps", "href": "/app/apps", "cur": "false"}, {"d": "M4 5h16v14H4zM10 9l5 3-5 3z", "label": "Formats", "href": "/app/formats", "cur": "false"}, {"d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "label": "Créateurs", "href": "/app/createurs", "cur": "false"}, {"d": "M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0", "label": "Alertes", "href": "#", "cur": "false"}, {"d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "label": "Dossiers", "href": "#", "cur": "page"}];
    const side = [{"name": "Études, ce qui marche", "count": 7, "src": "/media/app/v-7705368869250075925.jpg", "bg": "var(--accent-soft)", "edge": "var(--accent-edge)", "ink": "var(--ink)"}, {"name": "Side hustle", "count": 5, "src": "/media/app/v-7700172397613288736.jpg", "bg": "transparent", "edge": "transparent", "ink": "var(--ink-soft)"}, {"name": "Jalousie et ex", "count": 5, "src": "/media/app/v-7705376808862076182.jpg", "bg": "transparent", "edge": "transparent", "ink": "var(--ink-soft)"}, {"name": "Couple", "count": 4, "src": "/media/app/v-7705441234847862037.jpg", "bg": "transparent", "edge": "transparent", "ink": "var(--ink-soft)"}];
    const tabs = [{"l": "Tout", "n": 7, "on": "true"}, {"l": "Apps", "n": 3, "on": "false"}, {"l": "Formats", "n": 2, "on": "false"}, {"l": "Créateurs", "n": 1, "on": "false"}, {"l": "Vidéos", "n": 1, "on": "false"}];
    const apps = [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": "", "n": "Astra AI", "niche": "Études", "v": "57,7 M", "rev": "Entre 144 et 202 k€", "covs": [{"src": "/media/app/v-7700392351268752661.jpg"}, {"src": "/media/app/v-7697654738124442896.jpg"}, {"src": "/media/app/v-7702743575934684437.jpg"}]}, {"name": "Knowunity", "logo": "/media/app/app-knowunity.jpg", "nologo": false, "blank": "", "n": "Knowunity", "niche": "Études", "v": "44,4 M", "rev": "Entre 111 et 156 k€", "covs": [{"src": "/media/app/v-7699151144400244000.jpg"}, {"src": "/media/app/v-7702625361716170002.jpg"}, {"src": "/media/app/v-7698010148391947552.jpg"}]}, {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": "", "n": "Retain Cards", "niche": "Études", "v": "—", "rev": "Pas encore relevé", "covs": []}];
    const fmts = [{"rank": "01", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« Ich lösche das in 2h‼️ »", "raw": "Ich lösche das in 2h‼️", "gloss": "Vidéo supprimée dans 24 heures", "niche": "Études", "mk": [{"c": "DE"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "39×", "medInk": "var(--accent)", "hot": true, "max": "106 k", "apps": [{"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}], "appLine": "Retain Cards", "app0": {"name": "Retain Cards", "logo": "/media/app/retain-cards.jpg", "nologo": false, "blank": ""}, "last": "vu le 10/11", "cov": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}], "cov4": [{"src": "/media/app/v-7706579888727231777.jpg", "v": "106 k", "h": "@studywithdenise", "raw": 105676, "date": "10/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705712961511263521.jpg", "v": "83 k", "h": "@study.mit.lauri", "raw": 83412, "date": "08/11", "app": "Retain Cards"}, {"src": "/media/app/v-7705122381735513376.jpg", "v": "12 k", "h": "@studywithdenise", "raw": 11628, "date": "06/11", "app": "Retain Cards"}, {"src": "/media/app/v-7704967516086488353.jpg", "v": "1 k", "h": "@study.mit.sophia", "raw": 1064, "date": "06/11", "app": "Retain Cards"}], "views": 201780}, {"rank": "02", "kind": "Accroche", "ico": "M5 6h14M12 6v13M9 19h6", "isHook": true, "isSon": false, "quote": "« ‼️🚨GUARDA E PARTILHA🚨‼️ »", "raw": "‼️🚨GUARDA E PARTILHA🚨‼️", "gloss": "Appel à sauvegarder et partager la vidéo", "niche": "Études", "mk": [{"c": "BR"}], "n": 3, "ok": "3/4", "okText": "3 sur 4", "pips": [{"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--accent)"}, {"bg": "var(--line-strong)"}], "med": "17×", "medInk": "var(--accent)", "hot": true, "max": "38 k", "apps": [{"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}], "appLine": "Astra AI", "app0": {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": ""}, "last": "vu le 09/11", "cov": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}], "cov4": [{"src": "/media/app/v-7705159364558081313.jpg", "v": "38 k", "h": "@matildediaries", "raw": 37546, "date": "06/11", "app": "Astra AI"}, {"src": "/media/app/v-7702530293768523041.jpg", "v": "35 k", "h": "@studywithninaa_", "raw": 34504, "date": "30/10", "app": "Astra AI"}, {"src": "/media/app/v-7701734315805166880.jpg", "v": "28 k", "h": "@learnwithdelio", "raw": 28376, "date": "28/10", "app": "Astra AI"}, {"src": "/media/app/v-7706231148648647969.jpg", "v": "1 k", "h": "@studywithninaa_", "raw": 1233, "date": "09/11", "app": "Astra AI"}], "views": 101659}];
    const joel = {"av": "/media/app/av-learnwithjoel1.jpg", "noav": false, "h": "@learnwithjoel1", "s": "12,2 k abonnés · Astra AI · Espagne", "x": "65×", "v": "1,87 M"};
    const vid = {"src": "/media/app/v-7705368869250075925.jpg", "h": "@belajarbersamaespi", "app": "Astra AI", "v": "1,99 M", "x": "2 333×", "id": "7705368869250075925", "mk": "ID", "date": "07/11", "when": "07/11 · 11 h"};
    return { nav, side, tabs, apps, fmts, joel, vid };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 960px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
          $h("div", { "style": "display: flex; min-height: 100%; flex: 1;" },
            $h("aside", { "style": "width: 280px; flex-shrink: 0; border-right: 1px solid var(--line); padding: 28px 16px; display: flex; flex-direction: column; gap: 6px;" },
              $h("span", { "style": "padding: 0 12px 10px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint);" },
                "Mes dossiers"
              ),
              ($l($v.side)).map((d) => [
                $h("a", { "href": "/app/dossiers/etudes", "style": `display: flex; align-items: center; gap: 12px; padding: 8px 12px 8px 8px; border-radius: 14px; background: ${$t(d?.bg)}; box-shadow: inset 0 0 0 1px ${$t(d?.edge)}; text-decoration: none; color: ${$t(d?.ink)};` },
                  $h("span", { "style": "width: 36px; height: 36px; border-radius: 10px; overflow: hidden; flex-shrink: 0; position: relative;" },
                    $h("img", { "class": "sw-cover", "src": d?.src, "alt": "" })
                  ),
                  $h("span", { "style": "flex: 1; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t(d?.name)
                  ),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    $t(d?.count)
                  )
                )
              ]),
              $h("a", { "class": "sw-more", "href": "/app/dossiers", "style": "padding: 12px; gap: 10px;" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Nouveau dossier"
              )
            ),
            $h("div", { "style": "flex: 1; min-width: 0; padding: 32px 32px 48px; display: flex; flex-direction: column; gap: 18px;" },
              $h("div", { "style": "display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                    "Dossier · 7 éléments · modifié le 12/11"
                  ),
                  $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 38px; line-height: 1.05; font-weight: 700; letter-spacing: -0.04em;" },
                    "Études, ce qui marche"
                  )
                ),
                $h("span", { "style": "display: flex; gap: 4px;" },
                  $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Renommer" },
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 20h4L19 9l-4-4L4 16zM14 6l4 4", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Supprimer le dossier" },
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ),
              $h("div", { "style": "display: flex; gap: 8px;" },
                ($l($v.tabs)).map((t) => [
                  $h("button", { "class": "sw-pill", "type": "button", "aria-pressed": t?.on, "onClick": t?.pick, "style": "height: 36px;" },
                    $t(t?.l),
                    $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                      $t(t?.n)
                    )
                  )
                ])
              ),
              ($v.showApps) ? [
                $h("div", { "style": "display: flex; align-items: baseline; gap: 10px; margin-top: 8px;" },
                  $h("h2", { "class": "sw-card-title", "style": "font-size: 17px;" },
                    "Apps"
                  ),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    "3"
                  )
                ),
                $h("div", { "class": "sw-card", "style": "border-radius: 22px; padding: 4px 0;" },
                  ($l($v.apps)).map((a) => [
                    $h("a", { "href": "/app/apps/astra-ai", "style": "display: grid; grid-template-columns: minmax(0, 1.6fr) 1fr 1.3fr 150px; align-items: center; gap: 16px; padding: 14px 20px; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit;" },
                      $h("span", { "style": "display: flex; align-items: center; gap: 14px;" },
                        $h("span", { "class": `sw-app-icon ${$t(a?.blank)}`, "style": "width: 44px; height: 44px; border-radius: 12px;" },
                          (a?.logo) ? [
                            $h("img", { "class": "sw-logo-img", "src": a?.logo, "alt": "" })
                          ] : null,
                          (a?.nologo) ? [
                            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                          $h("span", { "style": "font-size: 15px; font-weight: 600; color: var(--ink);" },
                            $t(a?.n)
                          ),
                          $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                            $t(a?.niche)
                          )
                        )
                      ),
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--ink);" },
                          $t(a?.v)
                        ),
                        $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                          "vues en 30 j"
                        )
                      ),
                      $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                        $h("span", { "style": "font-size: 14px; font-weight: 600; color: var(--ink);" },
                          $t(a?.rev)
                        ),
                        $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                          "revenus estimés"
                        )
                      ),
                      $h("span", { "style": "display: flex; gap: 4px; justify-content: flex-end;" },
                        ($l(a?.covs)).map((c) => [
                          $h("span", { "class": "sw-video", "style": "display: block; width: 34px; border-radius: 7px;" },
                            $h("img", { "class": "sw-cover", "src": c?.src, "alt": "" })
                          )
                        ])
                      )
                    )
                  ])
                )
              ] : null,
              ($v.showFmts) ? [
                $h("div", { "style": "display: flex; align-items: baseline; gap: 10px; margin-top: 8px;" },
                  $h("h2", { "class": "sw-card-title", "style": "font-size: 17px;" },
                    "Formats"
                  ),
                  $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                    "2"
                  )
                ),
                $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;" },
                  ($l($v.fmts)).map((f) => [
                    $h("a", { "href": "/app/formats/ich-losche-das-in-2h", "class": "sw-card", "style": "border-radius: 22px; padding: 16px; display: flex; gap: 16px; align-items: center; text-decoration: none; color: inherit;" },
                      $h("span", { "style": "display: flex; gap: 4px;" },
                        ($l(f?.cov)).map((v) => [
                          $h("span", { "class": "sw-video", "style": "display: block; width: 52px; border-radius: 10px;" },
                            $h("img", { "class": "sw-cover", "src": v?.src, "alt": "" })
                          )
                        ])
                      ),
                      $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px;" },
                        $h("span", { "style": "font-size: 15px; font-weight: 600; line-height: 1.4; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" },
                          $t(f?.quote)
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                          $t(f?.kind), " · ", $t(f?.n), " comptes · ",
                          $h("span", { "style": "color: var(--accent); font-weight: 600;" },
                            $t(f?.med), " la normale"
                          )
                        )
                      )
                    )
                  ])
                )
              ] : null,
              $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;" },
                ($v.showCr) ? [
                  $h("div", { "style": "display: flex; flex-direction: column; gap: 14px;" },
                    $h("div", { "style": "display: flex; align-items: baseline; gap: 10px; margin-top: 8px;" },
                      $h("h2", { "class": "sw-card-title", "style": "font-size: 17px;" },
                        "Créateurs"
                      ),
                      $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                        "1"
                      )
                    ),
                    $h("a", { "href": "/app/createurs/zinedine-gsbb", "class": "sw-card", "style": "border-radius: 22px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit;" },
                      $h("span", { "style": "width: 52px; height: 52px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #1B2333, #111724); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.10);" },
                        ($v.joel?.av) ? [
                          $h("img", { "src": $v.joel?.av, "alt": "", "style": "width: 100%; height: 100%; object-fit: cover; display: block;" })
                        ] : null,
                        ($v.joel?.noav) ? [
                          $h("svg", { "width": "26", "height": "26", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                            $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                            $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                          )
                        ] : null
                      ),
                      $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 3px;" },
                        $h("span", { "style": "font-size: 16px; font-weight: 700;" },
                          $t($v.joel?.h)
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                          $t($v.joel?.s)
                        )
                      ),
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--accent);" },
                          $t($v.joel?.x)
                        ),
                        $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                          "sa normale"
                        )
                      )
                    )
                  )
                ] : null,
                ($v.showVid) ? [
                  $h("div", { "style": "display: flex; flex-direction: column; gap: 14px;" },
                    $h("div", { "style": "display: flex; align-items: baseline; gap: 10px; margin-top: 8px;" },
                      $h("h2", { "class": "sw-card-title", "style": "font-size: 17px;" },
                        "Vidéos"
                      ),
                      $h("span", { "style": "font-family: var(--font-mono); font-size: 12px; color: var(--ink-faint);" },
                        "1"
                      )
                    ),
                    $h("a", { "href": "/app/videos/learnwithjoel1", "class": "sw-card", "style": "border-radius: 22px; padding: 14px; display: flex; align-items: center; gap: 16px; text-decoration: none; color: inherit;" },
                      $h("span", { "class": "sw-video", "style": "display: block; width: 56px; border-radius: 10px;" },
                        $h("img", { "class": "sw-cover", "src": $v.vid?.src, "alt": "" })
                      ),
                      $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 3px;" },
                        $h("span", { "style": "font-size: 16px; font-weight: 700;" },
                          $t($v.vid?.h)
                        ),
                        $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                          "Astra AI · ", $t($v.vid?.when)
                        )
                      ),
                      $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end;" },
                        $h("span", { "style": "font-family: var(--font-display); font-size: 20px; font-weight: 700;" },
                          $t($v.vid?.v)
                        ),
                        $h("span", { "style": "font-size: 11px; font-weight: 600; color: var(--accent);" },
                          $t($v.vid?.x), " sa normale"
                        )
                      )
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
