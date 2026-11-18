package com.lpjoias.joalheria.dto.joia;

import com.lpjoias.joalheria.domain.entity.Joia;
import java.math.BigDecimal;

public record JoiaResponse(
        Long id,
        String nome,
        String categoria,
        String material,
        BigDecimal preco,
        Integer quantidadeEstoque,
        Boolean ativo,
        boolean possuiVendas
) {
    public static JoiaResponse from(Joia joia, boolean possuiVendas) {
        return new JoiaResponse(
                joia.getId(),
                joia.getNome(),
                joia.getCategoria(),
                joia.getMaterial(),
                joia.getPreco(),
                joia.getQuantidadeEstoque(),
                joia.getAtivo(),
                possuiVendas
        );
    }
}

