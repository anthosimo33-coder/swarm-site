import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// En local, /tarifs sert tarifs.html comme sur Vercel (cleanUrls), et toute adresse /app/… sert
// app.html, comme la réécriture de vercel.json : l'app choisit l'écran elle-même.
const APP = /^\/app(?:\/[^?.]*)?(?=$|\?)/;
const cleanUrls = {
  name: 'clean-urls',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      req.url = req.url.replace(/^\/(tarifs|connexion|inscription)(?=$|\?)/, '/$1.html').replace(APP, '/app.html');
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      req.url = req.url.replace(/^\/(tarifs|connexion|inscription)(?=$|\?)/, '/$1.html').replace(APP, '/app.html');
      next();
    });
  },
};

export default defineConfig({
  plugins: [cleanUrls],
  // Convex et Convex Auth sont écrits pour React : Preact les fait tourner via preact/compat.
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        tarifs: resolve(import.meta.dirname, 'tarifs.html'),
        connexion: resolve(import.meta.dirname, 'connexion.html'),
        inscription: resolve(import.meta.dirname, 'inscription.html'),
        app: resolve(import.meta.dirname, 'app.html'),
      },
    },
  },
});
