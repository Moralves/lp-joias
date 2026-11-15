package com.lproyale.joalheria.config;

import com.lproyale.joalheria.domain.entity.*;
import com.lproyale.joalheria.domain.enums.StatusVenda;
import com.lproyale.joalheria.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Popula o banco PostgreSQL com dados iniciais idempotentes na primeira inicialização
 * (espelhando os dados de homologação do front-end com senhas criptografadas em BCrypt).
 * Desabilitado no perfil {@code test} para que cada teste controle suas próprias massas.
 */
@Component
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final JoiaRepository joiaRepository;
    private final VendaRepository vendaRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            JoiaRepository joiaRepository,
            VendaRepository vendaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.joiaRepository = joiaRepository;
        this.vendaRepository = vendaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        String senhaPadrao = passwordEncoder.encode("123456");

        Usuario carlos = new Usuario("Carlos Silva", "carlos@lproyale.com.br", senhaPadrao);
        Usuario marina = new Usuario("Marina Costa", "marina@lproyale.com.br", senhaPadrao);
        Usuario lucas = new Usuario("Lucas Antigo", "lucas@lproyale.com.br", senhaPadrao);
        lucas.setAtivo(false);
        usuarioRepository.saveAll(List.of(carlos, marina, lucas));

        Cliente ana = new Cliente("Ana Beatriz Souza", "12345678901", "ana.souza@email.com", "11987654321");
        Cliente rafael = new Cliente("Rafael Guimarães", "98765432100", "rafael.g@email.com", "11976543210");
        Cliente camila = new Cliente("Camila Martins", "45678912300", "camila.m@email.com", "11965432109");
        Cliente roberto = new Cliente("Roberto Dias", "78912345600", "roberto@email.com", "11954321098");
        roberto.setAtivo(false);
        clienteRepository.saveAll(List.of(ana, rafael, camila, roberto));

        Joia j1 = new Joia("Anel Solitário Ouro 18k", "Anel", "Ouro 18k", new BigDecimal("2450.00"), 6);
        Joia j2 = new Joia("Colar Riviera Diamantes", "Colar", "Ouro Branco", new BigDecimal("4890.00"), 3);
        Joia j3 = new Joia("Brincos Pérola Cultivada", "Brinco", "Prata 925", new BigDecimal("420.00"), 10);
        Joia j4 = new Joia("Pulseira Elo Cartier Ouro", "Pulseira", "Ouro 18k", new BigDecimal("3120.00"), 4);
        Joia j5 = new Joia("Aliança Clássica Anatômica", "Anel", "Ouro 18k", new BigDecimal("1650.00"), 0);
        Joia j6 = new Joia("Gargantilha Ponto de Luz", "Colar", "Prata 925", new BigDecimal("280.00"), 8);
        j6.setAtivo(false);
        joiaRepository.saveAll(List.of(j1, j2, j3, j4, j5, j6));

        Venda v1 = new Venda();
        v1.setCliente(ana);
        v1.setUsuario(carlos);
        v1.setDataVenda(LocalDateTime.of(2026, 11, 10, 14, 32));
        v1.setStatus(StatusVenda.CONCLUIDA);
        v1.adicionarItem(new ItemVenda(j1, 1, j1.getPreco()));
        v1.recalcularValorTotal();

        Venda v2 = new Venda();
        v2.setCliente(rafael);
        v2.setUsuario(marina);
        v2.setDataVenda(LocalDateTime.of(2026, 11, 11, 16, 15));
        v2.setStatus(StatusVenda.CANCELADA);
        v2.adicionarItem(new ItemVenda(j2, 1, j2.getPreco()));
        v2.recalcularValorTotal();

        vendaRepository.saveAll(List.of(v1, v2));
    }
}

