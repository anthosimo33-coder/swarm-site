import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// En local, /tarifs sert tarifs.html comme sur Vercel (cleanUrls).
const cleanUrls = {
  name: 'clean-urls',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      req.url = req.url.replace(/^\/(tarifs|connexion|inscription)(?=$|\?)/, '/$1.html');
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      req.url = req.url.replace(/^\/(tarifs|connexion|inscription)(?=$|\?)/, '/$1.html');
      next();
    });
  },
};

export default defineConfig({
  plugins: [cleanUrls],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        tarifs: resolve(import.meta.dirname, 'tarifs.html'),
        connexion: resolve(import.meta.dirname, 'connexion.html'),
        inscription: resolve(import.meta.dirname, 'inscription.html'),
      },
    },
  },
});
