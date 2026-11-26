import { defineConfig } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * En local, les adresses suivent vercel.json, lu ici : redirections, pages sans « .html » (cleanUrls), réécritures
 * (toute adresse /app/… sert app.html : l'app choisit l'écran elle-même). L'aperçu (`npm run preview`) sert aussi ses
 * en-têtes, CSP comprise, pour voir en local ce que la prod refusera ; `npm run dev` non (le rechargement à chaud de
 * Vite injecte des scripts que la CSP refuse).
 * Audit Q49 (19/11) : ce routage était recopié deux fois ici, et divergeait de vercel.json : une adresse avec un point
 * (/app/createurs/zinedine.gsbb) et /compte servaient la landing en local.
 */
const VERCEL = JSON.parse(readFileSync(resolve(import.meta.dirname, 'vercel.json'), 'utf8'));
/**
 * Un motif de vercel.json (« /app/:path* », « /assets/(.*) », « /(media|flags)/(.*) ») en expression régulière, comme
 * path-to-regexp : « (…) » est une expression telle quelle, « /:nom* » zéro ou plusieurs segments, « :nom » un segment.
 */
export const pattern = (source) => {
  let re = '';
  for (let i = 0; i < source.length;) {
    if (source[i] === '(') {
      let depth = 0, j = i;
      for (; j < source.length; j++) { if (source[j] === '(') depth++; else if (source[j] === ')' && --depth === 0) break; }
      re += source.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    const m = source.slice(i).match(/^\/:[A-Za-z_]\w*\*/) ?? source.slice(i).match(/^:[A-Za-z_]\w*/);
    if (m) { re += m[0].endsWith('*') ? '(?:/.*)?' : '[^/]+'; i += m[0].length; continue; }
    re += /[.+?^${}|[\]\\*]/.test(source[i]) ? '\\' + source[i] : source[i];
    i++;
  }
  return new RegExp(`^${re}$`);
};

/**
 * Ce que Vercel fait d'une adresse : { redirect, status } pour une redirection, sinon { url } réécrite. `exists(chemin)`
 * dit si un fichier statique existe (servi avant toute réécriture, comme sur Vercel).
 */
export function route(url, exists) {
  const [path, query = ''] = url.split(/\?(.*)/s);
  const q = query ? `?${query}` : '';
  for (const r of VERCEL.redirects ?? []) if (pattern(r.source).test(path)) return { redirect: r.destination + q, status: r.statusCode ?? (r.permanent ? 308 : 307) };
  const clean = (p) => (VERCEL.cleanUrls && !/\.[a-z0-9]+$/i.test(p) && exists(`${p === '/' ? '/index' : p}.html`) ? `${p === '/' ? '/index' : p}.html` : null);
  if (exists(path) && !path.endsWith('/')) return { url };
  const direct = clean(path);
  if (direct) return { url: direct + q };
  for (const r of VERCEL.rewrites ?? []) if (pattern(r.source).test(path)) return { url: (clean(r.destination) ?? r.destination) + q };
  return { url };
}
/** Les en-têtes que vercel.json pose sur un chemin (une règle plus bas l'emporte sur une même clé). */
export function headersOf(path) {
  const out = {};
  for (const rule of VERCEL.headers ?? []) if (pattern(rule.source).test(path)) for (const h of rule.headers) out[h.key] = h.value;
  return out;
}

const vercelRoutes = (withHeaders) => (server, roots) => {
  const exists = (p) => roots.some((r) => existsSync(resolve(r, '.' + decodeURIComponent(p))) && !p.endsWith('/'));
  server.middlewares.use((req, res, next) => {
    const r = route(req.url ?? '/', exists);
    if (r.redirect) { res.statusCode = r.status; res.setHeader('Location', r.redirect); res.end(); return; }
    if (withHeaders) for (const [k, val] of Object.entries(headersOf((req.url ?? '/').split('?')[0]))) res.setHeader(k, val);
    req.url = r.url;
    next();
  });
};
const local = {
  name: 'vercel-routes',
  configureServer(server) { vercelRoutes(false)(server, [import.meta.dirname, resolve(import.meta.dirname, 'public')]); },
  configurePreviewServer(server) { vercelRoutes(true)(server, [resolve(import.meta.dirname, VERCEL.outputDirectory ?? 'dist')]); },
};

/**
 * Landing, tarifs et simulateur : chaque version (ordinateur, téléphone) est un morceau à part, chargé à la demande
 * (src/runtime.js, mountResponsive ; audit F23). Pour qu'il n'y ait pas d'aller-retour en plus, la page HTML le précharge dès le <head>,
 * celui de la version qui s'affichera seulement : <link rel="preload" as="script" media="…">, la condition de
 * MOBILE_QUERY ou son contraire. Pas de script en ligne (la CSP de vercel.json n'en permet aucun).
 */
const VARIANTS = {
  'index.html': ['src/pages/LP.js', 'src/pages/LPMobile.js'],
  'tarifs.html': ['src/pages/Tarifs.js', 'src/pages/TarifsMobile.js'],
  'simulateur.html': ['src/pages/Simulateur.js', 'src/pages/SimulateurMobile.js'],
};
const variantPreload = {
  name: 'variant-preload',
  apply: 'build',
  async transformIndexHtml(html, ctx) {
    const pair = VARIANTS[ctx.filename.split('/').pop()];
    if (!pair || !ctx.bundle) return html;
    const { MOBILE_QUERY } = await import('./src/runtime.js');
    const media = [`not (${MOBILE_QUERY.split(', ').map((q) => `(${q})`).join(' or ')})`, MOBILE_QUERY];
    const chunk = (src) => Object.values(ctx.bundle).find((c) => c.type === 'chunk' && c.facadeModuleId === resolve(import.meta.dirname, src));
    const tags = pair.map((src, i) => {
      const c = chunk(src);
      if (!c) throw new Error(`variant-preload : pas de morceau à part pour ${src} (encore importé en statique ?)`);
      return { tag: 'link', attrs: { rel: 'preload', as: 'script', crossorigin: '', href: `/${c.fileName}`, media: media[i] }, injectTo: 'head' };
    });
    return { html, tags };
  },
};

/**
 * Le cadre de l'app (app.html, maquette 1A du 20/11) : les feuilles de style de la page passent dans le <body>, juste
 * avant l'app, après le cadre dessiné en styles en ligne. Dans le <head>, elles retenaient la première image tant
 * qu'elles n'étaient pas arrivées (mesuré en 3G, cache vide : écran noir 1,9 s) ; le cadre s'affiche maintenant dès que
 * la page arrive. Le code de l'app attend toujours ces feuilles avant de tourner (une feuille en attente retient les
 * scripts) : rien ne s'affiche sans ses styles.
 */
const frameFirst = {
  name: 'app-frame-first',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      if (!ctx.filename.endsWith('/app.html')) return html;
      const sheets = [];
      const rest = html.replace(/\n?[ \t]*<link\b[^>]*\brel="stylesheet"[^>]*>/g, (tag) => { sheets.push(tag.trim()); return ''; });
      if (!sheets.length || !rest.includes('<div id="app">')) return html;
      return rest.replace('<div id="app">', `${sheets.join('\n    ')}\n    <div id="app">`);
    },
  },
};

export default defineConfig({
  plugins: [local, variantPreload, frameFirst],
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
        simulateur: resolve(import.meta.dirname, 'simulateur.html'),
        connexion: resolve(import.meta.dirname, 'connexion.html'),
        inscription: resolve(import.meta.dirname, 'inscription.html'),
        motDePasse: resolve(import.meta.dirname, 'mot-de-passe-oublie.html'),
        adresse: resolve(import.meta.dirname, 'confirmer-adresse.html'),
        app: resolve(import.meta.dirname, 'app.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
});
