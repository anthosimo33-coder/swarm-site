/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as authErrors from "../authErrors.js";
import type * as authLimits from "../authLimits.js";
import type * as background from "../background.js";
import type * as boardQuota from "../boardQuota.js";
import type * as boards from "../boards.js";
import type * as coverHttp from "../coverHttp.js";
import type * as coverSign from "../coverSign.js";
import type * as covers from "../covers.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as imageCopy from "../imageCopy.js";
import type * as passwordPolicy from "../passwordPolicy.js";
import type * as radarAi from "../radarAi.js";
import type * as radarLang from "../radarLang.js";
import type * as radarModels from "../radarModels.js";
import type * as radarRegions from "../radarRegions.js";
import type * as radarSlides from "../radarSlides.js";
import type * as radarStore from "../radarStore.js";
import type * as radarSync from "../radarSync.js";
import type * as saved from "../saved.js";
import type * as session from "../session.js";
import type * as stats from "../stats.js";
import type * as textLang from "../textLang.js";
import type * as tiktokPage from "../tiktokPage.js";
import type * as users from "../users.js";
import type * as whop from "../whop.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  authErrors: typeof authErrors;
  authLimits: typeof authLimits;
  background: typeof background;
  boardQuota: typeof boardQuota;
  boards: typeof boards;
  coverHttp: typeof coverHttp;
  coverSign: typeof coverSign;
  covers: typeof covers;
  crons: typeof crons;
  http: typeof http;
  imageCopy: typeof imageCopy;
  passwordPolicy: typeof passwordPolicy;
  radarAi: typeof radarAi;
  radarLang: typeof radarLang;
  radarModels: typeof radarModels;
  radarRegions: typeof radarRegions;
  radarSlides: typeof radarSlides;
  radarStore: typeof radarStore;
  radarSync: typeof radarSync;
  saved: typeof saved;
  session: typeof session;
  stats: typeof stats;
  textLang: typeof textLang;
  tiktokPage: typeof tiktokPage;
  users: typeof users;
  whop: typeof whop;
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
