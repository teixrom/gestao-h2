import { useEffect, useState } from 'react'
import api from '../services/api'
import { Venda, Cliente, Produto } from '../types'
import { colors, input, btnPrimary, btnSuccess, btnDanger, btnWarning, btnGhost, th, td, table, overlay, modal, label, badge, card, pageHeader, pageTitle, emptyState } from '../styles/theme'
import { formatBRL } from '../utils/format'

const formasPagamento = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO']

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [showModal, setShowModal] = useState(false)
  const [clienteId, setClienteId] = useState<number | ''>('')
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO')
  const [itens, setItens] = useState<{ produtoId: number | ''; quantidade: number }[]>([])

  useEffect(() => {
    carregar()
    api.get('/clientes').then(r => setClientes(r.data))
    api.get('/produtos').then(r => setProdutos(r.data))
  }, [])

  async function carregar() {
    const { data } = await api.get('/vendas')
    setVendas(data)
  }

  function abrirNovo() {
    setClienteId('')
    setFormaPagamento('DINHEIRO')
    setItens([{ produtoId: '', quantidade: 1 }])
    setShowModal(true)
  }

  function addItem() {
    setItens([...itens, { produtoId: '', quantidade: 1 }])
  }

  function updateItem(index: number, field: string, value: number | string) {
    const novo = [...itens]
    novo[index] = { ...novo[index], [field]: value }
    setItens(novo)
  }

  function removeItem(index: number) {
    setItens(itens.filter((_, i) => i !== index))
  }

  function calcularTotal() {
    return itens.reduce((acc, item) => {
      const prod = produtos.find(p => p.id === item.produtoId)
      return acc + (prod ? prod.precoVenda * item.quantidade : 0)
    }, 0)
  }

  async function salvar() {
    try {
      await api.post('/vendas', {
        cliente: { id: Number(clienteId) },
        formaPagamento,
        itens: itens.map(i => ({
          produto: { id: Number(i.produtoId) },
          quantidade: i.quantidade
        }))
      })
      setShowModal(false)
      carregar()
    } catch {
      alert('Erro ao criar venda')
    }
  }

  async function cancelar(id: number) {
    try {
      await api.post(`/vendas/${id}/cancelar`)
      carregar()
    } catch {
      alert('Erro ao cancelar venda')
    }
  }

  return (
    <div>
      <div style={pageHeader}>
        <h1 style={pageTitle}>Vendas</h1>
        <button onClick={abrirNovo} style={btnPrimary}>Nova Venda</button>
      </div>
      <table style={table}>
        <thead>
          <tr style={{ background: colors.bg, textAlign: 'left' }}>
            <th style={th}>ID</th>
            <th style={th}>Cliente</th>
            <th style={th}>Total</th>
            <th style={th}>Pagamento</th>
            <th style={th}>Data</th>
            <th style={th}>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {vendas.map(v => (
            <tr key={v.id} style={{ borderBottom: `1px solid ${colors.border}`, textDecoration: v.cancelada ? 'line-through' : 'none', opacity: v.cancelada ? 0.5 : 1 }}>
              <td style={td}>{v.id}</td>
              <td style={td}>{v.cliente?.nome}</td>
              <td style={td}>{formatBRL(v.total)}</td>
              <td style={td}>{v.formaPagamento}</td>
              <td style={td}>{new Date(v.data).toLocaleDateString()}</td>
              <td style={td}>
                {!v.cancelada && (
                  <button onClick={() => cancelar(v.id)} style={btnDanger}>Cancelar</button>
                )}
              </td>
            </tr>
          ))}
          {vendas.length === 0 && (
            <tr><td colSpan={6} style={emptyState}>Nenhuma venda</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, color: colors.text }}>Nova Venda</h2>
            <label style={label}>Cliente</label>
            <select value={clienteId} onChange={e => setClienteId(Number(e.target.value))} style={input}>
              <option value="">Selecione...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <label style={label}>Forma Pagamento</label>
            <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} style={input}>
              {formasPagamento.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <h3 style={{ marginBottom: 8, color: colors.text }}>Itens</h3>
            {itens.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select value={item.produtoId} onChange={e => updateItem(i, 'produtoId', Number(e.target.value))} style={{ ...input, marginBottom: 0, flex: 1 }}>
                  <option value="">Produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} - {formatBRL(p.precoVenda)}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={e => updateItem(i, 'quantidade', Number(e.target.value))}
                  style={{ ...input, marginBottom: 0, width: 80 }}
                  min={1}
                />
                <span style={{ minWidth: 80, textAlign: 'right', color: colors.text }}>
                  {item.produtoId && produtos.find(p => p.id === item.produtoId)
                    ? formatBRL(produtos.find(p => p.id === item.produtoId)!.precoVenda * item.quantidade)
                    : formatBRL(0)}
                </span>
                <button onClick={() => removeItem(i)} style={{ ...btnDanger, padding: '6px 10px' }}>X</button>
              </div>
            ))}
            <button onClick={addItem} style={{ ...btnGhost, marginBottom: 12 }}>+ Adicionar Item</button>

            <div style={{ textAlign: 'right', fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: colors.text }}>
              Total: {formatBRL(calcularTotal())}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={btnGhost}>Cancelar</button>
              <button onClick={salvar} style={btnSuccess}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}