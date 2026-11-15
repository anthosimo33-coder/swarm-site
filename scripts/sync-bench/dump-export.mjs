// Copie locale de l'export du Radar (une ligne = une page de réponse), pour le banc mémoire de la synchro.
import fs from "node:fs";
const base = "https://giddy-bass-969.eu-west-1.convex.site", secret = process.env.SECRET, dir = process.argv[2];
for (const table of ["apps", "tracked", "trackedVideos", "formats", "signals"]) {
  const out = fs.openSync(`${dir}/${table}.jsonl`, "w");
  let cursor = null, n = 0, rows = 0;
  for (;;) {
    const url = `${base}/swarm/export?table=${table}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
    if (!res.ok) throw new Error(`${table} HTTP ${res.status}`);
    const text = await res.text(); const body = JSON.parse(text);
    fs.writeSync(out, text.replace(/\n/g, " ") + "\n"); n++; rows += body.rows.length;
    if (body.done) break; cursor = body.cursor;
  }
  fs.closeSync(out); console.log(table, "pages", n, "lignes", rows);
}
