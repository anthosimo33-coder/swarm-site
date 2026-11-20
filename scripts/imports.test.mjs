// Chaque <dc-import> des canevas de l'app (design/app/*.dc.html) passe toutes les props que le composant importé lit
// (this.props.x, ou x lu sur un alias de this.props). Audit Q10 (19/11) : MAlertes ne passait pas get à MNouvelleAlerte,
// et « Nouvelle alerte » sur téléphone ne proposait aucun marché.   Usage : npm run test:imports
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../design/app');
const src = Object.fromEntries(fs.readdirSync(dir).filter((f) => f.endsWith('.dc.html')).map((f) => [f.replace('.dc.html', ''), fs.readFileSync(path.join(dir, f), 'utf8')]));
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const esc = (s) => s.replace(/[.$]/g, '\\$&');
/** Les props lues par le script d'un canevas : this.props.x, et x sur une variable qui vaut this.props. */
const reads = (name) => {
  const s = src[name] ?? '';
  const script = s.slice(s.indexOf('data-dc-script'));
  const aliases = new Set(['this.props']);
  for (const m of script.matchAll(/(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*this\.props\s*(?:\|\|\s*\{\}\s*)?[;,\n]/g)) aliases.add(m[1]);
  const out = new Set();
  for (const a of aliases) for (const m of script.matchAll(new RegExp(`(?<![\\w$.])${esc(a)}(?:\\s*&&\\s*${esc(a)})?\\??\\.([A-Za-z_$][\\w$]*)`, 'g'))) out.add(m[1]);
  return out;
};
let fail = 0, n = 0;
for (const [host, s] of Object.entries(src)) for (const m of s.matchAll(/<dc-import\s+name="([^"]+)"([^>]*)>/g)) {
  n++;
  const passed = new Set([...m[2].matchAll(/\s([a-z][a-z-]*)="/g)].map((x) => camel(x[1])).filter((x) => !x.startsWith('hint')));
  const missing = [...reads(m[1])].filter((p) => !passed.has(p));
  if (missing.length) { fail++; console.log(`ÉCHEC ${host} importe ${m[1]} sans ${missing.join(', ')} (lu par ${m[1]}.dc.html)`); }
}
console.log(fail ? `${fail} import(s) incomplet(s) sur ${n}` : `les ${n} imports passent toutes les props lues`);
process.exit(fail ? 1 : 0);
