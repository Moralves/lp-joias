package com.lproyale.joalheria.dto.venda;

import com.lproyale.joalheria.domain.entity.Venda;
import com.lproyale.joalheria.domain.enums.StatusVenda;
import com.lproyale.joalheria.dto.cliente.ClienteResponse;
import com.lproyale.joalheria.dto.usuario.UsuarioResponse;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VendaResponse(
        Long id,
        Long clienteId,
        ClienteResponse cliente,
        Long usuarioId,
        UsuarioResponse usuario,
        BigDecimal valorTotal,
        LocalDateTime dataVenda,
        StatusVenda status,
        List<ItemVendaResponse> itens
) {
    public static VendaResponse from(Venda venda) {
        return new VendaResponse(
                venda.getId(),
                venda.getCliente().getId(),
                ClienteResponse.from(venda.getCliente()),
                venda.getUsuario().getId(),
                UsuarioResponse.from(venda.getUsuario()),
                venda.getValorTotal(),
                venda.getDataVenda(),
                venda.getStatus(),
                venda.getItens().stream().map(ItemVendaResponse::from).toList()
        );
    }
}
