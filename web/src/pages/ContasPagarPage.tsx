import { useEffect, useState } from 'react'
import api from '../services/api'
import { ContaPagar } from '../types'
import { colors, input, btnPrimary, btnSuccess, btnDanger, btnWarning, btnGhost, th, td, table, overlay, modal, label, badge, pageHeader, pageTitle, emptyState } from '../styles/theme'
import { formatBRL } from '../utils/format'

export default function ContasPagarPage() {
  const [contas, setContas] = useState<ContaPagar[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState(0)
  const [dataVencimento, setDataVencimento] = useState('')
  const [fornecedor, setFornecedor] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data } = await api.get('/contas-pagar')
    setContas(data)
  }

  function abrirNovo() {
    setEditId(null)
    setDescricao('')
    setValor(0)
    setDataVencimento('')
    setFornecedor('')
    setShowModal(true)
  }

  function abrirEditar(c: ContaPagar) {
    setEditId(c.id)
    setDescricao(c.descricao)
    setValor(c.valor)
    setDataVencimento(c.dataVencimento?.split('T')[0] || '')
    setFornecedor(c.fornecedor || '')
    setShowModal(true)
  }

  async function salvar() {
    try {
      const body = { descricao, valor, dataVencimento }
      if (fornecedor) Object.assign(body, { fornecedor })
      if (editId) {
        await api.put(`/contas-pagar/${editId}`, body)
      } else {
        await api.post('/contas-pagar', body)
      }
      setShowModal(false)
      carregar()
    } catch {
      alert('Erro ao salvar conta')
    }
  }

  async function pagar(id: number) {
    try {
      await api.put(`/contas-pagar/${id}/pagar`)
      carregar()
    } catch {
      alert('Erro ao pagar conta')
    }
  }

  async function estornar(id: number) {
    try {
      await api.put(`/contas-pagar/${id}/estornar`)
      carregar()
    } catch {
      alert('Erro ao estornar conta')
    }
  }

  return (
    <div>
      <div style={pageHeader}>
        <h1 style={pageTitle}>Contas a Pagar</h1>
        <button onClick={abrirNovo} style={btnPrimary}>Nova Conta</button>
      </div>
      <table style={table}>
        <thead>
          <tr style={{ background: colors.bg, textAlign: 'left' }}>
            <th style={th}>Descri&ccedil;&atilde;o</th>
            <th style={th}>Valor</th>
            <th style={th}>Vencimento</th>
            <th style={th}>Fornecedor</th>
            <th style={th}>Status</th>
            <th style={th}>A&ccedil;&otilde;es</th>
          </tr>
        </thead>
        <tbody>
          {contas.map(c => (
            <tr key={c.id} style={{
              borderBottom: `1px solid ${colors.border}`,
              textDecoration: c.pago ? 'line-through' : 'none',
              opacity: c.pago ? 0.5 : 1
            }}>
              <td style={td}>{c.descricao}</td>
              <td style={td}>{formatBRL(c.valor)}</td>
              <td style={td}>{c.dataVencimento ? new Date(c.dataVencimento).toLocaleDateString() : '-'}</td>
              <td style={td}>{c.fornecedor || '-'}</td>
              <td style={td}>
                <span style={badge(c.pago ? 'success' : 'warning')}>
                  {c.pago ? (c.dataPagamento ? `Paga ${new Date(c.dataPagamento).toLocaleDateString()}` : 'Paga') : 'Pendente'}
                </span>
              </td>
              <td style={td}>
                <button onClick={() => abrirEditar(c)} style={{ ...btnGhost, marginRight: 4 }}>Editar</button>
                {!c.pago ? (
                  <button onClick={() => pagar(c.id)} style={btnSuccess}>Pagar</button>
                ) : (
                  <button onClick={() => estornar(c.id)} style={btnWarning}>Estornar</button>
                )}
              </td>
            </tr>
          ))}
          {contas.length === 0 && (
            <tr><td colSpan={6} style={emptyState}>Nenhuma conta</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, color: colors.text }}>{editId ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}</h2>
            <input placeholder="Descri&ccedil;&atilde;o" value={descricao} onChange={e => setDescricao(e.target.value)} style={input} />
            <input type="number" placeholder="Valor" value={valor} onChange={e => setValor(Number(e.target.value))} style={input} />
            <label style={label}>Data Vencimento</label>
            <input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} style={input} />
            <input placeholder="Fornecedor" value={fornecedor} onChange={e => setFornecedor(e.target.value)} style={input} />
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