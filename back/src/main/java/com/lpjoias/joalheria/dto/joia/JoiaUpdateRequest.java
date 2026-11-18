package com.lpjoias.joalheria.dto.joia;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record JoiaUpdateRequest(
        @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres.")
        String nome,

        @Size(max = 60, message = "Categoria deve ter no máximo 60 caracteres.")
        String categoria,

        @Size(max = 80, message = "Material deve ter no máximo 80 caracteres.")
        String material,

        @DecimalMin(value = "0.01", message = "O preço da joia deve ser maior que zero.")
        BigDecimal preco,

        @Min(value = 0, message = "O estoque da joia não pode ser negativo.")
        Integer quantidadeEstoque
) {
}

