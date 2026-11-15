package com.lproyale.joalheria.service;

import com.lproyale.joalheria.domain.entity.Joia;
import com.lproyale.joalheria.dto.joia.*;
import com.lproyale.joalheria.exception.BusinessConflictException;
import com.lproyale.joalheria.exception.BusinessRuleException;
import com.lproyale.joalheria.exception.ResourceNotFoundException;
import com.lproyale.joalheria.repository.ItemVendaRepository;
import com.lproyale.joalheria.repository.JoiaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
public class JoiaService {

    private final JoiaRepository joiaRepository;
    private final ItemVendaRepository itemVendaRepository;

    public JoiaService(JoiaRepository joiaRepository, ItemVendaRepository itemVendaRepository) {
        this.joiaRepository = joiaRepository;
        this.itemVendaRepository = itemVendaRepository;
    }

    @Transactional(readOnly = true)
    public List<JoiaResponse> findAll(Boolean ativo) {
        List<Joia> joias = Boolean.FALSE.equals(ativo)
                ? joiaRepository.findAllByOrderByIdAsc()
                : joiaRepository.findByAtivoTrueOrderByIdAsc();
        Set<Long> joiasComVendas = itemVendaRepository.findAllJoiaIdsWithSales();
        return joias.stream()
                .map(j -> JoiaResponse.from(j, joiasComVendas.contains(j.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public JoiaResponse findById(Long id) {
        Joia joia = findEntityById(id);
        boolean possuiVendas = itemVendaRepository.existsByJoiaId(id);
        return JoiaResponse.from(joia, possuiVendas);
    }

    @Transactional
    public JoiaResponse create(JoiaCreateRequest request) {
        validatePreco(request.preco());
        validateEstoque(request.quantidadeEstoque());

        Joia joia = new Joia(
                request.nome().trim(),
                request.categoria().trim(),
                request.material().trim(),
                request.preco(),
                request.quantidadeEstoque()
        );
        return JoiaResponse.from(joiaRepository.save(joia), false);
    }

    @Transactional
    public JoiaResponse update(Long id, JoiaUpdateRequest request) {
        Joia joia = findEntityById(id);
        boolean possuiVendas = itemVendaRepository.existsByJoiaId(id);

        if (possuiVendas && hasCadastralChanges(joia, request)) {
            throw new BusinessConflictException(
                    "Joia já participou de venda: não é permitido alterar nome, categoria, material ou preço."
            );
        }

        if (request.preco() != null) {
            validatePreco(request.preco());
            joia.setPreco(request.preco());
        }
        if (request.quantidadeEstoque() != null) {
            validateEstoque(request.quantidadeEstoque());
            joia.setQuantidadeEstoque(request.quantidadeEstoque());
        }
        if (request.nome() != null && !request.nome().isBlank()) {
            joia.setNome(request.nome().trim());
        }
        if (request.categoria() != null && !request.categoria().isBlank()) {
            joia.setCategoria(request.categoria().trim());
        }
        if (request.material() != null && !request.material().isBlank()) {
            joia.setMaterial(request.material().trim());
        }

        return JoiaResponse.from(joiaRepository.save(joia), possuiVendas);
    }

    @Transactional
    public JoiaResponse adjustStock(Long id, Integer novaQuantidade) {
        validateEstoque(novaQuantidade);
        Joia joia = findEntityById(id);
        joia.setQuantidadeEstoque(novaQuantidade);
        boolean possuiVendas = itemVendaRepository.existsByJoiaId(id);
        return JoiaResponse.from(joiaRepository.save(joia), possuiVendas);
    }

    @Transactional
    public JoiaDeleteResponse deleteOrInactivate(Long id) {
        Joia joia = findEntityById(id);
        boolean possuiVendas = itemVendaRepository.existsByJoiaId(id);

        if (possuiVendas) {
            joia.setAtivo(false);
            joiaRepository.save(joia);
            return new JoiaDeleteResponse(false, true);
        }

        joiaRepository.delete(joia);
        return new JoiaDeleteResponse(true, false);
    }

    @Transactional
    public JoiaResponse reactivate(Long id) {
        Joia joia = findEntityById(id);
        if (Boolean.TRUE.equals(joia.getAtivo())) {
            throw new BusinessConflictException("A joia já está ativa.");
        }
        joia.setAtivo(true);
        boolean possuiVendas = itemVendaRepository.existsByJoiaId(id);
        return JoiaResponse.from(joiaRepository.save(joia), possuiVendas);
    }

    private boolean hasCadastralChanges(Joia atual, JoiaUpdateRequest req) {
        boolean nomeChanged = req.nome() != null && !req.nome().isBlank()
                && !req.nome().trim().equals(atual.getNome());
        boolean catChanged = req.categoria() != null && !req.categoria().isBlank()
                && !req.categoria().trim().equals(atual.getCategoria());
        boolean matChanged = req.material() != null && !req.material().isBlank()
                && !req.material().trim().equals(atual.getMaterial());
        boolean precoChanged = req.preco() != null
                && req.preco().compareTo(atual.getPreco()) != 0;
        return nomeChanged || catChanged || matChanged || precoChanged;
    }

    private void validatePreco(BigDecimal preco) {
        if (preco == null || preco.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("O preço da joia deve ser maior que zero.");
        }
    }

    private void validateEstoque(Integer quantidade) {
        if (quantidade == null || quantidade < 0) {
            throw new BusinessRuleException("O estoque da joia não pode ser negativo.");
        }
    }

    private Joia findEntityById(Long id) {
        return joiaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Joia não encontrada."));
    }
}

