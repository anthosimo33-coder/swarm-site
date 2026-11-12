# Swarm — site vitrine

Landing page et page tarifs de Swarm (nom provisoire) : les apps et les formats qui explosent en ce moment sur TikTok, Instagram et YouTube Shorts, sur n'importe quel marché, et les créateurs derrière.

- `/` : la landing page
- `/tarifs` : la page tarifs (un seul plan, Pro)
- `/connexion` et `/inscription` : les écrans retenus sur le canevas de l'app (Connexion A, Inscription A), rendus responsives

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
- « Trouver mon app » (`#quiz`) et « Passer Pro » (`#paiement`) mènent à `/inscription`, « Se connecter » (`#connexion`) à `/connexion` ;
- la barre « Je veux lancer… » du hero est un vrai champ : la recherche part vers `/inscription?q=…`, qui la rappelle au-dessus du formulaire ;
- les keyframes sont préfixées par page (`lp-`, `lpm-`, `tf-`, `tfm-`) pour qu'elles ne se marchent pas dessus.

## Lancer en local

```bash
npm install
npm run dev
```

## Déploiement

Vercel, projet relié à ce dépôt : chaque push sur `main` déploie en production. La config est dans `vercel.json` (`cleanUrls` sert `tarifs.html` sur `/tarifs`).

## Reste à brancher

- La vidéo motion sous le hero (l'encart 16:9 l'attend).
- L'authentification : aucun compte n'est créé. « Créer mon compte » mène aux tarifs ; « Se connecter » affiche que l'espace membre n'est pas encore ouvert.
- Le paiement et les pages légales (`#cgv`, `#confidentialite`, `#mentions`, `#contact`).
- Les avis : emplacements entre crochets, à remplacer par de vrais avis.
- Les couvertures de vidéos montrent des créateurs tiers et les logos sont des marques : à valider (droit à l'image, usage des marques) avant d'en faire de la publicité.
- Les chiffres affichés (+1 000 apps, +100 000 comptes, TikTok + Instagram + YouTube Shorts) doivent être vrais au lancement.
