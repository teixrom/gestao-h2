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
class VendaControllerTest {

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
        Usuario usuario = new Usuario("vendedor@teste.com", "Vendedor", "senha", Role.FUNCIONARIO);
        usuario = usuarioRepository.save(usuario);
        token = tokenService.gerarToken(usuario);

        Categoria cat = categoriaRepository.save(new Categoria("Bebidas"));

        Produto produto = new Produto();
        produto.setNome("Cerveja");
        produto.setPrecoVenda(java.math.BigDecimal.valueOf(5.50));
        produto.setEstoqueAtual(50);
        produto.setCategoria(cat);
        produto = produtoRepository.save(produto);
        produtoId = produto.getId();

        Cliente cliente = new Cliente();
        cliente.setNome("Carlos");
        cliente.setEmail("carlos@teste.com");
        cliente = clienteRepository.save(cliente);
        clienteId = cliente.getId();
    }

    @Test
    void fluxoCompletoVenda() throws Exception {
        String venda = """
                {
                    "cliente": { "id": %d },
                    "formaPagamento": "PIX",
                    "itens": [
                        {
                            "produto": { "id": %d },
                            "quantidade": 3
                        }
                    ]
                }
                """.formatted(clienteId, produtoId);

        var result = mockMvc.perform(post("/vendas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(venda))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(16.5))
                .andExpect(jsonPath("$.itens[0].quantidade").value(3))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        Long vendaId = Long.parseLong(json.split(",")[0].replaceAll("\\D+", ""));

        mockMvc.perform(get("/vendas/" + vendaId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cliente.nome").value("Carlos"));

        mockMvc.perform(get("/produtos/" + produtoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estoqueAtual").value(47));
    }

    @Test
    void cancelarVendaDeveEstornarEstoque() throws Exception {
        String venda = """
                {
                    "cliente": { "id": %d },
                    "formaPagamento": "DINHEIRO",
                    "itens": [
                        {
                            "produto": { "id": %d },
                            "quantidade": 10
                        }
                    ]
                }
                """.formatted(clienteId, produtoId);

        var result = mockMvc.perform(post("/vendas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(venda))
                .andExpect(status().isCreated())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        Long vendaId = Long.parseLong(json.split(",")[0].replaceAll("\\D+", ""));

        mockMvc.perform(post("/vendas/" + vendaId + "/cancelar")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/produtos/" + produtoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estoqueAtual").value(50));
    }

    @Test
    void vendaComEstoqueInsuficienteDeveRetornar400() throws Exception {
        String venda = """
                {
                    "cliente": { "id": %d },
                    "formaPagamento": "PIX",
                    "itens": [
                        {
                            "produto": { "id": %d },
                            "quantidade": 999
                        }
                    ]
                }
                """.formatted(clienteId, produtoId);

        mockMvc.perform(post("/vendas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(venda))
                .andExpect(status().isBadRequest());
    }
}
