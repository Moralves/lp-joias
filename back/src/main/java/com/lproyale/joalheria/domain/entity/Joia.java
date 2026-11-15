package com.lproyale.joalheria.domain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Peça do catálogo da joalheria com controle de saldo físico em loja.
 * Exclusão física permitida apenas se nunca participou de nenhuma venda;
 * caso contrário, utiliza soft delete via {@code ativo = false}.
 */
@Entity
@Table(name = "joias")
public class Joia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 60)
    private String categoria;

    @Column(nullable = false, length = 80)
    private String material;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal preco;

    @Column(name = "quantidade_estoque", nullable = false)
    private Integer quantidadeEstoque;

    @Column(nullable = false)
    private Boolean ativo = true;

    public Joia() {
    }

    public Joia(String nome, String categoria, String material, BigDecimal preco, Integer quantidadeEstoque) {
        this.nome = nome;
        this.categoria = categoria;
        this.material = material;
        this.preco = preco;
        this.quantidadeEstoque = quantidadeEstoque;
        this.ativo = true;
    }

    public void debitarEstoque(int quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade de baixa deve ser positiva.");
        }
        if (this.quantidadeEstoque < quantidade) {
            throw new IllegalStateException("Estoque insuficiente para a joia: " + this.nome);
        }
        this.quantidadeEstoque -= quantidade;
    }

    public void estornarEstoque(int quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade de estorno deve ser positiva.");
        }
        this.quantidadeEstoque += quantidade;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public Integer getQuantidadeEstoque() {
        return quantidadeEstoque;
    }

    public void setQuantidadeEstoque(Integer quantidadeEstoque) {
        this.quantidadeEstoque = quantidadeEstoque;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}

