// Admin › Radar (/admin, onglet Radar) : piloter le Radar déménagé de Jarvia le 20/11/2026 (convex/radar/). Apps
// suivies et leur réseau, ajout d'une app ou d'un compte, apps candidates, crédits ScrapeCreators. Réservé aux e-mails
// d'ADMIN_EMAILS (convex/radar/functions.ts). Lu à la demande (bouton Rafraîchir), jamais en abonnement : la liste
// relit les ~2 200 apps, et une page laissée ouverte la relirait à chaque écriture du Radar.
import { h } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api.js';

const nf = new Intl.NumberFormat('fr-FR');
const num = (n) => (n === null || n === undefined ? '—' : nf.format(n));
const usd = (n) => (n === null || n === undefined ? '—' : n.toLocaleString('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }));
const when = (t) => (t ? new Date(t).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'jamais');
const errText = (e) => e?.data?.message ?? e?.message ?? String(e);

const FILTERS = [['active', 'Suivies'], ['trial', 'À l’essai'], ['paused', 'En pause'], ['all', 'Toutes']];
const stateOf = (a) => (a.status === 'paused' ? 'paused' : a.trial ? 'trial' : 'active');
const STATE_LABEL = { active: 'Suivie', trial: 'À l’essai', paused: 'En pause' };

function Kpi({ label, value, sub }) {
  return h('div', { class: 'ad-kpi' },
    h('div', { class: 'ad-kpi-top' }, h('span', null, label)),
    h('div', { class: 'ad-kpi-mid' }, h('span', { class: 'ad-kpi-v' }, value)),
    sub ? h('span', { class: 'ad-kpi-sub' }, sub) : null);
}

export default function Radar() {
  const convex = useConvex();
  const [nets, setNets] = useState(null);
  const [budget, setBudget] = useState(null);
  const [cands, setCands] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState(null);
  const [filter, setFilter] = useState('active');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(null);
  const [newApp, setNewApp] = useState({ name: '', patterns: '' });
  const [newAcc, setNewAcc] = useState({ app: '', handle: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [n, b, c] = await Promise.all([
        convex.query(api.radar.radarNetworks.listNetworks, {}),
        convex.query(api.radar.radarSignals.getRadarBudget, {}),
        convex.query(api.radar.radarNetworks.listCandidates, {}),
      ]);
      setNets(n); setBudget(b); setCands(c);
    } catch (e) { setError(errText(e)); }
    setLoading(false);
  }, [convex]);
  useEffect(() => { load(); }, [load]);

  /** Une action sur le Radar : bouton occupé, message, puis la liste relue. */
  const act = async (key, run, done) => {
    setBusy(key); setNote(null); setError(null);
    try { const r = await run(); setNote(done(r)); await load(); } catch (e) { setError(errText(e)); }
    setBusy(null);
  };

  const apps = nets?.apps ?? [];
  const counts = useMemo(() => apps.reduce((o, a) => { o[stateOf(a)]++; return o; }, { active: 0, trial: 0, paused: 0 }), [apps]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return apps.filter((a) => (filter === 'all' || stateOf(a) === filter) && (!s || a.name.toLowerCase().includes(s) || a.slug.includes(s))).slice(0, 200);
  }, [apps, filter, q]);
  const spentUsd = budget ? budget.days.reduce((n, d) => n + d.credits, 0) * budget.pricePerCredit : null;
  const appBySlugOrName = (x) => { const s = x.trim().toLowerCase(); return apps.find((a) => a.slug === s || a.name.toLowerCase() === s); };

  return h('div', { class: 'rd' },
    h('div', { class: 'ad-head' },
      h('div', null, h('h1', null, 'Radar'), h('p', null, 'Les apps suivies, leurs créateurs et les crédits du Radar. Lu à la demande.')),
      h('button', { type: 'button', class: 'rd-btn', onClick: load, disabled: loading }, loading ? 'Lecture…' : 'Rafraîchir')),
    error ? h('p', { class: 'rd-msg rd-bad', role: 'alert' }, error) : null,
    note ? h('p', { class: 'rd-msg', role: 'status' }, note) : null,
    !nets ? (loading ? h('p', { class: 'ad-empty' }, 'Lecture du Radar…') : null) : h('div', { class: 'ad-kpis' },
      h(Kpi, { label: 'Apps suivies', value: num(counts.active), sub: `${num(counts.trial)} à l’essai · ${num(counts.paused)} en pause` }),
      h(Kpi, { label: 'Comptes suivis', value: num(nets.active), sub: `sur ${num(nets.max)} au plus (${num(nets.total)} avec ceux en pause)` }),
      h(Kpi, { label: 'Crédits ScrapeCreators', value: num(budget?.jobs.creditsRemaining), sub: budget?.jobs.keyPresent ? `relevé le ${when(budget.jobs.creditsSeenAt)}` : 'clé absente : rien de payant ne part' }),
      h(Kpi, { label: `Dépense de ${budget?.month ?? 'ce mois'}`, value: usd(spentUsd), sub: budget ? `prévu ${usd(budget.plannedUsd)} · dernier relevé de comptes ${when(budget.jobs.lastAccountsAt)}` : null })),
    budget?.jobs.lastError ? h('p', { class: 'rd-msg rd-bad' }, 'Dernière erreur : ', budget.jobs.lastError) : null,

    h('section', { class: 'ad-card' },
      h('div', { class: 'ad-ctitle' }, h('h2', null, 'Apps'),
        h('div', { class: 'rd-tools' },
          h('input', { class: 'rd-input', type: 'search', placeholder: 'Chercher une app', value: q, onInput: (e) => setQ(e.currentTarget.value) }),
          h('div', { class: 'ad-seg', role: 'tablist' }, FILTERS.map(([k, label]) => h('button', { type: 'button', class: filter === k ? 'on' : '', 'aria-selected': filter === k, onClick: () => setFilter(k) }, label))))),
      shown.length === 0 ? h('p', { class: 'ad-empty' }, nets ? 'Aucune app ici.' : '') : h('div', { class: 'rd-table', role: 'table' },
        h('div', { class: 'rd-row rd-head', role: 'row' }, ['App', 'Niche', 'Comptes', 'Posts 7 j', 'État', ''].map((t) => h('span', { role: 'columnheader' }, t))),
        shown.map((a) => {
          const st = stateOf(a);
          return h('div', { class: 'rd-row', role: 'row', key: a.id },
            h('span', { class: 'rd-name' }, h('b', null, a.name), a.store ? h('a', { href: a.store.url, target: '_blank', rel: 'noreferrer' }, 'App Store') : null),
            h('span', { class: 'rd-dim' }, a.niche ?? '—'),
            h('span', null, num(a.activeAccounts), a.accounts !== a.activeAccounts ? h('small', { class: 'rd-dim' }, ` / ${num(a.accounts)}`) : null),
            h('span', null, num(a.posts7d)),
            h('span', { class: 'rd-state rd-' + st }, STATE_LABEL[st], a.outOfScope ? ' (hors périmètre)' : ''),
            h('span', { class: 'rd-acts' },
              h('button', { type: 'button', class: 'rd-btn rd-small', disabled: busy !== null, onClick: () => act('s' + a.id,
                () => convex.mutation(api.radar.radarNetworks.setAppStatus, { appId: a.id, status: a.status === 'paused' ? 'active' : 'paused' }),
                () => `${a.name} : ${a.status === 'paused' ? 'reprise' : 'en pause'}.`) }, a.status === 'paused' ? 'Reprendre' : 'Pause'),
              a.status === 'paused' ? null : h('button', { type: 'button', class: 'rd-btn rd-small', disabled: busy !== null, onClick: () => act('r' + a.id,
                () => convex.mutation(api.radar.radarNetworks.searchAppNow, { appId: a.id }),
                (r) => (r === 'running' ? `${a.name} : une recherche tourne déjà.` : `${a.name} : recherche de son réseau lancée.`)) }, 'Chercher')));
        })),
      apps.length > 0 && shown.length === 200 ? h('p', { class: 'ad-kpi-sub' }, '200 premières affichées : affine la recherche.') : null),

    h('div', { class: 'ad-row rd-forms' },
      h('section', { class: 'ad-card' },
        h('div', { class: 'ad-ctitle' }, h('h2', null, 'Suivre une app')),
        h('form', { class: 'rd-form', onSubmit: (e) => { e.preventDefault(); const patterns = newApp.patterns.split(',').map((p) => p.trim()).filter(Boolean);
          act('newApp', () => convex.mutation(api.radar.radarNetworks.addApp, { name: newApp.name.trim(), rivalOf: [], patterns }), () => { setNewApp({ name: '', patterns: '' }); return `${newApp.name.trim()} est suivie : son réseau sera cherché au prochain passage.`; }); } },
          h('label', null, 'Nom', h('input', { class: 'rd-input', required: true, value: newApp.name, onInput: (e) => setNewApp({ ...newApp, name: e.currentTarget.value }) })),
          h('label', null, 'Motifs (séparés par des virgules)', h('input', { class: 'rd-input', placeholder: 'ex. glowup, glowupapp', value: newApp.patterns, onInput: (e) => setNewApp({ ...newApp, patterns: e.currentTarget.value }) })),
          h('button', { type: 'submit', class: 'rd-btn', disabled: busy !== null || !newApp.name.trim() }, 'Suivre'))),
      h('section', { class: 'ad-card' },
        h('div', { class: 'ad-ctitle' }, h('h2', null, 'Ajouter un compte')),
        h('form', { class: 'rd-form', onSubmit: (e) => { e.preventDefault(); const app = appBySlugOrName(newAcc.app);
          if (!app) { setError(`App inconnue : « ${newAcc.app} ».`); return; }
          act('newAcc', () => convex.mutation(api.radar.radarNetworks.addTrackedAccount, { appId: app.id, handle: newAcc.handle }), () => { setNewAcc({ app: '', handle: '' }); return `Compte ajouté sous ${app.name}.`; }); } },
          h('label', null, 'App (nom ou slug)', h('input', { class: 'rd-input', required: true, list: 'rd-apps', value: newAcc.app, onInput: (e) => setNewAcc({ ...newAcc, app: e.currentTarget.value }) })),
          h('datalist', { id: 'rd-apps' }, apps.filter((a) => a.status === 'active').slice(0, 500).map((a) => h('option', { value: a.name }))),
          h('label', null, 'Compte TikTok (@pseudo ou lien)', h('input', { class: 'rd-input', required: true, value: newAcc.handle, onInput: (e) => setNewAcc({ ...newAcc, handle: e.currentTarget.value }) })),
          h('button', { type: 'submit', class: 'rd-btn', disabled: busy !== null || !newAcc.app.trim() || !newAcc.handle.trim() }, 'Ajouter')))),

    h('section', { class: 'ad-card' },
      h('div', { class: 'ad-ctitle' }, h('h2', null, 'Apps candidates'), h('span', { class: 'ad-kpi-sub' }, 'Citées par au moins deux comptes suivis')),
      !cands || cands.length === 0 ? h('p', { class: 'ad-empty' }, 'Aucune candidate pour l’instant.') : cands.map((c) => h('div', { class: 'rd-cand', key: c.id },
        h('span', { class: 'rd-name' }, h('b', null, c.name), h('small', { class: 'rd-dim' }, ` ${c.kind === 'domain' ? 'site' : 'compte'} ${c.label} · ${c.authorCount} comptes`, c.fromApps.length ? ` · vu chez ${c.fromApps.slice(0, 3).join(', ')}` : '')),
        h('span', { class: 'rd-acts' },
          h('button', { type: 'button', class: 'rd-btn rd-small', disabled: busy !== null, onClick: () => act('f' + c.id,
            () => convex.mutation(api.radar.radarNetworks.followCandidate, { candidateId: c.id, name: c.name, rivalOf: [], patterns: c.patterns }), () => `${c.name} est suivie.`) }, 'Suivre'),
          h('button', { type: 'button', class: 'rd-btn rd-small rd-ghost', disabled: busy !== null, onClick: () => act('i' + c.id,
            () => convex.mutation(api.radar.radarNetworks.ignoreCandidate, { candidateId: c.id }), () => `${c.name} écartée.`) }, 'Écarter'))))));
}
