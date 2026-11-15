package com.lproyale.joalheria.controller;

import com.lproyale.joalheria.dto.joia.*;
import com.lproyale.joalheria.service.JoiaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/joias")
@Tag(name = "Joias", description = "Catálogo de joias, controle de estoque e exclusão condicional")
public class JoiaController {

    private final JoiaService joiaService;

    public JoiaController(JoiaService joiaService) {
        this.joiaService = joiaService;
    }

    @GetMapping
    @Operation(summary = "Lista joias ativas por padrão ou todas quando ?ativo=false, com flag possuiVendas")
    public ResponseEntity<List<JoiaResponse>> findAll(@RequestParam(required = false) Boolean ativo) {
        return ResponseEntity.ok(joiaService.findAll(ativo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca joia por ID com indicador possuiVendas")
    public ResponseEntity<JoiaResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(joiaService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Cadastra nova joia com preço positivo e estoque inicial")
    public ResponseEntity<JoiaResponse> create(@Valid @RequestBody JoiaCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(joiaService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza dados da joia (retorna 409 ao alterar dados cadastrais de joia já vendida)")
    public ResponseEntity<JoiaResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody JoiaUpdateRequest request
    ) {
        return ResponseEntity.ok(joiaService.update(id, request));
    }

    @RequestMapping(value = "/{id}/estoque", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @Operation(summary = "Ajusta manualmente o saldo de estoque (permitido mesmo para joias já vendidas)")
    public ResponseEntity<JoiaResponse> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody EstoqueRequest request
    ) {
        return ResponseEntity.ok(joiaService.adjustStock(id, request.quantidadeEstoque()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclui fisicamente se sem vendas; inativa logicamente se já possui histórico de venda")
    public ResponseEntity<JoiaDeleteResponse> deleteOrInactivate(@PathVariable Long id) {
        return ResponseEntity.ok(joiaService.deleteOrInactivate(id));
    }

    @PutMapping("/{id}/reativar")
    @Operation(summary = "Reativa joia previamente inativada")
    public ResponseEntity<JoiaResponse> reactivate(@PathVariable Long id) {
        return ResponseEntity.ok(joiaService.reactivate(id));
    }
}

