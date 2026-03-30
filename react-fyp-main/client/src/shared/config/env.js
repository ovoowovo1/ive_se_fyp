const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
const processEnv = globalThis.process?.env;

const readEnv = (viteKey, legacyKey, fallback = '') =>
  viteEnv?.[viteKey] || processEnv?.[legacyKey] || fallback;

export const API_BASE_URL = trimTrailingSlash(
  readEnv('VITE_API_BASE_URL', 'REACT_APP_API_BASE_URL', 'http://localhost:8081'),
);

export const AI_SERVICE_URL = trimTrailingSlash(
  readEnv('VITE_AI_SERVICE_URL', 'REACT_APP_AI_SERVICE_URL', 'http://localhost:5001'),
);

export const GOOGLE_MAPS_API_KEY = readEnv('VITE_GOOGLE_MAPS_API_KEY', 'REACT_APP_GOOGLE_MAPS_API_KEY');

export const buildAssetUrl = (assetPath) => {
  if (!assetPath) {
    return '';
  }

  return `${API_BASE_URL}/${assetPath.replace(/\\/g, '/')}`;
};

export const buildApiUrl = (path) => {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const buildAiServiceUrl = (path) => {
  if (!path) {
    return AI_SERVICE_URL;
  }

  return `${AI_SERVICE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
