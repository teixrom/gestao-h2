import { useEffect, useState } from 'react'
import api from '../services/api'
import { Produto, Categoria } from '../types'
import { colors, shadows, input, btnPrimary, btnSuccess, btnDanger, btnWarning, btnGhost, th, td, table, overlay, modal, label, badge, card, pageHeader, pageTitle, emptyState } from '../styles/theme'
import { formatBRL } from '../utils/format'

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editProd, setEditProd] = useState<Produto | null>(null)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [codigoBarras, setCodigoBarras] = useState('')
  const [precoVenda, setPrecoVenda] = useState(0)
  const [precoCusto, setPrecoCusto] = useState(0)
  const [estoqueAtual, setEstoqueAtual] = useState(0)
  const [estoqueMinimo, setEstoqueMinimo] = useState(0)
  const [categoriaId, setCategoriaId] = useState<number | ''>('')

  useEffect(() => {
    carregar()
    api.get('/categorias').then(r => setCategorias(r.data))
  }, [])

  async function carregar() {
    const { data } = await api.get('/produtos')
    setProdutos(data)
  }

  function abrirNovo() {
    setEditProd(null)
    setNome('')
    setDescricao('')
    setCodigoBarras('')
    setPrecoVenda(0)
    setPrecoCusto(0)
    setEstoqueAtual(0)
    setEstoqueMinimo(0)
    setCategoriaId('')
    setShowModal(true)
  }

  function abrirEditar(p: Produto) {
    setEditProd(p)
    setNome(p.nome)
    setDescricao(p.descricao || '')
    setCodigoBarras(p.codigoBarras || '')
    setPrecoVenda(p.precoVenda)
    setPrecoCusto(p.precoCusto || 0)
    setEstoqueAtual(p.estoqueAtual)
    setEstoqueMinimo(p.estoqueMinimo)
    setCategoriaId(p.categoria?.id || '')
    setShowModal(true)
  }

  async function salvar() {
    try {
      const body = {
        nome,
        descricao,
        codigoBarras,
        precoVenda,
        precoCusto,
        estoqueAtual,
        estoqueMinimo,
        categoriaId: categoriaId || undefined
      }
      if (editProd) {
        await api.put(`/produtos/${editProd.id}`, body)
      } else {
        await api.post('/produtos', body)
      }
      setShowModal(false)
      carregar()
    } catch {
      alert('Erro ao salvar produto')
    }
  }

  async function desativar(id: number) {
    try {
      await api.delete(`/produtos/${id}`)
      carregar()
    } catch {
      alert('Erro ao desativar produto')
    }
  }

  return (
    <div>
      <div style={pageHeader}>
        <h1 style={pageTitle}>Produtos</h1>
        <button onClick={abrirNovo} style={btnPrimary}>Novo Produto</button>
      </div>
      <table style={table}>
        <thead>
          <tr style={{ background: colors.bg, textAlign: 'left' }}>
            <th style={th}>ID</th>
            <th style={th}>Nome</th>
            <th style={th}>Cod. Barras</th>
            <th style={th}>Preco Venda</th>
            <th style={th}>Estoque</th>
            <th style={th}>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(p => (
            <tr key={p.id} style={{ borderBottom: `1px solid ${colors.border}`, opacity: p.ativo === false ? 0.5 : 1 }}>
              <td style={td}>{p.id}</td>
              <td style={td}>{p.nome}</td>
              <td style={td}>{p.codigoBarras || '-'}</td>
              <td style={td}>{formatBRL(p.precoVenda)}</td>
              <td style={{ ...td, color: p.estoqueAtual <= p.estoqueMinimo ? colors.danger : colors.text, fontWeight: p.estoqueAtual <= p.estoqueMinimo ? 'bold' : 'normal' }}>
                {p.estoqueAtual}
              </td>
              <td style={td}>
                <button onClick={() => abrirEditar(p)} style={{ ...btnWarning, marginRight: 8 }}>Editar</button>
                <button onClick={() => desativar(p.id)} style={btnDanger}>Desativar</button>
              </td>
            </tr>
          ))}
          {produtos.length === 0 && (
            <tr><td colSpan={6} style={emptyState}>Nenhum produto</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0, color: colors.text }}>{editProd ? 'Editar Produto' : 'Novo Produto'}</h2>
            <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} style={input} />
            <input placeholder="Descricao" value={descricao} onChange={e => setDescricao(e.target.value)} style={input} />
            <input placeholder="Codigo Barras" value={codigoBarras} onChange={e => setCodigoBarras(e.target.value)} style={input} />
            <input type="number" placeholder="Preco Venda" value={precoVenda} onChange={e => setPrecoVenda(Number(e.target.value))} style={input} />
            <input type="number" placeholder="Preco Custo" value={precoCusto} onChange={e => setPrecoCusto(Number(e.target.value))} style={input} />
            <input type="number" placeholder="Estoque Atual" value={estoqueAtual} onChange={e => setEstoqueAtual(Number(e.target.value))} style={input} />
            <input type="number" placeholder="Estoque Minimo" value={estoqueMinimo} onChange={e => setEstoqueMinimo(Number(e.target.value))} style={input} />
            <label style={label}>Categoria</label>
            <select value={categoriaId} onChange={e => setCategoriaId(Number(e.target.value) || '')} style={input}>
              <option value="">Sem categoria</option>
              {categorias.map(c => (
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