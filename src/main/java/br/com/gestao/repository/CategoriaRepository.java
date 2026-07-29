package br.com.gestao.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gestao.entity.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    boolean existsByNome(String nome);
}
