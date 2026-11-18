import React, { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import type { Joia, Cliente, VendaPayload } from '../types';
import { joiasService } from '../services/joiasService';
import { clientesService } from '../services/clientesService';
import { vendasService } from '../services/vendasService';
import { formatCurrency } from '../utils/formatters';
import { showToast } from '../components/ui/ToastNotification';

interface CartItem {
  joia: Joia;
  quantidade: number;
}

export const PDV: React.FC = () => {
  const [joias, setJoias] = useState<Joia[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  const [selectedClienteId, setSelectedClienteId] = useState<number | ''>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [joiasData, clientesData] = await Promise.all([
        joiasService.getAll(false),
        clientesService.getAll(false),
      ]);
      setJoias(joiasData);
      setClientes(clientesData);
      if (clientesData.length > 0 && selectedClienteId === '') {
        setSelectedClienteId(clientesData[0].id);
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar catálogo do PDV.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ['TODAS', ...Array.from(new Set(joias.map((j) => j.categoria)))];

  const filteredJoias = joias.filter((j) => {
    const matchesSearch =
      j.nome.toLowerCase().includes(search.toLowerCase()) ||
      j.material.toLowerCase().includes(search.toLowerCase()) ||
      String(j.id).includes(search.trim());
    const matchesCat = selectedCategory === 'TODAS' || j.categoria === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (joia: Joia) => {
    if (joia.quantidadeEstoque <= 0) {
      showToast(`Estoque esgotado para o item "${joia.nome}".`, 'warning');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.joia.id === joia.id);
      if (existing) {
        if (existing.quantidade + 1 > joia.quantidadeEstoque) {
          showToast(`Saldo insuficiente. Estoque disponível: ${joia.quantidadeEstoque} un.`, 'warning');
          return prev;
        }
        return prev.map((item) =>
          item.joia.id === joia.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...prev, { joia, quantidade: 1 }];
      }
    });
  };

  const updateQuantity = (joiaId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.joia.id === joiaId) {
            const nextQty = item.quantidade + delta;
            if (nextQty > item.joia.quantidadeEstoque) {
              showToast(`Limite atingido. Saldo físico disponível: ${item.joia.quantidadeEstoque} un.`, 'warning');
              return item;
            }
            return { ...item, quantidade: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantidade > 0)
    );
  };

  const removeFromCart = (joiaId: number) => {
    setCart((prev) => prev.filter((item) => item.joia.id !== joiaId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.joia.preco * item.quantidade, 0);
  const totalPecas = cart.reduce((acc, item) => acc + item.quantidade, 0);

  const handleConfirmarVenda = async () => {
    if (!selectedClienteId) {
      showToast('Por favor, selecione o cliente comprador para vincular à venda.', 'warning');
      return;
    }

    if (cart.length === 0) {
      showToast('O cupom está vazio. Adicione itens antes de confirmar.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload: VendaPayload = {
        clienteId: Number(selectedClienteId),
        itens: cart.map((item) => ({
          joiaId: item.joia.id,
          quantidade: item.quantidade,
        })),
      };

      const result = await vendasService.create(payload);
      showToast(
        `Venda #${result.id} concluída com sucesso! Total: ${formatCurrency(result.valorTotal)}. Saldo do estoque atualizado.`,
        'success'
      );

      clearCart();
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Falha ao processar a venda no caixa.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs flex items-center justify-between transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-white font-serif">
              Terminal de Vendas &bull; Frente de Caixa
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        <div className="lg:col-span-7 space-y-4">

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs space-y-3 transition-colors">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                data-testid="input-busca-joias"
                placeholder="Buscar por descrição, material ou código (#ID)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-semibold border border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono transition-colors">
              Carregando catálogo de joias...
            </div>
          ) : filteredJoias.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">Nenhum produto encontrado</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Verifique os termos da busca ou limpe o filtro de categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredJoias.map((joia) => {
                const isOutOfStock = joia.quantidadeEstoque <= 0;
                return (
                  <div
                    key={joia.id}
                    data-testid={`card-joia-${joia.id}`}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isOutOfStock
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">REF #{String(joia.id).padStart(3, '0')}</span>
                        <span className="uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
                          {joia.categoria}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">
                        {joia.nome}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {joia.material}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white block">
                          {formatCurrency(joia.preco)}
                        </span>
                        <span
                          className={`text-[11px] font-mono ${
                            isOutOfStock ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Saldo: {joia.quantidadeEstoque} un.
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(joia)}
                        disabled={isOutOfStock}
                        data-testid={`btn-add-joia-${joia.id}`}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                            : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-slate-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80'
                        }`}
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 lg:sticky lg:top-20 shadow-xs transition-colors">

          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Cupom de Venda
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer font-medium"
              >
                Limpar Cupom
              </button>
            )}
          </div>

          <div className="mt-3.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Cliente Comprador *
            </label>
            <select
              data-testid="select-cliente"
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {clientes.length === 0 ? (
                <option value="">Nenhum cliente ativo disponível</option>
              ) : (
                clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} &bull; CPF: {c.cpf}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              <span>Itens Selecionados</span>
              <span className="font-mono text-slate-900 dark:text-slate-200">{cart.length} item(ns)</span>
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/30">
                Cupom em aberto. Adicione itens do catálogo ao lado.
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {cart.map((item, index) => (
                  <div
                    key={item.joia.id}
                    data-testid={`cart-item-${item.joia.id}`}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-slate-400 dark:text-slate-500 text-[10px]">#{String(index + 1).padStart(2, '0')}</span>
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {item.joia.nome}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {item.quantidade}x {formatCurrency(item.joia.preco)} = <span className="text-amber-800 dark:text-amber-400 font-bold">{formatCurrency(item.joia.preco * item.quantidade)}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.joia.id, -1)}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs font-semibold"
                        >
                          -
                        </button>
                        <span
                          data-testid={`cart-qty-${item.joia.id}`}
                          className="px-2 font-mono font-bold text-slate-900 dark:text-white text-xs"
                        >
                          {item.quantidade}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.joia.id, 1)}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs font-semibold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.joia.id)}
                        title="Remover item"
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Quantidade de Peças:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{totalPecas} un.</span>
            </div>

            <div className="bg-amber-50/90 dark:bg-slate-900 border border-amber-300 dark:border-slate-800 rounded-xl p-3.5 mt-2 flex items-center justify-between shadow-xs transition-colors">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 dark:text-slate-300 block">
                  Valor Total
                </span>
                <span className="text-xs text-amber-700/80 dark:text-slate-400">Soma dos itens do cupom</span>
              </div>
              <span
                data-testid="cart-total-value"
                className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 tracking-tight"
              >
                {formatCurrency(cartTotal)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmarVenda}
              disabled={submitting || cart.length === 0 || !selectedClienteId}
              data-testid="btn-confirmar-venda"
              className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider text-xs shadow-xs"
            >
              <span>{submitting ? 'Emitindo Venda...' : 'Finalizar Venda'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
