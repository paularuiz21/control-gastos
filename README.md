# Control de Gastos 2026

Aplicación web de finanzas personales que resuelve tres problemas que la mayoría de las apps gratuitas no manejan juntos: tracking vs presupuesto con categorías propias, gastos compartidos con balance entre personas, e impacto financiero real de tarjetas de crédito (el gasto ocurre en un mes, pero impacta el presupuesto en otro).

🔗 **[App en producción](https://paularuiz21.github.io/control-gastos/)**

---

## El problema que resuelve

Las apps de finanzas personales más conocidas fallan en alguno de estos puntos:

- Tienen categorías fijas que no se adaptan a cómo uno organiza sus gastos
- No distinguen entre el mes en que se hace un gasto con tarjeta y el mes en que realmente impacta el presupuesto
- No contemplan que en un hogar de dos personas los gastos se mezclan y hay que saber quién pagó qué

Esta app nació para resolver exactamente eso.

---

## Funcionalidades principales

**Tracking y presupuesto**
- Registro de gastos e ingresos por categoría
- Categorías 100% configurables (agregar, editar, eliminar)
- Presupuesto mensual por categoría con seguimiento visual
- Objetivo de ahorro mensual configurable

**Tarjetas de crédito**
- Registro de tarjetas con fecha de cierre
- Los gastos en tarjeta se asignan al mes de impacto real, no al mes del gasto
- Configuración de nombre y últimos dígitos por tarjeta

**Gastos compartidos**
- Modo hogar: dos personas comparten una vista de gastos
- Balance automático de quién pagó qué y cuánto se debe
- Presupuesto compartido independiente del presupuesto personal
- Invitación por código sin necesidad de compartir credenciales

**Experiencia**
- Sincronización en la nube (Firebase Firestore)
- Login con Google o email/contraseña
- Modo local sin cuenta (datos en dispositivo)
- Undo al eliminar un gasto
- Diseño mobile-first

---

## Stack

| Tecnología | Por qué |
|---|---|
| React 18 | Componentes reutilizables, estado local sin overhead de un framework completo |
| Firebase Auth | Login con Google en minutos, sin manejar contraseñas propias |
| Firestore | Base de datos en tiempo real, gratis para uso personal, sin servidor que mantener |
| Babel standalone | Permite correr JSX directo en el browser sin build step — ideal para deploy simple en GitHub Pages |
| Claude Code | Desarrollo asistido por IA — iteración de código, debugging y decisiones de diseño |
| Claude (claude.ai) | Configuración del proyecto, documentación y estrategia de producto |

**Por qué Firebase y no localStorage:** Quería que los datos sobrevivieran entre dispositivos y que el modo compartido fuera real (dos personas viendo los mismos datos en tiempo real), no un export/import manual.

---

## Lo que aprendí construyéndola

Este proyecto lo desarrollé trabajando con **Claude Code**, lo que cambió bastante cómo pienso el proceso de construcción con IA:

- Aprendí a distinguir bugs de datos (Firestore) vs bugs de lógica (código) — al principio los confundía y pedía cambios en el lugar equivocado
- Mejoré en describir problemas con precisión: "el balance descuenta aunque borré el gasto" en vez de "el balance está mal"
- Entendí el ciclo completo: cambio de código → deploy → prueba → reporte → iteración
- Aprendí a pensar los trade-offs de diseño antes de pedirle a la IA que ejecute: link vs código, popup vs redirect, cuándo parar de testear

Lo más valioso fue desarrollar criterio para saber cuándo no pedir un cambio todavía — "lo voy a seguir monitoreando" antes de introducir más variables.

---

## Próximos pasos

- [ ] Visualización de gastos con gráficos (Power BI / charts)
- [ ] Exportar resumen mensual a PDF
- [ ] Análisis de tendencias con IA (integración con Anthropic API)
- [ ] Modo oscuro

---

## Cómo correrla localmente

Al ser un archivo HTML único con dependencias por CDN, no requiere instalación:

```bash
git clone https://github.com/paularuiz21/control-gastos.git
cd control-gastos
# Abrí index.html en tu browser
```

Para usar sincronización en la nube necesitás configurar tu propio proyecto en [Firebase Console](https://console.firebase.google.com) y reemplazar el bloque `FIREBASE_CONFIG` en `index.html`.

---

*Desarrollado por [Paula Ruiz](https://github.com/paularuiz21) · Buenos Aires, 2026*
