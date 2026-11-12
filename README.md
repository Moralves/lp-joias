# L&P Royale — Sistema de Gestão e Vendas de Joalheria

**Disciplina:** Testes de Software | Projeto N2  
**Professor:** Reinaldo Jr  
**Integrantes:** Mor e Mor  
**Data Limite de Entrega:** 18/11/2026 às 18:00h (Apresentação Prática no mesmo dia)  

---

## 1. Proposta do Sistema

O **L&P Royale** é um sistema web local de gerenciamento de joalheria física, desenvolvido para ser operado diretamente pelos funcionários no balcão e no caixa da loja. O sistema contempla:

- Autenticação de funcionários via token seguro JWT;
- Controle cadastral e estoque de joias por categoria e material;
- Gestão cadastral de clientes com validação de CPF e dados de contato;
- Frente de Caixa (PDV) com cálculo dinâmico de totais e validação atômica de disponibilidade de estoque;
- Histórico de vendas com suporte a cancelamento e estorno automático de peças ao estoque;
- Políticas de integridade referencial:
  - **Exclusão Lógica (*Soft Delete*):** Usuários, clientes e vendas nunca são deletados fisicamente do banco de dados;
  - **Exclusão Condicional de Joias:** Joias sem histórico de venda podem ser excluídas em definitivo; joias com histórico de vendas são apenas inativadas (com bloqueio HTTP 409 para alteração cadastral);
  - **Proteção de Auto-inativação:** O funcionário logado não pode inativar a si mesmo (HTTP 409).

> **Objetivo Central:** Aplicação prática da pirâmide de testes de software automatizados (Testes Unitários com JUnit, Testes de Integração de API com REST-assured e Testes End-to-End com Selenium WebDriver).

---

## 2. Estrutura do Repositório

O repositório está organizado conforme a especificação do projeto em duas frentes independentes:

```
L&P JOIAS/                     # Raiz do repositório
├── docs/                      # Especificação, diagramas e escopo formal
│   ├── Escopo_Joalheria.docx
│   ├── Escopo_Joalheria.pdf
│   └── Escopo_Joalheria.md
├── front/                     # Front-End SPA (React 19, TypeScript, Vite, Tailwind)
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── README.md
└── back/                      # Back-End REST API (Java Spring Boot, PostgreSQL)
    └── README.md
```

---

## 3. Tecnologias Empregadas

| Camada | Tecnologias Principais |
| :--- | :--- |
| **Front-End (SPA)** | React 19, Vite, TypeScript, Tailwind CSS, React Router v7, Axios, Lucide Icons |
| **Back-End (API REST)** | Java 17+, Spring Boot 3, Spring Data JPA, Spring Security (JWT), BCrypt |
| **Banco de Dados** | PostgreSQL |
| **Automação de Testes** | JUnit (Unitários), REST-assured (API) e Selenium WebDriver (E2E) |

---

## 4. Instruções de Execução

### 4.1. Front-End (`/front`)
```bash
cd front
npm install
npm run dev
```
Acesse: [http://localhost:5173](http://localhost:5173)

### 4.2. Back-End (`/back`)
*(Consulte a documentação interna em `/back/README.md` para instruções com Maven/Gradle e PostgreSQL)*

---

## 5. Roteiro dos Testes Automatizados E2E (Selenium)

Os fluxos visuais do sistema contam com atributos `data-testid` determinísticos para garantir estabilidade na execução dos testes do Selenium:

1. **Login com Sucesso:** Preenchimento de credenciais válidas e verificação de autenticação no painel.
2. **Registro de Venda com 2 Joias:** Seleção de cliente, adição de duas peças distintas no carrinho com validação de estoque e confirmação da venda.
3. **Cancelamento de Venda:** Seleção da venda registrada, acionamento do cancelamento e validação visual de status `CANCELADA` e reposição das peças.

