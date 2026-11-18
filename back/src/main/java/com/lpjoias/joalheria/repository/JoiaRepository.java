package com.lpjoias.joalheria.repository;

import com.lpjoias.joalheria.domain.entity.Joia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JoiaRepository extends JpaRepository<Joia, Long> {

    List<Joia> findByAtivoTrueOrderByIdAsc();

    List<Joia> findAllByOrderByIdAsc();
}

