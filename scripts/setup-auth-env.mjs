// Pose sur un déploiement Convex les variables dont Convex Auth a besoin :
// une paire de clés neuve pour signer les jetons (JWT_PRIVATE_KEY, JWKS)
// et l'adresse du site (SITE_URL), vers laquelle Google renvoie la personne.
//
//   node scripts/setup-auth-env.mjs                      déploiement de dev, SITE_URL http://localhost:5173
//   node scripts/setup-auth-env.mjs --prod <url du site> déploiement de production
//
// Les valeurs ne sont jamais affichées. Relancer le script change les clés,
// ce qui déconnecte tout le monde : à ne faire qu'à l'installation ou en cas de fuite.
import { generateKeyPairSync } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const prod = process.argv.includes('--prod');
const siteUrl = prod ? process.argv[process.argv.indexOf('--prod') + 1] : 'http://localhost:5173';
if (!siteUrl || !/^https?:\/\/[^/]+$/.test(siteUrl)) {
  console.error('Adresse du site attendue après --prod, sans / final (ex. https://swarm-site-one.vercel.app).');
  process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const values = {
  JWT_PRIVATE_KEY: privateKey.export({ type: 'pkcs8', format: 'pem' }).trimEnd().replace(/\n/g, ' '),
  JWKS: JSON.stringify({ keys: [{ use: 'sig', alg: 'RS256', ...publicKey.export({ format: 'jwk' }) }] }),
  SITE_URL: siteUrl,
};

for (const [name, value] of Object.entries(values)) {
  try {
    execFileSync('npx', ['convex', 'env', 'set', ...(prod ? ['--prod'] : []), name, '--', value], { stdio: 'pipe' });
    console.log(`${name} posée sur ${prod ? 'la production' : 'le dev'}`);
  } catch (error) {
    const out = `${error.stdout ?? ''}${error.stderr ?? ''}`.split(value).join('[masqué]');
    console.error(`${name} : échec\n${out}`);
    process.exit(1);
  }
}
