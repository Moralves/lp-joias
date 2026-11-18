package com.lpjoias.joalheria.api;

import com.lpjoias.joalheria.domain.entity.Usuario;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

class AuthAndUsuarioApiTest extends BaseApiTest {

    @Test
    @DisplayName("Deve autenticar com JWT válido, bloquear rotas sem token e impedir login de inativo")
    void deveValidarFluxoJwtELoginInativo() {
        given()
                .when()
                .get("/usuarios")
                .then()
                .statusCode(401);

        String token = autenticar("carlos@lpjoias.com.br", "123456");

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .get("/usuarios")
                .then()
                .statusCode(200)
                .body("size()", equalTo(1))
                .body("[0].email", equalTo("carlos@lpjoias.com.br"));

        Usuario inativo = new Usuario("Lucas Antigo", "lucas@lpjoias.com.br", passwordEncoder.encode("123456"));
        inativo.setAtivo(false);
        usuarioRepository.save(inativo);

        given()
                .contentType(ContentType.JSON)
                .body(Map.of("email", "lucas@lpjoias.com.br", "senha", "123456"))
                .when()
                .post("/auth/login")
                .then()
                .statusCode(403)
                .body("message", containsStringIgnoringCase("inativo"));
    }

    @Test
    @DisplayName("Deve impedir auto-inativação (409) e permitir inativação e reativação de outro operador")
    void deveValidarAutoInativacaoEInativacaoEReativacao() {
        String token = autenticar("carlos@lpjoias.com.br", "123456");

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete("/usuarios/" + operadorPadrao.getId())
                .then()
                .statusCode(409);

        Integer marinaId = given()
                .header("Authorization", "Bearer " + token)
                .contentType(ContentType.JSON)
                .body(Map.of(
                        "nome", "Marina Costa",
                        "email", "marina@lpjoias.com.br",
                        "senha", "123456"
                ))
                .when()
                .post("/usuarios")
                .then()
                .statusCode(201)
                .body("ativo", equalTo(true))
                .extract()
                .path("id");

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .delete("/usuarios/" + marinaId)
                .then()
                .statusCode(204);

        given()
                .header("Authorization", "Bearer " + token)
                .when()
                .put("/usuarios/" + marinaId + "/reativar")
                .then()
                .statusCode(200)
                .body("ativo", equalTo(true));
    }
}

