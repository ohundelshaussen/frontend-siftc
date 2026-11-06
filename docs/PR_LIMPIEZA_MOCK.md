# Propuesta de Pull Request — `limpieza-mock`

## Título sugerido
`chore(mock): eliminar modo simulado y alinear frontend exclusivamente con API externa en Render`

## Descripción del Pull Request

### Resumen
Este Pull Request elimina de forma definitiva el modo simulado (`USE_MOCK`, `VITE_USE_MOCK`) y los datos de demostración de la primera entrega que ya no se utilizan en el proyecto. Todas las peticiones del frontend (`login`, `entidades`, `ohlc`, `ranking`, `métricas`, catálogos derivados) apuntan ahora directamente al servicio externo desplegado en Render (`https://siftc.onrender.com`), cuyo contrato público está gobernado por `docs/api/openapi-v1.json`.

---

### ¿Por qué se realizó este cambio?
1. **Decisión del equipo:** El backend real ya está en producción en Render y las pruebas de desarrollo se realizan con la API desplegada.
2. **Mitigación de riesgo de seguridad (Control ISO/IEC 27001:2022 A.8.28, A.8.5, A.8.26):**
   En `src/services/api.js`, la condición original `import.meta.env.VITE_USE_MOCK !== 'false'` evaluaba a `true` si la variable de entorno no estaba explícitamente configurada. En despliegues en la nube o entornos de CI/CD donde faltara `.env`, `npm run build` compilaba la aplicación en modo mock, emitiendo JWTs falsos y aceptando cualquier credencial sin validación real en base de datos (Hallazgo **B-12 (FE)** en `docs/LOGIN_CONTEXT.md`).

---

### Cambios realizados por tema

1. **Lógica de mock en `src/services/api.js`:**
   - Eliminada la bandera `USE_MOCK` y `FALLBACK_MOCK`.
   - Eliminadas las funciones sintéticas de login simulado (`crearTokenMock`, `aBase64Url`, `DURACION_SESION_MOCK_SEG`) y la bifurcación mock en `login()`.
   - Reemplazado `conRespaldoMock` por `conReintentoDeArranque` directo hacia los endpoints de Render.
   - Actualizado el comentario obsoleto de la línea 24 (puerto 7123 / Docker) por la referencia al contrato oficial OpenAPI en Render.
   - Fijado `export const USA_DATOS_DE_EJEMPLO = false` para mantener compatibilidad con `src/components/tablero/IndiceGeneral.jsx`.
2. **Datos falsos:**
   - Eliminado `src/services/mocks/rankingMocks.js` (clasificado como `(a) SOLO MOCK`).
   - Se mantuvieron `src/services/mocks/ohlcMocks.js` y `src/services/mocks/marketMocks.js` (clasificados como `(b) COMPARTIDO`) porque `FinancialChart.jsx` importa `mockOhlcData` como estado inicial antes de que termine la petición a la API.
3. **Variables de entorno:**
   - Removido `VITE_USE_MOCK` de `.env.example`, `.env` y `scripts/diagnostico-api.mjs`.
4. **Documentación:**
   - Actualizados `README.md` y `DESPLIEGUE.md`.
   - En `docs/LOGIN_CONTEXT.md`, se agregó en la Sección 0 la constancia de eliminación del modo mock y se documentó el hallazgo B-12 (FE) en la matriz de brechas de la Sección 4.1.
   - Actualizado `docs/LIMPIEZA_BACKEND_OBSOLETO_Y_ALCANCE_FRONTEND.md` con la sección 10 detallando esta fase.

---

### Verificación local ejecutada
- [x] `npm run lint`: 0 errores, 0 warnings.
- [x] `npm run build`: compilación limpia (`dist/`).
- [x] `npm run dev`: smoke test de arranque en `http://localhost:5173/` verificado.
- [x] No se realizaron pruebas contra `https://siftc.onrender.com`.
