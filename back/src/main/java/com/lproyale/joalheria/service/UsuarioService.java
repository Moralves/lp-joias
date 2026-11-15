package com.lproyale.joalheria.service;

import com.lproyale.joalheria.domain.entity.Usuario;
import com.lproyale.joalheria.dto.usuario.UsuarioCreateRequest;
import com.lproyale.joalheria.dto.usuario.UsuarioResponse;
import com.lproyale.joalheria.dto.usuario.UsuarioUpdateRequest;
import com.lproyale.joalheria.exception.BusinessConflictException;
import com.lproyale.joalheria.exception.ResourceNotFoundException;
import com.lproyale.joalheria.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> findAll(Boolean ativo) {
        List<Usuario> usuarios = Boolean.FALSE.equals(ativo)
                ? usuarioRepository.findAllByOrderByIdAsc()
                : usuarioRepository.findByAtivoTrueOrderByIdAsc();
        return usuarios.stream().map(UsuarioResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse findById(Long id) {
        return UsuarioResponse.from(findEntityById(id));
    }

    @Transactional
    public UsuarioResponse create(UsuarioCreateRequest request) {
        String emailNormalized = request.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(emailNormalized)) {
            throw new BusinessConflictException("Já existe um usuário cadastrado com este e-mail.");
        }

        Usuario usuario = new Usuario(
                request.nome().trim(),
                emailNormalized,
                passwordEncoder.encode(request.senha())
        );
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse update(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = findEntityById(id);

        if (request.email() != null && !request.email().isBlank()) {
            String emailNormalized = request.email().trim().toLowerCase();
            if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(emailNormalized, id)) {
                throw new BusinessConflictException("Já existe um usuário cadastrado com este e-mail.");
            }
            usuario.setEmail(emailNormalized);
        }

        if (request.nome() != null && !request.nome().isBlank()) {
            usuario.setNome(request.nome().trim());
        }

        if (request.senha() != null && !request.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.senha()));
        }

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public void inactivate(Long id, Long authenticatedUserId) {
        if (authenticatedUserId != null && authenticatedUserId.equals(id)) {
            throw new BusinessConflictException("Não é permitido inativar o próprio usuário atualmente autenticado.");
        }
        Usuario usuario = findEntityById(id);
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public UsuarioResponse reactivate(Long id) {
        Usuario usuario = findEntityById(id);
        if (Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new BusinessConflictException("O usuário já está ativo.");
        }
        usuario.setAtivo(true);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    private Usuario findEntityById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }
}

