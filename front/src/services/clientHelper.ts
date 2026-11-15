import { MOCK_MODE_KEY, TOKEN_KEY } from './api';

export function isMockModeExplicit(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && token.startsWith('mock-jwt-token-')) {
    return true;
  }
  const stored = localStorage.getItem(MOCK_MODE_KEY);
  if (stored === null) {
    return false;
  }
  return stored === 'true';
}

export function setMockMode(active: boolean) {
  localStorage.setItem(MOCK_MODE_KEY, active ? 'true' : 'false');
  window.dispatchEvent(new Event('aurea_connection_change'));
}

export function isNetworkError(error: any): boolean {
  const status = error?.response?.status;
  return (
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ECONNREFUSED' ||
    status === 503 ||
    status === 502 ||
    status === 504 ||
    (status === 500 && error?.response?.data?.code === 'BACKEND_OFFLINE') ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('ECONNREFUSED')
  );
}
