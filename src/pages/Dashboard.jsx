import React from 'react';
import { GraficaEntidad } from '../components/Graficas/GraficaEntidad';

export const Dashboard = () => {
  return (
    <div style={{ padding: '32px', backgroundColor: '#F6F5F3', minHeight: '100vh' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#151D33', margin: 0, fontSize: '28px' }}>
          Vista de Pruebas - Gráficas de Mercado
        </h1>
        <p style={{ color: '#5A6375', marginTop: '4px' }}>
          Módulo de visualización de series OHLC e Índice de Competitividad
        </p>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Componente de la Tarea HU-FE-02 */}
        <GraficaEntidad entidadNombre="Entidad Beta" ticker="ENT-02" />
      </main>
    </div>
  );
};

export default Dashboard;