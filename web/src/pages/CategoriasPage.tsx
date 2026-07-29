import { useEffect, useState } from 'react'
import api from '../services/api'
import { Categoria } from '../types'
import { colors, input, btnPrimary, btnSuccess, btnDanger, btnWarning, btnGhost, th, td, table, overlay, modal, label, badge, card, pageHeader, pageTitle, emptyState } from '../styles/theme'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editCat, setEditCat] = useState<Categoria | null>(null)
  const [nome, setNome] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data } = await api.get('/categorias')
    setCategorias(data)
  }

  function abrirNovo() {
    setEditCat(null)
    setNome('')
    setShowModal(true)
  }

  function abrirEditar(c: Categoria) {
    setEditCat(c)
    setNome(c.nome)
    setShowModal(true)
  }

  async function salvar() {
    try {
      if (editCat) {
        await api.put(`/categorias/${editCat.id}`, { nome })
      } else {
        await api.post('/categorias', { nome })
      }
      setShowModal(false)
      carregar()
    } catch {
      alert('Erro ao salvar categoria')
    }
  }

  async function desativar(id: number) {
    try {
      await api.delete(`/categorias/${id}`)
      carregar()
    } catch {
      alert('Erro ao desativar categoria')
    }
  }

  return (
    <div>
      <div style={pageHeader}>
        <h1 style={pageTitle}>Categorias</h1>
        <button onClick={abrirNovo} style={btnPrimary}>Nova Categoria</button>
      </div>
      <table style={table}>
        <thead>
          <tr style={{ background: colors.bg, textAlign: 'left' }}>
            <th style={th}>ID</th>
            <th style={th}>Nome</th>
            <th style={th}>Ativo</th>
            <th style={th}>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map(c => (
            <tr key={c.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
              <td style={td}>{c.id}</td>
              <td style={td}>{c.nome}</td>
              <td style={td}>
                <span style={badge(c.ativo !== false ? 'success' : 'danger')}>{c.ativo !== false ? 'Sim' : 'Nao'}</span>
              </td>
              <td style={td}>
                <button onClick={() => abrirEditar(c)} style={{ ...btnWarning, marginRight: 8 }}>Editar</button>
                <button onClick={() => desativar(c.id)} style={btnDanger}>Desativar</button>
              </td>
            </tr>
          ))}
          {categorias.length === 0 && (
            <tr><td colSpan={4} style={emptyState}>Nenhuma categoria</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, color: colors.text }}>{editCat ? 'Editar Categoria' : 'Nova Categoria'}</h2>
            <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} style={input} />
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