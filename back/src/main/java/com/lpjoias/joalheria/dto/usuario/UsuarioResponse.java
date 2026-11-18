package com.lpjoias.joalheria.dto.usuario;

import com.lpjoias.joalheria.domain.entity.Usuario;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        Boolean ativo
) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getAtivo()
        );
    }
}

