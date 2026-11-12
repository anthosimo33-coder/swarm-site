import { httpRouter } from "convex/server";
import { auth } from "./auth";

// Routes de Convex Auth : clés publiques (JWKS) et retour de Google (OAuth).
const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
