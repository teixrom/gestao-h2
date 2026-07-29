package br.com.gestao.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void deveRegistrarELogin() throws Exception {
        String registro = """
                {
                    "nome": "Admin Teste",
                    "email": "admin@teste.com",
                    "senha": "123456",
                    "role": "ADMINISTRADOR"
                }
                """;

        mockMvc.perform(post("/auth/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registro))
                .andExpect(status().isCreated());

        String login = """
                {
                    "email": "admin@teste.com",
                    "senha": "123456"
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(login))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.nome").value("Admin Teste"))
                .andExpect(jsonPath("$.role").value("ADMINISTRADOR"));
    }

    @Test
    void loginComCredenciaisInvalidasDeveRetornar400() throws Exception {
        String login = """
                {
                    "email": "inexistente@teste.com",
                    "senha": "errada"
                }
                """;

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(login))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registrarComEmailDuplicadoDeveRetornar400() throws Exception {
        String usuario = """
                {
                    "nome": "Joao",
                    "email": "duplicado@teste.com",
                    "senha": "123456"
                }
                """;

        mockMvc.perform(post("/auth/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(usuario))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/registrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(usuario))
                .andExpect(status().isBadRequest());
    }
}
