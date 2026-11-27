// Généré par scripts/dc2preact.py depuis design/PlanMobile.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l, $u } from '../runtime.js';

export default class PlanMobile extends DCLogic {
  // L'onboarding B du test A/B (26/11/2026), parcours B1 retenu par le fondateur : 5 questions, le calcul, le plan, puis
  // l'inscription (version C, feuille sur l'app floutée), l'app à copier, la signature et le paywall. Les données sont
  // dans la page (relevé du Radar du 26/11, les 6 niches de la maquette) : aucun appel au backend avant l'inscription.
  // Sur le site (src/main-plan.js), la page reçoit :
  //   auth        { password(flow, email, mdp), google() } : rend null si réussi, sinon { code, message }
  //   authed      vrai une fois le compte créé (la suite du parcours s'ouvre)
  //   user        { prenom } quand on le connaît (Google)
  //   saved       l'état gardé dans le navigateur (reprise après un rechargement ou le retour de Google)
  //   save(état)  le garde ; track(événement, propriétés) l'envoie à la mesure ; onPay(formule) ; onLater()
  // Sur le canevas : ecran, etat, montant, prenom (écrans figés).
  static K = (() => {
    const DATA = {"releve":"26/11/2026","niches":[{"id":"sante","nom":"Santé et physique","apps":70,"vpv":4598,"liste":[{"nom":"Mise","logo":"/media/simulateur/mise.jpg","quoi":"Meal planner","comptes":130,"fr":7,"videos":1353,"note":"4,5","prix":{"min":"9,99","max":"59,99"},"cover":"/media/plan/v-7710492306742283528.jpg","vues":"1,3 M","compte":"paula.eatss","formats":3,"reseau":6},{"nom":"Musa","logo":"/media/simulateur/musa.jpg","quoi":"Period & Pregnancy","comptes":32,"fr":2,"videos":526,"note":"4,7","prix":{"min":"6,99","max":"34,99"},"cover":"/media/plan/v-7710412757409041694.jpg","vues":"289 k","compte":"marina.pragnancy","formats":3,"reseau":6},{"nom":"Solaia","logo":"/media/simulateur/solaia.jpg","quoi":"Équilibre hormonal","comptes":64,"fr":52,"videos":453,"note":"4,6","prix":{"min":"8,99","max":"79,99"},"cover":"/media/plan/v-7709915874399964448.jpg","vues":"1,7 M","compte":"byelizen","formats":3,"reseau":6}]},{"id":"social","nom":"Social et loisirs","apps":111,"vpv":10460,"liste":[{"nom":"MoboReels","logo":"/media/simulateur/moboreels.jpg","quoi":"Short Drama Series","comptes":98,"fr":0,"videos":1252,"note":"4,5","prix":{"min":"6,99","max":"59,99"},"cover":"/media/plan/v-7710617508012756231.jpg","vues":"12,7 k","compte":"austinobest1","formats":3,"reseau":6},{"nom":"SlowRead","logo":"/media/simulateur/slowread.jpg","quoi":"Bibliothèque & PAL","comptes":70,"fr":0,"videos":792,"note":"3,8","prix":{"min":"7,79","max":"129,99"},"cover":"/media/plan/v-7706174306748845334.jpg","vues":"35,8 k","compte":"andrea.booktoker","formats":3,"reseau":6},{"nom":"DramaBox","logo":"/media/simulateur/dramabox.jpg","quoi":"Film et Drame Court","comptes":88,"fr":0,"videos":618,"note":"4,6","prix":{"min":"0,99","max":"14,99"},"cover":"/media/plan/v-7709357476939877646.jpg","vues":"260 k","compte":"j3w3lz.rose","formats":3,"reseau":6}]},{"id":"etudes","nom":"Études","apps":35,"vpv":4542,"liste":[{"nom":"Aistote","logo":"/media/simulateur/aistote.jpg","quoi":"QUIZ IA","comptes":46,"fr":6,"videos":532,"note":"4,5","prix":{"min":"8,99","max":"49,99"},"cover":"/media/plan/v-7711615369651277087.jpg","vues":"206 k","compte":"wow_its_clifford","formats":3,"reseau":6},{"nom":"NurseMind","logo":"/media/simulateur/nursemind.jpg","quoi":"AI Nursing Guide","comptes":112,"fr":0,"videos":435,"note":null,"prix":{"min":"9,99","max":"34,99"},"cover":"/media/plan/v-7711442404619881742.jpg","vues":"2 k","compte":"learninghacks4u","formats":3,"reseau":6},{"nom":"Diane AI","logo":"/media/simulateur/diane-ai.jpg","quoi":"Flashcards","comptes":53,"fr":49,"videos":403,"note":"4,6","prix":{"min":"19,99","max":"89,99"},"cover":"/media/plan/v-7710371564923014432.jpg","vues":"51,8 k","compte":"el1ott_lapt","formats":3,"reseau":6}]},{"id":"langues","nom":"Langues","apps":36,"vpv":6669,"liste":[{"nom":"Vocabulary","logo":"/media/simulateur/vocabulary.jpg","quoi":"Apprenez mots","comptes":71,"fr":0,"videos":637,"note":"4,7","prix":{"min":"5,99","max":"59,99"},"cover":"/media/plan/v-7710309824344460566.jpg","vues":"4,2 k","compte":"edforyou6","formats":3,"reseau":6},{"nom":"Pingo AI","logo":"/media/simulateur/pingo-ai.jpg","quoi":"Application d'apprentissage des langues par IA qui corrige les phrases et répond aux questions de vocabulaire","comptes":147,"fr":7,"videos":480,"note":"4,6","prix":{"min":"14,99","max":"119,99"},"cover":"/media/plan/v-7711006014425795861.jpg","vues":"78,3 k","compte":"nadiaspeaksgerman","formats":3,"reseau":6},{"nom":"Bunpo","logo":"/media/simulateur/bunpo.jpg","quoi":"Apprendre les langues","comptes":86,"fr":0,"videos":206,"note":"4,8","prix":{"min":"9,99","max":"99,99"},"cover":"/media/plan/v-7709922289172647201.jpg","vues":"18,9 k","compte":"frenchwithlars","formats":3,"reseau":6}]},{"id":"prod","nom":"Productivité","apps":27,"vpv":4020,"liste":[{"nom":"TapCook","logo":"/media/simulateur/tapcook.jpg","quoi":"Budget Meal Plans","comptes":184,"fr":0,"videos":3342,"note":"4,5","prix":{"min":"9,99","max":"34,99"},"cover":"/media/plan/v-7711485707772054792.jpg","vues":"31,7 k","compte":"mealprepsteve","formats":3,"reseau":6},{"nom":"FocusTown","logo":"/media/simulateur/focustown.jpg","quoi":"Minuteur Pomodoro","comptes":50,"fr":0,"videos":432,"note":"4,7","prix":{"min":"0,99","max":"34,99"},"cover":"/media/plan/v-7707246180899573025.jpg","vues":"165 k","compte":"yellen_forellen","formats":3,"reseau":6},{"nom":"EcoGPT","logo":"/media/simulateur/ecogpt.jpg","quoi":"Application d'IA conversationnelle présentée par les créatrices comme un moyen d'agir pour la planète à travers ses usages quotidiens","comptes":130,"fr":0,"videos":426,"note":"4,7","prix":{"min":"6,99","max":"79,99"},"cover":"/media/plan/v-7710416614897880340.jpg","vues":"901 k","compte":"ecologiacongaby","formats":3,"reseau":6}]},{"id":"side","nom":"Side hustle","apps":50,"vpv":1405,"liste":[{"nom":"SideShift","logo":"/media/simulateur/sideshift.jpg","quoi":"Earn Money","comptes":158,"fr":19,"videos":1339,"note":"4,8","prix":{"min":"0,99","max":"89,99"},"cover":"/media/plan/v-7710695480325311765.jpg","vues":"4,3 M","compte":"prankswithgenn_","formats":3,"reseau":6},{"nom":"Hub Capture","logo":"/media/simulateur/hub-capture.jpg","quoi":"Plateforme de revenus en ligne par parrainage, avec dropshipping et création de contenu UGC pour TikTok Shop","comptes":54,"fr":0,"videos":180,"note":null,"prix":null,"cover":"/media/plan/v-7711010891512171784.jpg","vues":"79,2 k","compte":"tamiresrrosati","formats":3,"reseau":6},{"nom":"TikAlyzer","logo":"/media/simulateur/tikalyzer.jpg","quoi":"Deviens Viral","comptes":51,"fr":0,"videos":87,"note":"4,2","prix":{"min":"6,99","max":"69,99"},"cover":"/media/plan/v-7711334652664974622.jpg","vues":"1,1 k","compte":"viviana.tikalyzr","formats":0,"reseau":6}]}],"tout":{"id":"tout","nom":"Toutes les niches","apps":653,"vpv":7400,"liste":[{"nom":"SideShift","logo":"/media/simulateur/sideshift.jpg","quoi":"Earn Money","comptes":158,"fr":19,"videos":1339,"note":"4,8","prix":{"min":"0,99","max":"89,99"},"cover":"/media/plan/v-7710695480325311765.jpg","vues":"4,3 M","compte":"prankswithgenn_","formats":3,"reseau":6},{"nom":"Solaia","logo":"/media/simulateur/solaia.jpg","quoi":"Équilibre hormonal","comptes":64,"fr":52,"videos":453,"note":"4,6","prix":{"min":"8,99","max":"79,99"},"cover":"/media/plan/v-7709915874399964448.jpg","vues":"1,7 M","compte":"byelizen","formats":3,"reseau":6},{"nom":"Mise","logo":"/media/simulateur/mise.jpg","quoi":"Meal planner","comptes":130,"fr":7,"videos":1353,"note":"4,5","prix":{"min":"9,99","max":"59,99"},"cover":"/media/plan/v-7710492306742283528.jpg","vues":"1,3 M","compte":"paula.eatss","formats":3,"reseau":6}]}};
    const NN = " ", NB = " ";
    const grp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NN);
    const fr = (x, d) => { let s = x.toFixed(d); if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, ""); return s.replace(".", ","); };
    const big = (n) => n >= 1e6 ? fr(n / 1e6, n >= 1e7 ? 0 : 2).replace(/,(\d)0$/, ",$1") + NN + "M" : n >= 1e3 ? fr(n / 1e3, 0) + NN + "k" : String(Math.round(n));
    const parseV = (t) => {
      const m = String(t || "").replace(/\s/g, "").match(/^([\d,]+)([kM]?)$/);
      if (!m) return 0;
      const x = parseFloat(m[1].replace(",", "."));
      return m[2] === "M" ? x * 1e6 : m[2] === "k" ? x * 1e3 : x;
    };
    const sp = (t) => String(t || "").replace(/\s/g, NN);
    const AMOUNTS = [500, 1000, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000];
    const TIMES = [{ v: 30, l: "30" + NB + "min", vids: 1 }, { v: 60, l: "1" + NB + "h", vids: 3 }, { v: 120, l: "2" + NB + "h", vids: 6 }, { v: 180, l: "3" + NB + "h et +", vids: 9 }];
    const M = "/media/plan/v-";
    const VISAGES = [
      { id: "face", l: "Oui, face caméra", short: "Face caméra", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6",
        r: "Face caméra, c'est ce qui crée le plus de lien. Voici des accroches parlées qui tournent en ce moment.",
        covers: [{ src: M + "7707745824872156448.jpg", v: "1" + NN + "M", app: "SideShift" }, { src: M + "7708363079444155681.jpg", v: "96,6" + NN + "k", app: "Solaia" }, { src: M + "7710994709463715105.jpg", v: "109" + NN + "k", app: "Diane AI" }] },
      { id: "sans", l: "Sans montrer mon visage", short: "Sans visage", icon: "M4 5h16v14H4zM8 10h8M8 14h5",
        r: "Aucun souci. Beaucoup de formats se tournent sans visage : texte à l'écran, voix off, captures. En voici trois qui tournent.",
        covers: [{ src: M + "7710020762337365268.jpg", v: "492" + NN + "k", app: "Liggo" }, { src: M + "7710313265775054112.jpg", v: "258" + NN + "k", app: "Amorly" }, { src: M + "7708731515743604001.jpg", v: "71,8" + NN + "k", app: "Diane AI" }] },
      { id: "crea", l: "Je préfère payer des créatrices", short: "Avec des créatrices", icon: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c1-3 3.3-4.5 6-4.5s5 1.5 6 4.5M16 11a3 3 0 1 0 0-6M18 15.5c1.5.6 2.5 2 3 4.5",
        r: "Ton plan comptera des créatrices payées à la vidéo, autour de 5 € chacune. Voici ce qu'elles tournent pour ces apps.",
        covers: [{ src: M + "7709915874399964448.jpg", v: "1,7" + NN + "M", app: "Solaia" }, { src: M + "7710412757409041694.jpg", v: "289" + NN + "k", app: "Musa" }, { src: M + "7711038070874819872.jpg", v: "270" + NN + "k", app: "Finzee" }] }
    ];
    const BLOCAGES = [
      { id: "idee", l: "Je n'ai pas trouvé d'idée", r: "C'est la première chose que le Radar te donne : une app qui marche déjà dans ta niche.", manque: "Il te manque une idée qui a déjà fait ses preuves." },
      { id: "poster", l: "Je ne sais pas quoi poster", r: "Tu n'as rien à inventer : les formats qui font déjà des vues, à refaire tels quels.", manque: "Il te manque des formats qui marchent déjà." },
      { id: "vues", l: "Mes vidéos ne font pas de vues", r: "Souvent, ce n'est pas toi, c'est le format. On part de ceux qui font déjà des vues.", manque: "Il te manque les formats qui font des vues." },
      { id: "lache", l: "J'abandonne vite", r: "Un plan court, une vidéo à la fois : tu sais toujours quoi poster demain.", manque: "Il te manque un plan simple, jour après jour." }
    ];
    const POPS = [
      { at: 30, key: "engage", q: "Prêt à poster chaque jour pendant 30 jours ?", t: "On règle ton plan sur ta réponse.", no: "Pas encore", yes: "Oui" },
      { at: 70, key: "marche", q: "Tu vises la France ou partout ?", t: "Le Radar suit les comptes de chaque marché.", no: "Partout", yes: "La France" }
    ];
    const ORDER = ["accueil", "objectif", "niche", "temps", "visage", "blocage", "preuve", "calcul", "plan", "manque", "inscription", "app", "engagement", "paywall"];
    const QUESTIONS = { niche: 1, temps: 1, visage: 1, blocage: 1 };
    // Le top de la niche, l'app à copier selon le marché (France : la plus poussée par des comptes français), les autres.
    const niche = (id) => (id === "tout" ? DATA.tout : DATA.niches.find((n) => n.id === id) || DATA.niches[0]);
    const pick = (n, marche) => {
      const L = n.liste.slice();
      if (marche !== "tout" && L.some((a) => a.fr > 0)) L.sort((a, b) => b.fr - a.fr || b.comptes - a.comptes);
      else L.sort((a, b) => b.comptes - a.comptes);
      return { app: L[0], others: L.slice(1) };
    };
    return { DATA, NN, NB, grp, fr, big, parseV, sp, AMOUNTS, TIMES, VISAGES, BLOCAGES, POPS, ORDER, QUESTIONS, niche, pick };
  })();

  constructor(p) {
    super(p);
    const K = this.constructor.K;
    const s = p.saved && typeof p.saved === "object" ? p.saved : null;
    const ecran = K.ORDER.indexOf(p.ecran) >= 0 ? p.ecran : s && K.ORDER.indexOf(s.step) >= 0 ? s.step : "accueil";
    const etat = p.etat || "question";
    const answered = s && s.answered ? Object.assign({}, s.answered) : {};
    if (etat === "reponse") answered[ecran] = true;
    const amt = K.AMOUNTS.indexOf(Number(p.montant) || 0);
    this.state = {
      step: ecran === "calcul" && s ? "calcul" : ecran, answered, picked: null,
      amountIdx: s && s.amountIdx >= 0 && s.amountIdx <= 10 ? s.amountIdx : amt >= 0 ? amt : 4,
      niche: s && s.niche ? s.niche : "sante", time: s && s.time ? s.time : 120, visage: s && s.visage ? s.visage : "sans",
      blocage: s && s.blocage ? s.blocage : "poster", marche: s && s.marche ? s.marche : "fr", engage: s ? s.engage : null,
      pct: etat === "popup" ? 30 : etat === "popup2" ? 70 : etat === "encours" ? 52 : 0, popup: etat === "popup" ? 1 : etat === "popup2" ? 2 : 0,
      popDone: etat === "popup2" ? { 0: true } : {},
      hold: etat === "appui" ? 62 : etat === "signe" ? 100 : 0, holding: false, signed: etat === "signe" || !!(s && s.signed),
      plan: "mensuel", calcOpen: false, busy: false, error: "", exists: false,
      // Premier écran déjà dessiné par le pré-rendu (plan.html) : il ne rejoue pas son entrée. Faux dès qu'on avance.
      calme: !!p.calme
    };
    if (!s && ecran === "temps" && etat === "question") this.state.time = 0;
    if (!s && ecran === "blocage" && etat === "question") this.state.blocage = "";
    this.auto = !p.ecran;
    this.timers = [];
    this.later = (fn, ms) => { const id = setTimeout(fn, ms); this.timers.push({ t: id }); };
    this.clear = () => { this.timers.forEach((x) => { if (x.i) clearInterval(x.i); if (x.t) clearTimeout(x.t); }); this.timers = []; };
    this.go = (to) => {
      this.auto = true;
      this.clear();
      const step = to === "inscription" && this.props.authed ? "app" : to;
      this.setState({ step, calme: false, picked: null, popup: 0, pct: step === "calcul" ? 0 : this.state.pct, hold: step === "engagement" && this.state.signed ? 100 : 0, holding: false, error: "", busy: false }, () => { if (step === "calcul") this.runCalc(); });
    };
    this.next = () => { const i = K.ORDER.indexOf(this.state.step); if (i < K.ORDER.length - 1) this.go(K.ORDER[i + 1]); };
    this.back = () => {
      const st = this.state;
      if (K.QUESTIONS[st.step] && st.answered[st.step]) { const a = Object.assign({}, st.answered); delete a[st.step]; this.setState({ answered: a }); return; }
      let j = K.ORDER.indexOf(st.step) - 1;
      while (j >= 0 && (K.ORDER[j] === "calcul" || (K.ORDER[j] === "inscription" && this.props.authed))) j -= 1;
      if (j >= 0) this.go(K.ORDER[j]);
    };
    this.answer = (key, val) => {
      const st = this.state; const a = Object.assign({}, st.answered); a[st.step] = true;
      const patch = { picked: val, calme: false }; patch[key] = val; this.setState(patch);
      this.track("onboarding_reponse", { question: st.step, reponse: String(val) });
      this.later(() => this.setState({ answered: a, picked: null }), 380);
    };
    this.onAmount = (e) => { const i = Math.max(0, Math.min(10, Number(e.target.value) || 0)); this.setState({ amountIdx: i }); };
    this.pickNicheAll = () => this.answer("niche", "tout");
    this.popAnswer = (yes) => {
      const st = this.state; const pop = K.POPS[st.popup - 1]; const d = Object.assign({}, st.popDone); d[st.popup - 1] = true;
      const patch = { popup: 0, popDone: d };
      if (pop.key === "engage") patch.engage = yes;
      else patch.marche = yes ? "fr" : "tout";
      this.track("onboarding_reponse", { question: pop.key, reponse: pop.key === "engage" ? (yes ? "oui" : "pas encore") : patch.marche });
      this.auto = true; this.setState(patch, () => this.runCalc());
    };
    this.popYes = () => this.popAnswer(true);
    this.popNo = () => this.popAnswer(false);
    this.toggleCalc = () => this.setState({ calcOpen: !this.state.calcOpen });
    this.holdStart = (e) => {
      if (this.state.signed) return;
      try { if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
      this.clear(); this.setState({ holding: true });
      const t0 = Date.now(), from = this.state.hold;
      const id = setInterval(() => {
        const h = Math.min(100, from + (Date.now() - t0) / 14);
        this.setState({ hold: h });
        if (h >= 100) { clearInterval(id); this.setState({ signed: true, holding: false }); this.later(() => this.next(), 900); }
      }, 30);
      this.timers.push({ i: id });
    };
    this.holdEnd = () => {
      if (!this.state.holding || this.state.signed) return;
      this.clear();
      const id = setInterval(() => { const h = Math.max(0, this.state.hold - 6); this.setState({ hold: h, holding: false }); if (h <= 0) clearInterval(id); }, 30);
      this.timers.push({ i: id });
    };
    // Au clavier : Entrée ou Espace signe d'un coup (l'appui long ne se fait qu'au doigt ou à la souris).
    this.holdKey = (e) => {
      if (this.state.signed || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault(); this.setState({ hold: 100, signed: true }); this.later(() => this.next(), 900);
    };
    this.pickAnnuel = () => this.setState({ plan: "annuel" });
    this.pickMensuel = () => this.setState({ plan: "mensuel" });
    this.pay = () => {
      // « paiement_commence » part de l'app, à l'arrivée sur /app/payer/<formule> (une seule source pour les deux bras).
      if (this.props.onPay) this.props.onPay(this.state.plan);
    };
    this.laterFn = () => { if (this.props.onLater) this.props.onLater(); else this.go("accueil"); };
    // Inscription : sans le site (canevas), on passe à la suite.
    this.submit = (e) => {
      e.preventDefault();
      const auth = this.props.auth;
      if (!auth) { this.next(); return; }
      const f = new FormData(e.currentTarget);
      this.setState({ busy: true, error: "", exists: false });
      auth.password("signUp", String(f.get("email") || ""), String(f.get("password") || "")).then((failed) => {
        if (failed) this.setState({ busy: false, error: failed.message, exists: failed.code === "COMPTE_EXISTANT" });
      });
    };
    this.google = () => {
      const auth = this.props.auth;
      if (!auth) { this.next(); return; }
      this.setState({ busy: true, error: "" });
      auth.google().then((failed) => { if (failed) this.setState({ busy: false, error: failed.message }); });
    };
    this.track = (event, props) => { if (this.props.track) this.props.track(event, props); };
    this.runCalc = () => {
      if (!this.auto || this.state.step !== "calcul") return;
      const id = setInterval(() => {
        const st = this.state;
        if (st.step !== "calcul" || st.popup) { clearInterval(id); return; }
        const pct = Math.min(100, st.pct + 1);
        const k = K.POPS.findIndex((pp, j) => pp.at === pct && !st.popDone[j]);
        if (k >= 0) { clearInterval(id); this.setState({ pct, popup: k + 1 }); return; }
        this.setState({ pct });
        if (pct >= 100) { clearInterval(id); this.later(() => this.go("plan"), 500); }
      }, 75);
      this.timers.push({ i: id });
    };
    this.seen = (step) => {
      const i = K.ORDER.indexOf(step);
      this.track("onboarding_vu", { etape: i + 1, ecran: step });
      if (step === "paywall") this.track("paywall_vu", { ecran: "plan" });
    };
  }
  componentDidMount() {
    if (this.state.step === "calcul" && this.auto) this.runCalc();
    if (this.state.step === "inscription" && this.props.authed) this.go("app");
    else if (this.props.track) this.seen(this.state.step);
  }
  componentDidUpdate(prevProps, prevState) {
    const st = this.state;
    if (st.step === "inscription" && this.props.authed && !prevProps.authed) this.go("app");
    if (st.step !== prevState.step) this.seen(st.step);
    if (this.props.save) {
      const keep = { step: st.step, answered: st.answered, amountIdx: st.amountIdx, niche: st.niche, time: st.time, visage: st.visage, blocage: st.blocage, marche: st.marche, engage: st.engage, signed: st.signed };
      const was = { step: prevState.step, answered: prevState.answered, amountIdx: prevState.amountIdx, niche: prevState.niche, time: prevState.time, visage: prevState.visage, blocage: prevState.blocage, marche: prevState.marche, engage: prevState.engage, signed: prevState.signed };
      if (JSON.stringify(keep) !== JSON.stringify(was)) this.props.save(keep);
    }
  }
  componentWillUnmount() { this.clear(); }

  renderVals() {
    const K = this.constructor.K, st = this.state;
    const s = {}; K.ORDER.forEach((k) => { s[k] = st.step === k; });
    const idx = K.ORDER.indexOf(st.step);
    const pct = Math.round(((idx + 1) / K.ORDER.length) * 100);
    const amount = K.AMOUNTS[st.amountIdx];
    const N = K.niche(st.niche);
    const vMin = amount / 3.5 * 1000, vMax = amount / 2.5 * 1000;
    const vidMin = Math.max(1, Math.round(vMin / N.vpv / 30)), vidMax = Math.max(1, Math.round(vMax / N.vpv / 30));
    const comptes = Math.max(1, Math.ceil(vidMax / 3));
    const vidTxt = vidMin === vidMax ? String(vidMin) : vidMin + " à " + vidMax;
    const vidUnit = vidMax > 1 ? "vidéos" : "vidéo";
    const comptesTxt = comptes > 1 ? comptes + " comptes" : "1 compte";
    const timeD = K.TIMES.find((t) => t.v === st.time) || K.TIMES[2];
    const cap = timeD.vids;
    const crea = Math.max(0, Math.ceil((vidMin - cap) / 2));
    const verdict = cap >= vidMin ? "Faisable avec ton temps" : "Avec " + crea + " créatrice" + (crea > 1 ? "s" : "") + " en plus";
    const tier = amount <= 1500 ? { badge: "RÉALISTE", text: "Un compte bien tenu, une app qui marche déjà : c'est un bon premier objectif." }
      : amount <= 5000 ? { badge: "ACCESSIBLE", text: "Deux ou trois comptes qui copient une app qui marche déjà dans ta niche." }
      : amount <= 15000 ? { badge: "AMBITIEUX", text: "Plusieurs comptes et des créatrices dès le premier mois." }
      : { badge: "TRÈS AMBITIEUX", text: "Une équipe de comptes. Vise une première marche, puis monte." };
    const answered = !!st.answered[st.step];
    const isQ = !!K.QUESTIONS[st.step];
    const optCls = (base, sel) => base + (sel ? " is-sel" : "") + " pm-in";
    const niches = K.DATA.niches.map((n, i) => ({ id: n.id, nom: n.nom, apps: n.apps, aria: n.nom + ", " + n.apps + " apps suivies", logos: n.liste.map((a) => a.logo), i: i + 1, sel: st.niche === n.id && answered, cls: optCls("pm-tile", st.picked === n.id), pick: () => this.answer("niche", n.id) }));
    const times = K.TIMES.map((t, i) => ({ l: t.l, aria: t.l.replace(/\u00A0/g, " ") + ", " + t.vids + " vidéo" + (t.vids > 1 ? "s" : "") + " par jour", i: i + 1, sel: st.time === t.v, cls: optCls("pm-tcard", st.picked === t.v), sub: t.vids + " vidéo" + (t.vids > 1 ? "s" : "") + " par jour", bars: [1, 2, 3, 4].map((b) => "pm-bar" + (b <= i + 1 ? " on" : "")), pick: () => this.answer("time", t.v) }));
    const visages = K.VISAGES.map((o, i) => ({ l: o.l, icon: o.icon, i: i + 1, sel: st.visage === o.id && answered, cls: optCls("pm-opt", st.picked === o.id), pick: () => this.answer("visage", o.id) }));
    const blocages = K.BLOCAGES.map((o, i) => ({ l: o.l, i: i + 1, sel: st.blocage === o.id, cls: optCls("pm-opt", st.picked === o.id), pick: () => this.answer("blocage", o.id) }));
    const visageD = K.VISAGES.find((o) => o.id === st.visage) || K.VISAGES[1];
    const blocD = K.BLOCAGES.find((o) => o.id === st.blocage) || K.BLOCAGES[1];
    const timeReact = timeD.vids + " vidéo" + (timeD.vids > 1 ? "s" : "") + " par jour, à 20 minutes chacune. Pour " + K.grp(amount) + " €, il en faut " + vidTxt + (cap >= vidMin ? " : ça passe." : " : on comblera avec des créatrices.");
    const top = N.liste.slice().sort((a, b) => b.videos - a.videos)[0];
    const nicheD = { nom: N.id === "tout" ? "Toutes les niches" : N.nom, apps: N.apps, logos: N.liste.map((a) => a.logo), top: { nom: top.nom, logo: top.logo, vid: K.grp(top.videos) } };
    const byViews = N.liste.filter((a) => a.cover).sort((a, b) => K.parseV(b.vues) - K.parseV(a.vues));
    const fanOf = (a, cls) => ({ cls, src: a.cover, logo: a.logo, app: a.nom, v: K.sp(a.vues), h: a.compte });
    const fan = [byViews[1] && fanOf(byViews[1], "pm-card pm-c2"), byViews[2] && fanOf(byViews[2], "pm-card pm-c3"), byViews[0] && fanOf(byViews[0], "pm-card pm-c1")].filter(Boolean);
    const pctC = Math.min(100, st.pct);
    const checks = [
      { t: "Tes réponses lues", at: 15 },
      { t: K.grp(N.apps) + " apps de " + (N.id === "tout" ? "toutes les niches" : N.nom) + " passées au crible", at: 60 },
      { t: "Les comptes qui marchent sur ton marché", at: 95 }
    ].map((c, i, arr) => ({ t: c.t, cls: "pm-ck" + (pctC >= c.at ? " done" : (i === 0 || pctC >= arr[i - 1].at) ? " run" : "") }));
    const shown = Math.min(comptes, 3);
    const accts = Array.from({ length: shown }, (_, i) => {
      const per = Math.min(3, Math.ceil(vidMax / comptes));
      const minPer = Math.min(per, Math.max(1, Math.floor(vidMin / comptes)));
      return { n: i + 1, lbl: "Compte" + K.NB + (i + 1), vids: Array.from({ length: per }, (_, j) => ({ cls: "pm-vid" + (j < minPer ? "" : " opt"), d: (300 + i * 120 + j * 70) + "ms" })) };
    });
    const pop = st.popup ? K.POPS[st.popup - 1] : K.POPS[0];
    const chosen = K.pick(N, st.marche);
    const A = chosen.app;
    const prix = A.prix && A.prix.min && A.prix.max ? A.prix.min + " à " + A.prix.max + " €" : "";
    const app = {
      nom: A.nom, logo: A.logo, cover: A.cover, vues: K.sp(A.vues), quoi: A.note ? A.quoi + " · App Store " + A.note : A.quoi,
      titre: A.nom + (N.id === "tout" ? " cartonne en ce moment." : " cartonne dans ta niche."),
      comptes: K.grp(A.comptes), comptesL: "comptes la poussent" + (A.fr > 0 ? ", dont " + K.grp(A.fr) + " en France" : ""),
      videos: K.grp(A.videos), prix, hasPrix: !!prix
    };
    const others = chosen.others.map((a, i) => ({ logo: a.logo, w1: (42 - i * 6) + "%", w2: (70 - i * 8) + "%" }));
    const counts = { apps: N.liste.length, formats: N.liste.reduce((t, a) => t + a.formats, 0), comptes: N.liste.reduce((t, a) => t + a.reseau, 0) };
    const strip = byViews.slice(0, 3).map((a) => a.cover);
    const planA = { sel: st.plan === "annuel", cls: "pm-plan" + (st.plan === "annuel" ? " is-sel" : "") };
    const planM = { sel: st.plan === "mensuel", cls: "pm-plan" + (st.plan === "mensuel" ? " is-sel" : "") };
    const prenom = (this.props.user && this.props.user.prenom) || this.props.prenom || "";
    return {
      v: {
        s, pct, progW: pct + "%",
        asking: isQ ? !answered : false, answered: isQ ? answered : false,
        amountIdx: st.amountIdx, amountP: (st.amountIdx / 10).toFixed(3), amountTxt: K.grp(amount), tier,
        amtCls: "pm-amt pm-pop-in" + (amount >= 10000 ? " is-long" : ""),
        vuesTxt: K.big(vMin).replace(/ M$/, "") + " à " + K.big(vMax), vpvTxt: K.grp(N.vpv),
        vidMin, vidMax, vidTxt, vidUnit, comptes, comptesTxt, verdict, accts, moreAccts: comptes > 3, moreN: comptes - 3,
        niches, nicheD, times, timeD, timeReact, visages, visageD, blocages, blocD,
        fan, checks, gaugeOff: (540.4 * (1 - pctC / 100)).toFixed(1), popOpen: !!st.popup, pop, calcOpen: st.calcOpen,
        fpCls: "pm-fp pm-in" + (st.holding ? " is-down" : "") + (st.signed ? " is-signed" : ""), holdOff: (427.3 * (1 - st.hold / 100)).toFixed(1),
        holdLbl: st.signed ? "Signé. On prépare ton plan." : "Maintiens appuyé pour signer",
        app, others, counts, strip, planA, planM,
        payTitle: prenom ? "Débloque ton plan, " + prenom + "." : "Débloque ton plan.",
        busy: st.busy, error: st.error, hasError: !!st.error, exists: st.exists
      },
      rootCls: (this.props.nu ? "pm pm-nu" : "pm") + (st.calme ? " pm-calme" : ""),
      next: this.next, back: this.back, onAmount: this.onAmount, pickNicheAll: this.pickNicheAll,
      popYes: this.popYes, popNo: this.popNo, toggleCalc: this.toggleCalc,
      holdStart: this.holdStart, holdEnd: this.holdEnd, holdKey: this.holdKey, pickAnnuel: this.pickAnnuel, pickMensuel: this.pickMensuel,
      pay: this.pay, later: this.laterFn, submit: this.submit, google: this.google
    };
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": $v.rootCls, "role": "main" },
        $h("div", { "class": "pm-bg", "aria-hidden": "true" }),
        $h("div", { "class": "pm-dots", "aria-hidden": "true" }),
        $h("div", { "class": "pm-blob pm-b1", "aria-hidden": "true" }),
        $h("div", { "class": "pm-blob pm-b2", "aria-hidden": "true" }),
        $h("header", { "class": "pm-head" },
          $h("button", { "type": "button", "class": "pm-back", "aria-label": "Retour", "onClick": $v.back },
            $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("path", { "d": "M19 12H5M11 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" })
            )
          ),
          $h("div", { "class": "pm-logo" },
            $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
              $h("circle", { "cx": "5", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
              $h("circle", { "cx": "11", "cy": "5", "r": "2.3", "fill": "#4C9AFF" }),
              $h("circle", { "cx": "17", "cy": "8", "r": "2.3", "fill": "#4C9AFF" }),
              $h("circle", { "cx": "8", "cy": "14", "r": "2.3", "fill": "#FFFFFF" }),
              $h("circle", { "cx": "14", "cy": "13", "r": "2.3", "fill": "#FFFFFF" }),
              $h("circle", { "cx": "19", "cy": "17", "r": "2.3", "fill": "#FFFFFF" }),
              $h("circle", { "cx": "11", "cy": "20", "r": "2.3", "fill": "#FFFFFF" })
            ),
            $h("span", { "class": "pm-word" },
              "kopycat"
            )
          ),
          $h("div", { "class": "pm-prog", "role": "progressbar", "aria-label": "Avancement", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": $v.v?.pct },
            $h("div", { "class": "pm-progf", "style": `width: ${$t($v.v?.progW)}` })
          )
        ),
        ($v.v?.s?.accueil) ? [
          $h("section", { "class": "pm-scr" },
            $h("div", { "class": "pm-mid", "style": "gap: 20px; justify-content: flex-start; padding-top: 28px" },
              $h("div", { "class": "pm-eb pm-in", "style": "--i: 0" },
                $h("b", null,
                  "["
                ),
                " BIENVENUE ",
                $h("b", null,
                  "]"
                )
              ),
              $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 1; font-size: 38px" },
                "Trouve l'app à copier dans ta niche."
              ),
              $h("p", { "class": "pm-lead pm-in", "style": "--i: 2" },
                "Cinq questions, et le Radar te sort ton plan : l'app qui marche, ses formats et ton rythme."
              ),
              $h("div", { "class": "pm-in pm-journey-gap", "style": "--i: 3; display: flex; align-items: flex-start; justify-content: space-between; margin-top: 18px; position: relative" },
                $h("div", { "style": "position: absolute; left: 34px; right: 34px; top: 27px; height: 2px; background: rgba(255,255,255,0.10)" }),
                $h("div", { "style": "position: absolute; left: 34px; top: 27px; height: 2px; width: 26%; background: linear-gradient(90deg,#4C9AFF,#0B6FE0); box-shadow: 0 0 12px rgba(76,154,255,0.7)" }),
                $h("div", { "style": "position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; width: 92px" },
                  $h("div", { "style": "width: 56px; height: 56px; border-radius: 50%; background: #FFFFFF; color: #05070C; display: grid; place-items: center; box-shadow: 0 0 0 6px rgba(255,255,255,0.08), 0 12px 30px rgba(76,154,255,0.45)" },
                    $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "font-size: 14px; font-weight: 600" },
                    "Toi"
                  )
                ),
                $h("div", { "style": "position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; width: 92px" },
                  $h("div", { "style": "width: 56px; height: 56px; border-radius: 50%; background: #0D111A; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); color: #9AA3B2; display: grid; place-items: center" },
                    $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "font-size: 14px; color: #8A93A3" },
                    "Ta niche"
                  )
                ),
                $h("div", { "style": "position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; width: 92px" },
                  $h("div", { "style": "width: 56px; height: 56px; border-radius: 50%; background: #0D111A; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); color: #9AA3B2; display: grid; place-items: center" },
                    $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "font-size: 14px; color: #8A93A3" },
                    "Ton plan"
                  )
                )
              ),
              $h("div", { "class": "pm-in pm-acclist", "style": "--i: 4; display: flex; flex-direction: column; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.08)" },
                $h("div", { "style": "display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08)" },
                  $h("img", { "loading": "lazy", "decoding": "async", "class": "pm-logo-s", "src": "/media/simulateur/solaia.jpg", "alt": "" }),
                  $h("span", { "style": "font-size: 15px; color: #E6E9EF" },
                    "L'app qui marche déjà dans ta niche"
                  )
                ),
                $h("div", { "style": "display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08)" },
                  $h("span", { "class": "pm-ico", "style": "width: 28px; height: 28px; border-radius: 8px" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M4 5h16v14H4zM10 9l5 3-5 3z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "font-size: 15px; color: #E6E9EF" },
                    "Ses formats, à refaire tels quels"
                  )
                ),
                $h("div", { "style": "display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.08)" },
                  $h("span", { "class": "pm-ico", "style": "width: 28px; height: 28px; border-radius: 8px" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", { "style": "font-size: 15px; color: #E6E9EF" },
                    "Combien de vidéos par jour pour ton objectif"
                  )
                )
              )
            ),
            $h("div", { "class": "pm-foot pm-in", "style": "--i: 5" },
              $h("span", { "class": "pm-cta" },
                $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                  "Construire mon plan",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          )
        ] : null,
        ($v.v?.s?.objectif) ? [
          $h("section", { "class": "pm-scr" },
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 0" },
              "Combien tu veux gagner par mois ?"
            ),
            $h("div", { "class": "pm-mid", "style": "gap: 18px" },
              $h("div", { "class": $v.v?.amtCls, "style": "--i: 1" },
                $t($v.v?.amountTxt), " €"
              ),
              $h("div", { "class": "pm-badge pm-in", "style": "--i: 2" },
                $t($v.v?.tier?.badge)
              ),
              $h("div", { "class": "pm-in", "style": "--i: 3; margin-top: 10px" },
                $h("input", { "class": "pm-range", "type": "range", "min": "0", "max": "10", "step": "1", "value": $v.v?.amountIdx, "onInput": $v.onAmount, "aria-label": "Montant visé par mois", "style": `--p: ${$t($v.v?.amountP)}` }),
                $h("div", { "class": "pm-scale" },
                  $h("span", null,
                    "500 €"
                  ),
                  $h("span", null,
                    "30 000 €"
                  )
                )
              ),
              $h("div", { "class": "pm-live pm-in", "style": "--i: 4" },
                $h("span", { "style": "font-size: 13px; color: #9AA3B2" },
                  "Il te faut"
                ),
                $h("b", null,
                  $t($v.v?.vuesTxt), " de vues par mois"
                )
              ),
              $h("p", { "class": "pm-in", "style": "--i: 5; margin: 0; font-size: 15px; line-height: 1.5; color: #C7CDD8" },
                $t($v.v?.tier?.text)
              )
            ),
            $h("div", { "class": "pm-foot pm-in", "style": "--i: 6" },
              $h("span", { "class": "pm-cta" },
                $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                  "Continuer",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          )
        ] : null,
        ($v.v?.s?.niche) ? [
          $h("section", { "class": "pm-scr" },
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 0" },
              "Quelle niche te parle ?"
            ),
            ($v.v?.asking) ? [
              $h("div", { "class": "pm-mid pm-top", "style": "gap: 12px" },
                $h("div", { "class": "pm-ngrid" },
                  ($l($v.v?.niches)).map((n) => [
                    $h("button", { "type": "button", "class": n?.cls, "style": `--i: ${$t(n?.i)}`, "onClick": n?.pick, "aria-pressed": n?.sel, "aria-label": n?.aria },
                      $h("div", { "class": "pm-stack" },
                        ($l(n?.logos)).map((lg) => [
                          $h("img", { "loading": "lazy", "decoding": "async", "class": "pm-logo-s", "src": $u(lg), "alt": "" })
                        ])
                      ),
                      $h("div", null,
                        $h("div", { "class": "pm-tn" },
                          $t(n?.nom)
                        ),
                        $h("div", { "class": "pm-ts" },
                          $t(n?.apps), " apps suivies"
                        )
                      )
                    )
                  ])
                ),
                $h("button", { "type": "button", "class": "pm-quiet pm-in", "style": "--i: 8", "onClick": $v.pickNicheAll },
                  "Je ne sais pas encore"
                )
              )
            ] : null,
            ($v.v?.answered) ? [
              $h("div", { "class": "pm-mid", "style": "gap: 16px; justify-content: flex-start; padding-top: 18px" },
                $h("div", { "class": "pm-chip pm-pop-in", "style": "--i: 0" },
                  $h("span", { "class": "pm-tick" },
                    $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $t($v.v?.nicheD?.nom)
                ),
                $h("div", { "class": "pm-react pm-in", "style": "--i: 1" },
                  $h("div", { "class": "pm-stack", "style": "position: relative" },
                    ($l($v.v?.nicheD?.logos)).map((lg) => [
                      $h("img", { "loading": "lazy", "decoding": "async", "class": "pm-logo-s", "src": $u(lg), "alt": "", "style": "width: 44px; height: 44px; border-radius: 12px" })
                    ])
                  ),
                  $h("div", { "style": "position: relative; margin-top: 18px; font-family: var(--font-display); font-size: 64px; line-height: 1; font-weight: 700; letter-spacing: -0.05em" },
                    $t($v.v?.nicheD?.apps),
                    $h("span", { "style": "font-size: 26px; letter-spacing: -0.02em; color: #9AA3B2" },
                      " apps"
                    )
                  ),
                  $h("p", { "class": "pm-rtxt", "style": "margin-top: 10px" },
                    "poussées par des comptes en ce moment, dans ta niche."
                  ),
                  $h("div", { "class": "pm-sep" }),
                  $h("div", { "style": "position: relative; display: flex; align-items: center; gap: 12px" },
                    $h("img", { "loading": "lazy", "decoding": "async", "src": $u($v.v?.nicheD?.top?.logo), "alt": "", "style": "width: 36px; height: 36px; border-radius: 10px; background: #FFFFFF" }),
                    $h("div", { "style": "font-size: 14px; line-height: 1.4; color: #C7CDD8" },
                      "La plus copiée : ",
                      $h("b", { "style": "color: #FFFFFF" },
                        $t($v.v?.nicheD?.top?.nom)
                      ),
                      $h("br", null),
                      $t($v.v?.nicheD?.top?.vid), " vidéos cette semaine"
                    )
                  )
                )
              ),
              $h("div", { "class": "pm-foot pm-in", "style": "--i: 3" },
                $h("span", { "class": "pm-cta" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                    "Continuer",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              )
            ] : null
          )
        ] : null,
        ($v.v?.s?.temps) ? [
          $h("section", { "class": "pm-scr" },
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 0" },
              "Combien de temps par jour ?"
            ),
            ($v.v?.asking) ? [
              $h("div", { "class": "pm-mid pm-top" },
                $h("div", { "class": "pm-tgrid" },
                  ($l($v.v?.times)).map((t) => [
                    $h("button", { "type": "button", "class": t?.cls, "style": `--i: ${$t(t?.i)}`, "onClick": t?.pick, "aria-pressed": t?.sel, "aria-label": t?.aria },
                      $h("div", { "class": "pm-bars", "aria-hidden": "true" },
                        ($l(t?.bars)).map((b) => [
                          $h("span", { "class": b })
                        ])
                      ),
                      $h("div", null,
                        $h("div", { "class": "pm-tl" },
                          $t(t?.l)
                        ),
                        $h("div", { "class": "pm-ts", "style": "font-size: 13px; margin-top: 6px" },
                          $t(t?.sub)
                        )
                      )
                    )
                  ])
                )
              )
            ] : null,
            ($v.v?.answered) ? [
              $h("div", { "class": "pm-mid", "style": "gap: 16px; justify-content: flex-start; padding-top: 18px" },
                $h("div", { "class": "pm-chip pm-pop-in", "style": "--i: 0" },
                  $h("span", { "class": "pm-tick" },
                    $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $h("span", null,
                    $t($v.v?.timeD?.l), " par jour"
                  )
                ),
                $h("div", { "class": "pm-react pm-in", "style": "--i: 1" },
                  $h("svg", { "class": "pm-spark", "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.6", "stroke-linejoin": "round" })
                  ),
                  $h("p", { "class": "pm-rtxt" },
                    $t($v.v?.timeReact)
                  )
                )
              ),
              $h("div", { "class": "pm-foot pm-in", "style": "--i: 2" },
                $h("span", { "class": "pm-cta" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                    "Continuer",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              )
            ] : null
          )
        ] : null,
        ($v.v?.s?.visage) ? [
          $h("section", { "class": "pm-scr" },
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 0" },
              "Tu es prêt à te montrer en vidéo ?"
            ),
            ($v.v?.asking) ? [
              $h("div", { "class": "pm-mid pm-top" },
                $h("div", { "class": "pm-list" },
                  ($l($v.v?.visages)).map((o) => [
                    $h("button", { "type": "button", "class": o?.cls, "style": `--i: ${$t(o?.i)}`, "onClick": o?.pick, "aria-pressed": o?.sel, "aria-label": o?.l },
                      $h("span", { "class": "pm-ico" },
                        $h("svg", { "width": "18", "height": "18", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                          $h("path", { "d": o?.icon, "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                        )
                      ),
                      $t(o?.l)
                    )
                  ])
                )
              )
            ] : null,
            ($v.v?.answered) ? [
              $h("div", { "class": "pm-mid", "style": "gap: 16px; justify-content: flex-start; padding-top: 18px" },
                $h("div", { "class": "pm-chip pm-pop-in", "style": "--i: 0" },
                  $h("span", { "class": "pm-tick" },
                    $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $t($v.v?.visageD?.l)
                ),
                $h("div", { "class": "pm-react pm-in", "style": "--i: 1" },
                  $h("svg", { "class": "pm-spark", "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.6", "stroke-linejoin": "round" })
                  ),
                  $h("p", { "class": "pm-rtxt" },
                    $t($v.v?.visageD?.r)
                  ),
                  $h("div", { "style": "position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 18px" },
                    ($l($v.v?.visageD?.covers)).map((c) => [
                      $h("div", { "class": "pm-vcov" },
                        $h("img", { "loading": "lazy", "decoding": "async", "src": $u(c?.src), "alt": "", "style": "display: block; width: 100%; height: 100%; object-fit: cover" }),
                        $h("div", { "style": "position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,12,0) 45%, rgba(5,7,12,0.9))" }),
                        $h("div", { "style": "position: absolute; left: 8px; right: 8px; bottom: 8px; font-size: 11px; line-height: 1.3; color: #C7CDD8" },
                          $h("b", { "style": "display: block; font-family: var(--font-display); font-size: 15px; color: #FFFFFF" },
                            $t(c?.v)
                          ),
                          $t(c?.app)
                        )
                      )
                    ])
                  )
                )
              ),
              $h("div", { "class": "pm-foot pm-in", "style": "--i: 2" },
                $h("span", { "class": "pm-cta" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                    "Continuer",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              )
            ] : null
          )
        ] : null,
        ($v.v?.s?.blocage) ? [
          $h("section", { "class": "pm-scr" },
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 0" },
              "Qu'est-ce qui t'a bloqué jusqu'ici ?"
            ),
            ($v.v?.asking) ? [
              $h("div", { "class": "pm-mid pm-top" },
                $h("div", { "class": "pm-list" },
                  ($l($v.v?.blocages)).map((o) => [
                    $h("button", { "type": "button", "class": o?.cls, "style": `--i: ${$t(o?.i)}`, "onClick": o?.pick, "aria-pressed": o?.sel, "aria-label": o?.l },
                      $t(o?.l)
                    )
                  ])
                )
              )
            ] : null,
            ($v.v?.answered) ? [
              $h("div", { "class": "pm-mid", "style": "gap: 16px; justify-content: flex-start; padding-top: 18px" },
                $h("div", { "class": "pm-chip pm-pop-in", "style": "--i: 0" },
                  $h("span", { "class": "pm-tick" },
                    $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  ),
                  $t($v.v?.blocD?.l)
                ),
                $h("div", { "class": "pm-react pm-in", "style": "--i: 1" },
                  $h("svg", { "class": "pm-spark", "width": "24", "height": "24", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.6", "stroke-linejoin": "round" })
                  ),
                  $h("p", { "class": "pm-rtxt" },
                    $t($v.v?.blocD?.r)
                  )
                )
              ),
              $h("div", { "class": "pm-foot pm-in", "style": "--i: 2" },
                $h("span", { "class": "pm-cta" },
                  $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                    "Continuer",
                    $h("span", { "class": "sw-btn-tile" },
                      $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                )
              )
            ] : null
          )
        ] : null,
        ($v.v?.s?.preuve) ? [
          $h("section", { "class": "pm-scr" },
            $h("div", { "class": "pm-eb pm-in", "style": "--i: 0" },
              $h("b", null,
                "["
              ),
              " CETTE SEMAINE DANS TA NICHE ",
              $h("b", null,
                "]"
              )
            ),
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 1; margin-top: 10px" },
              "Ça poste déjà. Et ça fait des vues."
            ),
            $h("div", { "class": "pm-mid" },
              $h("div", { "class": "pm-fan" },
                ($l($v.v?.fan)).map((c) => [
                  $h("div", { "class": c?.cls },
                    $h("img", { "loading": "lazy", "decoding": "async", "class": "pm-cv", "src": $u(c?.src), "alt": "" }),
                    $h("span", { "class": "pm-play", "aria-hidden": "true" },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24" },
                        $h("path", { "d": "M8 5l11 7-11 7z", "fill": "#FFFFFF" })
                      )
                    ),
                    $h("div", { "class": "pm-cardm" },
                      $h("span", { "class": "pm-applbl" },
                        $h("img", { "loading": "lazy", "decoding": "async", "src": $u(c?.logo), "alt": "" }),
                        $t(c?.app)
                      ),
                      $h("span", { "class": "pm-views" },
                        $t(c?.v)
                      ),
                      $h("span", { "class": "pm-handle" },
                        "@", $t(c?.h)
                      )
                    )
                  )
                ])
              ),
              $h("p", { "class": "pm-lead pm-in", "style": "--i: 5; margin-top: 8px; text-align: center" },
                "Des petits comptes, une app derrière chaque vidéo. Le Radar les suit tous."
              )
            ),
            $h("div", { "class": "pm-foot pm-in", "style": "--i: 6" },
              $h("span", { "class": "pm-cta" },
                $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                  "Continuer",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          )
        ] : null,
        ($v.v?.s?.calcul) ? [
          $h("section", { "class": "pm-scr" },
            $h("div", { "class": "pm-eb pm-in", "style": "--i: 0" },
              $h("b", null,
                "["
              ),
              " RADAR ",
              $h("b", null,
                "]"
              )
            ),
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 1; margin-top: 10px" },
              "On fouille ta niche."
            ),
            $h("div", { "class": "pm-mid", "style": "gap: 34px" },
              $h("div", { "class": "pm-gauge pm-pop-in", "style": "--i: 2" },
                $h("div", { "class": "pm-sweep", "aria-hidden": "true" }),
                $h("svg", { "width": "200", "height": "200", "viewBox": "0 0 200 200", "aria-hidden": "true" },
                  $h("circle", { "cx": "100", "cy": "100", "r": "86", "fill": "none", "stroke": "rgba(255,255,255,0.10)", "stroke-width": "10" }),
                  $h("circle", { "cx": "100", "cy": "100", "r": "86", "fill": "none", "stroke": "url(#kg)", "stroke-width": "10", "stroke-linecap": "round", "stroke-dasharray": "540.4", "style": `stroke-dashoffset: ${$t($v.v?.gaugeOff)}; transition: stroke-dashoffset .2s linear` }),
                  $h("defs", null,
                    $h("linearGradient", { "id": "kg", "x1": "0", "y1": "0", "x2": "1", "y2": "1" },
                      $h("stop", { "offset": "0", "stop-color": "#4C9AFF" }),
                      $h("stop", { "offset": "1", "stop-color": "#0B6FE0" })
                    )
                  )
                ),
                $h("div", { "class": "pm-gnum" },
                  $h("span", null,
                    $t($v.v?.pct),
                    $h("small", null,
                      "%"
                    )
                  )
                )
              ),
              $h("div", { "class": "pm-checks pm-in", "style": "--i: 3" },
                ($l($v.v?.checks)).map((c) => [
                  $h("div", { "class": c?.cls },
                    $h("span", { "class": "pm-ckd" },
                      $h("svg", { "width": "12", "height": "12", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "3", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    ),
                    $t(c?.t)
                  )
                ])
              )
            ),
            ($v.v?.popOpen) ? [
              $h("div", { "class": "pm-veil", "aria-hidden": "true" }),
              $h("div", { "class": "pm-pop", "role": "dialog", "aria-modal": "true", "aria-label": $v.v?.pop?.q },
                $h("div", { "class": "pm-eb" },
                  $h("b", null,
                    "["
                  ),
                  " PENDANT QUE ÇA TOURNE ",
                  $h("b", null,
                    "]"
                  )
                ),
                $h("h2", { "style": "margin-top: 12px" },
                  $t($v.v?.pop?.q)
                ),
                $h("p", null,
                  $t($v.v?.pop?.t)
                ),
                $h("div", { "class": "pm-two" },
                  $h("button", { "type": "button", "onClick": $v.popNo },
                    $t($v.v?.pop?.no)
                  ),
                  $h("button", { "type": "button", "class": "yes", "onClick": $v.popYes },
                    $t($v.v?.pop?.yes)
                  )
                )
              )
            ] : null
          )
        ] : null,
        ($v.v?.s?.plan) ? [
          $h("section", { "class": "pm-scr" },
            $h("div", { "class": "pm-eb pm-in", "style": "--i: 0" },
              $h("b", null,
                "["
              ),
              " TON PLAN · CALCULÉ SUR TES RÉPONSES ",
              $h("b", null,
                "]"
              )
            ),
            $h("div", { "class": "pm-mid", "style": "gap: 14px" },
              $h("div", { "class": "pm-plancard pm-in", "style": "--i: 1" },
                $h("div", { "class": "pm-lbl", "style": "position: relative" },
                  "POUR VISER ", $t($v.v?.amountTxt), " € PAR MOIS"
                ),
                $h("div", { "class": "pm-big", "style": "position: relative" },
                  $t($v.v?.vidTxt), " ", $t($v.v?.vidUnit)
                ),
                $h("div", { "class": "pm-sub", "style": "position: relative" },
                  "par jour, sur ", $t($v.v?.comptesTxt)
                ),
                $h("div", { "class": "pm-accts", "style": "position: relative" },
                  ($l($v.v?.accts)).map((a) => [
                    $h("div", { "class": "pm-acct" },
                      $h("div", { "class": "pm-acctl" },
                        $t(a?.lbl)
                      ),
                      $h("div", { "class": "pm-vids" },
                        ($l(a?.vids)).map((vd) => [
                          $h("i", { "class": vd?.cls, "style": `--d: ${$t(vd?.d)}` })
                        ])
                      )
                    )
                  ])
                ),
                ($v.v?.moreAccts) ? [
                  $h("div", { "class": "pm-sub", "style": "position: relative; margin-top: 10px; font-size: 13px; color: #9AA3B2" },
                    "et ", $t($v.v?.moreN), " autres comptes au même rythme"
                  )
                ] : null
              ),
              $h("div", { "class": "pm-rows pm-in", "style": "--i: 2" },
                $h("div", { "class": "pm-row" },
                  $h("span", null,
                    "Vues à faire par mois"
                  ),
                  $h("b", null,
                    $t($v.v?.vuesTxt)
                  )
                ),
                $h("div", { "class": "pm-row" },
                  $h("span", null,
                    "Vues par vidéo dans ta niche"
                  ),
                  $h("b", null,
                    $t($v.v?.vpvTxt)
                  )
                ),
                $h("div", { "class": "pm-row", "style": "align-items: center" },
                  $h("span", null,
                    "Avec ", $t($v.v?.timeD?.l), " par jour"
                  ),
                  $h("span", { "class": "pm-ok" },
                    $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    $t($v.v?.verdict)
                  )
                )
              ),
              $h("div", { "class": "pm-in", "style": "--i: 3" },
                $h("button", { "type": "button", "class": "pm-calcbtn", "onClick": $v.toggleCalc, "aria-expanded": $v.v?.calcOpen },
                  "Voir le calcul"
                ),
                ($v.v?.calcOpen) ? [
                  $h("div", { "class": "pm-calc" },
                    $t($v.v?.amountTxt), " € ÷ 2,50 à 3,50 € les 1 000 vues = ", $t($v.v?.vuesTxt), " de vues",
                    $h("br", null),
                    "÷ ", $t($v.v?.vpvTxt), " vues par vidéo ÷ 30 jours = ", $t($v.v?.vidTxt), " ", $t($v.v?.vidUnit), " par jour",
                    $h("br", null),
                    "÷ 3 vidéos par compte = ", $t($v.v?.comptesTxt)
                  )
                ] : null
              )
            ),
            $h("div", { "class": "pm-foot pm-in", "style": "--i: 4" },
              $h("span", { "class": "pm-cta" },
                $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                  "Continuer",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          )
        ] : null,
        ($v.v?.s?.manque) ? [
          $h("section", { "class": "pm-scr" },
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 0" },
              $t($v.v?.blocD?.manque)
            ),
            $h("div", { "class": "pm-mid", "style": "gap: 16px" },
              $h("div", { "class": "pm-cmp" },
                $h("div", { "class": "pm-col pm-in", "style": "--i: 1" },
                  $h("div", { "class": "pm-colh", "style": "color: #9AA3B2" },
                    "Seul"
                  ),
                  $h("div", { "class": "pm-li" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M7 7l10 10M17 7L7 17", "fill": "none", "stroke": "#8A93A3", "stroke-width": "2.2", "stroke-linecap": "round" })
                    ),
                    "Tu postes au hasard"
                  ),
                  $h("div", { "class": "pm-li" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M7 7l10 10M17 7L7 17", "fill": "none", "stroke": "#8A93A3", "stroke-width": "2.2", "stroke-linecap": "round" })
                    ),
                    "200 vues, tu lâches"
                  ),
                  $h("div", { "class": "pm-li" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M7 7l10 10M17 7L7 17", "fill": "none", "stroke": "#8A93A3", "stroke-width": "2.2", "stroke-linecap": "round" })
                    ),
                    "Tu ne sais pas quoi copier"
                  )
                ),
                $h("div", { "class": "pm-col win pm-in", "style": "--i: 2" },
                  $h("div", { "class": "pm-colh" },
                    "Avec Kopycat"
                  ),
                  $h("div", { "class": "pm-li", "style": "color: #FFFFFF" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "L'app qui marche dans ta niche"
                  ),
                  $h("div", { "class": "pm-li", "style": "color: #FFFFFF" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Ses formats, à refaire"
                  ),
                  $h("div", { "class": "pm-li", "style": "color: #FFFFFF" },
                    $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    ),
                    "Les comptes derrière, à suivre"
                  )
                )
              ),
              $h("div", { "class": "pm-note pm-in", "style": "--i: 3" },
                $h("svg", { "width": "22", "height": "22", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "flex-shrink: 0; color: #7DB5FF" },
                  $h("path", { "d": "M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                ),
                "C'est exactement ce que le Radar te donne."
              )
            ),
            $h("div", { "class": "pm-foot pm-in", "style": "--i: 4" },
              $h("span", { "class": "pm-cta" },
                $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                  "Continuer",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          )
        ] : null,
        ($v.v?.s?.inscription) ? [
          $h("section", { "class": "pm-scr", "aria-hidden": "true", "style": "filter: blur(9px); opacity: .7; pointer-events: none" },
            $h("div", { "class": "pm-eb" },
              $h("b", null,
                "["
              ),
              " L'APP À COPIER ",
              $h("b", null,
                "]"
              )
            ),
            $h("h1", { "class": "pm-h1", "style": "margin-top: 10px" },
              $t($v.v?.app?.titre)
            ),
            $h("div", { "class": "pm-app", "style": "margin-top: 18px" },
              $h("div", { "class": "pm-apph" },
                $h("img", { "loading": "lazy", "decoding": "async", "src": $u($v.v?.app?.logo), "alt": "" }),
                $h("div", null,
                  $h("div", { "class": "pm-appn" },
                    $t($v.v?.app?.nom)
                  ),
                  $h("div", { "class": "pm-appq" },
                    $t($v.v?.app?.quoi)
                  )
                )
              ),
              $h("div", { "class": "pm-appb" },
                $h("div", { "class": "pm-mini" },
                  $h("img", { "loading": "lazy", "decoding": "async", "src": $u($v.v?.app?.cover), "alt": "" })
                ),
                $h("div", { "class": "pm-stats" },
                  $h("div", { "class": "pm-stat" },
                    $h("b", null,
                      $t($v.v?.app?.comptes)
                    ),
                    $h("span", { "class": "pm-statl" },
                      "comptes"
                    )
                  ),
                  $h("div", { "class": "pm-stat" },
                    $h("b", null,
                      $t($v.v?.app?.videos)
                    ),
                    $h("span", { "class": "pm-statl" },
                      "vidéos"
                    )
                  )
                )
              )
            )
          ),
          $h("div", { "class": "pm-veil", "style": "background: rgba(5,7,12,0.35)", "aria-hidden": "true" }),
          $h("div", { "class": "pm-sheet", "role": "dialog", "aria-modal": "true", "aria-label": "Créer ton compte" },
            $h("span", { "class": "pm-grab", "aria-hidden": "true" }),
            $h("div", { "style": "display: flex; align-items: center; justify-content: space-between; gap: 12px" },
              $h("h2", { "style": "margin: 0; font-family: var(--font-display); font-size: 26px; line-height: 1.1; font-weight: 700; letter-spacing: -0.03em; text-wrap: balance" },
                "Dernière étape avant ton app."
              ),
              $h("span", { "class": "pm-lock", "style": "width: 40px; height: 40px; flex-shrink: 0; color: #9AC4FF" },
                $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                  $h("path", { "d": "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                )
              )
            ),
            $h("button", { "type": "button", "class": "pm-google", "onClick": $v.google, "disabled": $v.v?.busy },
              $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                $h("path", { "d": "M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z", "fill": "#4285F4" }),
                $h("path", { "d": "M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z", "fill": "#34A853" }),
                $h("path", { "d": "M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z", "fill": "#FBBC05" }),
                $h("path", { "d": "M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z", "fill": "#EA4335" })
              ),
              "Continuer avec Google"
            ),
            $h("div", { "class": "pm-or" },
              $h("span", null,
                "ou"
              )
            ),
            $h("form", { "class": "pm-form", "onSubmit": $v.submit, "novalidate": "novalidate" },
              $h("label", { "class": "pm-field" },
                $h("span", { "class": "pm-flbl" },
                  "E-mail"
                ),
                $h("input", { "class": "pm-input", "name": "email", "type": "email", "placeholder": "toi@exemple.fr", "autocomplete": "email" })
              ),
              $h("label", { "class": "pm-field" },
                $h("span", { "class": "pm-flbl" },
                  "Mot de passe"
                ),
                $h("input", { "class": "pm-input", "name": "password", "type": "password", "placeholder": "8 caractères minimum", "autocomplete": "new-password" })
              ),
              ($v.v?.hasError) ? [
                $h("p", { "class": "pm-err", "role": "alert" },
                  $t($v.v?.error)
                )
              ] : null,
              $h("p", { "class": "pm-legal" },
                "En continuant, tu acceptes nos ",
                $h("a", { "href": "/cgv" },
                  "CGV"
                ),
                " et notre ",
                $h("a", { "href": "/confidentialite" },
                  "politique de confidentialité"
                ),
                "."
              ),
              $h("span", { "class": "pm-cta", "style": "align-self: center" },
                $h("button", { "type": "submit", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "disabled": $v.v?.busy },
                  "Débloquer mon app",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            ),
            $h("a", { "href": "/connexion", "class": "pm-link", "style": "align-self: center" },
              "J'ai déjà un compte"
            )
          )
        ] : null,
        ($v.v?.s?.app) ? [
          $h("section", { "class": "pm-scr" },
            $h("div", { "class": "pm-eb pm-in", "style": "--i: 0" },
              $h("b", null,
                "["
              ),
              " L'APP À COPIER ",
              $h("b", null,
                "]"
              )
            ),
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 1; margin-top: 10px" },
              $t($v.v?.app?.titre)
            ),
            $h("div", { "class": "pm-mid", "style": "gap: 12px" },
              $h("div", { "class": "pm-app pm-in", "style": "--i: 2" },
                $h("div", { "class": "pm-apph" },
                  $h("img", { "loading": "lazy", "decoding": "async", "src": $u($v.v?.app?.logo), "alt": "" }),
                  $h("div", null,
                    $h("div", { "class": "pm-appn" },
                      $t($v.v?.app?.nom)
                    ),
                    $h("div", { "class": "pm-appq" },
                      $t($v.v?.app?.quoi)
                    )
                  )
                ),
                $h("div", { "class": "pm-appb" },
                  $h("div", { "class": "pm-mini" },
                    $h("img", { "loading": "lazy", "decoding": "async", "src": $u($v.v?.app?.cover), "alt": "Sa meilleure vidéo" }),
                    $h("span", { "class": "pm-play", "aria-hidden": "true" },
                      $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24" },
                        $h("path", { "d": "M8 5l11 7-11 7z", "fill": "#FFFFFF" })
                      )
                    ),
                    $h("span", { "class": "pm-views" },
                      $t($v.v?.app?.vues)
                    )
                  ),
                  $h("div", { "class": "pm-stats" },
                    $h("div", { "class": "pm-stat" },
                      $h("b", null,
                        $t($v.v?.app?.comptes)
                      ),
                      $h("span", { "class": "pm-statl" },
                        $t($v.v?.app?.comptesL)
                      )
                    ),
                    $h("div", { "class": "pm-stat" },
                      $h("b", null,
                        $t($v.v?.app?.videos)
                      ),
                      $h("span", { "class": "pm-statl" },
                        "vidéos cette semaine"
                      )
                    ),
                    ($v.v?.app?.hasPrix) ? [
                      $h("div", { "class": "pm-stat" },
                        $h("b", null,
                          $t($v.v?.app?.prix)
                        ),
                        $h("span", { "class": "pm-statl" },
                          "dans l'app"
                        )
                      )
                    ] : null
                  )
                )
              ),
              $h("div", { "class": "pm-in", "style": "--i: 3; display: flex; flex-direction: column; gap: 8px" },
                $h("div", { "class": "pm-lbl" },
                  "ET 2 AUTRES APPS POUR TOI"
                ),
                ($l($v.v?.others)).map((o) => [
                  $h("div", { "class": "pm-locked" },
                    $h("img", { "loading": "lazy", "decoding": "async", "src": $u(o?.logo), "alt": "" }),
                    $h("div", { "class": "pm-blur" },
                      $h("i", { "style": `width: ${$t(o?.w1)}` }),
                      $h("i", { "style": `width: ${$t(o?.w2)}` })
                    ),
                    $h("span", { "class": "pm-lock" },
                      $h("svg", { "width": "15", "height": "15", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                      )
                    )
                  )
                ])
              )
            ),
            $h("div", { "class": "pm-foot pm-in", "style": "--i: 4" },
              $h("span", { "class": "pm-cta" },
                $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.next },
                  "Voir mon plan",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              )
            )
          )
        ] : null,
        ($v.v?.s?.engagement) ? [
          $h("section", { "class": "pm-scr" },
            $h("div", { "class": "pm-eb pm-in", "style": "--i: 0" },
              $h("b", null,
                "["
              ),
              " DERNIÈRE ÉTAPE ",
              $h("b", null,
                "]"
              )
            ),
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 1; margin-top: 10px" },
              "Avant ton plan, engage-toi."
            ),
            $h("div", { "class": "pm-mid", "style": "gap: 36px" },
              $h("div", { "class": "pm-quote pm-in", "style": "--i: 2" },
                "« Je poste chaque jour pendant 30 jours. Même quand une vidéo fait 200 vues. »"
              ),
              $h("button", { "type": "button", "class": $v.v?.fpCls, "onPointerDown": $v.holdStart, "onpointerup": $v.holdEnd, "onpointerleave": $v.holdEnd, "onpointercancel": $v.holdEnd, "onKeyDown": $v.holdKey, "aria-label": "Maintenir appuyé pour signer" },
                $h("svg", { "class": "pm-ring", "width": "148", "height": "148", "viewBox": "0 0 148 148", "aria-hidden": "true" },
                  $h("circle", { "cx": "74", "cy": "74", "r": "68", "fill": "none", "stroke": "rgba(255,255,255,0.12)", "stroke-width": "4" }),
                  $h("circle", { "cx": "74", "cy": "74", "r": "68", "fill": "none", "stroke": "#4C9AFF", "stroke-width": "4", "stroke-linecap": "round", "stroke-dasharray": "427.3", "style": `stroke-dashoffset: ${$t($v.v?.holdOff)}` })
                ),
                $h("span", { "class": "pm-fpi" },
                  $h("svg", { "width": "64", "height": "64", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M7.5 19.5c1.2-2 1.8-4.3 1.8-6.8a2.7 2.7 0 0 1 5.4 0c0 1.3-.1 2.6-.4 3.8M12 12.7c0 3.2-.9 6.1-2.4 8.3M16.6 18.6c.4-1.8.6-3.8.6-5.9a5.2 5.2 0 0 0-8.9-3.7M4.9 15.6c.4-.9.6-1.9.6-2.9a6.5 6.5 0 0 1 11.5-4.1M19.4 15.2c.1-.8.1-1.6.1-2.5a7.5 7.5 0 0 0-.6-2.9", "fill": "none", "stroke": "currentColor", "stroke-width": "1.5", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  )
                )
              )
            ),
            $h("div", { "class": "pm-foot pm-in", "style": "--i: 3" },
              $h("span", { "style": "font-size: 15px; font-weight: 600; color: #E6E9EF" },
                $t($v.v?.holdLbl)
              )
            )
          )
        ] : null,
        ($v.v?.s?.paywall) ? [
          $h("section", { "class": "pm-scr", "style": "padding-bottom: 24px" },
            $h("div", { "class": "pm-eb pm-in", "style": "--i: 0" },
              $h("b", null,
                "["
              ),
              " TON PLAN EST PRÊT ",
              $h("b", null,
                "]"
              )
            ),
            $h("h1", { "class": "pm-h1 pm-in", "style": "--i: 1; margin-top: 8px; font-size: 30px" },
              $t($v.v?.payTitle)
            ),
            $h("div", { "class": "pm-recap pm-in", "style": "--i: 2; margin-top: 14px" },
              $h("span", { "class": "pm-pill" },
                $t($v.v?.nicheD?.nom)
              ),
              $h("span", { "class": "pm-pill" },
                $h("span", null,
                  $t($v.v?.amountTxt), " € / mois"
                )
              ),
              $h("span", { "class": "pm-pill" },
                $h("span", null,
                  $t($v.v?.timeD?.l), " / jour"
                )
              ),
              $h("span", { "class": "pm-pill" },
                $t($v.v?.visageD?.short)
              )
            ),
            $h("div", { "class": "pm-mid", "style": "gap: 12px; justify-content: flex-start; padding-top: 14px" },
              $h("div", { "class": "pm-inside pm-in", "style": "--i: 3" },
                $h("div", { "class": "pm-irow" },
                  $h("b", null,
                    $t($v.v?.counts?.apps)
                  ),
                  $h("span", null,
                    "apps à copier"
                  ),
                  $h("span", { "class": "pm-stack", "style": "margin-left: auto" },
                    $h("img", { "loading": "lazy", "decoding": "async", "src": $u($v.v?.app?.logo), "alt": "" }),
                    ($l($v.v?.others)).map((o) => [
                      $h("img", { "loading": "lazy", "decoding": "async", "class": "bl", "src": $u(o?.logo), "alt": "" })
                    ])
                  )
                ),
                $h("div", { "class": "pm-irow" },
                  $h("b", null,
                    $t($v.v?.counts?.formats)
                  ),
                  $h("span", null,
                    "formats qui font des vues"
                  ),
                  $h("span", { "class": "pm-strip" },
                    ($l($v.v?.strip)).map((c) => [
                      $h("img", { "loading": "lazy", "decoding": "async", "src": $u(c), "alt": "" })
                    ])
                  )
                ),
                $h("div", { "class": "pm-irow" },
                  $h("b", null,
                    $t($v.v?.counts?.comptes)
                  ),
                  $h("span", null,
                    "comptes à suivre"
                  ),
                  $h("span", { "class": "pm-lock", "style": "margin-left: auto; width: 26px; height: 26px" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                $h("div", { "class": "pm-irow" },
                  $h("b", null,
                    "4"
                  ),
                  $h("span", null,
                    "semaines de plan, jour par jour"
                  ),
                  $h("span", { "class": "pm-lock", "style": "margin-left: auto; width: 26px; height: 26px" },
                    $h("svg", { "width": "13", "height": "13", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ),
              $h("div", { "class": "pm-plans pm-in", "style": "--i: 4" },
                $h("button", { "type": "button", "class": $v.v?.planA?.cls, "onClick": $v.pickAnnuel, "aria-pressed": $v.v?.planA?.sel },
                  $h("span", { "class": "pm-save" },
                    "−50 %"
                  ),
                  $h("span", { "class": "pm-radio" }),
                  $h("div", null,
                    $h("div", { "class": "pm-pn" },
                      "Annuel"
                    ),
                    $h("div", { "class": "pm-ps" },
                      "179,88 € par an"
                    )
                  ),
                  $h("div", { "class": "pm-pp" },
                    "14,99 €",
                    $h("small", null,
                      "par mois"
                    )
                  )
                ),
                $h("button", { "type": "button", "class": $v.v?.planM?.cls, "onClick": $v.pickMensuel, "aria-pressed": $v.v?.planM?.sel },
                  $h("span", { "class": "pm-radio" }),
                  $h("div", null,
                    $h("div", { "class": "pm-pn" },
                      "Mensuel"
                    ),
                    $h("div", { "class": "pm-ps" },
                      "Sans engagement"
                    )
                  ),
                  $h("div", { "class": "pm-pp" },
                    "29,99 €",
                    $h("small", null,
                      "par mois"
                    )
                  )
                )
              )
            ),
            $h("div", { "class": "pm-foot pm-in", "style": "--i: 5; gap: 8px" },
              $h("span", { "class": "pm-cta" },
                $h("button", { "type": "button", "class": "sw-btn sw-btn-primary sw-btn-lg pm-btn", "onClick": $v.pay },
                  "Tout débloquer",
                  $h("span", { "class": "sw-btn-tile" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                )
              ),
              $h("button", { "type": "button", "class": "pm-quiet", "style": "height: 36px; font-size: 14px", "onClick": $v.later },
                "Plus tard"
              )
            )
          )
        ] : null
      )
    ];
  }
}
