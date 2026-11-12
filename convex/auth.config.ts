// Convex vérifie les jetons émis par Convex Auth sur ce même déploiement.
export default {
  providers: [{ domain: process.env.CONVEX_SITE_URL, applicationID: "convex" }],
};
