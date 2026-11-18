package com.lpjoias.joalheria.dto.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record ClienteUpdateRequest(
        @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres.")
        String nome,

        String cpf,

        @Email(message = "Formato de e-mail inválido.")
        @Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres.")
        String email,

        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres.")
        String telefone
) {
}

