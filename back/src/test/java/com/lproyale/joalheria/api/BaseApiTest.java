package com.lproyale.joalheria.api;

import com.lproyale.joalheria.domain.entity.Usuario;
import com.lproyale.joalheria.repository.*;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static io.restassured.RestAssured.given;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class BaseApiTest {

    @LocalServerPort
    protected int port;

    @Autowired
    protected UsuarioRepository usuarioRepository;

    @Autowired
    protected ClienteRepository clienteRepository;

    @Autowired
    protected JoiaRepository joiaRepository;

    @Autowired
    protected VendaRepository vendaRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    protected Usuario operadorPadrao;

    @BeforeEach
    void setupBase() {
        RestAssured.port = port;
        RestAssured.basePath = "/api";

        vendaRepository.deleteAll();
        joiaRepository.deleteAll();
        clienteRepository.deleteAll();
        usuarioRepository.deleteAll();

        operadorPadrao = usuarioRepository.save(
                new Usuario("Carlos Silva", "carlos@lproyale.com.br", passwordEncoder.encode("123456"))
        );
    }

    protected String autenticar(String email, String senha) {
        return given()
                .contentType(ContentType.JSON)
                .body(Map.of("email", email, "senha", senha))
                .when()
                .post("/auth/login")
                .then()
                .statusCode(200)
                .extract()
                .path("token");
    }
}

