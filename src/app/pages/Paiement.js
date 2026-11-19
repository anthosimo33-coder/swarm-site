// Généré par scripts/dc2preact.py depuis design/app/PaiementA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class Paiement extends DCLogic {
  componentDidMount() {
    this.onKey = (e) => { if (e.key === 'Escape' && !(this.state || {}).busy && this.props && this.props.onClose) this.props.onClose(); };
    if (typeof document !== 'undefined') document.addEventListener('keydown', this.onKey);
  }
  componentWillUnmount() {
    if (typeof document !== 'undefined') document.removeEventListener('keydown', this.onKey);
  }
  renderVals() {
    // Avant Whop (19/11) : la formule, et l’accord exigé par l’article 6 des CGV (accès immédiat, renonciation au délai
    // de rétractation de 14 jours). Sans la case, pas de paiement. onPay(formule) crée le lien Whop et y envoie.
    const p = this.props || {};
    const st = this.state || {};
    const formule = st.formule || (p.formule === 'mensuel' ? 'mensuel' : 'annuel');
    const y = formule === 'annuel';
    const total = typeof p.total === 'number' && p.total > 0 ? p.total : 516;
    const busy = !!st.busy;
    return {
      onM: y ? 'false' : 'true', onY: y ? 'true' : 'false',
      pickM: () => { if (!busy) this.setState({ formule: 'mensuel', err: '' }); },
      pickY: () => { if (!busy) this.setState({ formule: 'annuel', err: '' }); },
      label: y ? 'Annuel' : 'Mensuel', strike: y, price: y ? '14,99 €' : '29,99 €',
      billing: y ? '179,88 € aujourd’hui,\npuis chaque année' : '29,99 € aujourd’hui,\npuis chaque mois',
      totalTxt: String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      agreed: !!st.agreed, onAgree: (e) => this.setState({ agreed: !!(e && e.target && e.target.checked), err: '' }),
      busy, err: st.err || '',
      goOff: !st.agreed || busy,
      goLabel: busy ? 'Ouverture du paiement…' : (y ? 'Payer 179,88 € sur Whop' : 'Payer 29,99 € sur Whop'),
      go: () => {
        if (!st.agreed || busy || !p.onPay) return;
        this.setState({ busy: true, err: '' });
        p.onPay(formule).catch(() => this.setState({ busy: false, err: 'Le paiement n’a pas pu s’ouvrir. Réessaie dans un instant.' }));
      },
      close: () => { if (!busy && p.onClose) p.onClose(); },
      bg: (e) => { if (!busy && e && e.target === e.currentTarget && p.onClose) p.onClose(); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw pay-bg", "onClick": $v.bg, "style": "position: fixed; inset: 0; z-index: 95; background: rgba(3,4,8,0.62); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; font-family: var(--font-body); color: var(--ink);" },
        $h("div", { "class": "pay-box", "role": "dialog", "aria-modal": "true", "aria-labelledby": "pay-titre", "style": "position: relative; width: min(480px, 100%); box-sizing: border-box; padding: 28px; border-radius: 24px; background: #11151E; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.09), 0 40px 120px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 20px;" },
          $h("button", { "class": "pay-x", "type": "button", "onClick": $v.close, "aria-label": "Fermer" },
            $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" })
            )
          ),
          $h("div", { "style": "display: flex; flex-direction: column; gap: 6px; padding-right: 40px;" },
            $h("h2", { "id": "pay-titre", "style": "margin: 0; font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: -0.02em;" },
              "Passer à Kopycat Pro"
            ),
            $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
              "Tout Kopycat : les ", $t($v.totalTxt), " apps, les formats, les créateurs, tous les marchés."
            )
          ),
          $h("div", { "class": "pay-seg", "role": "radiogroup", "aria-label": "Formule" },
            $h("button", { "type": "button", "role": "radio", "aria-checked": $v.onM, "onClick": $v.pickM },
              "Mensuel"
            ),
            $h("button", { "type": "button", "role": "radio", "aria-checked": $v.onY, "onClick": $v.pickY },
              "Annuel",
              $h("span", { "style": "font-size: 11px; font-weight: 700; color: #FF9C57;" },
                "−50 %"
              )
            )
          ),
          $h("div", { "style": "display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding: 18px 20px; border-radius: 16px; background: rgba(255,255,255,0.03); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);" },
            $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
              $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                $t($v.label)
              ),
              $h("span", { "style": "display: flex; align-items: baseline; gap: 8px;" },
                ($v.strike) ? [
                  $h("span", { "style": "font-size: 15px; color: var(--ink-faint); text-decoration: line-through;" },
                    "29,99 €"
                  )
                ] : null,
                $h("span", { "style": "font-family: var(--font-display); font-size: 36px; font-weight: 700; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums;" },
                  $t($v.price)
                ),
                $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                  "/ mois"
                )
              )
            ),
            $h("span", { "style": "font-size: 13px; line-height: 1.45; color: var(--ink-muted); text-align: right; white-space: pre-line;" },
              $t($v.billing)
            )
          ),
          $h("label", { "class": "pay-check" },
            $h("input", { "type": "checkbox", "checked": $v.agreed, "onChange": $v.onAgree }),
            $h("span", null,
              "Je veux accéder à Kopycat Pro tout de suite et je renonce à mon délai de rétractation de 14 jours (",
              $h("a", { "class": "pay-link", "href": "/cgv", "target": "_blank", "rel": "noopener" },
                "article 6 des CGV"
              ),
              ")."
            )
          ),
          $h("div", { "style": "display: flex; flex-direction: column; gap: 10px;" },
            $h("button", { "class": "pay-go", "type": "button", "disabled": $v.goOff, "onClick": $v.go },
              ($v.busy) ? [
                $h("span", { "class": "pay-spin", "aria-hidden": "true" })
              ] : null,
              $t($v.goLabel)
            ),
            ($v.err) ? [
              $h("span", { "role": "alert", "style": "font-size: 13px; color: #FF8A8A; text-align: center;" },
                $t($v.err)
              )
            ] : null,
            $h("span", { "style": "display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: var(--ink-faint);" },
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              "Paiement sécurisé par Whop · résiliable en un clic depuis tes réglages"
            )
          )
        )
      )
    ];
  }
}
