// Généré par scripts/dc2preact.py — ne pas modifier à la main.
// Adresses de l'app (fixes d'abord) : titre de l'onglet, clé des données (convex/boards.ts),
// écran desktop (load) et, s'il existe, écran mobile (loadMobile).
export const ROUTES = [
  { path: '/app', title: "Accueil", data: "home", load: () => Promise.all([import('./pages/Accueil.js'), import('./styles/a-acc.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/apps', title: "Apps", data: "apps", load: () => Promise.all([import('./pages/Apps.js'), import('./styles/a-apps.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/formats', title: "Formats", data: "formats", load: () => Promise.all([import('./pages/Formats.js'), import('./styles/a-fmts.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/createurs', title: "Créateurs", data: "creators:FR", load: () => Promise.all([import('./pages/Createurs.js'), import('./styles/a-crea.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/createurs/cartes', title: "Créateurs", data: "creators:FR", load: () => Promise.all([import('./pages/CreateursCartes.js'), import('./styles/a-creb.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/dossiers', title: "Dossiers", data: null, load: () => Promise.all([import('./pages/Dossiers.js'), import('./styles/a-dos.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/alertes', title: "Alertes", data: "alerts", load: () => Promise.all([import('./pages/Alertes.js'), import('./styles/a-ale.css'), import('./styles/a-nal.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/compte', title: "Compte", data: null, load: () => Promise.all([import('./pages/Compte.js'), import('./styles/a-cpt.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/apps/:slug', title: "App", data: "app:{slug}", load: () => Promise.all([import('./pages/FicheApp.js'), import('./styles/a-fapp.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/videos/:id', title: "Vidéo", data: "video:{id}", load: () => Promise.all([import('./pages/Video.js'), import('./styles/a-vid.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/formats/:id', title: "Format", data: "format:{id}", load: () => Promise.all([import('./pages/FicheFormat.js'), import('./styles/a-ffmt.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/createurs/:handle', title: "Créateur", data: "creator:{handle}", load: () => Promise.all([import('./pages/FicheCreateur.js'), import('./styles/a-fcre.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  { path: '/app/dossiers/:id', title: "Dossier", data: null, load: () => Promise.all([import('./pages/Dossier.js'), import('./styles/a-dosb.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
];
