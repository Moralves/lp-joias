package com.lpjoias.joalheria.dto.venda;

import com.lpjoias.joalheria.domain.entity.ItemVenda;
import com.lpjoias.joalheria.dto.joia.JoiaResponse;
import java.math.BigDecimal;

public record ItemVendaResponse(
        Long id,
        Long joiaId,
        JoiaResponse joia,
        Integer quantidade,
        BigDecimal precoUnitario
) {
    public static ItemVendaResponse from(ItemVenda item) {
        return new ItemVendaResponse(
                item.getId(),
                item.getJoia().getId(),
                JoiaResponse.from(item.getJoia(), true),
                item.getQuantidade(),
                item.getPrecoUnitario()
        );
    }
}

