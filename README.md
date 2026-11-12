# Swarm — site vitrine

Landing page et page tarifs de Swarm (nom provisoire) : les apps et les formats qui explosent en ce moment sur TikTok, Instagram et YouTube Shorts, sur n'importe quel marché, et les créateurs derrière.

- `/` : la landing page
- `/tarifs` : la page tarifs (un seul plan, Pro)
- `/connexion` et `/inscription` : les écrans retenus sur le canevas de l'app (Connexion A, Inscription A), rendus responsives, branchés sur un vrai backend (voir « Comptes »)
- `/compte` : la page Mon compte, réservée aux personnes connectées

Chaque page existe en version desktop et en version mobile. La version mobile s'affiche sous 860 px de large, et la page bascule si la fenêtre change de taille (`src/runtime.js`, `Responsive`).

## D'où vient le code

Les pages sont dessinées sur le canevas de design (artboards `LP`, `LPMobile`, `Tarifs`, `TarifsMobile`, `Connexion`, `Inscription`). Connexion et Inscription utilisent le design system Swarm (`src/styles/ds/`, copie de `design/ds/swarm/`). Leurs sources sont copiées dans `design/*.dc.html`, puis converties en composants Preact par `scripts/dc2preact.py` :

| Source | Composant | CSS |
| --- | --- | --- |
| `design/LP.dc.html` | `src/pages/LP.js` | `src/styles/lp.css` |
| `design/LPMobile.dc.html` | `src/pages/LPMobile.js` | `src/styles/lpm.css` |
| `design/Tarifs.dc.html` | `src/pages/Tarifs.js` | `src/styles/tf.css` |
| `design/TarifsMobile.dc.html` | `src/pages/TarifsMobile.js` | `src/styles/tfm.css` |
| `design/Connexion.dc.html` | `src/pages/Connexion.js` | `src/styles/cx.css` + design system |
| `design/Inscription.dc.html` | `src/pages/Inscription.js` | `src/styles/ins.css` + design system |
| `design/Compte.dc.html` | `src/pages/Compte.js` | `src/styles/cpt.css` + design system |

Les fichiers de `src/pages` et `src/styles` sont générés : on ne les modifie pas à la main. Pour changer une page, on modifie l'artboard, on recopie le `.dc.html` dans `design/`, puis :

```bash
npm run gen     # régénère src/pages et src/styles
npm run check   # rend chaque page et signale les trous vides
npm run build
```

Les images (logos des apps, couvertures des vidéos) sont envoyées sur le canevas et servies sous `/_blob/<id>`. Le site sert les mêmes fichiers depuis `public/media/`, et `design/media.json` fait le lien entre les deux.

Ce que fait la conversion :
- les adresses d'images `/_blob/<id>` du canevas deviennent `/media/<fichier>` ;
- les liens entre artboards deviennent des routes (`/`, `/tarifs`), et depuis les tarifs, les liens vers la LP pointent sur la bonne section ;
- « Trouver mon app » (`#quiz`) et « Passer Pro » (`#paiement`) mènent à `/inscription`, « Se connecter » (`#connexion`) à `/connexion`, et `Compte.dc.html` à `/compte` ;
- la barre « Je veux lancer… » du hero est un vrai champ : la recherche part vers `/inscription?q=…`, qui la rappelle au-dessus du formulaire ;
- les keyframes sont préfixées par page (`lp-`, `lpm-`, `tf-`, `tfm-`) pour qu'elles ne se marchent pas dessus.

## Comptes (Convex Auth)

Le backend est un projet Convex à part, « swarm » (dossier `convex/`), sans lien avec Jarvia :
- dev : `blessed-hedgehog-69` (utilisé par `npm run dev`, adresse dans `.env.local`, non versionné) ;
- production : `useful-owl-794` (adresse publique dans `.env.production`).

Ce que fait le backend :
- `convex/auth.ts` : e-mail + mot de passe (8 caractères minimum, e-mail ramené en minuscules) et Google. Le fournisseur mot de passe est écrit sur l'API publique de Convex Auth pour que les erreurs (identifiants incorrects, compte déjà existant, trop de tentatives) arrivent au site sous forme de codes (`convex/authErrors.ts`) : Convex masque en production le message des erreurs ordinaires. Une inscription avec un e-mail déjà pris ET le bon mot de passe connecte la personne.
- Google ne s'allume que si `AUTH_GOOGLE_ID` et `AUTH_GOOGLE_SECRET` sont posées sur le déploiement ; sans elles, le bouton affiche un message.
- `convex/users.ts` : `viewer`, la personne connectée (page Mon compte).

Côté site, `src/auth.js` fait le pont : les pages générées reçoivent `auth` (connexion, inscription) ou `account` (Mon compte) par leurs props. Sur le canevas, ces props manquent et les pages gardent leur comportement de maquette.

Parcours :
- inscription réussie → `/tarifs` ; connexion réussie → `/compte` ; déjà connecté sur `/connexion` ou `/inscription` → `/compte` ;
- `/compte` sans session → `/connexion` ; « Se déconnecter » → `/`.

Clés de signature des sessions : `node scripts/setup-auth-env.mjs` (dev) ou `node scripts/setup-auth-env.mjs --prod https://swarm-site-one.vercel.app`. Les valeurs ne sont jamais affichées ; relancer change les clés et déconnecte tout le monde.

### Activer Google

1. Console Google Cloud → API et services → Identifiants → Créer un ID client OAuth → Application Web.
2. Origines JavaScript autorisées : `https://swarm-site-one.vercel.app` et `http://localhost:5173`.
3. URI de redirection autorisés : `https://useful-owl-794.eu-west-1.convex.site/api/auth/callback/google` (prod) et `https://blessed-hedgehog-69.eu-west-1.convex.site/api/auth/callback/google` (dev).
4. Poser les deux valeurs sur le déploiement (tableau de bord Convex → Settings → Environment Variables, ou `npx convex env set --prod AUTH_GOOGLE_ID …` puis `AUTH_GOOGLE_SECRET`, et sans `--prod` pour le dev).

### Déployer le backend

Vercel construit le site avec `scripts/vercel-build.mjs`. Si `CONVEX_DEPLOY_KEY` (clé de déploiement de production, tableau de bord Convex → Settings) est réglée dans Vercel, pour l'environnement Production seulement, chaque push sur `main` déploie aussi le backend. Sans elle, le backend se déploie à la main depuis ce dossier, avant de pousser un site qui en dépend : `npx convex deploy --env-file .env.local` (cible : la production du projet « swarm »).

## Lancer en local

```bash
npm install
npx convex dev   # dans un autre terminal : pousse convex/ sur le dev et écrit .env.local
npm run dev
```

## Déploiement

Vercel, projet relié à ce dépôt : chaque push sur `main` déploie en production. La config est dans `vercel.json` (`cleanUrls` sert `tarifs.html` sur `/tarifs`).

## Reste à brancher

- La vidéo motion sous le hero (l'encart 16:9 l'attend).
- « Mot de passe oublié » : il faut un service d'envoi d'e-mails (le lien affiche pour l'instant que la réinitialisation n'est pas ouverte).
- L'espace membre : `/compte` ne montre que l'e-mail et l'abonnement (aucun tant que le paiement n'existe pas).
- Le paiement et les pages légales (`#cgv`, `#confidentialite`, `#mentions`, `#contact`).
- Les avis : emplacements entre crochets, à remplacer par de vrais avis.
- Les couvertures de vidéos montrent des créateurs tiers et les logos sont des marques : à valider (droit à l'image, usage des marques) avant d'en faire de la publicité.
- Les chiffres affichés (+1 000 apps, +100 000 comptes, TikTok + Instagram + YouTube Shorts) doivent être vrais au lancement.
