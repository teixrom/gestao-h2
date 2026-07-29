import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { colors, shadows, card, btnGhost } from '../styles/theme'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/produtos', label: 'Produtos', icon: '📦' },
  { to: '/vendas', label: 'Vendas', icon: '💰' },
  { to: '/categorias', label: 'Categorias', icon: '📁' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
  { to: '/estoque', label: 'Estoque', icon: '📋' },
  { to: '/contas-pagar', label: 'Contas a Pagar', icon: '💸' },
  { to: '/contas-receber', label: 'Contas a Receber', icon: '💵' },
  { to: '/admin/usuarios', label: 'Admin', icon: '⚙️' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const nome = localStorage.getItem('nome')

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  const currentPath = window.location.pathname

  function isActive(to: string) {
    if (to === '/') return currentPath === '/'
    return currentPath.startsWith(to)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: 240,
        background: colors.primary,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: shadows.lg,
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ padding: '20px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 24 }}>📊</span>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.02em' }}>Gestão</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: colors.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              fontWeight: 600,
            }}>
              {nome ? nome.charAt(0).toUpperCase() : '👤'}
            </div>
            <span style={{ fontSize: 14, opacity: 0.85, fontWeight: 500 }}>{nome}</span>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 16px' }} />

        <div style={{ flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const active = isActive(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  margin: '2px 8px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  borderLeft: active ? '3px solid #e94560' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 16px' }} />

        <div style={{ padding: '12px 16px' }}>
          <button
            onClick={logout}
            style={{
              ...btnGhost,
              color: 'rgba(255,255,255,0.65)',
              borderColor: 'rgba(255,255,255,0.2)',
              width: '100%',
              justifyContent: 'flex-start',
              gap: 12,
              padding: '12px 16px',
              fontSize: 14,
              borderRadius: 8,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
            }}
          >
            <span style={{ fontSize: 18 }}>🚪</span>
            Sair
          </button>
        </div>
      </nav>

      <main style={{
        flex: 1,
        padding: 24,
        background: colors.bg,
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
