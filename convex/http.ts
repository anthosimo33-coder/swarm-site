import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { avatar, cover } from "./coverHttp";
import { webhook as whopWebhook } from "./whop";

// Routes de Convex Auth : clés publiques (JWKS) et retour de Google (OAuth).
const http = httpRouter();
auth.addHttpRoutes(http);

// Miniatures des vidéos, servies par Swarm (convex/coverHttp.ts).
http.route({ pathPrefix: "/cover/", method: "GET", handler: cover });
// Photos de profil des comptes suivis.
http.route({ pathPrefix: "/avatar/", method: "GET", handler: avatar });
// Paiement : les événements signés de Whop (convex/whop.ts).
http.route({ path: "/whop/webhook", method: "POST", handler: whopWebhook });

export default http;
