package com.lproyale.joalheria.dto.auth;

import com.lproyale.joalheria.dto.usuario.UsuarioResponse;

public record AuthResponse(
        String token,
        UsuarioResponse usuario
) {
}

