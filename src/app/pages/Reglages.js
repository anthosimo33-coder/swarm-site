// Généré par scripts/dc2preact.py depuis design/app/ReglagesA.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../../runtime.js';

export default class Reglages extends DCLogic {
  componentDidMount() {
    this.timer = setInterval(() => this.setState({ now: Date.now() }), 1000);
    this.onKey = (e) => {
      if (e.key !== 'Escape') return;
      const st = this.state || {};
      if (st.del) this.setState({ del: false, delEmail: '', delErr: '' });
      else if (st.q) this.setState({ q: '' });
      else if (this.props && this.props.onClose && !this.props.mobile) this.props.onClose();
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.onKey);
      this.overflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  }
  componentWillUnmount() {
    clearInterval(this.timer); clearTimeout(this.tName); clearTimeout(this.tToast); clearTimeout(this.tFlash);
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.onKey);
      document.body.style.overflow = this.overflow || '';
    }
    // Un prénom tapé mais pas encore parti (moins de 0,7 s) est enregistré en fermant.
    if (this.pendingName !== undefined) this.saveName(this.pendingName, true);
  }
  // Enregistre le prénom ; le message propose de revenir à l’ancien (« Annuler »).
  saveName(value, quiet) {
    const p = this.props || {};
    this.pendingName = undefined;
    const before = this.lastName !== undefined ? this.lastName : ((p.user && p.user.nom) || '');
    if (value.trim() === before.trim() || !p.onSaveName) return;
    p.onSaveName(value).then((clean) => {
      this.lastName = clean;
      if (quiet) return;
      this.setState({ nameSaved: true, nameErr: '', toast: { text: 'Prénom enregistré', undo: before } });
      clearTimeout(this.tToast);
      this.tToast = setTimeout(() => this.setState({ toast: null, nameSaved: false }), 5000);
    }, () => { if (!quiet) this.setState({ nameErr: 'Pas enregistré : vérifie ta connexion et réessaie.' }); });
  }
  renderVals() {
    // Réglages (19/11, maquettes R1-R6) : Profil, Sécurité, Formule et facturation, et la recherche. Monté par
    // src/app/main.js ; chaque action passe par une fonction reçue (onSaveName, onSignOutOthers, onDelete).
    const p = this.props || {};
    const st = this.state || {};
    const u = p.user || { nom: 'Anthony', email: 'anthony@exemple.fr', initiale: 'A', pro: false, emailVerified: true };
    const pro = !!u.pro;
    const mob = !!p.mobile;
    const view = mob ? (st.view || 'list') : 'detail';
    const sec = st.sec || p.section || 'profil';
    const fold = (s) => Array.from(String(s)).map((c) => c.normalize('NFD').charAt(0).toLowerCase()).join('');
    // Ce qu’on peut chercher : le réglage, sa rubrique, et les mots qu’on taperait pour le trouver.
    const INDEX = [
      ['prenom', 'profil', 'Prénom', 'Profil', 'nom affiché prénom identité'],
      ['photo', 'profil', 'Photo', 'Profil', 'avatar image initiale'],
      ['email', 'profil', 'E-mail', 'Profil', 'adresse mail email connexion identifiant'],
      ['fermer', 'profil', 'Fermer mon compte', 'Profil', 'supprimer effacer données compte quitter rgpd'],
      ['appareil', 'securite', 'Cet appareil', 'Sécurité', 'session connexion sécurité'],
      ['autres', 'securite', 'Déconnecter les autres appareils', 'Sécurité', 'sessions appareils déconnexion sécurité téléphone ordinateur'],
      ['formule', 'abo', pro ? 'Ma formule' : 'Passer Pro', 'Formule et facturation', 'abonnement pro prix mensuel annuel payer black friday offre formule'],
      ['recus', 'abo', 'Reçus', 'Formule et facturation', 'factures facturation paiements reçus']
    ];
    const q = st.q || '';
    const fq = fold(q.trim());
    const results = !fq ? [] : INDEX.filter((x) => fold(x[2] + ' ' + x[3] + ' ' + x[4]).includes(fq)).map((x) => {
      const i = fold(x[2]).indexOf(fq);
      const lab = x[2];
      return {
        a: i < 0 ? lab : lab.slice(0, i), b: i < 0 ? '' : lab.slice(i, i + fq.length), c: i < 0 ? '' : lab.slice(i + fq.length),
        where: x[3],
        pick: () => {
          this.setState({ sec: x[1], q: '', flash: x[0], view: 'detail' });
          clearTimeout(this.tFlash);
          this.tFlash = setTimeout(() => this.setState({ flash: null }), 2400);
          if (typeof document !== 'undefined') setTimeout(() => { const el = document.getElementById('reg-' + x[0]); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 40);
        }
      };
    });
    const GLOW = 'box-shadow: 0 0 0 2px var(--accent); border-radius: 12px; background: rgba(76,154,255,0.06);';
    const glow = {};
    INDEX.forEach((x) => { glow[x[0]] = st.flash === x[0] ? GLOW + (x[0] === 'formule' ? '' : ' margin: 0 -12px; padding-left: 12px; padding-right: 12px;') : ''; });
    const go = {}; const cur = {}; const secOn = {};
    ['profil', 'securite', 'abo'].forEach((k) => { go[k] = () => this.setState({ sec: k, q: '', del: false, view: 'detail' }); cur[k] = !mob && k === sec ? 'page' : 'false'; secOn[k] = k === sec; });
    // Prénom : enregistré 0,7 s après la dernière frappe, ou en quittant le champ.
    const nameVal = st.name !== undefined ? st.name : (u.nom || '');
    // Sécurité
    const s = p.sessions;
    const dd = (ms) => { const d = new Date(ms); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(); };
    const others = s ? s.others : null;
    // Formule
    const now = st.now || Date.now();
    const bfLeft = Math.max(0, Date.parse('2026-12-01T00:00:00+01:00') - now);
    const bf2 = (n) => String(n).padStart(2, '0');
    const bfTime = Math.floor(bfLeft / 864e5) + 'j ' + bf2(Math.floor(bfLeft / 36e5) % 24) + ':' + bf2(Math.floor(bfLeft / 6e4) % 60) + ':' + bf2(Math.floor(bfLeft / 1e3) % 60);
    const bill = st.bill || 'y';
    const checkout = p.checkout || {};
    const total = typeof p.total === 'number' && p.total > 0 ? p.total : 516;
    const orange = bill === 'y' && bfLeft > 0;
    // Fermer le compte
    const delMatch = !!u.email && String(st.delEmail || '').trim().toLowerCase() === String(u.email).trim().toLowerCase();
    const toast = st.toast;
    return {
      me: { initiale: String(u.initiale || u.nom || u.email || '?').charAt(0).toUpperCase(), nom: u.nom || String(u.email || '').split('@')[0], email: u.email || '', verified: !!u.emailVerified, pro, free: !pro },
      q, onQ: (e) => this.setState({ q: e.target.value }), searching: !!fq, browsing: !fq,
      searchRing: fq ? 'box-shadow: inset 0 0 0 2px var(--accent);' : 'box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);',
      results, resTitle: results.length ? results.length + (results.length > 1 ? ' résultats' : ' résultat') : 'Aucun réglage ne correspond',
      go, cur, sec: secOn, glow,
      nameVal, nameSaved: !!st.nameSaved, nameErr: st.nameErr || '',
      onName: (e) => {
        const v = e.target.value;
        this.pendingName = v;
        this.setState({ name: v, nameSaved: false, nameErr: '' });
        clearTimeout(this.tName);
        this.tName = setTimeout(() => this.saveName(v), 700);
      },
      onNameBlur: () => { if (this.pendingName !== undefined) { clearTimeout(this.tName); this.saveName(this.pendingName); } },
      toastOn: !!toast, toastText: toast ? toast.text : '', toastUndo: !!(toast && toast.undo !== undefined),
      undo: () => {
        if (!toast) return;
        const back = toast.undo;
        this.setState({ name: back, toast: null, nameSaved: false });
        this.lastName = undefined;
        if (p.onSaveName) p.onSaveName(back).then((clean) => { this.lastName = clean; this.setState({ toast: { text: 'Prénom remis' } }); clearTimeout(this.tToast); this.tToast = setTimeout(() => this.setState({ toast: null }), 3000); });
      },
      sinceTxt: s && s.since ? 'Session ouverte le ' + dd(s.since) + ' · elle dure 90 jours.' : 'Ta session reste ouverte 90 jours.',
      othersTxt: others === null ? '…' : others === 0 ? 'Aucun autre appareil n’est connecté.' : others + (others > 1 ? ' autres sessions ouvertes sur ton compte.' : ' autre session ouverte sur ton compte.'),
      othersOff: !others || !!st.busy, othersLabel: st.busy === 'out' ? 'Déconnexion…' : 'Déconnecter les autres',
      signOutOthers: () => {
        if (!p.onSignOutOthers || !others) return;
        this.setState({ busy: 'out' });
        p.onSignOutOthers().then((n) => {
          this.setState({ busy: null, toast: { text: n > 1 ? n + ' appareils déconnectés' : 'Appareil déconnecté' } });
          clearTimeout(this.tToast); this.tToast = setTimeout(() => this.setState({ toast: null }), 4000);
        }, () => this.setState({ busy: null, toast: { text: 'Pas fait : vérifie ta connexion.' } }));
      },
      aboSub: pro ? 'Ton abonnement et tes reçus.' : 'Tu es en aperçu : tu vois le top 3 des apps.',
      bfOn: bfLeft > 0, bfTime,
      billM: bill === 'm' ? 'true' : 'false', billY: bill === 'y' ? 'true' : 'false',
      pickM: () => this.setState({ bill: 'm' }), pickY: () => this.setState({ bill: 'y' }),
      price: bill === 'y' ? '14,99 €' : '29,99 €',
      priceSub: bill === 'y' ? '179,88 € aujourd’hui, puis chaque année. Annulable en un clic.' : '29,99 € aujourd’hui, puis chaque mois. Sans engagement.',
      ctaLabel: bill === 'y' ? 'Passer Pro · 179,88 €' : 'Passer Pro · 29,99 €',
      ctaHref: (bill === 'y' ? checkout.annuel : checkout.mensuel) || '/tarifs',
      ctaStyle: orange ? 'background: linear-gradient(180deg, #FF9A4D, #FF641A); box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 22px rgba(255,106,31,0.3);' : 'background: linear-gradient(180deg, #4C9AFF, #0B6FE0); box-shadow: 0 8px 22px rgba(11,111,224,0.3);',
      inc: ['Les ' + String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' apps et leur classement', 'Les formats qui explosent', 'Les créateurs derrière chaque app', 'Tous les marchés', 'Les alertes « vidéo qui explose »', 'Tes dossiers, sans limite'],
      delShown: !!st.del, delClosed: !st.del, delEmail: st.delEmail || '', delErr: st.delErr || '',
      delOff: !delMatch || st.busy === 'del', delLabel: st.busy === 'del' ? 'Suppression…' : 'Supprimer définitivement',
      delOpen: () => this.setState({ del: true, delEmail: '', delErr: '' }),
      delCancel: () => this.setState({ del: false, delEmail: '', delErr: '' }),
      onDelEmail: (e) => this.setState({ delEmail: e.target.value, delErr: '' }),
      delGo: () => {
        if (!delMatch || !p.onDelete) return;
        this.setState({ busy: 'del' });
        p.onDelete(st.delEmail).then((r) => { if (!r || !r.ok) this.setState({ busy: null, delErr: 'Cet e-mail n’est pas celui du compte.' }); },
          () => this.setState({ busy: null, delErr: 'Pas fait : vérifie ta connexion et réessaie.' }));
      },
      mobile: mob, mobCls: mob ? 'reg-mob ' + (view === 'list' ? 'reg-list' : 'reg-detail') : '',
      back: () => this.setState({ view: 'list', del: false }),
      close: () => { if (p.onClose) p.onClose(); },
      bg: (e) => { if (!mob && e && e.target === e.currentTarget && p.onClose) p.onClose(); }
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": `sw reg-bg ${$t($v.mobCls)}`, "onClick": $v.bg, "style": "position: fixed; inset: 0; z-index: 85; background: rgba(3,4,8,0.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; font-family: var(--font-body); color: var(--ink);" },
        $h("div", { "class": "reg-box", "role": "dialog", "aria-modal": "true", "aria-label": "Réglages", "style": "position: relative; width: min(1040px, 100%); height: min(704px, 100%); display: flex; overflow: hidden; border-radius: 24px; background: #11151E; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.09), 0 40px 120px rgba(0,0,0,0.6);" },
          $h("aside", { "class": "reg-aside", "style": "flex: 0 0 264px; box-sizing: border-box; padding: 16px 12px; border-right: 1px solid var(--line); background: #0C1017; display: flex; flex-direction: column; min-height: 0;" },
            ($v.mobile) ? [
              $h("div", { "class": "reg-mbar" },
                $h("span", { "style": "font-size: 16px; font-weight: 700;" },
                  "Réglages"
                ),
                $h("button", { "class": "reg-mok", "type": "button", "onClick": $v.close },
                  "OK"
                )
              ),
              $h("div", { "style": "display: flex; align-items: center; gap: 14px; padding: 8px 4px 16px;" },
                $h("span", { "class": "reg-av", "style": "width: 56px; height: 56px; font-size: 22px;" },
                  $t($v.me?.initiale)
                ),
                $h("span", { "style": "display: flex; flex-direction: column; gap: 4px; min-width: 0;" },
                  $h("span", { "style": "font-size: 18px; font-weight: 700;" },
                    $t($v.me?.nom)
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                    $t($v.me?.email)
                  )
                )
              )
            ] : null,
            $h("label", { "class": "reg-search", "style": $v.searchRing },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                $h("path", { "d": "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ),
              $h("input", { "type": "search", "value": $v.q, "onInput": $v.onQ, "placeholder": "Chercher un réglage", "aria-label": "Chercher un réglage", "autocomplete": "off", "spellcheck": "false" })
            ),
            ($v.searching) ? [
              $h("div", { "class": "reg-grp" },
                $t($v.resTitle)
              ),
              ($l($v.results)).map((r) => [
                $h("button", { "class": "reg-res", "type": "button", "onClick": r?.pick },
                  $h("span", { "style": "font-size: 14px; color: #FFFFFF; font-weight: 500;" },
                    $t(r?.a),
                    $h("mark", null,
                      $t(r?.b)
                    ),
                    $t(r?.c)
                  ),
                  $h("span", { "style": "font-size: 12px; color: var(--ink-faint);" },
                    $t(r?.where)
                  )
                )
              ])
            ] : null,
            ($v.browsing) ? [
              $h("div", { "class": "reg-grp" },
                "Compte"
              ),
              $h("button", { "class": "reg-nav", "type": "button", "aria-current": $v.cur?.profil, "onClick": $v.go?.profil },
                $h("span", { "class": "reg-nav-ic" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("span", { "style": "flex: 1; white-space: nowrap;" },
                  "Profil"
                )
              ),
              $h("button", { "class": "reg-nav", "type": "button", "aria-current": $v.cur?.securite, "onClick": $v.go?.securite },
                $h("span", { "class": "reg-nav-ic" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("span", { "style": "flex: 1; white-space: nowrap;" },
                  "Sécurité"
                )
              ),
              $h("div", { "class": "reg-grp" },
                "Abonnement"
              ),
              $h("button", { "class": "reg-nav", "type": "button", "aria-current": $v.cur?.abo, "onClick": $v.go?.abo },
                $h("span", { "class": "reg-nav-ic" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M3 6h18v12H3zM3 10h18M7 15h3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $h("span", { "style": "flex: 1; white-space: nowrap;" },
                  "Formule et facturation"
                )
              )
            ] : null,
            ($v.mobile) ? [
              $h("a", { "class": "reg-nav reg-out", "href": "/app/deconnexion", "style": "margin-top: 20px;" },
                $h("span", { "class": "reg-nav-ic" },
                  $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M15 17l5-5-5-5M20 12H9M12 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                "Se déconnecter"
              )
            ] : null,
            $h("div", { "class": "reg-foot", "style": "margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 12px;" },
              $h("span", { "style": "width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #4C9AFF, #0B6FE0); color: #FFFFFF; font-weight: 700; font-size: 13px;" },
                $t($v.me?.initiale)
              ),
              $h("span", { "style": "flex: 1; min-width: 0; display: flex; flex-direction: column;" },
                $h("span", { "style": "font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t($v.me?.nom)
                ),
                $h("span", { "style": "font-size: 12px; color: var(--ink-faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                  $t($v.me?.email)
                )
              )
            )
          ),
          $h("section", { "style": "flex: 1; min-width: 0; position: relative; padding: 36px 44px 88px; overflow-y: auto;" },
            ($v.mobile) ? [
              $h("button", { "class": "reg-back", "type": "button", "onClick": $v.back },
                $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                  $h("path", { "d": "M15 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "Réglages"
              )
            ] : null,
            $h("button", { "class": "reg-x", "type": "button", "onClick": $v.close, "aria-label": "Fermer les réglages" },
              $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                $h("path", { "d": "M6 6l12 12M18 6L6 18", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
              )
            ),
            ($v.sec?.profil) ? [
              $h("header", { "class": "reg-head" },
                $h("h2", null,
                  "Profil"
                ),
                $h("span", null,
                  "Ce que Kopycat affiche de toi. Chaque changement s’enregistre tout seul."
                )
              ),
              $h("div", { "class": "reg-card" },
                $h("div", { "id": "reg-photo", "class": "reg-row", "style": ` ${$t($v.glow?.photo)}` },
                  $h("span", { "class": "reg-lab" },
                    $h("span", { "class": "reg-t" },
                      "Photo"
                    ),
                    $h("span", { "class": "reg-h" },
                      "Ton initiale, tant que tu n’as pas mis de photo."
                    )
                  ),
                  $h("span", { "class": "reg-av" },
                    $t($v.me?.initiale)
                  )
                ),
                $h("div", { "id": "reg-prenom", "class": "reg-row", "style": `border-top: 1px solid var(--line); ${$t($v.glow?.prenom)}` },
                  $h("span", { "class": "reg-lab" },
                    $h("span", { "class": "reg-t" },
                      "Prénom"
                    ),
                    $h("span", { "class": "reg-h" },
                      "Affiché dans l’app."
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; align-items: flex-end; gap: 6px;" },
                    $h("input", { "class": "reg-in", "type": "text", "value": $v.nameVal, "onInput": $v.onName, "onBlur": $v.onNameBlur, "maxlength": "40", "placeholder": "Ton prénom", "aria-label": "Prénom", "autocomplete": "given-name" }),
                    ($v.nameSaved) ? [
                      $h("span", { "class": "reg-ok" },
                        $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                          $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        "Enregistré"
                      )
                    ] : null,
                    ($v.nameErr) ? [
                      $h("span", { "style": "font-size: 12px; color: #FF8A8A;" },
                        $t($v.nameErr)
                      )
                    ] : null
                  )
                ),
                $h("div", { "id": "reg-email", "class": "reg-row", "style": `border-top: 1px solid var(--line); ${$t($v.glow?.email)}` },
                  $h("span", { "class": "reg-lab" },
                    $h("span", { "class": "reg-t" },
                      "E-mail"
                    ),
                    $h("span", { "class": "reg-h" },
                      "Pour te connecter et recevoir tes reçus."
                    )
                  ),
                  $h("span", { "style": "display: flex; align-items: center; gap: 12px; min-width: 0;" },
                    $h("span", { "style": "font-size: 14px; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" },
                      $t($v.me?.email)
                    ),
                    ($v.me?.verified) ? [
                      $h("span", { "class": "reg-pill reg-green" },
                        $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                          $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        "Vérifiée"
                      )
                    ] : null
                  )
                )
              ),
              $h("div", { "class": "reg-card reg-danger", "style": "margin-top: 20px;" },
                $h("div", { "id": "reg-fermer", "class": "reg-row", "style": $v.glow?.fermer },
                  $h("span", { "class": "reg-lab" },
                    $h("span", { "class": "reg-t" },
                      "Fermer mon compte"
                    ),
                    $h("span", { "class": "reg-h" },
                      "Supprime ton compte, tes dossiers, tes suivis et tes alertes."
                    )
                  ),
                  ($v.delClosed) ? [
                    $h("button", { "class": "reg-btn reg-redline", "type": "button", "onClick": $v.delOpen },
                      "Fermer mon compte"
                    )
                  ] : null
                ),
                ($v.delShown) ? [
                  $h("div", { "style": "display: flex; flex-direction: column; gap: 12px; padding: 4px 0 18px;" },
                    $h("span", { "style": "font-size: 13px; line-height: 1.5; color: var(--ink-soft);" },
                      "Tout est effacé, sans retour possible. Pour confirmer, retape ton e-mail : ",
                      $h("b", { "style": "color: #FFFFFF;" },
                        $t($v.me?.email)
                      )
                    ),
                    $h("span", { "style": "display: flex; align-items: center; gap: 10px;" },
                      $h("input", { "class": "reg-in", "style": "flex: 1; width: auto;", "type": "email", "value": $v.delEmail, "onInput": $v.onDelEmail, "placeholder": "Ton e-mail", "aria-label": "Retape ton e-mail", "autocomplete": "off" }),
                      $h("button", { "class": "reg-btn reg-text", "type": "button", "onClick": $v.delCancel },
                        "Annuler"
                      ),
                      $h("button", { "class": "reg-btn reg-red", "type": "button", "disabled": $v.delOff, "onClick": $v.delGo },
                        $t($v.delLabel)
                      )
                    ),
                    ($v.delErr) ? [
                      $h("span", { "style": "font-size: 12px; color: #FF8A8A;" },
                        $t($v.delErr)
                      )
                    ] : null
                  )
                ] : null
              )
            ] : null,
            ($v.sec?.securite) ? [
              $h("header", { "class": "reg-head" },
                $h("h2", null,
                  "Sécurité"
                ),
                $h("span", null,
                  "Où ta session est ouverte."
                )
              ),
              $h("div", { "class": "reg-card" },
                $h("div", { "id": "reg-appareil", "class": "reg-row", "style": ` ${$t($v.glow?.appareil)}` },
                  $h("span", { "class": "reg-lab" },
                    $h("span", { "class": "reg-t" },
                      "Cet appareil"
                    ),
                    $h("span", { "class": "reg-h" },
                      $t($v.sinceTxt)
                    )
                  ),
                  $h("span", { "class": "reg-pill reg-blue" },
                    "Actuel"
                  )
                ),
                $h("div", { "id": "reg-autres", "class": "reg-row", "style": `border-top: 1px solid var(--line); ${$t($v.glow?.autres)}` },
                  $h("span", { "class": "reg-lab" },
                    $h("span", { "class": "reg-t" },
                      "Autres appareils"
                    ),
                    $h("span", { "class": "reg-h" },
                      $t($v.othersTxt)
                    )
                  ),
                  $h("button", { "class": "reg-btn", "type": "button", "disabled": $v.othersOff, "onClick": $v.signOutOthers },
                    $t($v.othersLabel)
                  )
                )
              )
            ] : null,
            ($v.sec?.abo) ? [
              $h("header", { "class": "reg-head" },
                $h("h2", null,
                  "Formule et facturation"
                ),
                $h("span", null,
                  $t($v.aboSub)
                )
              ),
              ($v.me?.free) ? [
                $h("div", { "id": "reg-formule", "class": "reg-plan", "style": $v.glow?.formule },
                  $h("span", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;" },
                    $h("span", { "style": "display: flex; align-items: center; gap: 10px;" },
                      $h("span", { "style": "font-size: 17px; font-weight: 700;" },
                        "Kopycat Pro"
                      ),
                      ($v.bfOn) ? [
                        $h("span", { "class": "reg-pill reg-orange" },
                          "Black Friday · fin dans ", $t($v.bfTime)
                        )
                      ] : null
                    ),
                    $h("span", { "class": "reg-seg", "role": "radiogroup", "aria-label": "Formule" },
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.billM, "onClick": $v.pickM },
                        "Mensuel"
                      ),
                      $h("button", { "type": "button", "role": "radio", "aria-checked": $v.billY, "onClick": $v.pickY },
                        "Annuel",
                        $h("span", { "style": "font-size: 11px; font-weight: 700; color: #FF9C57;" },
                          "−50 %"
                        )
                      )
                    )
                  ),
                  $h("span", { "style": "display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap;" },
                    $h("span", { "style": "display: flex; flex-direction: column; gap: 6px;" },
                      $h("span", { "style": "display: flex; align-items: baseline; gap: 8px;" },
                        ($v.billY) ? [
                          $h("span", { "style": "font-size: 16px; color: var(--ink-faint); text-decoration: line-through;" },
                            "29,99 €"
                          )
                        ] : null,
                        $h("span", { "style": "font-family: var(--font-display); font-size: 44px; font-weight: 700; letter-spacing: -0.045em; line-height: 1; font-variant-numeric: tabular-nums;" },
                          $t($v.price)
                        ),
                        $h("span", { "style": "font-size: 14px; color: var(--ink-muted);" },
                          "/ mois"
                        )
                      ),
                      $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                        $t($v.priceSub)
                      )
                    ),
                    $h("a", { "class": "reg-cta", "href": $v.ctaHref, "style": $v.ctaStyle },
                      $t($v.ctaLabel)
                    )
                  ),
                  $h("span", { "class": "reg-inc" },
                    ($l($v.inc)).map((i) => [
                      $h("span", null,
                        $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: var(--accent);" },
                          $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        ),
                        $t(i)
                      )
                    ])
                  )
                )
              ] : null,
              ($v.me?.pro) ? [
                $h("div", { "id": "reg-formule", "class": "reg-card", "style": `padding: 18px 20px; display: flex; align-items: center; gap: 14px; ${$t($v.glow?.formule)}` },
                  $h("span", { "style": "width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent);" },
                    $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                      $h("path", { "d": "M13 3L5 14h6l-1 7 8-11h-6z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 4px;" },
                    $h("span", { "style": "display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700;" },
                      "Kopycat Pro",
                      $h("span", { "class": "reg-pill reg-green" },
                        "Actif"
                      )
                    ),
                    $h("span", { "style": "font-size: 13px; color: var(--ink-muted);" },
                      "Ton compte a accès à tout Kopycat."
                    )
                  )
                )
              ] : null,
              $h("div", { "class": "reg-card", "style": "margin-top: 20px;" },
                $h("div", { "id": "reg-recus", "class": "reg-row", "style": ` ${$t($v.glow?.recus)}` },
                  $h("span", { "class": "reg-lab" },
                    $h("span", { "class": "reg-t" },
                      "Reçus"
                    ),
                    $h("span", { "class": "reg-h" },
                      "Tes reçus arriveront ici après chaque paiement."
                    )
                  ),
                  $h("span", { "style": "font-size: 13px; color: var(--ink-faint); white-space: nowrap;" },
                    "Aucun pour l’instant"
                  )
                )
              )
            ] : null,
            ($v.toastOn) ? [
              $h("div", { "class": "reg-toast", "role": "status" },
                $h("span", { "style": "color: #5CD394; display: flex;" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0;" },
                    $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                ),
                $t($v.toastText),
                ($v.toastUndo) ? [
                  $h("button", { "type": "button", "onClick": $v.undo },
                    "Annuler"
                  )
                ] : null
              )
            ] : null
          )
        )
      )
    ];
  }
}
