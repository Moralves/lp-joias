package com.lproyale.joalheria.controller;

import com.lproyale.joalheria.dto.usuario.UsuarioCreateRequest;
import com.lproyale.joalheria.dto.usuario.UsuarioResponse;
import com.lproyale.joalheria.dto.usuario.UsuarioUpdateRequest;
import com.lproyale.joalheria.security.UserPrincipal;
import com.lproyale.joalheria.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuários", description = "Gestão de funcionários/operadores com soft delete e proteção de auto-inativação")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @Operation(summary = "Lista usuários ativos por padrão ou todos quando ?ativo=false")
    public ResponseEntity<List<UsuarioResponse>> findAll(@RequestParam(required = false) Boolean ativo) {
        return ResponseEntity.ok(usuarioService.findAll(ativo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca usuário por ID")
    public ResponseEntity<UsuarioResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Cadastra novo usuário com senha criptografada em BCrypt")
    public ResponseEntity<UsuarioResponse> create(@Valid @RequestBody UsuarioCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza dados cadastrais do usuário")
    public ResponseEntity<UsuarioResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateRequest request
    ) {
        return ResponseEntity.ok(usuarioService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativa logicamente o usuário (retorna 409 se tentar se auto-inativar)")
    public ResponseEntity<Void> inactivate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        usuarioService.inactivate(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reativar")
    @Operation(summary = "Reativa usuário previamente inativado")
    public ResponseEntity<UsuarioResponse> reactivate(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.reactivate(id));
    }
}

