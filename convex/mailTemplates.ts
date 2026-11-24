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

/** Le bouton d'action du site (pilule bleue, pastille ronde et flèche), en tableau pour les messageries. */
const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr><td bgcolor="#0B6FE0" style="border-radius:999px;background:#0B6FE0;background-image:linear-gradient(180deg,#4C9AFF 0%,#0B6FE0 100%);border:1px solid #0A63C9;">`
  + `<a href="${esc(href)}" style="display:inline-block;padding:6px 6px 6px 24px;font-family:${SANS};font-size:16px;line-height:40px;font-weight:600;color:#FFFFFF;text-decoration:none;white-space:nowrap;">${esc(fr(label))}`
  + `<span style="display:inline-block;width:38px;height:38px;margin-left:12px;border-radius:50%;background:rgba(255,255,255,0.22);border:1px solid rgba(255,255,255,0.45);text-align:center;line-height:38px;font-size:17px;vertical-align:top;">&rarr;</span></a></td></tr></table>`;

/** Lignes « étiquette · valeur » séparées par des filets (mot de passe changé). */
const facts = (rows: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border-bottom:1px solid ${LINE};">`
  + rows.map(([k, v]) => `<tr><td style="width:120px;padding:12px 16px 12px 0;border-top:1px solid ${LINE};font-size:15px;line-height:1.5;color:${MUTED};vertical-align:top;">${esc(fr(k))}</td>`
    + `<td style="padding:12px 0;border-top:1px solid ${LINE};font-size:15px;line-height:1.5;color:${INK};word-break:break-word;">${esc(fr(v))}</td></tr>`).join("")
  + `</table>`;

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
/** « 24 novembre 2026 à 10 h 32 » à l'heure de Paris. */
export function parisDate(ms: number): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return `${Number(parts.day)} ${MONTHS[Number(parts.month) - 1]} ${parts.year} à ${Number(parts.hour)} h ${parts.minute}`;
}

const reasonFor = (email: string) => `Tu reçois cet e-mail parce qu’un compte Kopycat utilise ${email}.`;
const footText = (reason: string) => ["—", fr(reason), "Kopycat · www.kopycat.io", `Kopycat est édité par ${EDITEUR}.`];

/** Le code de « mot de passe oublié » (parcours B) : le code dans l'objet, pour le lire dès la notification. */
export function resetCodeMail(code: string, email: string): Mail {
  if (!/^\d{6}$/.test(code)) throw new Error("code attendu : 6 chiffres");
  const shown = `${code.slice(0, 3)} ${code.slice(3)}`;
  const reason = reasonFor(email);
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
    text: [`${fr(lines.title)} : ${shown}`, "", fr(lines.use), "", fr(lines.notMe), "", ...footText(reason)].join("\n"),
  };
}

/** Le mot de passe a changé (mot de passe oublié, Réglages, ou remise par le support) : les autres appareils sont déconnectés. */
export function passwordChangedMail(email: string, at: number): Mail {
  const when = `${parisDate(at)} (heure de Paris)`;
  const reason = reasonFor(email);
  const lines = {
    title: "Ton mot de passe a changé",
    done: "Le mot de passe de ton compte Kopycat a été changé. Tes autres appareils ont été déconnectés.",
    notMe: "Pas toi ? Change-le tout de suite : l’autre personne sera déconnectée.",
  };
  const href = `${SITE}/mot-de-passe-oublie`;
  const body = h1(lines.title) + p(lines.done) + facts([["Compte", email], ["Quand", when]]) + p(lines.notMe) + button("Ce n’était pas moi", href).replace("margin:0 0 24px;", "margin:0;");
  return {
    subject: "Ton mot de passe a été changé",
    html: layout({ title: lines.title, preview: `Le ${parisDate(at)}. Tes autres appareils ont été déconnectés.`, body, reason }),
    text: [fr(lines.title), "", fr(lines.done), "", `Compte : ${email}`, fr(`Quand : ${when}`), "", fr(lines.notMe), href, "", ...footText(reason)].join("\n"),
  };
}

/** Bienvenue, à l'inscription par e-mail. */
export function welcomeMail(email: string): Mail {
  const reason = `Tu reçois cet e-mail parce que tu viens de créer un compte Kopycat avec ${email}.`;
  const lines = {
    title: "Bienvenue sur Kopycat",
    start: "Commence par Apps : les apps que les réseaux de créateurs poussent en ce moment sur TikTok, Instagram et YouTube Shorts.",
  };
  const href = `${SITE}/app/apps`;
  const created = `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${SOFT};">Ton compte est créé avec <b style="color:${INK};">${esc(email)}</b>.</p>`;
  const body = h1(lines.title) + created + p(lines.start) + button("Voir les apps", href).replace("margin:0 0 24px;", "margin:0;");
  return {
    subject: "Ton compte Kopycat est prêt",
    html: layout({ title: lines.title, preview: "Les apps que les réseaux de créateurs poussent en ce moment.", body, reason }),
    text: [fr(lines.title), "", `Ton compte est créé avec ${email}.`, "", fr(lines.start), href, "", ...footText(reason)].join("\n"),
  };
}

/** Le compte est fermé (Réglages › Profil) : tout ce qu'il contenait est effacé. */
export function accountClosedMail(email: string, at: number): Mail {
  const reason = `Tu reçois cet e-mail parce que ton compte Kopycat utilisait ${email}.`;
  const day = parisDate(at).replace(/ à .*$/, "");
  const lines = {
    title: "Ton compte est fermé",
    erased: "Tout ce qu’il contenait est effacé : dossiers, alertes, réglages.",
    again: "Tu peux recréer un compte avec la même adresse quand tu veux.",
  };
  const closed = `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${SOFT};">Le compte <b style="color:${INK};">${esc(email)}</b> a été fermé le ${esc(day)}. ${esc(fr(lines.erased))}</p>`;
  const body = h1(lines.title) + closed + p(lines.again, 16, SOFT, true);
  return {
    subject: "Ton compte Kopycat est fermé",
    html: layout({ title: lines.title, preview: "Tes dossiers, alertes et réglages ont été effacés.", body, reason }),
    text: [fr(lines.title), "", `Le compte ${email} a été fermé le ${day}. ${fr(lines.erased)}`, "", fr(lines.again), "", ...footText(reason)].join("\n"),
  };
}

const rule = `<div style="height:1px;margin:0 0 24px;background:${LINE};line-height:1px;font-size:1px;">&nbsp;</div>`;
const fallback = (url: string) =>
  `<p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};">${esc(fr("Le bouton ne marche pas ? Copie ce lien dans ton navigateur :"))}<br>`
  + `<a href="${esc(url)}" style="color:#0B6FE0;word-break:break-all;">${esc(url)}</a></p>`;
export const SUPPORT = "support@kopycat.io";

/** Le lien qui confirme une nouvelle adresse (Réglages › Profil), envoyé À la nouvelle adresse. */
export function confirmNewEmailMail(to: string, from: string, token: string): Mail {
  if (!/^[0-9a-f]{64}$/.test(token)) throw new Error("jeton attendu : 64 caractères hexadécimaux");
  const href = `${SITE}/confirmer-adresse?t=${token}`;
  const reason = "Tu reçois cet e-mail parce que quelqu’un a demandé à mettre cette adresse sur un compte Kopycat.";
  const lines = {
    title: "Confirme ta nouvelle adresse",
    small: "Le lien marche 24 heures. Pas toi ? Ignore cet e-mail : rien ne change.",
  };
  const change = `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${SOFT};">Ton compte Kopycat passera de ${esc(from)} à <b style="color:${INK};">${esc(to)}</b> dès que tu confirmes.</p>`;
  const body = h1(lines.title) + change + button("Confirmer cette adresse", href) + p(lines.small, 14, MUTED) + rule + fallback(href);
  return {
    subject: "Confirme ta nouvelle adresse",
    html: layout({ title: lines.title, preview: "Ton compte Kopycat passe sur cette adresse dès que tu confirmes.", body, reason }),
    text: [fr(lines.title), "", `Ton compte Kopycat passera de ${from} à ${to} dès que tu confirmes :`, href, "", fr(lines.small), "", ...footText(reason)].join("\n"),
  };
}

/** L'adresse du compte a changé, envoyé à l'ANCIENNE adresse une fois la nouvelle confirmée. */
export function emailChangedMail(to: string, next: string, at: number): Mail {
  const when = `${parisDate(at)} (heure de Paris)`;
  const reason = `Tu reçois cet e-mail parce que ton compte Kopycat utilisait ${to}.`;
  const lines = {
    title: "L’adresse de ton compte a changé",
    moved: "Ton compte Kopycat utilise maintenant une autre adresse. Les prochains e-mails partiront là-bas.",
  };
  const notMe = `<p style="margin:0;font-size:16px;line-height:1.6;color:${SOFT};">${esc(fr("Pas toi ? Écris-nous tout de suite à"))} <a href="mailto:${SUPPORT}" style="color:#0B6FE0;font-weight:600;">${SUPPORT}</a>.</p>`;
  const body = h1(lines.title) + p(lines.moved) + facts([["Avant", to], ["Maintenant", next], ["Quand", when]]) + notMe;
  return {
    subject: "L’adresse de ton compte a changé",
    html: layout({ title: lines.title, preview: `Ton compte Kopycat utilise maintenant ${next}.`, body, reason }),
    text: [fr(lines.title), "", fr(lines.moved), "", `Avant : ${to}`, `Maintenant : ${next}`, fr(`Quand : ${when}`), "", fr(`Pas toi ? Écris-nous tout de suite à ${SUPPORT}.`), "", ...footText(reason)].join("\n"),
  };
}
