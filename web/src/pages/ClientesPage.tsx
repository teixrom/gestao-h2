import { useEffect, useState } from 'react'
import api from '../services/api'
import { Cliente } from '../types'
import { colors, input, btnPrimary, btnSuccess, btnDanger, btnWarning, btnGhost, th, td, table, overlay, modal, label, badge, card, pageHeader, pageTitle, emptyState } from '../styles/theme'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editCli, setEditCli] = useState<Cliente | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data } = await api.get('/clientes')
    setClientes(data)
  }

  function abrirNovo() {
    setEditCli(null)
    setNome('')
    setEmail('')
    setTelefone('')
    setEndereco('')
    setShowModal(true)
  }

  function abrirEditar(c: Cliente) {
    setEditCli(c)
    setNome(c.nome)
    setEmail(c.email || '')
    setTelefone(c.telefone || '')
    setEndereco(c.endereco || '')
    setShowModal(true)
  }

  async function salvar() {
    try {
      const body = { nome, email, telefone, endereco }
      if (editCli) {
        await api.put(`/clientes/${editCli.id}`, body)
      } else {
        await api.post('/clientes', body)
      }
      setShowModal(false)
      carregar()
    } catch {
      alert('Erro ao salvar cliente')
    }
  }

  async function deletar(id: number) {
    try {
      await api.delete(`/clientes/${id}`)
      carregar()
    } catch {
      alert('Erro ao deletar cliente')
    }
  }

  return (
    <div>
      <div style={pageHeader}>
        <h1 style={pageTitle}>Clientes</h1>
        <button onClick={abrirNovo} style={btnPrimary}>Novo Cliente</button>
      </div>
      <table style={table}>
        <thead>
          <tr style={{ background: colors.bg, textAlign: 'left' }}>
            <th style={th}>ID</th>
            <th style={th}>Nome</th>
            <th style={th}>Email</th>
            <th style={th}>Telefone</th>
            <th style={th}>Endereco</th>
            <th style={th}>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
              <td style={td}>{c.id}</td>
              <td style={td}>{c.nome}</td>
              <td style={td}>{c.email || '-'}</td>
              <td style={td}>{c.telefone || '-'}</td>
              <td style={td}>{c.endereco || '-'}</td>
              <td style={td}>
                <button onClick={() => abrirEditar(c)} style={{ ...btnWarning, marginRight: 8 }}>Editar</button>
                <button onClick={() => deletar(c.id)} style={btnDanger}>Deletar</button>
              </td>
            </tr>
          ))}
          {clientes.length === 0 && (
            <tr><td colSpan={6} style={emptyState}>Nenhum cliente</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, color: colors.text }}>{editCli ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} style={input} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={input} />
            <input placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} style={input} />
            <input placeholder="Endereco" value={endereco} onChange={e => setEndereco(e.target.value)} style={input} />
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