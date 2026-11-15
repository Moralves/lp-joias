package com.lproyale.joalheria.repository;

import com.lproyale.joalheria.domain.entity.ItemVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Set;

public interface ItemVendaRepository extends JpaRepository<ItemVenda, Long> {

    boolean existsByJoiaId(Long joiaId);

    @Query("SELECT DISTINCT i.joia.id FROM ItemVenda i")
    Set<Long> findAllJoiaIdsWithSales();
}

