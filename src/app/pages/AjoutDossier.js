// Généré par scripts/dc2preact.py depuis design/app/AjoutDossier.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class AjoutDossier extends DCLogic {
  componentDidMount() {
    if (this.inp) this.inp.focus();
    this.out = (e) => {
      if (!this.root || this.root.contains(e.target)) return;
      if (e.target.closest && e.target.closest('[data-aj-trigger]')) return;
      this.close();
    };
    document.addEventListener('mousedown', this.out);
  }
  componentWillUnmount() { document.removeEventListener('mousedown', this.out); clearTimeout(this.tm); }
  close() { if (this.props.onClose) this.props.onClose(); }
  renderVals() {
    const FL = [{"name": "Études, ce qui marche", "n": 7, "src": "/media/app/v-7705368869250075925.jpg"}, {"name": "Side hustle", "n": 5, "src": "/media/app/v-7700172397613288736.jpg"}, {"name": "Jalousie et ex", "n": 5, "src": "/media/app/v-7705376808862076182.jpg"}, {"name": "Couple", "n": 4, "src": "/media/app/v-7705441234847862037.jpg"}];
    const st = this.state || {};
    const q = st.q || '';
    const on = st.on || {};
    const extra = st.extra || [];
    const all = extra.map((n) => ({ name: n, n: 0, src: '' })).concat(FL);
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nq = norm(q.trim());
    const rows = all.filter((f) => !nq || norm(f.name).indexOf(nq) >= 0).map((f) => {
      const c = !!on[f.name];
      return { name: f.name, src: f.src, nosrc: !f.src, count: (f.n + (c ? 1 : 0)) + ' éléments', on: c ? 'true' : 'false',
        box: c ? 'var(--blue-600)' : 'transparent', boxe: c ? 'var(--blue-600)' : 'var(--line-strong)', ck: c ? '#FFFFFF' : 'transparent',
        toggle: () => this.setState({ on: Object.assign({}, on, { [f.name]: !c }), saved: false }) };
    });
    const exact = all.some((f) => norm(f.name) === nq);
    const n = Object.keys(on).filter((k) => on[k]).length;
    return {
      q, rows,
      canCreate: !!nq && !exact, noCreate: !nq && !st.saved,
      onQ: (e) => this.setState({ q: e.target.value }),
      create: () => { const name = q.trim(); this.setState({ extra: [name].concat(extra), on: Object.assign({}, on, { [name]: true }), q: '' }); },
      setInput: (el) => { this.inp = el; },
      setRoot: (el) => { this.root = el; },
      keys: (e) => { if (e.key === 'Escape') { e.preventDefault(); this.close(); } },
      saved: !!st.saved, savedLabel: n === 0 ? 'Aucun dossier coché' : ('Enregistré dans ' + n + (n > 1 ? ' dossiers' : ' dossier')),
      save: () => { this.setState({ saved: true }); clearTimeout(this.tm); if (n > 0) this.tm = setTimeout(() => this.close(), 900); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "ref": $v.setRoot, "onKeyDown": $v.keys, "role": "dialog", "aria-label": "Ajouter à un dossier", "style": "width: 360px; box-sizing: border-box; border-radius: 22px; background: var(--surface-raised); border: 1px solid var(--line-strong); box-shadow: 0 30px 80px rgba(0,0,0,0.6); padding: 14px; display: flex; flex-direction: column; gap: 10px; color: var(--ink); font-family: var(--font-body); animation: sw-rise 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;" },
        $h("div", { "class": "sw-search", "style": "height: 42px; padding: 0 12px; box-shadow: none; border-radius: 12px;" },
          $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
            $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
          ),
          $h("input", { "ref": $v.setInput, "class": "sw-search-input", "type": "search", "value": $v.q, "onInput": $v.onQ, "aria-label": "Chercher ou créer un dossier", "placeholder": "Chercher ou créer un dossier…", "autocomplete": "off", "style": "font-size: 14px;" })
        ),
        $h("div", { "role": "group", "aria-label": "Dossiers", "style": "display: flex; flex-direction: column; max-height: 260px; overflow-y: auto;" },
          ($l($v.rows)).map((d) => [
            $h("button", { "type": "button", "role": "checkbox", "aria-checked": d?.on, "onClick": d?.toggle, "style": "display: flex; align-items: center; gap: 12px; padding: 8px; border: 0; border-radius: 12px; background: transparent; color: var(--ink); font-family: inherit; text-align: left; cursor: pointer;" },
              $h("span", { "aria-hidden": "true", "style": `width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: ${$t(d?.box)}; box-shadow: inset 0 0 0 1.5px ${$t(d?.boxe)}; color: ${$t(d?.ck)};` },
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              (d?.src) ? [
                $h("span", { "style": "width: 32px; height: 32px; border-radius: 9px; overflow: hidden; position: relative; flex-shrink: 0;" },
                  $h("img", { "class": "sw-cover", "src": d?.src, "alt": "" })
                )
              ] : null,
              (d?.nosrc) ? [
                $h("span", { "style": "width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--track); color: var(--ink-faint);" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ] : null,
              $h("span", { "style": "flex: 1; font-size: 14px; font-weight: 600;" },
                $t(d?.name)
              ),
              $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                $t(d?.count)
              )
            )
          ])
        ),
        ($v.canCreate) ? [
          $h("button", { "type": "button", "onClick": $v.create, "class": "sw-more", "style": "padding: 6px 8px; gap: 10px; color: var(--accent); border: 0; background: transparent; cursor: pointer; font-family: inherit;" },
            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M12 5v14M5 12h14", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Créer « ", $t($v.q), " »"
          )
        ] : null,
        ($v.noCreate) ? [
          $h("span", { "style": "padding: 2px 8px; font-size: 12px; color: var(--ink-faint);" },
            "Tape un nom pour créer un dossier."
          )
        ] : null,
        ($v.saved) ? [
          $h("span", { "style": "display: flex; align-items: center; gap: 8px; padding: 4px 8px; font-size: 13px; font-weight: 600; color: var(--accent);" },
            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M5 12l5 5 9-10", "fill": "none", "stroke": "currentColor", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            $t($v.savedLabel)
          )
        ] : null,
        $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm sw-btn-block", "type": "button", "onClick": $v.save },
          "Enregistrer",
          $h("span", { "class": "sw-btn-tile" },
            $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          )
        )
      )
    ];
  }
}
