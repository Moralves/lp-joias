package com.lproyale.joalheria.unit;

import com.lproyale.joalheria.domain.entity.*;
import com.lproyale.joalheria.domain.enums.StatusVenda;
import com.lproyale.joalheria.dto.venda.ItemVendaRequest;
import com.lproyale.joalheria.dto.venda.VendaRequest;
import com.lproyale.joalheria.dto.venda.VendaResponse;
import com.lproyale.joalheria.exception.BusinessConflictException;
import com.lproyale.joalheria.exception.BusinessRuleException;
import com.lproyale.joalheria.repository.*;
import com.lproyale.joalheria.service.VendaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendaServiceUnitTest {

    @Mock
    private VendaRepository vendaRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private JoiaRepository joiaRepository;

    @InjectMocks
    private VendaService vendaService;

    @Test
    @DisplayName("Deve registrar venda, debitar estoque e calcular valorTotal corretamente")
    void deveRegistrarVendaEDebitarEstoque() {
        Usuario vendedor = new Usuario("Carlos", "carlos@lproyale.com.br", "hash");
        vendedor.setId(1L);
        Cliente cliente = new Cliente("Ana", "12345678901", "ana@email.com", "11999999999");
        cliente.setId(1L);

        Joia j1 = new Joia("Anel", "Anel", "Ouro 18k", new BigDecimal("1000.00"), 5);
        j1.setId(1L);
        Joia j2 = new Joia("Brinco", "Brinco", "Prata 925", new BigDecimal("250.00"), 4);
        j2.setId(2L);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(vendedor));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(joiaRepository.findById(1L)).thenReturn(Optional.of(j1));
        when(joiaRepository.findById(2L)).thenReturn(Optional.of(j2));
        when(vendaRepository.save(any(Venda.class))).thenAnswer(inv -> {
            Venda v = inv.getArgument(0);
            v.setId(10L);
            return v;
        });

        VendaRequest req = new VendaRequest(1L, List.of(
                new ItemVendaRequest(1L, 2),
                new ItemVendaRequest(2L, 1)
        ));

        VendaResponse res = vendaService.create(req, 1L);

        assertEquals(StatusVenda.CONCLUIDA, res.status());
        assertEquals(new BigDecimal("2250.00"), res.valorTotal());
        assertEquals(3, j1.getQuantidadeEstoque());
        assertEquals(3, j2.getQuantidadeEstoque());
    }

    @Test
    @DisplayName("Deve rejeitar venda se algum item não tiver estoque suficiente")
    void deveRejeitarVendaSemEstoque() {
        Usuario vendedor = new Usuario("Carlos", "carlos@lproyale.com.br", "hash");
        vendedor.setId(1L);
        Cliente cliente = new Cliente("Ana", "12345678901", "ana@email.com", "11999999999");
        cliente.setId(1L);
        Joia j1 = new Joia("Anel", "Anel", "Ouro 18k", new BigDecimal("1000.00"), 1);
        j1.setId(1L);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(vendedor));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(joiaRepository.findById(1L)).thenReturn(Optional.of(j1));

        VendaRequest req = new VendaRequest(1L, List.of(new ItemVendaRequest(1L, 3)));

        assertThrows(BusinessRuleException.class, () -> vendaService.create(req, 1L));
        assertEquals(1, j1.getQuantidadeEstoque());
        verify(vendaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve rejeitar mesma joia duplicada na mesma venda")
    void deveRejeitarJoiaDuplicada() {
        Usuario vendedor = new Usuario("Carlos", "carlos@lproyale.com.br", "hash");
        vendedor.setId(1L);
        Cliente cliente = new Cliente("Ana", "12345678901", "ana@email.com", "11999999999");
        cliente.setId(1L);

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(vendedor));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));

        VendaRequest req = new VendaRequest(1L, List.of(
                new ItemVendaRequest(1L, 1),
                new ItemVendaRequest(1L, 2)
        ));

        assertThrows(BusinessRuleException.class, () -> vendaService.create(req, 1L));
    }

    @Test
    @DisplayName("Deve estornar estoque ao cancelar venda e impedir segundo cancelamento")
    void deveEstornarEstoqueAoCancelarVenda() {
        Usuario vendedor = new Usuario("Carlos", "carlos@lproyale.com.br", "hash");
        vendedor.setId(1L);
        Cliente cliente = new Cliente("Ana", "12345678901", "ana@email.com", "11999999999");
        cliente.setId(1L);
        Joia joia = new Joia("Colar", "Colar", "Ouro 18k", new BigDecimal("2000.00"), 2);
        joia.setId(1L);

        Venda venda = new Venda();
        venda.setId(5L);
        venda.setCliente(cliente);
        venda.setUsuario(vendedor);
        venda.setStatus(StatusVenda.CONCLUIDA);
        venda.adicionarItem(new ItemVenda(joia, 3, joia.getPreco()));
        venda.recalcularValorTotal();

        when(vendaRepository.findWithDetailsById(5L)).thenReturn(Optional.of(venda));
        when(vendaRepository.save(any(Venda.class))).thenAnswer(inv -> inv.getArgument(0));

        VendaResponse cancelada = vendaService.cancel(5L);

        assertEquals(StatusVenda.CANCELADA, cancelada.status());
        assertEquals(5, joia.getQuantidadeEstoque());

        assertThrows(BusinessConflictException.class, () -> vendaService.cancel(5L));
    }
}

