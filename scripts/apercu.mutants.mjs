// Banc de mutants du verrou d'aperçu (audit Q4) : chaque mutant casse convex/boards.ts d'une façon qui ouvrirait des
// données payantes ou masquées ; scripts/apercu.test.mjs doit échouer sur chacun.  Usage : node scripts/apercu.mutants.mjs
// Un mutant dont le texte n'existe plus dans boards.ts compte comme un échec : le banc suit le code, à remettre à jour.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(path.join(root, 'convex/boards.ts'), 'utf8');
const MUTANTS = JSON.parse(readFileSync(path.join(root, 'scripts/apercu.mutants.json'), 'utf8'));
const dir = mkdtempSync(path.join(tmpdir(), 'mutants-'));
let survived = 0;
for (const [name, from, to] of MUTANTS) {
  if (!src.includes(from)) { console.log(`INAPPLICABLE ${name}`); survived++; continue; }
  const f = path.join(dir, 'boards.ts');
  writeFileSync(f, src.replace(from, to));
  const r = spawnSync(process.execPath, [path.join(root, 'scripts/apercu.test.mjs'), f], { encoding: 'utf8' });
  const fails = (r.stdout.match(/^ÉCHEC.*$/gm) ?? []);
  // Un mutant qui ne meurt que d'une erreur de code (variable disparue…) ne prouve rien : le banc est à remettre à jour.
  if (/ReferenceError|is not defined|SyntaxError/.test(r.stdout + r.stderr)) { survived++; console.log(`INVALIDE ${name} : erreur de code, pas un échec du verrou (${(r.stdout + r.stderr).match(/(ReferenceError|SyntaxError)[^)"]*/)?.[0] ?? ''})`); continue; }
  const killed = r.status !== 0 && fails.length > 0;
  if (!killed) survived++;
  console.log(`${killed ? 'TUÉ   ' : 'SURVIT'} ${name} (${fails.length} échec(s)${r.status !== 0 && !fails.length ? ', sortie ' + r.status + ' sans échec : ' + (r.stderr || r.stdout).slice(0, 160) : ''})${fails[0] ? ' : ' + fails[0].slice(6, 110) : ''}`);
}
rmSync(dir, { recursive: true, force: true });
console.log(survived ? `${survived} mutant(s) non attrapé(s)` : `les ${MUTANTS.length} mutants sont attrapés`);
process.exit(survived ? 1 : 0);
