package com.lproyale.joalheria.service;

import com.lproyale.joalheria.domain.entity.Usuario;
import com.lproyale.joalheria.dto.auth.AuthResponse;
import com.lproyale.joalheria.dto.auth.LoginRequest;
import com.lproyale.joalheria.dto.usuario.UsuarioResponse;
import com.lproyale.joalheria.exception.ForbiddenException;
import com.lproyale.joalheria.exception.UnauthorizedException;
import com.lproyale.joalheria.repository.UsuarioRepository;
import com.lproyale.joalheria.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Autentica funcionários no terminal de vendas (PDV) e emite o token JWT.
 */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedException("E-mail ou senha inválidos."));

        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new UnauthorizedException("E-mail ou senha inválidos.");
        }

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new ForbiddenException("Usuário inativo não tem permissão para acessar o sistema.");
        }

        String token = jwtService.generateToken(usuario);
        return new AuthResponse(token, UsuarioResponse.from(usuario));
    }
}

