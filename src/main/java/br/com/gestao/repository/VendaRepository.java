package br.com.gestao.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestao.entity.Venda;

public interface VendaRepository extends JpaRepository<Venda, Long> {
    List<Venda> findByDataBetweenOrderByDataDesc(LocalDateTime inicio, LocalDateTime fim);
    List<Venda> findByClienteIdOrderByDataDesc(Long clienteId);
    long countByDataBetween(LocalDateTime inicio, LocalDateTime fim);
}
