export interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  ativo: boolean;
}

export interface Joia {
  id: number;
  nome: string;
  categoria: string;
  material: string;
  preco: number;
  quantidadeEstoque: number;
  ativo: boolean;
  possuiVendas: boolean;
}

export interface ItemVenda {
  id?: number;
  joiaId: number;
  joia?: Joia;
  quantidade: number;
  precoUnitario?: number;
}

export interface Venda {
  id: number;
  clienteId: number;
  cliente?: Cliente;
  usuarioId?: number;
  usuario?: Usuario;
  valorTotal: number;
  dataVenda: string;
  status: 'CONCLUIDA' | 'CANCELADA';
  itens: ItemVenda[];
}

export interface VendaPayload {
  clienteId: number;
  itens: {
    joiaId: number;
    quantidade: number;
  }[];
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

