package br.com.gestao.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestao.entity.ContaPagar;
import br.com.gestao.repository.ContaPagarRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/contas-pagar")
public class ContaPagarController {

    private final ContaPagarRepository repository;

    public ContaPagarController(ContaPagarRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ContaPagar> listar(@RequestParam(required = false) String situacao) {
        if ("pendentes".equals(situacao)) return repository.findByPagoFalse();
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<ContaPagar> criar(@RequestBody @Valid ContaPagar conta) {
        return ResponseEntity.status(201).body(repository.save(conta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaPagar> atualizar(@PathVariable Long id, @RequestBody ContaPagar dados) {
        ContaPagar conta = repository.findById(id).orElseThrow();
        conta.setDescricao(dados.getDescricao());
        conta.setValor(dados.getValor());
        conta.setDataVencimento(dados.getDataVencimento());
        conta.setFornecedor(dados.getFornecedor());
        return ResponseEntity.ok(repository.save(conta));
    }

    @PutMapping("/{id}/pagar")
    public ResponseEntity<ContaPagar> pagar(@PathVariable Long id) {
        ContaPagar conta = repository.findById(id).orElseThrow();
        conta.setPago(true);
        conta.setDataPagamento(LocalDate.now());
        return ResponseEntity.ok(repository.save(conta));
    }

    @PutMapping("/{id}/estornar")
    public ResponseEntity<ContaPagar> estornar(@PathVariable Long id) {
        ContaPagar conta = repository.findById(id).orElseThrow();
        conta.setPago(false);
        conta.setDataPagamento(null);
        return ResponseEntity.ok(repository.save(conta));
    }
}
