/**
 * Les e-mails de Kopycat, d'après le canevas « Swarm sans abonnement » (rangée « E-mails », direction M2 « la carte » :
 * fond gris clair, carte blanche, logo au-dessus). Fond blanc seulement : aucune variante sombre.
 *
 * Écrits pour les messageries : tableaux, styles en ligne, logo en PNG hébergé (Gmail retire le SVG), polices du système
 * en repli d'Inter. Chaque e-mail a sa version texte. Module pur (convex/mail.ts l'envoie, scripts/mdp-oublie.test.mjs
 * le vérifie).
 */

const SITE = "https://www.kopycat.io";
const LOGO = `${SITE}/media/mail/kopycat-mark.png`;
const EDITEUR = "JARVIA STUDIO, 47 rue Vivienne, 75002 Paris";

const INK = "#0E0F12", SOFT = "#3A3F47", MUTED = "#5F656E", LINE = "#E6E6EA", GROUND = "#F3F3F5";
const SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const DISPLAY = "'Inter Tight', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Espaces fines insécables du français devant : ; ? ! (le texte seulement, jamais le HTML). */
const fr = (s: string) => s.replace(/ ([:;?!])/g, " $1");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type Mail = { subject: string; html: string; text: string };

function layout({ title, preview, body, reason }: { title: string; preview: string; body: string; reason: string }): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(title)}</title>
<style>
:root{color-scheme:light only}
@media (max-width:620px){.k-card{padding:32px 24px !important}.k-wrap{padding:24px 12px !important}.k-h1{font-size:26px !important}.k-code{font-size:34px !important;padding:16px 20px !important}}
</style>
</head>
<body style="margin:0;padding:0;background:${GROUND};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${GROUND};">
<tr><td class="k-wrap" align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
<tr><td style="padding:0 0 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="vertical-align:middle;padding-right:9px;"><img src="${LOGO}" width="26" height="26" alt="" style="display:block;border:0;"></td>
<td style="vertical-align:middle;font-family:${DISPLAY};font-size:21px;line-height:1;font-weight:800;letter-spacing:-0.03em;color:${INK};">kopycat</td>
</tr></table>
</td></tr>
<tr><td class="k-card" style="background:#FFFFFF;border:1px solid ${LINE};border-radius:16px;padding:44px 48px 40px;font-family:${SANS};">
${body}
</td></tr>
<tr><td style="padding:24px 8px 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${MUTED};">
${esc(fr(reason))}<br>
Kopycat · <a href="${SITE}" style="color:${MUTED};">www.kopycat.io</a><br>
Kopycat est édité par ${esc(EDITEUR)}.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const h1 = (t: string) =>
  `<h1 class="k-h1" style="margin:0 0 24px;font-family:${DISPLAY};font-size:30px;line-height:1.15;font-weight:700;letter-spacing:-0.03em;color:${INK};">${esc(fr(t))}</h1>`;
const p = (t: string, size = 16, color = SOFT, last = false) =>
  `<p style="margin:0 0 ${last ? 0 : 24}px;font-size:${size}px;line-height:1.6;color:${color};">${esc(fr(t))}</p>`;

/** Le code de « mot de passe oublié » (parcours B) : le code dans l'objet, pour le lire dès la notification. */
export function resetCodeMail(code: string, email: string): Mail {
  if (!/^\d{6}$/.test(code)) throw new Error("code attendu : 6 chiffres");
  const shown = `${code.slice(0, 3)} ${code.slice(3)}`;
  const reason = `Tu reçois cet e-mail parce qu’un compte Kopycat utilise ${email}.`;
  const lines = {
    title: "Ton code pour changer de mot de passe",
    use: "Entre-le sur la page de Kopycat restée ouverte. Il marche 15 minutes.",
    notMe: "Pas toi ? Ignore cet e-mail : ton mot de passe ne change pas.",
  };
  const body = h1(lines.title)
    + `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr><td class="k-code" style="padding:18px 28px;border-radius:14px;background:${GROUND};border:1px solid ${LINE};font-family:${MONO};font-size:40px;line-height:1;font-weight:500;letter-spacing:0.14em;color:${INK};">${shown}</td></tr></table>`
    + p(lines.use)
    + p(lines.notMe, 14, MUTED, true);
  return {
    subject: `${shown} est ton code Kopycat`,
    html: layout({ title: lines.title, preview: "Il marche 15 minutes.", body, reason }),
    text: [`${fr(lines.title)} : ${shown}`, "", fr(lines.use), "", fr(lines.notMe), "", "—", fr(reason), "Kopycat · www.kopycat.io",
      `Kopycat est édité par ${EDITEUR}.`].join("\n"),
  };
}
