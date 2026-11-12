// Généré par scripts/dc2preact.py — ne pas modifier à la main.
// Adresse de l'app -> titre de l'onglet, écran desktop (load) et, s'il existe, écran mobile (loadMobile).
export const ROUTES = {
  '/app': { title: "Accueil", load: () => Promise.all([import('./pages/Accueil.js'), import('./styles/a-acc.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/apps': { title: "Apps", load: () => Promise.all([import('./pages/Apps.js'), import('./styles/a-apps.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/apps/astra-ai': { title: "Astra AI", load: () => Promise.all([import('./pages/FicheApp.js'), import('./styles/a-fapp.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/videos/learnwithjoel1': { title: "Vidéos", load: () => Promise.all([import('./pages/Video.js'), import('./styles/a-vid.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/formats': { title: "Formats", load: () => Promise.all([import('./pages/Formats.js'), import('./styles/a-fmts.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/formats/ich-losche-das-in-2h': { title: "Format", load: () => Promise.all([import('./pages/FicheFormat.js'), import('./styles/a-ffmt.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/createurs': { title: "Créateurs", load: () => Promise.all([import('./pages/Createurs.js'), import('./styles/a-crea.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/createurs/cartes': { title: "Créateurs", load: () => Promise.all([import('./pages/CreateursCartes.js'), import('./styles/a-creb.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/createurs/zinedine-gsbb': { title: "Créateur", load: () => Promise.all([import('./pages/FicheCreateur.js'), import('./styles/a-fcre.css'), import('./styles/a-ajd.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/dossiers': { title: "Dossiers", load: () => Promise.all([import('./pages/Dossiers.js'), import('./styles/a-dos.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/dossiers/etudes': { title: "Dossier", load: () => Promise.all([import('./pages/Dossier.js'), import('./styles/a-dosb.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/alertes': { title: "Alertes", load: () => Promise.all([import('./pages/Alertes.js'), import('./styles/a-ale.css'), import('./styles/a-nal.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
  '/app/compte': { title: "Compte", load: () => Promise.all([import('./pages/Compte.js'), import('./styles/a-cpt.css'), import('./styles/a-pal.css')]).then(([m]) => m) },
};
