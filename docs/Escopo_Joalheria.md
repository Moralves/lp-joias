# Escopo do Projeto — Sistema de Vendas de Joalheria (L&P Royale)

**Disciplina:** Testes de Software | Projeto N2 | Prof. Reinaldo Jr  
**Integrantes:** Mor e Mor  
**Entrega:** 18/11/2026 às 18h (Apresentação no mesmo dia)  

---

## 1. Proposta
Sistema web local para gerenciamento de uma joalheria, utilizado pelos funcionários na loja física. Permite:
- Cadastrar e gerenciar joias e clientes;
- Controlar o estoque de peças;
- Registrar, editar e cancelar vendas com múltiplos itens, sempre por um funcionário autenticado;
- Exclusão lógica (*soft delete*) para usuários, clientes e vendas (nunca são apagados do banco);
- Exclusão física para joias apenas se **nunca** participaram de uma venda.

> **Foco do Projeto:** Automação de testes de software (testes unitários, de API e E2E) aplicada a um sistema Full Stack simples, robusto e funcional.

---

## 2. Perfis e Funcionamento

- **Usuário:** Funcionário da joalheria (vendedor ou administrador). Realiza login e opera o sistema.
- **Cliente:** Cadastro do comprador na loja física. Não possui acesso direto ao sistema.
- **Venda:** Operação de caixa realizada pelo funcionário logado; pode conter múltiplos itens distintos.
- **ItemVenda:** Associação de cada joia incluída na venda com a quantidade negociada e o preço unitário praticado na época.

### Fluxo Operacional da Venda (PDV)
1. O funcionário faz login no sistema.
2. O cliente escolhe uma ou mais joias na loja.
3. O funcionário acessa a tela de venda, seleciona o cliente e adiciona as joias e suas respectivas quantidades.
4. O funcionário confirma a venda.
5. O sistema valida a disponibilidade de estoque de todos os itens, debita o estoque, calcula o valor total e persiste a venda vinculada ao vendedor logado.
6. Em caso de necessidade posterior, o funcionário edita os itens da venda ou realiza o cancelamento; o estoque é reajustado em conformidade.

---

## 3. Funcionalidades e Requisitos por Módulo

Todas as entidades possuem CRUD completo. Listagens mostram registros ativos por padrão e aceitam filtro (`?ativo=false`) para exibir registros inativos, possibilitando sua reativação.

### 3.1. Autenticação e Usuários (CRUD)
- **Login:** Autenticação via e-mail e senha. Todas as rotas do sistema (exceto login) exigem token JWT.
- **CRUD:** Cadastro, listagem, busca por ID, edição, inativação e reativação.
- **Regras:**
  - Usuário inativo não consegue efetuar login.
  - Um usuário **não pode inativar a si mesmo** (validação via ID do token JWT vs. ID da requisição; retorno de erro HTTP 409).
  - Reativação restabelece o acesso ao sistema.

### 3.2. Catálogo de Joias (CRUD & Estoque)
- **Cadastro:** Dados cadastrais (nome, categoria, material, preço) e quantidade inicial em estoque.
- **Listagem e Busca:** Retorna o indicador `possuiVendas` (calculado em tempo de execução).
- **Regras de Edição e Exclusão:**
  - *Joia sem vendas:* Pode ser editada livremente e excluída em definitivo do banco de dados (DELETE físico).
  - *Joia com histórico de vendas (mesmo canceladas):* Bloqueio de alteração cadastral (nome, categoria, material, preço retornam HTTP 409 em PUT) e bloqueio de exclusão física (DELETE executa inativação lógica).
  - *Ajuste de Estoque:* Permitido mesmo para joias com histórico de vendas (reposição de estoque).
  - *Inativação/Reativação:* Joia inativa não é listada na venda nem permite novas vendas; joia reativada volta a ficar disponível.

### 3.3. Clientes (CRUD)
- **Cadastro e Gestão:** Nome, CPF (11 dígitos, único), e-mail (único e válido), telefone.
- **Inativação:** Cliente inativo deixa a listagem padrão e não pode receber novas vendas. Suas vendas anteriores permanecem íntegras.
- **Reativação:** Permite retorno à listagem ativa e novas operações de venda.

### 3.4. Vendas e Caixa (CRUD & Gestão de Itens)
- **Registro de Venda:** Seleção de cliente ativo e adição de uma lista de joias ativas com estoque.
- **Regras de Negócio da Venda:**
  - Venda deve ter ao menos 1 item.
  - A mesma joia não pode ser adicionada em duplicidade na mesma venda (deve-se incrementar a quantidade).
  - Validação transacional de estoque: se qualquer item exceder a quantidade disponível, toda a venda é rejeitada sem debitar estoque.
  - O preço unitário do item é fixado no momento da venda (`precoUnitario`).
  - `valorTotal`, `dataVenda`, `status` (`CONCLUIDA`) e `usuario` (vendedor) são atribuídos pelo backend via token JWT.
- **Edição da Venda:**
  - Possível trocar o cliente e modificar itens (inserir, remover ou alterar quantidades).
  - Atualização atômica/transacional de estoque: reverte quantidades anteriores, valida e debita as novas. Itens mantidos preservam o `precoUnitario` original; novos itens utilizam o preço vigente da joia.
  - Falha na validação mantém o estado anterior inalterado.
- **Cancelamento de Venda:**
  - Ação de exclusão altera o status para `CANCELADA` e estorna todo o estoque dos itens.
  - Venda cancelada não pode ser reativada nem editada.

---

## 4. Fora de Escopo
- E-commerce voltado para autoatendimento do cliente final;
- Exclusão física definitiva de usuários, clientes ou vendas;
- Reativação de vendas canceladas;
- Módulo de relatórios analíticos avançados ou BI;
- Upload e armazenamento de imagens de produtos;
- Sistema granular de permissões/RBAC (todos os funcionários autenticados operam o sistema);
- Gateway de pagamento integrado (maquininha de cartão / TEF / Pix automatizado);
- Emissão de Nota Fiscal (NF-e/NFC-e).

---

## 5. Modelo de Dados

### 5.1. Entidades e Atributos

| Entidade | Atributo | Tipo | Restrições / Observações |
| :--- | :--- | :--- | :--- |
| **Usuario** | `id` | Long | PK autoincremento |
| | `nome` | String | Obrigatório |
| | `email` | String | Obrigatório, formato único |
| | `senha` | String | Obrigatório, hash BCrypt no back |
| | `ativo` | Boolean | Padrão `true`; `false` ao inativar |
| **Cliente** | `id` | Long | PK autoincremento |
| | `nome` | String | Obrigatório |
| | `cpf` | String | Obrigatório, único, 11 dígitos numéricos |
| | `email` | String | Obrigatório, único, formato válido |
| | `telefone` | String | Obrigatório |
| | `ativo` | Boolean | Padrão `true`; `false` ao inativar |
| **Joia** | `id` | Long | PK autoincremento |
| | `nome` | String | Obrigatório |
| | `categoria` | String | Obrigatório (anel, colar, brinco, pulseira...) |
| | `material` | String | Obrigatório (ouro 18k, prata 925...) |
| | `preco` | BigDecimal | Obrigatório, > 0 |
| | `quantidadeEstoque`| Integer | Obrigatório, ≥ 0 |
| | `ativo` | Boolean | Padrão `true`; `false` ao inativar |
| | `possuiVendas` | Boolean | Calculado pelo backend em tempo de execução |
| **Venda** | `id` | Long | PK autoincremento |
| | `cliente` | FK (Cliente)| Obrigatório, cliente deve existir e estar ativo |
| | `usuario` | FK (Usuario)| Obrigatório, extraído do token JWT |
| | `valorTotal` | BigDecimal | Calculado pelo backend (somatório dos itens) |
| | `dataVenda` | LocalDateTime | Preenchido automaticamente no registro |
| | `status` | String | `CONCLUIDA` (padrão) ou `CANCELADA` |
| **ItemVenda**| `id` | Long | PK autoincremento |
| | `venda` | FK (Venda) | Venda proprietária do item |
| | `joia` | FK (Joia) | Obrigatório, joia deve existir e estar ativa |
| | `quantidade` | Integer | Obrigatório, > 0 |
| | `precoUnitario` | BigDecimal | Registrado pelo backend com o preço no ato da venda |

### 5.2. Relacionamentos
- `Usuario (1) ── (N) Venda`
- `Cliente (1) ── (N) Venda`
- `Venda   (1) ── (N) ItemVenda`
- `Joia    (1) ── (N) ItemVenda`

---

## 6. Tabela de Matriz Operacional por Entidade

| Entidade | Criar | Listar | Buscar por ID | Editar | Excluir | Regra Especial |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Usuario** | Sim | Sim | Sim | Sim | Inativação | Reativação; Bloqueio de auto-inativação (409) |
| **Cliente** | Sim | Sim | Sim | Sim | Inativação | Reativação |
| **Joia** | Sim | Sim | Sim | Apenas se `!possuiVendas` | Exclusão física (sem vendas) ou Inativação (com vendas) | Reposição de estoque permitida sempre; Reativação |
| **Venda** | Sim | Sim | Sim | Sim | Cancelamento (status `CANCELADA`) | Baixa/estorno automático de estoque |
| **ItemVenda**| Aninhado na Venda | Aninhado na Venda | Aninhado na Venda | Aninhado na Venda | Aninhado na Venda | Gerenciado de forma atômica no payload da Venda |

---

## 7. Arquitetura e Contrato de Integração (API REST)

- **Backend:** Java Spring Boot (REST)
- **Banco de Dados:** PostgreSQL
- **Frontend:** SPA (Single Page Application)
- **Estrutura de Pastas do Repositório:** `/back` e `/front`

### Principais Endpoints

| Módulo | Método | Endpoint | Comportamento / Regras |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Retorna token JWT e dados do usuário logado |
| **Usuários** | `GET` | `/api/usuarios` | Lista usuários ativos (suporta `?ativo=false`) |
| | `POST` | `/api/usuarios` | Cria usuário |
| | `GET` | `/api/usuarios/{id}` | Busca por ID |
| | `PUT` | `/api/usuarios/{id}` | Atualiza dados cadastrais |
| | `DELETE` | `/api/usuarios/{id}` | Inativa usuário (409 se tentar se auto-inativar) |
| | `PUT` | `/api/usuarios/{id}/reativar`| Reativa usuário inativo |
| **Joias** | `GET` | `/api/joias` | Lista joias ativas (suporta `?ativo=false`) |
| | `POST` | `/api/joias` | Cadastra joia com estoque inicial |
| | `GET` | `/api/joias/{id}` | Busca joia por ID com flag `possuiVendas` |
| | `PUT` | `/api/joias/{id}` | Edita dados cadastrais (Retorna 409 se já participou de venda) |
| | `DELETE` | `/api/joias/{id}` | Exclui fisicamente se sem vendas; Inativa se já vendida |
| | `PUT` | `/api/joias/{id}/reativar` | Reativa joia inativa |
| | `PATCH/PUT`| `/api/joias/{id}/estoque` | Ajuste manual/reposição de estoque |
| **Clientes** | `GET` | `/api/clientes` | Lista clientes ativos (suporta `?ativo=false`) |
| | `POST` | `/api/clientes` | Cadastra cliente (validação CPF/e-mail únicos) |
| | `GET` | `/api/clientes/{id}` | Detalhes do cliente |
| | `PUT` | `/api/clientes/{id}` | Atualiza dados cadastrais |
| | `DELETE` | `/api/clientes/{id}` | Inativa cliente |
| | `PUT` | `/api/clientes/{id}/reativar`| Reativa cliente |
| **Vendas** | `GET` | `/api/vendas` | Lista histórico de vendas |
| | `POST` | `/api/vendas` | Registra venda com payload simplificado |
| | `GET` | `/api/vendas/{id}` | Detalhes da venda com itens e totais |
| | `PUT` | `/api/vendas/{id}` | Edição integral de itens/cliente da venda |
| | `DELETE` | `/api/vendas/{id}` | Cancela a venda e devolve estoque |

#### Payload de Registro e Edição de Venda:
```json
{
  "clienteId": 1,
  "itens": [
    { "joiaId": 3, "quantidade": 1 },
    { "joiaId": 7, "quantidade": 2 }
  ]
}
```

---

## 8. Cobertura de Testes Automatizados (Foco Avaliativo)

| Nível | Framework | Mínimo | Cenários Chave Obrigatórios |
| :--- | :--- | :---: | :--- |
| **Unitário** | JUnit | 3 | Validação de baixa/estorno de estoque; rejeição de venda sem estoque; bloqueio de preço negativo; bloqueio de edição cadastral de joia vendida; exclusão condicional física vs lógica; auto-inativação proibida. |
| **API** | REST-assured | 2 | Fluxo de token JWT; registro de venda com checagem de estoque pós-baixa; cancelamento com estorno verificado; regras de 409 em joia vendida e auto-inativação; ciclo inativação e reativação de cliente. |
| **E2E** | Selenium | 2 | **1.** Login com sucesso no frontend SPA.<br>**2.** Registro completo de venda com 2 joias pela interface com sucesso.<br>**3.** Cancelamento de venda pela interface gráfica com atualização visual de status e estoque. |

---

## 9. Entregáveis e Prazos

1. **Repositório GitHub Público:** Estrutura organizada em pastas `/back` e `/front`, contendo README detalhado com instruções de compilação, execução e setup do banco.
2. **Vídeo Demonstrativo:** Máximo de 5 minutos exibindo o sistema em funcionamento real e a execução dos testes automatizados (JUnit, REST-assured e Selenium).
3. **Data Limite:** 18/11/2026 às 18:00h no Google Classroom, seguido da apresentação prática.

