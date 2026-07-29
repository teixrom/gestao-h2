package br.com.gestao.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestao.entity.ContaReceber;

public interface ContaReceberRepository extends JpaRepository<ContaReceber, Long> {
    List<ContaReceber> findByDataVencimentoBetween(LocalDate inicio, LocalDate fim);
    List<ContaReceber> findByRecebidoFalse();
    List<ContaReceber> findByRecebidoFalseAndDataVencimentoBefore(LocalDate data);
}
