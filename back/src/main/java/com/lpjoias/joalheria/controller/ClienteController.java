package com.lpjoias.joalheria.controller;

import com.lpjoias.joalheria.dto.cliente.ClienteRequest;
import com.lpjoias.joalheria.dto.cliente.ClienteResponse;
import com.lpjoias.joalheria.dto.cliente.ClienteUpdateRequest;
import com.lpjoias.joalheria.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@Tag(name = "Clientes", description = "CRUD completo de clientes com validação de CPF único e soft delete")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    @Operation(summary = "Lista clientes ativos por padrão ou todos quando ?ativo=false")
    public ResponseEntity<List<ClienteResponse>> findAll(@RequestParam(required = false) Boolean ativo) {
        return ResponseEntity.ok(clienteService.findAll(ativo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca cliente por ID")
    public ResponseEntity<ClienteResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Cadastra novo cliente validando CPF (11 dígitos) e e-mail únicos")
    public ResponseEntity<ClienteResponse> create(@Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza dados cadastrais do cliente")
    public ResponseEntity<ClienteResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ClienteUpdateRequest request
    ) {
        return ResponseEntity.ok(clienteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativa logicamente o cliente preservando o histórico de vendas")
    public ResponseEntity<Void> inactivate(@PathVariable Long id) {
        clienteService.inactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reativar")
    @Operation(summary = "Reativa cliente inativo para novas compras")
    public ResponseEntity<ClienteResponse> reactivate(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.reactivate(id));
    }
}

