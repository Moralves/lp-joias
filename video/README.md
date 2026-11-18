# Vídeo de Apresentação — Sistema L&P Joias

**Disciplina:** Testes de Software | Projeto N2  
**Professor:** Reinaldo de Souza Junior  
**Integrantes:** Layane Lino e Pedro Moreira  

---

## Assistir à Apresentação Completa

[![Assistir Apresentação — L&P Joias](https://img.youtube.com/vi/nqep0PnvtP4/hqdefault.jpg)](https://youtu.be/nqep0PnvtP4)

- **Link Direto (YouTube):** [https://youtu.be/nqep0PnvtP4](https://youtu.be/nqep0PnvtP4)

---

## Conteúdo Demonstrado no Vídeo

1. **Arquitetura e Banco de Dados (PostgreSQL + DBeaver + Swagger UI):**
   - Estrutura das 5 tabelas relacionais (`usuarios`, `clientes`, `joias`, `vendas` e `itens_venda`) no PostgreSQL e documentação dos endpoints REST.
2. **Demonstração do Sistema Web e Regras de Negócio:**
   - Autenticação JWT com bloqueio de operador inativo (`403 Forbidden`) e acesso de operador ativo;
   - Registro de venda na Frente de Caixa (PDV) com baixa atômica de estoque e congelamento de preço unitário;
   - Proteção cadastral de joias já comercializadas (`409 Conflict`), reposição de estoque e proteção contra auto-inativação de operador;
   - Cancelamento de venda no histórico com estorno automático das quantidades ao estoque.
3. **Execução da Pirâmide de Testes Automatizados:**
   - **Testes Unitários (12 testes):** JUnit 5 + Mockito (`.\mvnw test "-Dtest=*UnitTest"`);
   - **Testes de Integração de API (5 testes):** REST-assured (`.\mvnw test "-Dtest=*ApiTest"`);
   - **Testes End-to-End de Interface (3 testes):** Selenium WebDriver no Google Chrome (`.\mvnw test -Dtest=VendaSeleniumE2ETest`).
