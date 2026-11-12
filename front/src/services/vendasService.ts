// ==========================================
// Serviço de Vendas e PDV (Caixa)
// ==========================================
import { api } from './api';
import { isMockModeExplicit, isNetworkError } from './clientHelper';
import { localStore } from './store';
import { authService } from './authService';
import type { Venda, VendaPayload } from '../types';

export const vendasService = {
  async getAll(): Promise<Venda[]> {
    if (isMockModeExplicit()) {
      return localStore.getVendas();
    }
    try {
      const res = await api.get<Venda[]>('/vendas');
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.getVendas();
      throw new Error(err.response?.data?.message || 'Falha ao buscar histórico de vendas.');
    }
  },

  async getById(id: number): Promise<Venda> {
    if (isMockModeExplicit()) {
      const v = localStore.getVendas().find(venda => venda.id === id);
      if (!v) throw new Error('Venda não encontrada.');
      return v;
    }
    try {
      const res = await api.get<Venda>(`/vendas/${id}`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        const v = localStore.getVendas().find(venda => venda.id === id);
        if (!v) throw new Error('Venda não encontrada.');
        return v;
      }
      throw new Error(err.response?.data?.message || 'Erro ao carregar detalhes da venda.');
    }
  },

  async create(payload: VendaPayload): Promise<Venda> {
    const current = authService.getCurrentUser();
    const currentUserId = current?.id || 1;

    if (isMockModeExplicit()) {
      return localStore.createVenda(payload, currentUserId);
    }
    try {
      const res = await api.post<Venda>('/vendas', payload);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) {
        return localStore.createVenda(payload, currentUserId);
      }
      throw new Error(err.response?.data?.message || 'Erro ao registrar venda no sistema.');
    }
  },

  async cancel(id: number): Promise<Venda> {
    if (isMockModeExplicit()) {
      return localStore.cancelarVenda(id);
    }
    try {
      const res = await api.delete<Venda>(`/vendas/${id}`);
      return res.data;
    } catch (err: any) {
      if (isNetworkError(err)) return localStore.cancelarVenda(id);
      throw new Error(err.response?.data?.message || 'Erro ao cancelar a venda.');
    }
  }
};
