// Généré par scripts/dc2preact.py depuis design/app/MAccueil.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import MAjout from './MAjout.js';
import MPalette from './MPalette.js';

export default class MAccueil extends DCLogic {

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
    const u = this.props.user;
    const p = u ? (u.prenom || null) : 'Anthony';
    return { greet: p ? 'Bon retour, ' + p + '.' : 'Bon retour.',
      niches: (b.niches || []).map((n) => Object.assign({}, n, { href: '/app/apps' + '?niche=' + encodeURIComponent(n.l) })) };
  }

  baseVals() {
    let niches = [{"l": "Études"}, {"l": "Couple"}, {"l": "Séduction IA"}, {"l": "Foi"}, {"l": "Side hustle"}];
    let look = [{"name": "Luv or Pop", "logo": "/media/app/app-luv-or-pop.jpg", "nologo": false, "blank": "", "sub": "Vidéo à 7,5 M vues", "v": "H+26"}, {"name": "DJ Kartier", "logo": "/media/app/app-dj-kartier.jpg", "nologo": false, "blank": "", "sub": "Vidéo à 5,5 M vues", "v": "H+43"}, {"name": "Astra AI", "logo": "/media/app/app-astra-ai.jpg", "nologo": false, "blank": "", "sub": "Une vidéo face à sa normale", "v": "2 333×"}, {"name": "Love8", "logo": "/media/app/app-love8.jpg", "nologo": false, "blank": "", "sub": "Comptes en une recherche", "v": "+69"}];
    const vkey = (s) => { const m = String(s).match(/v-(\d+)\.jpg/) || String(s).match(/_blob\/([0-9a-f]{32})/); return m ? m[1] : ''; };
    let alert = {"src": "/media/app/v-7705368869250075925.jpg"};
    alert = Object.assign({}, alert, { href: '/app/videos/' + vkey(alert.src) });
    alert = Object.assign({ on: true, views: '2,0 M', kicker: 'Alerte · Astra AI', text: 'Une vidéo à 2 333× sa normale' }, alert);
    look = look.map((r) => Object.assign({ href: '/app/apps/astraai' }, r));
    // Sur le site : l'accueil du Radar (document « home »), lu comme Main : « Ça explose » = les 2 apps qui progressent
    // le plus cette semaine, puis 2 vidéos qui décollent (la 1re est dans la carte d'alerte), chaque ligne vers sa fiche ou sa vidéo.
    const D = this.props && this.props.data;
    if (D === null) { look = []; niches = []; alert = { on: false }; }
    if (D && D.apps) {
      const nf = (n) => (n >= 999500 ? (n / 1e6).toFixed(1).replace('.', ',').replace(/,0$/, '') + ' M' : n >= 999.5 ? Math.round(n / 1e3) + ' k' : String(Math.round(n || 0)));
      const xf = (x) => (x < 0.05 ? '< 0,1' : x >= 100 ? Math.round(x).toLocaleString('en-US').replace(/,/g, '\u202f') : x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10).replace('.', ',')) + '×';
      const pct = (d) => (d >= 9 ? '×' + Math.round(1 + d).toLocaleString('en-US').replace(/,/g, '\u202f') : (d >= 0 ? '+' : '−') + Math.round(Math.abs(d) * 100) + ' %');
      const day = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const ago = (ms) => { const d = Math.max(0, Math.round((Date.now() - ms) / 86400000)); return d === 0 ? 'aujourd’hui' : 'il y a ' + d + ' j'; };
      const MKN = (c) => ({ FR: 'France', US: 'États-Unis et anglophones', MX: 'Amérique latine', ES: 'Espagne', BR: 'Brésil et Portugal', DE: 'Allemagne et germanophones', SA: 'Monde arabe', RU: 'Russie et russophones' })[c] || (c && /^[A-Z]{2}$/.test(c) && typeof Intl !== 'undefined' && Intl.DisplayNames ? (new Intl.DisplayNames(['fr'], { type: 'region' }).of(c) || c) : '');
      const ML = new Proxy({}, { get: (o, c) => MKN(String(c)) });
      const ico = (o) => ({ logo: (o && o.icon) || '', nologo: !(o && o.icon), blank: o && o.icon ? '' : 'sw-app-blank' });
      const flags = (cs) => (cs || []).filter((c) => c).slice(0, 3).map((c) => ({ c }));
      const names = (as) => { const n = (as || []).map((a) => a.name); return n.length > 3 ? n.slice(0, 2).join(', ') + ' et ' + (n.length - 2) + ' autres' : n.length > 1 ? n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1] : n.join(''); };
      const TXT = 'M5 6h14M12 6v13M9 19h6', SON = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
      const has = (d) => d !== null && d !== undefined;
      const appRow = (a) => Object.assign({ name: a.name, sub: nf(a.views7 || 0) + ' vues en 7 jours', v: has(a.weekDelta) ? pct(a.weekDelta) : (a.bestX ? xf(a.bestX) : ''), href: '/app/apps/' + a.slug }, ico(a));
      const vidRow = (v) => Object.assign({ name: v.app ? v.app.name : '@' + v.handle, sub: 'Vidéo à ' + nf(v.views) + ' vues', v: v.x ? xf(v.x) : '', href: '/app/videos/' + v.id }, ico(v.app));
      const apps = D.apps.slice().sort((p, q) => (has(q.weekDelta) ? q.weekDelta : -Infinity) - (has(p.weekDelta) ? p.weekDelta : -Infinity));
      const vids = D.videos || [];
      look = apps.slice(0, 2).map(appRow).concat(vids.slice(1, 3).map(vidRow), apps.slice(2).map(appRow)).slice(0, 4);
      niches = (D.niches || []).map((n) => ({ l: n }));
      const v0 = vids[0];
      const who = v0 ? (v0.app ? v0.app.name : '@' + v0.handle) : '';
      alert = v0 ? { on: true, src: v0.cover || '', views: nf(v0.views), kicker: 'Alerte · ' + who,
        text: v0.x ? 'Une vidéo à ' + xf(v0.x) + ' sa normale' : 'Une vidéo à ' + nf(v0.views) + ' vues', href: '/app/videos/' + v0.id } : { on: false };
    }
    return { niches, look, alert, noLook: look.length === 0, hasNiches: niches.length > 0 };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw ", "style": "position: relative; width: 100%; min-height: 100vh; padding-bottom: calc(96px + env(safe-area-inset-bottom)); box-sizing: border-box; overflow-x: clip; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("header", { "style": "position: sticky; top: 0; z-index: 6; height: 56px; padding: 0 14px 0 20px; display: flex; align-items: center; gap: 4px; background: rgba(8,11,18,0.86); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);" },
          $h("span", { "style": "flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px;" },
            $h("a", { "class": "sw-logo", "href": "/app", "aria-label": "Swarm, accueil" },
              $h("svg", { "class": "sw-logo-mark on-dark", "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 24px; height: 24px;" },
                $h("circle", { "class": "d-a", "cx": "5", "cy": "8", "r": "2.3" }),
                $h("circle", { "class": "d-a", "cx": "11", "cy": "5", "r": "2.3" }),
                $h("circle", { "class": "d-a", "cx": "17", "cy": "8", "r": "2.3" }),
                $h("circle", { "class": "d-b", "cx": "8", "cy": "14", "r": "2.3" }),
                $h("circle", { "class": "d-b", "cx": "14", "cy": "13", "r": "2.3" }),
                $h("circle", { "class": "d-b", "cx": "19", "cy": "17", "r": "2.3" }),
                $h("circle", { "class": "d-b", "cx": "11", "cy": "20", "r": "2.3" })
              ),
              $h("span", { "class": "sw-wordmark", "style": "font-size: 20px;" },
                "swarm"
              )
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
        $h("div", { "style": "padding: 18px 20px 0; display: flex; flex-direction: column; gap: 10px;" },
          $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 32px; line-height: 1.05; font-weight: 700; letter-spacing: -0.045em;" },
            $t($v.greet)
          ),
          $h("p", { "style": "margin: 0; font-size: 15px; line-height: 1.5; color: var(--ink-muted);" },
            "Ce qui explose sur TikTok et Instagram, app par app, marché par marché."
          )
        ),
        $h("button", { "type": "button", "onClick": $v.openPal, "class": "sw-search", "style": "margin: 18px 20px 0; width: calc(100% - 40px); box-sizing: border-box; height: 54px; padding: 0 8px 0 16px; color: var(--ink-faint); box-shadow: none; font: inherit; text-align: left; cursor: pointer;" },
          $h("svg", { "width": "19", "height": "19", "viewBox": "0 0 24 24", "aria-hidden": "true" },
            $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
          ),
          $h("span", { "style": "flex: 1; min-width: 0; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
            "Une app, un format, un compte…"
          )
        ),
        ($v.hasNiches) ? [
          $h("div", { "style": "padding: 22px 0 0; display: flex; flex-direction: column; gap: 10px;" },
            $h("span", { "style": "padding: 0 20px; font-size: 14px; color: var(--ink-muted);" },
              "Ça explose cette semaine :"
            ),
            $h("div", { "style": "display: flex; gap: 10px; overflow-x: auto; padding: 0 20px; scrollbar-width: none; -webkit-overflow-scrolling: touch;" },
              ($l($v.niches)).map((n) => [
                $h("a", { "class": "sw-pill", "href": n?.href, "style": "height: 44px; flex-shrink: 0;" },
                  $t(n?.l)
                )
              ])
            )
          )
        ] : null,
        $h("div", { "style": "padding-top: 28px; display: flex; flex-direction: column; gap: 12px;" },
          $h("div", { "style": "padding: 0 20px; display: flex; align-items: baseline; justify-content: space-between;" },
            $h("h2", { "style": "display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--ink-faint);" },
                $h("path", { "d": "M3 17l6-6 4 4 8-8M15 7h6v6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Ça explose"
            ),
            $h("a", { "class": "sw-more", "href": "/app/apps" },
              "Tout voir"
            )
          ),
          $h("div", { "class": "sw-card", "style": "margin: 0 20px; border-radius: 22px; padding: 4px 0;" },
            ($v.noLook) ? [
              $h("p", { "style": "margin: 0; padding: 22px 16px; text-align: center; font-size: 15px; color: var(--ink-muted);" },
                "Rien à montrer pour l’instant."
              )
            ] : null,
            ($l($v.look)).map((r) => [
              $h("a", { "href": r?.href, "style": "display: flex; align-items: center; gap: 14px; padding: 12px 16px; text-decoration: none; color: inherit; border-bottom: 1px solid var(--line);" },
                $h("span", { "class": `sw-app-icon ${$t(r?.blank)}`, "style": "width: 44px; height: 44px; border-radius: 12px;" },
                  (r?.logo) ? [
                    $h("img", { "class": "sw-logo-img", "src": r?.logo, "alt": "", "loading": "lazy", "decoding": "async" })
                  ] : null,
                  (r?.nologo) ? [
                    $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ] : null
                ),
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 600;" },
                    $t(r?.name)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                    $t(r?.sub)
                  )
                ),
                $h("span", { "style": "font-family: var(--font-display); font-size: 19px; font-weight: 700; color: var(--accent);" },
                  $t(r?.v)
                )
              )
            ])
          )
        ),
        ($v.alert?.on) ? [
          $h("a", { "href": $v.alert?.href, "class": "sw-card is-featured", "style": "margin: 20px 20px 0; border-radius: 22px; padding: 14px; display: flex; gap: 14px; align-items: center; text-decoration: none; color: inherit;" },
            $h("span", { "class": "sw-video", "style": "display: block; width: 64px; border-radius: 12px; flex-shrink: 0;" },
              $h("img", { "class": "sw-cover", "src": $v.alert?.src, "alt": "", "loading": "lazy", "decoding": "async" }),
              $h("span", { "class": "sw-video-shade" }),
              $h("span", { "style": "position: absolute; left: 6px; bottom: 5px; font-size: 11px; font-weight: 700; color: #FFFFFF;" },
                $t($v.alert?.views)
              )
            ),
            $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
              $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--accent);" },
                $t($v.alert?.kicker)
              ),
              $h("span", { "style": "font-size: 16px; font-weight: 700; line-height: 1.3;" },
                $t($v.alert?.text)
              ),
              $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                "Voir la vidéo"
              )
            )
          )
        ] : null,
        $h("nav", { "aria-label": "Navigation principale", "style": "position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding: 6px 6px max(10px, env(safe-area-inset-bottom)); box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); background: rgba(8,11,18,0.9); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border-top: 1px solid var(--line);" },
          $h("a", { "href": "/app", "aria-current": "page", "style": "min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; text-decoration: none; -webkit-tap-highlight-color: transparent; color: var(--accent); font-size: 11px; font-weight: 700;" },
            $h("svg", { "width": "23", "height": "23", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z", "fill": "none", "stroke": "currentColor", "stroke-width": "2.1", "stroke-linecap": "round", "stroke-linejoin": "round" })
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
