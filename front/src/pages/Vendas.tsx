import React, { useState, useEffect } from 'react';
import { Ban, Eye } from 'lucide-react';
import type { Venda } from '../types';
import { vendasService } from '../services/vendasService';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { showToast } from '../components/ui/ToastNotification';
import { Modal } from '../components/ui/Modal';

export const Vendas: React.FC = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

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

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
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

      {/* Table of Sales */}
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
                          <Eye className="w-4 h-4" />
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

      {/* Modal: Comprovante Detalhado da Venda */}
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
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-400 block">Forma de Pagamento</span>
                <span className="font-semibold text-slate-900 dark:text-white">Balcão / À Vista</span>
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

            {/* Total Display (100% Light in Light Mode, Dark in Dark Mode) */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm bg-amber-50/90 dark:bg-slate-900 text-slate-900 dark:text-white p-3.5 rounded-lg border border-amber-300 dark:border-slate-800 shadow-xs transition-colors">
              <span className="font-semibold text-amber-950 dark:text-slate-300">Valor Total Pago:</span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-lg">
                {formatCurrency(selectedVenda.valorTotal)}
              </span>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
