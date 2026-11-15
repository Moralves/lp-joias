package com.lproyale.joalheria.e2e;

import com.lproyale.joalheria.api.BaseApiTest;
import com.lproyale.joalheria.domain.entity.Cliente;
import com.lproyale.joalheria.domain.entity.Joia;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;

@Import(VendaSeleniumE2ETest.SpaTestWebConfig.class)
class VendaSeleniumE2ETest extends BaseApiTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private Joia joiaAnel;
    private Joia joiaColar;

    @TestConfiguration
    static class SpaTestWebConfig implements WebMvcConfigurer {

        private static Path resolveDistDir() {
            Path frontDir = Files.exists(Path.of("../front/package.json"))
                    ? Path.of("../front").toAbsolutePath().normalize()
                    : Path.of("front").toAbsolutePath().normalize();
            Path distDir = frontDir.resolve("dist");

            if (!Files.exists(distDir.resolve("index.html"))) {
                try {
                    boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
                    String npmCmd = isWindows ? "npm.cmd" : "npm";
                    if (!Files.exists(frontDir.resolve("node_modules"))) {
                        new ProcessBuilder(npmCmd, "install")
                                .directory(frontDir.toFile())
                                .inheritIO()
                                .start()
                                .waitFor();
                    }
                    new ProcessBuilder(npmCmd, "run", "build")
                            .directory(frontDir.toFile())
                            .inheritIO()
                            .start()
                            .waitFor();
                } catch (Exception e) {
                    throw new IllegalStateException("Falha ao compilar o front-end para o teste E2E.", e);
                }
            }
            return distDir;
        }

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
            File distDir = resolveDistDir().toFile();
            String location = distDir.toURI().toString();
            registry.addResourceHandler("/assets/**", "/favicon.svg")
                    .addResourceLocations(location + "assets/", location);
        }

        @RestController
        static class SpaForwardController {
            @GetMapping(value = {"/", "/login", "/vendas", "/joias", "/clientes", "/usuarios"}, produces = MediaType.TEXT_HTML_VALUE)
            public ResponseEntity<String> index() throws Exception {
                Path indexPath = resolveDistDir().resolve("index.html");
                String html = Files.readString(indexPath, StandardCharsets.UTF_8);
                return ResponseEntity.ok()
                        .contentType(MediaType.valueOf("text/html;charset=UTF-8"))
                        .body(html);
            }
        }
    }

    @BeforeEach
    void setupSelenium() {
        clienteRepository.save(new Cliente(
                "Ana Beatriz Souza",
                "12345678901",
                "ana.souza@email.com",
                "11987654321"
        ));

        joiaAnel = joiaRepository.save(new Joia(
                "Anel Solitário Ouro 18k",
                "Anel",
                "Ouro 18k",
                new BigDecimal("2450.00"),
                5
        ));

        joiaColar = joiaRepository.save(new Joia(
                "Colar Veneziana Diamante",
                "Colar",
                "Ouro Branco",
                new BigDecimal("3890.00"),
                3
        ));

        ChromeOptions options = new ChromeOptions();
        if ("true".equalsIgnoreCase(System.getProperty("headless"))) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1440,900");

        driver = new ChromeDriver(options);
        driver.manage().window().setSize(new Dimension(1440, 900));
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    void tearDownSelenium() {
        if (driver != null) {
            driver.quit();
        }
    }

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    private void pause(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void realizarLoginNaTela() {
        driver.get(baseUrl() + "/login");

        WebElement emailInput = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='input-email']"))
        );
        WebElement senhaInput = driver.findElement(By.cssSelector("[data-testid='input-senha']"));
        WebElement btnLogin = driver.findElement(By.cssSelector("[data-testid='btn-login']"));

        emailInput.clear();
        emailInput.sendKeys("carlos@lproyale.com.br");
        senhaInput.clear();
        senhaInput.sendKeys("123456");
        pause(800);
        btnLogin.click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='user-name']")));
        pause(800);
    }

    private void registrarVendaComDuasJoiasNoPdv() {
        WebElement btnAddAnel = wait.until(
                ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='btn-add-joia-" + joiaAnel.getId() + "']"))
        );
        btnAddAnel.click();
        pause(600);

        WebElement btnAddColar = wait.until(
                ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='btn-add-joia-" + joiaColar.getId() + "']"))
        );
        btnAddColar.click();
        pause(600);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("[data-testid='cart-item-" + joiaAnel.getId() + "']")
        ));
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("[data-testid='cart-item-" + joiaColar.getId() + "']")
        ));

        WebElement btnConfirmarVenda = driver.findElement(By.cssSelector("[data-testid='btn-confirmar-venda']"));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", btnConfirmarVenda);

        wait.until(d -> d.findElements(By.cssSelector("[data-testid='toast-message']")).stream()
                .anyMatch(el -> el.getText().contains("concluída com sucesso")));
        pause(800);
    }

    @Test
    @DisplayName("E2E 1: Deve realizar login pela interface gráfica e exibir o operador autenticado")
    void deveRealizarLoginComSucessoPelaTela() {
        realizarLoginNaTela();

        WebElement userName = driver.findElement(By.cssSelector("[data-testid='user-name']"));
        assertEquals("Carlos Silva", userName.getText().trim());
    }

    @Test
    @DisplayName("E2E 2: Deve registrar venda com duas joias pela tela do PDV e baixar o estoque")
    void deveRegistrarVendaComDuasJoiasPelaTela() {
        realizarLoginNaTela();
        registrarVendaComDuasJoiasNoPdv();

        Joia anelAposVenda = joiaRepository.findById(joiaAnel.getId()).orElseThrow();
        Joia colarAposVenda = joiaRepository.findById(joiaColar.getId()).orElseThrow();
        assertEquals(4, anelAposVenda.getQuantidadeEstoque());
        assertEquals(2, colarAposVenda.getQuantidadeEstoque());
    }

    @Test
    @DisplayName("E2E 3: Deve cancelar venda pela tela de histórico e devolver o estoque das joias")
    void deveCancelarVendaPelaTelaEDevolverEstoque() {
        realizarLoginNaTela();
        registrarVendaComDuasJoiasNoPdv();

        WebElement navVendas = driver.findElement(By.cssSelector("[data-testid='nav-vendas']"));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", navVendas);

        Long vendaId = vendaRepository.findAll().get(0).getId();

        WebElement btnCancelar = wait.until(
                ExpectedConditions.presenceOfElementLocated(By.cssSelector("[data-testid='btn-cancelar-venda-" + vendaId + "']"))
        );
        pause(800);
        ((JavascriptExecutor) driver).executeScript(
                "window.confirm = function() { return true; }; arguments[0].click();",
                btnCancelar
        );

        By statusBadgeSelector = By.cssSelector("[data-testid='status-venda-" + vendaId + "']");
        wait.until(ExpectedConditions.textToBePresentInElementLocated(statusBadgeSelector, "CANCELADA"));
        pause(1000);

        WebElement statusBadge = driver.findElement(statusBadgeSelector);
        assertEquals("CANCELADA", statusBadge.getText().trim());

        Joia anelAposCancelamento = joiaRepository.findById(joiaAnel.getId()).orElseThrow();
        Joia colarAposCancelamento = joiaRepository.findById(joiaColar.getId()).orElseThrow();
        assertEquals(5, anelAposCancelamento.getQuantidadeEstoque());
        assertEquals(3, colarAposCancelamento.getQuantidadeEstoque());
    }
}
