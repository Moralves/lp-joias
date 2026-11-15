package com.lproyale.joalheria.dto.cliente;

import com.lproyale.joalheria.domain.entity.Cliente;

public record ClienteResponse(
        Long id,
        String nome,
        String cpf,
        String email,
        String telefone,
        Boolean ativo
) {
    public static ClienteResponse from(Cliente cliente) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getNome(),
                cliente.getCpf(),
                cliente.getEmail(),
                cliente.getTelefone(),
                cliente.getAtivo()
        );
    }
}

