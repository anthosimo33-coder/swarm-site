// Généré par scripts/dc2preact.py depuis design/app/VideoA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';
import AjoutDossier from './AjoutDossier.js';
import Palette from './Palette.js';

export default class Video extends DCLogic {

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
    const sb = [["accueil", "Accueil", "/app"], ["apps", "Apps", "/app/apps"], ["formats", "Formats", "/app/formats"], ["createurs", "Créateurs", "/app/createurs"], ["alertes", "Alertes", "/app/alertes"], ["dossiers", "Dossiers", "/app/dossiers"]].map((x) => ({ d: I[x[0]], label: x[1], href: x[2], cur: x[0] === 'apps' ? 'page' : 'false' }));
    return {
      sb, me,
      pal: !!st.pal, openPal: () => { if (!(this.state || {}).pal) this.setState({ pal: true }); }, closePal: () => this.setState({ pal: false }),
      aj: !!st.aj, ajOpen: st.aj ? 'true' : 'false', toggleAj: () => this.setState({ aj: !(this.state || {}).aj }), closeAj: () => this.setState({ aj: false })
    };
  }
  extraVals(b) {
    const st = this.state || {};
return {};
  }

  baseVals() {
    const st = this.state || {};
    const kept = !!st.kept;
    const copied = !!st.copied;
    const facts = [
      ['Texte à l’écran', '« POV: tienes EXAMEN ORAL y no has estudiado NADA », puis « la aplicación que uso es Astra Ai »'],
      ['Ce qui est dit', 'Un oral en visio. Elle fait répéter la question, « que se ha cortado », puis répond sans faute sur la glycolyse.'],
      ['Son', 'original sound - learnwithjoel1'],
      ['Légende', '« OTRO EXAMEN APROBADO, así de fácil » #studyhacks #buenasnotas #examenes'],
      ['Réactions', '52,6 k j’aime · 3,2 k enregistrements · 846 partages · 325 commentaires']
    ].map((f) => ({ k: f[0], v: f[1] }));
    const next = [['t-navy', '2 333×', 'TKA SD kelas 6 persiapannya bisa dimulai disini', 'Astra AI', '2,0 M'], ['t-pine', '1 226×', 'Mình sẽ xoá vid này trong 24h nữa', 'Astra AI', '809 k'], ['t-violet', '455×', 'Bí mật giúp bạn học giỏi hơn đứa mình ghét', 'Astra AI', '1,2 M'], ['t-plum', '100×', 'Imagine being in a relationship where you stop telling your partner…', 'RecentFollow', '1,2 M']]
      .map((n, i) => ({ t: n[0], x: n[1], hook: n[2], app: n[3], v: n[4], src: ["/media/app/v-7705368869250075925.jpg", "/media/app/v-7706010190566542612.jpg", "/media/app/v-7706101547570171143.jpg", "/media/app/v-7705376808862076182.jpg"][i] }));
    return {
      facts, next, kept: kept ? 'true' : 'false',
      keepLabel: kept ? 'Gardée' : 'Garder',
      keepEdge: kept ? 'var(--accent-edge)' : 'var(--line)', keepBg: kept ? 'var(--accent-soft)' : 'var(--track)', keepInk: kept ? 'var(--accent)' : 'var(--ink-muted)', keepFill: kept ? 'currentColor' : 'none',
      toggleKeep: () => this.setState({ kept: !kept }),
      copyLabel: copied ? 'Format copié' : 'Copier le format',
      toast: copied,
      copy: () => { this.setState({ copied: true }); clearTimeout(this.tm); this.tm = setTimeout(() => this.setState({ copied: false }), 2600); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "position: relative; min-height: 1060px; background: var(--ground); color: var(--ink); font-family: var(--font-body);" },
        $h("div", { "aria-hidden": "true", "style": "position: absolute; left: -10%; top: -20%; width: 900px; height: 700px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.20), transparent);" }),
        $h("section", { "role": "dialog", "aria-labelledby": "va-t", "style": "position: absolute; inset: 20px; display: flex; flex-direction: column; border-radius: 28px; background: var(--surface-raised); border: 1px solid var(--line); box-shadow: var(--shadow-float); overflow: hidden;" },
          $h("header", { "style": "display: flex; align-items: center; gap: 20px; padding: 18px 24px; border-bottom: 1px solid var(--line);" },
            $h("h1", { "id": "va-t", "style": "margin: 0; font-size: 17px; font-weight: 700; white-space: nowrap;" },
              "Regarder une par une"
            ),
            $h("span", { "style": "font-family: var(--font-mono); font-size: 13px; color: var(--ink-faint); white-space: nowrap;" },
              "1 sur 14"
            ),
            $h("span", { "aria-hidden": "true", "style": "flex: 1; height: 4px; border-radius: 2px; background: var(--track); overflow: hidden;" },
              $h("span", { "style": "display: block; width: 7%; height: 4px; background: var(--accent); border-radius: 2px;" })
            ),
            $h("span", { "style": "display: flex; gap: 6px;" },
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Vidéo précédente", "style": "width: 40px; height: 40px; background: var(--track);" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M19 12H5M11 18l-6-6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Vidéo suivante", "style": "width: 40px; height: 40px; background: var(--tab-on); color: var(--ink);" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Fermer", "style": "width: 40px; height: 40px;" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                )
              )
            )
          ),
          $h("div", { "style": "flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 360px minmax(0, 1fr) 300px; gap: 28px; padding: 24px;" },
            $h("div", { "style": "display: flex; flex-direction: column; gap: 12px;" },
              $h("div", { "class": "sw-video t-umber", "style": "border-radius: 22px; box-shadow: 0 30px 60px rgba(0,0,0,0.5);" },
                $h("img", { "class": "sw-cover", "src": "/media/app/v-7705929733220994337.jpg", "alt": "POV: tienes EXAMEN ORAL y no has estudiado NADA" }),
                $h("span", { "class": "sw-video-shade" }),
                $h("span", { "style": "position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%); width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.4); display: inline-flex; align-items: center; justify-content: center;" },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 12 12", "aria-hidden": "true" },
                    $h("path", { "d": "M4 2.5v7l5.5-3.5z", "fill": "#FFFFFF" })
                  )
                ),
                $h("div", { "style": "position: absolute; left: 14px; right: 14px; bottom: 14px; display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 11px; color: #E4E7EC;" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 12 12", "aria-hidden": "true" },
                    $h("path", { "d": "M4 2.5v7l5.5-3.5z", "fill": "#FFFFFF" })
                  ),
                  $h("span", { "style": "flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.25); overflow: hidden;" },
                    $h("span", { "class": "sw-video-bar", "style": "position: static; display: block; height: 3px; animation-duration: 49s;" })
                  ),
                  $h("span", null,
                    "0:49"
                  )
                )
              ),
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "data-cmdk": "true", "onClick": $v.openPal, "aria-label": "Chercher, raccourci Commande K" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("a", { "class": "sw-link", "href": "https://www.tiktok.com/@learnwithjoel1/video/7705929733220994337", "target": "_blank", "rel": "noopener", "style": "display: inline-flex; align-items: center; gap: 8px; font-size: 14px;" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Ouvrir la vidéo"
              )
            ),
            $h("div", { "style": "min-width: 0; display: flex; flex-direction: column; gap: 18px; overflow: hidden;" },
              $h("div", { "style": "display: flex; gap: 6px; flex-wrap: wrap;" },
                $h("a", { "class": "sw-badge", "href": "/app/apps/astra-ai", "style": "text-decoration: none; color: var(--ink);" },
                  "Astra AI"
                ),
                $h("span", { "class": "sw-badge" },
                  "Espagne"
                ),
                $h("span", { "class": "sw-badge" },
                  "Publiée le 08/11"
                ),
                $h("span", { "class": "sw-badge" },
                  "0:49"
                )
              ),
              $h("span", { "style": "font-size: 15px; color: var(--ink-muted);" },
                $h("span", { "style": "color: var(--ink); font-weight: 700;" },
                  "@learnwithjoel1"
                ),
                " · 12,2 k abonnés · fait d'habitude 28,5 k vues"
              ),
              $h("div", { "class": "sw-card", "style": "padding: 22px; display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 24px;" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                    "Pourquoi elle sort du lot"
                  ),
                  $h("span", { "style": "align-self: flex-start; padding: 6px 14px; border-radius: 14px; background: linear-gradient(180deg, var(--blue-400), var(--blue-600)); font-family: var(--font-display); font-size: 40px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; box-shadow: var(--glow-rest);" },
                    "65×"
                  ),
                  $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                    "sa normale"
                  ),
                  $h("span", { "style": "margin-top: 10px; font-family: var(--font-display); font-size: 30px; font-weight: 700; letter-spacing: -0.03em;" },
                    "1,87 M vues"
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint);" },
                    "en 92 heures · 154× ses abonnés"
                  )
                ),
                $h("div", { "style": "display: flex; flex-direction: column; gap: 8px;" },
                  $h("svg", { "viewBox": "0 0 440 180", "width": "100%", "height": "180", "role": "img", "aria-label": "Vues : 1,36 M à H+52, 1,53 M à H+67, 1,87 M à H+92" },
                    $h("line", { "x1": "40", "y1": "150", "x2": "440", "y2": "150", "stroke": "rgba(255,255,255,0.14)" }),
                    $h("line", { "x1": "40", "y1": "80", "x2": "440", "y2": "80", "stroke": "rgba(255,255,255,0.06)" }),
                    $h("line", { "x1": "40", "y1": "10", "x2": "440", "y2": "10", "stroke": "rgba(255,255,255,0.06)" }),
                    $h("text", { "x": "0", "y": "154", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                      "0"
                    ),
                    $h("text", { "x": "0", "y": "84", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                      "1 M"
                    ),
                    $h("text", { "x": "0", "y": "14", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                      "2 M"
                    ),
                    $h("path", { "d": "M40 150 L266 54.9 L331 42.7 L440 19.1", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "600", "style": "animation: sw-draw 6s ease-in-out infinite;" }),
                    $h("circle", { "cx": "266", "cy": "54.9", "r": "4.5", "fill": "#0D111A", "stroke": "#4C9AFF", "stroke-width": "2" }),
                    $h("circle", { "cx": "331", "cy": "42.7", "r": "4.5", "fill": "#0D111A", "stroke": "#4C9AFF", "stroke-width": "2" }),
                    $h("circle", { "cx": "440", "cy": "19.1", "r": "5.5", "fill": "#4C9AFF" }),
                    $h("text", { "x": "266", "y": "174", "text-anchor": "middle", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                      "H+52"
                    ),
                    $h("text", { "x": "331", "y": "174", "text-anchor": "middle", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                      "H+67"
                    ),
                    $h("text", { "x": "436", "y": "174", "text-anchor": "end", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                      "H+92"
                    )
                  ),
                  $h("span", { "style": "font-size: 14px; font-weight: 600;" },
                    "+38 % entre H+52 et H+92"
                  ),
                  $h("span", { "style": "display: flex; justify-content: space-between; align-items: baseline; padding-top: 10px; border-top: 1px solid var(--line);" },
                    $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                      "Revenus estimés de la vidéo"
                    ),
                    $h("span", { "style": "font-family: var(--font-display); font-size: 20px; font-weight: 700; white-space: nowrap;" },
                      $h("span", { "style": "font-size: 13px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                        "Entre "
                      ),
                      "4,7",
                      $h("span", { "style": "font-size: 13px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                        " et "
                      ),
                      "6,5 k€"
                    )
                  )
                )
              ),
              $h("div", { "style": "display: flex; flex-direction: column;" },
                $h("span", { "style": "font-size: 15px; font-weight: 700; padding-bottom: 6px;" },
                  "Ce qu'elle fait"
                ),
                ($l($v.facts)).map((f) => [
                  $h("div", { "style": "display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 16px; padding: 12px 0; border-top: 1px solid var(--line); font-size: 14px;" },
                    $h("span", { "style": "color: var(--ink-faint);" },
                      $t(f?.k)
                    ),
                    $h("span", { "style": "color: var(--ink-soft); line-height: 1.5;" },
                      $t(f?.v)
                    )
                  )
                ])
              )
            ),
            $h("aside", { "aria-label": "Ensuite", "style": "display: flex; flex-direction: column; gap: 10px; min-width: 0;" },
              $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint);" },
                "Ensuite"
              ),
              ($l($v.next)).map((n) => [
                $h("a", { "href": "/app/videos/learnwithjoel1", "style": "display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 12px; padding: 10px; border-radius: 16px; border: 1px solid var(--line); background: var(--row-hover); text-decoration: none; color: var(--ink);" },
                  $h("span", { "class": `sw-video ${$t(n?.t)}`, "style": "display: block; width: 58px; border-radius: 10px;" },
                    $h("img", { "class": "sw-cover", "src": n?.src, "alt": "" })
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 6px; min-width: 0;" },
                    $h("span", { "class": "sw-badge sw-badge-solid", "style": "align-self: flex-start; height: 22px; font-size: 11px;" },
                      $t(n?.x)
                    ),
                    $h("span", { "style": "font-size: 13px; font-weight: 600; line-height: 1.35; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" },
                      $t(n?.hook)
                    ),
                    $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                      $t(n?.app), " · ", $t(n?.v)
                    )
                  )
                )
              ])
            )
          ),
          $h("footer", { "style": "display: flex; align-items: center; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--line); background: rgba(255,255,255,0.02);" },
            $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px;" },
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Passer cette vidéo", "title": "Passer", "style": "background: var(--track);" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round" })
                )
              ),
              $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                "Passer"
              ),
              $h("span", { "class": "sw-kbd", "style": "height: 22px;" },
                "P"
              )
            ),
            $h("span", { "aria-hidden": "true", "style": "width: 1px; height: 24px; background: var(--line);" }),
            $h("span", { "style": "display: inline-flex; align-items: center; gap: 8px;" },
              $h("span", { "style": "position: relative; display: inline-flex;" },
                $h("button", { "data-aj-trigger": "true", "onClick": $v.toggleAj, "aria-expanded": $v.ajOpen, "aria-haspopup": "dialog", "class": "sw-btn sw-btn-icon", "type": "button", "aria-pressed": $v.kept, "aria-label": "Garder cette vidéo", "title": "Garder", "style": `background: ${$t($v.keepBg)}; color: ${$t($v.keepInk)};` },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": $v.keepFill, "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                  )
                ),
                ($v.aj) ? [
                  $h("span", { "style": "position: absolute; bottom: calc(100% + 10px); left: 0; z-index: 45;" },
                    $h(AjoutDossier, { "onClose": $v.closeAj })
                  )
                ] : null
              ),
              $h("span", { "style": `font-size: 13px; color: ${$t($v.keepInk)};` },
                $t($v.keepLabel)
              ),
              $h("span", { "class": "sw-kbd", "style": "height: 22px;" },
                "G"
              )
            ),
            $h("button", { "class": "sw-btn sw-btn-primary", "type": "button", "onClick": $v.copy, "style": "margin-left: 12px;" },
              $t($v.copyLabel),
              $h("span", { "class": "sw-btn-tile" },
                $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("span", { "style": "margin-left: auto;" }),
            $h("a", { "class": "sw-more", "href": "/app/apps/astra-ai", "style": "font-size: 14px;" },
              "Voir l'app Astra AI",
              $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            )
          ),
          ($v.toast) ? [
            $h("div", { "class": "sw-toast", "role": "status", "style": "position: absolute; left: calc(50% - 170px); bottom: 92px;" },
              $h("span", { "class": "sw-toast-ico" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              ),
              $h("span", null,
                $h("span", { "class": "sw-toast-kicker" },
                  "Dans le presse-papiers"
                ),
                $h("span", { "class": "sw-toast-text" },
                  "Hook, structure, son et légende copiés"
                )
              )
            )
          ] : null
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
