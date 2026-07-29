package br.com.gestao.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestao.entity.ContaPagar;

public interface ContaPagarRepository extends JpaRepository<ContaPagar, Long> {
    List<ContaPagar> findByDataVencimentoBetween(LocalDate inicio, LocalDate fim);
    List<ContaPagar> findByPagoFalse();
    List<ContaPagar> findByPagoFalseAndDataVencimentoBefore(LocalDate data);
}
