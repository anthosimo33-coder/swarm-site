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
import type * as radar_apifyItem from "../radar/apifyItem.js";
import type * as radar_dateFr from "../radar/dateFr.js";
import type * as radar_errorCodes from "../radar/errorCodes.js";
import type * as radar_exportLocal from "../radar/exportLocal.js";
import type * as radar_functions from "../radar/functions.js";
import type * as radar_gate from "../radar/gate.js";
import type * as radar_radarAuto from "../radar/radarAuto.js";
import type * as radar_radarAutoMath from "../radar/radarAutoMath.js";
import type * as radar_radarAvailability from "../radar/radarAvailability.js";
import type * as radar_radarAvailabilityMath from "../radar/radarAvailabilityMath.js";
import type * as radar_radarCreatorsMath from "../radar/radarCreatorsMath.js";
import type * as radar_radarDiscoveryQueries from "../radar/radarDiscoveryQueries.js";
import type * as radar_radarDisplay from "../radar/radarDisplay.js";
import type * as radar_radarFamilies from "../radar/radarFamilies.js";
import type * as radar_radarFamiliesMath from "../radar/radarFamiliesMath.js";
import type * as radar_radarFiche from "../radar/radarFiche.js";
import type * as radar_radarFicheMath from "../radar/radarFicheMath.js";
import type * as radar_radarFreeMath from "../radar/radarFreeMath.js";
import type * as radar_radarHandles from "../radar/radarHandles.js";
import type * as radar_radarJudge from "../radar/radarJudge.js";
import type * as radar_radarJudgeMath from "../radar/radarJudgeMath.js";
import type * as radar_radarJudgeReview from "../radar/radarJudgeReview.js";
import type * as radar_radarMarket from "../radar/radarMarket.js";
import type * as radar_radarMarketMath from "../radar/radarMarketMath.js";
import type * as radar_radarNaming from "../radar/radarNaming.js";
import type * as radar_radarNamingMath from "../radar/radarNamingMath.js";
import type * as radar_radarNetworkMath from "../radar/radarNetworkMath.js";
import type * as radar_radarNetworkSearch from "../radar/radarNetworkSearch.js";
import type * as radar_radarNetworks from "../radar/radarNetworks.js";
import type * as radar_radarSeedAccounts from "../radar/radarSeedAccounts.js";
import type * as radar_radarSignalFilters from "../radar/radarSignalFilters.js";
import type * as radar_radarSignals from "../radar/radarSignals.js";
import type * as radar_radarSignalsMath from "../radar/radarSignalsMath.js";
import type * as radar_radarSources from "../radar/radarSources.js";
import type * as radar_radarSourcesMath from "../radar/radarSourcesMath.js";
import type * as radar_radarStore from "../radar/radarStore.js";
import type * as radar_radarStoreMath from "../radar/radarStoreMath.js";
import type * as radar_radarTextLang from "../radar/radarTextLang.js";
import type * as radar_radarVet from "../radar/radarVet.js";
import type * as radar_radarVetMath from "../radar/radarVetMath.js";
import type * as radar_schemaTables from "../radar/schemaTables.js";
import type * as radar_scrapeCreatorsApi from "../radar/scrapeCreatorsApi.js";
import type * as radar_swarmExportPage from "../radar/swarmExportPage.js";
import type * as radar_tiktokInternal from "../radar/tiktokInternal.js";
import type * as radar_tiktokPublicPage from "../radar/tiktokPublicPage.js";
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
  "radar/apifyItem": typeof radar_apifyItem;
  "radar/dateFr": typeof radar_dateFr;
  "radar/errorCodes": typeof radar_errorCodes;
  "radar/exportLocal": typeof radar_exportLocal;
  "radar/functions": typeof radar_functions;
  "radar/gate": typeof radar_gate;
  "radar/radarAuto": typeof radar_radarAuto;
  "radar/radarAutoMath": typeof radar_radarAutoMath;
  "radar/radarAvailability": typeof radar_radarAvailability;
  "radar/radarAvailabilityMath": typeof radar_radarAvailabilityMath;
  "radar/radarCreatorsMath": typeof radar_radarCreatorsMath;
  "radar/radarDiscoveryQueries": typeof radar_radarDiscoveryQueries;
  "radar/radarDisplay": typeof radar_radarDisplay;
  "radar/radarFamilies": typeof radar_radarFamilies;
  "radar/radarFamiliesMath": typeof radar_radarFamiliesMath;
  "radar/radarFiche": typeof radar_radarFiche;
  "radar/radarFicheMath": typeof radar_radarFicheMath;
  "radar/radarFreeMath": typeof radar_radarFreeMath;
  "radar/radarHandles": typeof radar_radarHandles;
  "radar/radarJudge": typeof radar_radarJudge;
  "radar/radarJudgeMath": typeof radar_radarJudgeMath;
  "radar/radarJudgeReview": typeof radar_radarJudgeReview;
  "radar/radarMarket": typeof radar_radarMarket;
  "radar/radarMarketMath": typeof radar_radarMarketMath;
  "radar/radarNaming": typeof radar_radarNaming;
  "radar/radarNamingMath": typeof radar_radarNamingMath;
  "radar/radarNetworkMath": typeof radar_radarNetworkMath;
  "radar/radarNetworkSearch": typeof radar_radarNetworkSearch;
  "radar/radarNetworks": typeof radar_radarNetworks;
  "radar/radarSeedAccounts": typeof radar_radarSeedAccounts;
  "radar/radarSignalFilters": typeof radar_radarSignalFilters;
  "radar/radarSignals": typeof radar_radarSignals;
  "radar/radarSignalsMath": typeof radar_radarSignalsMath;
  "radar/radarSources": typeof radar_radarSources;
  "radar/radarSourcesMath": typeof radar_radarSourcesMath;
  "radar/radarStore": typeof radar_radarStore;
  "radar/radarStoreMath": typeof radar_radarStoreMath;
  "radar/radarTextLang": typeof radar_radarTextLang;
  "radar/radarVet": typeof radar_radarVet;
  "radar/radarVetMath": typeof radar_radarVetMath;
  "radar/schemaTables": typeof radar_schemaTables;
  "radar/scrapeCreatorsApi": typeof radar_scrapeCreatorsApi;
  "radar/swarmExportPage": typeof radar_swarmExportPage;
  "radar/tiktokInternal": typeof radar_tiktokInternal;
  "radar/tiktokPublicPage": typeof radar_tiktokPublicPage;
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
