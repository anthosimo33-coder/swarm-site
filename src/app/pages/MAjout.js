// Généré par scripts/dc2preact.py depuis design/app/MAjout.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class MAjout extends DCLogic {
  // Clavier ouvert (audit Q72) : sur iPhone, il recouvre le bas de la page sans la réduire ; la feuille remonte de ce qu'il
  // cache (visualViewport). Chrome Android réduit la page lui-même (interactive-widget=resizes-content, app.html) : 0 ici.
  componentDidMount() {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    this.onVv = () => { const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)); if (kb !== ((this.state || {}).kb || 0)) this.setState({ kb }); };
    vv.addEventListener('resize', this.onVv);
    vv.addEventListener('scroll', this.onVv);
    this.onVv();
  }
  componentWillUnmount() { clearTimeout(this.tm); const vv = typeof window !== 'undefined' ? window.visualViewport : null; if (vv && this.onVv) { vv.removeEventListener('resize', this.onVv); vv.removeEventListener('scroll', this.onVv); } }
  renderVals() {
    const FL = (globalThis.__dcSample?.["MAjout"]?.["FL"] ?? []);
    const close = () => { if (this.props.onClose) this.props.onClose(); };
    const sheet = {
      close,
      keys: (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } },
      tStart: (e) => { this.y0 = e.touches && e.touches[0] ? e.touches[0].clientY : null; },
      tEnd: (e) => { const t = e.changedTouches && e.changedTouches[0]; if (this.y0 !== null && this.y0 !== undefined && t && t.clientY - this.y0 > 60) close(); this.y0 = null; }
    };
    const st = this.state || {};
    const P = this.props || {};
    // Les dossiers de la personne : sur le site, saved('folders') ; sur le canevas, l'exemple dans l'état local.
    const live = typeof P.saved === 'function' && typeof P.save === 'function';
    const EXF = FL.map((f, i) => ({ id: 'ex' + i, name: f.name, createdAt: 0, items: Array.from({ length: f.n }, (_, j) => ({ kind: 'video', id: 'ex' + i + '-' + j, label: '', cover: j === 0 ? f.src || null : null, at: 0 })) }));
    const read = () => (live ? P.saved('folders') : ((this.state || {}).local || EXF));
    const write = (next) => (live ? P.save('folders', next) : this.setState({ local: next }));
    // L'élément à ranger : passé par l'écran hôte ({ kind, id, label, cover }) ; sur le canevas, une app d'exemple.
    const item = P.item || (live ? null : { kind: 'app', id: 'astraai', label: 'Astra AI', cover: null });
    const raw = read();
    const loading = raw === undefined;
    const all = Array.isArray(raw) ? raw : [];
    const same = (x) => !!item && x.kind === item.kind && x.id === item.id;
    const has = (f) => (f.items || []).some(same);
    const entry = () => ({ kind: item.kind, id: item.id, label: item.label || '', cover: item.cover || null, at: Date.now() });
    const fresh = () => { const v = read(); return Array.isArray(v) ? v : []; };
    // Un tap coche ou décoche : la valeur entière est réécrite aussitôt.
    const toggle = (id) => { if (!item || read() === undefined) return;
      write(fresh().map((f) => (f.id !== id ? f : Object.assign({}, f, { items: has(f) ? (f.items || []).filter((x) => !same(x)) : [entry()].concat(f.items || []) })))); };
    const q = st.q || '';
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nq = norm(q.trim());
    const canCreate = !loading && !!nq && !all.some((f) => norm(f.name) === nq);
    const create = () => { const name = q.trim(); if (!name || !canCreate) return; const now = Date.now();
      write([{ id: now.toString(36) + Math.random().toString(36).slice(2, 6), name, createdAt: now, items: item ? [entry()] : [] }].concat(fresh())); this.setState({ q: '' }); };
    const rows = all.filter((f) => !nq || norm(f.name).indexOf(nq) >= 0).map((f) => { const c = has(f); const n = (f.items || []).length;
      const src = ((f.items || []).filter((x) => x.cover)[0] || {}).cover || '';
      return { name: f.name, src, nosrc: !src, count: n + (n > 1 ? ' éléments' : ' élément'), on: c ? 'true' : 'false', box: c ? 'var(--blue-600)' : 'transparent', boxe: c ? 'var(--blue-600)' : 'var(--line-strong)', ck: c ? '#FFFFFF' : 'transparent',
        toggle: () => toggle(f.id) }; });
    const n = all.filter(has).length;
    return {
      kb: ((this.state || {}).kb || 0) + 'px',
      sheet, q, rows, canCreate, create, noFolders: !loading && all.length === 0 && !nq,
      onQ: (e) => this.setState({ q: e.target.value }), setInput: (el) => { this.inp = el; },
      saved: n > 0, savedLabel: 'Dans ' + n + (n > 1 ? ' dossiers' : ' dossier'), save: close
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: fixed; inset: 0; z-index: 70; color: var(--ink); font-family: var(--font-body);" },
        $h("button", { "type": "button", "aria-label": "Fermer", "tabindex": "-1", "onClick": $v.sheet?.close, "style": "position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; cursor: default; background: rgba(5,7,12,0.62); touch-action: none; -webkit-tap-highlight-color: transparent;" }),
        $h("section", { "role": "dialog", "aria-modal": "true", "aria-label": "Ajouter à un dossier", "onKeyDown": $v.sheet?.keys, "style": `position: absolute; left: 0; right: 0; bottom: ${$t($v.kb)}; max-height: 88vh; max-height: calc(88dvh - ${$t($v.kb)}); overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; border-radius: 28px 28px 0 0; background: var(--surface-raised); border-top: 1px solid var(--line-strong); box-shadow: 0 -30px 80px rgba(0,0,0,0.55); padding: 0 20px max(20px, env(safe-area-inset-bottom)); animation: sw-rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;` },
          $h("div", { "ontouchstart": $v.sheet?.tStart, "ontouchend": $v.sheet?.tEnd, "style": "display: flex; justify-content: center; padding: 10px 0 6px; touch-action: none;" },
            $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 5px; border-radius: 3px; background: var(--line-strong);" })
          ),
          $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 4px 0 12px;" },
            $h("span", { "style": "font-size: 20px; font-weight: 700; letter-spacing: -0.02em;" },
              "Ajouter à un dossier"
            ),
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "onClick": $v.sheet?.close, "aria-label": "Fermer", "style": "flex-shrink: 0; width: 44px; height: 44px; margin-right: -8px;" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          ),
          $h("div", { "class": "sw-search", "style": "height: 48px; padding: 0 14px; box-shadow: none; border-radius: 14px;" },
            $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $h("input", { "ref": $v.setInput, "class": "sw-search-input", "type": "search", "value": $v.q, "onInput": $v.onQ, "aria-label": "Chercher ou créer un dossier", "placeholder": "Chercher ou créer un dossier…", "autocomplete": "off", "style": "font-size: 16px;" })
          ),
          $h("div", { "role": "group", "aria-label": "Dossiers", "style": "display: flex; flex-direction: column; margin-top: 6px;" },
            ($l($v.rows)).map((d) => [
              $h("button", { "type": "button", "role": "checkbox", "aria-checked": d?.on, "onClick": d?.toggle, "style": "display: flex; align-items: center; gap: 14px; min-height: 60px; padding: 8px 2px; border: 0; border-bottom: 1px solid var(--line); background: transparent; color: var(--ink); font-family: inherit; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent;" },
                (d?.src) ? [
                  $h("span", { "style": "width: 42px; height: 42px; border-radius: 12px; overflow: hidden; position: relative; flex-shrink: 0;" },
                    $h("img", { "class": "sw-cover", "src": d?.src, "alt": "", "loading": "lazy", "decoding": "async" })
                  )
                ] : null,
                (d?.nosrc) ? [
                  $h("span", { "style": "width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--ink-faint);" },
                    $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ] : null,
                $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 600;" },
                    $t(d?.name)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                    $t(d?.count)
                  )
                ),
                $h("span", { "aria-hidden": "true", "style": `width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: ${$t(d?.box)}; box-shadow: inset 0 0 0 1.5px ${$t(d?.boxe)}; color: ${$t(d?.ck)};` },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ])
          ),
          ($v.noFolders) ? [
            $h("p", { "style": "margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: var(--ink-muted);" },
              "Pas encore de dossier. Écris un nom ci-dessus pour en créer un."
            )
          ] : null,
          ($v.canCreate) ? [
            $h("button", { "type": "button", "onClick": $v.create, "style": "display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 2px; border: 0; background: transparent; color: var(--accent); font-family: inherit; font-size: 16px; font-weight: 600; cursor: pointer;" },
              $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Créer « ", $t($v.q), " »"
            )
          ] : null,
          ($v.saved) ? [
            $h("span", { "style": "display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 0 0; font-size: 14px; font-weight: 600; color: var(--accent);" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $t($v.savedLabel)
            )
          ] : null,
          $h("div", { "style": "display: flex; justify-content: center; padding-top: 16px;" },
            $h("button", { "class": "sw-btn sw-btn-primary sw-btn-lg", "type": "button", "onClick": $v.save },
              "Terminé",
              $h("span", { "class": "sw-btn-tile" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            )
          )
        )
      )
    ];
  }
}
