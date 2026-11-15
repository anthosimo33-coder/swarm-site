// Doublures de convex/_generated/server, convex/_generated/api et convex/imageCopy pour le banc.
export const internalAction = (cfg) => cfg;
export const internalQuery = (cfg) => cfg;
export const internalMutation = (cfg) => cfg;
export const action = (cfg) => cfg, query = (cfg) => cfg, mutation = (cfg) => cfg, httpAction = (f) => f;
const ref = (path) => new Proxy({}, { get: (_t, k) => (k === "__path" ? path.join(":").replace(/:([^:]*)$/, ":$1") : ref([...path, String(k)])) });
export const internal = ref([]), api = ref([]);
export const appStoreHit = async () => null, appStoreLookup = async () => null, copyImage = async () => null;
