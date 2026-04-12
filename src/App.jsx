import { Routes, Route } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Partidos from './pages/Partidos'
import Ranking from './pages/Ranking'
import MisPredicciones from './pages/MisPredicciones'
import Admin from './pages/Admin'
import Cargando from './components/layout/Cargando'
import { useRegistrarUsuario } from './hooks/useRegistrarUsuario'

export default function App() {
  const { isLoading } = useAuth0()
  useRegistrarUsuario() // registra el usuario en MongoDB tras cada login

  if (isLoading) return <Cargando />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/mis-predicciones" element={<MisPredicciones />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  )
}
