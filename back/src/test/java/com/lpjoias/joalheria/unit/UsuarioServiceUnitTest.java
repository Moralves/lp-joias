package com.lpjoias.joalheria.unit;

import com.lpjoias.joalheria.domain.entity.Usuario;
import com.lpjoias.joalheria.dto.usuario.UsuarioCreateRequest;
import com.lpjoias.joalheria.dto.usuario.UsuarioResponse;
import com.lpjoias.joalheria.exception.BusinessConflictException;
import com.lpjoias.joalheria.repository.UsuarioRepository;
import com.lpjoias.joalheria.service.UsuarioService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceUnitTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    @DisplayName("Deve proibir que usuário logado inative a si mesmo (409 Conflict)")
    void deveBloquearAutoInativacao() {
        assertThrows(BusinessConflictException.class, () -> usuarioService.inactivate(1L, 1L));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve bloquear cadastro de usuário com e-mail já existente")
    void deveBloquearEmailDuplicado() {
        when(usuarioRepository.existsByEmailIgnoreCase("carlos@lpjoias.com.br")).thenReturn(true);

        UsuarioCreateRequest req = new UsuarioCreateRequest("Carlos", "carlos@lpjoias.com.br", "123456");

        assertThrows(BusinessConflictException.class, () -> usuarioService.create(req));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve reativar usuário inativo e bloquear reativação se já estiver ativo")
    void deveReativarUsuarioInativoEBloquearSeJaAtivo() {
        Usuario lucas = new Usuario("Lucas", "lucas@lpjoias.com.br", "hash");
        lucas.setId(3L);
        lucas.setAtivo(false);

        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(lucas));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        UsuarioResponse reativado = usuarioService.reactivate(3L);
        assertTrue(reativado.ativo());

        assertThrows(BusinessConflictException.class, () -> usuarioService.reactivate(3L));
    }
}

