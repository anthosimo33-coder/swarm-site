import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { resetCodeMail, type Mail } from "./mailTemplates";

/**
 * L'envoi des e-mails, par l'API de Resend (domaine kopycat.io, vérifié chez Resend le 24/11/2026).
 * Variables du déploiement : RESEND_API_KEY (obligatoire), MAIL_FROM (facultatif, « Kopycat <compte@kopycat.io> » sinon).
 * Sans clé, l'envoi échoue en clair dans les journaux de Convex : rien ne part en silence.
 */
const FROM = "Kopycat <compte@kopycat.io>";

export async function sendMail(to: string, mail: Mail, tag: string): Promise<string> {
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
    console.log(`e-mail « mot-de-passe-oublie » parti chez Resend : ${id}`);
  },
});
