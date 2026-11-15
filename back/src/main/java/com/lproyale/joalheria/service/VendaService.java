package com.lproyale.joalheria.service;

import com.lproyale.joalheria.domain.entity.*;
import com.lproyale.joalheria.domain.enums.StatusVenda;
import com.lproyale.joalheria.dto.venda.ItemVendaRequest;
import com.lproyale.joalheria.dto.venda.VendaRequest;
import com.lproyale.joalheria.dto.venda.VendaResponse;
import com.lproyale.joalheria.exception.BusinessConflictException;
import com.lproyale.joalheria.exception.BusinessRuleException;
import com.lproyale.joalheria.exception.ResourceNotFoundException;
import com.lproyale.joalheria.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Regras transacionais do PDV (Frente de Caixa):
 * validação atômica de estoque, baixa/estorno automático, congelamento de preço unitário
 * e edição integral de vendas concluídas.
 */
@Service
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final JoiaRepository joiaRepository;

    public VendaService(
            VendaRepository vendaRepository,
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository,
            JoiaRepository joiaRepository
    ) {
        this.vendaRepository = vendaRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.joiaRepository = joiaRepository;
    }

    @Transactional(readOnly = true)
    public List<VendaResponse> findAll() {
        return vendaRepository.findAllByOrderByIdDesc().stream()
                .map(VendaResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public VendaResponse findById(Long id) {
        return VendaResponse.from(findDetailsOrThrow(id));
    }

    @Transactional
    public VendaResponse create(VendaRequest request, Long usuarioId) {
        Usuario vendedor = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Operador vendedor não encontrado."));
        if (!Boolean.TRUE.equals(vendedor.getAtivo())) {
            throw new BusinessRuleException("Operador inativo não pode registrar vendas.");
        }

        Cliente cliente = findActiveClienteOrThrow(request.clienteId());
        validateItensRequest(request.itens());

        Venda venda = new Venda();
        venda.setCliente(cliente);
        venda.setUsuario(vendedor);
        venda.setDataVenda(LocalDateTime.now());
        venda.setStatus(StatusVenda.CONCLUIDA);

        applyItemsAndDebitStock(venda, request.itens(), Map.of());
        venda.recalcularValorTotal();

        Venda saved = vendaRepository.save(venda);
        return VendaResponse.from(saved);
    }

    @Transactional
    public VendaResponse update(Long id, VendaRequest request) {
        Venda venda = findDetailsOrThrow(id);
        if (venda.getStatus() == StatusVenda.CANCELADA) {
            throw new BusinessConflictException("Venda cancelada não pode ser editada.");
        }

        Cliente novoCliente = findActiveClienteOrThrow(request.clienteId());
        validateItensRequest(request.itens());

        // Preserva o preço unitário praticado para itens que permanecerem na venda
        Map<Long, BigDecimal> precosOriginais = new HashMap<>();
        for (ItemVenda itemAntigo : venda.getItens()) {
            precosOriginais.put(itemAntigo.getJoia().getId(), itemAntigo.getPrecoUnitario());
            itemAntigo.getJoia().estornarEstoque(itemAntigo.getQuantidade());
        }

        // Remove os itens antigos e força flush para evitar violação de UK (venda_id, joia_id) ao reinserir
        venda.limparItens();
        vendaRepository.saveAndFlush(venda);

        venda.setCliente(novoCliente);
        applyItemsAndDebitStock(venda, request.itens(), precosOriginais);
        venda.recalcularValorTotal();

        return VendaResponse.from(vendaRepository.save(venda));
    }

    @Transactional
    public VendaResponse cancel(Long id) {
        Venda venda = findDetailsOrThrow(id);
        if (venda.getStatus() == StatusVenda.CANCELADA) {
            throw new BusinessConflictException("Esta venda já se encontra cancelada.");
        }

        for (ItemVenda item : venda.getItens()) {
            item.getJoia().estornarEstoque(item.getQuantidade());
        }

        venda.setStatus(StatusVenda.CANCELADA);
        return VendaResponse.from(vendaRepository.save(venda));
    }

    private void applyItemsAndDebitStock(
            Venda venda,
            List<ItemVendaRequest> itensRequest,
            Map<Long, BigDecimal> precosOriginais
    ) {
        for (ItemVendaRequest reqItem : itensRequest) {
            Joia joia = joiaRepository.findById(reqItem.joiaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Joia ID " + reqItem.joiaId() + " não encontrada."));

            if (!Boolean.TRUE.equals(joia.getAtivo())) {
                throw new BusinessRuleException("A joia \"" + joia.getNome() + "\" está inativa e não pode ser vendida.");
            }
            if (reqItem.quantidade() > joia.getQuantidadeEstoque()) {
                throw new BusinessRuleException(
                        "Estoque insuficiente para a joia \"" + joia.getNome()
                                + "\". Disponível: " + joia.getQuantidadeEstoque()
                                + ", Solicitado: " + reqItem.quantidade() + "."
                );
            }

            joia.debitarEstoque(reqItem.quantidade());
            BigDecimal precoPraticado = precosOriginais.getOrDefault(joia.getId(), joia.getPreco());
            venda.adicionarItem(new ItemVenda(joia, reqItem.quantidade(), precoPraticado));
        }
    }

    private void validateItensRequest(List<ItemVendaRequest> itens) {
        if (itens == null || itens.isEmpty()) {
            throw new BusinessRuleException("A venda deve conter ao menos um item.");
        }
        Set<Long> seenJoiaIds = new HashSet<>();
        for (ItemVendaRequest item : itens) {
            if (item.quantidade() == null || item.quantidade() <= 0) {
                throw new BusinessRuleException("A quantidade de cada item deve ser maior que zero.");
            }
            if (!seenJoiaIds.add(item.joiaId())) {
                throw new BusinessRuleException("A mesma joia não pode constar mais de uma vez na mesma venda.");
            }
        }
    }

    private Cliente findActiveClienteOrThrow(Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado."));
        if (!Boolean.TRUE.equals(cliente.getAtivo())) {
            throw new BusinessRuleException("Não é possível registrar venda para cliente inativo.");
        }
        return cliente;
    }

    private Venda findDetailsOrThrow(Long id) {
        return vendaRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venda não encontrada."));
    }
}

