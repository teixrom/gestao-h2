export interface Produto {
  id: number
  nome: string
  descricao?: string
  codigoBarras?: string
  categoria?: { id: number; nome: string }
  precoVenda: number
  precoCusto?: number
  estoqueAtual: number
  estoqueMinimo: number
  ativo?: boolean
}

export interface Venda {
  id: number
  cliente: { id: number; nome: string }
  total: number
  formaPagamento: string
  data: string
  itens: ItemVenda[]
  cancelada?: boolean
}

export interface ItemVenda {
  id?: number
  produto: { id: number; nome?: string }
  quantidade: number
  precoUnitario?: number
  subtotal?: number
}

export interface Cliente {
  id: number
  nome: string
  email?: string
  telefone?: string
  endereco?: string
}

export interface Categoria {
  id: number
  nome: string
  ativo?: boolean
}

export interface ContaPagar {
  id: number
  descricao: string
  valor: number
  dataVencimento: string
  dataPagamento?: string
  pago?: boolean
  fornecedor?: string
}

export interface ContaReceber {
  id: number
  descricao: string
  valor: number
  dataVencimento: string
  dataRecebimento?: string
  recebido?: boolean
  cliente?: { id: number; nome: string }
}

export interface Usuario {
  id: number
  nome: string
  email: string
  role: string
  ativo: boolean
}

export interface MovimentacaoEstoque {
  id: number
  produto: { id: number; nome: string }
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE'
  quantidade: number
  observacao?: string
  data: string
}

export interface DashboardData {
  vendasMes: number
  faturamentoMes: number
  produtosBaixoEstoque: number
  contasPagarPendentes: number
  contasReceberPendentes: number
}
