// Généré par scripts/dc2preact.py depuis design/MotDePasse.dc.html — ne pas modifier à la main.
import { h as $h } from 'preact';  // $h : jamais masqué par une variable de boucle
import { DCLogic, $t, $l } from '../runtime.js';

export default class MotDePasse extends DCLogic {
  renderVals() {
    const S0 = (this.props && this.props.stats) || { apps: 190, accounts: 4900 };
    const rs = { apps: S0.apps.toLocaleString('fr-FR'), accounts: S0.accounts.toLocaleString('fr-FR') };

    const ic = {
      apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      createurs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
      marche: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
      tendance: 'M3 17l5.5-5.5 3.5 3.5L20 7M14 7h6v6',
      radar: 'M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M12 12l6-6',
      alertes: 'M6 16v-5a6 6 0 1 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0'
    };
    const tiles = [
      ['apps', '+' + rs.apps, 'apps suivies'],
      ['createurs', '+' + rs.accounts, 'comptes passés au crible'],
      ['tendance', '7,5 M vues', 'Luv or Pop, repérée à H+26'],
      ['radar', '2 333×', 'une vidéo d’Astra AI face à sa normale'],
      ['marche', 'Tous', 'les marchés, toutes les langues'],
      ['alertes', '+69 comptes', 'dans le réseau de Love8']
    ].map((t, i) => ({ d: ic[t[0]], v: t[1], l: t[2], cls: i >= 4 ? 'auth-x1' : '', delay: (0.15 + i * 0.08).toFixed(2) + 's' }));
    const st = this.state || {};
    const step = st.step || 'email';
    const auth = this.props && this.props.auth;
    const WAIT = 45000;
    const left = st.sentAt ? Math.max(0, Math.ceil((st.sentAt + WAIT - (st.now || Date.now())) / 1000)) : 0;
    const code = st.code || '';
    const focus = !!st.codeFocus;
    const box = (i) => ({ d: code[i] || '', cls: 'sw-input pw-digit' + (focus && i === Math.min(code.length, 5) ? ' is-focus' : '') });
    // Une action du parcours : rend null si elle a réussi, sinon { code, message } (src/auth.js). Sur le canevas, sans
    // backend, chaque étape réussit pour qu'on puisse enchaîner les écrans.
    const run = async (action, done) => {
      this.setState({ busy: true, error: '', notice: '', passError: '' });
      const failed = auth ? await action() : null;
      if (!failed) { done(); return; }
      if (failed.code === 'CODE_EXPIRE' || failed.code === 'CODE_EPUISE') {
        // Le code ne marche plus : retour à la saisie du code, « Renvoyer » tout de suite.
        this.setState({ busy: false, step: 'code', code: '', sentAt: 0, error: failed.message });
      } else if (failed.code === 'CODE_INVALIDE') {
        this.setState({ busy: false, code: '', error: failed.message });
      } else if (String(failed.code || '').indexOf('MOT_DE_PASSE') === 0) {
        this.setState({ busy: false, passError: failed.message });
      } else {
        this.setState({ busy: false, error: failed.message });
      }
    };
    const email = (st.email || '').trim();
    const sent = (notice) => this.setState({ busy: false, step: 'code', code: '', sentAt: Date.now(), now: Date.now(), notice: notice || '' });
    const check = (value) => run(() => auth.resetCheck(email, value), () => this.setState({ busy: false, step: 'pass' }));
    return {
      tiles,
      busy: !!st.busy,
      isEmail: step === 'email', isCode: step === 'code', isPass: step === 'pass',
      email: st.email || '',
      error: st.error || '', hasError: !!st.error,
      notice: st.notice || '', hasNotice: !!st.notice,
      onEmail: (e) => this.setState({ email: e.currentTarget.value }),
      submitEmail: (e) => {
        e.preventDefault();
        run(() => auth.resetRequest(email), () => sent(''));
      },
      changeEmail: () => this.setState({ step: 'email', code: '', error: '', notice: '' }),
      code,
      codeField: st.error && step === 'code' ? 'sw-field is-error' : 'sw-field',
      boxesA: [box(0), box(1), box(2)],
      boxesB: [box(3), box(4), box(5)],
      codeFocus: () => this.setState({ codeFocus: true }),
      codeBlur: () => this.setState({ codeFocus: false }),
      onCode: (e) => {
        const value = e.currentTarget.value.replace(/\D/g, '').slice(0, 6);
        this.setState({ code: value, error: '' });
        // Le 6e chiffre tapé (ou le code collé, ou proposé par le téléphone) : vérifié tout de suite.
        if (value.length === 6 && !st.busy) check(value);
      },
      submitCode: (e) => {
        e.preventDefault();
        if (code.length !== 6) { this.setState({ error: 'Le code a 6 chiffres.' }); return; }
        check(code);
      },
      waiting: left > 0,
      wait: Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'),
      canResend: left === 0,
      resend: () => run(() => auth.resetRequest(email), () => sent('Nouveau code envoyé.')),
      password: st.password || '',
      passType: st.shown ? 'text' : 'password',
      shown: st.shown ? 'true' : 'false',
      eyeLabel: st.shown ? 'Masquer le mot de passe' : 'Afficher le mot de passe',
      toggleShow: () => this.setState({ shown: !st.shown }),
      onPass: (e) => this.setState({ password: e.currentTarget.value, passError: '' }),
      passField: st.passError ? 'sw-field is-error' : 'sw-field',
      passHint: st.passError || '8 caractères minimum.',
      passRole: st.passError ? 'alert' : 'note',
      submitPass: (e) => {
        e.preventDefault();
        // Réussi : la personne est connectée, le pont l'emmène dans l'app ; le bouton reste désactivé d'ici là.
        run(() => auth.resetFinish(email, code, st.password || ''), () => {
          if (!auth) this.setState({ busy: false, notice: 'Maquette : sur le site, ce bouton change le mot de passe et ouvre l’app.' });
        });
      }
    };
  }

  componentDidMount() {
    // L'e-mail tapé sur la connexion, passé par « Mot de passe oublié ? » (jamais par l'adresse de la page).
    try {
      const email = window.sessionStorage.getItem('kopycat:reset-email');
      if (email) { window.sessionStorage.removeItem('kopycat:reset-email'); this.setState({ email }); }
    } catch (e) { /* stockage refusé : le champ reste vide */ }
    this.tick = setInterval(() => {
      const st = this.state || {};
      if (st.step === 'code' && st.sentAt && Date.now() - st.sentAt < 46000) this.setState({ now: Date.now() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.tick);
  }

  render() {
    const $v = this.renderVals();
    return [
      $h("div", { "class": "sw sw-ground auth-root", "style": "position: relative; isolation: isolate; height: 100vh; height: 100dvh; overflow: hidden; box-sizing: border-box; padding: clamp(16px, 3vh, 32px) 24px; display: flex; flex-direction: column; align-items: center; gap: clamp(12px, 2.4vh, 24px); color: var(--ink); font-family: var(--font-body);" },
        $h("div", { "aria-hidden": "true", "class": "auth-bg", "style": "position: absolute; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; background: linear-gradient(180deg, #0A1A35 0%, #071329 46%, #05070C 100%);" },
          $h("div", { "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(95% 60% at 75% 8%, #000, transparent); mask-image: radial-gradient(95% 60% at 75% 8%, #000, transparent);" }),
          $h("div", { "style": "position: absolute; right: -170px; top: -190px; width: 540px; height: 540px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.40), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
          $h("div", { "style": "position: absolute; left: -220px; bottom: -240px; width: 560px; height: 560px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.18), transparent);" })
        ),
        $h("a", { "class": "sw-logo", "href": "/", "aria-label": "Kopycat, page d'accueil", "style": "flex-shrink: 0;" },
          $h("svg", { "class": "sw-logo-mark on-dark", "width": "28", "height": "28", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "width: 28px; height: 28px;" },
            $h("circle", { "class": "d-a", "cx": "5", "cy": "8", "r": "2.3" }),
            $h("circle", { "class": "d-a", "cx": "11", "cy": "5", "r": "2.3" }),
            $h("circle", { "class": "d-a", "cx": "17", "cy": "8", "r": "2.3" }),
            $h("circle", { "class": "d-b", "cx": "8", "cy": "14", "r": "2.3" }),
            $h("circle", { "class": "d-b", "cx": "14", "cy": "13", "r": "2.3" }),
            $h("circle", { "class": "d-b", "cx": "19", "cy": "17", "r": "2.3" }),
            $h("circle", { "class": "d-b", "cx": "11", "cy": "20", "r": "2.3" })
          ),
          $h("span", { "class": "sw-wordmark", "style": "font-size: 24px;" },
            "kopycat"
          )
        ),
        $h("div", { "class": "auth-card", "style": "flex: 1 1 auto; min-height: 0; width: 100%; max-width: 1240px; box-sizing: border-box; padding: 16px; border-radius: 32px; background: var(--surface-raised); border: 1px solid var(--line); box-shadow: var(--shadow-float); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px;" },
          $h("section", { "class": "auth-form", "style": "min-height: 0; display: flex; align-items: flex-start; justify-content: center; padding: clamp(16px, 4vh, 48px) 40px;" },
            ($v.isEmail) ? [
              $h("form", { "onSubmit": $v.submitEmail, "aria-labelledby": "t-mdp1", "style": "width: 100%; max-width: 400px; margin: auto 0; display: flex; flex-direction: column; gap: clamp(12px, 2.1vh, 20px);" },
                $h("a", { "class": "pw-back", "href": "/connexion" },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M19 12H5M11 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Retour à la connexion"
                ),
                $h("h1", { "id": "t-mdp1", "style": "margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
                  "Mot de passe oublié"
                ),
                $h("p", { "class": "pw-lead" },
                  "Entre l’e-mail de ton compte : on t’envoie un code à 6 chiffres."
                ),
                $h("div", { "class": "sw-field" },
                  $h("label", { "class": "sw-label", "for": "mdp-mail" },
                    "E-mail"
                  ),
                  $h("input", { "class": "sw-input", "id": "mdp-mail", "name": "email", "type": "email", "required": true, "autocomplete": "email", "placeholder": "toi@exemple.fr", "value": $v.email, "onInput": $v.onEmail })
                ),
                ($v.hasError) ? [
                  $h("p", { "class": "auth-error", "role": "alert" },
                    $t($v.error)
                  )
                ] : null,
                $h("button", { "type": "submit", "class": "cta", "disabled": $v.busy, "aria-busy": $v.busy, "style": "align-self: center; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; margin: 2px 0 0; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                  "Recevoir le code",
                  $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                ($v.hasNotice) ? [
                  $h("p", { "class": "auth-notice", "role": "status" },
                    $t($v.notice)
                  )
                ] : null
              )
            ] : null,
            ($v.isCode) ? [
              $h("form", { "onSubmit": $v.submitCode, "aria-labelledby": "t-mdp2", "style": "width: 100%; max-width: 400px; margin: auto 0; display: flex; flex-direction: column; gap: clamp(12px, 2.1vh, 20px);" },
                $h("button", { "class": "pw-back", "type": "button", "onClick": $v.changeEmail },
                  $h("svg", { "width": "16", "height": "16", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M19 12H5M11 6l-6 6 6 6", "fill": "none", "stroke": "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Changer d’adresse"
                ),
                $h("h1", { "id": "t-mdp2", "style": "margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
                  "Entre le code"
                ),
                $h("p", { "class": "pw-lead" },
                  "Si un compte existe pour ",
                  $h("b", null,
                    $t($v.email)
                  ),
                  ", un code vient de partir. Il marche 15 minutes."
                ),
                $h("div", { "class": $v.codeField },
                  $h("label", { "class": "sw-label", "for": "mdp-code" },
                    "Code reçu par e-mail"
                  ),
                  $h("div", { "class": "pw-code" },
                    $h("input", { "class": "pw-otp", "id": "mdp-code", "name": "code", "type": "text", "inputmode": "numeric", "pattern": "[0-9]*", "autocomplete": "one-time-code", "maxlength": "6", "required": true, "value": $v.code, "onInput": $v.onCode, "onFocus": $v.codeFocus, "onBlur": $v.codeBlur }),
                    ($l($v.boxesA)).map((b) => [
                      $h("span", { "class": b?.cls, "aria-hidden": "true" },
                        $t(b?.d)
                      )
                    ]),
                    $h("span", { "class": "pw-sep", "aria-hidden": "true" }),
                    ($l($v.boxesB)).map((b) => [
                      $h("span", { "class": b?.cls, "aria-hidden": "true" },
                        $t(b?.d)
                      )
                    ])
                  ),
                  ($v.hasError) ? [
                    $h("span", { "class": "sw-hint", "role": "alert" },
                      $t($v.error)
                    )
                  ] : null
                ),
                $h("p", { "class": "pw-row" },
                  $h("span", null,
                    "Rien reçu ? Regarde dans les indésirables."
                  ),
                  ($v.waiting) ? [
                    $h("span", { "class": "pw-wait" },
                      "Renvoyer dans ", $t($v.wait)
                    )
                  ] : null,
                  ($v.canResend) ? [
                    $h("button", { "class": "sw-link pw-resend", "type": "button", "onClick": $v.resend, "disabled": $v.busy },
                      "Renvoyer le code"
                    )
                  ] : null
                ),
                $h("button", { "type": "submit", "class": "cta", "disabled": $v.busy, "aria-busy": $v.busy, "style": "align-self: center; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; margin: 2px 0 0; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                  "Continuer",
                  $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                ($v.hasNotice) ? [
                  $h("p", { "class": "auth-notice", "role": "status" },
                    $t($v.notice)
                  )
                ] : null
              )
            ] : null,
            ($v.isPass) ? [
              $h("form", { "onSubmit": $v.submitPass, "aria-labelledby": "t-mdp3", "style": "width: 100%; max-width: 400px; margin: auto 0; display: flex; flex-direction: column; gap: clamp(12px, 2.1vh, 20px);" },
                $h("span", { "class": "pw-chip" },
                  $h("svg", { "width": "14", "height": "14", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                    $h("path", { "d": "M5 12.5l4.5 4.5L19 7.5", "fill": "none", "stroke": "currentColor", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  "Code vérifié"
                ),
                $h("h1", { "id": "t-mdp3", "style": "margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;" },
                  "Choisis un nouveau mot de passe"
                ),
                $h("p", { "class": "pw-lead" },
                  "Pour ",
                  $h("b", null,
                    $t($v.email)
                  ),
                  "."
                ),
                $h("input", { "class": "pw-user", "type": "email", "name": "username", "autocomplete": "username", "value": $v.email, "readonly": true, "tabindex": "-1", "aria-hidden": "true" }),
                $h("div", { "class": $v.passField },
                  $h("label", { "class": "sw-label", "for": "mdp-new" },
                    "Nouveau mot de passe"
                  ),
                  $h("div", { "class": "pw-pass" },
                    $h("input", { "class": "sw-input", "id": "mdp-new", "name": "password", "type": $v.passType, "required": true, "minlength": "8", "autocomplete": "new-password", "value": $v.password, "onInput": $v.onPass }),
                    $h("button", { "class": "pw-eye", "type": "button", "onClick": $v.toggleShow, "aria-label": $v.eyeLabel, "aria-pressed": $v.shown },
                      $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true" },
                        $h("path", { "d": "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" }),
                        $h("circle", { "cx": "12", "cy": "12", "r": "3", "fill": "none", "stroke": "currentColor", "stroke-width": "1.8" })
                      )
                    )
                  ),
                  $h("span", { "class": "sw-hint", "role": $v.passRole },
                    $t($v.passHint)
                  )
                ),
                $h("button", { "type": "submit", "class": "cta", "disabled": $v.busy, "aria-busy": $v.busy, "style": "align-self: center; display: inline-flex; align-items: center; justify-content: flex-start; gap: 12px; height: 56px; box-sizing: border-box; padding: 0 5px 0 26px; margin: 2px 0 0; border-radius: 999px; background: linear-gradient(180deg, #4C9AFF 0%, #0B6FE0 100%); border: 1px solid #0A63C9; color: #FFFFFF; font-family: Inter, system-ui, sans-serif; font-size: 17px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer; box-shadow: 0 10px 24px rgba(11,111,224,0.28), inset 0 1px 0 rgba(255,255,255,0.45);" },
                  "Enregistrer et me connecter",
                  $h("span", { "aria-hidden": "true", "style": "width: 44px; height: 44px; flex-shrink: 0; box-sizing: border-box; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.45); display: grid; place-items: center;" },
                    $h("svg", { "width": "17", "height": "17", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "display: block;" },
                      $h("path", { "d": "M5 12h14M13 6l6 6-6 6", "fill": "none", "stroke": "#FFFFFF", "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" })
                    )
                  )
                ),
                $h("p", { "class": "pw-foot" },
                  "Tes autres appareils seront déconnectés."
                ),
                ($v.hasNotice) ? [
                  $h("p", { "class": "auth-notice", "role": "status" },
                    $t($v.notice)
                  )
                ] : null
              )
            ] : null
          ),
          $h("section", { "class": "auth-side", "aria-label": "Ce que suit Kopycat", "style": "position: relative; min-height: 0; overflow: hidden; border-radius: 24px; background: var(--ground); border: 1px solid var(--line); padding: clamp(24px, 5vh, 56px) clamp(28px, 4vw, 56px); display: flex; flex-direction: column; justify-content: center; gap: clamp(16px, 3.4vh, 36px);" },
            $h("div", { "aria-hidden": "true", "class": "sw-dots-bg", "style": "position: absolute; inset: 0; -webkit-mask-image: radial-gradient(80% 70% at 70% 20%, #000, transparent); mask-image: radial-gradient(80% 70% at 70% 20%, #000, transparent);" }),
            $h("div", { "aria-hidden": "true", "style": "position: absolute; right: -180px; top: -200px; width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(closest-side, rgba(11,111,224,0.30), transparent); animation: sw-drift 16s ease-in-out infinite;" }),
            $h("h2", { "class": "sw-enter", "style": "position: relative; margin: 0; max-width: 560px; font-family: var(--font-display); font-size: clamp(34px, 5.4vh, 54px); line-height: 1.04; font-weight: 700; letter-spacing: -0.05em; color: var(--ink);" },
              "Bon retour. ",
              $h("span", { "style": "color: var(--accent);" },
                "Tout est comme tu l'as laissé."
              )
            ),
            $h("div", { "style": "position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;" },
              ($l($v.tiles)).map((t) => [
                $h("div", { "class": `sw-card sw-enter ${$t(t?.cls)}`, "style": `padding: clamp(12px, 1.9vh, 20px) clamp(14px, 1.6vw, 22px); border-radius: 18px; display: flex; flex-direction: column; gap: clamp(8px, 1.3vh, 14px); animation-delay: ${$t(t?.delay)};` },
                  $h("svg", { "width": "20", "height": "20", "viewBox": "0 0 24 24", "aria-hidden": "true", "style": "color: var(--accent);" },
                    $h("path", { "d": t?.d, "fill": "none", "stroke": "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" })
                  ),
                  $h("span", { "style": "display: flex; flex-direction: column; gap: 2px;" },
                    $h("span", { "class": "sw-stat", "style": "font-size: clamp(20px, 3.1vh, 28px);" },
                      $t(t?.v)
                    ),
                    $h("span", { "style": "font-size: 14px; line-height: 1.4; color: var(--ink-muted);" },
                      $t(t?.l)
                    )
                  )
                )
              ])
            ),
            $h("span", { "class": "sw-calc auth-x2", "style": "position: relative;" },
              "Exemples relevés par le Radar."
            )
          )
        )
      )
    ];
  }
}
