package com.lpjoias.joalheria.domain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(
        name = "itens_venda",
        uniqueConstraints = @UniqueConstraint(name = "uk_item_venda_joia", columnNames = {"venda_id", "joia_id"})
)
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "venda_id", nullable = false)
    private Venda venda;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "joia_id", nullable = false)
    private Joia joia;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precoUnitario;

    public ItemVenda() {
    }

    public ItemVenda(Joia joia, Integer quantidade, BigDecimal precoUnitario) {
        this.joia = joia;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    public BigDecimal getSubtotal() {
        return precoUnitario.multiply(BigDecimal.valueOf(quantidade));
    }

    public Long getId() {
        return id;
    }

    public void setVenda(Venda venda) {
        this.venda = venda;
    }

    public Joia getJoia() {
        return joia;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }
}

