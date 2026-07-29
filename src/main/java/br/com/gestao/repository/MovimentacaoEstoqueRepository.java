package br.com.gestao.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestao.entity.MovimentacaoEstoque;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    List<MovimentacaoEstoque> findByProdutoIdOrderByDataDesc(Long produtoId);
    List<MovimentacaoEstoque> findByDataBetweenOrderByDataDesc(LocalDateTime inicio, LocalDateTime fim);
}
