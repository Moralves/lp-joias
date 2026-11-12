// ==========================================
// Base de Dados Inicial para Simulação Local / Mock
// Permite testes e gravação do vídeo mesmo antes do backend estar no ar
// ==========================================
import type { Usuario, Cliente, Joia, Venda } from '../types';

export const INITIAL_USUARIOS: Usuario[] = [
  { id: 1, nome: 'Carlos Silva', email: 'carlos@lproyale.com.br', ativo: true },
  { id: 2, nome: 'Marina Costa', email: 'marina@lproyale.com.br', ativo: true },
  { id: 3, nome: 'Lucas Antigo', email: 'lucas@lproyale.com.br', ativo: false },
];

export const INITIAL_CLIENTES: Cliente[] = [
  { id: 1, nome: 'Ana Beatriz Souza', cpf: '12345678901', email: 'ana.souza@email.com', telefone: '11987654321', ativo: true },
  { id: 2, nome: 'Rafael Guimarães', cpf: '98765432100', email: 'rafael.g@email.com', telefone: '11976543210', ativo: true },
  { id: 3, nome: 'Camila Martins', cpf: '45678912300', email: 'camila.m@email.com', telefone: '11965432109', ativo: true },
  { id: 4, nome: 'Roberto Dias', cpf: '78912345600', email: 'roberto@email.com', telefone: '11954321098', ativo: false },
];

export const INITIAL_JOIAS: Joia[] = [
  { id: 1, nome: 'Anel Solitário Ouro 18k', categoria: 'Anel', material: 'Ouro 18k', preco: 2450.00, quantidadeEstoque: 6, ativo: true, possuiVendas: true },
  { id: 2, nome: 'Colar Riviera Diamantes', categoria: 'Colar', material: 'Ouro Branco', preco: 4890.00, quantidadeEstoque: 3, ativo: true, possuiVendas: true },
  { id: 3, nome: 'Brincos Pérola Cultivada', categoria: 'Brinco', material: 'Prata 925', preco: 420.00, quantidadeEstoque: 10, ativo: true, possuiVendas: false },
  { id: 4, nome: 'Pulseira Elo Cartier Ouro', categoria: 'Pulseira', material: 'Ouro 18k', preco: 3120.00, quantidadeEstoque: 4, ativo: true, possuiVendas: false },
  { id: 5, nome: 'Aliança Clássica Anatômica', categoria: 'Anel', material: 'Ouro 18k', preco: 1650.00, quantidadeEstoque: 0, ativo: true, possuiVendas: true },
  { id: 6, nome: 'Gargantilha Ponto de Luz', categoria: 'Colar', material: 'Prata 925', preco: 280.00, quantidadeEstoque: 8, ativo: false, possuiVendas: true },
];

export const INITIAL_VENDAS: Venda[] = [
  {
    id: 1,
    clienteId: 1,
    usuarioId: 1,
    valorTotal: 2450.00,
    dataVenda: '2026-11-10T14:32:00',
    status: 'CONCLUIDA',
    itens: [
      { id: 1, joiaId: 1, quantidade: 1, precoUnitario: 2450.00 }
    ]
  },
  {
    id: 2,
    clienteId: 2,
    usuarioId: 2,
    valorTotal: 4890.00,
    dataVenda: '2026-11-11T16:15:00',
    status: 'CANCELADA',
    itens: [
      { id: 2, joiaId: 2, quantidade: 1, precoUnitario: 4890.00 }
    ]
  }
];
