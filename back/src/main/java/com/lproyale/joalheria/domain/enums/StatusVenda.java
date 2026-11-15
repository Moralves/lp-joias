package com.lproyale.joalheria.domain.enums;

/**
 * Estados possíveis de uma operação de venda no PDV.
 * Uma venda nasce CONCLUIDA e pode ser CANCELADA (nunca reativada).
 */
public enum StatusVenda {
    CONCLUIDA,
    CANCELADA
}

