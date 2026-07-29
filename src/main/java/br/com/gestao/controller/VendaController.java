package br.com.gestao.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import br.com.gestao.entity.ItemVenda;
import br.com.gestao.entity.Produto;
import br.com.gestao.entity.Usuario;
import br.com.gestao.entity.Venda;
import br.com.gestao.repository.ClienteRepository;
import br.com.gestao.repository.ProdutoRepository;
import br.com.gestao.repository.VendaRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/vendas")
public class VendaController {

    private final VendaRepository vendaRepository;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;

    public VendaController(VendaRepository vendaRepository, ClienteRepository clienteRepository,
            ProdutoRepository produtoRepository) {
        this.vendaRepository = vendaRepository;
        this.clienteRepository = clienteRepository;
        this.produtoRepository = produtoRepository;
    }

    private Usuario getUsuarioLogado() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping
    public List<Venda> listar(@RequestParam(required = false) String inicio,
            @RequestParam(required = false) String fim) {
        if (inicio != null && fim != null) {
            return vendaRepository.findByDataBetweenOrderByDataDesc(
                    LocalDateTime.parse(inicio), LocalDateTime.parse(fim));
        }
        return vendaRepository.findByDataBetweenOrderByDataDesc(
                LocalDateTime.now().minusDays(30), LocalDateTime.now());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venda> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(vendaRepository.findById(id).orElseThrow());
    }

    @PostMapping
    public ResponseEntity<Venda> criar(@RequestBody @Valid Venda venda) {
        venda.setUsuario(getUsuarioLogado());
        venda.setCliente(clienteRepository.findById(venda.getCliente().getId()).orElseThrow());

        BigDecimal total = BigDecimal.ZERO;
        for (ItemVenda item : venda.getItens()) {
            Produto produto = produtoRepository.findById(item.getProduto().getId()).orElseThrow();
            if (produto.getEstoqueAtual() < item.getQuantidade()) {
                throw new RuntimeException("Estoque insuficiente para: " + produto.getNome());
            }
            item.setProduto(produto);
            item.setVenda(venda);
            item.setPrecoUnitario(produto.getPrecoVenda());
            item.setSubtotal(produto.getPrecoVenda().multiply(BigDecimal.valueOf(item.getQuantidade())));
            total = total.add(item.getSubtotal());
            produto.setEstoqueAtual(produto.getEstoqueAtual() - item.getQuantidade());
            produtoRepository.save(produto);
        }
        venda.setTotal(total);
        return ResponseEntity.status(201).body(vendaRepository.save(venda));
    }

    @PostMapping("/{id}/cancelar")
    @Transactional
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        Venda venda = vendaRepository.findById(id).orElseThrow();
        venda.setCancelada(true);
        for (ItemVenda item : venda.getItens()) {
            Produto produto = item.getProduto();
            produto.setEstoqueAtual(produto.getEstoqueAtual() + item.getQuantidade());
            produtoRepository.save(produto);
        }
        vendaRepository.save(venda);
        return ResponseEntity.noContent().build();
    }
}
