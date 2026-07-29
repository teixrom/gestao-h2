package br.com.gestao.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProdutoRequest(
    @NotBlank String nome,
    String descricao,
    String codigoBarras,
    Long categoriaId,
    String fotoUrl,
    BigDecimal precoCusto,
    @NotNull BigDecimal precoVenda,
    int estoqueMinimo
) {}
