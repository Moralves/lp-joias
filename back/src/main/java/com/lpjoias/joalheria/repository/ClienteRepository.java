package com.lpjoias.joalheria.repository;

import com.lpjoias.joalheria.domain.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByCpf(String cpf);

    boolean existsByCpfAndIdNot(String cpf, Long id);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    List<Cliente> findByAtivoTrueOrderByIdAsc();

    List<Cliente> findAllByOrderByIdAsc();
}

