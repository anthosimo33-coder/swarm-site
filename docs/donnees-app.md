# Les données de l'app (Radar → Swarm)

Chaque écran de l'app lit **un document** déjà calculé, rangé dans la table `boards` de Convex et
recalculé chaque nuit depuis le Radar (`convex/radarSync.ts` → `convex/radarModels.ts`). Le routeur
(`src/app/main.js`) le passe à l'écran dans `this.props.data` :

- `undefined` n'arrive jamais à l'écran : le routeur attend les données avant d'afficher ;
- document absent (fiche sortie du Radar, liste pas encore calculée) : le routeur affiche sa propre page
  « introuvable » ou « les données arrivent », jamais l'écran ; un écran branché reçoit donc toujours son document ;
- sur le canevas, `this.props.data` n'existe pas : l'écran garde son exemple.

`this.props.params` porte les paramètres de l'adresse (`{ slug }`, `{ id }`, `{ handle }`), `this.props.query`
ceux de la requête (`/app/apps?niche=Foi` → `{ niche: 'Foi' }`). Changer de requête remonte l'écran ; sur le
canevas, la même valeur se lit dans `location.search`.

Un écran peut lire un autre document avec `this.props.get(clé)` (undefined tant qu'il charge, null s'il
n'existe pas), par exemple les créateurs d'un autre marché ou l'index de recherche.

Nombres bruts (vues, multiplicateurs, dates en millisecondes) : la mise en forme est faite par l'écran.
Une miniature (`cover`) ou une icône (`icon`) peut être `null` ou ne pas se charger : l'écran garde un repli.

## Liens

Les liens d'un écran restent écrits vers les artboards ; le convertisseur les traduit en adresses :

| Lien dans l'artboard | Adresse sur le site |
| --- | --- |
| `'FicheA.dc.html?app=' + slug` | `/app/apps/<slug>` |
| `'VideoA.dc.html?v=' + id` | `/app/videos/<id>` |
| `'FormatFicheA.dc.html?f=' + id` | `/app/formats/<id>` |
| `'CreateurFicheA.dc.html?h=' + handle` | `/app/createurs/<handle>` (sans @) |

Mobile : mêmes règles avec `MFiche`, `MVideo`, `MFormatFiche`, `MCreateurFiche`.

Une requête suit l'écran : `'MApps.dc.html?niche=' + nom` → `/app/apps?niche=<nom>`.
Chaque vidéo citée par un document (vignette, reprise d'un format, alerte) a sa page `video:<id>`.

## Marchés

Le marché d'un compte est la langue de ses vidéos : `FR` France, `US` anglophones, `MX` Amérique latine,
`ES` Espagne, `BR` Brésil et Portugal, `XX` autres langues (pas de drapeau pour `XX`).

## Une vidéo en vignette (`VideoCard`)

`{ id, platform: 'tiktok'|'instagram', handle, app: slug|null, views, x: multiplicateur|null, publishedAt, cover, hook }`

## Les documents

### `apps` — classement (AppsA, MApps)
`{ updatedAt, markets: [[code, libellé]], niches: [nom], apps: [App] }`, apps triées par `views30`.
`App = { slug, name, niche, kind: 'app'|'saas'|null, icon, accounts, videosPerWeek, views30, views30Ig, views7, views7Ig, weeks: [6 nombres, du plus ancien au plus récent], weekDelta: ratio|null, bestX, top10Share: ratio|null, markets: [[code, %]], trackedSince, isNew, released: ms|null, videoCount, store: URL App Store|null, top: [VideoCard ×3] }`

Règles (15/11/2026, lot 2 du dig Radar → Swarm) :
- une app n'est listée qu'avec au moins 2 comptes prouvés (`MIN_APP_ACCOUNTS`) ; sa fiche `app:<slug>` existe quand même ;
- `accounts`, vues, top, meilleure vidéo et marchés ne comptent que les comptes prouvés (`proof.by` non null) et les vidéos qui citent l'app (`cites` non faux, règle du Radar) ;
- `niche` : la niche de la fiche du Radar (16 niches), sinon la table `NICHES` de Swarm, sinon « Autres » ;
- `kind` : `app` (fiche App Store, campagne d'app), `saas` (logiciel ou site web), null si on ne sait pas ;
- `isNew` : sortie sur l'App Store il y a 60 jours au plus, sinon réseau dont la première vidéo a 30 jours au plus.

### `app:<slug>` — fiche d'une app (FicheA, MFiche)
L'`App` ci-dessus, plus `videos: [VideoCard ×12]` (les plus vues sur 30 j, ordre du lecteur),
`formats: [{ id, kind: 'hook'|'sound', label, accounts, medX, maxViews }]`,
`creators: [{ handle, fans, median, posts7d, market, page: a-t-il une fiche ?, proof }]`.

### `video:<id>` — lecteur (VideoA, MVideo)
`{ id, platform, url, handle, fans, normal: vues médianes du compte, app: {slug, name, icon, niche}|null, market, region,
publishedAt, durationSec, views, x, likes, comments, shares, saves, snapshots: [{at, views}], hook, caption,
transcript, music, cover, playlist: [id…] }` — `playlist` = les vidéos de l'app (même ordre que `app:<slug>`.videos).

### `formats` — formats repris (FormatsB, MFormats)
`{ updatedAt, markets, formats: [Format] }` (repris par au moins 3 comptes, actifs sur 21 jours),
triés par nombre de comptes puis multiplicateur médian.
`Format = { id, kind, label, accounts, apps: [{slug, name, icon}], niche, market, maxViews, medX, wins: reprises au-dessus de leur normale, n: reprises, lastPostAt, firstSeenAt, members: [{ handle, videoId, views, x, publishedAt, cover }] }` (4 membres ici, 30 dans la fiche).

### `format:<id>` — fiche d'un format (FormatFicheA, MFormatFiche)
Le `Format` complet (`members` jusqu'à 30).

### `creators:<marché>` — créateurs (CreateursA/B, MCreateurs…)
Marché `FR`, `US`, `MX`, `ES`, `BR`, `XX` ou `ALL`. `{ updatedAt, market, total, creators: [Creator] }` (200 au plus, triés par vues médianes).
`Creator = { handle, bio, fans, median, posts7d, lastPostAt, market, app: {slug, name, icon, niche}|null, proof, igHandle, best: [VideoCard ×3] }`

`proof = { by: 'handle'|'bio'|'videos'|'seed'|'manual', cites, of }|null` : ce qui relie le compte à son app (son pseudo, sa bio,
`cites` de ses `of` dernières vidéos, ou choisi par l'équipe). Un compte que plus rien ne prouve (`by` null) n'apparaît nulle part.
Les onglets de marché (`markets`) ne gardent que les marchés d'au moins 10 créateurs ; les autres restent sur chaque créateur et dans `ALL`.

### `creator:<handle>` — fiche d'un créateur (CreateurFicheA, MCreateurFiche)
Le `Creator`, plus `videos: [VideoCard ×15]` (les plus récentes) et `formats: [{ id, kind, label, accounts }]`.

### `alerts` — alertes (AlertesA, MAlertes)
`{ updatedAt, videos: [VideoCard + { app: {slug, name, icon}|null, market, region }] (40 vidéos de la semaine, triées par multiplicateur), formats: [Format] (devenus des formats cette semaine) }`

### `home` — accueil (Main, MAccueil)
`{ updatedAt, niches: [nom], apps: [{slug, name, icon, views7, weekDelta, bestX}] ×4, videos: [carte d'alerte] ×4, formats: [{id, kind, label, accounts, medX}] ×3 }`

### `stats` — ce que le Radar suit (pages publiques, « Relevé le … »)
`{ updatedAt, at: ms du passage, apps: apps listées, accounts: comptes prouvés, markets: onglets de marché }` — réécrit à chaque
synchronisation. Lisible sans compte par `stats.get` (convex/stats.ts), arrondi vers le bas par `src/stats.js`.

### `search` — recherche ⌘K (Palette)
`{ apps: [{slug, name, icon, niche, views30}], creators: [{handle, app, fans, median}], formats: [{id, kind, label, accounts}] }`

## L'aperçu (compte sans abonnement)
Un compte dont `users.pro` n'est pas `true` reçoit de `boards.get` (19/11) :
- `apps` : le top 3 du classement seulement (mêmes champs), plus `total` (nombre d'apps suivies) et `preview: true` ;
- `app:<slug>` et `video:<id>` : le document si l'app est dans ce top 3, sinon `{ locked: true }` ;
- `search` : les apps du top 3, aucun créateur ni format ;
- `stats` : inchangé ;
- tout le reste : `{ locked: true }` (verrouillé, distinct de `null` = absent).

À l'écran (`src/app/main.js`) : Apps devient l'aperçu (`ApercuA`, `MApercuApps`) ; Accueil y mène ; tout écran fermé ouvre
la fenêtre des formules (`FormulesA`, `MFormules`). Passer un compte en Pro : `npx convex run users:setPro
'{"email":"…","pro":true}'` (plus `--prod` en production). Test du verrou : `npm run test:apercu`.

## Ce que la personne garde (`saved`)

Propre à chaque compte, enregistré chez Swarm (`convex/saved.ts`) et gardé d'un écran et d'une visite à l'autre.
`this.props.saved(clé)` : la valeur (undefined tant qu'elle charge, null si rien encore) ;
`this.props.save(clé, valeur)` : remplace la valeur entière, visible aussitôt à l'écran.
Sur le canevas, ces props n'existent pas : l'écran garde un état local, comme avant.

| Clé | Valeur |
| --- | --- |
| `follows` | `{ apps: [slug], creators: [handle], formats: [id] }` — ce que la personne suit (cloche, « Suivre ») |
| `folders` | `[{ id, name, createdAt, items: [{ kind: 'app'\|'video'\|'format'\|'creator', id, label, cover, at }] }]` |
| `alertRules` | `[{ id, createdAt, quoi: 'compte'\|'video'\|'format', niche: nom\|null, seuil: nombre, marche: 'FR'\|'US'\|'MX'\|'ES'\|'BR'\|'XX'\|null }]` — « montre-moi quand un compte / une vidéo / un format de <niche> fait <seuil>× sa normale (<marché>) » ; aucune alerte n'est envoyée, elles filtrent l'écran Alertes |
| `seen` | `{ alerts: date en ms }` — « Tout marquer comme lu » |

Une valeur pèse au plus 256 Ko. Les identifiants (`id` d'un dossier, d'une règle) sont créés par l'écran
(par ex. `Date.now().toString(36)`).
