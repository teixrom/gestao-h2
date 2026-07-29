package br.com.gestao.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import br.com.gestao.entity.Usuario;
import br.com.gestao.entity.Usuario.Role;
import br.com.gestao.repository.CategoriaRepository;
import br.com.gestao.repository.UsuarioRepository;
import br.com.gestao.security.TokenService;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProdutoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private TokenService tokenService;

    private String token;
    private Long categoriaId;

    @BeforeEach
    void setUp() {
        Usuario usuario = new Usuario("admin@teste.com", "Admin", "senha", Role.ADMINISTRADOR);
        usuario = usuarioRepository.save(usuario);
        token = tokenService.gerarToken(usuario);

        Categoria cat = categoriaRepository.save(new Categoria("Bebidas"));
        categoriaId = cat.getId();
    }

    @Test
    void fluxoCompletoProduto() throws Exception {
        String criacao = """
                {
                    "nome": "Coca-Cola",
                    "descricao": "Refrigerante 2L",
                    "codigoBarras": "789123456",
                    "categoriaId": %d,
                    "precoVenda": 8.50,
                    "estoqueMinimo": 10
                }
                """.formatted(categoriaId);

        var result = mockMvc.perform(post("/produtos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(criacao))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Coca-Cola"))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        Long produtoId = Long.parseLong(json.split(",")[0].replaceAll("\\D+", ""));

        mockMvc.perform(get("/produtos/" + produtoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Coca-Cola"));

        String atualizacao = """
                {
                    "nome": "Coca-Cola 2L",
                    "descricao": "Refrigerante 2L",
                    "codigoBarras": "789123456",
                    "categoriaId": %d,
                    "precoVenda": 9.00,
                    "estoqueMinimo": 5
                }
                """.formatted(categoriaId);

        mockMvc.perform(put("/produtos/" + produtoId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(atualizacao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.precoVenda").value(9.0));

        mockMvc.perform(delete("/produtos/" + produtoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/produtos/" + produtoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));
    }

    @Test
    void listarProdutosSemTokenDeveRetornar401() throws Exception {
        mockMvc.perform(get("/produtos"))
                .andExpect(status().isForbidden());
    }

    @Test
    void criarProdutoComNomeVazioDeveRetornar400() throws Exception {
        String invalido = """
                {
                    "nome": "",
                    "precoVenda": 10.00
                }
                """;

        mockMvc.perform(post("/produtos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalido))
                .andExpect(status().isBadRequest());
    }
}
