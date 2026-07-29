import { useEffect, useState } from 'react'
import api from '../services/api'
import { ContaReceber, Cliente } from '../types'
import { colors, input, btnPrimary, btnSuccess, btnDanger, btnWarning, btnGhost, th, td, table, overlay, modal, label, badge, pageHeader, pageTitle, emptyState } from '../styles/theme'
import { formatBRL } from '../utils/format'

export default function ContasReceberPage() {
  const [contas, setContas] = useState<ContaReceber[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState(0)
  const [dataVencimento, setDataVencimento] = useState('')
  const [clienteId, setClienteId] = useState<number | ''>('')

  useEffect(() => {
    carregar()
    api.get('/clientes').then(r => setClientes(r.data))
  }, [])

  async function carregar() {
    const { data } = await api.get('/contas-receber')
    setContas(data)
  }

  function abrirNovo() {
    setEditId(null)
    setDescricao('')
    setValor(0)
    setDataVencimento('')
    setClienteId('')
    setShowModal(true)
  }

  function abrirEditar(c: ContaReceber) {
    setEditId(c.id)
    setDescricao(c.descricao)
    setValor(c.valor)
    setDataVencimento(c.dataVencimento?.split('T')[0] || '')
    setClienteId(c.cliente?.id || '')
    setShowModal(true)
  }

  async function salvar() {
    try {
      const body: any = { descricao, valor, dataVencimento }
      if (clienteId) body.cliente = { id: Number(clienteId) }
      if (editId) {
        await api.put(`/contas-receber/${editId}`, body)
      } else {
        await api.post('/contas-receber', body)
      }
      setShowModal(false)
      carregar()
    } catch {
      alert('Erro ao salvar conta')
    }
  }

  async function receber(id: number) {
    try {
      await api.put(`/contas-receber/${id}/receber`)
      carregar()
    } catch {
      alert('Erro ao receber conta')
    }
  }

  async function estornar(id: number) {
    try {
      await api.put(`/contas-receber/${id}/estornar`)
      carregar()
    } catch {
      alert('Erro ao estornar conta')
    }
  }

  return (
    <div>
      <div style={pageHeader}>
        <h1 style={pageTitle}>Contas a Receber</h1>
        <button onClick={abrirNovo} style={btnPrimary}>Nova Conta</button>
      </div>
      <table style={table}>
        <thead>
          <tr style={{ background: colors.bg, textAlign: 'left' }}>
            <th style={th}>Descri&ccedil;&atilde;o</th>
            <th style={th}>Valor</th>
            <th style={th}>Vencimento</th>
            <th style={th}>Cliente</th>
            <th style={th}>Status</th>
            <th style={th}>A&ccedil;&otilde;es</th>
          </tr>
        </thead>
        <tbody>
          {contas.map(c => (
            <tr key={c.id} style={{
              borderBottom: `1px solid ${colors.border}`,
              textDecoration: c.recebido ? 'line-through' : 'none',
              opacity: c.recebido ? 0.5 : 1
            }}>
              <td style={td}>{c.descricao}</td>
              <td style={td}>{formatBRL(c.valor)}</td>
              <td style={td}>{c.dataVencimento ? new Date(c.dataVencimento).toLocaleDateString() : '-'}</td>
              <td style={td}>{c.cliente?.nome || '-'}</td>
              <td style={td}>
                <span style={badge(c.recebido ? 'success' : 'warning')}>
                  {c.recebido ? (c.dataRecebimento ? `Recebida ${new Date(c.dataRecebimento).toLocaleDateString()}` : 'Recebida') : 'Pendente'}
                </span>
              </td>
              <td style={td}>
                <button onClick={() => abrirEditar(c)} style={{ ...btnGhost, marginRight: 4 }}>Editar</button>
                {!c.recebido ? (
                  <button onClick={() => receber(c.id)} style={btnSuccess}>Receber</button>
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
            <h2 style={{ marginTop: 0, color: colors.text }}>{editId ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}</h2>
            <input placeholder="Descri&ccedil;&atilde;o" value={descricao} onChange={e => setDescricao(e.target.value)} style={input} />
            <input type="number" placeholder="Valor" value={valor} onChange={e => setValor(Number(e.target.value))} style={input} />
            <label style={label}>Data Vencimento</label>
            <input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} style={input} />
            <label style={label}>Cliente</label>
            <select value={clienteId} onChange={e => setClienteId(Number(e.target.value))} style={input}>
              <option value="">Selecione...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
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