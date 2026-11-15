-- =============================================================================
-- L&P Royale - Script SQL PostgreSQL (para uso no DBeaver)
-- =============================================================================
-- Passo 1: Conectado ao banco padrão "postgres" no DBeaver, execute:
--   CREATE DATABASE lp_joias;
-- Passo 2: Conecte-se ao banco "lp_joias" e (opcionalmente) execute este script.
--   Observação: A aplicação Spring Boot também cria/atualiza as tabelas
--   automaticamente via JPA (ddl-auto: update) e popula os dados iniciais
--   via DataSeeder com senhas criptografadas em BCrypt.
-- =============================================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id      BIGSERIAL PRIMARY KEY,
    nome    VARCHAR(120) NOT NULL,
    email   VARCHAR(150) NOT NULL UNIQUE,
    senha   VARCHAR(255) NOT NULL,
    ativo   BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS clientes (
    id       BIGSERIAL PRIMARY KEY,
    nome     VARCHAR(120) NOT NULL,
    cpf      VARCHAR(11)  NOT NULL UNIQUE,
    email    VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20)  NOT NULL,
    ativo    BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_cliente_cpf_tamanho CHECK (char_length(cpf) = 11)
);

CREATE TABLE IF NOT EXISTS joias (
    id                 BIGSERIAL PRIMARY KEY,
    nome               VARCHAR(150)   NOT NULL,
    categoria          VARCHAR(60)    NOT NULL,
    material           VARCHAR(80)    NOT NULL,
    preco              NUMERIC(12, 2) NOT NULL,
    quantidade_estoque INTEGER        NOT NULL,
    ativo              BOOLEAN        NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_joia_preco_positivo CHECK (preco > 0),
    CONSTRAINT chk_joia_estoque_nao_negativo CHECK (quantidade_estoque >= 0)
);

CREATE TABLE IF NOT EXISTS vendas (
    id          BIGSERIAL PRIMARY KEY,
    cliente_id  BIGINT         NOT NULL REFERENCES clientes (id),
    usuario_id  BIGINT         NOT NULL REFERENCES usuarios (id),
    valor_total NUMERIC(12, 2) NOT NULL,
    data_venda  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(20)    NOT NULL DEFAULT 'CONCLUIDA',
    CONSTRAINT chk_venda_status CHECK (status IN ('CONCLUIDA', 'CANCELADA')),
    CONSTRAINT chk_venda_valor_nao_negativo CHECK (valor_total >= 0)
);

CREATE TABLE IF NOT EXISTS itens_venda (
    id             BIGSERIAL PRIMARY KEY,
    venda_id       BIGINT         NOT NULL REFERENCES vendas (id) ON DELETE CASCADE,
    joia_id        BIGINT         NOT NULL REFERENCES joias (id),
    quantidade     INTEGER        NOT NULL,
    preco_unitario NUMERIC(12, 2) NOT NULL,
    CONSTRAINT uk_item_venda_joia UNIQUE (venda_id, joia_id),
    CONSTRAINT chk_item_quantidade_positiva CHECK (quantidade > 0),
    CONSTRAINT chk_item_preco_positivo CHECK (preco_unitario > 0)
);

-- Índices auxiliares para consultas frequentes de listagem e histórico
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios (ativo);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes (ativo);
CREATE INDEX IF NOT EXISTS idx_joias_ativo ON joias (ativo);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas (data_venda DESC);
CREATE INDEX IF NOT EXISTS idx_itens_venda_joia ON itens_venda (joia_id);

