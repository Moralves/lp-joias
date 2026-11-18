package com.lpjoias.joalheria.dto.joia;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record JoiaCreateRequest(
        @NotBlank(message = "Nome da joia é obrigatório.")
        @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres.")
        String nome,

        @NotBlank(message = "Categoria é obrigatória.")
        @Size(max = 60, message = "Categoria deve ter no máximo 60 caracteres.")
        String categoria,

        @NotBlank(message = "Material é obrigatório.")
        @Size(max = 80, message = "Material deve ter no máximo 80 caracteres.")
        String material,

        @NotNull(message = "Preço é obrigatório.")
        @DecimalMin(value = "0.01", message = "O preço da joia deve ser maior que zero.")
        BigDecimal preco,

        @NotNull(message = "Quantidade em estoque é obrigatória.")
        @Min(value = 0, message = "O estoque da joia não pode ser negativo.")
        Integer quantidadeEstoque
) {
}

