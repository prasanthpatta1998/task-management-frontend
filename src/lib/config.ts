const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "");

/** Base origin for the Express API, for example http://localhost:4000. */
export const API_BASE_URL = (configuredApiBaseUrl?.replace(/\/api\/v1$/i, "") || "http://localhost:4000");

export const API_VERSION_PREFIX = "/api/v1";
