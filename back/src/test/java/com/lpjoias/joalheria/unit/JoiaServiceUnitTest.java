package com.lpjoias.joalheria.unit;

import com.lpjoias.joalheria.domain.entity.Joia;
import com.lpjoias.joalheria.dto.joia.*;
import com.lpjoias.joalheria.exception.BusinessConflictException;
import com.lpjoias.joalheria.exception.BusinessRuleException;
import com.lpjoias.joalheria.repository.ItemVendaRepository;
import com.lpjoias.joalheria.repository.JoiaRepository;
import com.lpjoias.joalheria.service.JoiaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JoiaServiceUnitTest {

    @Mock
    private JoiaRepository joiaRepository;

    @Mock
    private ItemVendaRepository itemVendaRepository;

    @InjectMocks
    private JoiaService joiaService;

    @Test
    @DisplayName("Deve bloquear criação de joia com preço menor ou igual a zero")
    void deveBloquearPrecoNaoPositivo() {
        JoiaCreateRequest req = new JoiaCreateRequest("Anel Teste", "Anel", "Ouro 18k", BigDecimal.ZERO, 5);

        assertThrows(BusinessRuleException.class, () -> joiaService.create(req));
        verify(joiaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve bloquear edição cadastral (409) quando joia já participou de venda")
    void deveBloquearEdicaoCadastralDeJoiaVendida() {
        Joia joia = new Joia("Anel Solitário", "Anel", "Ouro 18k", new BigDecimal("2450.00"), 6);
        joia.setId(1L);

        when(joiaRepository.findById(1L)).thenReturn(Optional.of(joia));
        when(itemVendaRepository.existsByJoiaId(1L)).thenReturn(true);

        JoiaUpdateRequest req = new JoiaUpdateRequest("Anel Alterado", "Anel", "Ouro 18k", new BigDecimal("2500.00"), null);

        assertThrows(BusinessConflictException.class, () -> joiaService.update(1L, req));
        verify(joiaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve permitir reposição de estoque mesmo quando joia já participou de venda")
    void devePermitirReposicaoDeEstoqueEmJoiaVendida() {
        Joia joia = new Joia("Anel Solitário", "Anel", "Ouro 18k", new BigDecimal("2450.00"), 2);
        joia.setId(1L);

        when(joiaRepository.findById(1L)).thenReturn(Optional.of(joia));
        when(itemVendaRepository.existsByJoiaId(1L)).thenReturn(true);
        when(joiaRepository.save(any(Joia.class))).thenAnswer(inv -> inv.getArgument(0));

        JoiaResponse res = joiaService.update(1L, new JoiaUpdateRequest(null, null, null, null, 15));

        assertEquals(15, res.quantidadeEstoque());
        assertTrue(res.possuiVendas());
    }

    @Test
    @DisplayName("Deve excluir fisicamente joia sem histórico de vendas")
    void deveExcluirFisicamenteJoiaSemVendas() {
        Joia joia = new Joia("Brinco Novo", "Brinco", "Prata 925", new BigDecimal("420.00"), 10);
        joia.setId(3L);

        when(joiaRepository.findById(3L)).thenReturn(Optional.of(joia));
        when(itemVendaRepository.existsByJoiaId(3L)).thenReturn(false);

        JoiaDeleteResponse res = joiaService.deleteOrInactivate(3L);

        assertTrue(res.deleted());
        assertFalse(res.inactivated());
        verify(joiaRepository).delete(joia);
    }

    @Test
    @DisplayName("Deve apenas inativar logicamente joia que já participou de vendas")
    void deveInativarLogicamenteJoiaComVendas() {
        Joia joia = new Joia("Colar Riviera", "Colar", "Ouro Branco", new BigDecimal("4890.00"), 3);
        joia.setId(2L);

        when(joiaRepository.findById(2L)).thenReturn(Optional.of(joia));
        when(itemVendaRepository.existsByJoiaId(2L)).thenReturn(true);

        JoiaDeleteResponse res = joiaService.deleteOrInactivate(2L);

        assertFalse(res.deleted());
        assertTrue(res.inactivated());
        assertFalse(joia.getAtivo());
        verify(joiaRepository).save(joia);
        verify(joiaRepository, never()).delete(any());
    }
}

