// Généré par scripts/dc2preact.py depuis design/app/MFormules.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class MFormules extends DCLogic {
  componentDidMount() {
    this.timer = setInterval(() => this.setState({ now: Date.now() }), 1000);
    this.onKey = (e) => { if (e.key === 'Escape' && this.props && this.props.onClose) this.props.onClose(); };
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.onKey);
      this.overflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.onKey);
      document.body.style.overflow = this.overflow || '';
    }
  }
  renderVals() {
    // La fenêtre des formules, mobile (19/11) : une feuille qui monte du bas (même contenu que FormulesA).
    const p = this.props || {};
    const st = this.state || {};
    const close = () => { if (p.onClose) p.onClose(); };
    const bfLeft = Math.max(0, Date.parse('2026-12-01T00:00:00+01:00') - (st.now || Date.now()));
    const bf2 = (n) => String(n).padStart(2, '0');
    const dd = Math.floor(bfLeft / 864e5), hh = Math.floor(bfLeft / 36e5) % 24, mm = Math.floor(bfLeft / 6e4) % 60, ss = Math.floor(bfLeft / 1e3) % 60;
    const tiles = [[dd, 'Jours'], [hh, 'Heures'], [mm, 'Min'], [ss, 'Sec']].map((x) => ({ v: bf2(x[0]), l: x[1] }));
    const total = typeof p.total === 'number' ? p.total : 516;
    const checkout = p.checkout || {};
    return {
      bfOn: bfLeft > 0, tiles,
      // Après le 30/11 minuit (audit Q1, décision du 20/11) : l’annuel à 29,99 € / mois, facturé 359,88 € par an, sans réduction.
      annualPrice: bfLeft > 0 ? '14,99 €' : '29,99 €', annualBilled: bfLeft > 0 ? 'Facturé 179,88 € par an' : 'Facturé 359,88 € par an',
      bfAria: dd + ' jours, ' + hh + ' heures, ' + mm + ' minutes',
      titleId: bfLeft > 0 ? 'mfor-titre' : 'mfor-sous-titre',
      annualCta: bfLeft > 0 ? 'J’en profite' : 'Choisir l’annuel',
      annual: checkout.annuel || '/tarifs', monthly: checkout.mensuel || '/tarifs',
      inc: ['Les ' + String(total).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + ' apps', 'Formats', 'Créateurs', 'Tous les marchés', 'Alertes'],
      close,
      bg: (e) => { if (e && e.target === e.currentTarget) close(); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw mfor-bg", "onClick": $v.bg, "style": "position: fixed; inset: 0; z-index: 80; background: rgba(3,4,8,0.62); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; flex-direction: column; justify-content: flex-end; font-family: var(--font-body); color: var(--ink); animation: m-for-mforFade .2s ease both;" },
        $h("div", { "class": "mfor-sheet", "role": "dialog", "aria-modal": "true", "aria-labelledby": $v.titleId, "style": "position: relative; max-height: calc(100% - 24px); overflow-y: auto; box-sizing: border-box; padding: 8px 12px max(20px, env(safe-area-inset-bottom)); border-radius: 28px 28px 0 0; background: #0B0E15; box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 -20px 60px rgba(0,0,0,0.5); display: flex; flex-direction: column; gap: 16px; animation: m-for-mforUp .32s cubic-bezier(.2,.8,.2,1) both;" },
          $h("span", { "aria-hidden": "true", "style": "align-self: center; flex-shrink: 0; width: 40px; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.22);" }),
          $h("button", { "class": "mfor-x", "type": "button", "onClick": $v.close, "aria-label": "Fermer", "style": "position: absolute; top: 24px; right: 22px; z-index: 2; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.85); background: rgba(0,0,0,0.28);" },
            $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round" })
            )
          ),
          ($v.bfOn) ? [
            $h("div", { "style": "position: relative; display: flex; flex-direction: column; gap: 18px; padding: 24px 20px 20px; border-radius: 20px; overflow: hidden; background: radial-gradient(80% 70% at 85% 100%, rgba(255,184,98,0.95), rgba(255,122,40,0.8) 30%, rgba(196,66,10,0.35) 62%, rgba(0,0,0,0) 85%), radial-gradient(60% 50% at 70% 0%, rgba(255,120,40,0.22), rgba(0,0,0,0) 70%), linear-gradient(160deg, #120502 0%, #260B03 40%, #521B05 72%, #8E330A 100%);" },
              $h("div", { "style": "display: flex; flex-direction: column; align-items: flex-start; gap: 12px;" },
                $h("h2", { "id": "mfor-titre", "style": "margin: 0; font-family: var(--font-display); font-size: clamp(34px, 11vw, 42px); font-weight: 800; line-height: 0.92; letter-spacing: -0.05em; color: #FFFFFF; white-space: nowrap;" },
                  "BLACK FRIDAY"
                ),
                $h("span", { "style": "display: inline-flex; padding: 7px 12px 6px; transform: rotate(-2deg); transform-origin: left center; background: #FF6A1F; color: #170602; font-family: var(--font-display); font-size: clamp(13px, 3.9vw, 15px); font-weight: 800; letter-spacing: -0.01em; line-height: 1; white-space: nowrap; box-shadow: 0 8px 22px rgba(255,106,31,0.35);" },
                  "JUSQU’À −50 % SUR KOPYCAT PRO"
                ),
                $h("span", { "style": "font-size: 13px; color: rgba(255,255,255,0.82);" },
                  "Fin le 30 novembre à minuit"
                )
              ),
              $h("div", { "role": "timer", "aria-label": `Fin dans ${$t($v.bfAria)}`, "style": "display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px;" },
                ($l($v.tiles)).map((t) => [
                  $h("span", { "style": "display: flex; flex-direction: column; align-items: center; gap: 6px;" },
                    $h("span", { "style": "width: 100%; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background-color: #07090D; background-image: radial-gradient(rgba(255,255,255,0.07) 1px, rgba(0,0,0,0) 1.4px); background-size: 4px 4px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08); font-family: 'Doto', var(--font-mono); font-size: 30px; font-weight: 800; color: #FFFFFF; text-shadow: 0 0 10px rgba(255,255,255,0.3); font-variant-numeric: tabular-nums;" },
                      $t(t?.v)
                    ),
                    $h("span", { "style": "font-size: 11px; color: rgba(255,255,255,0.78);" },
                      $t(t?.l)
                    )
                  )
                ])
              )
            )
          ] : null,
          $h("div", { "style": "display: flex; flex-direction: column; gap: 12px; padding: 0 4px;" },
            $h("span", { "style": "display: flex; flex-direction: column; gap: 2px; padding-right: 44px;" },
              $h("span", { "id": "mfor-sous-titre", "style": "font-size: 17px; font-weight: 700;" },
                "Choisis ta formule"
              ),
              $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                "Un seul plan, tout Kopycat."
              )
            ),
            $h("div", { "style": "display: flex; flex-direction: column; gap: 14px; padding: 18px; border-radius: 20px; background: linear-gradient(180deg, rgba(255,106,31,0.14), rgba(255,106,31,0.03) 75%); box-shadow: inset 0 0 0 1px rgba(255,138,76,0.5);" },
              $h("div", { "style": "display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;" },
                $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                  $h("span", { "style": "font-size: 16px; font-weight: 700;" },
                    "Annuel"
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                    $t($v.annualBilled)
                  )
                ),
                ($v.bfOn) ? [
                  $h("span", { "style": "height: 26px; padding: 0 10px; border-radius: 999px; display: inline-flex; align-items: center; background: #FF6A1F; color: #FFFFFF; font-size: 12px; font-weight: 700;" },
                    "−50 %"
                  )
                ] : null
              ),
              $h("div", { "style": "display: flex; align-items: baseline; gap: 8px;" },
                ($v.bfOn) ? [
                  $h("span", { "style": "font-size: 15px; color: var(--ink-faint); text-decoration: line-through; font-variant-numeric: tabular-nums;" },
                    "29,99 €"
                  )
                ] : null,
                $h("span", { "style": "font-family: var(--font-display); font-size: 38px; font-weight: 700; letter-spacing: -0.045em; line-height: 1; font-variant-numeric: tabular-nums;" },
                  $t($v.annualPrice)
                ),
                $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                  "/ mois"
                )
              ),
              $h("a", { "href": $v.annual, "style": "display: flex; align-items: center; justify-content: center; gap: 8px; height: 52px; border-radius: 14px; background: linear-gradient(180deg, #FF9A4D, #FF641A); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 28px rgba(255,106,31,0.3); color: #FFFFFF; font-size: 16px; font-weight: 700; text-decoration: none; -webkit-tap-highlight-color: transparent;" },
                $t($v.annualCta),
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M7 17L17 7M9 7h8v8", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 14px 14px 18px; border-radius: 20px; background: linear-gradient(180deg, var(--card-top), var(--card-bottom)); box-shadow: inset 0 0 0 1px var(--card-edge);" },
              $h("span", { "style": "display: flex; flex-direction: column; gap: 2px; min-width: 0;" },
                $h("span", { "style": "font-size: 16px; font-weight: 700;" },
                  "Mensuel"
                ),
                $h("span", { "style": "font-size: 13px; color: var(--ink-muted); white-space: nowrap;" },
                  $h("span", { "style": "color: #FFFFFF; font-weight: 600;" },
                    "29,99 €"
                  ),
                  " / mois"
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                  "Sans engagement"
                )
              ),
              $h("a", { "href": $v.monthly, "style": "flex-shrink: 0; display: flex; align-items: center; gap: 6px; height: 44px; padding: 0 14px; border-radius: 12px; background: #F4F5F7; color: #0B0E14; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap; -webkit-tap-highlight-color: transparent;" },
                "Tout débloquer",
                $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M7 17L17 7M9 7h8v8", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("div", { "style": "display: flex; flex-wrap: wrap; gap: 8px 14px; padding-top: 4px; font-size: 13px; color: var(--ink-soft);" },
              ($l($v.inc)).map((i) => [
                $h("span", { "style": "display: inline-flex; align-items: center; gap: 6px;" },
                  $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent); flex-shrink: 0;" },
                    $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $t(i)
                )
              ])
            )
          )
        )
      )
    ];
  }
}
