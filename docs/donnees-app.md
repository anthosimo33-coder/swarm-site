# Les données de l'app (Radar → Kopycat)

Chaque écran de l'app lit **un document** déjà calculé, rangé dans la table `boards` de Convex et
recalculé chaque nuit depuis le Radar (`convex/radarSync.ts` → `convex/radarModels.ts`). Le routeur
(`src/app/main.js`) le passe à l'écran dans `this.props.data` :

- `undefined` n'arrive jamais à l'écran : le routeur attend les données avant d'afficher ;
- document absent (fiche sortie du Radar, liste pas encore calculée) : le routeur affiche sa propre page
  « introuvable » ou « les données arrivent », jamais l'écran ; un écran branché reçoit donc toujours son document ;
- sur le canevas, `this.props.data` n'existe pas : l'écran garde son exemple.

`this.props.params` porte les paramètres de l'adresse (`{ slug }`, `{ id }`, `{ handle }`), `this.props.query`
ceux de la requête (`/app/apps?niche=Foi` → `{ niche: 'Foi' }` ; une clé répétée donne un tableau,
`?niche=Foi&niche=Couple` → `{ niche: ['Foi', 'Couple'] }`). Suivre un lien vers une autre requête remonte l'écran ; sur
le canevas, la même valeur se lit dans `location.search`.

Filtres des listes (audit F25) : Apps, Créateurs (liste et cartes), Formats et Alertes gardent leurs filtres dans la
requête, avec les mêmes noms sur ordinateur et sur téléphone, pour que l'autre version de l'écran, remontée quand la mise
en page bascule (rotation d'un iPad, fenêtre redimensionnée), les retrouve. Chaque canevas déclare ses filtres dans
`filters()` (clé de l'état → paramètre), les lit par `fv(clé)` (l'état, sinon la requête) et les choisit par
`setF({ … })` : l'état, plus l'adresse par `history.replaceState` (sans entrée d'historique ni remontage). Sur le
canevas (sans `props.query`), l'état seul. Un filtre propre à une version reste dans l'adresse quand l'autre en change un
autre. Paramètres : `m` (marché), `niche`, `tri`, `periode`, `dates`, `plateforme`, `colonne`, `ordre` (Apps) ; `m`,
`niche`, `app`, `abonnes`, `type`, `genre`, `tri`, `actifs` (Créateurs) ; `m`, `niche`, `type` (Formats) ; `onglet`,
`miennes` (Alertes). Banc : `npm run test:filtres`.

Un écran peut lire un autre document avec `this.props.get(clé)` (undefined tant qu'il charge, null s'il
n'existe pas), par exemple les créateurs d'un autre marché, une liste d'apps par pays ou l'index de recherche.

Nombres bruts (vues, multiplicateurs, dates en millisecondes) : la mise en forme est faite par l'écran.
Une miniature (`cover`) ou une icône (`icon`) peut être `null` ou ne pas se charger : l'écran garde un repli.

Ce contrat suit `convex/radarModels.ts` (la source qui fait foi) et `convex/boards.ts` (ce qui est ajouté ou retiré à la
lecture). Les bancs `npm run test:radar` et `npm run check:data` vérifient les documents et leur rendu.

## Adresses des images, et ce que boards.get fait à la lecture

- `cover` d'une vidéo : l'adresse `/cover/<id>?v=…&s=…` du backend, signée (`convex/coverSign.ts`), qui sert la copie
  rangée par Kopycat ; jamais le lien signé de TikTok, qui expire ;
- `avatar` sur tout objet qui a un `handle` et des `fans` (créateur, auteur d'une vidéo) : `/avatar/<handle>?v=…&s=…` ;
- ces adresses sont écrites par la synchro (`radarSync.writePages`, audit F28) ; la page porte alors une marque `_signed`
  que `boards.get` retire avant de la rendre telle quelle. Une page pas encore réécrite, ou signée avec une autre clé,
  est signée à la lecture ;
- compte sans abonnement : voir « L'aperçu » plus bas.

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
Une app ou un format cité sans fiche porte `page: false` (app en pause, fusion sans suite, format hors des 150 premiers) :
l'écran le nomme sans lien. Un ancien slug d'app fusionnée mène à la fiche de l'app qui l'a reprise (`apps:merged`).

## Marchés

Un marché est un **pays** (code ISO à deux lettres, un drapeau), jamais une langue ni un groupe de pays (décision du
14/11). Le pays d'un compte : celui que le Radar relève, sinon celui de création de ses vidéos, sinon celui lu par
Kopycat sur la page publique d'une de ses vidéos, sinon celui de son app quand ses autres comptes y sont presque tous.
`XX` : pays inconnu. Tous les pays où il y a au moins un créateur sont proposés (une liste avec recherche, plus
d'onglets ni de seuil).

`markets` : `[[code, libellé, nombre de créateurs]]`, du plus fourni au moins fourni.
`otherLang` : la langue d'un compte quand ce n'en est pas une de son pays (« France · en espagnol »), sinon absent ou null.

## Une vidéo en vignette (`VideoCard`)

`{ id, platform: 'tiktok'|'instagram', handle, app: slug|null, views, x: multiplicateur|null, publishedAt, cover, hook,
paid?: placement payé, otherLang?, carousel?: nombre de photos, kind?: type de contenu lu par l'IA }`

## Les documents

### `apps` — classement (AppsA, MApps)
`{ updatedAt, markets, niches: [nom], apps: [App], marketApps: [[code, nombre d'apps actives dans ce pays]] }`, apps triées par `views30`.
`App = { slug, name, niche, icon, kind: 'app'|'saas'|'jeu_mobile'|null, accounts, videosPerWeek, dayEnd, days: [vues par jour ×42],
daysIg, views30, views30Ig, views7, views7Ig, weeks: [6 nombres, du plus ancien au plus récent], weekDelta: ratio|null, bestX,
top10Share: ratio|null, videoCount, placements, top: [VideoCard ×3], markets: [[code, %]], trackedSince, isNew, store: URL App Store|null }`

Règles :
- une app n'est listée qu'avec au moins 2 comptes prouvés (`MIN_APP_ACCOUNTS`) ; sa fiche `app:<slug>` existe quand même ;
- vues, top, meilleure vidéo et marchés ne comptent que les vidéos qui citent l'app (`cites` non faux) **et** dont le
  compte la pousse : actif et prouvé (`proof.by` non null). Les vidéos d'un compte mis en pause dans le Radar ne comptent
  plus (audit Q65, 19/11) ;
- `accounts` : ses créateurs, comptes actifs et prouvés hors placements payés ; `placements` : comptes en placement payé
  dont des vidéos comptent dans ses vues ;
- `markets` : part de ses vues 30 j par pays de ses comptes, 100 pile, `XX` en dernier ;
- `niche` : la niche de la fiche du Radar (16 niches), sinon la table `NICHES` de Kopycat, sinon « Autres » ;
- `isNew` : sortie sur l'App Store il y a 60 jours au plus, sinon réseau dont la première vidéo a 30 jours au plus.

### `apps:<pays>`, `apps@<plateforme>`, `apps:<pays>@<plateforme>` — classement filtré (AppsA, MApps)
Par pays des comptes et/ou plateforme (`tiktok`, `instagram`) : `{ updatedAt, market: code|'ALL', platform: …|'ALL', niches,
apps: [App recalculée sur ces vidéos + share: part du pays dans les vues de l'app|null] }`.

### `apps:top` — l'aperçu (ApercuA, MApercuApps)
`{ updatedAt, apps: [App + standing: { rank, of, share, niche }] ×3, total: nombre d'apps listées }`. `standing` : son rang
réel, dans sa niche si elle en compte au moins 2, sinon parmi toutes.

### `apps:merged` — apps fusionnées
`{ updatedAt, merged: [[ancien slug, slug de l'app qui l'a reprise]] }`, lu par `boards.get` et `saved.get`.

### `app:<slug>` — fiche d'une app (FicheA, MFiche)
L'`App` ci-dessus, plus `videos: [VideoCard ×12]` (les plus vues sur 30 j, ordre du lecteur),
`formats: [{ id, kind: 'hook'|'sound', label, accounts, medX, maxViews, page? }] ×8`,
`creators: [{ handle, fans, median, posts7d, market, page: a-t-il une fiche ? }] ×6` (les 6 que l'écran montre).

### `video:<id>` — lecteur (VideoA, MVideo)
`{ id, platform, url, handle, fans, normal: vues médianes du compte, paid, app: {slug, name, icon, niche, page?}|null, market,
region, otherLang, carousel, kind, publishedAt, durationSec, views, x, likes, comments, shares, saves, snapshots: [{at, views}] ×12,
hook, caption, transcript, music, cover, playlist: [id…] }` — `playlist` = les vidéos de l'app (même ordre que
`app:<slug>`.videos). `url` mène toujours à tiktok.com ou instagram.com en https (sinon reconstruite, audit S34).
Une vidéo notée introuvable (supprimée, compte privé) n'a pas de fiche.

### `formats` — formats repris (FormatsB, MFormats)
`{ updatedAt, markets, formats: [Format] }` (repris par au moins 3 comptes, actifs sur 21 jours, 150 au plus),
triés par nombre de comptes puis multiplicateur médian.
`Format = { id, kind, label, accounts, apps: [{slug, name, icon, page?}], niche, market, maxViews, medX, wins: reprises au-dessus
de leur normale, n: reprises, lastPostAt, members: [{ handle, videoId, views, x, publishedAt, cover }] }` (4 membres ici, 30 dans la fiche).

### `format:<id>` — fiche d'un format (FormatFicheA, MFormatFiche)
Le `Format` complet (`members` jusqu'à 30).

### `creators:<pays>` — créateurs (CreateursA/B, MCreateurs, MCreateursCartes)
Pays (code ISO) ou `ALL`. Tous les créateurs du pays, par pages de 500 (`CREATOR_PAGE`) :
`creators:<pays>` = `{ updatedAt, market, markets, total, active7: ceux qui ont publié sur 7 jours (posts7d > 0), pages, creators: [Creator] }` (la 1re page),
`creators:<pays>:2`, `:3`… = `{ updatedAt, market, page, creators }`. Ordre : les comptes actifs d'abord, puis ceux qui
n'ont rien publié depuis plus de 30 jours, chaque groupe par vues médianes.
`Creator = { handle, bio, fans, median, posts7d, days7, lastPostAt, market, otherLang, kind, gender, app: {slug, name, icon, niche, page?}|null, best: [VideoCard ×3] }`

- `days7` : ses vidéos suivies par jour de Paris sur les 7 derniers jours, le plus ancien d'abord, aujourd'hui en dernier
  (`[0, 2, 1, 0, 0, 1, 0]`). La liste et le profil dessinent son rythme avec ; `posts7d` reste le nombre du Radar ;
- `bio` : sans e-mail, téléphone, pseudo d'un autre réseau, lien vers une page de liens ou une messagerie, lieu ni âge
  (`cleanBio`, audit S31) ;
- ce qui relie un compte à son app (la preuve du Radar) et son compte Instagram ne sortent jamais du Radar ;
- un compte que plus rien ne prouve (`proof.by` null) et un compte en placement payé n'apparaissent pas.

### `creator:<handle>` — fiche d'un créateur (CreateurFicheA, MCreateurFiche)
Le `Creator`, plus `videos: [VideoCard ×15]` (les plus récentes) et `formats: [{ id, kind, label, accounts, page? }] ×10`.

### `alerts` — alertes (AlertesA, MAlertes)
`{ updatedAt, videos: [{ id, platform, handle, app: {slug, name, icon, page?}|null, views, x, publishedAt, cover, hook, market, region, paid? }]
(40 vidéos de la semaine, triées par multiplicateur), formats: [Format, 3 membres] (devenus des formats cette semaine, 20 au plus) }`

### `home` — accueil (Main, MAccueil)
`{ updatedAt, niches: [nom] ×6, apps: [HomeApp] ×4, videos: [carte d'alerte] ×4, formats: [HomeFormat] ×3, creators: [HomeCreator] ×3 }`,
moins de 20 000 caractères (l'accueil ne lit ni `formats`, ni `creators:<pays>`, ni `apps` pour son fil ; banc
`npm run test:radar`, « Accueil, le fil »).
- `apps` : les 4 premières de `apps` (vues 30 j). `HomeApp = { slug, name, icon, views7, weekDelta, bestX, accounts, videoCount, weeks }`,
  les mêmes chiffres que leur ligne dans `apps` (`weeks` : la courbe des 6 semaines) ;
- `videos` : les 4 premières vidéos d'`alerts` ; leur `app` porte aussi sa `niche` ;
- `formats` : les `HOME_FORMATS` (3) premiers de `formats` repris dans les 7 derniers jours (`lastPostAt`), donc avec leur
  fiche. `HomeFormat = { id, kind, label, accounts, market, wins, n, lastPostAt, members: [1 reprise, la vignette] }` ;
- `creators` : les `HOME_CREATORS` (3) comptes qui publient le plus, parmi les créateurs listés dont la dernière vidéo a
  7 jours au plus (`lastPostAt`), par `posts7d` (vidéos sur 7 jours, tous sujets confondus, au plus 30 : le Radar lit les
  30 dernières vidéos d'un compte, l'écran dit « au moins 30 ») puis vues médianes.
  `HomeCreator = { handle, fans, median, posts7d, lastPostAt, app: {slug, name, icon, niche, page?}, best: [VideoCard ×3] }`
  (`best` : ses vidéos les plus vues sur 30 j, comme sa ligne dans `creators:<pays>`).

Données d'avant la synchro du 20/11 (sans `formats`, `creators`, ni `accounts`/`videoCount`/`weeks`) : l'accueil n'en
montre pas les lignes du fil (une app qui accélère garde sa ligne, avec ses vues sur 7 jours).

### `stats` — ce que le Radar suit (pages publiques, « Relevé le … »)
`{ updatedAt, at: ms du passage, apps: apps listées, accounts: créateurs (comptes prouvés, hors placements), markets: pays }`
— réécrit à chaque synchronisation. Lisible sans compte par `stats.get` (convex/stats.ts), arrondi vers le bas par `src/stats.js`.

### `search` — recherche ⌘K (Palette, MPalette)
`{ updatedAt, apps: [{slug, name, icon, niche, views30}], creators: [{handle, app: nom|null, fans, median}] ×4 000, creatorPages,
formats: [{id, kind, label, accounts}] ×150 }` ; les créateurs suivants dans `search:creators:2`, `:3`… (`{ updatedAt, creators }`).

## L'aperçu (compte sans abonnement)
Un compte dont `users.pro` n'est pas `true` reçoit de `boards.get` :
- `apps` : `{ updatedAt, apps, total, preview: true }` tirés d'`apps:top`, rien d'autre (ni marchés, ni apps par pays,
  ni niches : audit S29) ;
- `app:<slug>` et `video:<id>` : le document si l'app est dans ce top 3 (ou un ancien slug d'une de ces apps), sinon
  `{ locked: true }`, même pour une vidéo inconnue ou introuvable ;
- `search` : les apps du top 3, aucun créateur ni format ;
- `stats` : inchangé ;
- tout le reste : `{ locked: true }` (verrouillé, distinct de `null` = absent), sans rien lire.

À l'écran (`src/app/main.js`) : Apps devient l'aperçu (`ApercuA`, `MApercuApps`) ; Accueil y mène ; tout écran fermé ouvre
la fenêtre des formules (`FormulesA`, `MFormules`). Test du verrou : `npm run test:apercu` (et ses mutants).

## Quota de pages des abonnés (audit S22)
Un abonné ne lit une page de `boards.get` qu'avec son laissez-passer (`{ key, pass }`), délivré par la mutation
`boards.passes({ keys })` (`convex/boardQuota.ts`) :
- au plus **300 pages par heure et 1 500 par 24 h** (décision du 20/11) ; chaque fenêtre part de la première page
  comptée après la précédente. Au-delà, `passes` rend les clés dans `refused` et l'heure de reprise dans `until` ;
- un laissez-passer vaut **2 h** (`exp`), pour cette clé et ce compte : une page relue dans ce délai ne compte pas ;
- `stats` se lit sans laissez-passer ; un compte sans abonnement n'en reçoit pas et n'en a pas besoin (l'aperçu) ;
- sans laissez-passer valable, `boards.get` lève l'erreur `LAISSEZ_PASSER` sans rien lire. La requête ne lit ni n'écrit
  le compteur (`pageQuota`, une ligne par compte, une écriture par lot de pages) : il ne relance pas les pages ouvertes ;
- le premier refus de chaque fenêtre est tracé dans les journaux Convex (`[quota S22] compte …`).

Côté app (`src/app/passes.js`) : les pages demandées dans le même tour partent en un appel (60 clés au plus), le
laissez-passer est gardé jusqu'à son échéance et renouvelé quand le serveur le réclame. Au-delà du quota, la page vaut
`null` et porte `quota` (heure de reprise) : le routeur affiche « Beaucoup de pages ouvertes … rouvrent à 15 h 37 », les
pages déjà ouvertes restent lisibles, et celles en attente s'ouvrent seules à l'heure dite. Banc : `npm run test:quota`.

## Abonnement (Whop)
`users.pro` ouvre tout Kopycat. Il est tenu par Whop (`convex/whop.ts`) :
- « Passer Pro » appelle `whop.checkout` (action, compte connecté et pas déjà Pro), qui crée chez Whop un paiement pour la
  formule choisie, avec l'id du compte Kopycat en `metadata.kopycat_user`, et renvoie l'adresse de la page de paiement ;
- Whop appelle `POST /whop/webhook` (convex/http.ts) ; la signature est vérifiée, chaque événement n'est traité qu'une fois.
  L'adhésion est rangée dans `subscriptions`, le paiement dans `whopPayments`, puis `users.pro` est recalculé : vrai tant qu'une
  adhésion du compte est `active`, `trialing` ou `past_due` ;
- Réglages › Formule lit `whop.mine` (adhésion, reçus) et résilie ou reprend par `whop.setCancel`.
À la main (essai, geste commercial) : `npx convex run users:setPro '{"email":"…","pro":true}'` (plus `--prod` en
production) ; un événement Whop sur ce compte le recalcule ensuite.

## Ce que la personne garde (`saved`)

Propre à chaque compte, enregistré chez Kopycat (`convex/saved.ts`) et gardé d'un écran et d'une visite à l'autre.
`this.props.saved(clé)` : la valeur (undefined tant qu'elle charge, null si rien encore) ;
`this.props.save(clé, valeur)` : remplace la valeur entière, visible aussitôt à l'écran.
Sur le canevas, ces props n'existent pas : l'écran garde un état local, comme avant.

| Clé | Valeur |
| --- | --- |
| `follows` | `{ apps: [slug], creators: [handle], formats: [id] }` — ce que la personne suit (cloche, « Suivre ») |
| `folders` | `[{ id, name, createdAt, items: [{ kind: 'app'\|'video'\|'format'\|'creator', id, label, cover, at }] }]` |
| `alertRules` | `[{ id, createdAt, quoi: 'compte'\|'video'\|'format', niche: nom\|null, seuil: nombre, marche: code pays\|null }]` — « montre-moi quand un compte / une vidéo / un format de <niche> fait <seuil>× sa normale (<pays>) » ; aucune alerte n'est envoyée, elles filtrent l'écran Alertes |
| `seen` | `{ alerts: date en ms }` — « Tout marquer comme lu » |
| `views` | `[{ id, screen: 'createurs', name, q, at }]` — les vues enregistrées d'une liste (« Mes vues ») : `q` = la requête de l'adresse qui porte ses filtres (`niche=Études&m=FR`), `name` composé par l'écran depuis ces filtres |

Une valeur pèse au plus 256 Ko, comptés comme Convex les compte ; un compte écrit au plus 300 fois par 10 minutes
(`TROP_DE_REQUETES` au-delà). Sa forme est vérifiée : champs connus du bon type,
quelques champs simples de plus permis (texte court, nombre, oui/non, null), jamais une arborescence (`FORME_INVALIDE`).
Les identifiants (`id` d'un dossier, d'une règle) sont créés par l'écran (par ex. `Date.now().toString(36)`). Une app
gardée sous l'ancien slug d'une app fusionnée revient sous le nouveau (`apps:merged`).
