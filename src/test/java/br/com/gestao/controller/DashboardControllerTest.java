package br.com.gestao.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import br.com.gestao.entity.Categoria;
import br.com.gestao.entity.Cliente;
import br.com.gestao.entity.Produto;
import br.com.gestao.entity.Usuario;
import br.com.gestao.entity.Usuario.Role;
import br.com.gestao.repository.CategoriaRepository;
import br.com.gestao.repository.ClienteRepository;
import br.com.gestao.repository.ProdutoRepository;
import br.com.gestao.repository.UsuarioRepository;
import br.com.gestao.security.TokenService;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private TokenService tokenService;

    private String token;
    private Long produtoId;
    private Long clienteId;

    @BeforeEach
    void setUp() {
        Usuario usuario = new Usuario("gerente@teste.com", "Gerente", "senha", Role.GERENTE);
        usuario = usuarioRepository.save(usuario);
        token = tokenService.gerarToken(usuario);

        Categoria cat = categoriaRepository.save(new Categoria("Geral"));

        Produto produto = new Produto();
        produto.setNome("Produto Teste");
        produto.setPrecoVenda(java.math.BigDecimal.TEN);
        produto.setEstoqueAtual(2);
        produto.setEstoqueMinimo(5);
        produto.setCategoria(cat);
        produto = produtoRepository.save(produto);
        produtoId = produto.getId();

        Cliente cliente = new Cliente();
        cliente.setNome("Cliente Teste");
        cliente = clienteRepository.save(cliente);
        clienteId = cliente.getId();
    }

    @Test
    void dashboardDeveRetornarIndicadores() throws Exception {
        mockMvc.perform(get("/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vendasMes").value(0))
                .andExpect(jsonPath("$.faturamentoMes").value(0))
                .andExpect(jsonPath("$.produtosBaixoEstoque").value(1));
    }

    @Test
    void dashboardDeveRefletirVendaRealizada() throws Exception {
        String venda = """
                {
                    "cliente": { "id": %d },
                    "formaPagamento": "PIX",
                    "itens": [
                        {
                            "produto": { "id": %d },
                            "quantidade": 1
                        }
                    ]
                }
                """.formatted(clienteId, produtoId);

        mockMvc.perform(post("/vendas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(venda))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vendasMes").value(1))
                .andExpect(jsonPath("$.faturamentoMes").value(10.0));
    }
}
