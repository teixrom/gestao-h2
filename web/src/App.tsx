import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProdutosPage from './pages/ProdutosPage'
import VendasPage from './pages/VendasPage'
import CategoriasPage from './pages/CategoriasPage'
import ClientesPage from './pages/ClientesPage'
import EstoquePage from './pages/EstoquePage'
import ContasPagarPage from './pages/ContasPagarPage'
import ContasReceberPage from './pages/ContasReceberPage'
import AdminUsuariosPage from './pages/AdminUsuariosPage'
import Layout from './components/Layout'

export default function App() {
  const token = localStorage.getItem('token')

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/produtos" element={<ProdutosPage />} />
        <Route path="/vendas" element={<VendasPage />} />
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/estoque" element={<EstoquePage />} />
        <Route path="/contas-pagar" element={<ContasPagarPage />} />
        <Route path="/contas-receber" element={<ContasReceberPage />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
