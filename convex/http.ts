import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { cover } from "./coverHttp";

// Routes de Convex Auth : clés publiques (JWKS) et retour de Google (OAuth).
const http = httpRouter();
auth.addHttpRoutes(http);

// Miniatures des vidéos, servies par Swarm (convex/coverHttp.ts).
http.route({ pathPrefix: "/cover/", method: "GET", handler: cover });

export default http;
