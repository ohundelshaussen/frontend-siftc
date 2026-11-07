# Reglas de Proyecto — ALZA (SIFTC)

## Estándares Obligatorios de Código y Diseño Visual
1. **Contrato de Backend:** La fuente única de verdad es `docs/api/openapi-v1.json` contra `https://siftc.onrender.com/api/v1`. Cero mocks, cero invenciones de campos.
2. **Lectura Obligatoria de la Skill de Diseño Visual:**
   - Antes de crear, modificar o refactorizar cualquier archivo `.jsx` o `.css`, el agente **DEBE** leer y aplicar todas las métricas cuantitativas y reglas de [`.agent/skills/clean-financial-design/SKILL.md`](./.agent/skills/clean-financial-design/SKILL.md).
3. **Resumen de Métricas Visuales Inquebrantables:**
   - **Cero cajas anidadas y bordes de 1px:** `border-radius: 8px`, `border: 1px solid rgba(0,0,0,0.08)`, sin sombras pesadas ni `translateY` en hover.
   - **Cero prosa explicativa (Zero Instructional Copy):** Prohibidos subtítulos redundantes debajo de `<h1>`, textos tutoriales de cómo hacer clic o filtrar, etiquetas repetidas en cada tarjeta y banners promocionales internos.
   - **Controles y barras compactas:** Inputs/selects/botones de `36px` de alto (`font-size: 13px`), barras de progreso `hairline` de `3px–4px`, y datos numéricos en `.mono-num` alineados a la derecha.
   - **Adaptabilidad Multi-Pantalla (`360px` a `1440px+`):** Uso obligatorio de `clamp()`, rejillas `auto-fit`/`auto-fill` y `ResizeObserver` en todas las gráficas.
