// ==========================================
// L&P ROYALE - SISTEMA DE VENDAS DE JOALHERIA
// Definições de Tipos e Contratos de Dados
// ==========================================

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
  categoria: string; // "Anel", "Colar", "Brinco", "Pulseira", etc.
  material: string;  // "Ouro 18k", "Prata 925", etc.
  preco: number;
  quantidadeEstoque: number;
  ativo: boolean;
  possuiVendas: boolean; // Calculado pelo backend em tempo de execução
}

export interface ItemVenda {
  id?: number;
  joiaId: number;
  joia?: Joia;
  quantidade: number;
  precoUnitario?: number; // Preço gravado no momento da venda
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

// Payload exigido pelo backend para POST e PUT de vendas
export interface VendaPayload {
  clienteId: number;
  itens: {
    joiaId: number;
    quantidade: number;
  }[];
}

// Autenticação
export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

