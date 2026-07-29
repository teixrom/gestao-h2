package br.com.gestao.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestao.dto.ProdutoRequest;
import br.com.gestao.entity.Categoria;
import br.com.gestao.entity.Produto;
import br.com.gestao.repository.CategoriaRepository;
import br.com.gestao.repository.ProdutoRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    public ProdutoController(ProdutoRepository produtoRepository, CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public List<Produto> listar(@RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoriaId) {
        if (categoriaId != null) return produtoRepository.findByCategoriaId(categoriaId);
        if (q != null && !q.isBlank()) return produtoRepository.findByNomeContainingIgnoreCase(q);
        return produtoRepository.findByAtivoTrue();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(produtoRepository.findById(id).orElseThrow());
    }

    @PostMapping
    public ResponseEntity<Produto> criar(@RequestBody @Valid ProdutoRequest request) {
        Produto produto = new Produto();
        produto.setNome(request.nome());
        produto.setDescricao(request.descricao());
        produto.setCodigoBarras(request.codigoBarras());
        produto.setPrecoCusto(request.precoCusto());
        produto.setPrecoVenda(request.precoVenda());
        produto.setEstoqueMinimo(request.estoqueMinimo());
        if (request.categoriaId() != null) {
            produto.setCategoria(categoriaRepository.findById(request.categoriaId()).orElseThrow());
        }
        return ResponseEntity.status(201).body(produtoRepository.save(produto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizar(@PathVariable Long id, @RequestBody @Valid ProdutoRequest request) {
        Produto produto = produtoRepository.findById(id).orElseThrow();
        produto.setNome(request.nome());
        produto.setDescricao(request.descricao());
        produto.setCodigoBarras(request.codigoBarras());
        produto.setPrecoCusto(request.precoCusto());
        produto.setPrecoVenda(request.precoVenda());
        produto.setEstoqueMinimo(request.estoqueMinimo());
        if (request.categoriaId() != null) {
            produto.setCategoria(categoriaRepository.findById(request.categoriaId()).orElseThrow());
        }
        return ResponseEntity.ok(produtoRepository.save(produto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        Produto produto = produtoRepository.findById(id).orElseThrow();
        produto.setAtivo(false);
        produtoRepository.save(produto);
        return ResponseEntity.noContent().build();
    }
}
