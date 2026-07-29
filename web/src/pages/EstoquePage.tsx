import { useEffect, useState } from 'react'
import api from '../services/api'
import { Produto, MovimentacaoEstoque } from '../types'
import { colors, input, btnPrimary, btnSuccess, btnDanger, btnWarning, btnGhost, th, td, table, overlay, modal, label, badge, card, pageHeader, pageTitle, emptyState } from '../styles/theme'

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtoId, setProdutoId] = useState<number | ''>('')
  const [mov, setMov] = useState<MovimentacaoEstoque[]>([])
  const [selectedProd, setSelectedProd] = useState<Produto | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [tipoMov, setTipoMov] = useState<'ENTRADA' | 'SAIDA' | 'AJUSTE'>('ENTRADA')
  const [quantidade, setQuantidade] = useState(0)
  const [observacao, setObservacao] = useState('')

  useEffect(() => {
    api.get('/produtos').then(r => setProdutos(r.data))
  }, [])

  async function selecionarProduto(id: number) {
    setProdutoId(id)
    const prod = produtos.find(p => p.id === id)
    setSelectedProd(prod || null)
    if (id) {
      const { data } = await api.get(`/estoque/movimentacoes/${id}`)
      setMov(data)
    } else {
      setMov([])
    }
  }

  function abrirMovimento(tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE') {
    setTipoMov(tipo)
    setQuantidade(0)
    setObservacao('')
    setShowModal(true)
  }

  async function confirmarMovimento() {
    try {
      const body = { produtoId: Number(produtoId), quantidade, observacao }
      await api.post(`/estoque/${tipoMov.toLowerCase()}`, body)
      setShowModal(false)
      selecionarProduto(Number(produtoId))
    } catch {
      alert('Erro ao registrar movimento')
    }
  }

  return (
    <div>
      <div style={pageHeader}>
        <h1 style={pageTitle}>Estoque</h1>
      </div>
      <div style={card}>
        <label style={{ ...label, marginBottom: 8 }}>Selecionar Produto</label>
        <select value={produtoId} onChange={e => selecionarProduto(Number(e.target.value))} style={input}>
          <option value="">Selecione...</option>
          {produtos.map(p => (
            <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.estoqueAtual})</option>
          ))}
        </select>
      </div>

      {selectedProd && (
        <>
          <div style={{ ...card, marginTop: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
            <strong style={{ color: colors.text }}>{selectedProd.nome}</strong>
            <span style={{ color: colors.text }}>Estoque atual: <strong>{selectedProd.estoqueAtual}</strong></span>
            <button onClick={() => abrirMovimento('ENTRADA')} style={btnSuccess}>Entrada</button>
            <button onClick={() => abrirMovimento('SAIDA')} style={btnDanger}>Saida</button>
            <button onClick={() => abrirMovimento('AJUSTE')} style={btnWarning}>Ajuste</button>
          </div>

          <table style={table}>
            <thead>
              <tr style={{ background: colors.bg, textAlign: 'left' }}>
                <th style={th}>ID</th>
                <th style={th}>Tipo</th>
                <th style={th}>Quantidade</th>
                <th style={th}>Observacao</th>
                <th style={th}>Data</th>
              </tr>
            </thead>
            <tbody>
              {mov.map(m => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={td}>{m.id}</td>
                  <td style={td}>
                    <span style={badge(m.tipo === 'ENTRADA' ? 'success' : m.tipo === 'SAIDA' ? 'danger' : 'warning')}>{m.tipo}</span>
                  </td>
                  <td style={td}>{m.quantidade}</td>
                  <td style={td}>{m.observacao || '-'}</td>
                  <td style={td}>{new Date(m.data).toLocaleString()}</td>
                </tr>
              ))}
              {mov.length === 0 && (
                <tr><td colSpan={5} style={emptyState}>Nenhuma movimentacao</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, color: colors.text }}>{tipoMov === 'ENTRADA' ? 'Entrada' : tipoMov === 'SAIDA' ? 'Saida' : 'Ajuste'} de Estoque</h2>
            <label style={label}>Quantidade</label>
            <input type="number" value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} style={input} />
            <label style={label}>Observacao</label>
            <input placeholder="Observacao" value={observacao} onChange={e => setObservacao(e.target.value)} style={input} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={btnGhost}>Cancelar</button>
              <button onClick={confirmarMovimento} style={btnSuccess}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}