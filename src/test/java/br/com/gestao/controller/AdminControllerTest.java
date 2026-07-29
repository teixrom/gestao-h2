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

import br.com.gestao.entity.Usuario;
import br.com.gestao.entity.Usuario.Role;
import br.com.gestao.repository.UsuarioRepository;
import br.com.gestao.security.TokenService;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TokenService tokenService;

    private String token;

    @BeforeEach
    void setUp() {
        Usuario admin = new Usuario("admin@teste.com", "Admin", "senha", Role.ADMINISTRADOR);
        admin = usuarioRepository.save(admin);
        token = tokenService.gerarToken(admin);
    }

    @Test
    void fluxoCompletoUsuario() throws Exception {
        String criacao = """
                {
                    "nome": "Joao",
                    "email": "joao@teste.com",
                    "senha": "123456",
                    "role": "FUNCIONARIO"
                }
                """;

        var result = mockMvc.perform(post("/admin/usuarios")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(criacao))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Joao"))
                .andExpect(jsonPath("$.role").value("FUNCIONARIO"))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        Long id = Long.parseLong(json.split(",")[0].replaceAll("\\D+", ""));

        mockMvc.perform(get("/admin/usuarios")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email=='joao@teste.com')]").exists());

        String edicao = """
                { "nome": "Joao Silva", "email": "joao@teste.com" }
                """;

        mockMvc.perform(put("/admin/usuarios/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(edicao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Joao Silva"));

        mockMvc.perform(put("/admin/usuarios/" + id + "/role")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "role": "GERENTE" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("GERENTE"));

        mockMvc.perform(put("/admin/usuarios/" + id + "/senha")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "senha": "nova123" }
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(put("/admin/usuarios/" + id + "/ativo")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/admin/usuarios")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + id + ")].ativo").value(false));

        mockMvc.perform(delete("/admin/usuarios/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void listarUsuariosSemTokenDeveRetornar403() throws Exception {
        mockMvc.perform(get("/admin/usuarios"))
                .andExpect(status().isForbidden());
    }

    @Test
    void criarUsuarioComEmailDuplicadoDeveRetornar400() throws Exception {
        String criacao = """
                {
                    "nome": "Admin",
                    "email": "admin@teste.com",
                    "senha": "123456",
                    "role": "ADMINISTRADOR"
                }
                """;

        mockMvc.perform(post("/admin/usuarios")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(criacao))
                .andExpect(status().isBadRequest());
    }
}
