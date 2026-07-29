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
import br.com.gestao.entity.Produto;
import br.com.gestao.entity.Usuario;
import br.com.gestao.entity.Usuario.Role;
import br.com.gestao.repository.CategoriaRepository;
import br.com.gestao.repository.ProdutoRepository;
import br.com.gestao.repository.UsuarioRepository;
import br.com.gestao.security.TokenService;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MovimentacaoEstoqueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private TokenService tokenService;

    private String token;
    private Long produtoId;

    @BeforeEach
    void setUp() {
        Usuario usuario = new Usuario("estoquista@teste.com", "Estoquista", "senha", Role.FUNCIONARIO);
        usuario = usuarioRepository.save(usuario);
        token = tokenService.gerarToken(usuario);

        Categoria cat = categoriaRepository.save(new Categoria("Higiene"));

        Produto produto = new Produto();
        produto.setNome("Sabonete");
        produto.setPrecoVenda(java.math.BigDecimal.valueOf(3.00));
        produto.setEstoqueAtual(0);
        produto.setCategoria(cat);
        produto = produtoRepository.save(produto);
        produtoId = produto.getId();
    }

    @Test
    void fluxoEntradaSaidaEAjuste() throws Exception {
        String entrada = """
                {
                    "produto": { "id": %d },
                    "quantidade": 100,
                    "observacao": "Compra inicial"
                }
                """.formatted(produtoId);

        mockMvc.perform(post("/estoque/entrada")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(entrada))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/produtos/" + produtoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estoqueAtual").value(100));

        String saida = """
                {
                    "produto": { "id": %d },
                    "quantidade": 30,
                    "observacao": "Venda"
                }
                """.formatted(produtoId);

        mockMvc.perform(post("/estoque/saida")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(saida))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/produtos/" + produtoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estoqueAtual").value(70));

        String ajuste = """
                {
                    "produto": { "id": %d },
                    "quantidade": 50,
                    "observacao": "Ajuste manual"
                }
                """.formatted(produtoId);

        mockMvc.perform(post("/estoque/ajuste")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ajuste))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/produtos/" + produtoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estoqueAtual").value(50));

        mockMvc.perform(get("/estoque/movimentacoes/" + produtoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void saidaComEstoqueInsuficienteDeveRetornar400() throws Exception {
        String saida = """
                {
                    "produto": { "id": %d },
                    "quantidade": 10
                }
                """.formatted(produtoId);

        mockMvc.perform(post("/estoque/saida")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(saida))
                .andExpect(status().isBadRequest());
    }
}
