import { ConvexError, getConvexSize, v } from "convex/values";
import { liveUserId } from "./session";
import { takeHit } from "./authLimits";
import { mutation, query, type QueryCtx } from "./_generated/server";

/**
 * Ce que la personne garde dans l'app, par clé (forme de chaque valeur : docs/donnees-app.md) :
 *   follows     { apps: [slug], creators: [handle], formats: [id] }
 *   folders     [{ id, name, createdAt, items: [{ kind, id, label, cover, at }] }]
 *   alertRules  [{ id, … , createdAt }]
 *   seen        { alerts: date en ms de « Tout marquer comme lu », alertsRead: empreintes des alertes ouvertes (texte) }
 *   recent      [{ kind, id, at }] ×2 : les deux dernières fiches ouvertes depuis la recherche (maquette 9B, 24/11) —
 *               `kind` app | creator | format, `id` le slug, le @ sans arobase ou l'id du format
 *   views       [{ id, screen, name, q, at }] : les vues enregistrées d'une liste (maquette D2, 20/11) — `q` est la requête
 *               de l'adresse qui porte ses filtres (« niche=Études&m=FR »), `screen` l'écran (« createurs »)
 * Le routeur (src/app/main.js) les passe aux écrans par `saved(clé)` et `save(clé, valeur)`.
 */
const KEYS = new Set(["follows", "folders", "alertRules", "seen", "views", "recent"]);
/**
 * Taille d'une valeur, comptée comme Convex la compte (getConvexSize). Audit Q39 (19/11) : la borne portait sur les
 * caractères du JSON ; 240 031 caractères de zéros pesaient 1 080 174 octets pour Convex (au-delà de 1 Mio : erreur
 * brute à l'écriture), et 256 000 caractères chinois 768 Ko.
 */
const MAX_BYTES = 256_000;
/**
 * Écritures par compte (audit Q39, 19/11 : aucune limite ; un compte gratuit pouvait écrire ~256 Ko par appel, sans fin).
 * 300 par tranche de 10 minutes : bien au-delà d'une personne qui range ses dossiers ou suit des comptes à la main.
 */
const WRITES_MAX = 300;
const WRITES_WINDOW_MS = 10 * 60_000;

/**
 * La forme de chaque clé (audit Q39 : v.any() acceptait n'importe quoi). Les champs connus sont vérifiés ; un champ de
 * plus n'est accepté que s'il est simple (texte court, nombre, oui/non, null), pour qu'un écran puisse en ajouter un
 * sans casser l'enregistrement, mais jamais une arborescence.
 */
type Check = (x: unknown) => boolean;
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const str = (max: number): Check => (x) => typeof x === "string" && x.length <= max;
const num: Check = (x) => typeof x === "number" && Number.isFinite(x);
const orNull = (c: Check): Check => (x) => x === null || c(x);
const scalar: Check = (x) => x === null || typeof x === "boolean" || num(x) || str(500)(x);
const list = (max: number, c: Check): Check => (x) => Array.isArray(x) && x.length <= max && x.every(c);
/** Un objet : ses champs connus vérifiés (absents permis si `optional`), au plus `extra` champs simples en plus. */
const shape = (known: Record<string, Check>, { extra = 8, optional = false } = {}): Check => (x) => {
  if (!isObj(x)) return false;
  for (const [k, c] of Object.entries(known)) if (k in x ? !c(x[k]) : !optional) return false;
  const more = Object.keys(x).filter((k) => !(k in known));
  return more.length <= extra && more.every((k) => scalar(x[k]));
};
const SHAPES: Record<string, Check> = {
  follows: shape({ apps: list(5_000, str(200)), creators: list(5_000, str(200)), formats: list(5_000, str(200)) }, { extra: 0, optional: true }),
  folders: list(500, shape({ id: str(100), name: str(200), createdAt: num,
    items: list(2_000, shape({ kind: str(40), id: str(200), label: str(500), cover: orNull(str(2_000)), at: num })) })),
  alertRules: list(200, shape({ id: str(100) }, { extra: 15 })),
  seen: shape({}, { extra: 16 }),
  views: list(50, shape({ id: str(100), screen: str(40), name: str(200), q: str(2_000), at: num }, { extra: 4 })),
  recent: list(2, shape({ kind: (x) => x === "app" || x === "creator" || x === "format", id: str(200), at: num }, { extra: 0 })),
};

/**
 * Une app suivie ou gardée dans un dossier sous l'ancien slug d'une app fusionnée apparaît sous celui de l'app qui l'a
 * reprise (« apps:merged », convex/radarModels.ts). Audit Q25 (19/11) : elle disparaissait de l'Accueil et des Apps
 * suivies, et son lien de dossier menait à « fiche absente ». La valeur rangée change à la prochaine sauvegarde.
 */
async function mergedApps(ctx: QueryCtx): Promise<Map<string, string>> {
  const row = await ctx.db.query("boards").withIndex("by_key", (q) => q.eq("key", "apps:merged")).first();
  return new Map((row?.data as { merged?: [string, string][] } | null)?.merged ?? []);
}
function withMerged(key: string, value: unknown, to: Map<string, string>): unknown {
  if (!to.size || !value || typeof value !== "object") return value;
  if (key === "follows") {
    const f = value as { apps?: unknown };
    if (!Array.isArray(f.apps) || !f.apps.some((s) => to.has(s))) return value;
    return { ...f, apps: [...new Set(f.apps.map((s) => (typeof s === "string" ? to.get(s) ?? s : s)))] };
  }
  if (key === "folders" && Array.isArray(value)) {
    return value.map((folder) => {
      const items = (folder as { items?: unknown })?.items;
      if (!Array.isArray(items) || !items.some((it) => it?.kind === "app" && to.has(it.id))) return folder;
      const seen = new Set<string>();
      const out = [];
      for (const it of items) {
        const next = it?.kind === "app" && to.has(it.id) ? { ...it, id: to.get(it.id) } : it;
        if (next?.kind === "app") { if (seen.has(next.id)) continue; seen.add(next.id); } // gardée deux fois : une
        out.push(next);
      }
      return { ...folder, items: out };
    });
  }
  return value;
}

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await liveUserId(ctx);
    if (userId === null) return null;
    const row = await ctx.db
      .query("saved")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key))
      .first();
    if (!row) return null;
    return key === "follows" || key === "folders" ? withMerged(key, row.value, await mergedApps(ctx)) : row.value;
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, { key, value }) => {
    const userId = await liveUserId(ctx);
    // Compte supprimé (audit S27) : rien n'est réinséré pour lui, même depuis une session encore ouverte ailleurs.
    if (userId === null || (await ctx.db.get(userId)) === null) throw new ConvexError("NON_CONNECTE");
    if (!KEYS.has(key)) throw new ConvexError("CLE_INCONNUE");
    if (getConvexSize(value ?? null) > MAX_BYTES) throw new ConvexError("TROP_LOURD");
    if (!SHAPES[key](value)) throw new ConvexError("FORME_INVALIDE");
    if (!(await takeHit(ctx, `saved:${userId}`, WRITES_MAX, WRITES_WINDOW_MS))) throw new ConvexError("TROP_DE_REQUETES");
    const row = await ctx.db
      .query("saved")
      .withIndex("by_user_key", (q) => q.eq("userId", userId).eq("key", key))
      .first();
    if (row) await ctx.db.patch(row._id, { value, updatedAt: Date.now() });
    else await ctx.db.insert("saved", { userId, key, value, updatedAt: Date.now() });
  },
});
