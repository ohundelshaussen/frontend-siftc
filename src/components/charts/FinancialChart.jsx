import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, AreaSeries } from 'lightweight-charts';
import { mockOhlcData } from '../../services/mocks/ohlcMocks';
import { useTema } from '../../context/ThemeContext';
import './FinancialChart.css';

const PALETTE = {
  azulNoche: '#151D33',
  azulAcero: '#264E7A',
  verdeAlza: '#24A460',
  rojoBajada: '#D9534F',
  textoGris: '#5A6375'
};

export const FinancialChart = ({ entidadNombre = 'Entidad Beta', ticker = 'ENT-02' }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  const [tipoGrafica, setTipoGrafica] = useState('velas');
  const [periodo, setPeriodo] = useState('1M');
  const [hoverData, setHoverData] = useState(null);

  // Colores de la gráfica según el tema (claro u oscuro)
  const { tema } = useTema();
  const C = tema === 'dark'
    ? { fondo: '#151D33', texto: '#A9B3CA', rejilla: '#222C47', borde: '#2D3958', cruz: '#8DB8E8', etiqueta: '#2D3958', rojo: '#E5645F', linea: '#8DB8E8', areaArriba: 'rgba(141, 184, 232, 0.35)', areaAbajo: 'rgba(141, 184, 232, 0)' }
    : { fondo: '#FFFFFF', texto: PALETTE.textoGris, rejilla: '#F1F5F9', borde: '#E2E8F0', cruz: PALETTE.azulAcero, etiqueta: PALETTE.azulNoche, rojo: PALETTE.rojoBajada, linea: PALETTE.azulAcero, areaArriba: 'rgba(38, 78, 122, 0.35)', areaAbajo: 'rgba(38, 78, 122, 0.0)' };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: C.fondo },
        textColor: C.texto,
      },
      grid: {
        vertLines: { color: C.rejilla },
        horzLines: { color: C.rejilla },
      },
      rightPriceScale: { borderColor: C.borde },
      timeScale: { borderColor: C.borde, timeVisible: true, rightOffset: 2 }, // para que no se corte la ultima fecha
      crosshair: {
        vertLine: { color: C.cruz, labelBackgroundColor: C.etiqueta },
        horzLine: { color: C.cruz, labelBackgroundColor: C.etiqueta },
      },
    });

    chartRef.current = chart;

    if (tipoGrafica === 'velas') {
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: PALETTE.verdeAlza,
        downColor: C.rojo,
        borderUpColor: PALETTE.verdeAlza,
        borderDownColor: C.rojo,
        wickUpColor: PALETTE.verdeAlza,
        wickDownColor: C.rojo,
      });
      candlestickSeries.setData(mockOhlcData);
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: C.areaArriba,
        bottomColor: C.areaAbajo,
        lineColor: C.linea,
        lineWidth: 2,
      });
      const lineData = mockOhlcData.map(item => ({ time: item.time, value: item.close }));
      areaSeries.setData(lineData);
    }

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || param.point.x < 0 || param.point.y < 0) {
        setHoverData(null);
        return;
      }
      const dataPoint = mockOhlcData.find((d) => d.time === param.time);
      if (dataPoint) setHoverData(dataPoint);
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoGrafica, tema]);

  const handlePeriodoChange = (nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  const ultimoDato = mockOhlcData[mockOhlcData.length - 1];
  const datoMostrar = hoverData || ultimoDato;

  return (
    <div className="grafica-wrapper">
      <div className="grafica-card-container">
        
        {/* Cabecera superior idéntica al Mockup */}
        <div className="grafica-header-top">
          <div>
            <div className="grafica-breadcrumb">Gráficas / {entidadNombre}</div>
            <div className="grafica-title-row">
              <h1 className="grafica-title">{entidadNombre}</h1>
              <span className="grafica-ticker">{ticker}</span>
              <span className="grafica-badge-finanzas">Finanzas</span>
            </div>
          </div>

          <div className="grafica-header-right-group">
            <div className="grafica-entidad-selector-wrapper">
              <span className="grafica-selector-label">Entidad</span>
              <select className="grafica-select-entidad" defaultValue="ENT-02">
                <option value="ENT-01">Entidad Alfa · ENT-01</option>
                <option value="ENT-02">Entidad Beta · ENT-02</option>
                <option value="ENT-03">Entidad Gamma · ENT-03</option>
              </select>
            </div>

            <div className="grafica-price-display-box">
              <span className="grafica-main-value">78,5</span>
              <span className="grafica-main-change">▲ +1,55 %</span>
            </div>
          </div>
        </div>

        {/* Fila de controles (Velas/Línea y Periodos) */}
        <div className="grafica-controls-row">
          <div className="grafica-type-toggle">
            <button
              onClick={() => setTipoGrafica('velas')}
              className={`grafica-toggle-btn ${tipoGrafica === 'velas' ? 'active' : ''}`}
            >
              Velas
            </button>
            <button
              onClick={() => setTipoGrafica('linea')}
              className={`grafica-toggle-btn ${tipoGrafica === 'linea' ? 'active' : ''}`}
            >
              Línea
            </button>
          </div>

          <div className="grafica-period-group">
            {['1D', '1S', '1M', '1A', 'Máx.'].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodoChange(p)}
                className={`grafica-period-btn ${periodo === p ? 'active' : ''}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Lienzo de la Gráfica */}
        <div ref={chartContainerRef} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }} />

        {/* Tarjetas inferiores OHLC idénticas al mockup */}
        <div className="grafica-cards-grid">
          <div className="grafica-stat-card">
            <span className="grafica-stat-label">Fecha</span>
            <strong className="grafica-stat-value">{datoMostrar?.time}</strong>
          </div>
          <div className="grafica-stat-card">
            <span className="grafica-stat-label">Apertura</span>
            <strong className="grafica-stat-value">{datoMostrar?.open?.toFixed(1)}</strong>
          </div>
          <div className="grafica-stat-card">
            <span className="grafica-stat-label">Máximo</span>
            <strong className="grafica-stat-value">{datoMostrar?.high?.toFixed(1)}</strong>
          </div>
          <div className="grafica-stat-card">
            <span className="grafica-stat-label">Mínimo</span>
            <strong className="grafica-stat-value">{datoMostrar?.low?.toFixed(1)}</strong>
          </div>
          <div className="grafica-stat-card">
            <span className="grafica-stat-label">Cierre del día</span>
            <div className="grafica-stat-val-row">
              <strong className="grafica-stat-value">{datoMostrar?.close?.toFixed(1)}</strong>
              <span className="grafica-stat-change-tag">▲ +1,55 %</span>
            </div>
          </div>
        </div>

        <div className="grafica-footer-note">
          Datos de ejemplo · Serie diaria del Índice de Competitividad · Pasa el cursor sobre la gráfica para ver el detalle de cada día.
        </div>

      </div>
    </div>
  );
};

export const GraficaEntidad = FinancialChart;
export default FinancialChart;