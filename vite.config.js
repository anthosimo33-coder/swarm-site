import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// En local, /tarifs sert tarifs.html comme sur Vercel (cleanUrls).
const cleanUrls = {
  name: 'clean-urls',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/tarifs' || req.url.startsWith('/tarifs?')) req.url = req.url.replace('/tarifs', '/tarifs.html');
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/tarifs' || req.url.startsWith('/tarifs?')) req.url = req.url.replace('/tarifs', '/tarifs.html');
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
      },
    },
  },
});
