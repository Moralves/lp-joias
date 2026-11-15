package com.lproyale.joalheria.repository;

import com.lproyale.joalheria.domain.entity.Venda;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    @EntityGraph(attributePaths = {"cliente", "usuario", "itens", "itens.joia"})
    List<Venda> findAllByOrderByIdDesc();

    @EntityGraph(attributePaths = {"cliente", "usuario", "itens", "itens.joia"})
    Optional<Venda> findWithDetailsById(Long id);
}

