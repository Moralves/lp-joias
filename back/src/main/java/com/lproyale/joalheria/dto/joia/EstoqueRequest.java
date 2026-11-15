package com.lproyale.joalheria.dto.joia;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record EstoqueRequest(
        @NotNull(message = "Quantidade em estoque é obrigatória.")
        @Min(value = 0, message = "O estoque da joia não pode ser negativo.")
        Integer quantidadeEstoque
) {
}

