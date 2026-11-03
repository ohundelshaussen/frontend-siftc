# Despliegue del frontend ALZA (SIFTC)

## Antes de subir

Las variables `VITE_*` se incrustan en el build: no se leen en tiempo de ejecución.
Si cambias `VITE_API_URL`, hay que volver a compilar y volver a subir.

Valores de producción (los que ya tiene `.env`):

    VITE_USE_MOCK=false
    VITE_API_URL=https://siftc.onrender.com
    VITE_API_PREFIX=/api/v1
    VITE_API_TIMEOUT=60000
    VITE_FALLBACK_MOCK=false

## Compilar

    npm run build

Genera la carpeta `dist/`. Para revisarla antes de publicar:

    npm run preview

## Publicar

`public/_redirects` (Netlify) y `vercel.json` (Vercel) ya están configurados para que
las rutas de React Router funcionen al recargar la página.

### Opción A — Netlify Drop (sin cuenta de git, lo más rápido)

1. Entrar a https://app.netlify.com/drop
2. Arrastrar la carpeta `dist` completa.
3. Netlify devuelve una URL del tipo `https://<nombre>.netlify.app`.

### Opción B — Vercel por CLI (desde esta misma carpeta, sin repositorio)

    npx vercel        # primera vez: crea el proyecto
    npx vercel --prod # publica a producción

## Después de subir: CORS

El backend .NET debe incluir el dominio publicado en su política de CORS,
junto con `http://localhost:5173` para desarrollo. Sin eso el navegador
bloquea todas las peticiones y la app se ve vacía.

Síntoma en la consola del navegador: "blocked by CORS policy".

## Estado conocido al momento del despliegue (2026-11-01)

- Login, entidades, ranking y series OHLC: datos reales del servidor.
- Índice general: datos de ejemplo (no existe el endpoint).
- Filtro de dimensión del ranking: deshabilitado (`/metricas` devuelve 0 filas).
- Velas: sólo el periodo Trimestral trae rango real; Diaria y Mensual llegan planas.
- Crear usuarios: pendiente de los UUID de rol en `src/services/usuarioApi.js`.
