package com.lpjoias.joalheria.dto.auth;

import com.lpjoias.joalheria.dto.usuario.UsuarioResponse;

public record AuthResponse(
        String token,
        UsuarioResponse usuario
) {
}

