# Kopycat

Kopycat (ex-Swarm) : les apps et les formats qui explosent en ce moment sur TikTok et Instagram, sur n'importe quel marché, et les créateurs derrière, à partir du Radar de Jarvia. Landing, tarifs, comptes, abonnement payant et l'app.

- `/` : la landing page
- `/tarifs` : la page tarifs (un seul plan, Pro)
- `/connexion` et `/inscription` : les écrans retenus sur le canevas de l'app (Connexion A, Inscription A), rendus responsives, branchés sur un vrai backend (voir « Comptes »)
- `/mot-de-passe-oublie` : le mot de passe oublié (parcours B du canevas « Swarm sans abonnement » : un code à 6 chiffres par e-mail, voir « Comptes »)
- `/app/…` : l'app, réservée aux personnes connectées (voir « L'app »)

Chaque page existe en version desktop et en version mobile. La version mobile s'affiche sous 860 px de large, ou sur un téléphone couché (`MOBILE_QUERY`, `src/runtime.js`), et la page bascule si la fenêtre change. `mountResponsive` ne charge que la version affichée, préchargée dès le `<head>` (`vite.config.js`, `variantPreload`).

## D'où vient le code

Les pages sont dessinées sur le canevas de design (artboards `LP`, `LPMobile`, `Tarifs`, `TarifsMobile`, `Connexion`, `Inscription`). Connexion, Inscription et l'app utilisent le design system (`src/styles/ds/`, copie identique de `design/ds/swarm/`, vérifiée par `npm run test:sources`) : une règle de dessin d'un écran va dans le système de design ou dans le canevas, pas dans le site. Leurs sources sont copiées dans `design/*.dc.html`, puis converties en composants Preact par `scripts/dc2preact.py` :

| Source | Composant | CSS |
| --- | --- | --- |
| `design/LP.dc.html` | `src/pages/LP.js` | `src/styles/lp.css` |
| `design/LPMobile.dc.html` | `src/pages/LPMobile.js` | `src/styles/lpm.css` |
| `design/Tarifs.dc.html` | `src/pages/Tarifs.js` | `src/styles/tf.css` |
| `design/TarifsMobile.dc.html` | `src/pages/TarifsMobile.js` | `src/styles/tfm.css` |
| `design/Connexion.dc.html` | `src/pages/Connexion.js` | `src/styles/cx.css` + design system |
| `design/Inscription.dc.html` | `src/pages/Inscription.js` | `src/styles/ins.css` + design system |
| `design/MotDePasse.dc.html` | `src/pages/MotDePasse.js` | `src/styles/mdp.css` + design system |

Les fichiers de `src/pages` et `src/styles` sont générés : on ne les modifie pas à la main. Pour changer une page, on modifie l'artboard, on recopie le `.dc.html` dans `design/`, puis :

```bash
npm run gen     # régénère src/pages et src/styles
npm run check   # rend chaque page et signale les trous vides
npm run build
```

`npm run verify` lance le typage du backend et tous les bancs (verrou de l'aperçu, documents de la synchro, écrans sur données de banc, copie des images, en-têtes, appels du front…). La même chose tourne en CI (`.github/workflows/verify.yml`) à chaque push et pull request, avec la régénération sans écart ; `main` est protégée : un commit n'y va qu'avec ce job vert, donc par une pull request.

Les images (logos des apps, couvertures des vidéos) sont envoyées sur le canevas et servies sous `/_blob/<id>`. Le site sert les mêmes fichiers depuis `public/media/`, et `design/media.json` fait le lien entre les deux.

Ce que fait la conversion :
- les adresses d'images `/_blob/<id>` du canevas deviennent `/media/<fichier>` ;
- les liens entre artboards deviennent des routes (`/`, `/tarifs`), et depuis les tarifs, les liens vers la LP pointent sur la bonne section ;
- « Trouver mon app » (`#quiz`) et « Passer Pro » (`#paiement`) mènent à `/inscription`, « Se connecter » (`#connexion`) à `/connexion` ;
- la barre « Je veux lancer… » du hero est un vrai champ : la recherche part vers `/inscription?q=…`, qui la rappelle au-dessus du formulaire ;
- les keyframes sont préfixées par page (`lp-`, `lpm-`, `tf-`, `tfm-`) pour qu'elles ne se marchent pas dessus.

## Comptes (Convex Auth)

Le backend est un projet Convex à part, « swarm » (dossier `convex/`), sans lien avec Jarvia :
- dev : `blessed-hedgehog-69` (utilisé par `npm run dev`, adresse dans `.env.local`, non versionné) ;
- production : `useful-owl-794` (adresse publique dans `.env.production`).

Ce que fait le backend :
- `convex/auth.ts` : e-mail + mot de passe et Google. Le mot de passe suit `convex/passwordPolicy.ts` (8 à 128 caractères, pas un mot de passe courant ni une suite évidente, pas l'e-mail), à l'inscription comme au changement ; l'e-mail est ramené en minuscules. Le fournisseur mot de passe est écrit sur l'API publique de Convex Auth pour que les erreurs (identifiants incorrects, compte déjà existant, trop de tentatives) arrivent au site sous forme de codes (`convex/authErrors.ts`) : Convex masque en production le message des erreurs ordinaires. Une inscription sur une adresse déjà inscrite répond « compte existant » sans tester le mot de passe ; les inscriptions sont limitées en nombre (`convex/authLimits.ts`).
- Mot de passe oublié (`/mot-de-passe-oublie`, 24/11) : trois étapes du même fournisseur « password », sans connexion avant la dernière. `reset` envoie un code à 6 chiffres (15 minutes, 5 essais, 3 codes par heure et par adresse) ; `reset-check` dit s'il est bon ; `reset-verification` le vérifie encore, change le mot de passe, ferme toutes les sessions du compte, remet à zéro les compteurs d'échecs et connecte. Une adresse sans compte répond exactement comme une autre (même réponse, même vie du code), et seul un compte « mot de passe » reçoit un e-mail. Codes : `convex/passwordReset.ts` (table `passwordResets`, empreintes seulement). « Mot de passe oublié ? » sur la connexion y emmène l'e-mail tapé, par le stockage de l'onglet.
- E-mails : `convex/mail.ts` les envoie par l'API de Resend (domaine kopycat.io), `convex/mailTemplates.ts` les met en forme (canevas « Swarm sans abonnement », direction M2 ; logo `public/media/mail/kopycat-mark.png`). Variables du déploiement : `RESEND_API_KEY` (sans elle, l'envoi échoue en clair dans les journaux de Convex), `MAIL_FROM` facultative (`Kopycat <compte@kopycat.io>` sinon). Banc : `npm run test:mdp`.
- Google ne s'allume que si `AUTH_GOOGLE_ID` et `AUTH_GOOGLE_SECRET` sont posées sur le déploiement ; sans elles, le bouton affiche un message.
- `convex/users.ts` : `viewer` (la personne connectée), et ce que font les Réglages : prénom (rangé dans `displayName`, que la connexion Google ne réécrit pas), mot de passe, e-mail, sessions ouvertes, « Déconnecter les autres », fermeture du compte (mot de passe exigé, ou connexion de moins de 10 minutes pour un compte Google seul ; l'abonnement Whop est résilié d'abord). `convex/session.ts` : une session fermée perd l'accès tout de suite, sans attendre l'expiration du jeton (1 h).

Côté site, `src/auth.js` fait le pont : les formulaires générés reçoivent `auth` par leurs props. Sur le canevas, il manque et une note de maquette s'affiche.

Parcours : inscription ou connexion réussie → `/app` ; déjà connecté sur `/connexion` ou `/inscription` → `/app` ; `/app/…` sans session → `/connexion` ; `/app/deconnexion` → déconnexion puis `/` ; `/app/payer/mensuel` ou `/app/payer/annuel` → page de paiement Whop (voir « Paiement »).

### Paiement (Whop)

`convex/whop.ts` : « Passer Pro » appelle `whop.checkout`, qui crée chez Whop un paiement pour la formule choisie, l'id du compte Kopycat en `metadata.kopycat_user` (un compte déjà Pro est renvoyé vers Réglages › Formule). Whop appelle `POST /whop/webhook` (`convex/http.ts`) : signature vérifiée, chaque événement traité une fois, adhésion rangée dans `subscriptions`, paiement dans `whopPayments`, puis `users.pro` recalculé (vrai tant qu'une adhésion est active, en essai ou en retard de paiement). Réglages › Formule lit `whop.mine` et résilie ou reprend par `whop.setCancel`. À la main : `npx convex run users:setPro '{"email":"…","pro":true}'` (plus `--prod` en production) ; un événement Whop sur ce compte le recalcule. Détail : `docs/donnees-app.md`, « Abonnement ».

Clés de signature des sessions : `node scripts/setup-auth-env.mjs` (dev) ou `node scripts/setup-auth-env.mjs --prod https://swarm-site-one.vercel.app`. Les valeurs ne sont jamais affichées ; relancer change les clés et déconnecte tout le monde.

### Activer Google

1. Console Google Cloud → API et services → Identifiants → Créer un ID client OAuth → Application Web.
2. Origines JavaScript autorisées : `https://swarm-site-one.vercel.app` et `http://localhost:5173`.
3. URI de redirection autorisés : `https://useful-owl-794.eu-west-1.convex.site/api/auth/callback/google` (prod) et `https://blessed-hedgehog-69.eu-west-1.convex.site/api/auth/callback/google` (dev).
4. Poser les deux valeurs sur le déploiement (tableau de bord Convex → Settings → Environment Variables, ou `npx convex env set --prod AUTH_GOOGLE_ID …` puis `AUTH_GOOGLE_SECRET`, et sans `--prod` pour le dev).

### Backend : le déployer

Vercel construit le site avec `scripts/vercel-build.mjs` (qui renvoie à cette section). Si `CONVEX_DEPLOY_KEY` (clé de déploiement de production, tableau de bord Convex → Settings) est réglée dans Vercel, pour l'environnement Production seulement, chaque push sur `main` déploie aussi le backend. Sans elle, le backend se déploie à la main depuis ce dossier, avant de pousser un site qui en dépend : `npx convex deploy --env-file .env.local` (cible : la production du projet « swarm »).

## L'app

Les écrans retenus sur le canevas de l'app (https://claude.ai/artifact/FLjy3nFCy6GKVLEnokWv3u) sont copiés dans `design/app/`, leurs images dans `public/media/app/` (`design/app/media.json` fait le lien avec les `/_blob/…` du canevas). `npm run gen` les convertit dans `src/app/pages/` et écrit `src/app/routes.js` depuis les tables de `scripts/dc2preact.py` :
- `APP_PAGES` : les 13 écrans routés (artboard → adresse → titre de l'onglet) ;
- `APP_COMPONENTS` : les composants que les écrans importent par `<dc-import name="…">` (palette de recherche, ajout à un dossier, nouvelle alerte, en version ordinateur et téléphone), et ceux que `src/app/main.js` monte lui-même : l'aperçu sans abonnement (`ApercuA`, `MApercuApps`), la fenêtre des formules (`FormulesA`, `MFormules`), le panneau du compte (`MenuCompteA`) et les Réglages (`ReglagesA`). Leurs props `on-close` deviennent `onClose`.

Les canevas de l'app portent des données d'exemple tirées du vrai Radar pour se dessiner sans données : la conversion les retire des écrans générés et les range dans `design/app/samples/<Écran>.js`, que seul `scripts/check.mjs` charge ; elle échoue s'il en reste dans `src/app/pages`, et `scripts/check-public.mjs` fait de même sur le build.

La conversion fait aussi : liens `X.dc.html#ancre` → adresse + ancre ; `onChange` d'un champ texte → `onInput` (à chaque frappe, comme sur le canevas) ; échec si un lien vise un artboard sans adresse.

`app.html` + `src/app/main.js` : une seule page (Vercel réécrit `/app/…` vers `/app`). La session n'est vérifiée qu'une fois ; les liens internes changent d'écran sans recharger ; chaque écran se charge à la demande avec son CSS et celui de ses composants ; ⌘K / Ctrl+K clique le déclencheur `[data-cmdk]` de l'écran (la palette) ; une ancre dans l'adresse fait défiler jusqu'à elle. Les écrans reçoivent par leurs props `user` ({ prenom, nom, email, initiale, pro, emailVerified }), `signOut`, `onPlans` (ouvre la fenêtre des formules), `params` et `query` (l'adresse), `data` (leur document), `get` (un autre document), `saved` et `save` (ce que la personne garde).

Données : le vrai Radar, recalculé chaque nuit (cron 1 h 30 UTC, `convex/radarSync.ts` lit l'export de Jarvia et écrit un document par écran dans `boards`). Contrat complet, liens et formes : `docs/donnees-app.md`. Une fiche absente du Radar mène à une page « introuvable », jamais à l'exemple du canevas. Ce que la personne fait est gardé dans son compte (`convex/saved.ts`) : apps/comptes/formats suivis, dossiers, règles d'alerte, déjà lu.

Après chaque passage, `radarStore.purgeTracking` élague les tables de suivi (lectures IA, carrousels, échecs de copie, vieux passages, langues des comptes sortis) ; `syncRuns.counts.storage` relève le stockage des images. `npx convex run radarSync:repairMedia` (ajouter `--prod`) compte les copies HEIC ou non matricielles encore rangées ; avec `'{"apply": true}'`, il les efface.

Vérifier un écran sur les vraies données, sans navigateur : exporter le dev (`npx convex export --path x.zip`, puis `boards/documents.jsonl` → `[[clé, document], …]`) et `BOARDS=boards.json node scripts/render-data.mjs <Composant> <clé>` (variables `SAVED`, `PARAMS`, `QUERY` en tête du script).

Mobile (sous 860 px) : les artboards `design/app/M*` (`APP_MOBILE_PAGES`), tous branchés.

## Lancer en local

```bash
npm install
npx convex dev   # dans un autre terminal : pousse convex/ sur le dev et écrit .env.local
npm run dev
```

En local, les adresses suivent `vercel.json` (lu par `vite.config.js`) : `/app/…` sert l'app, `/compte` redirige, les pages s'ouvrent sans `.html`. `npm run build && npm run preview` sert en plus les en-têtes de `vercel.json`, CSP comprise : ce que la prod refuserait se voit dans la console.

## Déploiement

Vercel, projet relié à ce dépôt : chaque push sur `main` déploie le site en production. La config est dans `vercel.json` : `cleanUrls` (sert `tarifs.html` sur `/tarifs`), réécriture de `/app/…`, cache des fichiers, en-têtes de sécurité (CSP, frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy). Une page qui charge une nouvelle origine (police, image, lecteur) doit l'ajouter à la CSP : `npm run test:vercel` le signale.

## Reste à brancher

- L'envoi des alertes (e-mail, notification) : les règles filtrent l'écran Alertes, rien n'est envoyé.

## À vérifier avant d'en faire la publicité

- Les couvertures de vidéos montrent des créateurs tiers et les logos sont des marques : droit à l'image, usage des marques.
- Les avis et les chiffres affichés sur la landing et les tarifs doivent être vrais (audit du 19/11).
