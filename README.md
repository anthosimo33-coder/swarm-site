# Swarm — site vitrine

Landing page et page tarifs de Swarm (nom provisoire) : les apps et les formats qui explosent en ce moment sur TikTok, Instagram et YouTube Shorts, sur n'importe quel marché, et les créateurs derrière.

- `/` : la landing page
- `/tarifs` : la page tarifs (un seul plan, Pro)

Chaque page existe en version desktop et en version mobile. La version mobile s'affiche sous 860 px de large, et la page bascule si la fenêtre change de taille (`src/runtime.js`, `Responsive`).

## D'où vient le code

Les pages sont dessinées sur le canevas de design (artboards `LP`, `LPMobile`, `Tarifs`, `TarifsMobile`). Leurs sources sont copiées dans `design/*.dc.html`, puis converties en composants Preact par `scripts/dc2preact.py` :

| Source | Composant | CSS |
| --- | --- | --- |
| `design/LP.dc.html` | `src/pages/LP.js` | `src/styles/lp.css` |
| `design/LPMobile.dc.html` | `src/pages/LPMobile.js` | `src/styles/lpm.css` |
| `design/Tarifs.dc.html` | `src/pages/Tarifs.js` | `src/styles/tf.css` |
| `design/TarifsMobile.dc.html` | `src/pages/TarifsMobile.js` | `src/styles/tfm.css` |

Les fichiers de `src/pages` et `src/styles` sont générés : on ne les modifie pas à la main. Pour changer une page, on modifie l'artboard, on recopie le `.dc.html` dans `design/`, puis :

```bash
npm run gen     # régénère src/pages et src/styles
npm run check   # rend chaque page et signale les trous vides
npm run build
```

Ce que fait la conversion :
- les liens entre artboards deviennent des routes (`/`, `/tarifs`), et depuis les tarifs, les liens vers la LP pointent sur la bonne section ;
- `#quiz` mène à `/tarifs`, puisqu'il n'y a pas de diagnostic gratuit ;
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
- La connexion (`#connexion`), le paiement (`#paiement`) et les pages légales (`#cgv`, `#confidentialite`, `#mentions`, `#contact`).
- Les avis : emplacements entre crochets, à remplacer par de vrais avis.
- Les chiffres affichés (+1 000 apps, +100 000 comptes, TikTok + Instagram + YouTube Shorts) doivent être vrais au lancement.
