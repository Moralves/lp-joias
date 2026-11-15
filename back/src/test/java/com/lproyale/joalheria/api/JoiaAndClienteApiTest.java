package com.lproyale.joalheria.api;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

class JoiaAndClienteApiTest extends BaseApiTest {

    @Test
    @DisplayName("Deve validar ciclo completo de cliente: criação, conflito de CPF, inativação e reativação")
    void deveValidarCicloCliente() {
        String token = autenticar("carlos@lproyale.com.br", "123456");

        Integer clienteId = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "nome", "Ana Beatriz",
                        "cpf", "123.456.789-01",
                        "email", "ana@email.com",
                        "telefone", "11987654321"
                ))
                .when()
                .post("/clientes")
                .then()
                .statusCode(201)
                .body("cpf", equalTo("12345678901"))
                .extract()
                .path("id");

        // CPF duplicado -> 409
        given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "nome", "Outra Pessoa",
                        "cpf", "12345678901",
                        "email", "outra@email.com",
                        "telefone", "11900000000"
                ))
                .when()
                .post("/clientes")
                .then()
                .statusCode(409);

        // Inativação -> 204
        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete("/clientes/" + clienteId)
                .then()
                .statusCode(204);

        // Listagem padrão (ativos) não traz o cliente inativo
        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/clientes")
                .then()
                .statusCode(200)
                .body("id", not(hasItem(clienteId)));

        // Listagem com ?ativo=false inclui o cliente inativo
        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/clientes?ativo=false")
                .then()
                .statusCode(200)
                .body("find { it.id == " + clienteId + " }.ativo", equalTo(false));

        // Reativação -> 200
        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .put("/clientes/" + clienteId + "/reativar")
                .then()
                .statusCode(200)
                .body("ativo", equalTo(true));
    }

    @Test
    @DisplayName("Deve aplicar 409 na edição cadastral de joia vendida, permitir ajuste de estoque e inativar no DELETE")
    void deveValidarRegrasJoiaVendida() {
        String token = autenticar("carlos@lproyale.com.br", "123456");

        Integer clienteId = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of("nome", "Rafael", "cpf", "98765432100", "email", "rafael@email.com", "telefone", "11976543210"))
                .post("/clientes")
                .then().statusCode(201).extract().path("id");

        Integer joiaSemVendaId = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of("nome", "Brinco Pérola", "categoria", "Brinco", "material", "Prata 925", "preco", 420.00, "quantidadeEstoque", 5))
                .post("/joias")
                .then().statusCode(201).extract().path("id");

        // Exclusão física quando nunca foi vendida
        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete("/joias/" + joiaSemVendaId)
                .then()
                .statusCode(200)
                .body("deleted", equalTo(true))
                .body("inactivated", equalTo(false));

        Integer joiaVendidaId = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of("nome", "Anel Solitário", "categoria", "Anel", "material", "Ouro 18k", "preco", 2450.00, "quantidadeEstoque", 6))
                .post("/joias")
                .then().statusCode(201).extract().path("id");

        // Registra venda da joia
        given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "clienteId", clienteId,
                        "itens", List.of(Map.of("joiaId", joiaVendidaId, "quantidade", 1))
                ))
                .post("/vendas")
                .then().statusCode(201);

        // Alteração cadastral deve retornar 409 Conflict
        given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of("nome", "Nome Proibido", "categoria", "Anel", "material", "Ouro 18k", "preco", 2999.00))
                .when()
                .put("/joias/" + joiaVendidaId)
                .then()
                .statusCode(409);

        // Reposição de estoque deve funcionar mesmo após venda
        given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of("quantidadeEstoque", 20))
                .when()
                .patch("/joias/" + joiaVendidaId + "/estoque")
                .then()
                .statusCode(200)
                .body("quantidadeEstoque", equalTo(20))
                .body("possuiVendas", equalTo(true));

        // DELETE em joia vendida executa soft delete (inactivated: true)
        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete("/joias/" + joiaVendidaId)
                .then()
                .statusCode(200)
                .body("deleted", equalTo(false))
                .body("inactivated", equalTo(true));
    }
}

