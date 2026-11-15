package com.lproyale.joalheria.repository;

import com.lproyale.joalheria.domain.entity.Joia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JoiaRepository extends JpaRepository<Joia, Long> {

    List<Joia> findByAtivoTrueOrderByIdAsc();

    List<Joia> findAllByOrderByIdAsc();
}

