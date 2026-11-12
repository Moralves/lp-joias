// ==========================================
// Armazenamento em Memória / Simulação Local
// Implementa exatamente as 26 Regras de Negócio do Escopo
// ==========================================
import type { Usuario, Cliente, Joia, Venda, VendaPayload, LoginCredentials, AuthResponse } from '../types';
import { INITIAL_USUARIOS, INITIAL_CLIENTES, INITIAL_JOIAS, INITIAL_VENDAS } from './mockData';

class LocalStore {
  usuarios: Usuario[] = [];
  clientes: Cliente[] = [];
  joias: Joia[] = [];
  vendas: Venda[] = [];
  currentUser: Usuario | null = null;

  constructor() {
    this.reset();
  }

  reset() {
    this.usuarios = JSON.parse(JSON.stringify(INITIAL_USUARIOS));
    this.clientes = JSON.parse(JSON.stringify(INITIAL_CLIENTES));
    this.joias = JSON.parse(JSON.stringify(INITIAL_JOIAS));
    this.vendas = JSON.parse(JSON.stringify(INITIAL_VENDAS));
    this.currentUser = this.usuarios[0];
  }

  // --- AUTH ---
  login(creds: LoginCredentials): AuthResponse {
    const input = creds.email.toLowerCase();
    const user = this.usuarios.find(u => {
      const email = u.email.toLowerCase();
      return (
        email === input ||
        email.replace('@lproyale.com.br', '@aurea.com.br') === input ||
        email.replace('@aurea.com.br', '@lproyale.com.br') === input
      );
    });
    if (!user) {
      throw new Error('E-mail ou senha inválidos.');
    }
    // Regra 9: Usuário inativo não consegue fazer login
    if (!user.ativo) {
      throw new Error('Usuário inativo não tem permissão para acessar o sistema.');
    }
    this.currentUser = user;
    return {
      token: `mock-jwt-token-user-${user.id}-${Date.now()}`,
      usuario: user,
    };
  }

  // --- USUÁRIOS ---
  getUsuarios(includeInactive = false): Usuario[] {
    return this.usuarios.filter(u => includeInactive || u.ativo);
  }

  createUsuario(data: Omit<Usuario, 'id' | 'ativo'>): Usuario {
    // Regra 8: E-mail de usuário não pode se repetir
    const exists = this.usuarios.some(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      throw new Error('Já existe um usuário cadastrado com este e-mail (409 Conflict).');
    }
    const newId = Math.max(...this.usuarios.map(u => u.id), 0) + 1;
    const novo: Usuario = { id: newId, ...data, ativo: true };
    this.usuarios.push(novo);
    return novo;
  }

  updateUsuario(id: number, data: Partial<Usuario>): Usuario {
    const user = this.usuarios.find(u => u.id === id);
    if (!user) throw new Error('Usuário não encontrado.');
    if (data.email && data.email !== user.email) {
      const exists = this.usuarios.some(u => u.id !== id && u.email.toLowerCase() === data.email!.toLowerCase());
      if (exists) throw new Error('Já existe um usuário com este e-mail (409 Conflict).');
    }
    Object.assign(user, data);
    return user;
  }

  inativarUsuario(id: number, currentUserId: number): void {
    // Regra 13: Um usuário não pode inativar a si mesmo (409)
    if (id === currentUserId) {
      throw new Error('Não é permitido inativar o próprio usuário atualmente autenticado (409 Conflict).');
    }
    const user = this.usuarios.find(u => u.id === id);
    if (!user) throw new Error('Usuário não encontrado.');
    user.ativo = false;
  }

  reativarUsuario(id: number): Usuario {
    const user = this.usuarios.find(u => u.id === id);
    if (!user) throw new Error('Usuário não encontrado.');
    // Regra 12: Reativar quem já está ativo retorna 409
    if (user.ativo) throw new Error('O usuário já está ativo (409 Conflict).');
    user.ativo = true;
    return user;
  }

  // --- CLIENTES ---
  getClientes(includeInactive = false): Cliente[] {
    return this.clientes.filter(c => includeInactive || c.ativo);
  }

  createCliente(data: Omit<Cliente, 'id' | 'ativo'>): Cliente {
    // Regra 7: CPF e e-mail não podem se repetir
    const cpfClean = data.cpf.replace(/\D/g, '');
    const cpfExists = this.clientes.some(c => c.cpf.replace(/\D/g, '') === cpfClean);
    if (cpfExists) throw new Error('CPF já cadastrado no sistema (409 Conflict).');

    const emailExists = this.clientes.some(c => c.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) throw new Error('E-mail já cadastrado para outro cliente (409 Conflict).');

    const newId = Math.max(...this.clientes.map(c => c.id), 0) + 1;
    const novo: Cliente = { id: newId, ...data, cpf: cpfClean, ativo: true };
    this.clientes.push(novo);
    return novo;
  }

  updateCliente(id: number, data: Partial<Cliente>): Cliente {
    const cliente = this.clientes.find(c => c.id === id);
    if (!cliente) throw new Error('Cliente não encontrado.');
    if (data.cpf) {
      const cpfClean = data.cpf.replace(/\D/g, '');
      const cpfExists = this.clientes.some(c => c.id !== id && c.cpf.replace(/\D/g, '') === cpfClean);
      if (cpfExists) throw new Error('CPF já cadastrado para outro cliente (409 Conflict).');
      data.cpf = cpfClean;
    }
    if (data.email) {
      const emailExists = this.clientes.some(c => c.id !== id && c.email.toLowerCase() === data.email!.toLowerCase());
      if (emailExists) throw new Error('E-mail já cadastrado para outro cliente (409 Conflict).');
    }
    Object.assign(cliente, data);
    return cliente;
  }

  inativarCliente(id: number): void {
    const cliente = this.clientes.find(c => c.id === id);
    if (!cliente) throw new Error('Cliente não encontrado.');
    cliente.ativo = false;
  }

  reativarCliente(id: number): Cliente {
    const cliente = this.clientes.find(c => c.id === id);
    if (!cliente) throw new Error('Cliente não encontrado.');
    if (cliente.ativo) throw new Error('Cliente já se encontra ativo (409 Conflict).');
    cliente.ativo = true;
    return cliente;
  }

  // --- JOIAS ---
  getJoias(includeInactive = false): Joia[] {
    return this.joias
      .filter(j => includeInactive || j.ativo)
      .map(j => ({
        ...j,
        possuiVendas: this.joiaPossuiVendas(j.id)
      }));
  }

  joiaPossuiVendas(joiaId: number): boolean {
    return this.vendas.some(v => v.itens.some(item => item.joiaId === joiaId));
  }

  createJoia(data: Omit<Joia, 'id' | 'ativo' | 'possuiVendas'>): Joia {
    // Regra 5: Preço maior que zero
    if (data.preco <= 0) throw new Error('O preço da joia deve ser maior que zero.');
    // Regra 6: Estoque nunca negativo
    if (data.quantidadeEstoque < 0) throw new Error('O estoque da joia não pode ser negativo.');

    const newId = Math.max(...this.joias.map(j => j.id), 0) + 1;
    const nova: Joia = { id: newId, ...data, ativo: true, possuiVendas: false };
    this.joias.push(nova);
    return nova;
  }

  updateJoia(id: number, data: Partial<Joia>): Joia {
    const joia = this.joias.find(j => j.id === id);
    if (!joia) throw new Error('Joia não encontrada.');

    const jaVendeu = this.joiaPossuiVendas(id);
    // Regra 3: Joia que já participou de venda não pode ter dados cadastrais alterados
    if (jaVendeu) {
      if (
        (data.nome && data.nome !== joia.nome) ||
        (data.categoria && data.categoria !== joia.categoria) ||
        (data.material && data.material !== joia.material) ||
        (data.preco !== undefined && data.preco !== joia.preco)
      ) {
        throw new Error('Joia já participou de venda: não é permitido alterar nome, categoria, material ou preço (409 Conflict).');
      }
    }

    if (data.preco !== undefined && data.preco <= 0) {
      throw new Error('O preço deve ser superior a zero.');
    }
    if (data.quantidadeEstoque !== undefined && data.quantidadeEstoque < 0) {
      throw new Error('A quantidade em estoque não pode ser negativa.');
    }

    Object.assign(joia, data);
    return { ...joia, possuiVendas: jaVendeu };
  }

  ajustarEstoque(id: number, novaQuantidade: number): Joia {
    // Regra 4: Ajuste de estoque (reposição) permitido mesmo em joia com vendas
    if (novaQuantidade < 0) throw new Error('Estoque não pode ser negativo.');
    const joia = this.joias.find(j => j.id === id);
    if (!joia) throw new Error('Joia não encontrada.');
    joia.quantidadeEstoque = novaQuantidade;
    return { ...joia, possuiVendas: this.joiaPossuiVendas(id) };
  }

  deleteOrInactivateJoia(id: number): { deleted: boolean; inactivated: boolean } {
    const index = this.joias.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Joia não encontrada.');

    const jaVendeu = this.joiaPossuiVendas(id);
    if (jaVendeu) {
      // Regra 3: Se já participou de venda, DELETE apenas inativa
      this.joias[index].ativo = false;
      return { deleted: false, inactivated: true };
    } else {
      // Regra 2: Nunca participou de venda: exclusão física definitiva
      this.joias.splice(index, 1);
      return { deleted: true, inactivated: false };
    }
  }

  reativarJoia(id: number): Joia {
    const joia = this.joias.find(j => j.id === id);
    if (!joia) throw new Error('Joia não encontrada.');
    if (joia.ativo) throw new Error('A joia já está ativa (409 Conflict).');
    joia.ativo = true;
    return { ...joia, possuiVendas: this.joiaPossuiVendas(id) };
  }

  // --- VENDAS ---
  getVendas(): Venda[] {
    return this.vendas.map(v => ({
      ...v,
      cliente: this.clientes.find(c => c.id === v.clienteId),
      usuario: this.usuarios.find(u => u.id === v.usuarioId),
      itens: v.itens.map(item => ({
        ...item,
        joia: this.joias.find(j => j.id === item.joiaId)
      }))
    })).sort((a, b) => b.id - a.id);
  }

  createVenda(payload: VendaPayload, currentUserId: number): Venda {
    // Regra 16: Venda exige cliente existente e pelo menos um item
    const cliente = this.clientes.find(c => c.id === payload.clienteId);
    if (!cliente) throw new Error('Cliente inválido ou não encontrado.');
    // Regra 10: Cliente inativo não pode receber vendas
    if (!cliente.ativo) throw new Error('Não é possível registrar venda para cliente inativo.');

    if (!payload.itens || payload.itens.length === 0) {
      throw new Error('A venda deve conter ao menos um item.');
    }

    // Regra 18: Mesma joia não pode aparecer duas vezes na mesma venda
    const joiaIds = payload.itens.map(i => i.joiaId);
    const uniqueIds = new Set(joiaIds);
    if (uniqueIds.size !== joiaIds.length) {
      throw new Error('A mesma joia não pode constar mais de uma vez na mesma venda (Regra 18).');
    }

    // Validações de itens e estoque (Regras 17, 10, 19)
    for (const item of payload.itens) {
      if (item.quantidade <= 0) {
        throw new Error('A quantidade de cada item deve ser maior que zero.');
      }
      const joia = this.joias.find(j => j.id === item.joiaId);
      if (!joia) {
        throw new Error(`Joia ID ${item.joiaId} não encontrada.`);
      }
      if (!joia.ativo) {
        throw new Error(`A joia "${joia.nome}" está inativa e não pode ser vendida.`);
      }
      // Regra 19: Estoque insuficiente rejeita a venda inteira
      if (item.quantidade > joia.quantidadeEstoque) {
        throw new Error(`Estoque insuficiente para a joia "${joia.nome}". Disponível: ${joia.quantidadeEstoque}, Solicitado: ${item.quantidade}. Venda rejeitada.`);
      }
    }

    // Transação: Realiza baixa de estoque de cada item (Regra 20)
    let valorTotal = 0;
    const itensGravados = payload.itens.map((item, index) => {
      const joia = this.joias.find(j => j.id === item.joiaId)!;
      joia.quantidadeEstoque -= item.quantidade;
      const precoUnitario = joia.preco; // Regra: preço da época
      valorTotal += precoUnitario * item.quantidade;
      return {
        id: index + 1,
        joiaId: item.joiaId,
        quantidade: item.quantidade,
        precoUnitario: precoUnitario,
      };
    });

    const newId = Math.max(...this.vendas.map(v => v.id), 0) + 1;
    const novaVenda: Venda = {
      id: newId,
      clienteId: cliente.id,
      usuarioId: currentUserId,
      valorTotal: valorTotal,
      dataVenda: new Date().toISOString(),
      status: 'CONCLUIDA',
      itens: itensGravados,
    };

    this.vendas.push(novaVenda);
    return novaVenda;
  }

  cancelarVenda(vendaId: number): Venda {
    const venda = this.vendas.find(v => v.id === vendaId);
    if (!venda) throw new Error('Venda não encontrada.');
    // Regra 24: Venda cancelada não pode ser cancelada novamente
    if (venda.status === 'CANCELADA') {
      throw new Error('Esta venda já se encontra cancelada.');
    }

    // Regra 23: Ao cancelar, o estoque de todos os itens é devolvido
    for (const item of venda.itens) {
      const joia = this.joias.find(j => j.id === item.joiaId);
      if (joia) {
        joia.quantidadeEstoque += item.quantidade;
      }
    }

    venda.status = 'CANCELADA';
    return venda;
  }
}

export const localStore = new LocalStore();
