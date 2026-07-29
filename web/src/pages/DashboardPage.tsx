import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { pageHeader, pageTitle, card, colors, btnWarning } from '../styles/theme'
import { formatBRL } from '../utils/format'

export default function DashboardPage() {
  const [data, setData] = useState<any>({})
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data))
  }, [])

  const cards = [
    { label: 'Vendas no Mes', value: data.vendasMes ?? '-' },
    { label: 'Faturamento', value: data.faturamentoMes != null ? formatBRL(data.faturamentoMes) : '-' },
    { label: 'Estoque Baixo', value: data.produtosBaixoEstoque ?? '-' },
    { label: 'Contas a Pagar', value: data.contasPagarPendentes ?? '-' },
    { label: 'Contas a Receber', value: data.contasReceberPendentes ?? '-' },
  ]

  const alertStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 16,
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
    padding: '12px 16px', marginTop: 16, flexWrap: 'wrap',
  }

  return (
    <div>
      <div style={pageHeader}>
        <h1 style={pageTitle}>Dashboard</h1>
      </div>

      {(data.contasPagarVencidas > 0 || data.contasReceberVencidas > 0) && (
        <div style={alertStyle}>
          <span style={{ fontSize: 20 }}>&#9888;&#65039;</span>
          {data.contasPagarVencidas > 0 && (
            <button onClick={() => navigate('/contas-pagar')} style={{ ...btnWarning, fontSize: 13 }}>
              {data.contasPagarVencidas} conta(s) a pagar vencida(s)
            </button>
          )}
          {data.contasReceberVencidas > 0 && (
            <button onClick={() => navigate('/contas-receber')} style={{ ...btnWarning, fontSize: 13 }}>
              {data.contasReceberVencidas} conta(s) a receber vencida(s)
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
        {cards.map(cardItem => (
          <div key={cardItem.label} style={card}>
            <p style={{ fontSize: 14, color: colors.textSecondary, margin: '0 0 8px 0' }}>{cardItem.label}</p>
            <p style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, margin: 0 }}>{cardItem.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}