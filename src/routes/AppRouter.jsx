import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Layout from '../components/layout/Layout'
import ProtectedRoute from './ProtectedRoute'
import {
  ROLES_CON_ACCESO_RANKING,
  ROLES_CON_ACCESO_COMPARADOR,
  ROLES_LECTURA_PARAMETROS,
} from '../constants/permisos'

// Cada pantalla se descarga solo cuando se entra a ella (menos peso al cargar el tablero)
const Dashboard = lazy(() => import('../pages/Dashboard'))
const FinancialChart = lazy(() => import('../components/charts/FinancialChart'))
const Ranking = lazy(() => import('../components/ranking/Ranking'))
const Comparador = lazy(() => import('../components/comparador/Comparador'))
const Administracion = lazy(() => import('../pages/Administracion'))

export default function AppRouter() {
  return (
    <Suspense fallback={<p style={{ padding: 24 }}>Cargando…</p>}>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas generales para todos los usuarios autenticados (Catálogo entidades, OHLC, Métricas) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/grafica" element={<FinancialChart />} />
          </Route>
        </Route>

        {/* HU-FE-07 Matriz de Permisos: Ranking (Usuario móvil tiene SA -> bloqueado) */}
        <Route element={<ProtectedRoute rolesPermitidos={ROLES_CON_ACCESO_RANKING} />}>
          <Route element={<Layout />}>
            <Route path="/ranking" element={<Ranking />} />
          </Route>
        </Route>

        {/* HU-FE-07 Matriz de Permisos: Comparador (requiere acceso al ranking) */}
        <Route element={<ProtectedRoute rolesPermitidos={ROLES_CON_ACCESO_COMPARADOR} />}>
          <Route element={<Layout />}>
            <Route path="/comparar" element={<Comparador />} />
          </Route>
        </Route>

        {/* HU-FE-07 Matriz de Permisos: Administración y Parámetros (Administrador, Analista, Auditor) */}
        <Route element={<ProtectedRoute rolesPermitidos={ROLES_LECTURA_PARAMETROS} />}>
          <Route element={<Layout />}>
            <Route path="/administracion" element={<Administracion />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}
