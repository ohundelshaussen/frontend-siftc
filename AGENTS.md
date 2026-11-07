# Reglas de Proyecto — ALZA (SIFTC)

## Estándares de Código y Diseño Visual
1. **Contrato de Backend:** La fuente única de verdad es `docs/api/openapi-v1.json` contra `https://siftc.onrender.com/api/v1`. Cero mocks, cero invenciones de campos.
2. **Diseño Visual Institucional (Anti-Ruido Visual de IA):**
   - Sigue los principios definidos en la skill `.agent/skills/clean-financial-design/SKILL.md`.
   - **Cero cajas anidadas:** No crear tarjetas dentro de tarjetas ni usar sombras pesadas o bordes dobles.
   - **Densidad de datos:** Las interfaces financieras deben priorizar datos tabulares (`mono-num`), alineación a la derecha de números y barras de progreso ultrafinas (`hairline 4px`).
   - **Color funcional:** La paleta debe ser sobria (grises de alta gama, blanco puro y azul pizarra). El verde y rojo se reservan estrictamente para variaciones alcistas o bajistas del mercado.
