package br.com.gestao.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gestao.entity.Produto;
import br.com.gestao.entity.Venda;
import br.com.gestao.repository.ContaPagarRepository;
import br.com.gestao.repository.ContaReceberRepository;
import br.com.gestao.repository.MovimentacaoEstoqueRepository;
import br.com.gestao.repository.ProdutoRepository;
import br.com.gestao.repository.VendaRepository;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;
    private final ContaPagarRepository contaPagarRepository;
    private final ContaReceberRepository contaReceberRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    public DashboardController(VendaRepository vendaRepository, ProdutoRepository produtoRepository,
            ContaPagarRepository contaPagarRepository, ContaReceberRepository contaReceberRepository,
            MovimentacaoEstoqueRepository movimentacaoRepository) {
        this.vendaRepository = vendaRepository;
        this.produtoRepository = produtoRepository;
        this.contaPagarRepository = contaPagarRepository;
        this.contaReceberRepository = contaReceberRepository;
        this.movimentacaoRepository = movimentacaoRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> dashboard() {
        var inicioMes = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        var fimMes = LocalDateTime.now().withHour(23).withMinute(59);

        long totalVendas = vendaRepository.countByDataBetween(inicioMes, fimMes);
        List<Venda> vendas = vendaRepository.findByDataBetweenOrderByDataDesc(inicioMes, fimMes);
        BigDecimal faturamento = vendas.stream()
                .filter(v -> !v.isCancelada())
                .map(Venda::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long produtosBaixoEstoque = produtoRepository.findByAtivoTrue().stream()
                .filter(p -> p.getEstoqueAtual() <= p.getEstoqueMinimo())
                .count();

        long contasPagarPendentes = contaPagarRepository.findByPagoFalse().size();
        long contasReceberPendentes = contaReceberRepository.findByRecebidoFalse().size();

        var hoje = LocalDate.now();
        long contasPagarVencidas = contaPagarRepository.findByPagoFalseAndDataVencimentoBefore(hoje).size();
        long contasReceberVencidas = contaReceberRepository.findByRecebidoFalseAndDataVencimentoBefore(hoje).size();

        Map<String, Object> data = new HashMap<>();
        data.put("vendasMes", totalVendas);
        data.put("faturamentoMes", faturamento);
        data.put("produtosBaixoEstoque", produtosBaixoEstoque);
        data.put("contasPagarPendentes", contasPagarPendentes);
        data.put("contasReceberPendentes", contasReceberPendentes);
        data.put("contasPagarVencidas", contasPagarVencidas);
        data.put("contasReceberVencidas", contasReceberVencidas);
        return ResponseEntity.ok(data);
    }
}
