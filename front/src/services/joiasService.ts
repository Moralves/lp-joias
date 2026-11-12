// ==========================================
// Serviço do Catálogo de Joias e Estoque
// ==========================================
import { api } from './api';
import { isMockModeExplicit, isNetworkError } from './clientHelper';
import { localStore } from './store';
import type { Joia } from '../types';

export const joiasService = {
  async getAll(includeInactive = false): Promise<Joia[]> {
    if (isMockModeExplicit()) {
      return localStore.getJoias(includeInactive);
    }
    try {
      const url = includeInactive ? '/joias?ativo=false' : '/joias';
      const res = await api.get<Joia[]>(url);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.getJoias(includeInactive);
      throw new Error(err.response?.data?.message || 'Falha ao buscar joias.');
    }
  },

  async getById(id: number): Promise<Joia> {
    if (isMockModeExplicit()) {
      const found = localStore.getJoias(true).find(j => j.id === id);
      if (!found) throw new Error('Joia não encontrada.');
      return found;
    }
    try {
      const res = await api.get<Joia>(`/joias/${id}`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const found = localStore.getJoias(true).find(j => j.id === id);
        if (!found) throw new Error('Joia não encontrada.');
        return found;
      }
      throw new Error(err.response?.data?.message || 'Erro ao carregar detalhes da joia.');
    }
  },

  async create(data: Omit<Joia, 'id' | 'ativo' | 'possuiVendas'>): Promise<Joia> {
    if (isMockModeExplicit()) {
      return localStore.createJoia(data);
    }
    try {
      const res = await api.post<Joia>('/joias', data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.createJoia(data);
      throw new Error(err.response?.data?.message || 'Erro ao cadastrar joia.');
    }
  },

  async update(id: number, data: Partial<Joia>): Promise<Joia> {
    if (isMockModeExplicit()) {
      return localStore.updateJoia(id, data);
    }
    try {
      const res = await api.put<Joia>(`/joias/${id}`, data);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.updateJoia(id, data);
      const msg = err.response?.data?.message;
      if (err.response?.status === 409) {
        throw new Error(msg || 'Joia já participou de venda e não pode ter dados alterados (409 Conflict).');
      }
      throw new Error(msg || 'Erro ao atualizar dados da joia.');
    }
  },

  async deleteOrInactivate(id: number): Promise<{ deleted: boolean; inactivated: boolean }> {
    if (isMockModeExplicit()) {
      return localStore.deleteOrInactivateJoia(id);
    }
    try {
      const res = await api.delete(`/joias/${id}`);
      return res.data || { deleted: true, inactivated: false };
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.deleteOrInactivateJoia(id);
      throw new Error(err.response?.data?.message || 'Erro ao remover ou inativar joia.');
    }
  },

  async reactivate(id: number): Promise<Joia> {
    if (isMockModeExplicit()) {
      return localStore.reativarJoia(id);
    }
    try {
      const res = await api.put<Joia>(`/joias/${id}/reativar`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.reativarJoia(id);
      throw new Error(err.response?.data?.message || 'Erro ao reativar joia.');
    }
  },

  async adjustStock(id: number, novaQuantidade: number): Promise<Joia> {
    if (isMockModeExplicit()) {
      return localStore.ajustarEstoque(id, novaQuantidade);
    }
    try {
      // Tenta rota específica de reposição ou PUT/PATCH
      const res = await api.patch<Joia>(`/joias/${id}/estoque`, { quantidadeEstoque: novaQuantidade });
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.ajustarEstoque(id, novaQuantidade);
      throw new Error(err.response?.data?.message || 'Erro ao repor estoque da joia.');
    }
  }
};
