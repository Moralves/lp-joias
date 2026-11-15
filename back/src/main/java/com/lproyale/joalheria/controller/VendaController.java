package com.lproyale.joalheria.controller;

import com.lproyale.joalheria.dto.venda.VendaRequest;
import com.lproyale.joalheria.dto.venda.VendaResponse;
import com.lproyale.joalheria.security.UserPrincipal;
import com.lproyale.joalheria.service.VendaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendas")
@Tag(name = "Vendas (PDV)", description = "Registro transacional, consulta, edição e cancelamento de vendas com estorno")
public class VendaController {

    private final VendaService vendaService;

    public VendaController(VendaService vendaService) {
        this.vendaService = vendaService;
    }

    @GetMapping
    @Operation(summary = "Lista o histórico de vendas ordenado da mais recente para a mais antiga")
    public ResponseEntity<List<VendaResponse>> findAll() {
        return ResponseEntity.ok(vendaService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulta detalhes completos da venda com itens e totais")
    public ResponseEntity<VendaResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Registra nova venda com baixa atômica de estoque vinculada ao operador logado")
    public ResponseEntity<VendaResponse> create(
            @Valid @RequestBody VendaRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vendaService.create(request, principal.getId()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Edita cliente e itens da venda concluída com recálculo transacional de estoque")
    public ResponseEntity<VendaResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody VendaRequest request
    ) {
        return ResponseEntity.ok(vendaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancela a venda (status CANCELADA) e estorna todas as quantidades ao estoque")
    public ResponseEntity<VendaResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(vendaService.cancel(id));
    }
}

