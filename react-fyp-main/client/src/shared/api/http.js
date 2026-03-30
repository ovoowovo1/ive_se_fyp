import axios from 'axios';
import { AI_SERVICE_URL, API_BASE_URL } from 'shared/config/env';
import { clearSession, getToken } from 'shared/auth/session';

const normalizeUrl = (url = '') => {
  if (url.startsWith('http://localhost:8081') || url.startsWith('http://127.0.0.1:8081')) {
    return url.replace(/^http:\/\/(?:localhost|127\.0\.0\.1):8081/, API_BASE_URL);
  }

  if (url.startsWith('http://localhost:5001') || url.startsWith('http://127.0.0.1:5001')) {
    return url.replace(/^http:\/\/(?:localhost|127\.0\.0\.1):5001/, AI_SERVICE_URL);
  }

  return url;
};

const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  nextConfig.url = normalizeUrl(nextConfig.url);

  const token = getToken();
  if (token && !nextConfig.headers?.Authorization) {
    nextConfig.headers = {
      ...nextConfig.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return nextConfig;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearSession();
      window.dispatchEvent(new Event('app:unauthorized'));
    }

    return Promise.reject(error);
  },
);

export default http;
export { normalizeUrl };
