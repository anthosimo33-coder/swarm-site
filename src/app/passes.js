// Les laissez-passer des pages (audit S22, convex/boardQuota.ts). Un abonné ne lit une page de boards.get qu'avec le
// laissez-passer de cette page, délivré par boards.passes, qui compte les pages (300 par heure, 1 500 par 24 h). Ici :
//  - les pages demandées dans le même tour partent en un seul appel (une liste et ses pages suivantes, ⌘K), par lots ;
//  - un laissez-passer est gardé jusqu'à son échéance (2 h) : rouvrir une page ne recompte rien ;
//  - une page déjà ouverte n'en redemande un que si le serveur le réclame (échéance passée, abonnement arrivé) ;
//  - au-delà du quota, la page vaut null et porte `quota` (l'heure de reprise), que le routeur affiche ; rien n'est
//    redemandé au serveur avant cette heure, puis les pages en attente s'ouvrent d'elles-mêmes ;
//  - sans abonnement (l'aperçu), ou si le serveur ne connaît pas encore boards.passes (l'app déployée avant Convex),
//    l'abonnement part sans laissez-passer, comme avant.

/** Code de l'erreur de boards.get sans laissez-passer valable (PASS_ERROR de convex/boardQuota.ts). */
export const PASS_ERROR = 'LAISSEZ_PASSER';
/** Clés par appel de boards.passes (PASS_BATCH de convex/boardQuota.ts). */
const BATCH = 60;
/** Lisibles sans laissez-passer (FREE_KEYS de convex/boardQuota.ts). */
const PUBLIC = new Set(['stats']);
/** Un laissez-passer qui échoit dans moins d'une minute n'ouvre plus de nouvel abonnement. */
const MARGIN = 60_000;
/** boards.passes en échec (serveur d'avant le quota) : lecture sans laissez-passer pendant ce délai. */
const RETRY_MS = 30_000;

/**
 * @param client   le client Convex (mutation, watchQuery)
 * @param watcher  les abonnements de l'app (src/app/watcher.js)
 * @param get      api.boards.get ; passes : api.boards.passes
 * @param isPro    () => la personne est-elle abonnée (sinon, l'aperçu : pas de laissez-passer)
 * @returns board(clé) : l'entrée du watcher { value, listeners, quota? }
 */
export function createBoards({ client, watcher, get, passes, isPro, now = () => Date.now(), later = (f, ms) => setTimeout(f, ms) }) {
  const held = new Map(); // clé -> { token, exp }
  const asked = new Set(); // clés en file ou en vol
  let queue = null;
  let blockedUntil = 0; // quota atteint : pas de nouvelle page avant
  let reopening = false;
  let downUntil = 0;
  const idOf = (key) => `board:${key}`;

  const onError = (key) => (e, entry) => {
    if (!(e && e.data && e.data.code === PASS_ERROR) || now() < downUntil) return false;
    held.delete(key);
    if (now() < blockedUntil) {
      mark(entry, blockedUntil); // rouvrira avec les autres (reopen)
      entry.listeners.forEach((f) => f());
    } else ask(key);
    return true; // la page garde sa dernière valeur d'ici le nouveau laissez-passer
  };
  function arm(key, token) {
    const entry = watcher.watch(get, idOf(key), token ? { key, pass: token } : { key }, onError(key));
    delete entry.quota;
    return entry;
  }
  function mark(entry, until) {
    entry.quota = until;
    if (entry.value === undefined) entry.value = null;
  }

  function board(key) {
    const id = idOf(key);
    const cur = watcher.entries.get(id);
    if (cur && (cur.args || cur.quota)) return watcher.watch(get, id, null);
    if (PUBLIC.has(key) || !isPro() || now() < downUntil) return arm(key, null);
    const p = held.get(key);
    if (p && p.exp - MARGIN > now()) return arm(key, p.token);
    const entry = watcher.watch(get, id, null);
    if (now() < blockedUntil) mark(entry, blockedUntil);
    else ask(key);
    return entry;
  }

  function ask(key) {
    if (asked.has(key)) return;
    asked.add(key);
    if (!queue) {
      queue = [];
      Promise.resolve().then(flush);
    }
    queue.push(key);
  }
  function flush() {
    const keys = queue;
    queue = null;
    for (let i = 0; i < keys.length; i += BATCH) send(keys.slice(i, i + BATCH));
  }
  function send(keys) {
    client.mutation(passes, { keys }).then(
      (r) => {
        const got = (r && r.passes) || {};
        const refused = [];
        for (const key of keys) {
          asked.delete(key);
          if (got[key]) {
            held.set(key, { token: got[key], exp: r.exp });
            if (watcher.entries.has(idOf(key))) arm(key, got[key]);
          } else if (r && r.until && (r.refused || []).includes(key)) refused.push(key);
          // Ni l'un ni l'autre : le serveur ne voit pas d'abonnement (il vient de finir) ; l'aperçu, sans laissez-passer.
          else if (watcher.entries.has(idOf(key))) arm(key, null);
        }
        // L'échéance sur l'horloge de l'app : le délai que le serveur annonce, d'après sa propre heure (`at`).
        if (refused.length) deny(refused, typeof r.at === 'number' ? now() + Math.max(0, r.until - r.at) : r.until);
      },
      () => {
        // boards.passes inconnu (serveur d'avant le quota) ou en erreur : lecture sans laissez-passer, comme avant.
        downUntil = now() + RETRY_MS;
        for (const key of keys) {
          asked.delete(key);
          if (watcher.entries.has(idOf(key))) arm(key, null);
        }
      },
    );
  }
  function deny(keys, until) {
    blockedUntil = Math.max(blockedUntil, until);
    for (const key of keys) {
      const entry = watcher.entries.get(idOf(key));
      if (!entry) continue;
      mark(entry, until);
      entry.listeners.forEach((f) => f());
    }
    if (!reopening) {
      reopening = true;
      later(reopen, Math.max(blockedUntil - now(), 0) + 1000);
    }
  }
  function reopen() {
    reopening = false;
    if (now() < blockedUntil) {
      reopening = true;
      later(reopen, blockedUntil - now() + 1000);
      return;
    }
    for (const [id, entry] of watcher.entries) if (entry.quota && id.startsWith('board:')) ask(id.slice('board:'.length));
  }

  return { board };
}

/** L'heure de reprise, à l'heure de Paris : « à 15 h 37 », ou « demain à 09 h 12 ». */
export function untilText(until, now = Date.now()) {
  const day = (t) => new Date(t).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
  const time = new Date(until).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).replace(':', ' h ');
  return (day(until) === day(now) ? 'à ' : 'demain à ') + time;
}
