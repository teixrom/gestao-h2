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

import br.com.gestao.entity.Cliente;
import br.com.gestao.entity.ContaReceber;
import br.com.gestao.repository.ClienteRepository;
import br.com.gestao.repository.ContaReceberRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/contas-receber")
public class ContaReceberController {

    private final ContaReceberRepository repository;
    private final ClienteRepository clienteRepository;

    public ContaReceberController(ContaReceberRepository repository, ClienteRepository clienteRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public List<ContaReceber> listar(@RequestParam(required = false) String situacao) {
        if ("pendentes".equals(situacao)) return repository.findByRecebidoFalse();
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<ContaReceber> criar(@RequestBody ContaReceber conta) {
        if (conta.getCliente() != null && conta.getCliente().getId() != null) {
            Cliente cliente = clienteRepository.findById(conta.getCliente().getId()).orElseThrow();
            conta.setCliente(cliente);
        }
        return ResponseEntity.status(201).body(repository.save(conta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaReceber> atualizar(@PathVariable Long id, @RequestBody ContaReceber dados) {
        ContaReceber conta = repository.findById(id).orElseThrow();
        conta.setDescricao(dados.getDescricao());
        conta.setValor(dados.getValor());
        conta.setDataVencimento(dados.getDataVencimento());
        if (dados.getCliente() != null && dados.getCliente().getId() != null) {
            Cliente cliente = clienteRepository.findById(dados.getCliente().getId()).orElseThrow();
            conta.setCliente(cliente);
        }
        return ResponseEntity.ok(repository.save(conta));
    }

    @PutMapping("/{id}/receber")
    public ResponseEntity<ContaReceber> receber(@PathVariable Long id) {
        ContaReceber conta = repository.findById(id).orElseThrow();
        conta.setRecebido(true);
        conta.setDataRecebimento(LocalDate.now());
        return ResponseEntity.ok(repository.save(conta));
    }

    @PutMapping("/{id}/estornar")
    public ResponseEntity<ContaReceber> estornar(@PathVariable Long id) {
        ContaReceber conta = repository.findById(id).orElseThrow();
        conta.setRecebido(false);
        conta.setDataRecebimento(null);
        return ResponseEntity.ok(repository.save(conta));
    }
}
