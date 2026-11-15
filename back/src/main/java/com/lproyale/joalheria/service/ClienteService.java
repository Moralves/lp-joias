package com.lproyale.joalheria.service;

import com.lproyale.joalheria.domain.entity.Cliente;
import com.lproyale.joalheria.dto.cliente.ClienteRequest;
import com.lproyale.joalheria.dto.cliente.ClienteResponse;
import com.lproyale.joalheria.dto.cliente.ClienteUpdateRequest;
import com.lproyale.joalheria.exception.BusinessConflictException;
import com.lproyale.joalheria.exception.BusinessRuleException;
import com.lproyale.joalheria.exception.ResourceNotFoundException;
import com.lproyale.joalheria.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Regras de negócio de clientes:
 * normalização e validação de CPF (11 dígitos), unicidade de CPF/e-mail e exclusão lógica.
 */
@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> findAll(Boolean ativo) {
        List<Cliente> clientes = Boolean.FALSE.equals(ativo)
                ? clienteRepository.findAllByOrderByIdAsc()
                : clienteRepository.findByAtivoTrueOrderByIdAsc();
        return clientes.stream().map(ClienteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse findById(Long id) {
        return ClienteResponse.from(findEntityById(id));
    }

    @Transactional
    public ClienteResponse create(ClienteRequest request) {
        String cpfClean = normalizeAndValidateCpf(request.cpf());
        String emailNormalized = request.email().trim().toLowerCase();

        if (clienteRepository.existsByCpf(cpfClean)) {
            throw new BusinessConflictException("CPF já cadastrado no sistema.");
        }
        if (clienteRepository.existsByEmailIgnoreCase(emailNormalized)) {
            throw new BusinessConflictException("E-mail já cadastrado para outro cliente.");
        }

        Cliente cliente = new Cliente(
                request.nome().trim(),
                cpfClean,
                emailNormalized,
                request.telefone().trim()
        );
        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse update(Long id, ClienteUpdateRequest request) {
        Cliente cliente = findEntityById(id);

        if (request.cpf() != null && !request.cpf().isBlank()) {
            String cpfClean = normalizeAndValidateCpf(request.cpf());
            if (clienteRepository.existsByCpfAndIdNot(cpfClean, id)) {
                throw new BusinessConflictException("CPF já cadastrado para outro cliente.");
            }
            cliente.setCpf(cpfClean);
        }

        if (request.email() != null && !request.email().isBlank()) {
            String emailNormalized = request.email().trim().toLowerCase();
            if (clienteRepository.existsByEmailIgnoreCaseAndIdNot(emailNormalized, id)) {
                throw new BusinessConflictException("E-mail já cadastrado para outro cliente.");
            }
            cliente.setEmail(emailNormalized);
        }

        if (request.nome() != null && !request.nome().isBlank()) {
            cliente.setNome(request.nome().trim());
        }

        if (request.telefone() != null && !request.telefone().isBlank()) {
            cliente.setTelefone(request.telefone().trim());
        }

        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    @Transactional
    public void inactivate(Long id) {
        Cliente cliente = findEntityById(id);
        cliente.setAtivo(false);
        clienteRepository.save(cliente);
    }

    @Transactional
    public ClienteResponse reactivate(Long id) {
        Cliente cliente = findEntityById(id);
        if (Boolean.TRUE.equals(cliente.getAtivo())) {
            throw new BusinessConflictException("Cliente já se encontra ativo.");
        }
        cliente.setAtivo(true);
        return ClienteResponse.from(clienteRepository.save(cliente));
    }

    private String normalizeAndValidateCpf(String rawCpf) {
        String cpfClean = rawCpf == null ? "" : rawCpf.replaceAll("\\D", "");
        if (cpfClean.length() != 11) {
            throw new BusinessRuleException("O CPF deve conter exatamente 11 dígitos numéricos.");
        }
        return cpfClean;
    }

    private Cliente findEntityById(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado."));
    }
}

