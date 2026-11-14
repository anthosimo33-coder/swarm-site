/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authErrors from "../authErrors.js";
import type * as boards from "../boards.js";
import type * as coverHttp from "../coverHttp.js";
import type * as covers from "../covers.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as imageCopy from "../imageCopy.js";
import type * as radarAi from "../radarAi.js";
import type * as radarLang from "../radarLang.js";
import type * as radarModels from "../radarModels.js";
import type * as radarRegions from "../radarRegions.js";
import type * as radarSlides from "../radarSlides.js";
import type * as radarStore from "../radarStore.js";
import type * as radarSync from "../radarSync.js";
import type * as saved from "../saved.js";
import type * as stats from "../stats.js";
import type * as textLang from "../textLang.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authErrors: typeof authErrors;
  boards: typeof boards;
  coverHttp: typeof coverHttp;
  covers: typeof covers;
  crons: typeof crons;
  http: typeof http;
  imageCopy: typeof imageCopy;
  radarAi: typeof radarAi;
  radarLang: typeof radarLang;
  radarModels: typeof radarModels;
  radarRegions: typeof radarRegions;
  radarSlides: typeof radarSlides;
  radarStore: typeof radarStore;
  radarSync: typeof radarSync;
  saved: typeof saved;
  stats: typeof stats;
  textLang: typeof textLang;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
