// Build de Vercel.
// - Si CONVEX_DEPLOY_KEY est réglée dans Vercel (environnement Production seulement),
//   le backend Convex est déployé dans le même build que le site : les deux restent en phase.
//   Convex passe alors au site l'adresse du backend (VITE_CONVEX_URL).
// - Sinon, seul le site est construit, branché sur le backend décrit dans .env.production ;
//   le backend se déploie à la main (README, « Backend »).
import { execSync } from 'node:child_process';

// Puis scripts/check-public.mjs : le build échoue si un fichier public livre des données du Radar (audit S4).
const build = 'npm run build && node scripts/check-public.mjs';
const command = process.env.CONVEX_DEPLOY_KEY ? `npx convex deploy --cmd "${build}"` : build;
console.log(`> ${command}`);
execSync(command, { stdio: 'inherit' });
