// Le cadre de l'app avant son code (app.html, maquette 1A du 20/11) : chargé dans le <head> sans bloquer la page.
// Il dit au cadre statique la rubrique de l'adresse (rail et barre du bas allumés au bon endroit), la forme de son
// en-tête sur téléphone, et l'initiale du compte gardée de la dernière visite. Un fichier à part et non un script en
// ligne : la CSP (vercel.json) n'en permet aucun. Mêmes règles que src/app/skeleton.js (rubriqueOf, kindOf), vérifié par
// scripts/app.test.mjs. Aucune donnée n'en sort : seulement des attributs posés sur <html>.
(function () {
  var d = document.documentElement;
  var p = location.pathname.replace(/\/+$/, '') || '/';
  var memo = null;
  try { memo = JSON.parse(localStorage.getItem('kopycat.cadre') || 'null'); } catch (e) { memo = null; }
  // Sans abonnement (dernière visite), seuls Apps, ses fiches, les vidéos et le compte s'ouvrent : le reste mène à Apps.
  var open = /^\/app\/(apps(\/[^/]+)?|videos\/[^/]+|compte)$/.test(p);
  if (memo && memo.p === 0 && !open) p = '/app/apps';
  var m = /^\/app\/(apps|formats|createurs|alertes|dossiers)(\/|$)/.exec(p);
  var rub = p === '/app' || p === '/app/compte' ? 'accueil' : m ? m[1] : '';
  var kind = /^\/app\/videos\/[^/]+$/.test(p) ? 'video'
    : /^\/app\/dossiers\/[^/]+$/.test(p) ? 'folder'
    : /^\/app\/(apps|formats)\/[^/]+$/.test(p) || (/^\/app\/createurs\/[^/]+$/.test(p) && p !== '/app/createurs/cartes') ? 'fiche'
    : 'list';
  d.setAttribute('data-af', rub);
  d.setAttribute('data-af-k', kind);
  var ini = memo && typeof memo.i === 'string' ? memo.i : '';
  if (/^[A-Z0-9À-ÖØ-Þ]$/.test(ini)) d.style.setProperty('--af-ini', '"' + ini + '"');
})();
