package br.com.gestao.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestao.entity.MovimentacaoEstoque;
import br.com.gestao.entity.MovimentacaoEstoque.TipoMovimento;
import br.com.gestao.entity.Produto;
import br.com.gestao.repository.MovimentacaoEstoqueRepository;
import br.com.gestao.repository.ProdutoRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/estoque")
public class MovimentacaoEstoqueController {

    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final ProdutoRepository produtoRepository;

    public MovimentacaoEstoqueController(MovimentacaoEstoqueRepository movimentacaoRepository,
            ProdutoRepository produtoRepository) {
        this.movimentacaoRepository = movimentacaoRepository;
        this.produtoRepository = produtoRepository;
    }

    @GetMapping("/movimentacoes/{produtoId}")
    public List<MovimentacaoEstoque> historico(@PathVariable Long produtoId) {
        return movimentacaoRepository.findByProdutoIdOrderByDataDesc(produtoId);
    }

    @PostMapping("/entrada")
    public ResponseEntity<MovimentacaoEstoque> entrada(@RequestBody @Valid MovimentacaoEstoque mov) {
        Produto produto = produtoRepository.findById(mov.getProduto().getId()).orElseThrow();
        mov.setTipo(TipoMovimento.ENTRADA);
        produto.setEstoqueAtual(produto.getEstoqueAtual() + mov.getQuantidade());
        produtoRepository.save(produto);
        return ResponseEntity.status(201).body(movimentacaoRepository.save(mov));
    }

    @PostMapping("/saida")
    public ResponseEntity<MovimentacaoEstoque> saida(@RequestBody @Valid MovimentacaoEstoque mov) {
        Produto produto = produtoRepository.findById(mov.getProduto().getId()).orElseThrow();
        if (produto.getEstoqueAtual() < mov.getQuantidade()) {
            throw new RuntimeException("Estoque insuficiente");
        }
        mov.setTipo(TipoMovimento.SAIDA);
        produto.setEstoqueAtual(produto.getEstoqueAtual() - mov.getQuantidade());
        produtoRepository.save(produto);
        return ResponseEntity.status(201).body(movimentacaoRepository.save(mov));
    }

    @PostMapping("/ajuste")
    public ResponseEntity<MovimentacaoEstoque> ajuste(@RequestBody @Valid MovimentacaoEstoque mov) {
        Produto produto = produtoRepository.findById(mov.getProduto().getId()).orElseThrow();
        mov.setTipo(TipoMovimento.AJUSTE);
        produto.setEstoqueAtual(mov.getQuantidade());
        produtoRepository.save(produto);
        return ResponseEntity.status(201).body(movimentacaoRepository.save(mov));
    }
}
