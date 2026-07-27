# ClearFigures — Documentación del proyecto

Seguimiento de gastos compartidos entre Paula y Leandro. Para la historia narrada completa (por qué se hizo cada cosa, versión no técnica), ver [`HISTORIA.md`](./HISTORIA.md) en este mismo repo.

## Enlaces

| Qué | Dónde |
|---|---|
| App en vivo | https://clearfigures.app |
| Repositorio | https://github.com/paularuiz21/control-gastos |
| Hosting | GitHub Pages + dominio custom (`CNAME`) |

## Stack

- **Frontend:** React 18 + Babel — un solo `index.html`, sin build ni servidor
- **Datos:** Firebase Auth (Google Sign-In) + Firestore (compat v10), servidor São Paulo
- **Notificaciones:** Firebase Cloud Messaging + Cloudflare Worker (`clearfigures-push.paula-ruiz21.workers.dev`)
- **Carga por foto:** Claude (Anthropic) vía Cloudflare Worker proxy (`anthropic-proxy.paula-ruiz21.workers.dev`) — cada usuario con su propia key
- **PWA:** `manifest.json` + ícono SVG/PNG, instalable en iOS y Android

## Configuración

| Qué | Detalle |
|---|---|
| Proyecto Firebase | `proyecto-gastos-1c077` |
| Key de Anthropic | Cada usuario la carga en Configuración — se guarda solo en el dispositivo, nunca en la nube |
| Archivo principal | `index.html` (también sincronizado en OneDrive — editar siempre en Documents primero) |

## Identidad visual

- Paleta: `dark #1E293B` · `dark2 #334155` · `bg #F0EDE8` · `accent #E8450A` · `blue #1E3F75` · `comp #7C3AED` (gastos compartidos)
- Logo de tres barras apiladas bicolor (dos personas que comparten gastos)
- Header slate oscuro, "ClearFigures" en tipografía serif

## Funcionalidades

- Registro de gastos, ingresos y ahorro; tarjetas con lógica de cierre por mes
- Categorías editables, presupuesto mensual por categoría, multi-moneda ARS/USD
- Vista Personal y Compartida; gastos compartidos con balance en tiempo real
- Carga desde foto de comprobante (IA)
- Notificaciones push + campanita de novedades (fallback sin push)
- Papelera con restauración (gastos y transferencias)
- Login con Google, email o solo-dispositivo; sincronización multi-dispositivo con auto-reparación
- PWA instalable, exportar CSV

## Evolución (resumen — ver HISTORIA.md para el detalle)

- **v1 (mayo 2026):** carga rápida + export CSV compatible con el Excel original
- **v2:** rediseño completo — categorías editables, 3 tipos de movimiento, multi-moneda, presupuesto/ahorro configurables
- **v3 — ClearFigures:** sincronización multi-dispositivo, carga por foto, gastos compartidos con balance, dominio propio, notificaciones push, varios fixes críticos de sincronización (escrituras atómicas, ids de texto vs numéricos, zona horaria)

*(128 commits totales, del 9 de mayo al 25 de julio de 2026.)*

## Pendiente

- **Múltiples grupos:** hoy solo soporta un grupo de 2 personas
- **Gasto solo-Balance:** deuda sin que sea un gasto propio en Movimientos
- **Cierre de mes, historial anual, comparativa vs. año anterior**
- **Repo privado:** bloqueado por GitHub Pages gratis (requiere GitHub Pro o migrar a Vercel) — sin urgencia de seguridad, Paula eligió esperar

---
*Generado a partir de `HISTORIA.md` y el historial de commits.*
