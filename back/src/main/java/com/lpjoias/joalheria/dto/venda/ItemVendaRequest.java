package com.lpjoias.joalheria.dto.venda;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ItemVendaRequest(
        @NotNull(message = "ID da joia é obrigatório.")
        Long joiaId,

        @NotNull(message = "Quantidade é obrigatória.")
        @Min(value = 1, message = "A quantidade de cada item deve ser maior que zero.")
        Integer quantidade
) {
}

