import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, RotateCcw, Package, AlertTriangle } from 'lucide-react';
import type { Joia } from '../types';
import { joiasService } from '../services/joiasService';
import { formatCurrency } from '../utils/formatters';
import { showToast } from '../components/ui/ToastNotification';
import { Modal } from '../components/ui/Modal';

export const Joias: React.FC = () => {
  const [joias, setJoias] = useState<Joia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editJoia, setEditJoia] = useState<Joia | null>(null);
  const [stockJoia, setStockJoia] = useState<Joia | null>(null);

  const [formNome, setFormNome] = useState('');
  const [formCategoria, setFormCategoria] = useState('Anel');
  const [formMaterial, setFormMaterial] = useState('Ouro 18k');
  const [formPreco, setFormPreco] = useState('1000');
  const [formEstoque, setFormEstoque] = useState('5');
  const [formStockQty, setFormStockQty] = useState('1');

  const loadJoias = async () => {
    setLoading(true);
    try {
      const data = await joiasService.getAll(showInactive);
      setJoias(data);
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar catálogo de joias.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJoias();
  }, [showInactive]);

  const handleOpenCreate = () => {
    setFormNome('');
    setFormCategoria('Anel');
    setFormMaterial('Ouro 18k');
    setFormPreco('1000');
    setFormEstoque('5');
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joiasService.create({
        nome: formNome,
        categoria: formCategoria,
        material: formMaterial,
        preco: parseFloat(formPreco),
        quantidadeEstoque: parseInt(formEstoque, 10),
      });
      showToast('Joia cadastrada com sucesso no catálogo.', 'success');
      setIsCreateOpen(false);
      loadJoias();
    } catch (err: any) {
      showToast(err.message || 'Erro ao cadastrar peça.', 'error');
    }
  };

  const handleOpenEdit = (joia: Joia) => {
    setEditJoia(joia);
    setFormNome(joia.nome);
    setFormCategoria(joia.categoria);
    setFormMaterial(joia.material);
    setFormPreco(joia.preco.toString());
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJoia) return;

    try {
      await joiasService.update(editJoia.id, {
        nome: formNome,
        categoria: formCategoria,
        material: formMaterial,
        preco: parseFloat(formPreco),
      });
      showToast('Dados cadastrais atualizados com sucesso.', 'success');
      setEditJoia(null);
      loadJoias();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar dados da joia.', 'error');
    }
  };

  const handleOpenStock = (joia: Joia) => {
    setStockJoia(joia);
    setFormStockQty(joia.quantidadeEstoque.toString());
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockJoia) return;

    try {
      await joiasService.update(stockJoia.id, {
        quantidadeEstoque: parseInt(formStockQty, 10),
      });
      showToast(`Estoque da joia #${stockJoia.id} atualizado para ${formStockQty} un.`, 'success');
      setStockJoia(null);
      loadJoias();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar estoque físico.', 'error');
    }
  };

  const handleDeleteOrInactivate = async (joia: Joia) => {
    const msg = !joia.possuiVendas
      ? `A peça "${joia.nome}" NÃO possui vendas registradas. Ela será EXCLUÍDA DEFINITIVAMENTE. Confirmar exclusão?`
      : `A peça "${joia.nome}" possui vendas vinculadas no histórico. Por integridade fiscal, ela será inativada no catálogo. Confirmar?`;

    if (!window.confirm(msg)) return;

    try {
      const res = await joiasService.deleteOrInactivate(joia.id);
      if (res.deleted) {
        showToast(`Peça #${joia.id} removida do banco de dados.`, 'success');
      } else {
        showToast(`Peça #${joia.id} inativada. Histórico de vendas mantido.`, 'success');
      }
      loadJoias();
    } catch (err: any) {
      showToast(err.message || 'Falha ao processar solicitação.', 'error');
    }
  };

  const handleReactivate = async (joia: Joia) => {
    try {
      await joiasService.reactivate(joia.id);
      showToast(`Peça "${joia.nome}" reativada no catálogo do PDV.`, 'success');
      loadJoias();
    } catch (err: any) {
      showToast(err.message || 'Erro ao reativar peça.', 'error');
    }
  };

  return (
    <div className="space-y-5">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-serif">
            Catálogo de Joias &amp; Saldo de Estoque
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gestão cadastral, reposição de inventário físico e integridade fiscal
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              data-testid="toggle-inativos-joias"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-slate-300 text-amber-600 focus:ring-0"
            />
            <span>Exibir Inativas</span>
          </label>

          <button
            onClick={handleOpenCreate}
            data-testid="btn-nova-joia"
            className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2 rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-2xs"
          >
            Cadastrar Joia
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">Carregando catálogo de joias...</div>
        ) : joias.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">Nenhuma joia encontrada no catálogo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4 font-semibold">REF</th>
                  <th className="py-3 px-4 font-semibold">Descrição</th>
                  <th className="py-3 px-4 font-semibold">Categoria</th>
                  <th className="py-3 px-4 font-semibold">Material / Teor</th>
                  <th className="py-3 px-4 font-semibold">Preço Unitário</th>
                  <th className="py-3 px-4 font-semibold">Estoque em Loja</th>
                  <th className="py-3 px-4 font-semibold text-center">Movimentação</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {joias.map((joia) => (
                  <tr
                    key={joia.id}
                    data-testid={`row-joia-${joia.id}`}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!joia.ativo ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : ''}`}
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-800 dark:text-amber-400">
                      #{String(joia.id).padStart(3, '0')}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">{joia.nome}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{joia.categoria}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{joia.material}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(joia.preco)}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          joia.quantidadeEstoque <= 0
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {joia.quantidadeEstoque} un.
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {joia.possuiVendas ? (
                        <span className="text-[10px] uppercase font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                          Com Vendas
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                          Sem Movimentação
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] uppercase font-semibold font-mono px-2 py-0.5 rounded ${
                          joia.ativo
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {joia.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenStock(joia)}
                        title="Ajustar Saldo Físico"
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 inline" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(joia)}
                        data-testid={`btn-editar-joia-${joia.id}`}
                        title="Editar Informações Cadastrais"
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </button>

                      {joia.ativo ? (
                        <button
                          onClick={() => handleDeleteOrInactivate(joia)}
                          data-testid={`btn-excluir-joia-${joia.id}`}
                          title={
                            joia.possuiVendas
                              ? 'Inativar Joia (Possui Vendas)'
                              : 'Excluir Peça Definitivamente'
                          }
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(joia)}
                          data-testid={`btn-reativar-joia-${joia.id}`}
                          title="Reativar Joia no Catálogo"
                          className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Cadastrar Nova Peça no Acervo">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição Comercial da Joia *</label>
            <input
              type="text"
              required
              data-testid="input-joia-nome"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
              placeholder="Ex: Anel Solitário de Ouro 18k com Diamante Central"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria Comercial *</label>
              <select
                value={formCategoria}
                onChange={(e) => setFormCategoria(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="Anel">Anel</option>
                <option value="Colar">Colar</option>
                <option value="Brinco">Brinco</option>
                <option value="Pulseira">Pulseira</option>
                <option value="Pingente">Pingente</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Material / Teor do Metal *</label>
              <input
                type="text"
                required
                value={formMaterial}
                onChange={(e) => setFormMaterial(e.target.value)}
                placeholder="Ex: Ouro Amarelo 18k / Platina 950"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Preço Unitário de Venda (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                data-testid="input-joia-preco"
                value={formPreco}
                onChange={(e) => setFormPreco(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estoque Inicial (unid) *</label>
              <input
                type="number"
                min="0"
                required
                data-testid="input-joia-estoque"
                value={formEstoque}
                onChange={(e) => setFormEstoque(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="btn-salvar-nova-joia"
              className="font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg uppercase tracking-wider cursor-pointer shadow-2xs"
            >
              Salvar Peça
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editJoia} onClose={() => setEditJoia(null)} title={`Ficha Cadastral da Joia #${editJoia?.id}`}>
        {editJoia && (
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            {editJoia.possuiVendas && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                <span>
                  <strong>Aviso de Integridade Fiscal:</strong> Esta joia já possui histórico de vendas emitidas. Por integridade fiscal e contábil, os campos cadastrais estão congelados para alteração. Para repor a contagem física, utilize a função de Reposição de Estoque.
                </span>
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição da Peça</label>
              <input
                type="text"
                disabled={editJoia.possuiVendas}
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria Comercial</label>
                <input
                  type="text"
                  disabled={editJoia.possuiVendas}
                  value={formCategoria}
                  onChange={(e) => setFormCategoria(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Material / Teor</label>
                <input
                  type="text"
                  disabled={editJoia.possuiVendas}
                  value={formMaterial}
                  onChange={(e) => setFormMaterial(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Preço Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                disabled={editJoia.possuiVendas}
                value={formPreco}
                onChange={(e) => setFormPreco(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 disabled:opacity-50 font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditJoia(null)}
                className="px-3 py-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={editJoia.possuiVendas}
                className="font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg disabled:opacity-40 uppercase tracking-wider cursor-pointer shadow-2xs"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!stockJoia} onClose={() => setStockJoia(null)} title={`Ajuste de Saldo Físico: ${stockJoia?.nome}`}>
        {stockJoia && (
          <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Ajuste de contagem e entrada de novas peças para o estoque de balcão da loja.
            </p>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nova Quantidade Física em Estoque (unid) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formStockQty}
                onChange={(e) => setFormStockQty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setStockJoia(null)}
                className="px-3 py-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg uppercase tracking-wider cursor-pointer shadow-2xs"
              >
                Atualizar Saldo
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
