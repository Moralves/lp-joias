package com.lpjoias.joalheria.dto.venda;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record VendaRequest(
        @NotNull(message = "Cliente é obrigatório.")
        Long clienteId,

        @NotEmpty(message = "A venda deve conter ao menos um item.")
        @Valid
        List<ItemVendaRequest> itens
) {
}

