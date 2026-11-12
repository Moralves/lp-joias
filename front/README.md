# L&P Royale — Joalheria &bull; Front-End SPA

**Disciplina:** Testes de Software | Projeto N2 | Prof. Reinaldo Jr  
**Integrantes:** Mor e Mor  
**Entrega:** 18/11/2026 às 18:00h (Apresentação Prática no mesmo dia)  

---

## 1. Visão Geral e Proposta

O **L&P Royale** é um sistema web local de alta performance, desenvolvido para gerenciar as operações de balcão e retaguarda de uma joalheria. O sistema foi concebido com foco na experiência do usuário (UI/UX limpa, moderna e responsiva) e, primordialmente, na **testabilidade automatizada com Selenium**.

O front-end é uma **Single Page Application (SPA)** desacoplada, projetada para se comunicar com a API REST em Spring Boot (`/back`), contando também com um adaptador de simulação local para validação autônoma.

---

## 2. Tecnologias Utilizadas

| Camada / Recurso | Tecnologia | Justificativa Técnica |
| :--- | :--- | :--- |
| **Framework & Runtime** | **React 19 + TypeScript** | Tipagem estrita de contratos de dados, componentes funcionais e renderização rápida. |
| **Build Tool** | **Vite** | Inicialização em milissegundos e build otimizado para produção. |
| **Estilização** | **Tailwind CSS** | Design system sob medida para alta joalheria, com contrastes elegantes e foco operacional. |
| **Roteamento** | **React Router DOM v7** | Rotas protegidas via guarda de autenticação (`PrivateRoute`) e histórico limpo. |
| **Comunicação HTTP** | **Axios com Interceptors** | Injeção transparente de token JWT (`Bearer`) e tratamento de erros 401 e 409. |
| **Ícones** | **Lucide React** | Biblioteca vetorial leve e semanticamente consistente. |
| **Testes E2E** | **Selenium WebDriver** | Atributos semânticos `data-testid` presentes em todos os fluxos críticos. |

---

## 3. Arquitetura de Seletores para Testes Selenium (E2E)

Conforme os requisitos da avaliação de **Testes de Software**, os três cenários mandatórios de E2E possuem seletores dedicados e imutáveis:

### Cenário 1: Login com Sucesso
1. Preencher campo de e-mail: `[data-testid="input-email"]`
2. Preencher campo de senha: `[data-testid="input-senha"]`
3. Clicar no botão de login: `[data-testid="btn-login"]`
4. Validar redirecionamento e nome no cabeçalho: `[data-testid="user-name"]`

### Cenário 2: Registrar Venda com Duas Joias
1. Acessar tela de PDV: `[data-testid="nav-pdv"]`
2. Selecionar cliente ativo: `[data-testid="select-cliente"]`
3. Clicar no botão adicionar da 1ª joia: `[data-testid="btn-add-joia-1"]`
4. Clicar no botão adicionar da 2ª joia: `[data-testid="btn-add-joia-2"]`
5. Conferir itens no carrinho: `[data-testid="cart-item-1"]` e `[data-testid="cart-item-2"]`
6. Clicar em finalizar: `[data-testid="btn-confirmar-venda"]`
7. Validar mensagem de sucesso: `[data-testid="toast-message"]`

### Cenário 3: Cancelamento de Venda pela Tela
1. Acessar histórico de vendas: `[data-testid="nav-vendas"]`
2. Identificar a linha da venda: `[data-testid="row-venda-{id}"]`
3. Clicar no botão de cancelamento: `[data-testid="btn-cancelar-venda-{id}"]`
4. Confirmar diálogo de cancelamento
5. Validar alteração imediata da badge de status: `[data-testid="status-venda-{id}"]` (exibindo `CANCELADA`)

---

## 4. Modos de Operação (Dual-Mode Engine)

No canto superior direito da aplicação, há um alternador de conexão:

1. **Modo API Spring Boot (Padrão de Produção):**
   - Comunica-se com o backend via proxy reverso em `/api` apontando para `http://localhost:8080`.
   - Requer Spring Boot ativo com banco PostgreSQL.

2. **Modo Local (Simulação de Negócio):**
   - Ativado automaticamente caso o backend esteja temporariamente offline ou acionado manualmente no botão do cabeçalho.
   - Aplica com rigor as **26 regras de negócio** do escopo (inclusive rejeição de 409 em joias vendidas e proibição de auto-inativação de usuários).
   - Ideal para gravação ágil do vídeo de 5 minutos e demonstração sem dependência externa.

---

## 5. Instruções de Execução

### Pré-requisitos
- Node.js versão 20 ou superior
- npm versão 10 ou superior

### Passo a Passo

1. **Navegar até a pasta do front-end:**
   ```bash
   cd front
   ```

2. **Instalar dependências (caso seja clonado do GitHub):**
   ```bash
   npm install
   ```

3. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em: `http://localhost:5173`

4. **Gerar build de produção (para validação do TypeScript):**
   ```bash
   npm run build
   ```

---

## 6. Credenciais de Teste Pré-cadastradas

Para agilizar os testes manuais e a gravação da apresentação:

| E-mail | Senha | Perfil | Status |
| :--- | :--- | :--- | :--- |
| `carlos@lproyale.com.br` | `123456` | Vendedor / Caixa | **Ativo** (Acesso liberado) |
| `marina@lproyale.com.br` | `123456` | Administradora | **Ativo** (Acesso liberado) |
| `lucas@lproyale.com.br` | `123456` | Antigo Operador | **Inativo** (Bloqueado por Regra 9) |

*(Nota: O sistema de autenticação local também aceita `@aurea.com.br` como alias retrocompatível)*
