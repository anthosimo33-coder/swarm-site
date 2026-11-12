// Build de Vercel.
// - Si CONVEX_DEPLOY_KEY est réglée dans Vercel (environnement Production seulement),
//   le backend Convex est déployé dans le même build que le site : les deux restent en phase.
//   Convex passe alors au site l'adresse du backend (VITE_CONVEX_URL).
// - Sinon, seul le site est construit, branché sur le backend décrit dans .env.production ;
//   le backend se déploie à la main (README, « Backend »).
import { execSync } from 'node:child_process';

const command = process.env.CONVEX_DEPLOY_KEY ? 'npx convex deploy --cmd "npm run build"' : 'npm run build';
console.log(`> ${command}`);
execSync(command, { stdio: 'inherit' });
