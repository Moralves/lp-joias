package com.lpjoias.joalheria.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(
        @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres.")
        String nome,

        @Email(message = "Formato de e-mail inválido.")
        @Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres.")
        String email,

        @Size(min = 4, max = 100, message = "A senha deve ter entre 4 e 100 caracteres.")
        String senha
) {
}

