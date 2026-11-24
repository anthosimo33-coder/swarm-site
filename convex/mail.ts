import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { accountClosedMail, passwordChangedMail, resetCodeMail, welcomeMail, type Mail } from "./mailTemplates";

/**
 * L'envoi des e-mails, par l'API de Resend (domaine kopycat.io, vérifié chez Resend le 24/11/2026).
 * Variables du déploiement : RESEND_API_KEY (obligatoire), MAIL_FROM (facultatif, « Kopycat <compte@kopycat.io> » sinon).
 * Sans clé, l'envoi échoue en clair dans les journaux de Convex : rien ne part en silence.
 */
const FROM = "Kopycat <compte@kopycat.io>";

/**
 * Les adresses des comptes de test (@exemple.fr, @ex.fr, cf. l'admin) et les domaines réservés aux exemples : jamais
 * d'envoi. Ces boîtes n'existent pas, et chaque rebond abîme la réputation d'envoi de kopycat.io chez Resend.
 */
const TEST_DOMAINS = new Set(["exemple.fr", "ex.fr", "exemple.com", "example.com", "example.org", "example.net"]);
export const isTestAddress = (to: string) => TEST_DOMAINS.has(to.trim().toLowerCase().split("@").pop() ?? "");

export async function sendMail(to: string, mail: Mail, tag: string): Promise<string> {
  if (isTestAddress(to)) {
    console.log(`adresse de test : e-mail « ${tag} » non envoyé`);
    return "";
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error(`RESEND_API_KEY absente du déploiement : e-mail « ${tag} » non envoyé`);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || FROM, to: [to], subject: mail.subject, html: mail.html, text: mail.text,
      tags: [{ name: "type", value: tag }],
    }),
  });
  if (!res.ok) throw new Error(`Resend a refusé l'e-mail « ${tag} » (HTTP ${res.status}) : ${(await res.text()).slice(0, 300)}`);
  const { id } = (await res.json()) as { id?: string };
  return id ?? "";
}

/** Le code de « mot de passe oublié » (convex/passwordReset.ts le planifie). */
export const sendResetCode = internalAction({
  args: { to: v.string(), code: v.string() },
  handler: async (_ctx, { to, code }) => {
    const id = await sendMail(to, resetCodeMail(code, to), "mot-de-passe-oublie");
    if (id) console.log(`e-mail « mot-de-passe-oublie » parti chez Resend : ${id}`);
  },
});

/** Le mot de passe a changé (convex/auth.ts reset-verification, users.changePassword, users.resetPassword). */
export const sendPasswordChanged = internalAction({
  args: { to: v.string(), at: v.number() },
  handler: async (_ctx, { to, at }) => {
    const id = await sendMail(to, passwordChangedMail(to, at), "mot-de-passe-change");
    if (id) console.log(`e-mail « mot-de-passe-change » parti chez Resend : ${id}`);
  },
});

/** Bienvenue, après une inscription par e-mail (convex/auth.ts signUp). */
export const sendWelcome = internalAction({
  args: { to: v.string() },
  handler: async (_ctx, { to }) => {
    const id = await sendMail(to, welcomeMail(to), "bienvenue");
    if (id) console.log(`e-mail « bienvenue » parti chez Resend : ${id}`);
  },
});

/** Le compte est fermé (users.deleteAccount) ; l'adresse est prise avant l'effacement. */
export const sendAccountClosed = internalAction({
  args: { to: v.string(), at: v.number() },
  handler: async (_ctx, { to, at }) => {
    const id = await sendMail(to, accountClosedMail(to, at), "compte-ferme");
    if (id) console.log(`e-mail « compte-ferme » parti chez Resend : ${id}`);
  },
});
