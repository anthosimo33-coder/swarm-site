// Généré par scripts/dc2preact.py depuis design/app/CreerAlerteA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class CreerAlerte extends DCLogic {
  renderVals() {
    const hits = [{"src": "/media/app/v-7706010190566542612.jpg", "h": "@studywith_elsie", "x": "1 226×", "date": "09/11"}, {"src": "/media/app/v-7705929733220994337.jpg", "h": "@learnwithjoel1", "x": "154×", "date": "08/11"}, {"src": "/media/app/v-7705368869250075925.jpg", "h": "@belajarbersamaespi", "x": "2 333×", "date": "07/11"}];
    return { hits };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw sw-ground", "style": "position: relative; overflow: hidden; min-height: 760px; box-sizing: border-box; padding: 48px 56px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
        $h("section", { "style": "max-width: 820px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px;" },
          $h("div", { "style": "display: flex; align-items: center; justify-content: space-between;" },
            $h("span", { "class": "sw-eyebrow", "style": "font-size: 13px;" },
              $h("b", null,
                "["
              ),
              " Nouvelle alerte ",
              $h("b", null,
                "]"
              )
            ),
            $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Fermer" },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          ),
          $h("p", { "style": "margin: 0; font-family: var(--font-display); font-size: 34px; line-height: 1.75; font-weight: 700; letter-spacing: -0.035em; color: var(--ink-soft);" },
            "Préviens-moi quand ",
            $h("button", { "type": "button", "style": "display: inline-flex; align-items: center; gap: 6px; height: 46px; margin: 4px 2px; padding: 0 14px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; vertical-align: middle; cursor: pointer;" },
              "un compte",
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            " de la niche ",
            $h("button", { "type": "button", "style": "display: inline-flex; align-items: center; gap: 6px; height: 46px; margin: 4px 2px; padding: 0 14px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; vertical-align: middle; cursor: pointer;" },
              "Études",
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            " fait ",
            $h("button", { "type": "button", "style": "display: inline-flex; align-items: center; gap: 6px; height: 46px; margin: 4px 2px; padding: 0 14px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; vertical-align: middle; cursor: pointer;" },
              "100×",
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            " sa normale, sur ",
            $h("button", { "type": "button", "style": "display: inline-flex; align-items: center; gap: 6px; height: 46px; margin: 4px 2px; padding: 0 14px 0 16px; border-radius: 14px; border: 1px solid var(--accent-edge); background: var(--accent-soft); color: var(--accent); font-family: var(--font-display); font-size: 26px; font-weight: 700; letter-spacing: -0.02em; vertical-align: middle; cursor: pointer;" },
              "tous les marchés",
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            "."
          ),
          $h("p", { "style": "margin: -8px 0 0; font-size: 17px; color: var(--ink-muted);" },
            "Par ",
            $h("button", { "type": "button", "style": "display: inline-flex; align-items: center; gap: 6px; height: 34px; margin: 0 2px; padding: 0 10px 0 12px; border-radius: 10px; border: 1px solid var(--line-strong); background: var(--track); color: var(--ink); font-family: var(--font-body); font-size: 15px; font-weight: 600; vertical-align: middle; cursor: pointer;" },
              "e-mail",
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            " et ",
            $h("button", { "type": "button", "style": "display: inline-flex; align-items: center; gap: 6px; height: 34px; margin: 0 2px; padding: 0 10px 0 12px; border-radius: 10px; border: 1px solid var(--line-strong); background: var(--track); color: var(--ink); font-family: var(--font-body); font-size: 15px; font-weight: 600; vertical-align: middle; cursor: pointer;" },
              "notification",
              $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M6 9l6 6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            ", au plus une fois par jour."
          ),
          $h("div", { "style": "border-radius: 22px; border: 1px solid var(--line); background: var(--surface-raised); padding: 18px 20px; display: flex; align-items: center; gap: 20px;" },
            $h("span", { "style": "flex: 1; display: flex; flex-direction: column; gap: 4px;" },
              $h("span", { "style": "font-size: 14px; font-weight: 700;" },
                "Ce qu’elle t’aurait signalé cette semaine"
              ),
              $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                "Trois vidéos d’Astra AI, entre le 07 et le 09/11"
              )
            ),
            ($l($v.hits)).map((h) => [
              $h("span", { "class": "sw-video", "style": "display: block; width: 58px; border-radius: 10px;" },
                $h("img", { "class": "sw-cover", "src": h?.src, "alt": "" }),
                $h("span", { "class": "sw-video-shade" }),
                $h("span", { "style": "position: absolute; left: 5px; right: 5px; bottom: 5px; font-size: 10px; font-weight: 800; color: #FFFFFF; text-align: center;" },
                  $t(h?.x)
                )
              )
            ])
          ),
          $h("div", { "style": "display: flex; justify-content: flex-end;" },
            $h("a", { "class": "sw-btn sw-btn-primary sw-btn-lg", "href": "/app/alertes" },
              "Créer l’alerte",
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
