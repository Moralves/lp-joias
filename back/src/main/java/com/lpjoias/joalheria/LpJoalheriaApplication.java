package com.lpjoias.joalheria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

@SpringBootApplication
public class LpJoalheriaApplication {

    public static void main(String[] args) {
        garantirBancoPostgres();
        SpringApplication.run(LpJoalheriaApplication.class, args);
    }

    private static void garantirBancoPostgres() {
        String url = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://localhost:5432/lp_joias");
        String user = System.getenv().getOrDefault("DB_USER", "postgres");
        String pass = System.getenv().getOrDefault("DB_PASSWORD", "postgres");

        try (Connection ignored = DriverManager.getConnection(url, user, pass)) {
            // Banco lp_joias já existe e está acessível
        } catch (SQLException ex) {
            // SQLState 3D000 = database "lp_joias" ainda não existe no PostgreSQL
            if ("3D000".equals(ex.getSQLState())) {
                String adminUrl = url.replaceFirst("/lp_joias(\\?.*)?$", "/postgres");
                try (Connection conn = DriverManager.getConnection(adminUrl, user, pass);
                     Statement stmt = conn.createStatement()) {
                    stmt.execute("CREATE DATABASE lp_joias");
                } catch (SQLException ignored) {
                }
            }
        }
    }
}
