# Écrit les 3 pages légales statiques de Kopycat dans public/ (servies en /cgv, /confidentialite, /mentions-legales).
# Usage : python3 scripts/legal-pages.py public
# Société d'après le Kbis du 17/11/2026. À ajouter quand ils existent : l'e-mail de contact (mentions légales, CGV,
# confidentialité) et le médiateur de la consommation (CGV, article 10).
import sys
OUT = sys.argv[1] if len(sys.argv) > 1 else 'public'
MAJ = "19 novembre 2026"
SOC = "JARVIA STUDIO, société par actions simplifiée au capital de 50 €, immatriculée au RCS de Paris sous le numéro 132 937 848, dont le siège social est situé 47 rue Vivienne, 75002 Paris"

def page(slug, title, intro, body):
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Kopycat</title>
<meta name="description" content="{intro}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@700&display=swap" rel="stylesheet">
<style>
  :root {{ color-scheme: dark; }}
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; background: #05070C; color: #C9CED8; font: 16px/1.65 Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }}
  header, main, footer {{ max-width: 760px; margin: 0 auto; padding: 0 20px; }}
  header {{ display: flex; align-items: center; justify-content: space-between; height: 72px; }}
  .logo {{ display: inline-flex; align-items: center; gap: 10px; color: #FFFFFF; text-decoration: none; font-family: 'Inter Tight', Inter, sans-serif; font-weight: 700; font-size: 20px; letter-spacing: -0.03em; }}
  .logo img {{ width: 24px; height: 24px; }}
  header nav a {{ color: #9AA3B2; text-decoration: none; font-size: 14px; margin-left: 18px; }}
  header nav a:hover, header nav a[aria-current] {{ color: #FFFFFF; }}
  main {{ padding-top: 40px; padding-bottom: 72px; }}
  h1 {{ margin: 0 0 8px; color: #FFFFFF; font-family: 'Inter Tight', Inter, sans-serif; font-size: clamp(32px, 6vw, 44px); line-height: 1.08; letter-spacing: -0.04em; }}
  .maj {{ margin: 0 0 32px; color: #8A93A3; font-size: 14px; }}
  .intro {{ margin: 0 0 8px; font-size: 17px; color: #E6E9EF; }}
  h2 {{ margin: 40px 0 10px; color: #FFFFFF; font-size: 19px; letter-spacing: -0.01em; }}
  p, li {{ margin: 0 0 12px; }}
  ul {{ margin: 0 0 12px; padding-left: 22px; }}
  strong {{ color: #E6E9EF; font-weight: 600; }}
  a {{ color: #4C9AFF; }}
  @media (max-width: 600px) {{ header nav {{ display: none; }} }}
  footer {{ border-top: 1px solid rgba(255,255,255,0.08); padding-top: 22px; padding-bottom: 40px; font-size: 14px; color: #8A93A3; display: flex; flex-wrap: wrap; gap: 8px 20px; }}
  footer a {{ color: #9AA3B2; text-decoration: none; }}
  footer a:hover {{ color: #FFFFFF; }}
</style>
</head>
<body>
<header>
  <a class="logo" href="/"><img src="/favicon.svg" alt="">kopycat</a>
  <nav>{"".join(f'<a href="/{s}"' + (' aria-current="page"' if s == slug else '') + f'>{t}</a>' for s, t in [("cgv", "CGV"), ("confidentialite", "Confidentialité"), ("mentions-legales", "Mentions légales")])}</nav>
</header>
<main>
<h1>{title}</h1>
<p class="maj">Dernière mise à jour : {MAJ}</p>
<p class="intro">{intro}</p>
{body}
</main>
<footer>
  <span>© 2026 JARVIA STUDIO · Kopycat</span>
  <a href="/">Accueil</a><a href="/tarifs">Tarifs</a><a href="/cgv">CGV</a><a href="/confidentialite">Confidentialité</a><a href="/mentions-legales">Mentions légales</a>
</footer>
</body>
</html>
"""

mentions = page("mentions-legales", "Mentions légales",
  "Qui édite Kopycat, qui l’héberge, et comment nous joindre.", f"""
<h2>Éditeur</h2>
<p>Le site et le service Kopycat sont édités par {SOC}.</p>
<p>Numéro de TVA intracommunautaire : FR93132937848.</p>
<p>Directeur de la publication : Anthony Simonet, président de JARVIA STUDIO.</p>

<h2 id="contact">Contact</h2>
<p>Par courrier : JARVIA STUDIO, 47 rue Vivienne, 75002 Paris.</p>

<h2>Hébergement</h2>
<p>Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (<a href="https://vercel.com">vercel.com</a>).</p>
<p>Les données du service sont hébergées par Convex, Inc. (États-Unis), sur des serveurs situés dans l’Union européenne (Irlande).</p>

<h2>Propriété intellectuelle</h2>
<p>La marque Kopycat, le site, son interface, ses textes et ses classements sont la propriété de JARVIA STUDIO. Toute reproduction ou extraction, même partielle, sans autorisation écrite est interdite.</p>
<p>Les noms, logos et icônes des applications, ainsi que les vidéos, miniatures, pseudos et photos de profil des comptes cités, restent la propriété de leurs titulaires. Kopycat les montre pour informer sur les tendances publiques de TikTok et Instagram ; il ne revendique aucun droit sur eux et n’est affilié à aucune de ces applications ni à TikTok ou Instagram.</p>

<h2>Signaler un contenu</h2>
<p>Un titulaire de droits ou un créateur qui souhaite qu’un contenu le concernant soit retiré peut l’écrire à l’adresse de contact ci-dessus, en indiquant le lien de la page. La demande est traitée dans les meilleurs délais.</p>
""")

cgv = page("cgv", "Conditions générales de vente",
  "Les règles de l’abonnement Kopycat Pro : ce qu’il comprend, son prix, sa durée et comment l’arrêter.", f"""
<h2>1. Objet</h2>
<p>Les présentes conditions générales de vente (CGV) s’appliquent à tout abonnement au service Kopycat souscrit sur le site par une personne physique ou morale (le « Membre »), auprès de {SOC} (« JARVIA STUDIO »). Souscrire un abonnement vaut acceptation des CGV en vigueur à ce moment.</p>

<h2>2. Le service</h2>
<p>Kopycat est un service en ligne qui repère les applications, les formats de vidéos et les créateurs qui font des vues sur TikTok et Instagram, à partir d’informations publiques, et les présente par marché, par niche et dans le temps. L’abonnement Kopycat Pro donne accès à l’ensemble des apps, marchés, fiches et vidéos du service, pendant toute la durée de l’abonnement.</p>
<p>Kopycat est un outil d’information. Il ne garantit aucun résultat : vues, téléchargements ou revenus dépendent de ce que chaque Membre en fait. Les chiffres affichés sont des relevés de sources publiques et peuvent comporter des écarts.</p>

<h2>3. Prix</h2>
<ul>
<li>Kopycat Pro mensuel : 29,99 € TTC par mois.</li>
<li>Kopycat Pro annuel : 359,88 € TTC par an. Offre Black Friday : 179,88 € TTC par an pour un abonnement souscrit jusqu’au 30 novembre 2026 à minuit (heure de Paris).</li>
</ul>
<p>Les prix sont indiqués en euros, toutes taxes comprises (TVA française de 20 % incluse). JARVIA STUDIO peut modifier ses prix ; un nouveau prix ne s’applique qu’à la période d’abonnement suivante, après information du Membre.</p>

<h2>4. Commande et paiement</h2>
<p>L’abonnement se souscrit en ligne depuis la page Tarifs, après création d’un compte. Le paiement se fait par carte bancaire, au moment de la souscription puis à chaque renouvellement, par l’intermédiaire de Whop (Whop, Inc.), prestataire de paiement sécurisé : JARVIA STUDIO n’a jamais accès aux numéros de carte. Une facture est disponible pour chaque paiement.</p>

<h2>5. Durée, renouvellement et résiliation</h2>
<p>L’abonnement mensuel se renouvelle automatiquement chaque mois, l’abonnement annuel chaque année, jusqu’à résiliation. Pour l’abonnement annuel, le Membre est informé par e-mail avant chaque renouvellement.</p>
<p>Le Membre peut résilier à tout moment depuis les Réglages de son compte (Réglages › Formule et facturation). La résiliation prend effet à la fin de la période déjà payée : l’accès reste ouvert jusque-là, et aucune somme n’est due pour la suite. Une période commencée n’est pas remboursée, sauf exercice du droit de rétractation ci-dessous.</p>

<h2>6. Droit de rétractation</h2>
<p>Le Membre consommateur dispose d’un délai de 14 jours à compter de la souscription pour se rétracter, sans avoir à se justifier (article L221-18 du Code de la consommation), en l’écrivant à JARVIA STUDIO à l’adresse figurant dans les <a href="/mentions-legales#contact">mentions légales</a>. Il est alors remboursé dans les 14 jours, par le même moyen de paiement.</p>
<p>Le service étant fourni immédiatement, le Membre qui demande, lors de la souscription, à accéder à Kopycat Pro sans attendre la fin de ce délai, et qui renonce expressément à son droit de rétractation, perd ce droit dès que l’accès lui est ouvert (article L221-28 du Code de la consommation).</p>

<h2>7. Utilisation du service</h2>
<p>Le compte est personnel. Il est interdit de partager ses accès, de revendre ou de republier tout ou partie du contenu de Kopycat, ou d’en extraire les données de manière automatisée. En cas de manquement, JARVIA STUDIO peut suspendre ou fermer le compte après en avoir informé le Membre.</p>

<h2>8. Disponibilité et responsabilité</h2>
<p>JARVIA STUDIO fait ses meilleurs efforts pour que Kopycat soit accessible en permanence et que ses données soient à jour, sans pouvoir le garantir : des interruptions de maintenance ou des incidents techniques peuvent survenir. Sa responsabilité ne peut être engagée pour un dommage indirect, ni pour les décisions prises par le Membre à partir des informations du service.</p>

<h2>9. Données personnelles</h2>
<p>Les données du Membre sont traitées comme décrit dans la <a href="/confidentialite">politique de confidentialité</a>.</p>

<h2>10. Réclamations et médiation</h2>
<p>Toute réclamation peut être adressée à JARVIA STUDIO à l’adresse figurant dans les <a href="/mentions-legales#contact">mentions légales</a>. À défaut de solution amiable, le Membre consommateur peut recourir gratuitement à un médiateur de la consommation (article L612-1 du Code de la consommation).</p>

<h2>11. Droit applicable</h2>
<p>Les présentes CGV sont soumises au droit français. En cas de litige, et à défaut d’accord amiable, les tribunaux français sont compétents ; le Membre consommateur peut saisir la juridiction de son domicile.</p>

<h2>12. Modification des CGV</h2>
<p>JARVIA STUDIO peut faire évoluer les CGV. Les CGV applicables sont celles en vigueur à la date de la souscription ou du renouvellement ; le Membre est informé de toute modification avant qu’elle s’applique à lui.</p>
""")

conf = page("confidentialite", "Politique de confidentialité",
  "Les données que Kopycat utilise, pourquoi, avec qui, combien de temps, et vos droits.", f"""
<h2>Responsable du traitement</h2>
<p>Le responsable du traitement est {SOC}. Pour toute question ou demande sur vos données, écrivez à l’adresse figurant dans les <a href="/mentions-legales#contact">mentions légales</a>.</p>

<h2>Les données de votre compte</h2>
<ul>
<li><strong>Ce que nous gardons</strong> : votre adresse e-mail ; votre mot de passe, sous une forme chiffrée que nous ne pouvons pas relire ; ce que vous gardez dans Kopycat (apps suivies, dossiers, alertes) ; et, quand vous vous abonnez, les informations de votre abonnement et de vos factures. Si vous vous connectez avec Google, nous recevons votre adresse e-mail Google.</li>
<li><strong>Pourquoi</strong> : créer et sécuriser votre compte, vous donner accès au service et à votre abonnement (exécution du contrat) ; tenir la comptabilité (obligation légale) ; prévenir les abus (intérêt légitime).</li>
<li><strong>Combien de temps</strong> : tant que votre compte existe ; il est supprimé, avec ce que vous y gardez, quand vous en faites la demande. Les factures sont conservées 10 ans, comme l’exige la loi.</li>
<li><strong>Paiement</strong> : vos données de carte sont traitées directement par notre prestataire de paiement, Whop ; nous n’y avons jamais accès. Pour relier votre abonnement à votre compte, nous lui transmettons l’identifiant de votre compte Kopycat.</li>
</ul>

<h2>Les données des créateurs affichés</h2>
<p>Kopycat montre des informations publiques de comptes TikTok et Instagram qui parlent d’applications : pseudo, photo de profil, biographie, vidéos publiques et leurs miniatures, nombres de vues et d’abonnés. Elles sont relevées sur les pages publiques de ces réseaux, pour informer sur les tendances (intérêt légitime de JARVIA STUDIO et de ses Membres).</p>
<p>Certaines informations sont estimées automatiquement à partir de ces contenus publics, notamment le type de contenu d’une vidéo, le texte affiché à l’écran, la langue et le genre apparent de la personne qui se montre dans les vidéos. Ces estimations peuvent être inexactes.</p>
<p>Un créateur peut s’opposer à ce traitement et demander le retrait de son compte de Kopycat en écrivant à l’adresse de contact. Les informations d’un compte qui n’est plus public ne sont plus mises à jour.</p>

<h2>Prestataires</h2>
<p>Nous faisons appel à des prestataires qui traitent des données pour notre compte, et pour ce seul usage :</p>
<ul>
<li>Vercel Inc. (États-Unis) : hébergement du site ;</li>
<li>Convex, Inc. (États-Unis) : base de données du service, sur des serveurs situés dans l’Union européenne (Irlande) ;</li>
<li>Anthropic PBC (États-Unis) : lecture automatique des miniatures de vidéos publiques ;</li>
<li>Google (si vous choisissez la connexion avec Google) ;</li>
<li>Whop, Inc. (États-Unis) : paiement et gestion de l’abonnement, quand vous vous abonnez.</li>
</ul>
<p>Quand des données sont transférées hors de l’Union européenne, ce transfert est encadré par les garanties prévues par le RGPD, comme les clauses contractuelles types de la Commission européenne.</p>

<h2>Cookies et stockage</h2>
<p>Kopycat garde votre connexion dans le stockage de votre navigateur, ce qui est indispensable au fonctionnement du service. Kopycat ne dépose aucun cookie publicitaire.</p>
<p>Pour compter ses visites, le site ajoute 1 à un compteur par heure quand vous ouvrez l’accueil ou les tarifs. Ce compteur ne contient ni cookie, ni identifiant, ni adresse IP : il ne permet pas de vous reconnaître. Un simple repère, effacé à la fermeture de l’onglet, évite de compter deux fois la même visite.</p>

<h2>Vos droits</h2>
<p>Vous pouvez à tout moment accéder à vos données, les faire rectifier ou supprimer, en limiter le traitement, vous y opposer et en demander la portabilité, en écrivant à l’adresse de contact. Vous pouvez aussi adresser une réclamation à la CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).</p>
""")

for name, html in [("mentions-legales.html", mentions), ("cgv.html", cgv), ("confidentialite.html", conf)]:
    open(f"{OUT}/{name}", "w").write(html)
    print("écrit", name, len(html))
