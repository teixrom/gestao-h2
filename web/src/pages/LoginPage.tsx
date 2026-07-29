import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data } = await api.post('/auth/login', { email, senha })
      localStorage.setItem('token', data.token)
      localStorage.setItem('nome', data.nome)
      localStorage.setItem('role', data.role)
      navigate('/')
    } catch {
      alert('Credenciais invalidas')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a2e' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 8, width: 320 }}>
        <h1 style={{ marginBottom: 24 }}>Entrar</h1>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} style={inputStyle} />
        <button type="submit" style={{ ...inputStyle, background: '#1a1a2e', color: '#fff', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 10,
  marginBottom: 12,
  borderRadius: 4,
  border: '1px solid #ccc',
  fontSize: 14,
  boxSizing: 'border-box'
}
