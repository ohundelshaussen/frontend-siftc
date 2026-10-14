import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import FinancialChart from '../components/charts/FinancialChart';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Ruta para el Login del proyecto */}
      <Route path="/login" element={<Login />} />

      {/* Ruta para el Dashboard principal */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* RUTA DE PRUEBA RÁPIDA (RF-FE02): 
          Entra a http://localhost:5173/grafica para ver sólo tu tarea directamente */}
      <Route path="/grafica" element={
        <div style={{ padding: '40px', backgroundColor: '#151D33', minHeight: '100vh' }}>
          <FinancialChart entidadNombre="Entidad Beta (Prueba RF-FE02)" ticker="ENT-02" />
        </div>
      } />

      {/* Flujo normal: al entrar a la raíz va al Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Comodín para URLs no encontradas */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;