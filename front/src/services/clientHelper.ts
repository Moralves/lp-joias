// ==========================================
// Gerenciador de Conexão: API REST Spring Boot vs Simulação Local
// ==========================================
import { MOCK_MODE_KEY } from './api';

export function isMockModeExplicit(): boolean {
  const stored = localStorage.getItem(MOCK_MODE_KEY);
  // Por padrão, se não configurado explicitamente, inicia em Modo Local para teste imediato
  if (stored === null) {
    return true;
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
