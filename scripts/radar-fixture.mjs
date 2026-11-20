// Un export du Radar inventé (aucun compte réel), et les documents `boards` que convex/radarModels.ts en tire, comme la
// synchro (convex/radarSync.ts, boardOpts). Sert aux bancs scripts/radar.test.mjs et scripts/check-data.mjs.
//   const { docs, raw } = await fixtureBoards();       docs : Map clé → document, comme boards.get les lit (avant withCovers)
// Avec REEL=<dossier .bench-data> : l'export et le magasin réels de ce dossier à la place (banc local, jamais en CI).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const NOW = 1794780000000; // 15/11/2026, 23 h à Paris
export const SITE = 'https://banc.convex.site';
const DAY = 86_400_000;

/** buildBoards du dépôt (ou d'une autre version de radarModels.ts), empaqueté par esbuild. */
export async function loadModels(src = path.join(root, 'convex/radarModels.ts')) {
  const { build } = require('esbuild');
  const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'radar-'));
  const out = path.join(dir, 'models.mjs');
  await build({ entryPoints: [src], bundle: true, platform: 'node', format: 'esm', target: 'node20', outfile: out, logLevel: 'error' });
  const mod = await import(pathToFileURL(out).href);
  fs.rmSync(dir, { recursive: true, force: true });
  return mod;
}

/** Générateur pseudo-aléatoire fixe : le même export à chaque lancement. */
function rng(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0) / 2 ** 32); }

/**
 * L'export inventé : 9 apps actives (3 niches), une app en pause (« pausee ») et une fusionnée dans « app-1 »
 * (« ancienne »), 5 comptes par app, dont des comptes muets depuis des mois à forte médiane, 6 vidéos par compte,
 * 170 formats (plus que les 150 fiches format), des signaux qui décollent.
 */
export function fixtureRaw() {
  const r = rng(42);
  const niches = ['Études', 'Foi', 'Langues'];
  const apps = [];
  for (let i = 0; i < 9; i++) apps.push({ id: `id-app-${i}`, slug: `app-${i}`, name: `App ${i}`, status: 'active', trackedCount: 5, mergedInto: null, createdAt: NOW - 60 * DAY, niche: niches[i % 3], market: null, kind: 'app', store: null });
  apps.push({ id: 'id-pausee', slug: 'pausee', name: 'App en pause', status: 'paused', trackedCount: 5, mergedInto: null, createdAt: NOW - 90 * DAY, niche: 'Études', market: null, kind: 'app', store: null });
  apps.push({ id: 'id-ancienne', slug: 'ancienne', name: 'Ancienne', status: 'active', trackedCount: 2, mergedInto: 'id-app-1', createdAt: NOW - 90 * DAY, niche: 'Foi', market: null, kind: 'app', store: null });
  const tracked = [], trackedVideos = [], signals = [];
  let vid = 7_000_000_000_000_000_000n;
  const countries = ['FR', 'FR', 'US', 'ES', 'BR'];
  for (const a of apps) {
    for (let j = 0; j < 5; j++) {
      const handle = `${a.slug.replace(/-/g, '')}.compte${j}`;
      // Le 1er compte de chaque app est muet depuis 200 jours, avec la plus forte médiane de son app (audit Q24).
      const quiet = j === 0;
      const lastPostAt = quiet ? NOW - 200 * DAY : NOW - Math.floor(r() * 5) * DAY;
      const id = `acc-${a.slug}-${j}`;
      tracked.push({ id, handle, appId: a.id, status: 'active', fans: Math.floor(r() * 90_000) + 1000, bio: `Bio de ${handle}`, lang: 'fr', country: countries[j],
        medianViews: quiet ? 900_000 : Math.floor(r() * 50_000) + 1000, videosSeen: 30, lastPostAt, posts7d: quiet ? 0 : 3, igHandle: j === 1 ? `${handle}.insta` : null, igFans: null,
        igMedianViews: null, addedAt: NOW - 50 * DAY, proof: { by: 'handle', cites: 3, of: 30 } });
      for (let k = 0; k < 6; k++) {
        vid += 1n;
        const publishedAt = quiet ? NOW - (200 + k) * DAY : NOW - Math.floor(r() * 25) * DAY - k * 3600_000;
        trackedVideos.push({ id: `tv-${vid}`, accountId: id, appId: a.id, platform: 'tiktok', videoId: String(vid), publishedAt, views: Math.floor(r() * 400_000) + 500,
          snapshots: [{ at: publishedAt + DAY, views: 100 }], caption: `Légende ${k}`, hook: `Accroche ${k} de ${handle}`, hookKey: null, musicTitle: null, coverUrl: null, region: countries[j], cites: true });
      }
    }
  }
  // Un compte en pause dans le Radar (retrait, audit Q65) sous app-2, aux vidéos très vues qui citent l'app : elles ne
  // comptent ni dans ses vues ni dans son top.
  {
    const a = apps[2], id = 'acc-pause', handle = 'compte.en.pause';
    tracked.push({ id, handle, appId: a.id, status: 'paused', fans: 50_000, bio: 'snap: compte.pause | 📍 Lyon', lang: 'fr', country: 'FR', medianViews: 80_000, videosSeen: 30,
      lastPostAt: NOW - DAY, posts7d: 3, igHandle: 'compte.pause', igFans: null, igMedianViews: null, addedAt: NOW - 50 * DAY, proof: { by: 'handle', cites: 3, of: 30 } });
    for (let k = 0; k < 6; k++) {
      vid += 1n;
      trackedVideos.push({ id: `tv-${vid}`, accountId: id, appId: a.id, platform: 'tiktok', videoId: String(vid), publishedAt: NOW - (k + 1) * DAY, views: 9_000_000 + k,
        snapshots: [], caption: 'Pause', hook: 'Pause', hookKey: null, musicTitle: null, coverUrl: null, region: 'FR', cites: true });
    }
  }
  // Formats : 170 actifs (3 comptes ou plus, repris dans les 21 jours), plus 20 anciens (60 jours) que des comptes citent.
  const formats = [];
  const vids = trackedVideos.filter((v) => NOW - v.publishedAt < 30 * DAY && v.accountId !== 'acc-pause');
  for (let f = 0; f < 190; f++) {
    const old = f >= 170;
    const members = [];
    for (let m = 0; m < 3 + (f % 4); m++) {
      const v = vids[Math.floor(r() * vids.length)];
      const t = tracked.find((x) => x.id === v.accountId);
      members.push({ accountId: v.accountId, handle: t.handle, appId: v.appId, videoId: v.videoId, publishedAt: old ? NOW - 60 * DAY : v.publishedAt, views: v.views, multiplier: Math.round(r() * 40) / 10 });
    }
    const appIds = [...new Set(members.map((m) => m.appId))];
    formats.push({ id: `fmt-${f}`, kind: f % 5 ? 'hook' : 'sound', key: `k${f}`, label: `Format ${f}`, members, accountCount: new Set(members.map((m) => m.accountId)).size,
      appIds, maxViews: Math.max(...members.map((m) => m.views)), lastPostAt: old ? NOW - 60 * DAY : NOW - DAY, firstSeenAt: NOW - (f % 9) * DAY, lang: 'fr' });
  }
  // Signaux : 12 vidéos qui décollent, sous des apps actives, en pause et fusionnée.
  for (let s = 0; s < 12; s++) {
    const v = vids[s * 7];
    const t = tracked.find((x) => x.id === v.accountId);
    // Le signal n°3 porte un lien piégé (audit S34) : la page vidéo doit reconstruire le lien TikTok.
    signals.push({ id: `sig-${s}`, platform: 'tiktok', videoId: v.videoId, url: s === 3 ? 'javascript:alert(document.cookie)' : `https://www.tiktok.com/@${t.handle}/video/${v.videoId}`, authorHandle: t.handle, authorFans: t.fans,
      caption: 'Signal', lang: 'fr', region: 'FR', publishedAt: NOW - 2 * DAY, durationSec: 20, coverUrl: null, views: v.views, likes: 10, comments: 2, shares: 1, saves: 1, ratio: 0.1,
      snapshots: [], appId: v.appId, appName: null, trackedAccountId: t.id, multiplier: 5 + s, hook: 'Ça décolle', musicTitle: null, transcript: null, unavailable: null, cites: true });
  }
  return { apps, tracked, trackedVideos, formats, signals };
}

/** Les options de la synchro (radarSync.ts, boardOpts) pour un magasin d'images donné. */
export function syncOpts({ media = {}, misses = new Map(), site = SITE, ...rest } = {}) {
  return {
    media,
    opts: {
      missing: (k) => (misses.get(k) ?? 0) > NOW - 3 * DAY,
      coverUrl: (id) => (/^(\d{6,25}|ig:[A-Za-z0-9_-]{5,40})$/.test(id) ? `${site}/cover/${id}` : null),
      ...rest,
    },
  };
}

/** Toutes les pages d'un passage complet (sans groupes), dans une Map clé → document. */
export function boardsOf(models, raw, { media = {}, opts = {} } = syncOpts()) {
  const res = models.buildBoards(raw, NOW, (k) => media[k] ?? (k.startsWith('icon:') ? `https://img.example/${k}.png` : null), () => null, opts);
  const docs = new Map(res.boards);
  for (const [k, f] of res.lazy) docs.set(k, f());
  return docs;
}

/** L'export et le magasin réels d'un dossier .bench-data (scripts/sync-bench/dump-*.mjs). */
export function realRaw(dir) {
  const lines = (f) => fs.readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const rowsOf = (t) => lines(path.join(dir, 'export', `${t}.jsonl`)).flatMap((p) => p.rows);
  const slim = (r) => ({ accountId: r.accountId, appId: r.appId, platform: r.platform, videoId: r.videoId, publishedAt: r.publishedAt, views: r.views,
    snapshots: Array.isArray(r.snapshots) ? r.snapshots.slice(-12) : [], caption: r.caption, hook: r.hook, musicTitle: r.musicTitle, coverUrl: null, region: r.region, cites: r.cites });
  const raw = { apps: rowsOf('apps'), tracked: rowsOf('tracked'), trackedVideos: rowsOf('trackedVideos').map(slim), formats: rowsOf('formats'), signals: rowsOf('signals') };
  const store = (fn) => lines(path.join(dir, 'store', `${fn}.jsonl`)).flatMap((p) => p.items);
  const media = Object.fromEntries(store('mediaPage'));
  const misses = new Map(store('missPage'));
  const regions = new Map(store('regionPage'));
  const slides = new Map(store('slidePage').filter(([, n]) => n >= 0));
  const ai = new Map(store('videoAiPage').filter((x) => x[3]).map(([id, type, text]) => [id, { type, text }]));
  const langs = new Map(store('langPage').map(([id, l]) => [id, l || null]));
  return { raw, store: syncOpts({ media, misses, regionOf: (h) => regions.get(h) ?? null, slidesOf: (id) => slides.get(id), aiOf: (id) => ai.get(id),
    langOf: (id) => (langs.has(id) ? langs.get(id) ?? null : undefined) }) };
}
