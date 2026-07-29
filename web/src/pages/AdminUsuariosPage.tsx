import { useEffect, useState } from 'react'
import api from '../services/api'
import { Usuario } from '../types'
import { colors, input, btnPrimary, btnSuccess, btnDanger, btnWarning, btnGhost, th, td, table, overlay, modal, label, badge, pageHeader, pageTitle, emptyState } from '../styles/theme'

const roles = ['ADMINISTRADOR', 'GERENTE', 'FUNCIONARIO']

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [role, setRole] = useState('FUNCIONARIO')
  const [showSenhaModal, setShowSenhaModal] = useState(false)
  const [senhaAlvoId, setSenhaAlvoId] = useState<number | null>(null)
  const [novaSenha, setNovaSenha] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data } = await api.get('/admin/usuarios')
    setUsuarios(data)
  }

  function abrirNovo() {
    setEditId(null)
    setNome('')
    setEmail('')
    setSenha('')
    setRole('FUNCIONARIO')
    setShowModal(true)
  }

  function abrirEditar(u: Usuario) {
    setEditId(u.id)
    setNome(u.nome)
    setEmail(u.email)
    setSenha('')
    setRole(u.role)
    setShowModal(true)
  }

  async function salvar() {
    try {
      if (editId) {
        await api.put(`/admin/usuarios/${editId}`, { nome, email })
      } else {
        await api.post('/admin/usuarios', { nome, email, senha, role })
      }
      setShowModal(false)
      carregar()
    } catch {
      alert('Erro ao salvar usuario')
    }
  }

  async function alterarRole(id: number, novaRole: string) {
    try {
      await api.put(`/admin/usuarios/${id}/role`, { role: novaRole })
      carregar()
    } catch {
      alert('Erro ao alterar role')
    }
  }

  async function toggleAtivo(id: number) {
    try {
      await api.put(`/admin/usuarios/${id}/ativo`)
      carregar()
    } catch {
      alert('Erro ao alterar status')
    }
  }

  function abrirResetSenha(id: number) {
    setSenhaAlvoId(id)
    setNovaSenha('')
    setShowSenhaModal(true)
  }

  async function resetarSenha() {
    if (!senhaAlvoId || !novaSenha) return
    try {
      await api.put(`/admin/usuarios/${senhaAlvoId}/senha`, { senha: novaSenha })
      setShowSenhaModal(false)
      alert('Senha redefinida com sucesso')
    } catch {
      alert('Erro ao redefinir senha')
    }
  }

  async function excluir(id: number, nome: string) {
    if (!confirm(`Excluir usuario "${nome}"?`)) return
    try {
      await api.delete(`/admin/usuarios/${id}`)
      carregar()
    } catch {
      alert('Erro ao excluir usuario')
    }
  }

  return (
    <div>
      <div style={pageHeader}>
        <h1 style={pageTitle}>Usuarios</h1>
        <button onClick={abrirNovo} style={btnPrimary}>Novo Usuario</button>
      </div>
      <table style={table}>
        <thead>
          <tr style={{ background: colors.bg, textAlign: 'left' }}>
            <th style={th}>ID</th>
            <th style={th}>Nome</th>
            <th style={th}>Email</th>
            <th style={th}>Role</th>
            <th style={th}>Ativo</th>
            <th style={th}>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id} style={{ borderBottom: `1px solid ${colors.border}`, opacity: u.ativo ? 1 : 0.5 }}>
              <td style={td}>{u.id}</td>
              <td style={td}>{u.nome}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>
                <span style={badge('info')}>{u.role}</span>
              </td>
              <td style={td}>
                <span style={badge(u.ativo ? 'success' : 'danger')}>{u.ativo ? 'Sim' : 'Nao'}</span>
              </td>
              <td style={td}>
                <select
                  value={u.role}
                  onChange={e => alterarRole(u.id, e.target.value)}
                  style={{ ...input, marginBottom: 0, marginRight: 4, width: 'auto', display: 'inline-block', padding: '4px 8px', fontSize: 12 }}
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <button onClick={() => abrirEditar(u)} style={{ ...btnGhost, marginRight: 4 }}>Editar</button>
                <button onClick={() => abrirResetSenha(u.id)} style={{ ...btnWarning, marginRight: 4 }}>Senha</button>
                <button onClick={() => toggleAtivo(u.id)} style={u.ativo ? btnDanger : btnSuccess}>
                  {u.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => excluir(u.id, u.nome)} style={{ ...btnDanger, marginLeft: 4 }}>Excluir</button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr><td colSpan={6} style={emptyState}>Nenhum usuario</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, color: colors.text }}>{editId ? 'Editar Usuario' : 'Novo Usuario'}</h2>
            <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} style={input} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={input} />
            {!editId && (
              <>
                <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} style={input} />
                <label style={label}>Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={input}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={btnGhost}>Cancelar</button>
              <button onClick={salvar} style={btnSuccess}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {showSenhaModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, color: colors.text }}>Redefinir Senha</h2>
            <label style={label}>Nova Senha</label>
            <input type="password" placeholder="Nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} style={input} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSenhaModal(false)} style={btnGhost}>Cancelar</button>
              <button onClick={resetarSenha} style={btnSuccess}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
