package com.lproyale.joalheria.api;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

class VendaApiTest extends BaseApiTest {

    @Test
    @DisplayName("Deve registrar venda com 2 joias, validar baixa de estoque, editar itens e cancelar com estorno")
    void deveValidarCicloCompletoVendaEEstoque() {
        String token = autenticar("carlos@lproyale.com.br", "123456");

        Integer clienteId = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of("nome", "Camila Martins", "cpf", "45678912300", "email", "camila@email.com", "telefone", "11965432109"))
                .post("/clientes")
                .then().statusCode(201).extract().path("id");

        Integer joia1Id = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of("nome", "Anel Ouro", "categoria", "Anel", "material", "Ouro 18k", "preco", 1000.00, "quantidadeEstoque", 5))
                .post("/joias")
                .then().statusCode(201).extract().path("id");

        Integer joia2Id = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of("nome", "Colar Prata", "categoria", "Colar", "material", "Prata 925", "preco", 500.00, "quantidadeEstoque", 4))
                .post("/joias")
                .then().statusCode(201).extract().path("id");

        // 1. Registro da venda com 2 itens (2x joia1 + 1x joia2 = 2500.00)
        Integer vendaId = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "clienteId", clienteId,
                        "itens", List.of(
                                Map.of("joiaId", joia1Id, "quantidade", 2),
                                Map.of("joiaId", joia2Id, "quantidade", 1)
                        )
                ))
                .when()
                .post("/vendas")
                .then()
                .statusCode(201)
                .body("status", equalTo("CONCLUIDA"))
                .body("valorTotal", equalTo(2500.0f))
                .body("itens.size()", equalTo(2))
                .extract()
                .path("id");

        // Verifica baixa de estoque pós-venda (joia1: 5-2=3, joia2: 4-1=3)
        given().header("Authorization", "Bearer " + token).get("/joias/" + joia1Id)
                .then().statusCode(200).body("quantidadeEstoque", equalTo(3));
        given().header("Authorization", "Bearer " + token).get("/joias/" + joia2Id)
                .then().statusCode(200).body("quantidadeEstoque", equalTo(3));

        // 2. Edição da venda: altera para 1x joia1 e 3x joia2 (1000 + 1500 = 2500)
        given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "clienteId", clienteId,
                        "itens", List.of(
                                Map.of("joiaId", joia1Id, "quantidade", 1),
                                Map.of("joiaId", joia2Id, "quantidade", 3)
                        )
                ))
                .when()
                .put("/vendas/" + vendaId)
                .then()
                .statusCode(200)
                .body("valorTotal", equalTo(2500.0f));

        // Verifica estoque após edição (joia1: 5-1=4, joia2: 4-3=1)
        given().header("Authorization", "Bearer " + token).get("/joias/" + joia1Id)
                .then().statusCode(200).body("quantidadeEstoque", equalTo(4));
        given().header("Authorization", "Bearer " + token).get("/joias/" + joia2Id)
                .then().statusCode(200).body("quantidadeEstoque", equalTo(1));

        // 3. Cancelamento da venda -> status CANCELADA e estorno integral do estoque
        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete("/vendas/" + vendaId)
                .then()
                .statusCode(200)
                .body("status", equalTo("CANCELADA"));

        given().header("Authorization", "Bearer " + token).get("/joias/" + joia1Id)
                .then().statusCode(200).body("quantidadeEstoque", equalTo(5));
        given().header("Authorization", "Bearer " + token).get("/joias/" + joia2Id)
                .then().statusCode(200).body("quantidadeEstoque", equalTo(4));
    }
}

