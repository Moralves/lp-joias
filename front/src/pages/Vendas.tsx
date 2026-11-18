import React, { useState, useEffect } from 'react';
import { Ban, Eye, Edit2, Plus, Trash2 } from 'lucide-react';
import type { Venda, Cliente, Joia } from '../types';
import { vendasService } from '../services/vendasService';
import { clientesService } from '../services/clientesService';
import { joiasService } from '../services/joiasService';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { showToast } from '../components/ui/ToastNotification';
import { Modal } from '../components/ui/Modal';

export const Vendas: React.FC = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [clientesAtivos, setClientesAtivos] = useState<Cliente[]>([]);
  const [joiasAtivas, setJoiasAtivas] = useState<Joia[]>([]);
  const [editClienteId, setEditClienteId] = useState<number>(0);
  const [editItens, setEditItens] = useState<{ joiaId: number; quantidade: number }[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadVendas = async () => {
    setLoading(true);
    try {
      const data = await vendasService.getAll();
      setVendas(data);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar histórico de vendas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendas();
  }, []);

  const handleCancelar = async (venda: Venda) => {
    if (venda.status === 'CANCELADA') {
      showToast('Esta venda já se encontra cancelada no sistema.', 'warning');
      return;
    }

    const confirm = window.confirm(
      `Confirma o cancelamento da Venda #${venda.id}? O saldo das peças será estornado imediatamente ao estoque físico da loja.`
    );
    if (!confirm) return;

    setCancelingId(venda.id);
    try {
      await vendasService.cancel(venda.id);
      showToast(`Venda #${venda.id} cancelada com sucesso. Estoque estornado.`, 'success');
      await loadVendas();
    } catch (err: any) {
      showToast(err.message || 'Falha ao processar o cancelamento da venda.', 'error');
    } finally {
      setCancelingId(null);
    }
  };

  const handleOpenEdit = async (venda: Venda) => {
    if (venda.status === 'CANCELADA') {
      showToast('Venda cancelada não pode ser editada.', 'warning');
      return;
    }
    try {
      const [clis, jois] = await Promise.all([
        clientesService.getAll(false),
        joiasService.getAll(false),
      ]);
      setClientesAtivos(clis);
      setJoiasAtivas(jois);
      setEditClienteId(venda.clienteId);
      setEditItens(
        (venda.itens || []).map((i) => ({
          joiaId: i.joiaId,
          quantidade: i.quantidade,
        }))
      );
      setEditingVenda(venda);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar dados para edição da venda.', 'error');
    }
  };

  const handleAddEditItem = () => {
    const usedIds = new Set(editItens.map((i) => i.joiaId));
    const available = joiasAtivas.find((j) => !usedIds.has(j.id) && j.quantidadeEstoque > 0);
    if (!available) {
      showToast('Todas as joias disponíveis em estoque já estão incluídas nesta venda.', 'warning');
      return;
    }
    setEditItens((prev) => [...prev, { joiaId: available.id, quantidade: 1 }]);
  };

  const handleRemoveEditItem = (index: number) => {
    setEditItens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenda) return;
    if (editItens.length === 0) {
      showToast('A venda deve possuir pelo menos um item.', 'warning');
      return;
    }
    setSavingEdit(true);
    try {
      await vendasService.update(editingVenda.id, {
        clienteId: editClienteId,
        itens: editItens,
      });
      showToast(`Venda #${editingVenda.id} atualizada e estoque recalculado com sucesso.`, 'success');
      setEditingVenda(null);
      await loadVendas();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar a venda.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-5">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            Histórico de Vendas &amp; Comprovantes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Consulta de operações registradas e cancelamento com estorno físico de estoque
          </p>
        </div>
        <button
          onClick={loadVendas}
          className="text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs font-medium"
        >
          Atualizar Consulta
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">Carregando histórico de vendas...</div>
        ) : vendas.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            Nenhuma operação de venda registrada até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold">Cupom #</th>
                  <th className="py-3 px-4 font-semibold">Data / Hora</th>
                  <th className="py-3 px-4 font-semibold">Cliente</th>
                  <th className="py-3 px-4 font-semibold">Operador / Vendedor</th>
                  <th className="py-3 px-4 font-semibold">Qtd Itens</th>
                  <th className="py-3 px-4 font-semibold">Valor Total</th>
                  <th className="py-3 px-4 font-semibold text-center">Status Fiscal</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vendas.map((venda) => {
                  const isCancelada = venda.status === 'CANCELADA';
                  return (
                    <tr
                      key={venda.id}
                      data-testid={`row-venda-${venda.id}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-800 dark:text-amber-400">
                        #{String(venda.id).padStart(4, '0')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                        {formatDateTime(venda.dataVenda)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {venda.cliente?.nome || `Cliente #${venda.clienteId}`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {venda.usuario?.nome || `Operador #${venda.usuarioId}`}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {venda.itens?.length || 0} produto(s)
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(venda.valorTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          data-testid={`status-venda-${venda.id}`}
                          className={`inline-flex items-center text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                            isCancelada
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isCancelada ? 'CANCELADA' : 'CONCLUÍDA'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedVenda(venda)}
                          title="Visualizar Comprovante"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-400 rounded hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(venda)}
                          disabled={isCancelada}
                          data-testid={`btn-editar-venda-${venda.id}`}
                          title={isCancelada ? 'Venda cancelada não pode ser editada' : 'Editar cliente e itens da venda'}
                          className={`p-1.5 rounded text-xs transition-colors ${
                            isCancelada
                              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                              : 'text-slate-500 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer'
                          }`}
                        >
                          <Edit2 className="w-4 h-4 inline" />
                        </button>

                        <button
                          onClick={() => handleCancelar(venda)}
                          disabled={isCancelada || cancelingId === venda.id}
                          data-testid={`btn-cancelar-venda-${venda.id}`}
                          title={
                            isCancelada
                              ? 'Venda já cancelada'
                              : 'Cancelar venda e estornar estoque'
                          }
                          className={`p-1.5 rounded text-xs transition-colors ${
                            isCancelada
                              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                          }`}
                        >
                          <Ban className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedVenda}
        onClose={() => setSelectedVenda(null)}
        title={selectedVenda ? `Comprovante Fiscal de Venda #${selectedVenda.id}` : ''}
      >
        {selectedVenda && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 block">Data da Emissão</span>
                <span className="font-mono text-slate-900 dark:text-white font-medium">{formatDateTime(selectedVenda.dataVenda)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 block">Status da Operação</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedVenda.status === 'CANCELADA' ? 'CANCELADA (Estoque Estornado)' : 'CONCLUÍDA'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 block">Cliente Comprador</span>
                <span className="text-slate-900 dark:text-white font-medium">{selectedVenda.cliente?.nome || `ID: ${selectedVenda.clienteId}`}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 block">Operador Responsável</span>
                <span className="text-slate-900 dark:text-white font-medium">{selectedVenda.usuario?.nome || `ID: ${selectedVenda.usuarioId}`}</span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-semibold">
                Itens Descriminados
              </h4>
              <div className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                {selectedVenda.itens?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {item.joia?.nome || `Joia #${item.joiaId}`}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5">
                        {item.quantidade}x un. @ {formatCurrency(item.precoUnitario || item.joia?.preco || 0)}
                      </p>
                    </div>
                    <div className="font-mono font-bold text-amber-800 dark:text-amber-400">
                      {formatCurrency((item.precoUnitario || item.joia?.preco || 0) * item.quantidade)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm bg-amber-50/90 dark:bg-slate-900 text-slate-900 dark:text-white p-3.5 rounded-lg border border-amber-300 dark:border-slate-800 shadow-xs transition-colors">
              <span className="font-semibold text-amber-950 dark:text-slate-300">Valor Total Pago:</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-lg">
                {formatCurrency(selectedVenda.valorTotal)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!editingVenda}
        onClose={() => setEditingVenda(null)}
        title={editingVenda ? `Editar Venda #${editingVenda.id}` : ''}
      >
        {editingVenda && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cliente Comprador *
              </label>
              <select
                value={editClienteId}
                onChange={(e) => setEditClienteId(Number(e.target.value))}
                data-testid="select-edit-venda-cliente"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500"
              >
                {clientesAtivos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Itens da Venda *
                </label>
                <button
                  type="button"
                  onClick={handleAddEditItem}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Peça</span>
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {editItens.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <select
                      value={item.joiaId}
                      onChange={(e) => {
                        const newJoiaId = Number(e.target.value);
                        setEditItens((prev) =>
                          prev.map((row, i) => (i === idx ? { ...row, joiaId: newJoiaId } : row))
                        );
                      }}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-slate-900 dark:text-slate-100"
                    >
                      {joiasAtivas.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.nome} ({formatCurrency(j.preco)})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      required
                      value={item.quantidade}
                      onChange={(e) => {
                        const qty = Math.max(1, Number(e.target.value));
                        setEditItens((prev) =>
                          prev.map((row, i) => (i === idx ? { ...row, quantidade: qty } : row))
                        );
                      }}
                      className="w-16 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1.5 text-center font-mono text-slate-900 dark:text-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveEditItem(idx)}
                      disabled={editItens.length <= 1}
                      title="Remover item"
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingVenda(null)}
                className="px-3 py-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                data-testid="btn-salvar-edicao-venda"
                className="font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg uppercase tracking-wider cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
