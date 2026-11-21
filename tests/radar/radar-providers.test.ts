import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { NO_SPEND, PassBook, makeRouter, passGate, passProvider, posteProvider, posteProviders, tikhubJobs, type Router } from "../../convex/radar/radarProviders";
import { networkPasses } from "../../convex/radar/radarNetworkMath";
import { claimFallback, type JobState } from "../../convex/radar/radarSignals";
import { handlerOf, writableDb } from "./action-ctx";
import { DEFAULT_BUDGET, SC_PRICE_PER_CREDIT, TH_PRICE_USD } from "../../convex/radar/radarSignalsMath";
import { scProfileVideosPage } from "../../convex/radar/scrapeCreatorsApi";
import { TH_ROUTES, thProfilePage } from "../../convex/radar/tikhubApi";

/**
 * L'aiguillage entre ScrapeCreators et TikHub (20/11/2026) : le réglage, et le fournisseur de chaque passe du réseau.
 */

const env = (radar?: string, key = true) => ({ ...(key ? { TIKHUB_API_KEY: "cle" } : {}), ...(radar !== undefined ? { RADAR_TIKHUB: radar } : {}) });
const jobs = (radar: string) => tikhubJobs(env(radar));

describe("réglage RADAR_TIKHUB", () => {
  it("all = relevés, courbe, réseau (sans découverte ni tournures)", () => {
    expect([...jobs("all")].sort()).toEqual(["curve", "network", "tiktok"]);
  });

  it("casse, espaces, jeton inconnu et « naming » ignorés", () => {
    expect([...jobs(" Curve , TIKTOK,naming,pubs,, ")].sort()).toEqual(["curve", "tiktok"]);
    expect([...jobs("search,network-all")].sort()).toEqual(["network-all", "search"]);
  });

  it("sans la variable, ou sans la clé : rien chez TikHub", () => {
    expect(tikhubJobs(env(undefined)).size).toBe(0);
    expect(tikhubJobs(env("all", false)).size).toBe(0);
    expect(tikhubJobs(env("")).size).toBe(0);
    expect(posteProviders(tikhubJobs(env("all", false)))).toEqual({});
  });

  it("le fournisseur de chaque poste", () => {
    expect(posteProviders(jobs("all"))).toEqual({ tiktok: "tikhub", curve: "tikhub", network: "tikhub" });
    expect(posteProviders(jobs("network-all,search"))).toEqual({ network: "tikhub", search: "tikhub" });
  });
});

describe("passes du réseau", () => {
  const passes = networkPasses(["#focustown", "focus town"], true);
  const of = (radar: string) => passes.map((p) => [p.kind, p.region, p.sort ?? "-", passProvider(p, jobs(radar))]);

  it("network : hashtag sans région et mot-clé FR par pertinence chez TikHub ; le reste chez ScrapeCreators", () => {
    expect(of("network")).toEqual([
      ["hashtag", null, "-", { provider: "tikhub" }],
      ["hashtag", "FR", "-", { provider: "sc" }],
      ["keyword", null, "-", { provider: "sc" }],
      ["keyword", "FR", "-", { provider: "tikhub", region: "FR" }],
      ["keyword", null, "date", { provider: "sc" }],
      ["keyword", "FR", "date", { provider: "sc" }],
    ]);
  });

  it("network-all : en plus, le mot-clé sans région (envoyé en US) et le hashtag FR ; les passes par date restent chez ScrapeCreators", () => {
    expect(of("network-all")).toEqual([
      ["hashtag", null, "-", { provider: "tikhub" }],
      ["hashtag", "FR", "-", { provider: "tikhub", region: "FR" }],
      ["keyword", null, "-", { provider: "tikhub", region: "US" }],
      ["keyword", "FR", "-", { provider: "tikhub", region: "FR" }],
      ["keyword", null, "date", { provider: "sc" }],
      ["keyword", "FR", "date", { provider: "sc" }],
    ]);
  });

  it("sans réglage réseau : tout chez ScrapeCreators", () => {
    expect(of("tiktok,curve").every((r) => (r[3] as { provider: string }).provider === "sc")).toBe(true);
  });
});

// ─── L'aiguilleur d'un passage ───────────────────────────────────────────────────────────────────────────────────

describe("aiguilleur : bascule absente", () => {
  const scKey = "cle-sc-de-test";
  const cases: [string, Record<string, string>][] = [
    ["variable absente", {}],
    ["variable sans clé", { RADAR_TIKHUB: "all,search,network-all" }],
    ["clé sans variable", { TIKHUB_API_KEY: "cle-th" }],
  ];
  for (const [nom, extra] of cases) {
    it(`${nom} : mêmes appels ScrapeCreators et même valeur que l'appel direct, aucun appel TikHub (solde compris)`, async () => {
      await withEnv({ SCRAPECREATORS_API_KEY: scKey, ...extra }, async () => {
        const jobs = tikhubJobs();
        for (const poste of ["tiktok", "curve", "search", "network"] as const) {
          const direct = fetchLog(scAnswer);
          vi.stubGlobal("fetch", direct.impl);
          const want = await scProfileVideosPage("auteur_01", "17");
          const routed = fetchLog(scAnswer);
          vi.stubGlobal("fetch", routed.impl);
          const book = new PassBook();
          const r = makeRouter({ poste, jobs, st: jobStateFor(), book, start: NOW, claimFallback: claimOk });
          await r.open();
          const got = await r.route(posteProvider(jobs, poste), (o) => thProfilePage("auteur_01", "17", o), () => scProfileVideosPage("auteur_01", "17"), { route: TH_ROUTES.profile, firstPage: true, scBudget: () => true });
          await r.close();
          expect(routed.calls).toEqual(direct.calls);
          expect(routed.calls.every((c) => c.url.startsWith("https://api.scrapecreators.com/") && c.key === scKey && c.auth === null)).toBe(true);
          expect(got.ok && want.ok && got.value).toEqual(want.ok && want.value);
          expect(got.spend).toEqual({ sc: 1, th: 0, usd: 0, unknown: 0, fallback: 0 });
          expect(book.thArgs()).toEqual({});
          expect(r.expired()).toBe(false);
        }
      });
    });
  }
});

describe("aiguilleur : TikHub, repli, coupe-circuit, échéance", () => {
  const on = { SCRAPECREATORS_API_KEY: "cle-sc", TIKHUB_API_KEY: "cle-th", RADAR_TIKHUB: "all" };
  const profile = (r: Router, firstPage = true, scBudget = () => true) =>
    r.route("tikhub", (o) => thProfilePage("auteur_01", undefined, o), () => scProfileVideosPage("auteur_01"), { route: TH_ROUTES.profile, firstPage, scBudget });

  it("servi par TikHub : aucun crédit, un appel au prix de la route", async () => {
    await withEnv(on, async () => {
      const f = fetchLog(thAnswer({ profile: [200, fixture("tikhub/profil.json")] }));
      vi.stubGlobal("fetch", f.impl);
      const book = new PassBook();
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor(), book, start: NOW, claimFallback: claimOk });
      await r.open();
      const got = await profile(r);
      expect(got.ok && got.served).toBe("tikhub");
      expect(got.spend).toEqual({ sc: 0, th: 1, usd: 0.001, unknown: 0, fallback: 0 });
      expect(f.calls.filter((c) => c.url.includes("api.scrapecreators.com"))).toHaveLength(0);
      expect(f.calls.every((c) => c.key === null)).toBe(true);
    });
  });

  it("en tête de passage : solde lu s'il a plus d'une minute, tarifs s'ils ont plus d'un jour ; le budget voit ce solde", async () => {
    await withEnv(on, async () => {
      const f = fetchLog(thAnswer({}));
      vi.stubGlobal("fetch", f.impl);
      const book = new PassBook();
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: { paidUsd: 1, freeUsd: 0, seenAt: NOW - 61_000, spentSinceUsd: 0, perDay: null }, thPricesAt: NOW - 86_400_000 }), book, start: NOW, claimFallback: claimOk });
      const b = await r.open();
      expect(f.calls.map((c) => new URL(c.url).pathname)).toEqual([TH_ROUTES.prices, TH_ROUTES.balance]);
      expect(b.th.paidLeft).toBe(5_400);
      expect(book.thArgs()).toMatchObject({ thBalanceUsd: 5.4, thFreeUsd: 0.021, thSeenAt: NOW, thSpentAfterUsd: 0 });
      // Lu il y a 59 s, tarifs d'il y a une heure : rien n'est relu.
      const g = fetchLog(thAnswer({}));
      vi.stubGlobal("fetch", g.impl);
      await makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: { paidUsd: 1, freeUsd: 0, seenAt: NOW - 59_000, spentSinceUsd: 0, perDay: null }, thPricesAt: NOW - 3_600_000 }), book: new PassBook(), start: NOW, claimFallback: claimOk }).open();
      expect(g.calls).toEqual([]);
    });
  });

  it("le solde lu est daté de l'ENVOI de la demande, la dépense « avant lecture » prise à ce moment : une borne basse même si des appels finissent pendant la lecture", async () => {
    await withEnv(on, async () => {
      let t = NOW;
      const book = new PassBook();
      // 0,01 $ dépensés avant la lecture.
      book.add({ sc: 0, th: 10, usd: 0.01, unknown: 0, fallback: 0 });
      const f = fetchLog((url) => {
        if (url.includes(TH_ROUTES.balance)) {
          // La lecture prend 5 s ; un appel lancé en parallèle finit pendant ce temps (0,005 $) : TikHub l'a peut-être
          // facturé après avoir lu le solde.
          t += 5_000;
          book.add({ sc: 0, th: 5, usd: 0.005, unknown: 0, fallback: 0 });
        }
        return thAnswer({})(url);
      });
      vi.stubGlobal("fetch", f.impl);
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: { ...freshTh(), seenAt: NOW - 120_000 } }), book, start: NOW, claimFallback: claimOk, clock: () => t });
      await r.open();
      expect(book.thArgs()).toMatchObject({ thSeenAt: NOW, thBalanceUsd: 5.4 });
      expect(book.thArgs().thSpentAfterUsd).toBeCloseTo(0.005, 9);
    });
  });

  it("402 : aucun solde tiré du refus — il est relu (gratuit) — et l'appel repasse par ScrapeCreators si la porte le permet", async () => {
    await withEnv(on, async () => {
      const f = fetchLog(thAnswer({ profile: [402, synth().refus402], balance: [200, { user_data: { balance: 0, free_credit: 0.02 } }] }));
      vi.stubGlobal("fetch", f.impl);
      const book = new PassBook();
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh() }), book, start: NOW, claimFallback: claimOk, clock: () => NOW + 5_000 });
      await r.open();
      const got = await profile(r);
      book.add(got.spend);
      expect(got.ok && got.served).toBe("sc");
      expect(got.spend).toEqual({ sc: 1, th: 0, usd: 0, unknown: 0, fallback: 1 });
      expect(f.calls.map((c) => new URL(c.url).pathname)).toEqual([TH_ROUTES.profile, TH_ROUTES.balance, "/v3/tiktok/profile/videos"]);
      expect(book.thArgs()).toMatchObject({ thFallbacks: 1, thBalanceUsd: 0, thFreeUsd: 0.02, thDryRoute: TH_ROUTES.profile });
      expect(book.credits).toBe(1);
      expect(book.thCalls).toBe(0);
      // À sec : en panne pour le reste du passage, plus aucun appel TikHub.
      expect(r.down()).toContain("402");
      await profile(r);
      expect(f.calls.filter((c) => c.url.includes(TH_ROUTES.profile))).toHaveLength(1);
    });
  });

  const refused: [string, Partial<Parameters<typeof jobStateFor>[0]>, boolean, number?][] = [
    ["ScrapeCreators au palier économie", { balance: { remaining: 1_500 + 3_000, seenAt: NOW, now: NOW, perDay: 2_000 } }, true],
    ["solde ScrapeCreators jamais lu", { balance: null }, true],
    ["quota de replis du jour atteint", { fallbacksToday: 100 }, true],
    ["page 2 d'une pagination", {}, false],
    ["moins de 90 s avant l'échéance", {}, true, 8 * 60_000 - 89_000],
  ];
  for (const [nom, st, firstPage, at] of refused) {
    it(`pas de repli : ${nom} — échec passager, rien chez ScrapeCreators`, async () => {
      await withEnv(on, async () => {
        const f = fetchLog(thAnswer({ profile: [500, synth().refus500] }));
        vi.stubGlobal("fetch", f.impl);
        const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh(), ...st }), book: new PassBook(), start: NOW, claimFallback: claimOk, clock: () => NOW + (at ?? 0), sleep: async () => undefined });
        await r.open();
        const got = await profile(r, firstPage);
        expect(got).toMatchObject({ ok: false, transient: true, served: "tikhub" });
        expect(f.calls.filter((c) => c.url.includes("api.scrapecreators.com"))).toHaveLength(0);
      });
    });
  }

  it("pas de repli quand le budget ScrapeCreators du poste est épuisé", async () => {
    await withEnv(on, async () => {
      vi.stubGlobal("fetch", fetchLog(thAnswer({ profile: [500, synth().refus500] })).impl);
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh() }), book: new PassBook(), start: NOW, claimFallback: claimOk, sleep: async () => undefined });
      await r.open();
      expect(await profile(r, true, () => false)).toMatchObject({ ok: false, transient: true });
    });
  });

  it("un refus de TikTok (status_code ≠ 0) sans repli reste un échec du compte (facturé), pas un échec passager", async () => {
    await withEnv(on, async () => {
      vi.stubGlobal("fetch", fetchLog(thAnswer({ profile: [200, synth().upstream] })).impl);
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh(), fallbacksToday: 100 }), book: new PassBook(), start: NOW, claimFallback: claimOk });
      await r.open();
      expect(await profile(r)).toMatchObject({ ok: false, transient: false, spend: { th: 1, usd: 0.001 } });
    });
  });

  // Un refus 4xx de TikHub (`bad`) dit que la REQUÊTE ou la route est refusée, jamais que le compte pose problème : un
  // compte inexistant y répond 200 « No more videos » (bench/raw/th-compte-inexistant-200.json, 20/11/2026). Réponse
  // 404 synthétique (aucun 4xx de TikHub n'a été capturé au banc) : sa forme est celle des refus 401/402 mesurés.
  const refus404 = { detail: { code: 404, message: "Not Found" } };

  it("un refus 4xx de TikHub (`bad`), repli permis : la page repasse par ScrapeCreators, comptée comme un repli", async () => {
    await withEnv(on, async () => {
      const f = fetchLog(thAnswer({ profile: [404, refus404] }));
      vi.stubGlobal("fetch", f.impl);
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh() }), book: new PassBook(), start: NOW, claimFallback: claimOk });
      await r.open();
      expect(await profile(r)).toMatchObject({ ok: true, served: "sc", spend: { sc: 1, th: 0, fallback: 1 } });
      expect(f.calls.filter((c) => c.url.includes("api.scrapecreators.com"))).toHaveLength(1);
    });
  });

  it("un refus 4xx de TikHub (`bad`), sans repli : un échec passager (rien n'est conclu sur le compte) ; trois d'affilée : TikHub en panne pour le passage", async () => {
    await withEnv(on, async () => {
      const f = fetchLog(thAnswer({ profile: [404, refus404] }));
      vi.stubGlobal("fetch", f.impl);
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh(), fallbacksToday: 100 }), book: new PassBook(), start: NOW, claimFallback: claimOk });
      await r.open();
      for (let i = 0; i < 2; i++) {
        expect(await profile(r)).toMatchObject({ ok: false, transient: true, thFailed: true, served: "tikhub", spend: { sc: 0, fallback: 0 } });
        expect(r.down()).toBeNull();
      }
      expect(await profile(r)).toMatchObject({ ok: false, transient: true, thFailed: true });
      expect(r.down()).toContain("3 échecs TikHub d'affilée");
      // Un 4xx n'est pas redemandé (seuls 429 et 5xx le sont) : un appel chacun, rien chez ScrapeCreators.
      expect(f.calls.filter((c) => c.url.includes(TH_ROUTES.profile))).toHaveLength(3);
      expect(f.calls.filter((c) => c.url.includes("api.scrapecreators.com"))).toHaveLength(0);
    });
  });

  it("coupe-circuit : clé refusée (401) = en panne tout de suite", async () => {
    await withEnv(on, async () => {
      vi.stubGlobal("fetch", fetchLog(thAnswer({ profile: [401, synth().refus401] })).impl);
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh(), fallbacksToday: 100 }), book: new PassBook(), start: NOW, claimFallback: claimOk });
      await r.open();
      await profile(r);
      expect(r.down()).toContain("401");
    });
  });

  it("coupe-circuit : un 5xx est redemandé une fois après 2 s, un 429 aussi ; trois échecs d'affilée = en panne", async () => {
    await withEnv(on, async () => {
      let n = 0;
      const f = fetchLog((url) => {
        if (url.includes(TH_ROUTES.profile)) return n++ % 2 === 0 ? [500, synth().refus500] : [429, synth().refus429];
        return thAnswer({})(url);
      });
      vi.stubGlobal("fetch", f.impl);
      const pauses: number[] = [];
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh(), fallbacksToday: 100 }), book: new PassBook(), start: NOW, claimFallback: claimOk, sleep: async (ms) => void pauses.push(ms) });
      await r.open();
      await profile(r);
      expect(f.calls.filter((c) => c.url.includes(TH_ROUTES.profile))).toHaveLength(2);
      expect(pauses).toEqual([2_000]);
      expect(r.down()).toBeNull();
      await profile(r);
      expect(r.down()).toBeNull();
      await profile(r);
      expect(r.down()).toContain("3 échecs TikHub d'affilée");
      expect(f.calls.filter((c) => c.url.includes(TH_ROUTES.profile))).toHaveLength(6);
      // En panne, il le reste pour tout le passage : plus aucun appel TikHub ne part, même s'il répondrait.
      const g = fetchLog(thAnswer({ profile: [200, fixture("tikhub/profil.json")] }));
      vi.stubGlobal("fetch", g.impl);
      expect((await profile(r)).ok).toBe(false);
      expect(g.calls.filter((c) => c.url.includes(TH_ROUTES.profile))).toHaveLength(0);
    });
  });

  it("coupe-circuit : un succès remet le compte à zéro — échec, échec, succès, échec : pas en panne ; deux échecs de plus : en panne", async () => {
    await withEnv(on, async () => {
      // Les réponses de la route du profil, dans l'ordre ; un échec en prend deux (un 5xx est redemandé une fois).
      const replies: [number, unknown][] = [];
      const ko = () => replies.push([500, synth().refus500], [500, synth().refus500]);
      const ok = () => replies.push([200, fixture("tikhub/profil.json")]);
      ko();
      ko();
      ok();
      ko();
      ko();
      ko();
      const f = fetchLog((url) => (url.includes(TH_ROUTES.profile) ? replies.shift()! : thAnswer({})(url)));
      vi.stubGlobal("fetch", f.impl);
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh(), fallbacksToday: 100 }), book: new PassBook(), start: NOW, claimFallback: claimOk, sleep: async () => undefined });
      await r.open();
      const outcomes: boolean[] = [];
      for (let i = 0; i < 4; i++) outcomes.push((await profile(r)).ok);
      expect(outcomes).toEqual([false, false, true, false]);
      expect(r.down()).toBeNull();
      await profile(r);
      expect(r.down()).toBeNull();
      await profile(r);
      expect(r.down()).toContain("3 échecs TikHub d'affilée");
      expect(replies).toHaveLength(0);
    });
  });

  it("porte de repli : le quota du jour compte les replis faits PENDANT le passage — 99 avant lui, un seul repli de plus", async () => {
    await withEnv(on, async () => {
      const f = fetchLog(thAnswer({ profile: [500, synth().refus500] }));
      vi.stubGlobal("fetch", f.impl);
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh(), fallbacksToday: 99 }), book: new PassBook(), start: NOW, claimFallback: claimOk, sleep: async () => undefined });
      await r.open();
      expect(r.fallbackRoom()).toBe(1);
      expect(await profile(r)).toMatchObject({ ok: true, served: "sc", spend: { sc: 1, fallback: 1 } });
      expect(r.fallbackRoom()).toBe(0);
      // Le 100e repli du jour est fait : le deuxième échec TikHub n'est pas reporté sur ScrapeCreators.
      expect(await profile(r)).toMatchObject({ ok: false, transient: true, served: "tikhub", spend: { sc: 0, fallback: 0 } });
      expect(f.calls.filter((c) => c.url.includes("api.scrapecreators.com"))).toHaveLength(1);
      expect(f.calls.filter((c) => c.url.includes(TH_ROUTES.profile))).toHaveLength(4);
    });
  });

  // Deux passages en parallèle (à l'heure pile : relevés, réseau, recherches lancées par le suivi d'office, courbe),
  // partis du même état : 0 repli aujourd'hui. TikHub en panne, ScrapeCreators au palier normal. Corrigé le 20/11/2026 :
  // chacun comptait ses replis contre le quota du jour lu à son ouverture, sans voir ceux de l'autre — 200 à 400 appels
  // ScrapeCreators le même jour au lieu de 100, sur la clé que partagent les relevés de la paie de Jarvia.
  it("porte de repli : le quota du jour est tenu ENTRE les passages en parallèle — deux passages, 100 replis en tout", async () => {
    await withEnv(on, async () => {
      const f = fetchLog(thAnswer({ profile: [500, synth().refus500] }));
      vi.stubGlobal("fetch", f.impl);
      // La base des deux passages : le quota s'y prend (radarSignals.claimFallback). Convex exécute les mutations comme
      // si elles se suivaient (transactions sérialisables) : la base en mémoire les met en série.
      const w = writableDb({ radarSettings: [], radarUsage: [] });
      let serial: Promise<unknown> = Promise.resolve();
      const claim = () => {
        const p = serial.then(() => handlerOf(claimFallback)({ db: w.db }, { now: NOW }) as Promise<boolean>);
        serial = p.catch(() => undefined);
        return p;
      };
      const pass = () => makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh() }), book: new PassBook(), start: NOW, sleep: async () => undefined, claimFallback: claim });
      const routers = [pass(), pass()];
      for (const r of routers) await r.open();
      const served = await Promise.all(
        routers.map(async (r) => {
          let n = 0;
          for (let i = 0; i < 100; i++) if ((await profile(r)).ok) n++;
          return n;
        }),
      );
      expect(served[0] + served[1]).toBe(100);
      expect(f.calls.filter((c) => c.url.includes("api.scrapecreators.com"))).toHaveLength(100);
      // Quota atteint : plus de place pour un repli dans aucun des deux passages.
      expect(routers.map((r) => r.fallbackRoom())).toEqual([0, 0]);
    });
  });

  const closers: [string, () => Promise<boolean>][] = [
    ["une place refusée", async () => false],
    ["une prise qui échoue (base indisponible)", async () => Promise.reject(new Error("OptimisticConcurrencyControlFailure"))],
  ];
  for (const [nom, deny] of closers) {
    it(`porte de repli : ${nom} ferme la porte pour le reste du passage — un échec passager, une seule demande à la base`, async () => {
      await withEnv(on, async () => {
        const f = fetchLog(thAnswer({ profile: [500, synth().refus500] }));
        vi.stubGlobal("fetch", f.impl);
        let asked = 0;
        const claim = () => (asked++, deny());
        const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh() }), book: new PassBook(), start: NOW, sleep: async () => undefined, claimFallback: claim });
        await r.open();
        for (let i = 0; i < 5; i++) expect(await profile(r)).toMatchObject({ ok: false, transient: true, spend: { sc: 0, fallback: 0 } });
        expect(asked).toBe(1);
        expect(r.fallbackRoom()).toBe(0);
        expect(f.calls.filter((c) => c.url.includes("api.scrapecreators.com"))).toHaveLength(0);
      });
    });
  }

  it("budget du passage : la tâche de la courbe (non basculée) et celle des relevés (basculée) voient la même projection et les mêmes coupures", async () => {
    await withEnv({ ...on, RADAR_TIKHUB: "tiktok" }, async () => {
      vi.stubGlobal("fetch", fetchLog(thAnswer({})).impl);
      // Relevés payés chez ScrapeCreators jusqu'au 19, basculés chez TikHub : 84 % d'un plafond de 110 $ dépensés.
      const budget = {
        ...DEFAULT_BUDGET,
        capUsd: 110,
        postes: DEFAULT_BUDGET.postes.map((p) => (p.key === "tiktok" ? { ...p, qty: 2_000 } : p.key === "curve" ? { ...p, qty: 20 } : p.key === "search" ? { ...p, qty: 10 } : { ...p, on: false })),
      };
      const usage = Array.from({ length: 19 }, (_, i) => ({ poste: "tiktok", credits: 2_600, day: `2026-11-${String(i + 1).padStart(2, "0")}` }));
      const st = jobStateFor({ budget, usage, th: freshTh() });
      const view = (poste: "tiktok" | "curve" | "search") => makeRouter({ poste, jobs: tikhubJobs(), st, book: new PassBook(), start: NOW, claimFallback: claimOk }).open();
      const [tiktok, curve, search] = await Promise.all([view("tiktok"), view("curve"), view("search")]);
      for (const b of [curve, search]) {
        expect(b.projectedUsd).toBe(tiktok.projectedUsd);
        expect(b.capCut).toEqual(tiktok.capCut);
        expect(b.providers).toEqual(tiktok.providers);
      }
      expect(tiktok.capCut).toEqual([]);
    });
  });

  // Corrigé le 20/11/2026 : un appel parti dans les 30 dernières secondes avant « échéance − 30 s » voyait son délai
  // rogné à ce qui restait (500 ms à 7 min 29,5 s). TikHub répond en 1,8 s (banc du 20/11/2026) : l'appel était abandonné
  // par NOTRE échéance, compté comme un échec de TikHub (`thFailed`) au prix plein (facturation inconnue) — la vidéo
  // sortait de la courbe, le compte prenait une erreur de relevé, et trois de suite déclaraient TikHub en panne.
  // Désormais un appel ne part qu'avec son délai entier : sinon rien ne part, et rien n'est conclu.
  const LATENCY_MS = 1_800;
  /** TikHub répond en 1,8 s : un délai plus court abandonne l'appel, comme AbortSignal.timeout le ferait. */
  const slowTikHub = () => {
    const sent: number[] = [];
    vi.spyOn(AbortSignal, "timeout").mockImplementation((ms: number) => {
      const c = new AbortController();
      if (ms < LATENCY_MS) c.abort(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
      return c.signal;
    });
    const f = fetchLog(thAnswer({}));
    vi.stubGlobal("fetch", (async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).includes(TH_ROUTES.profile)) {
        sent.push(Date.now());
        if (init?.signal?.aborted) throw init.signal.reason;
      }
      return f.impl(input, init);
    }) as typeof fetch);
    return sent;
  };

  it("échéance : 8 minutes après le début ; un appel ne part qu'avec son délai entier (30 s), fini 30 s avant elle — après 7 minutes, rien ne part et rien n'est conclu", async () => {
    await withEnv(on, async () => {
      let t = NOW;
      slowTikHub();
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh(), fallbacksToday: 100 }), book: new PassBook(), start: NOW, claimFallback: claimOk, clock: () => t });
      await r.open();
      const timeouts: (number | undefined)[] = [];
      const call = () => r.route("tikhub", (o) => (timeouts.push(o.timeoutMs), thProfilePage("auteur_01", undefined, o)), () => scProfileVideosPage("auteur_01"), { route: TH_ROUTES.profile, firstPage: true, scBudget: () => true });
      t = NOW + 7 * 60_000;
      expect(r.expired()).toBe(false);
      expect((await call()).ok).toBe(true);
      expect(timeouts).toEqual([30_000]);
      // Une demi-seconde avant « échéance − 30 s » (le cas relevé en revue) : l'appel ne part pas.
      for (const at of [NOW + 7 * 60_000 + 1, NOW + 7 * 60_000 + 20_000, NOW + 7 * 60_000 + 29_500]) {
        t = at;
        expect(r.expired()).toBe(true);
        expect(await call()).toEqual({ ok: false, error: expect.stringContaining("échéance"), spend: { sc: 0, th: 0, usd: 0, unknown: 0, fallback: 0 }, served: "tikhub", noCredits: false, transient: true, thFailed: false });
      }
      expect(timeouts).toEqual([30_000]);
      expect(r.down()).toBeNull();
    });
  });

  it("échéance : un 5xx dont la nouvelle demande n'aurait plus son délai entier n'est pas redemandé, et n'est pas un échec de TikHub", async () => {
    await withEnv(on, async () => {
      let t = NOW + 6 * 60_000 + 59_000;
      const f = fetchLog(thAnswer({ profile: [500, synth().refus500] }));
      vi.stubGlobal("fetch", f.impl);
      const book = new PassBook();
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor({ th: freshTh(), fallbacksToday: 100 }), book, start: NOW, claimFallback: claimOk, clock: () => t, sleep: async (ms) => void (t += ms) });
      await r.open();
      const got = await profile(r);
      // Parti à 6 min 59 s avec 30 s de délai ; la nouvelle demande partirait à 7 min 01 s : elle ne part pas.
      expect(f.calls.filter((c) => c.url.includes(TH_ROUTES.profile))).toHaveLength(1);
      expect(got).toMatchObject({ ok: false, transient: true, thFailed: false });
      expect(r.down()).toBeNull();
      // Trois fois de suite : le coupe-circuit ne compte pas ce que l'échéance a empêché de conclure.
      for (let i = 0; i < 2; i++) {
        t = NOW + 6 * 60_000 + 59_000;
        await profile(r);
      }
      expect(r.down()).toBeNull();
    });
  });

  it("sans bascule pour la tâche : pas d'échéance", async () => {
    await withEnv({ ...on, RADAR_TIKHUB: "curve" }, async () => {
      let t = NOW;
      const r = makeRouter({ poste: "tiktok", jobs: tikhubJobs(), st: jobStateFor(), book: new PassBook(), start: NOW, claimFallback: claimOk, clock: () => t });
      t = NOW + 3_600_000;
      expect(r.on).toBe(false);
      expect(r.expired()).toBe(false);
    });
  });
});

// ─── Outils ───────────────────────────────────────────────────────────────────────────────────────────────────────
const NOW = Date.parse("2026-11-20T12:00:00Z");
const FIX = path.join(__dirname, "fixtures");
function fixture(name: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(path.join(FIX, name), "utf8"));
}
const synth = () => fixture("tikhub/synthetiques.json");
const freshTh = () => ({ paidUsd: 5.4, freeUsd: 0.021, seenAt: NOW - 1_000, spentSinceUsd: 0, perDay: null });
/** Un passage seul : la base accorde toujours la place demandée (le quota du jour se juge alors sur `fallbacksToday`). */
const claimOk = async () => true;

function jobStateFor(over: Partial<JobState> = {}): JobState {
  return {
    budget: DEFAULT_BUDGET,
    cursor: 0,
    usage: [],
    day: "2026-11-20",
    month: "2026-11",
    balance: { remaining: 40_000, seenAt: NOW - 60_000, now: NOW, perDay: 1_000 },
    creditAlerted: {},
    recentUsage: [],
    th: null,
    thPrices: null,
    thPricesAt: NOW,
    fallbacksToday: 0,
    ...over,
  };
}

type FetchCall = { url: string; key: string | null; auth: string | null };
function fetchLog(answer: (url: string) => [number, unknown]) {
  const calls: FetchCall[] = [];
  const impl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const h = (init?.headers ?? {}) as Record<string, string>;
    calls.push({ url, key: h["x-api-key"] ?? null, auth: h.Authorization ?? null });
    const [status, body] = answer(url);
    return new Response(JSON.stringify(body), { status });
  });
  return { impl, calls };
}
const scAnswer = (url: string): [number, unknown] =>
  url.includes("api.scrapecreators.com") ? [200, { ...fixture("sc/profil.json"), success: true, credits_charged: 1, credits_remaining: 30_000 }] : [599, {}];
const thAnswer =
  (routes: Partial<Record<"profile" | "balance", [number, unknown]>>) =>
  (url: string): [number, unknown] => {
    if (url.includes("api.scrapecreators.com")) return scAnswer(url);
    if (url.includes(TH_ROUTES.balance)) return routes.balance ?? [200, synth().solde];
    if (url.includes(TH_ROUTES.prices)) return [200, fixture("tikhub/tarifs.json")];
    if (url.includes(TH_ROUTES.profile)) return routes.profile ?? [200, fixture("tikhub/profil.json")];
    return [404, {}];
  };

async function withEnv(env: Record<string, string>, f: () => Promise<void>): Promise<void> {
  const keys = ["TIKHUB_API_KEY", "RADAR_TIKHUB", "SCRAPECREATORS_API_KEY"];
  const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  for (const k of keys) delete process.env[k];
  Object.assign(process.env, env);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  try {
    await f();
  } finally {
    vi.useRealTimers();
    for (const k of keys) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    vi.unstubAllGlobals();
  }
}

describe("porte de budget d'un passage (passGate) : le plafond du mois se partage entre les deux fournisseurs", () => {
  // 1 $ de plafond restant, assez d'unités et de solde chez les deux. Ajouté le 20/11/2026 : la porte n'était jamais
  // testée près du plafond — sans le terme « dépensé chez p < ce que le reste du plafond paie au prix de p » (ce qui a
  // été dépensé chez l'autre fournisseur retranché), un passage mixte dépassait le plafond du mois (la borne des 100 €).
  const parts = { units: 2_000, capUsd: 1, open: { sc: true, tikhub: true }, balance: { sc: 30_000, tikhub: 5_000 } };
  const takeAll = (g: ReturnType<typeof passGate>, p: "sc" | "tikhub") => {
    let n = 0;
    while (g.take(p)) {
      g.spend(p === "sc" ? { ...NO_SPEND, sc: 1 } : { ...NO_SPEND, th: 1, usd: TH_PRICE_USD });
      n++;
    }
    return n;
  };
  const usd = (sc: number, th: number) => sc * SC_PRICE_PER_CREDIT + th * TH_PRICE_USD;

  it("0,90 $ dépensés chez ScrapeCreators (479 crédits) : TikHub n'a plus que de quoi payer 99 appels, le plafond tient", () => {
    const g = passGate(parts);
    g.spend({ ...NO_SPEND, sc: 479 });
    const th = takeAll(g, "tikhub");
    // (1 − 479 × 47/25 000) ÷ 0,001 = 99,48 : 99 appels.
    expect(th).toBe(99);
    expect(usd(479, th)).toBeLessThanOrEqual(1);
    expect(usd(479, th + 1)).toBeGreaterThan(1);
  });

  it("0,50 $ dépensés chez TikHub (500 appels) : ScrapeCreators n'a plus que de quoi payer 265 crédits, le plafond tient", () => {
    const g = passGate(parts);
    g.spend({ ...NO_SPEND, th: 500, usd: 500 * TH_PRICE_USD });
    const sc = takeAll(g, "sc");
    // 0,50 ÷ (47/25 000) = 265,96 : 265 crédits.
    expect(sc).toBe(265);
    expect(usd(sc, 500)).toBeLessThanOrEqual(1);
    expect(usd(sc + 1, 500)).toBeGreaterThan(1);
  });
});
