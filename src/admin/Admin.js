// Admin › Mesure (/admin), d'après la maquette AD1 validée le 19/11 : 4 chiffres, la courbe par jour, l'entonnoir,
// le fil « En direct ». Réservée aux e-mails de ADMIN_EMAILS (convex/admin.ts) ; le serveur renvoie les lignes brutes
// et la page compte ici, à l'heure locale.
import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api.js';
import Radar from './Radar.js';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const BLUE = '#3A86F0';
const GREEN = '#22A06B';
const OK = '#5CD394';
const WARN = '#F5B941';
const BAD = '#FF8A8A';
const PERIODS = [['jour', 'Aujourd’hui', 'Aujourd’hui'], ['7', '7 jours', '7 j'], ['30', '30 jours', '30 j'], ['tout', 'Tout', 'Tout']];
const ICONS = {
  check: 'M5 12.5l4.5 4.5L19 7.5', up: 'M12 19V5M6 11l6-6 6 6', down: 'M12 5v14M6 13l6 6 6-6',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  star: 'M12 4l2.4 5 5.6.8-4 3.9.9 5.5L12 16.6 7.1 19.2l.9-5.5-4-3.9 5.6-.8z',
  pause: 'M8 5v14M16 5v14', warn: 'M12 4l9 16H3zM12 10v4M12 17v.5', card: 'M3 6h18v12H3zM3 10h18M7 15h3', back: 'M10 7l-5 5 5 5M5 12h14',
};

const nf = new Intl.NumberFormat('fr-FR');
const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const num = (n) => nf.format(n);
const money = (n) => eur.format(n);
const pct = (a, b) => (b > 0 && a <= b ? (a / b * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %' : '—');
const dd = (t) => new Date(t).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
const WD = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const addDays = (t, n) => { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); };

const icon = (d, s = 16) => h('svg', { width: s, height: s, viewBox: '0 0 24 24', 'aria-hidden': 'true', class: 'ad-ic' },
  h('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
const dots = (s) => h('svg', { width: s, height: s, viewBox: '0 0 24 24', 'aria-hidden': 'true' },
  [[5, 8, 1], [11, 5, 1], [17, 8, 1], [8, 14, 0.6], [14, 13, 0.6], [19, 17, 0.6], [11, 20, 0.6]].map(([cx, cy, o]) => h('circle', { cx, cy, r: 2.3, fill: `rgba(255,255,255,${o})` })));
const logo = (s) => h('span', { class: 'ad-logo', style: { width: s + 'px', height: s + 'px' } }, dots(Math.round(s * 0.56)));

function ago(t, now) {
  const m = Math.round((now - t) / 60000);
  if (m < 1) return 'à l’instant';
  if (m < 60) return `il y a ${m} min`;
  if (m < 24 * 60 && startOfDay(t) === startOfDay(now)) return `il y a ${Math.round(m / 60)} h`;
  if (startOfDay(t) === addDays(startOfDay(now), -1)) return 'hier';
  return 'le ' + dd(t);
}

/** La période choisie : ses bornes, la même durée juste avant (comparaison), et ses tranches pour la courbe. */
function rangeOf(period, now, firstT) {
  const today = startOfDay(now);
  if (period === 'jour') {
    const buckets = Array.from({ length: 24 }, (_, i) => ({ a: today + i * HOUR, b: today + (i + 1) * HOUR, label: `${i} h`, tip: `${i} h – ${i + 1} h` }));
    return { from: today, prevFrom: today - (now - today), buckets, unit: 'heure', text: 'Aujourd’hui depuis minuit · comparé à la même durée juste avant' };
  }
  const n = period === '7' ? 7 : period === '30' ? 30 : Math.max(1, Math.round((today - startOfDay(firstT ?? now)) / DAY) + 1);
  const from = addDays(today, -(n - 1));
  const step = n > 92 ? 7 : 1;
  const buckets = [];
  for (let a = from; a <= now; a = addDays(a, step)) {
    const b = Math.min(addDays(a, step), addDays(today, 1));
    const d = new Date(a);
    buckets.push({ a, b, label: dd(a), tip: step === 1 ? `${WD[d.getDay()]} ${dd(a)}` : `Semaine du ${dd(a)}` });
  }
  const text = period === 'tout' ? `Depuis le ${new Date(from).toLocaleDateString('fr-FR')}` : `Du ${dd(from)} au ${dd(now)} · comparé aux ${n} jours d’avant`;
  return { from, prevFrom: period === 'tout' ? null : from - (now - from), buckets, unit: step === 1 ? 'jour' : 'semaine', text };
}

function compute(data, period, hideTests, now) {
  const keep = (r) => !(hideTests && r.test);
  const signups = data.signups.filter(keep);
  const subs = data.subs.filter(keep);
  const pays = data.payments.filter(keep);
  const firstT = [...signups.map((s) => s.t), ...data.visits.map((v) => v.hour * HOUR)].reduce((m, t) => Math.min(m, t), now);
  const r = rangeOf(period, now, firstT);
  const end = now + 1;
  const count = (rows, a, b) => rows.filter((x) => x.t >= a && x.t < b).length;
  const visitsBucket = (a, b) => data.visits.reduce((s, v) => s + (v.hour * HOUR >= a && v.hour * HOUR < b ? v.n : 0), 0);

  const active = subs.filter((s) => s.active);
  const monthly = active.filter((s) => !s.annual).length;
  const mrr = active.reduce((s, x) => s + x.price / (x.periodDays || (x.annual ? 365 : 30)) * 30, 0);
  const paidIn = pays.filter((p) => p.status === 'paid' && p.t >= r.from && p.t < end);
  const k = {
    visits: visitsBucket(r.from, end), prevVisits: r.prevFrom === null ? null : visitsBucket(r.prevFrom, r.from),
    signups: count(signups, r.from, end), prevSignups: r.prevFrom === null ? null : count(signups, r.prevFrom, r.from),
    newSubs: count(subs, r.from, end), active: active.length, monthly, annual: active.length - monthly, mrr,
    cashed: paidIn.reduce((s, p) => s + p.total, 0),
    cancels: active.filter((s) => s.cancelAtPeriodEnd).length,
    failed: pays.filter((p) => p.status === 'failed' && p.t >= r.from && p.t < end).length,
    tests: data.signups.filter((s) => s.test).length,
    // Le compteur de visites existe depuis le 19/11 : avant, un taux inscriptions ÷ visites ne voudrait rien dire.
    visitsSince: data.visits.length ? Math.min(...data.visits.map((v) => v.hour * HOUR)) : null,
  };
  k.visitsPartial = k.visitsSince === null || k.visitsSince > r.from + HOUR;
  const series = r.buckets.map((b) => ({ ...b, ins: count(signups, b.a, b.b), subs: count(subs, b.a, b.b), vis: visitsBucket(b.a, b.b) }));
  const activeCurve = r.buckets.map((b) => active.filter((s) => s.t < b.b).length);

  // Le fil « En direct » : inscriptions, nouveaux abonnés, résiliations, paiements refusés, renouvellements.
  const created = new Map(subs.map((s) => [s.membershipId, s.t]));
  const ev = [];
  for (const s of signups) if (s.email !== undefined) ev.push({ t: s.t, kind: 'signup', title: 'Inscription', who: s.email, what: s.google ? 'Google' : 'E-mail' });
  for (const s of subs) {
    const f = s.annual ? 'Annuel' : 'Mensuel';
    ev.push({ t: s.t, kind: 'sub', title: `Abonné · ${f}`, who: s.email, what: s.price ? money(s.price) : '' });
    if (s.active && s.cancelAtPeriodEnd) ev.push({ t: s.updatedAt, kind: 'cancel', title: `Résiliation prévue · ${f}`, who: s.email, what: s.periodEnd ? 'fin le ' + dd(s.periodEnd) : '' });
    else if (!s.active && s.status !== 'unresolved') ev.push({ t: s.updatedAt, kind: 'end', title: `Abonnement terminé · ${f}`, who: s.email, what: '' });
  }
  for (const p of pays) {
    if (p.status === 'failed') ev.push({ t: p.t, kind: 'failed', title: 'Paiement refusé', who: p.email, what: money(p.total) });
    else if (p.status === 'refunded') ev.push({ t: p.t, kind: 'end', title: 'Remboursement', who: p.email, what: money(p.total) });
    else if (p.status === 'paid' && (created.get(p.membershipId) ?? 0) < p.t - DAY) ev.push({ t: p.t, kind: 'sub', title: 'Renouvellement', who: p.email, what: money(p.total) });
  }
  ev.sort((a, b) => b.t - a.t);
  return { r, k, series, activeCurve, events: ev };
}

// ─── Pièces ───
function Delta({ cur, prev }) {
  if (prev === null || prev === undefined) return null;
  if (prev === 0) return cur > 0 ? h('span', { class: 'ad-delta', style: { color: OK } }, icon(ICONS.up, 12), 'nouveau') : null;
  const p = Math.round((cur - prev) / prev * 100);
  if (p === 0) return h('span', { class: 'ad-delta', style: { color: 'var(--ink-faint)' } }, '=');
  return h('span', { class: 'ad-delta', style: { color: p > 0 ? OK : BAD } }, icon(p > 0 ? ICONS.up : ICONS.down, 12), Math.abs(p) + ' %');
}

function Spark({ vals, color, w = 110, hgt = 34 }) {
  if (!vals || vals.length < 2 || !vals.some((v) => v > 0)) return null;
  const mx = Math.max(...vals);
  const pts = vals.map((v, i) => [i * (w / (vals.length - 1)), hgt - 2 - (v / mx) * (hgt - 6)]);
  const [lx, ly] = pts[pts.length - 1];
  return h('svg', { class: 'ad-spark', width: w, height: hgt, viewBox: `0 0 ${w} ${hgt}`, 'aria-hidden': 'true' },
    h('polyline', { points: pts.map((p) => p.map((x) => x.toFixed(1)).join(',')).join(' '), fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
    h('circle', { cx: lx, cy: ly, r: 3.5, fill: color, stroke: '#0D111A', 'stroke-width': 2 }));
}

function Kpi({ label, value, unit, delta, sub, spark }) {
  return h('div', { class: 'ad-kpi' },
    h('span', { class: 'ad-kpi-top' }, label, delta),
    h('span', { class: 'ad-kpi-mid' }, h('span', { class: 'ad-kpi-v' }, value, unit ? h('small', null, unit) : null), spark),
    h('span', { class: 'ad-kpi-sub' }, sub));
}

function Segmented({ value, onChange, short }) {
  return h('div', { class: 'ad-seg', role: 'tablist', 'aria-label': 'Période' },
    PERIODS.map(([k, long, s]) => h('button', { type: 'button', role: 'tab', 'aria-selected': value === k, class: value === k ? 'on' : '', onClick: () => onChange(k) }, short ? s : long)));
}

function niceMax(m) {
  if (m <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(m)));
  const f = m / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}

function Chart({ series }) {
  const box = useRef(null);
  const [w, setW] = useState(700);
  const [hover, setHover] = useState(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setW(el.clientWidth || 700));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const mobile = w < 500;
  const H = mobile ? 160 : 250;
  const padl = 28, padb = 26, top = 10;
  const iw = Math.max(10, w - padl), ih = H - padb - top;
  const n = series.length;
  const ymax = niceMax(Math.max(1, ...series.map((s) => Math.max(s.ins, s.subs))));
  const gw = iw / n;
  const gap = n > 40 ? 1 : 2;
  const bw = Math.max(1, (gw - (n > 40 ? 2 : 6)) / 2);
  const y = (v) => top + ih - (v / ymax) * ih;
  const bar = (x, v, c, op) => {
    if (v <= 0) return null;
    const hh = y(0) - y(v);
    const r = Math.min(4, bw / 2, hh / 2);
    return h('path', { d: `M${x},${y(0)} V${y(v) + r} q0,-${r} ${r},-${r} h${bw - 2 * r} q${r},0 ${r},${r} V${y(0)} Z`, fill: c, opacity: op });
  };
  const ticks = [0, ymax / 4, ymax / 2, (3 * ymax) / 4, ymax].filter((t) => Number.isInteger(t));
  const labels = [...new Set([0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round((3 * (n - 1)) / 4), n - 1])].filter((i) => i >= 0);
  const pick = (e) => {
    const rect = box.current.getBoundingClientRect();
    const i = Math.floor((e.clientX - rect.left - padl) / gw);
    setHover(i >= 0 && i < n ? i : null);
  };
  const s = hover !== null ? series[hover] : null;
  const tipLeft = s ? Math.min(padl + hover * gw + gw + 10, w - 206) : 0;
  return h('div', { class: 'ad-chart', ref: box, onMouseMove: pick, onMouseLeave: () => setHover(null), onClick: pick },
    h('svg', { width: w, height: H, viewBox: `0 0 ${w} ${H}`, role: 'img', 'aria-label': 'Inscriptions et nouveaux abonnés par tranche' },
      ticks.map((t) => [
        h('line', { x1: padl, x2: w, y1: y(t), y2: y(t), stroke: `rgba(255,255,255,${t === 0 ? 0.14 : 0.06})` }),
        h('text', { x: padl - 8, y: y(t) + 4, 'text-anchor': 'end', class: 'ad-axis' }, t),
      ]),
      s ? h('rect', { x: padl + hover * gw, y: top, width: gw, height: ih, rx: 4, fill: 'rgba(255,255,255,0.05)' }) : null,
      series.map((p, i) => {
        const op = hover === null || hover === i ? 1 : 0.55;
        const x0 = padl + i * gw + (gw - 2 * bw - gap) / 2;
        return [bar(x0, p.ins, BLUE, op), bar(x0 + bw + gap, p.subs, GREEN, op)];
      }),
      labels.map((i) => h('text', { x: i === n - 1 && n > 1 ? w : padl + i * gw + gw / 2, y: H - 6, 'text-anchor': i === n - 1 && n > 1 ? 'end' : 'middle', class: 'ad-axis' }, series[i].label))),
    s ? h('div', { class: 'ad-tip', style: { left: tipLeft + 'px' } },
      h('b', null, s.tip),
      h('span', null, h('span', null, h('i', { style: { background: BLUE } }), 'Inscriptions'), h('b', null, num(s.ins))),
      h('span', null, h('span', null, h('i', { style: { background: GREEN } }), 'Nouveaux abonnés'), h('b', null, num(s.subs))),
      h('span', { class: 'ad-tip-foot' }, h('span', null, 'Visites'), h('span', null, num(s.vis)))) : null);
}

const EV_STYLE = { signup: [BLUE, ICONS.user], sub: [OK, ICONS.star], cancel: [WARN, ICONS.pause], failed: [BAD, ICONS.warn], end: ['var(--ink-muted)', ICONS.card] };

function Events({ events, now, all, onAll }) {
  const shown = events.slice(0, all ? 30 : 5);
  return h('section', { class: 'ad-card ad-events' },
    h('div', { class: 'ad-ctitle' }, h('h2', null, 'En direct'),
      events.length > 5 ? h('button', { type: 'button', class: 'ad-link', onClick: onAll }, all ? 'Moins' : 'Tout voir') : null),
    shown.length === 0 ? h('p', { class: 'ad-empty' }, 'Rien pour l’instant. Les inscriptions, abonnements et paiements arrivent ici dès qu’ils ont lieu.') :
      shown.map((e) => {
        const [c, d] = EV_STYLE[e.kind];
        return h('div', { class: 'ad-ev' },
          h('span', { class: 'ad-ev-ic', style: { color: c } }, icon(d, 15)),
          h('span', { class: 'ad-ev-t' }, e.title),
          h('span', { class: 'ad-ev-who' }, e.who || '—'),
          h('span', { class: 'ad-ev-what' }, e.what),
          h('span', { class: 'ad-ev-when' }, ago(e.t, now)));
      }));
}

function Funnel({ k }) {
  const steps = [['Visites', k.visits, null, BLUE, 0.45], ['Inscrits', k.signups, [k.visitsPartial ? '—' : pct(k.signups, k.visits), 'des visites'], BLUE, 1], ['Abonnés', k.newSubs, [pct(k.newSubs, k.signups), 'des inscrits'], GREEN, 1]];
  const top = Math.max(1, k.visits, k.signups, k.newSubs);
  return h('section', { class: 'ad-card ad-funnel' },
    h('div', { class: 'ad-ctitle' }, h('h2', null, 'Entonnoir')),
    steps.map(([t, v, rate, c, op]) => h('div', { class: 'ad-step' },
      h('span', { class: 'ad-step-h' }, h('span', null, t), h('b', null, num(v))),
      h('span', { class: 'ad-bar' }, h('i', { style: { width: Math.max(v > 0 ? 2 : 0, (v / top) * 100) + '%', background: c, opacity: op } })),
      rate ? h('span', { class: 'ad-step-r' }, h('b', null, rate[0]), ' ', rate[1]) : null)),
    h('div', { class: 'ad-flags' },
      h('span', null, h('span', null, h('span', { style: { color: WARN, display: 'flex' } }, icon(ICONS.pause, 14)), 'Résiliations prévues'), h('b', null, num(k.cancels))),
      h('span', null, h('span', null, h('span', { style: { color: BAD, display: 'flex' } }, icon(ICONS.warn, 14)), 'Paiements refusés'), h('b', null, num(k.failed)))));
}

function Gate({ title, text, href, cta }) {
  return h('div', { class: 'ad-gate' }, logo(48), h('h1', null, title), h('p', null, text), h('a', { class: 'ad-btn', href }, cta));
}

export default function Admin() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const data = useQuery(api.admin.data, isAuthenticated ? { since: 0 } : 'skip');
  const viewer = useQuery(api.users.viewer, isAuthenticated ? {} : 'skip');
  const [period, setPeriod] = useState('30');
  // Onglet Mesure ou Radar (20/11/2026, le Radar déménagé de Jarvia) ; #radar dans l'adresse ouvre le Radar.
  const [tab, setTabState] = useState(typeof location !== 'undefined' && location.hash === '#radar' ? 'radar' : 'mesure');
  const setTab = (t) => { setTabState(t); history.replaceState(null, '', t === 'radar' ? '#radar' : location.pathname); };
  const [hideTests, setHideTests] = useState(true);
  const [all, setAll] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth < 760);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    const onR = () => setNarrow(window.innerWidth < 760);
    window.addEventListener('resize', onR);
    return () => { clearInterval(t); window.removeEventListener('resize', onR); };
  }, []);
  useEffect(() => { if (data) setNow(Date.now()); }, [data]);
  const c = useMemo(() => (data ? compute(data, period, hideTests, now) : null), [data, period, hideTests, now]);

  if (isLoading || (isAuthenticated && data === undefined)) return h('div', { class: 'ad-wait', 'aria-busy': 'true' }, logo(40));
  if (!isAuthenticated) return h(Gate, { title: 'Connecte-toi d’abord', text: 'Cette page est réservée à l’administration de Kopycat.', href: '/connexion', cta: 'Se connecter' });
  if (data === null) return h(Gate, { title: 'Cette page n’existe pas', text: 'Rien à voir ici.', href: '/app', cta: 'Retour à Kopycat' });

  const { r, k, series, activeCurve, events } = c;
  const initial = ((viewer && (viewer.name || viewer.email)) || 'A').charAt(0).toUpperCase();
  return h('div', { class: 'ad' },
    h('header', { class: 'ad-top' },
      h('a', { class: 'ad-brand', href: '/app', 'aria-label': 'Retour à Kopycat' }, logo(narrow ? 28 : 32), narrow ? h('span', { class: 'ad-brand-t' }, 'Mesure') : h('span', { class: 'ad-brand-t' }, 'kopycat')),
      h('span', { class: 'ad-tag' }, 'ADMIN'),
      h('div', { class: 'ad-seg', role: 'tablist', 'aria-label': 'Section' }, [['mesure', 'Mesure'], ['radar', 'Radar']].map(([k, label]) =>
        h('button', { type: 'button', role: 'tab', class: tab === k ? 'on' : '', 'aria-selected': tab === k, onClick: () => setTab(k) }, label))),
      h('span', { class: 'ad-grow' }),
      // Le simulateur public en version « film » (toutes les apps en clair, ni verrou ni prix) : /simulateur?film=1 ne
      // l'ouvre qu'aux adresses d'ADMIN_EMAILS (src/simulateur-film.js), les autres voient la version normale.
      h('a', { class: 'ad-link', href: '/simulateur?film=1', style: { whiteSpace: 'nowrap', textDecoration: 'none' } }, narrow ? 'Film' : 'Simulateur, version film'),
      tab === 'radar' ? null : h('button', { type: 'button', class: 'ad-tests', 'aria-pressed': hideTests, onClick: () => setHideTests(!hideTests) },
        h('span', { class: 'ad-box' + (hideTests ? ' on' : '') }, hideTests ? icon(ICONS.check, 11) : null),
        narrow ? `Sans tests (${k.tests})` : `Sans les ${k.tests} comptes de test`),
      narrow ? null : h('a', { class: 'ad-avatar', href: '/app', title: 'Retour à Kopycat' }, initial)),
    tab === 'radar' ? h('main', { class: 'ad-main' }, h(Radar)) : h('main', { class: 'ad-main' },
      h('div', { class: 'ad-head' },
        narrow ? null : h('div', null, h('h1', null, 'Mesure'), h('p', null, r.text)),
        h(Segmented, { value: period, onChange: setPeriod, short: narrow })),
      h('div', { class: 'ad-kpis' },
        h(Kpi, { label: 'Visites', value: num(k.visits), delta: h(Delta, { cur: k.visits, prev: k.visitsPartial ? null : k.prevVisits }), sub: k.visitsPartial && k.visitsSince ? `Comptées depuis le ${dd(k.visitsSince)}` : narrow ? 'site public' : 'Accueil et tarifs, une par onglet', spark: narrow ? null : h(Spark, { vals: series.map((s) => s.vis), color: BLUE }) }),
        h(Kpi, { label: 'Inscriptions', value: num(k.signups), delta: h(Delta, { cur: k.signups, prev: k.prevSignups }), sub: k.visitsPartial ? (narrow ? 'sur la période' : 'Sur la période') : narrow ? pct(k.signups, k.visits) : `${pct(k.signups, k.visits)} des visites`, spark: narrow ? null : h(Spark, { vals: series.map((s) => s.ins), color: BLUE }) }),
        h(Kpi, { label: 'Abonnés actifs', value: num(k.active), delta: k.newSubs > 0 ? h('span', { class: 'ad-delta', style: { color: OK } }, icon(ICONS.up, 12), `+${num(k.newSubs)} nouveau${k.newSubs > 1 ? 'x' : ''}`) : null, sub: narrow ? `${k.monthly} M · ${k.annual} A` : `${k.monthly} mensuel${k.monthly > 1 ? 's' : ''} · ${k.annual} annuel${k.annual > 1 ? 's' : ''}`, spark: narrow ? null : h(Spark, { vals: activeCurve, color: GREEN }) }),
        h(Kpi, { label: narrow ? 'Revenu mensuel' : 'Revenu mensuel récurrent', value: k.mrr.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), unit: '€', sub: narrow ? 'récurrent' : `Encaissé sur la période : ${money(k.cashed)}` })),
      h('div', { class: 'ad-row' },
        h('section', { class: 'ad-card ad-chartcard' },
          h('div', { class: 'ad-ctitle' }, h('h2', null, narrow ? `Par ${r.unit}` : `Inscriptions et nouveaux abonnés, par ${r.unit}`),
            h('span', { class: 'ad-legend' }, h('span', null, h('i', { style: { background: BLUE } }), narrow ? 'Inscr.' : 'Inscriptions'), h('span', null, h('i', { style: { background: GREEN } }), narrow ? 'Abonnés' : 'Nouveaux abonnés'))),
          h(Chart, { series })),
        h(Funnel, { k })),
      h(Events, { events, now, all, onAll: () => setAll(!all) })));
}
