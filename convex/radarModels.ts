/**
 * Les données de chaque écran de l'app, calculées une fois par synchronisation à
 * partir de l'export du Radar (Jarvia, convex/swarmExport.ts). Fonctions pures :
 * aucun accès base ni réseau ici (cf convex/radarSync.ts).
 *
 * Chaque écran lit UN document (`boards`), déjà prêt : pas de calcul à l'affichage.
 * Les nombres restent bruts (vues, multiplicateurs, dates en ms) : la mise en forme
 * appartient aux écrans. Le contrat de chaque document est décrit dans
 * docs/donnees-app.md.
 */

// ─── Lignes de l'export ──────────────────────────────────────────────────────

export type Snapshot = { at: number; views: number };
export type RApp = { id: string; slug: string; name: string; status: string; trackedCount: number | null; mergedInto: string | null; createdAt: number };
export type RTracked = {
  id: string; handle: string; appId: string; status: string; fans: number; bio: string | null; lang: string | null;
  medianViews: number | null; videosSeen: number; lastPostAt: number | null; posts7d: number | null;
  igHandle: string | null; igFans: number | null; igMedianViews: number | null; addedAt: number;
};
export type RVideo = {
  id: string; accountId: string; appId: string; platform: "tiktok" | "instagram"; videoId: string; publishedAt: number;
  views: number; snapshots: Snapshot[]; caption: string | null; hook: string | null; hookKey: string | null;
  musicTitle: string | null; coverUrl: string | null;
};
export type RFormatMember = { accountId: string; handle: string; appId: string; videoId: string; publishedAt: number; views: number; multiplier?: number; hook?: string; platform?: string };
export type RFormat = {
  id: string; kind: "hook" | "sound"; key: string; label: string; members: RFormatMember[]; accountCount: number;
  appIds: string[]; maxViews: number; lastPostAt: number; firstSeenAt: number; lang: string | null;
};
export type RSignal = {
  id: string; platform: "tiktok" | "instagram"; videoId: string; url: string; authorHandle: string; authorFans: number;
  caption: string; lang: string; region: string | null; publishedAt: number; durationSec: number | null; coverUrl: string | null;
  views: number; likes: number; comments: number; shares: number; saves: number; ratio: number; snapshots: Snapshot[];
  appId: string | null; appName: string | null; trackedAccountId: string | null; multiplier: number | null; hook: string | null;
  musicTitle: string | null; transcript: string | null; unavailable: string | null;
};
export type Raw = { apps: RApp[]; tracked: RTracked[]; trackedVideos: RVideo[]; formats: RFormat[]; signals: RSignal[] };

// ─── Référentiels ────────────────────────────────────────────────────────────

const DAY = 86_400_000;
const WEEK = 7 * DAY;

/** Marché = langue des vidéos du compte (relevée par le Radar). */
export const MARKETS: ReadonlyArray<readonly [string, string]> = [
  ["FR", "France"], ["US", "États-Unis et anglophones"], ["MX", "Amérique latine"], ["ES", "Espagne"], ["BR", "Brésil et Portugal"], ["XX", "Autres langues"],
];
const LANG_MARKET: Record<string, string> = { fr: "FR", en: "US", "es-am": "MX", "es-es": "ES", pt: "BR" };
export const marketOf = (lang: string | null | undefined) => (lang && LANG_MARKET[lang]) || "XX";

/** Niche de chaque app (classement éditorial de Swarm ; le Radar n'en a pas). */
export const NICHES: Record<string, string> = {
  "Rizz App": "Séduction IA", "Astra AI": "Études", Knowunity: "Études", Love8: "Couple", WRizz: "Séduction IA", "Wing AI": "Séduction IA",
  "Cal AI": "Santé et physique", Praktika: "Langues", RecentFollow: "Jalousie et ex", "The Cringe": "Jalousie et ex", "Plug AI": "Séduction IA",
  Umax: "Santé et physique", "The Ick": "Jalousie et ex", FollowOtter: "Jalousie et ex", Shortfy: "Side hustle", Airbuds: "Social et loisirs",
  Sweatcoin: "Side hustle", "Voca AI": "Langues", Snitchy: "Jalousie et ex", Snitch: "Jalousie et ex", Fluencify: "Side hustle",
  "What Brandon Thinks": "Jalousie et ex", Flo: "Santé et physique", "Bible Chat": "Foi", Quittr: "Santé et physique", Creed: "Foi",
  Airlearn: "Langues", FollowSpy: "Jalousie et ex", "Retain Cards": "Études", "Glam AI": "Beauté IA", Shady: "Jalousie et ex",
  "Fit AI": "Santé et physique", Finch: "Santé et physique", Serializd: "Social et loisirs", "Rizz Master": "Séduction IA",
  CheatLove: "Jalousie et ex", Loverzz: "Couple", "Flert Now": "Séduction IA", Sunsay: "Autres", Stalkie: "Jalousie et ex", SafeNow: "Autres",
  Katch: "Jalousie et ex", Palima: "Autres", Lurk: "Jalousie et ex", TrendSaaS: "Side hustle", Susly: "Jalousie et ex",
  "Kairo Alarme": "Autres", "Leaked DMs": "Jalousie et ex", "Crush Tracker": "Jalousie et ex",
};
export const nicheOf = (name: string) => NICHES[name] ?? "Autres";

// ─── Outils ──────────────────────────────────────────────────────────────────

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
const groupBy = <T, K>(xs: T[], key: (x: T) => K) => {
  const m = new Map<K, T[]>();
  for (const x of xs) {
    const k = key(x);
    const l = m.get(k);
    if (l) l.push(x);
    else m.set(k, [x]);
  }
  return m;
};

/** Clé d'une miniature dans `media` : une par vidéo, une icône par app. */
export const coverKey = (videoId: string) => `v:${videoId}`;
export const iconKey = (slug: string) => `icon:${slug}`;

/** La bio sans les e-mails ni numéros de téléphone : Swarm montre ce que fait un compte, pas comment le contacter. */
export const cleanBio = (bio: string | null) => {
  if (!bio) return bio;
  const out = bio
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "")
    .replace(/\+?\(?\d[\d .()-]{7,}\d/g, (m) => (m.replace(/\D/g, "").length >= 9 ? "" : m)) // téléphone : 9 chiffres ou plus
    .replace(/[ \t]*[|·•,:;-]?[ \t]*(?:📧|✉️?|📩|📞|☎️?|📱)[ \t]*[|·•,:;-]?/gu, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]*[|·•,:;-][ \t]*$/gm, "")
    .trim();
  return out || null;
};

/** Une vidéo, telle que la voient les écrans (vignette, lecteur). */
export type VideoCard = { id: string; platform: string; handle: string; app: string | null; views: number; x: number | null; publishedAt: number; cover: string | null; hook: string | null };

// ─── Le calcul ───────────────────────────────────────────────────────────────

export type Boards = Map<string, unknown>;
export type MediaNeed = Map<string, string>; // clé media -> URL source (TikTok, signée)

export function buildBoards(
  raw: Raw,
  now: number,
  mediaUrl: (key: string) => string | null,
  storeOf: (slug: string) => string | null = () => null,
): { boards: Boards; need: MediaNeed; used: Set<string> } {
  const boards: Boards = new Map();
  const need: MediaNeed = new Map();
  const used = new Set<string>(); // clés media citées par un document : le reste peut être effacé

  // Apps : on suit les fusions, on écarte les apps en pause.
  const appById = new Map(raw.apps.map((a) => [a.id, a]));
  const canonical = (id: string | null | undefined): RApp | null => {
    let a = id ? appById.get(id) ?? null : null;
    for (let i = 0; a && a.mergedInto && i < 5; i++) a = appById.get(a.mergedInto) ?? a;
    return a;
  };
  const apps = raw.apps.filter((a) => !a.mergedInto && a.status === "active");
  const icon = (a: RApp) => (used.add(iconKey(a.slug)), mediaUrl(iconKey(a.slug)));

  const accounts = raw.tracked.filter((t) => t.status === "active");
  const accountById = new Map(raw.tracked.map((t) => [t.id, t]));
  const signalByVideo = new Map(raw.signals.filter((s) => !s.unavailable).map((s) => [s.videoId, s]));
  const trackedByVideo = new Map(raw.trackedVideos.map((v) => [v.videoId, v]));
  const trackedByHandle = new Map(raw.tracked.map((t) => [t.handle, t]));
  /** Une reprise d'un format que le Radar n'a pas dans ses vidéos suivies : sa page part de ce que le format en sait. */
  const memberVideo = (m: RFormatMember): RVideo => ({
    id: "", accountId: m.accountId, appId: m.appId, platform: m.platform === "instagram" ? "instagram" : "tiktok", videoId: m.videoId,
    publishedAt: m.publishedAt, views: m.views, snapshots: [], caption: null, hook: m.hook ?? null, hookKey: null, musicTitle: null, coverUrl: null,
  });

  // Une vidéo = le relevé du compte suivi, complété par le signal s'il y en a un.
  const xOf = (v: { views: number; accountId?: string | null }, s?: RSignal | null) => {
    if (s?.multiplier) return round(s.multiplier, 1);
    const acc = v.accountId ? accountById.get(v.accountId) : null;
    const med = acc?.medianViews;
    return med && med > 0 ? round(v.views / med, 1) : null;
  };
  const cover = (videoId: string, source: string | null | undefined) => {
    const key = coverKey(videoId);
    used.add(key);
    const stored = mediaUrl(key);
    if (stored) return stored;
    if (source) need.set(key, source);
    return source ?? null;
  };
  const card = (v: RVideo): VideoCard => {
    const s = signalByVideo.get(v.videoId);
    const acc = accountById.get(v.accountId);
    return {
      id: v.videoId,
      platform: v.platform,
      handle: acc?.handle ?? s?.authorHandle ?? "",
      app: canonical(v.appId)?.slug ?? null,
      views: Math.max(v.views, s?.views ?? 0),
      x: xOf(v, s),
      publishedAt: v.publishedAt,
      cover: cover(v.videoId, v.coverUrl ?? s?.coverUrl),
      hook: v.hook ?? s?.hook ?? null,
    };
  };

  const videosByApp = groupBy(raw.trackedVideos, (v) => canonical(v.appId)?.id ?? "");
  const videosByAccount = groupBy(raw.trackedVideos, (v) => v.accountId);
  const accountsByApp = groupBy(accounts, (t) => canonical(t.appId)?.id ?? "");
  const usedVideos = new Map<string, RVideo>();
  const use = (vs: RVideo[]) => vs.forEach((v) => usedVideos.set(v.videoId, v));

  // ── Apps : le classement, et la fiche de chaque app ──
  const appRows = apps.map((a) => {
    const vids = videosByApp.get(a.id) ?? [];
    const recent = vids.filter((v) => now - v.publishedAt <= 30 * DAY);
    const week = vids.filter((v) => now - v.publishedAt <= 7 * DAY);
    const weeks = Array.from({ length: 6 }, (_, i) => {
      const end = now - (5 - i) * WEEK;
      return vids.filter((v) => v.publishedAt > end - WEEK && v.publishedAt <= end).reduce((n, v) => n + v.views, 0);
    });
    const views30 = recent.reduce((n, v) => n + v.views, 0);
    const views30Ig = recent.filter((v) => v.platform === "instagram").reduce((n, v) => n + v.views, 0);
    const views7 = week.reduce((n, v) => n + v.views, 0);
    const views7Ig = week.filter((v) => v.platform === "instagram").reduce((n, v) => n + v.views, 0);
    const best = week.map((v) => xOf(v, signalByVideo.get(v.videoId))).filter((x): x is number => x !== null);
    const accs = accountsByApp.get(a.id) ?? [];
    const byAccount = [...groupBy(recent, (v) => v.accountId).values()].map((vs) => vs.reduce((n, v) => n + v.views, 0)).sort((p, q) => q - p);
    const markets = [...groupBy(recent, (v) => marketOf(accountById.get(v.accountId)?.lang)).entries()]
      .map(([m, vs]) => [m, views30 ? Math.round((vs.reduce((n, v) => n + v.views, 0) / views30) * 100) : 0] as [string, number])
      .filter(([, p]) => p > 0)
      .sort((p, q) => q[1] - p[1]);
    const top = [...recent].sort((p, q) => q.views - p.views);
    use(top.slice(0, 12));
    return {
      slug: a.slug, name: a.name, niche: nicheOf(a.name), icon: icon(a),
      accounts: accs.length, videosPerWeek: week.length,
      views30, views30Ig, views7, views7Ig, weeks,
      weekDelta: weeks[4] > 0 ? round((weeks[5] - weeks[4]) / weeks[4], 3) : null,
      bestX: best.length ? Math.max(...best) : null,
      top10Share: views30 ? round(byAccount.slice(0, 10).reduce((n, v) => n + v, 0) / views30, 3) : null,
      markets,
      trackedSince: a.createdAt,
      isNew: now - a.createdAt <= 14 * DAY,
      videoCount: recent.length,
      store: storeOf(a.slug),
      top: top.slice(0, 3).map(card),
      _top12: top.slice(0, 12),
      _accs: accs,
    };
  });
  const appsBoard = appRows.map(({ _top12, _accs, ...r }) => r).sort((p, q) => q.views30 - p.views30);
  boards.set("apps", { updatedAt: now, markets: MARKETS, niches: [...new Set(appsBoard.map((a) => a.niche))].sort(), apps: appsBoard });

  // ── Formats ──
  const accountX = (m: RFormatMember) => {
    if (typeof m.multiplier === "number") return round(m.multiplier, 1);
    const med = accountById.get(m.accountId)?.medianViews;
    return med && med > 0 ? round(m.views / med, 1) : null;
  };
  const appMini = (id: string) => {
    const a = canonical(id);
    return a ? { slug: a.slug, name: a.name, icon: icon(a) } : null;
  };
  const formatRows = raw.formats
    // Un format = repris par au moins 3 comptes : à 2, ce sont surtout des sons au hasard.
    .filter((f) => f.accountCount >= 3 && now - f.lastPostAt <= 21 * DAY)
    .map((f) => {
      const xs = f.members.map(accountX).filter((x): x is number => x !== null);
      const members = [...f.members].sort((p, q) => q.views - p.views).map((m) => {
        const tv = trackedByVideo.get(m.videoId);
        return {
          _video: tv ?? memberVideo(m), handle: m.handle, videoId: m.videoId, views: m.views, x: accountX(m), publishedAt: m.publishedAt, cover: cover(m.videoId, tv?.coverUrl ?? signalByVideo.get(m.videoId)?.coverUrl) };
      });
      const appsOf = [...new Set(f.appIds.map((id) => canonical(id)?.id).filter(Boolean) as string[])].map(appMini).filter(Boolean);
      return {
        id: f.id, kind: f.kind, label: f.label, accounts: f.accountCount, apps: appsOf,
        niche: appsOf[0] ? nicheOf(appsOf[0]!.name) : "Autres", market: marketOf(f.lang),
        maxViews: f.maxViews, medX: median(xs), wins: xs.filter((x) => x > 1).length, n: f.members.length,
        lastPostAt: f.lastPostAt, firstSeenAt: f.firstSeenAt, members,
      };
    })
    .sort((p, q) => q.accounts - p.accounts || (q.medX ?? 0) - (p.medX ?? 0));
  // Chaque reprise montrée mène à sa vidéo : elle a sa page dans le lecteur.
  const shown = formatRows.slice(0, 150);
  for (const f of shown) for (const m of f.members.slice(0, 30)) if (!usedVideos.has(m.videoId)) usedVideos.set(m.videoId, m._video);
  const plain = (ms: (typeof formatRows)[number]["members"]) => ms.map(({ _video, ...m }) => m);
  boards.set("formats", { updatedAt: now, markets: MARKETS, formats: shown.map((f) => ({ ...f, members: plain(f.members.slice(0, 4)) })) });
  for (const f of shown) boards.set(`format:${f.id}`, { updatedAt: now, ...f, members: plain(f.members.slice(0, 30)) });
  const formatsByAccount = groupBy(
    raw.formats.flatMap((f) => f.members.map((m) => ({ accountId: m.accountId, f }))),
    (x) => x.accountId,
  );

  // ── Créateurs, par marché, et la fiche de chaque créateur ──
  const creatorRow = (t: RTracked) => {
    const vids = (videosByAccount.get(t.id) ?? []).sort((p, q) => q.publishedAt - p.publishedAt);
    const best = [...vids].filter((v) => now - v.publishedAt <= 30 * DAY).sort((p, q) => q.views - p.views).slice(0, 3);
    use(best);
    const a = canonical(t.appId);
    return {
      handle: t.handle, bio: cleanBio(t.bio), fans: t.fans, median: t.medianViews, posts7d: t.posts7d ?? 0, lastPostAt: t.lastPostAt,
      market: marketOf(t.lang), app: a ? { slug: a.slug, name: a.name, icon: icon(a), niche: nicheOf(a.name) } : null,
      igHandle: t.igHandle, best: best.map(card), _vids: vids,
    };
  };
  const creators = accounts.filter((t) => (t.medianViews ?? 0) > 0).map(creatorRow).sort((p, q) => (q.median ?? 0) - (p.median ?? 0));
  for (const [code] of MARKETS) {
    const list = creators.filter((c) => c.market === code).slice(0, 200).map(({ _vids, ...c }) => c);
    boards.set(`creators:${code}`, { updatedAt: now, market: code, total: creators.filter((c) => c.market === code).length, creators: list });
  }
  boards.set("creators:ALL", { updatedAt: now, market: "ALL", total: creators.length, creators: creators.slice(0, 200).map(({ _vids, ...c }) => c) });
  const creatorPages = new Set(MARKETS.flatMap(([code]) => creators.filter((c) => c.market === code).slice(0, 200).map((c) => c.handle)));
  for (const c of creators) {
    if (!creatorPages.has(c.handle)) continue;
    const t = trackedByHandle.get(c.handle)!;
    const vids = c._vids.slice(0, 15);
    use(vids);
    const fmts = (formatsByAccount.get(t.id) ?? []).map((x) => x.f).filter((f, i, arr) => arr.indexOf(f) === i && f.accountCount >= 3);
    const { _vids, ...row } = c;
    boards.set(`creator:${c.handle}`, {
      updatedAt: now, ...row,
      videos: vids.map(card),
      formats: fmts.slice(0, 10).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accountCount })),
    });
  }

  // ── Fiche de chaque app (après les formats et créateurs, qu'elle cite) ──
  for (const r of appRows) {
    const a = apps.find((x) => x.slug === r.slug)!;
    const appCreators = r._accs
      .filter((t) => (t.medianViews ?? 0) > 0)
      .sort((p, q) => (q.medianViews ?? 0) - (p.medianViews ?? 0))
      .slice(0, 10)
      .map((t) => ({ handle: t.handle, fans: t.fans, median: t.medianViews, posts7d: t.posts7d ?? 0, market: marketOf(t.lang), page: creatorPages.has(t.handle) }));
    const appFormats = formatRows.filter((f) => f.apps.some((x) => x?.slug === a.slug)).slice(0, 8).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accounts, medX: f.medX, maxViews: f.maxViews }));
    const { _top12, _accs, ...row } = r;
    boards.set(`app:${a.slug}`, { updatedAt: now, ...row, videos: _top12.map(card), formats: appFormats, creators: appCreators });
  }

  // ── Vidéos qui décollent : alertes et accueil ──
  const hot = raw.signals
    .filter((s) => !s.unavailable && s.multiplier && now - s.publishedAt <= 7 * DAY)
    .sort((p, q) => (q.multiplier ?? 0) - (p.multiplier ?? 0));
  const hotCards = hot.slice(0, 40).map((s) => {
    const a = canonical(s.appId);
    return {
      id: s.videoId, platform: s.platform, handle: s.authorHandle, app: a ? { slug: a.slug, name: a.name, icon: icon(a) } : null,
      views: s.views, x: round(s.multiplier ?? 0, 1), publishedAt: s.publishedAt, cover: cover(s.videoId, s.coverUrl), hook: s.hook,
      market: marketOf(s.lang), region: s.region,
    };
  });
  const newFormats = formatRows.filter((f) => f.accounts >= 3 && now - f.firstSeenAt <= 7 * DAY).slice(0, 20);
  boards.set("alerts", { updatedAt: now, videos: hotCards, formats: newFormats.map((f) => ({ ...f, members: plain(f.members.slice(0, 3)) })) });
  const nicheViews = [...groupBy(appsBoard, (a) => a.niche).entries()].map(([n, as]) => [n, as.reduce((s, a) => s + a.views7, 0)] as [string, number]).sort((p, q) => q[1] - p[1]);
  boards.set("home", {
    updatedAt: now,
    niches: nicheViews.filter(([n]) => n !== "Autres").slice(0, 6).map(([n]) => n),
    apps: appsBoard.slice(0, 4).map((a) => ({ slug: a.slug, name: a.name, icon: a.icon, views7: a.views7, weekDelta: a.weekDelta, bestX: a.bestX })),
    videos: hotCards.slice(0, 4),
    formats: formatRows.slice(0, 3).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accounts, medX: f.medX })),
  });

  // ── Recherche (palette) : un index léger ──
  boards.set("search", {
    updatedAt: now,
    apps: appsBoard.map((a) => ({ slug: a.slug, name: a.name, icon: a.icon, niche: a.niche, views30: a.views30 })),
    creators: creators.filter((c) => creatorPages.has(c.handle)).map((c) => ({ handle: c.handle, app: c.app?.name ?? null, fans: c.fans, median: c.median })),
    formats: formatRows.slice(0, 150).map((f) => ({ id: f.id, kind: f.kind, label: f.label, accounts: f.accounts })),
  });

  // ── Lecteur : une page par vidéo citée ailleurs ──
  for (const s of hot.slice(0, 40)) {
    const tv = trackedByVideo.get(s.videoId);
    if (tv) usedVideos.set(tv.videoId, tv);
  }
  for (const v of usedVideos.values()) boards.set(`video:${v.videoId}`, videoPage(v, signalByVideo.get(v.videoId) ?? null));
  for (const s of hot.slice(0, 40)) if (!usedVideos.has(s.videoId)) boards.set(`video:${s.videoId}`, videoPage(null, s));

  function videoPage(v: RVideo | null, s: RSignal | null) {
    const acc = v ? accountById.get(v.accountId) : s?.trackedAccountId ? accountById.get(s.trackedAccountId) : undefined;
    const a = canonical(v?.appId ?? s?.appId ?? null);
    const id = (v?.videoId ?? s?.videoId)!;
    const views = Math.max(v?.views ?? 0, s?.views ?? 0);
    const handle = acc?.handle ?? s?.authorHandle ?? "";
    const platform = v?.platform ?? s?.platform ?? "tiktok";
    const playlist = a ? ((boards.get(`app:${a.slug}`) as { videos?: VideoCard[] } | undefined)?.videos ?? []).map((c) => c.id) : [];
    return {
      updatedAt: now, id, platform,
      url: s?.url ?? (platform === "instagram" ? `https://www.instagram.com/reel/${id.replace(/^ig:/, "")}/` : `https://www.tiktok.com/@${handle}/video/${id}`),
      handle, fans: acc?.fans ?? s?.authorFans ?? null, normal: acc?.medianViews ?? null,
      app: a ? { slug: a.slug, name: a.name, icon: icon(a), niche: nicheOf(a.name) } : null,
      market: marketOf(acc?.lang ?? s?.lang), region: s?.region ?? null,
      publishedAt: v?.publishedAt ?? s?.publishedAt ?? null, durationSec: s?.durationSec ?? null,
      views, x: v ? xOf(v, s) : s?.multiplier ? round(s.multiplier, 1) : null,
      likes: s?.likes ?? null, comments: s?.comments ?? null, shares: s?.shares ?? null, saves: s?.saves ?? null,
      snapshots: (s?.snapshots?.length ? s.snapshots : v?.snapshots ?? []).slice(-12),
      hook: v?.hook ?? s?.hook ?? null, caption: v?.caption ?? s?.caption ?? null, transcript: s?.transcript ?? null,
      music: v?.musicTitle ?? s?.musicTitle ?? null,
      cover: cover(id, v?.coverUrl ?? s?.coverUrl),
      playlist,
    };
  }

  // Icônes des apps : à chercher si on ne les a pas encore.
  for (const a of apps) if (!mediaUrl(iconKey(a.slug))) need.set(iconKey(a.slug), `itunes:${a.name}`);

  return { boards, need, used };
}
