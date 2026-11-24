import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import * as publiques from "../../scripts/fixtures-publiques.mjs";

const { FIXTURES, ROOT, addedLines, anonymizer, crossCheck, isMediaHost, knownWord, publicValues, readRaws, realValues, scanCode, scanFixtures, vocabulary } = publiques;

/**
 * LES FIXTURES DU RADAR SONT PUBLIQUES (20/11/2026). Le dépôt est public : une réponse réelle de ScrapeCreators ou de
 * TikHub n'y entre qu'anonymisée. Le contrôle (scripts/fixtures-publiques.mjs) est STRUCTUREL : il exige la forme
 * synthétique de ce qui pourrait être réel, sans jamais porter de valeur réelle ni d'empreinte (une liste d'empreintes
 * publiée était un oracle, corrigé le 20/11/2026). La contre-épreuve contre les réponses brutes, gardées hors du dépôt,
 * tourne en local quand FIXTURES_BRUTS les nomme.
 */

type Finding = { file: string; at: string; kind: string };
const SCRIPT = path.join(__dirname, "../../scripts/fixtures-publiques.mjs");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fixtures-publiques-"));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));
const world = (files: Record<string, unknown>) => {
  const dir = path.join(tmp, `w${fs.readdirSync(tmp).length}`);
  for (const [f, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    fs.writeFileSync(path.join(dir, f), typeof body === "string" ? body : JSON.stringify(body, null, 1));
  }
  return dir;
};
const kinds = (found: Finding[]) => [...new Set(found.map((f) => `${f.file} ${f.kind}`))].sort();
/**
 * Des témoins de la forme réelle, coupés en deux dans ce fichier : écrits d'un seul tenant, ils seraient eux-mêmes un
 * manquement du contrôle du code (un chemin signé de CDN, un sec_uid).
 */
const SIGNED = "oQ1AzBEFgDAEiCVsIh" + "XeQBgRDfAIPC2FA7Qw9";
const SEC_UID = "MS4wLjABAAAA" + "x7Yq0bQ2mZ4pL9vN3sK8dF1gH6jR5tW2eC0aB9uY4iO7lP3";
/** Des identifiants de forme réelle (vidéo, son, compte : 32 bits de poids faible tirés au hasard), coupés de même. */
const VIDEO_ID = "77099014" + "62817394615";
const VIDEO_ID_2 = "77099014" + "62406432060";
const SOUND_ID = "73099014" + "62406439999";
const UID = "69123456" + "78901234567";
const UID_2 = "69123456" + "78901234999";

/** Des pseudos inventés aux formes des pseudos réels (un prénom et un mot, un numéro, une année), construits pièce à pièce. */
const PRENOM_MOT = ["emma", "lifestyle"].join(".");
const PRENOM_NUMERO = ["marine", "77"].join("_");
const PRENOM_ANNEE = "leo" + "2009";
const PRENOM_ADJECTIF = ["jade", "officiel"].join("_");

/** Une vidéo synthétique sous la forme des réponses enregistrées (identifiants inventés, textes de remplissage). */
const synthVideo = (o: Record<string, unknown> = {}) => ({
  aweme_id: ((1_795_000_000n << 32n) + 1_001n).toString(),
  desc: "Lorem ipsum dolor @auteur_01 #magna",
  create_time: 1_795_000_000,
  statistics: { play_count: 1_200, digg_count: 30 },
  author: { uid: "9100000000000000001", unique_id: "auteur_01", nickname: "Auteur", signature: "bio de auteur_01", follower_count: 10 },
  url: `https://www.tiktok.com/@auteur_01/video/${((1_795_000_000n << 32n) + 1_001n).toString()}`,
  ...o,
});

describe("fixtures publiques : le contrôle structurel", () => {
  // Délai de 30 s (24/11/2026) : ces deux contrôles lisent tout le code du Radar, qui grossit ; 2,6 à 2,9 s en local, mais
  // jusqu'à 5,9 s sur la machine de la CI, où le délai par défaut de 5 s les a fait échouer (main le 23/11, #37 le 24/11).
  const SCAN_MS = 30_000;
  it("les fixtures, le code et les tests du Radar sont en règle", () => {
    expect(scanFixtures().map((f: Finding) => `${f.file} ${f.at} ${f.kind}`)).toEqual([]);
    expect(scanCode().map((f: Finding) => `${f.file} ${f.at} ${f.kind}`)).toEqual([]);
  }, SCAN_MS);

  it("aucune liste de valeurs réelles ni d'empreintes : rien qui permette de tester un pseudo deviné", () => {
    expect(Object.keys(publiques)).not.toContain("KNOWN");
    const src = fs.readFileSync(SCRIPT, "utf8");
    expect(src).not.toMatch(/[0-9a-f]{16}/);
    expect(src).not.toMatch(/\d{15,}/);
  });

  it("le script sort à 0 sur les fixtures, à 1 sur un CDN réel — sans jamais afficher la valeur trouvée", () => {
    const ok = spawnSync(process.execPath, [SCRIPT, FIXTURES], { encoding: "utf8" });
    expect([ok.status, ok.stdout]).toEqual([0, ""]);
    const dir = world({ "x.json": { cover: "https://p16-sign.tiktokcdn-eu.com/obj/cle-temoin~tplv.heic" } });
    const ko = spawnSync(process.execPath, [SCRIPT, dir], { encoding: "utf8" });
    expect(ko.status).toBe(1);
    expect(ko.stdout).toContain("x.json $.cover : cdn");
    expect(ko.stdout).not.toContain("cle-temoin");
  }, SCAN_MS);

  // Corrigé le 20/11/2026 : les sons, les vidéos signées et les effets des réponses brutes passaient.
  it("chaque hôte de média est reconnu, en clair comme encodé ; tout autre hôte qu'example.invalid et les API est refusé", () => {
    for (const h of [
      "p16-sign-va.tiktokcdn.com",
      "p19-common-sign.tiktokcdn-us.com",
      "p16-sign.muscdn.com",
      "p3-sign.ibyteimg.com",
      "v16m.tiktokv.com",
      "sf16-muse-va.ibytedtos.com",
      "v16-webapp-prime.us.tiktok.com",
      "v19-webapp-prime.us.tiktok.com",
      "video-tcs-sg.tiktok.com",
      "lf16-effectcdn.byteeffecttos-g.com",
      "scontent-cdg4-1.cdninstagram.com",
      "scontent.xx.fbcdn.net",
    ])
      expect([h, isMediaHost(h)]).toEqual([h, true]);
    for (const h of ["www.tiktok.com", "example.invalid", "api.tikhub.io", "api.scrapecreators.com", "library.tiktok.com"]) expect([h, isMediaHost(h)]).toEqual([h, false]);
    expect(
      kinds(
        scanFixtures(
          world({
            "a.json": { u: "https://sf16-muse-va.ibytedtos.com/obj/son-temoin.mp3" },
            "b.json": { u: "https://api.example/v1?img=https%3A%2F%2Fv16-webapp-prime.us.tiktok.com%2Fvideo%2Ftos%2Fx" },
            "c.json": { u: "https://vm.tiktok.example/ZMabc/" },
            "d.json": { u: "https://example.invalid/tos-useast5-p-0068-tx/couverture-01~tplv-tiktokx-cropcenter-q:300:400:q70.heic" },
            "e.json": { u: "https://www.tiktok.com/@auteur_01/video/1" },
          }),
        ),
      ),
    ).toEqual(["a.json cdn", "b.json cdn", "b.json hôte", "c.json hôte"]);
  });

  it("une réponse enregistrée (sous-dossier) : pseudo, nom, uid, sec_uid, bio, identifiant, adresse et texte réels refusés ; la forme synthétique passe", () => {
    const real = synthVideo({
      aweme_id: VIDEO_ID,
      desc: "Ayer probé una receta nueva con mi abuela en casa",
      author: { uid: UID, sec_uid: SEC_UID, unique_id: "maria.lopez_94", nickname: "María López", signature: "estudiante de derecho" },
      url: `https://www.tiktok.com/@maria.lopez_94/video/${VIDEO_ID}`,
    });
    const found = scanFixtures(world({ "sc/reel.json": { aweme_detail: real }, "sc/synth.json": { aweme_detail: synthVideo() }, "golden.json": { args: { caption: "Ayer probé una receta nueva" } } }));
    expect(kinds(found)).toEqual([
      "sc/reel.json adresse",
      "sc/reel.json bio",
      "sc/reel.json identifiant",
      "sc/reel.json inconnu",
      "sc/reel.json nom",
      "sc/reel.json pseudo",
      "sc/reel.json sec_uid",
      "sc/reel.json texte",
      "sc/reel.json uid",
    ]);
  });

  // Corrigé le 21/11/2026 : pseudos, uid, identifiants et textes n'étaient jugés que dans les sous-dossiers. Un
  // enregistrement de banc (à la racine) refait sur des réponses réelles débarrassées de leurs CDN passait la CI.
  it("LE MONDE CLOS : un enregistrement de banc (racine) ne porte que ce que le code, les tests et les réponses synthétiques portent — pseudo, identifiant, texte réels refusés", () => {
    const root = world({
      // Le code et les tests du monde : leur vocabulaire.
      "tests/radar/banc.test.ts": 'it("relevés", () => { const comptes = ["rate_encore", "troue"]; const legende = "je teste cibleapp ce soir"; });',
      "convex/radar/x.ts": "export const erreur = (s: number) => `HTTP ${s} : refus`;\nconst page = (h: string) => `https://api.scrapecreators.com/v3/tiktok/profile/videos?handle=${h}&sort_by=latest`;",
    });
    const scan = (_golden: unknown) => scanFixtures(path.join(root, "tests/radar/fixtures"), { vocab: vocabulary(root, ["convex/radar", "tests/radar"]) });
    const write = (golden: unknown) => {
      fs.mkdirSync(path.join(root, "tests/radar/fixtures"), { recursive: true });
      fs.writeFileSync(path.join(root, "tests/radar/fixtures/taches.json"), JSON.stringify(golden, null, 1));
    };
    const fetch = (handle: string) => JSON.stringify({ key: null, url: `https://api.scrapecreators.com/v3/tiktok/profile/videos?handle=${handle}&sort_by=latest` });
    // Ce que le banc sert et écrit lui-même : rien d'inconnu.
    write([{ name: "relevés", fetches: [fetch("rate_encore"), fetch("troue")], ctx: [{ args: { caption: "je teste cibleapp ce soir", videoId: ((1_795_000_000n << 32n) + 1_001n).toString(), error: "HTTP 500 : refus" } }] }]);
    expect(scan(undefined)).toEqual([]);
    // Refait sur des réponses réelles : un pseudo, un identifiant et une légende que rien dans le dépôt n'écrit.
    write([{ name: "relevés", fetches: [fetch("lina.rousseau_88")], ctx: [{ args: { caption: "probé una receta nueva con mi abuela", videoId: VIDEO_ID } }] }]);
    expect(kinds(scan(undefined))).toEqual(["taches.json identifiant", "taches.json inconnu", "taches.json texte"]);
  });

  // Corrigé le 21/11/2026 : un mot du vocabulaire suivi d'au plus 4 chiffres, ou fait de morceaux du vocabulaire joints
  // par des points ou des soulignés, était connu ; et une légende dont chaque mot figurait quelque part dans le code
  // (commentaires, titres de tests) passait. Rejoué sur l'export des comptes suivis : 829 des 7 931 pseudos réels hors
  // de main passaient, 89 désormais ; 657 des 13 932 légendes réelles distinctes, 84 désormais.
  it("LE MONDE CLOS, formes composées : un pseudo n'est composé que par les gabarits du code (morceaux de gabarit, tables, identifiants), plus par les mots de ses commentaires", () => {
    const vocab = vocabulary();
    for (const w of [PRENOM_MOT, PRENOM_NUMERO, PRENOM_ANNEE, PRENOM_ADJECTIF]) expect([w, knownWord(w, vocab)]).toEqual([w, false]);
    // Ce que les gabarits du code composent, tables et identifiants compris (enregistrements des bancs).
    for (const w of ["jugee6", "jugee6_fan12", "site16.com", "uid_nouveau1", "radarapps_b54cda26", "radartracked_compte_mort", "idlumiq", "status_msg", "800.jpeg"]) expect([w, knownWord(w, vocab)]).toEqual([w, true]);
  });

  it("LE MONDE CLOS, enregistrement de banc (racine) : un pseudo ni synthétique ni écrit par le code, une légende que le code n'écrit pas, refusés — même faits de mots que le code nomme", () => {
    const root = world({
      // Le code du monde : un commentaire qui porte les mots d'une légende réelle, un gabarit de légende, un gabarit de pseudo.
      "convex/radar/x.ts": [
        "// la meilleure app pour réviser tes cours, le style de vie d'une créatrice : des mots du code",
        `export const legende = (app: string, i: number) => \`lien sur monsite.io \${app} vidéo \${i}\`;`,
        `export const pseudo = (slug: string, i: number) => \`\${slug}_fan\${i}\`;`,
        `export const MOTS = ["${PRENOM_MOT.split(".")[0]}", "${PRENOM_MOT.split(".")[1]}"]; export const APP = "lumio";`,
      ].join("\n"),
    });
    const vocab = vocabulary(root, ["convex/radar"]);
    fs.mkdirSync(path.join(root, "tests/radar/fixtures"), { recursive: true });
    const put = (args: Record<string, unknown>) => {
      fs.writeFileSync(path.join(root, "tests/radar/fixtures/banc.json"), JSON.stringify([{ name: "x", ctx: [JSON.stringify({ args })] }], null, 1));
      return kinds(scanFixtures(path.join(root, "tests/radar/fixtures"), { vocab }));
    };
    expect(put({ caption: "lien sur monsite.io lumio vidéo 12", authorHandle: "lumio_fan3", desc: "Lorem ipsum dolor" })).toEqual([]);
    expect(put({ caption: "la meilleure app pour réviser tes cours" })).toEqual(["banc.json texte"]);
    expect(put({ authorHandle: PRENOM_MOT })).toEqual(["banc.json inconnu", "banc.json pseudo"]);
  });

  // Corrigé le 21/11/2026 : le contrôle structurel et l'anonymiseur travaillaient sur des listes fermées de clés.
  it("LE MONDE CLOS, réponse enregistrée : une valeur réelle sous une clé qu'aucune liste ne connaît est refusée (son, partage, lieu, journal)", () => {
    const root = world({ "convex/radar/x.ts": "export const page = (h: string, id: string) => `https://www.tiktok.com/@${h}/video/${id}`;" });
    const vocab = vocabulary(root, ["convex/radar"]);
    const doc = (o: Record<string, unknown>) => ({ aweme_detail: synthVideo(o) });
    fs.mkdirSync(path.join(root, "tests/radar/fixtures/sc"), { recursive: true });
    const put = (name: string, body: unknown) => fs.writeFileSync(path.join(root, "tests/radar/fixtures/sc", name), JSON.stringify(body, null, 1));
    put("synth.json", doc({}));
    put("son.json", doc({ music: { author: "Lina Rousseau", mixed_author: "lina.rousseau_88" } }));
    put("partage.json", doc({ share_info: { share_title: "Regarde la vidéo de Lina", share_desc_info: "probé una receta nueva" } }));
    put("lieu.json", doc({ poi_info: { poi_name: "Panadería Lopez", city_name: "Sevilla" } }));
    put("journal.json", doc({ log_pb: { impr_id: `2026112012${"3456"}ABCDEF${"7890"}` }, extra: { now: 1_795_101_329_000, logid: `2026112012${"3456"}01020304` } }));
    put("inconnu.json", doc({ zz_nouveau: { nom: "lina.rousseau_88", texte: "receta nueva", numero: VIDEO_ID } }));
    const found = scanFixtures(path.join(root, "tests/radar/fixtures"), { vocab });
    expect(found.filter((f: Finding) => f.file === `sc${path.sep}synth.json`)).toEqual([]);
    for (const f of ["son", "partage", "lieu", "journal", "inconnu"]) expect([f, found.some((x: Finding) => x.file === `sc${path.sep}${f}.json`)]).toEqual([f, true]);
  });

  it("le code et les tests : une adresse de média signée ou un sec_uid réel refusés, les adresses de test courtes passent", () => {
    const dir = world({
      "convex/radar/a.ts": `// couverture : https://p16-sign-va.tiktokcdn.com/tos-maliva-p-0068/${SIGNED}~tplv.jpeg`,
      "tests/radar/b.test.ts": `const s = "${SEC_UID}";`,
      "tests/radar/c.test.ts": `const u = "https://p16.tiktokcdn.com/cover.jpeg?x-expires=1"; const t = "https://sf16-muse-va.ibytedtos.com/obj/son.mp3";`,
    });
    expect(kinds(scanCode(dir, ["convex/radar", "tests/radar"]))).toEqual([`convex${path.sep}radar${path.sep}a.ts cdn`, `tests${path.sep}radar${path.sep}b.test.ts sec_uid`]);
  });
  // Corrigé le 21/11/2026 : seuls un chemin signé et un sec_uid y étaient cherchés — ni un identifiant de son dans un
  // commentaire, ni un pseudo réel balisé à la façon de TikHub.
  it("le code : un identifiant de vidéo, de son ou de compte de forme réelle, une mention balisée d'un pseudo réel, un pseudo de forme réelle refusés ; les formes synthétiques, témoins et comptes de départ passent", () => {
    const pseudo = ["lina", "rousseau_88"].join(".");
    // Une balise de mention écrite d'un seul tenant serait elle-même un manquement du contrôle de ce fichier.
    const M_OPEN = "<" + "m";
    const dir = world({
      "convex/radar/a.ts": `// vu chez ${M_OPEN} id="${SOUND_ID}">@${pseudo}</m> (uid ${UID}), son ${SOUND_ID}\nconst h = "${pseudo}";\n`,
      "convex/radar/b.ts": `// <m id="1">@Alpha</m>, <m id="2">@auteur_17</m>, @nadia.temoin_57, ${(1_795_000_000n << 32n) + 1_001n}, 7709000000000000001, 9100000000000000001\nconst h = "compte_mort"; const v = "v16m.tiktokv.com";\n`,
      "convex/radar/radarSeedAccounts.ts": `export const SEEDS = ["${["emma", "viral80"].join(".")}"];\n`,
      "convex/radar/c.ts": `// un compte de départ : @${["emma", "viral80"].join(".")}\n`,
      "tests/radar/d.test.ts": `const s = "${SOUND_ID}";\n`,
    });
    expect(kinds(scanCode(dir, ["convex/radar", "tests/radar"], ["convex/radar"]))).toEqual([`convex${path.sep}radar${path.sep}a.ts identifiant`, `convex${path.sep}radar${path.sep}a.ts pseudo`, `tests${path.sep}radar${path.sep}d.test.ts identifiant`]);
    expect(scanCode(dir, ["convex/radar"], ["convex/radar"]).filter((f: Finding) => f.file.endsWith("a.ts")).map((f: Finding) => f.at)).toEqual(["ligne 1", "ligne 1", "ligne 2"]);
  });

  // Corrigé le 21/11/2026 : un gabarit fait des 14 premiers chiffres d'une vidéo réelle complétés par un rang
  // passait — seuls 17 à 20 chiffres d'un tenant étaient jugés —, et une valeur de requête d'adresse de partage aussi.
  it("le code : un identifiant composé (le début d'un identifiant de forme réelle suivi d'un « ${…} ») et une valeur de partage écrite en clair refusés ; la forme synthétique passe", () => {
    const dir = world({
      "tests/radar/a.test.ts": `const u = (i: number) => \`https://www.tiktok.com/@auteur_17/video/${VIDEO_ID.slice(0, 14)}\${i}\`;\n`,
      "tests/radar/b.test.ts": `const s = "https://www.tiktok.com/@auteur_01/video/1?u_code=${"kq3vtemo1n" + "x8w2"}&source=h5_m";\n`,
      "tests/radar/c.test.ts": "const u = (i: number) => `https://www.tiktok.com/@auteur_17/video/7709774559000000${i}`; const p = `?u_code=${code}&_d=temoin_d`;\n",
    });
    expect(kinds(scanCode(dir, ["tests/radar"], []))).toEqual([`tests${path.sep}radar${path.sep}a.test.ts identifiant`, `tests${path.sep}radar${path.sep}b.test.ts identifiant`]);
  });
});

describe("fixtures publiques : chaque commit d'une branche", () => {
  // Corrigé le 21/11/2026 : seule la pointe était contrôlée. Une PR publie l'arbre de chacun de ses commits
  // (refs/pull/N/head, gardé même après un squash dans main) : des commits intermédiaires gardaient les fixtures d'avant
  // la ré-anonymisation.
  it("un commit intermédiaire en défaut est nommé, même corrigé à la pointe ; le script sort à 1 sans afficher la valeur", () => {
    const repo = world({ "convex/radar/a.ts": "export const a = 1;\n", "tests/radar/fixtures/x.json": { a: 1 } });
    const git = (...a: string[]) => execFileSync("git", ["-c", "user.name=banc", "-c", "user.email=banc@example.invalid", "-c", "commit.gpgsign=false", ...a], { cwd: repo, encoding: "utf8" }).trim();
    git("init", "-q");
    git("add", "-A");
    git("commit", "-qm", "base");
    const base = git("rev-parse", "HEAD");
    fs.writeFileSync(path.join(repo, "tests/radar/fixtures/x.json"), JSON.stringify({ u: "https://p16-sign.tiktokcdn-eu.com/obj/cle-temoin~tplv.heic" }));
    git("commit", "-qam", "une fixture réelle");
    const bad = git("rev-parse", "HEAD");
    fs.writeFileSync(path.join(repo, "tests/radar/fixtures/x.json"), JSON.stringify({ a: 2 }));
    git("commit", "-qam", "corrigée à la pointe");
    expect(publiques.scanCommits(`${base}..HEAD`, repo).map((b: { commit: string; found: Finding[] }) => [b.commit, b.found.map((f) => f.kind).includes("cdn")])).toEqual([[bad, true]]);
    const cli = spawnSync(process.execPath, [SCRIPT, "--commits", `${base}..HEAD`], { cwd: repo, encoding: "utf8" });
    expect(cli.status).toBe(1);
    expect(cli.stdout).toMatch(new RegExp(`^${bad.slice(0, 7)} : \\d+ manquement\\(s\\) \\(cdn[^\\n]*\\)\\n$`));
    expect(cli.stdout + cli.stderr).not.toContain("cle-temoin");
    expect(spawnSync(process.execPath, [SCRIPT, "--commits", `${bad}..HEAD`], { cwd: repo, encoding: "utf8" }).status).toBe(0);
  });
});

describe("fixtures publiques : les pseudos cités par le code du Radar", () => {
  // Corrigé le 21/11/2026 : une mention n'était refusée que de forme réelle (un chiffre, un point ou un souligné), sans
  // fin en .app ; une chaîne entière, qu'avec un chiffre. Le contrôle ne reconnaissait que 865 des 8 000 pseudos de
  // l'export des comptes suivis.
  const MENTION_POINT = ["pervenche", "soir"].join(".");
  const MENTION_APP = ["zebrevide", "app"].join(".");
  it("une mention de toute forme (point, .app, casse), une chaîne entière de la forme d'un pseudo sans chiffre, refusées ; un motif d'app, un champ, un site, une marque citée, un mot du code passent", () => {
    const dir = world({
      "convex/radar/a.ts": `// relevé sur @${MENTION_POINT} et @${MENTION_APP} le 20/11\nexport const X = "${PRENOM_MOT}";\n// vu chez @Prenom${"Nom"}\n`,
      "convex/radar/b.ts":
        '// les @mentions, la marque @valorant\nexport const motifs = ["@suno", "status_code", "linktr.ee", "amazon.de"];\nconst mentions = { status_code: 0 };\n',
      "scripts/radar-bancs/c.ts": `// le banc lit @${MENTION_POINT}\n`,
    });
    expect(scanCode(dir, ["convex/radar", "scripts/radar-bancs"], ["convex/radar", "scripts/radar-bancs"]).map((f: Finding) => `${f.file} ${f.at} ${f.kind}`)).toEqual([
      `convex${path.sep}radar${path.sep}a.ts ligne 1 pseudo`,
      `convex${path.sep}radar${path.sep}a.ts ligne 2 pseudo`,
      `convex${path.sep}radar${path.sep}a.ts ligne 3 pseudo`,
      `scripts${path.sep}radar-bancs${path.sep}c.ts ligne 1 pseudo`,
    ]);
  });

  it("la liste des comptes publics cités ne nomme rien que le code du Radar n'écrive encore", () => {
    const code = publiques.RADAR_CODE.flatMap((d: string) => {
      const walk = (p: string): string[] => (fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((f) => walk(path.join(p, f))) : [p]);
      return walk(path.join(ROOT, d)).map((f) => fs.readFileSync(f, "utf8").toLowerCase());
    }).join("\n");
    for (const h of publiques.CITED_PUBLIC) expect([h, code.includes(h)]).toEqual([h, true]);
  });
});

describe("fixtures publiques : l'anonymiseur", () => {
  /** Un identifiant de vidéo de forme réelle daté de `t` : 32 bits de tête pour la date, le reste tiré au hasard. */
  const realId = (t: number, low: bigint) => ((BigInt(t) << 32n) + low).toString();
  /** Le vocabulaire du code que l'anonymiseur garde sous une clé inconnue (ici : celui d'un monde réduit). */
  const VOCAB = new Set(["https", "www", "tiktok", "com", "video", "example", "invalid", "media", "couverture", "tplv", "tiktokx", "cropcenter", "heic", "original", "sound", "success"]);
  const T = [1_795_101_329, 1_795_090_412, 1_794_903_777];
  // Une réponse brute inventée, sous la forme réelle (le même compte chez ScrapeCreators et chez TikHub).
  const raw = () => ({
    aweme_list: T.map((t, i) => ({
      aweme_id: realId(t, 2_817_394_615n + BigInt(i)),
      desc: i === 0 ? "Merci @Ma_Rïa pour tout\n\n#Opositora 🧠 code 4821" : `Encore une vidéo numéro ${i} #Opositora`,
      create_time: t,
      statistics: { play_count: 24_293 + i, digg_count: 870, comment_count: 0 },
      video: { duration: 18_634 + 1_000 * i, cover: { url_list: [`https://p16-sign-va.tiktokcdn.com/tos-maliva-p-0068/${SIGNED}~tplv-tiktokx-cropcenter:300:400.heic`] } },
      music: { id: 7_300_000_000_123_456_789, id_str: SOUND_ID, title: "original sound - maria.lopez_94", owner_handle: "maria.lopez_94", author: "María López" },
      interaction_stickers: [{ type: 18, text_info: "Lo que nadie te cuenta" }],
      text_extra:
        i === 0
          ? [
              { type: 0, start: 6, end: 13, user_id: UID_2, hashtag_name: "" },
              { type: 1, start: 25, end: 35, user_id: "", hashtag_name: "opositora", hashtag_id: "7002932" },
            ]
          : [],
      author: { uid: UID, sec_uid: SEC_UID, unique_id: "maria.lopez_94", nickname: "María López", signature: "estudiante de derecho", follower_count: 3_848 },
      url: `https://www.tiktok.com/@maria.lopez_94/video/${realId(t, 2_817_394_615n + BigInt(i))}`,
      // Des clés qu'aucune liste ne nomme (relevées au banc) : partage, lieu, journal, et une clé inventée.
      share_info: { share_title: "Regarde la vidéo de Lina Rousseau", share_desc_info: "probé una receta nueva" },
      poi_info: { poi_name: "Panadería Lopez", city_name: "Sevilla" },
      log_pb: { impr_id: `2026112012${"3456"}ABCDEF${"7890"}` },
      zz_nouveau: { nom: ["lina", "rousseau_88"].join("."), numero: VIDEO_ID, quand: t, code: "success" },
      // Un JSON glissé dans une chaîne, une adresse de partage et sa requête, une clé qui est un pseudo, un uid en
      // nombre sous une clé inconnue, l'adresse de stockage d'une vidéo (un identifiant tiré au hasard).
      extra: JSON.stringify({ owner_id: UID, owner_handle: "maria.lopez_94", beats: {} }),
      share_url: `https://www.tiktok.com/@maria.lopez_94/photo/${VIDEO_ID}?u_code=${"zq8inv3nte" + "0k7w"}&share_item_id=${VIDEO_ID}&source=h5_m`,
      by_handle: { [["lina", "rousseau_88"].join(".")]: 1 },
      author_user_id: Number(UID),
      play_addr: { uri: `v0f044gc0000${"d4bs2qfog65q5sh6k6vg"}` },
    })),
    max_cursor: T[2] * 1_000,
  });
  const fresh = () => anonymizer({ seed: Buffer.alloc(32, 7), vocab: VOCAB });

  it("une réponse réécrite passe le contrôle ; la même vidéo chez les deux fournisseurs reste la même ; mentions et hashtags restent à leurs positions", () => {
    const a = fresh();
    const sc = a.rewrite(raw());
    const th = a.rewrite(raw());
    expect(th).toEqual(sc);
    expect(scanFixtures(world({ "sc/profil.json": sc }), { vocab: VOCAB })).toEqual([]);
    const v = sc.aweme_list[0];
    // Les positions de text_extra (unités UTF-16, comme TikTok) suivent la réécriture de la légende.
    expect(v.desc.slice(v.text_extra[0].start, v.text_extra[0].end).startsWith("@")).toBe(true);
    expect(v.desc.slice(v.text_extra[1].start, v.text_extra[1].end).toLowerCase()).toBe(`#${v.text_extra[1].hashtag_name}`);
    expect(v.desc).toContain("\n\n#");
    expect(v.url).toBe(`https://www.tiktok.com/@${v.author.unique_id}/video/${v.aweme_id}`);
    expect(v.music.title).toBe(`original sound - ${v.music.owner_handle}`);
    expect(v.statistics.comment_count).toBe(0);
    expect(v.video.cover.url_list[0]).toMatch(/^https:\/\/example\.invalid\/media\/couverture-01~tplv-tiktokx-cropcenter:300:400\.heic$/);
  });

  // Corrigé le 21/11/2026 : toutes les dates reculaient d'un même écart, tiré dans une fenêtre publique de 30 minutes.
  it("AUCUN ÉCART COMMUN : chaque date a le sien, l'ordre est gardé, l'identifiant et le curseur suivent leur date", () => {
    const before = raw();
    const after = fresh().rewrite(raw());
    const shifts = after.aweme_list.map((v: { create_time: number }, i: number) => v.create_time - before.aweme_list[i].create_time);
    // Une vidéo retrouvée ne livre pas l'écart des autres.
    expect(new Set(shifts).size).toBe(T.length);
    // L'ordre des dates est gardé, toutes antérieures aux vraies.
    const times = after.aweme_list.map((v: { create_time: number }) => v.create_time);
    expect([...times].sort((x, y) => y - x)).toEqual(times);
    for (const s of shifts) expect(s).toBeLessThan(0);
    // Les 32 bits de tête de l'identifiant disent la date réécrite ; le curseur (la plus ancienne) aussi.
    for (const v of after.aweme_list) expect(Number(BigInt(v.aweme_id) >> 32n)).toBe(v.create_time);
    expect(after.max_cursor).toBe(times[2] * 1_000);
    // Une date sous une clé inconnue suit la même table.
    expect(after.aweme_list[0].zz_nouveau.quand).toBe(times[0]);
  });

  // Corrigé le 21/11/2026 : la largeur de chaque caractère, les emoji, la durée à ±3 % et les vues à ±25 % étaient gardés.
  it("les mots changent de largeur, les emoji sont remplacés (même largeur UTF-16), durées et compteurs tirés loin des vrais", () => {
    const before = raw().aweme_list[0];
    const v = fresh().rewrite(raw()).aweme_list[0];
    expect(v.desc.length).not.toBe(before.desc.length);
    expect(v.desc).not.toContain("🧠");
    expect(v.desc.match(/\p{Extended_Pictographic}/gu)?.map((e: string) => e.length)).toEqual(["🧠".length]);
    // Sur 40 vidéos, durées et vues s'écartent des vraies au-delà de ±3 % et de ±25 %.
    const many = { aweme_list: Array.from({ length: 40 }, (_, i) => ({ aweme_id: realId(T[0] - 600 * i, 3_000_000_000n + BigInt(i)), create_time: T[0] - 600 * i, statistics: { play_count: 10_000 }, video: { duration: 10_000 } })) };
    const out = fresh().rewrite(structuredClone(many));
    const ratios = (f: (v: { statistics: { play_count: number }; video: { duration: number } }) => number) => out.aweme_list.map((v: never) => f(v) / 10_000);
    expect(ratios((x) => x.video.duration).some((r: number) => Math.abs(r - 1) > 0.03)).toBe(true);
    expect(ratios((x) => x.statistics.play_count).some((r: number) => Math.abs(r - 1) > 0.25)).toBe(true);
    for (const r of ratios((x) => x.video.duration)) expect(r).toBeGreaterThanOrEqual(0.74);
  });

  // Corrigé le 21/11/2026 : l'anonymiseur ne réécrivait que des clés de listes fermées.
  it("PAR DÉFAUT : une valeur sous une clé qu'il ne connaît pas est réécrite — rien du partage, du lieu, du journal, du son ni d'une clé inventée ne reste", () => {
    const out = JSON.stringify(fresh().rewrite(raw()));
    for (const w of ["Lina", "Rousseau", "rousseau", "receta", "Panadería", "Lopez", "Sevilla", "María", "maria", `2026112012${"3456"}`, "ABCDEF", VIDEO_ID, SOUND_ID, UID, String(T[0]), "zq8inv3nte", "d4bs2qfog65q5sh6k6vg", String(Number(UID))])
      expect([w, out.includes(w)]).toEqual([w, false]);
    // Un mot du vocabulaire du code est gardé.
    expect(out).toContain('"code":"success"');
  });

  // Corrigé le 21/11/2026 : un mot unique fait de mots du vocabulaire de convex/radar était gardé tel quel sous une clé
  // inconnue — les réponses réelles rangent des pseudos sous ig_username, userUniqueId, keyword, word, search_cha_name.
  it("PAR DÉFAUT, un pseudo sous une clé qu'aucune liste ne connaît est réécrit ; avant réécriture, le contrôle le refuse", () => {
    const doc = () => ({ aweme_detail: { ...synthVideo(), share_meta: { ig_username: PRENOM_MOT, keyword: PRENOM_NUMERO, userUniqueId: PRENOM_ADJECTIF, word: PRENOM_ANNEE } } });
    expect(kinds(scanFixtures(world({ "tikhub/brut.json": doc() })))).toContain("tikhub/brut.json inconnu");
    const out = anonymizer().rewrite(doc());
    const meta = out.aweme_detail.share_meta;
    for (const [k, w] of [["ig_username", PRENOM_MOT], ["keyword", PRENOM_NUMERO], ["userUniqueId", PRENOM_ADJECTIF], ["word", PRENOM_ANNEE]]) expect([k, meta[k] === w]).toEqual([k, false]);
    for (const w of [PRENOM_MOT, PRENOM_NUMERO, PRENOM_ADJECTIF, PRENOM_ANNEE]) expect(JSON.stringify(out)).not.toContain(w);
    // Un pseudo Instagram ou un identifiant de pseudo : réécrits en pseudos synthétiques, comme unique_id.
    expect([meta.ig_username, meta.userUniqueId].every((h: string) => publiques.SYNTH.handle.test(h))).toBe(true);
    expect(scanFixtures(world({ "tikhub/x.json": out }))).toEqual([]);
  });

  it("aucune correspondance fixe : deux passages ne réécrivent pas pareil (rien ne permet de rejouer l'anonymisation sur une vidéo devinée)", () => {
    const one = anonymizer({ vocab: VOCAB }).rewrite(raw()).aweme_list[0];
    const two = anonymizer({ vocab: VOCAB }).rewrite(raw()).aweme_list[0];
    expect(one.desc).not.toBe(two.desc);
    expect(one.create_time).not.toBe(two.create_time);
  });
});

describe("fixtures publiques : la contre-épreuve (locale)", () => {
  // Des réponses brutes inventées, et ce que la contre-épreuve en reconnaît.
  const raws = [
    { aweme_list: [{ aweme_id: VIDEO_ID_2, desc: "un texte de légende assez long pour être reconnu ici", create_time: 1_795_101_329, statistics: { play_count: 24_293, digg_count: 870 }, author: { unique_id: "maria.lopez_94", uid: UID } }] },
    [{ handle: "nadia.temoin_57", bio: "une bio de compte suivi assez longue" }],
  ];
  const real = realValues(raws);
  const none = { words: new Set<string>(), grams: new Set<string>() };

  it("pseudo, identifiant, légende, date et compteurs d'une fixture ; pseudo et identifiant d'une ligne de code ajoutée — jamais la valeur", () => {
    const dir = world({
      "sc/a.json": { x: { author: { unique_id: "maria.lopez_94" } } },
      "sc/b.json": { aweme_id: VIDEO_ID_2 },
      "c.json": { args: { caption: "Un texte de légende assez long pour être reconnu" } },
      "sc/d.json": { v: { create_time: 1_795_101_329, statistics: { play_count: 24_293, digg_count: 870 } } },
      "e.json": { ok: "lorem ipsum dolor" },
    });
    expect(kinds(crossCheck(real, { dir, pub: none }))).toEqual(["c.json texte", "sc/a.json pseudo", "sc/b.json identifiant", "sc/d.json compteurs", "sc/d.json date"].sort());
    const lines = [
      { file: "convex/radar/x.ts", line: 3, text: " * « … sur <m id=\"9889\">@nadia.temoin_57</m> … »" },
      { file: "tests/radar/y.test.ts", line: 9, text: `const id = "${VIDEO_ID_2}";` },
      { file: "tests/radar/z.test.ts", line: 1, text: "// rien de réel ici" },
    ];
    const found = crossCheck(real, { fixtures: false, lines, pub: none });
    expect(found).toEqual([
      { file: "convex/radar/x.ts", at: "ligne 3", kind: "pseudo" },
      { file: "tests/radar/y.test.ts", at: "ligne 9", kind: "identifiant" },
    ]);
    expect(JSON.stringify(found)).not.toContain("nadia");
  });

  // Corrigé le 21/11/2026 : un u_code réel (code de partage d'un compte) coupé en deux, et les 14 premiers chiffres d'un
  // identifiant de vidéo réel complétés par un rang, passaient : seules les valeurs entières étaient comparées, et les
  // valeurs de requête d'une adresse de partage n'étaient jamais relevées.
  it("le morceau d'une valeur réelle (le début d'un u_code, les premiers chiffres d'un identifiant) est reconnu, comme les valeurs de requête d'une adresse de partage", () => {
    const U_CODE = "kq3vtemo1n" + "x8w2";
    const D = "temoin2026" + "1121abc";
    const r = realValues([{ aweme_list: [{ aweme_id: VIDEO_ID_2, share_url: `https://www.tiktok.com/@maria.lopez_94/video/${VIDEO_ID_2}?u_code=${U_CODE}&_d=${D}&share_item_id=${VIDEO_ID_2}&source=h5_m` }] }]);
    const lines = [
      { file: "tests/radar/a.test.ts", line: 1, text: `const u = \`?u_code=\${"${U_CODE.slice(0, 10)}" + "${U_CODE.slice(10)}"}\`;` },
      { file: "tests/radar/b.test.ts", line: 2, text: `const v = (i: number) => \`/video/${VIDEO_ID_2.slice(0, 14)}\${i}\`;` },
      { file: "tests/radar/c.test.ts", line: 3, text: `const d = "${D}";` },
      // Synthétiques : « 7709 » suivi de zéros et d'un rang, un mot du code.
      { file: "tests/radar/d.test.ts", line: 4, text: "const w = (i: number) => `/video/7709774559000000${i}`; const k = \"share_item_id\";" },
    ];
    expect(crossCheck(r, { fixtures: false, lines, pub: none })).toEqual([
      { file: "tests/radar/a.test.ts", at: "ligne 1", kind: "identifiant" },
      { file: "tests/radar/b.test.ts", at: "ligne 2", kind: "identifiant" },
      { file: "tests/radar/c.test.ts", at: "ligne 3", kind: "identifiant" },
    ]);
    const dir = world({ "sc/a.json": { share_url: `https://www.tiktok.com/@auteur_01/video/1?u_code=${U_CODE}` }, "b.json": { id: `${VIDEO_ID_2.slice(0, 13)}7` } });
    expect(kinds(crossCheck(r, { dir, pub: none }))).toEqual(["b.json identifiant", "sc/a.json identifiant"]);
  });

  it("ce que main publie déjà n'est pas compté (un mot courant qui est aussi un pseudo)", () => {
    const r = realValues([[{ handle: "platform" }, { handle: "zoe.temoin_12" }]]);
    const lines = [
      { file: "convex/radar/x.ts", line: 1, text: 'const k = "platform";' },
      { file: "convex/radar/x.ts", line: 2, text: "// vu chez @zoe.temoin_12" },
    ];
    expect(crossCheck(r, { fixtures: false, lines, pub: none }).length).toBe(2);
    expect(crossCheck(r, { fixtures: false, lines, pub: { words: new Set(["platform", "zoe.temoin_12", "zoe", "temoin_12"]), grams: new Set() } })).toEqual([]);
  });

  // Corrigé le 21/11/2026, rejoué sur les 75 réponses du banc réécrites (25 des 1 789 dates tombaient par hasard à la
  // seconde sur l'une des ~19 000 dates réelles, aucune n'était restée la sienne).
  it("les dates se jugent par document : une date réécrite qui tombe par hasard sur une date réelle n'est pas comptée ; un document qui garde les siennes l'est", () => {
    const r = realValues([{ aweme_list: [1_795_101_329, 1_795_090_412, 1_794_903_777].map((t) => ({ create_time: t })) }]);
    const docs = (times: number[]) => ({ aweme_list: times.map((t) => ({ create_time: t, music: { create_time: times[0] } })) });
    const dir = world({
      "sc/hasard.json": docs([1_795_101_329, 1_795_080_000, 1_795_070_000, 1_795_060_000]),
      "sc/reel.json": docs([1_795_101_329, 1_795_090_412, 1_794_903_777]),
      "sc/seule.json": { aweme_detail: { create_time: 1_795_090_412 } },
    });
    expect(kinds(crossCheck(r, { dir, pub: none }))).toEqual(["sc/reel.json date", "sc/seule.json date"]);
  });

  it("ni un morceau du remplissage, ni un mot protégé, ni un court nombre ne sont comptés pseudo ou identifiant réel parce qu'un compte réel s'appelle ainsi", () => {
    const r = realValues([[{ handle: "orem" }, { handle: "tango" }, { handle: "4821" }, { handle: "zoe.temoin_12" }], [{ cid: "7002932" }]]);
    const dir = world({ "sc/a.json": { desc: "Orem dolor", text_info: "Tango", n: "4821", tag: "7002932" }, "sc/b.json": { x: { unique_id: "zoe.temoin_12" } } });
    expect(kinds(crossCheck(r, { dir, pub: none }))).toEqual(["sc/b.json pseudo"]);
  });

  it("un texte de moins de six mots que main publie déjà n'est pas compté sur une ligne que la branche retouche", () => {
    const r = realValues([{ aweme_list: [{ desc: "Consegui fazer a IA rir" }] }]);
    const lines = [{ file: "tests/radar/x.test.ts", line: 4, text: 'const v = { desc: "Consegui fazer a IA rir", id: "1" };' }];
    expect(crossCheck(r, { fixtures: false, lines, pub: none }).map((f: Finding) => f.kind)).toEqual(["texte"]);
    const pub = { words: new Set<string>(), grams: new Set<string>(), has: (c: string) => " const v desc consegui fazer a ia rir id 1 ".includes(` ${c} `) };
    expect(crossCheck(r, { fixtures: false, lines, pub })).toEqual([]);
  });

  // LA CONTRE-ÉPREUVE RÉELLE : les réponses brutes des bancs et les exports de la prod (FIXTURES_BRUTS, chemins séparés
  // par « : »), contre les fixtures et les lignes ajoutées depuis origin/main (arbre de travail compris).
  const bruts = process.env.FIXTURES_BRUTS?.split(":").filter(Boolean) ?? [];
  it.skipIf(bruts.length === 0)("contre les réponses brutes et les exports réels : aucune correspondance", () => {
    const realAll = realValues(readRaws(bruts));
    expect(realAll.names.size).toBeGreaterThan(1_000);
    const base = execFileSync("git", ["merge-base", "origin/main", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
    const found = crossCheck(realAll, { lines: addedLines(base), pub: publicValues(base) });
    expect(found.map((f: Finding) => `${f.file} ${f.at} ${f.kind}`)).toEqual([]);
  });
});
