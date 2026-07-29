package br.com.gestao.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CriarUsuarioRequest(
    @NotBlank String nome,
    @NotBlank @Email String email,
    @NotBlank String senha,
    String role
) {}
