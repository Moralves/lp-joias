// ==========================================
// Serviço de Gerenciamento de Usuários (Funcionários)
// ==========================================
import { api } from './api';
import { isMockModeExplicit, isNetworkError } from './clientHelper';
import { localStore } from './store';
import { authService } from './authService';
import type { Usuario } from '../types';

export const usuariosService = {
  async getAll(includeInactive = false): Promise<Usuario[]> {
    if (isMockModeExplicit()) {
      return localStore.getUsuarios(includeInactive);
    }
    try {
      const url = includeInactive ? '/usuarios?ativo=false' : '/usuarios';
      const res = await api.get<Usuario[]>(url);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.getUsuarios(includeInactive);
      throw new Error(err.response?.data?.message || 'Erro ao carregar usuários.');
    }
  },

  async create(data: Omit<Usuario, 'id' | 'ativo'> & { senha?: string }): Promise<Usuario> {
    if (isMockModeExplicit()) {
      return localStore.createUsuario(data);
    }
    try {
      const res = await api.post<Usuario>('/usuarios', data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.createUsuario(data);
      throw new Error(err.response?.data?.message || 'Erro ao cadastrar usuário.');
    }
  },

  async update(id: number, data: Partial<Usuario>): Promise<Usuario> {
    if (isMockModeExplicit()) {
      return localStore.updateUsuario(id, data);
    }
    try {
      const res = await api.put<Usuario>(`/usuarios/${id}`, data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.updateUsuario(id, data);
      throw new Error(err.response?.data?.message || 'Erro ao atualizar dados do usuário.');
    }
  },

  async inactivate(id: number): Promise<void> {
    const current = authService.getCurrentUser();
    // Proteção preventiva no client
    if (current && current.id === id) {
      throw new Error('Não é permitido inativar o próprio usuário logado (409 Conflict).');
    }

    if (isMockModeExplicit()) {
      return localStore.inativarUsuario(id, current?.id || 0);
    }
    try {
      await api.delete(`/usuarios/${id}`);
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.inativarUsuario(id, current?.id || 0);
      if (err.response?.status === 409) {
        throw new Error('Não é permitido inativar o próprio usuário autenticado (409 Conflict).');
      }
      throw new Error(err.response?.data?.message || 'Erro ao inativar usuário.');
    }
  },

  async reactivate(id: number): Promise<Usuario> {
    if (isMockModeExplicit()) {
      return localStore.reativarUsuario(id);
    }
    try {
      const res = await api.put<Usuario>(`/usuarios/${id}/reativar`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.reativarUsuario(id);
      throw new Error(err.response?.data?.message || 'Erro ao reativar usuário.');
    }
  }
};
