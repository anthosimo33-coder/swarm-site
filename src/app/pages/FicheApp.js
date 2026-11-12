// Généré par scripts/dc2preact.py depuis design/app/FicheA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class FicheApp extends DCLogic {
  renderVals() {
    const ic = {
      accueil: 'M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      formats: 'M4 5h16v14H4zM10 9l5 3-5 3z',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      alertes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0',
      dossiers: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      radar: 'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6',
      pub: 'M4 10v4h3l5 4V6L7 10zM16 9a4 4 0 0 1 0 6',
      son: 'M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
      texte: 'M5 6h14M12 6v12M8 18h8'
    };
    const nav = [['accueil', 'Accueil'], ['apps', 'Apps'], ['formats', 'Formats'], ['createurs', 'Créateurs'], ['alertes', 'Alertes'], ['dossiers', 'Dossiers']]
      .map((x, i) => ({ d: ic[x[0]], label: x[1], cur: i === 1 ? 'page' : 'false' }));
    const sections = [['radar', 'Vue d’ensemble', ''], ['formats', 'Vidéos', '2 542'], ['texte', 'Formats', '5'], ['createurs', 'Créateurs', '269'], ['pub', 'Pubs', '0']]
      .map((s, i) => ({ d: ic[s[0]], label: s[1], n: s[2], cur: i === 0 ? 'page' : 'false', bg: i === 0 ? 'var(--tab-on)' : 'transparent', ink: i === 0 ? 'var(--ink)' : 'var(--ink-muted)', w: i === 0 ? 600 : 500 }));
    const W = [10.6, 9.8, 8.9, 8.5, 17.3, 18.4];
    const L = ['1 oct.', '8 oct.', '15 oct.', '22 oct.', '29 oct.', '5 nov.'];
    const P = W.map((v, j) => [70 + j * 110, 200 - v / 20 * 180]);
    const line = 'M' + P.map((p) => p[0] + ' ' + p[1].toFixed(1)).join(' L');
    const chart = {
      line, area: line + ' L620 200 L70 200 Z',
      pts: P.map((p, j) => ({ x: p[0], y: p[1].toFixed(1), ty: (p[1] - 14).toFixed(1), v: W[j].toFixed(1).replace('.', ',') + ' M', label: 'sem. du ' + L[j], r: j === 5 ? 6 : 4, fill: j === 5 ? '#4C9AFF' : '#0D111A', ink: j === 5 ? '#FFFFFF' : '#9AA3B2', fw: j === 5 ? 700 : 500 }))
    };
    const vids = [
      ['t-navy', 'Who made this?', '2,6 M', '@ivylearns8', 'US', 'il y a 19 j'],
      ['t-plum', 'KISI KISI SOAL TKA UNTUK SMA', '2,6 M', '@ira.belajaryuk', 'ID', 'il y a 26 j'],
      ['t-pine', 'TKA SMP mapel apa saja', '2,3 M', '@studywithruney', 'ID', 'il y a 12 j'],
      ['t-violet', 'TKA SD kelas 6 persiapannya bisa dimulai disini', '2,0 M', '@belajarbersamaespi', 'ID', 'il y a 5 j'],
      ['t-amber', 'Rahasia para guru akhirnya bocor!', '1,9 M', '@belajarbarengjames', 'ID', 'il y a 30 j'],
      ['t-umber', 'POV: tienes EXAMEN ORAL y no has estudiado NADA', '1,9 M', '@learnwithjoel1', 'ES', 'il y a 4 j']
    ].map((v, i) => ({ t: v[0], hook: v[1], v: v[2], h: v[3], mk: v[4], age: v[5], src: ["/media/app/v-7700392351268752661.jpg", "/media/app/v-7697654738124442896.jpg", "/media/app/v-7702743575934684437.jpg", "/media/app/v-7705368869250075925.jpg", "/media/app/v-7696248791560703252.jpg", "/media/app/v-7705929733220994337.jpg"][i] }));
    const formats = [
      [ic.texte, '« Je supprime cette vidéo dans 24 h »', 'La même idée en vietnamien chez Astra AI et en allemand chez Retain Cards', '1 226×', '809 k vues'],
      [ic.texte, '« TRATA ESTE VÍDEO COMO QUERES QUE SEJAM AS TUAS NOTAS »', 'Portugais · 4 comptes', '11× en médiane', '2 reprises sur 4'],
      [ic.texte, '« GUARDA E PARTILHA »', 'Portugais · 3 comptes', '17× en médiane', '3 reprises sur 4'],
      [ic.son, 'Son « exam vibes »', '5 comptes · le son de la révision qui stresse', '7× en médiane', '4 reprises sur 6']
    ].map((f) => ({ icon: f[0], t: f[1], meta: f[2], x: f[3], ok: f[4] }));
    const mk = [['ID', 'Indonésie et Vietnam', 37.47], ['US', 'États-Unis', 10.73], ['ES', 'Espagne', 4.83], ['BR', 'Brésil et Portugal', 2.91], ['FR', 'France', 1.32], ['MX', 'Amérique latine', 0.39]]
      .map((m, i) => ({ c: m[0], l: m[1], v: m[2].toFixed(1).replace('.', ',') + ' M', p: Math.round(m[2] / 57.65 * 100) + ' %', w: (m[2] / 57.65 * 100).toFixed(1) + '%', bg: i === 0 ? 'var(--accent)' : 'var(--line-strong)' }));
    const creators = [
      ['I', '@ivylearns8', 'Student life + study tips', 'US', '3,1 k', '4,9 M', '17,9 k', 'var(--thumb-navy)'],
      ['I', '@ira.belajaryuk', 'belajar bareng yuk', 'ID', '4,2 k', '3,3 M', '550', 'var(--thumb-plum)'],
      ['L', '@learnwithjoel1', 'IG: joel.c.b', 'ES', '12,2 k', '3,2 M', '28,5 k', 'var(--thumb-umber)'],
      ['S', '@studywithruney', 'Study tips buat dapetin nilai tinggi', 'ID', '2,4 k', '2,7 M', '418', 'var(--thumb-pine)'],
      ['S', '@studyclubbyinda', 'Studytok Yapping Club', 'ID', '26,4 k', '2,3 M', '4,6 k', 'var(--thumb-violet)'],
      ['B', '@belajarbersamaespi', 'student tips, productivity, & tech', 'ID', '6,5 k', '2,0 M', '855', 'var(--thumb-amber)']
    ].map((c) => { const av = {"@belajarbersamaespi": "/media/app/av-belajarbersamaespi.jpg", "@ira.belajaryuk": "/media/app/av-ira.belajaryuk.jpg", "@learnwithjoel1": "/media/app/av-learnwithjoel1.jpg", "@studyclubbyinda": "/media/app/av-studyclubbyinda.jpg", "@studywithruney": "/media/app/av-studywithruney.jpg"}[c[1]] || false; return { ini: c[0], h: c[1], bio: c[2], mk: c[3], fans: c[4], v: c[5], med: c[6], bg: c[7], av, noav: !av }; });
    return { nav, sections, chart, vids, formats, mk, creators };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw", "style": "display: flex; flex-wrap: wrap; min-height: 1960px; background: var(--surface); color: var(--ink); font-family: var(--font-body);" },
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
          ($l($v.nav)).map((n) => [
            $h("a", { "class": "sw-side-item", "href": "#", "aria-current": n?.cur },
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
            $h("a", { "class": "sw-avatar", "href": "#", "aria-label": "Mon compte", "style": "text-decoration: none;" },
              "A"
            )
          )
        ),
        $h("aside", { "aria-label": "Sections de la fiche", "style": "flex: 0 0 248px; box-sizing: border-box; padding: 24px 16px; border-right: 1px solid var(--line); display: flex; flex-direction: column; gap: 6px;" },
          $h("a", { "class": "sw-more", "href": "/app/apps", "style": "padding: 6px 10px 18px; font-size: 14px;" },
            $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M19 12H5M11 18l-6-6 6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            ),
            "Apps"
          ),
          ($l($v.sections)).map((s) => [
            $h("a", { "href": "#", "aria-current": s?.cur, "style": `display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 12px; border-radius: 12px; background: ${$t(s?.bg)}; color: ${$t(s?.ink)}; text-decoration: none; font-size: 14px; font-weight: ${$t(s?.w)};` },
              $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": s?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("span", { "style": "flex: 1;" },
                $t(s?.label)
              ),
              $h("span", { "style": "font-size: 12px; color: var(--ink-faint); font-variant-numeric: tabular-nums;" },
                $t(s?.n)
              )
            )
          ]),
          $h("div", { "style": "margin-top: 22px; padding: 16px 12px 0; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 10px;" },
            $h("span", { "style": "font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint);" },
              "Dans tes dossiers"
            ),
            $h("span", { "style": "font-size: 13px; line-height: 1.5; color: var(--ink-muted);" },
              "Pas encore gardée. Garde-la pour la retrouver avec tes notes."
            )
          )
        ),
        $h("main", { "style": "flex: 999 1 560px; min-width: 0; padding: 28px 32px 48px; display: flex; flex-direction: column; gap: 24px;" },
          $h("header", { "style": "display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap;" },
            $h("div", { "style": "display: flex; gap: 18px; align-items: center;" },
              $h("span", { "class": "sw-app-icon", "style": "width: 72px; height: 72px; border-radius: 20px; box-shadow: 0 14px 30px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08);" },
                $h("img", { "class": "sw-logo-img", "src": "/media/app/app-astra-ai.jpg", "alt": "" })
              ),
              $h("div", { "style": "display: flex; flex-direction: column; gap: 8px;" },
                $h("div", { "style": "display: flex; align-items: center; gap: 12px; flex-wrap: wrap;" },
                  $h("h1", { "style": "margin: 0; font-family: var(--font-display); font-size: 40px; line-height: 1; font-weight: 700; letter-spacing: -0.04em;" },
                    "Astra AI"
                  ),
                  $h("span", { "class": "sw-badge" },
                    "Études"
                  ),
                  $h("span", { "class": "sw-badge sw-badge-accent" },
                    "+6 % cette semaine"
                  )
                ),
                $h("span", { "style": "display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; color: var(--ink-muted);" },
                  "Aide aux révisions par IA",
                  $h("span", { "aria-hidden": "true" },
                    "·"
                  ),
                  "Suivie depuis le 06/11",
                  $h("span", { "aria-hidden": "true" },
                    "·"
                  ),
                  $h("a", { "class": "sw-link-quiet", "href": "#" },
                    "App Store"
                  ),
                  $h("a", { "class": "sw-link-quiet", "href": "#" },
                    "Google Play"
                  ),
                  $h("a", { "class": "sw-link-quiet", "href": "#" },
                    "Site"
                  )
                )
              )
            ),
            $h("div", { "style": "display: flex; gap: 8px; align-items: center;" },
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Copier le lien de la fiche", "title": "Copier le lien", "style": "background: var(--track);" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" })
                )
              ),
              $h("button", { "class": "sw-btn sw-btn-icon", "type": "button", "aria-label": "Garder dans un dossier", "title": "Garder", "style": "background: var(--track);" },
                $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M7 4h10v16l-5-3.5L7 20z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" })
                )
              ),
              $h("button", { "class": "sw-btn sw-btn-primary sw-btn-sm", "type": "button" },
                "Suivre Astra AI",
                $h("span", { "class": "sw-btn-tile" },
                  $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            )
          ),
          $h("div", { "style": "display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 16px;" },
            $h("section", { "class": "sw-card", "aria-labelledby": "fa-vr", "style": "padding: 24px; display: flex; flex-direction: column; gap: 18px;" },
              $h("div", { "style": "display: flex; justify-content: space-between; align-items: center;" },
                $h("h2", { "id": "fa-vr", "class": "sw-card-title" },
                  "Vues et revenus"
                ),
                $h("div", { "class": "sw-tabs", "role": "tablist", "style": "padding: 3px;" },
                  $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "true", "style": "height: 28px; font-size: 13px;" },
                    "Par semaine"
                  ),
                  $h("button", { "class": "sw-tab", "role": "tab", "aria-selected": "false", "style": "height: 28px; font-size: 13px;" },
                    "Par jour"
                  )
                )
              ),
              $h("div", { "style": "display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-bottom: 1px solid var(--line); padding-bottom: 18px;" },
                $h("div", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                  $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-muted);" },
                    $h("span", { "style": "width: 8px; height: 8px; border-radius: 50%; background: #4C9AFF;" }),
                    "Vues 30 j"
                  ),
                  $h("span", { "class": "sw-stat" },
                    "57,7 M"
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    "dont 2,8 M sur Instagram"
                  )
                ),
                $h("div", { "style": "display: flex; flex-direction: column; gap: 4px; padding-left: 20px; border-left: 1px solid var(--line);" },
                  $h("span", { "style": "display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-muted);" },
                    $h("span", { "style": "width: 8px; height: 8px; border-radius: 50%; background: #FFFFFF;" }),
                    "Revenus estimés"
                  ),
                  $h("span", { "class": "sw-stat", "style": "font-size: 26px; white-space: nowrap;" },
                    $h("span", { "style": "font-size: 15px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                      "Entre "
                    ),
                    "144",
                    $h("span", { "style": "font-size: 15px; font-weight: 600; letter-spacing: 0; color: var(--ink-muted);" },
                      " et "
                    ),
                    "202 k€"
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    "sur 30 jours"
                  )
                ),
                $h("div", { "style": "display: flex; flex-direction: column; gap: 4px; padding-left: 20px; border-left: 1px solid var(--line);" },
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                    "Cette semaine"
                  ),
                  $h("span", { "class": "sw-stat" },
                    "18,4 M"
                  ),
                  $h("span", { "style": "font-size: 12px; font-weight: 600; color: var(--accent);" },
                    "+6 % face à la semaine d'avant"
                  )
                )
              ),
              $h("svg", { "viewBox": "0 0 640 240", "width": "100%", "height": "240", "role": "img", "aria-label": "Vues par semaine de publication sur 6 semaines : 10,6 ; 9,8 ; 8,9 ; 8,5 ; 17,3 ; 18,4 millions" },
                $h("defs", null,
                  $h("linearGradient", { "id": "faG", "x1": "0", "y1": "0", "x2": "0", "y2": "1" },
                    $h("stop", { "offset": "0%", "stop-color": "#4C9AFF", "stop-opacity": "0.30" }),
                    $h("stop", { "offset": "100%", "stop-color": "#4C9AFF", "stop-opacity": "0" })
                  )
                ),
                $h("line", { "x1": "44", "y1": "20", "x2": "640", "y2": "20", "stroke": "rgba(255,255,255,0.06)" }),
                $h("line", { "x1": "44", "y1": "110", "x2": "640", "y2": "110", "stroke": "rgba(255,255,255,0.06)" }),
                $h("line", { "x1": "44", "y1": "200", "x2": "640", "y2": "200", "stroke": "rgba(255,255,255,0.14)" }),
                $h("text", { "x": "0", "y": "24", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "11" },
                  "20 M"
                ),
                $h("text", { "x": "0", "y": "114", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "11" },
                  "10 M"
                ),
                $h("text", { "x": "0", "y": "204", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "11" },
                  "0"
                ),
                $h("path", { "d": $v.chart?.area, "fill": "url(#faG)" }),
                $h("path", { "d": $v.chart?.line, "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "900", "style": "animation: sw-draw 7s ease-in-out infinite;" }),
                ($l($v.chart?.pts)).map((p) => [
                  $h("circle", { "cx": p?.x, "cy": p?.y, "r": p?.r, "fill": p?.fill, "stroke": "#4C9AFF", "stroke-width": "2" }),
                  $h("text", { "x": p?.x, "y": p?.ty, "text-anchor": "middle", "fill": p?.ink, "font-family": "Inter, sans-serif", "font-size": "12", "font-weight": p?.fw },
                    $t(p?.v)
                  ),
                  $h("text", { "x": p?.x, "y": "226", "text-anchor": "middle", "fill": "#8A93A3", "font-family": "JetBrains Mono, monospace", "font-size": "10" },
                    $t(p?.label)
                  )
                ])
              ),
              $h("span", { "class": "sw-calc", "style": "font-size: 11px;" },
                "Vues des vidéos publiées chaque semaine, relevées le 12/11. Suivi des comptes depuis le 06/11 : les semaines d'avant comptent les vidéos encore visibles."
              )
            ),
            $h("section", { "class": "sw-card", "aria-labelledby": "fa-res", "style": "padding: 24px; display: flex; flex-direction: column; gap: 18px;" },
              $h("h2", { "id": "fa-res", "class": "sw-card-title" },
                "Son réseau"
              ),
              $h("div", { "style": "display: flex; flex-direction: column; gap: 8px;" },
                $h("div", { "style": "display: flex; justify-content: space-between; align-items: baseline;" },
                  $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                    "Comptes actifs"
                  ),
                  $h("span", { "class": "sw-stat", "style": "font-size: 26px;" },
                    "269 ",
                    $h("span", { "style": "font-size: 15px; color: var(--ink-faint); font-weight: 600;" },
                      "/ 272"
                    )
                  )
                ),
                $h("span", { "style": "height: 6px; border-radius: 3px; background: var(--track); overflow: hidden;" },
                  $h("span", { "style": "display: block; height: 6px; width: 98.9%; background: var(--accent); border-radius: 3px;" })
                )
              ),
              $h("div", { "style": "display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;" },
                $h("div", { "class": "sw-tile" },
                  $h("span", { "class": "sw-tile-label" },
                    "Vidéos par semaine"
                  ),
                  $h("span", { "class": "sw-tile-value" },
                    "1 360"
                  )
                ),
                $h("div", { "class": "sw-tile" },
                  $h("span", { "class": "sw-tile-label" },
                    "Meilleure de la semaine"
                  ),
                  $h("span", { "class": "sw-tile-value", "style": "color: var(--accent);" },
                    "2 333×"
                  )
                ),
                $h("div", { "class": "sw-tile" },
                  $h("span", { "class": "sw-tile-label" },
                    "10 premiers comptes"
                  ),
                  $h("span", { "class": "sw-tile-value" },
                    "43 % des vues"
                  )
                ),
                $h("div", { "class": "sw-tile" },
                  $h("span", { "class": "sw-tile-label" },
                    "Pubs actives"
                  ),
                  $h("span", { "class": "sw-tile-value" },
                    "0"
                  )
                )
              ),
              $h("div", { "style": "margin-top: auto; padding: 14px 16px; border-radius: 16px; background: var(--accent-soft); box-shadow: inset 0 0 0 1px var(--accent-edge); display: flex; gap: 12px; align-items: flex-start;" },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent); flex-shrink: 0; margin-top: 1px;" },
                  $h("path", { "d": "M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                $h("span", { "style": "font-size: 13px; line-height: 1.5; color: var(--ink-soft);" },
                  "Aucune pub en cours dans les bibliothèques TikTok et Meta : ses 57,7 M de vues viennent de comptes créateurs."
                )
              )
            )
          ),
          $h("section", { "aria-labelledby": "fa-vid", "style": "display: flex; flex-direction: column; gap: 14px;" },
            $h("div", { "class": "sw-card-head" },
              $h("h2", { "id": "fa-vid", "class": "sw-card-title" },
                "Ses vidéos qui cartonnent"
              ),
              $h("a", { "class": "sw-more", "href": "/app/videos/learnwithjoel1" },
                "Les 2 542 vidéos",
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("div", { "style": "display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px;" },
              ($l($v.vids)).map((v) => [
                $h("a", { "href": "/app/videos/learnwithjoel1", "style": "display: flex; flex-direction: column; gap: 8px; text-decoration: none;" },
                  $h("span", { "class": `sw-video ${$t(v?.t)}`, "style": "display: block;" },
                    $h("img", { "class": "sw-cover", "src": v?.src, "alt": v?.hook }),
                    $h("span", { "class": "sw-video-shade" }),
                    $h("span", { "class": "sw-badge", "style": "position: absolute; top: 10px; left: 10px; height: 22px; font-size: 11px; background: rgba(5,7,12,0.55); color: #FFFFFF;" },
                      $t(v?.age)
                    ),
                    $h("span", { "class": "sw-video-foot" },
                      $h("span", { "class": "sw-video-views" },
                        $t(v?.v)
                      )
                    )
                  ),
                  $h("span", { "style": "display: flex; justify-content: space-between; gap: 6px; font-size: 12px;" },
                    $h("span", { "style": "color: var(--ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" },
                      $t(v?.h)
                    ),
                    $h("span", { "class": "sw-flag", "style": "width: 24px; height: 18px; font-size: 9px; flex-shrink: 0;" },
                      $t(v?.mk)
                    )
                  )
                )
              ])
            )
          ),
          $h("div", { "style": "display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px;" },
            $h("section", { "class": "sw-card", "aria-labelledby": "fa-fmt", "style": "padding: 24px; display: flex; flex-direction: column;" },
              $h("div", { "class": "sw-card-head", "style": "margin-bottom: 8px;" },
                $h("h2", { "id": "fa-fmt", "class": "sw-card-title" },
                  "Les formats qui marchent chez elle"
                ),
                $h("a", { "class": "sw-more", "href": "#" },
                  "Tous",
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              ),
              ($l($v.formats)).map((f) => [
                $h("div", { "style": "display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 14px; align-items: center; padding: 14px 0; border-top: 1px solid var(--line);" },
                  $h("span", { "style": "width: 32px; height: 32px; border-radius: 10px; background: var(--track); color: var(--ink-muted); display: inline-flex; align-items: center; justify-content: center;" },
                    $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": f?.icon, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 3px; min-width: 0;" },
                    $h("span", { "style": "font-size: 14px; font-weight: 600; line-height: 1.4;" },
                      $t(f?.t)
                    ),
                    $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                      $t(f?.meta)
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 4px;" },
                    $h("span", { "style": "font-family: var(--font-mono); font-size: 13px; color: var(--accent);" },
                      $t(f?.x)
                    ),
                    $h("span", { "style": "font-size: 11px; color: var(--ink-faint);" },
                      $t(f?.ok)
                    )
                  )
                )
              ])
            ),
            $h("section", { "class": "sw-card", "aria-labelledby": "fa-mk", "style": "padding: 24px; display: flex; flex-direction: column; gap: 14px;" },
              $h("div", { "class": "sw-card-head" },
                $h("h2", { "id": "fa-mk", "class": "sw-card-title" },
                  "Où ses vues se font"
                ),
                $h("span", { "class": "sw-card-sub" },
                  "Vues 30 j"
                )
              ),
              ($l($v.mk)).map((m) => [
                $h("div", { "style": "display: grid; grid-template-columns: 28px minmax(0, 1fr) 60px; gap: 12px; align-items: center;" },
                  $h("span", { "class": "sw-flag", "style": "width: 28px;" },
                    $t(m?.c)
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                    $h("span", { "style": "display: flex; justify-content: space-between; font-size: 13px;" },
                      $h("span", { "style": "color: var(--ink-soft);" },
                        $t(m?.l)
                      ),
                      $h("span", { "style": "color: var(--ink-faint);" },
                        $t(m?.v)
                      )
                    ),
                    $h("span", { "style": "height: 6px; border-radius: 3px; background: var(--track); overflow: hidden;" },
                      $h("span", { "style": `display: block; height: 6px; width: ${$t(m?.w)}; background: ${$t(m?.bg)}; border-radius: 3px;` })
                    )
                  ),
                  $h("span", { "style": "text-align: right; font-family: var(--font-display); font-size: 17px; font-weight: 700;" },
                    $t(m?.p)
                  )
                )
              ])
            )
          ),
          $h("section", { "class": "sw-card", "aria-labelledby": "fa-cr", "style": "padding: 8px 24px 12px;" },
            $h("div", { "class": "sw-card-head", "style": "padding: 16px 0 6px;" },
              $h("h2", { "id": "fa-cr", "class": "sw-card-title" },
                "Les créateurs qui la poussent"
              ),
              $h("a", { "class": "sw-more", "href": "#" },
                "Les 269 comptes",
                $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("table", { "class": "sw-table" },
              $h("thead", null,
                $h("tr", null,
                  $h("th", { "style": "padding-left: 0;" },
                    "Compte"
                  ),
                  $h("th", null,
                    "Marché"
                  ),
                  $h("th", { "class": "sw-num" },
                    "Abonnés"
                  ),
                  $h("th", { "class": "sw-num" },
                    "Vues 30 j"
                  ),
                  $h("th", { "class": "sw-num" },
                    "Vues d'habitude"
                  ),
                  $h("th", { "class": "sw-num", "style": "padding-right: 0;" })
                )
              ),
              $h("tbody", null,
                ($l($v.creators)).map((c) => [
                  $h("tr", null,
                    $h("td", { "style": "padding-left: 0;" },
                      $h("span", { "class": "sw-app" },
                        $h("span", { "style": "width: 34px; height: 34px; border-radius: 50%; overflow: hidden; background: #1B2333; border: 1px solid var(--line); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;" },
                          (c?.av) ? [
                            $h("img", { "src": c?.av, "alt": "", "style": "width: 100%; height: 100%; object-fit: cover; display: block;" })
                          ] : null,
                          (c?.noav) ? [
                            $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                              $h("circle", { "cx": "12", "cy": "9", "r": "4", "fill": "#3A4558" }),
                              $h("path", { "d": "M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4", "fill": "#3A4558" })
                            )
                          ] : null
                        ),
                        $h("span", { "style": "display: flex; flex-direction: column;" },
                          $h("span", { "class": "sw-app-name" },
                            $t(c?.h)
                          ),
                          $h("span", { "class": "sw-app-sub" },
                            $t(c?.bio)
                          )
                        )
                      )
                    ),
                    $h("td", null,
                      $h("span", { "class": "sw-flag" },
                        $t(c?.mk)
                      )
                    ),
                    $h("td", { "class": "sw-num", "style": "color: var(--ink-soft); font-weight: 500;" },
                      $t(c?.fans)
                    ),
                    $h("td", { "class": "sw-num" },
                      $t(c?.v)
                    ),
                    $h("td", { "class": "sw-num", "style": "color: var(--ink-soft); font-weight: 500;" },
                      $t(c?.med)
                    ),
                    $h("td", { "class": "sw-num", "style": "padding-right: 0;" },
                      $h("a", { "class": "sw-more", "href": "/app/createurs/zinedine-gsbb", "style": "justify-content: flex-end; color: var(--accent);" },
                        "Voir la fiche",
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      )
                    )
                  )
                ])
              )
            )
          )
        )
      )
    ];
  }
}
