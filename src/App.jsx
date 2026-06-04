import './App.css'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import ContainerPage from './pages/ContainerPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import RegisterPage from './pages/RegisterPage'
import AddJugadorPage from './pages/AddJugadorPage'
import AddCategoriaPage from './pages/AddCategoriaPage'
import VerJugadoresPage from './pages/VerJugadoresPage'
import PatchJugadoresPage from './pages/PatchJugadoresPage'
import VerEstadisticasPage from './pages/VerEstadisticasPage'
import { restoreSession } from './features/auth.slice'
import { BrowserRouter, Routes, Route } from "react-router"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const dispatch = useDispatch()

  // Restaurar sesión desde localStorage al cargar la app
  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      const usuarioJSON = localStorage.getItem('usuario')
      
      if (usuarioJSON && usuarioJSON !== 'undefined') {
        const usuarioObj = JSON.parse(usuarioJSON)
        dispatch(restoreSession({ token, usuario: usuarioObj }))
      } else {
        // Limpiar localStorage si hay datos inválidos
        localStorage.clear()
      }
    } catch (error) {
      // Si hay cualquier error, limpiar todo
      localStorage.clear()
    }
  }, [dispatch])

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<ContainerPage />} >
            <Route path="/dashboard/index" element={<DashboardPage />} />
          </Route>
          <Route path="/agregar-jugador" element={<AddJugadorPage />} />
          <Route path="/agregar-categoria" element={<AddCategoriaPage />} />
          <Route path="/ver-jugadores" element={<VerJugadoresPage />} />
          <Route path="/ver-estadisticas" element={<VerEstadisticasPage />} />
          <Route path="/jugadores/:jugadorId/editar" element={<PatchJugadoresPage />} />
        </Route>
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
