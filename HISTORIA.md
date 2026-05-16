# Control de Gastos — Historia del proyecto

---

## El origen

La idea nació de una planilla Excel de seguimiento de gastos personales que ya existía, con hojas de Consolidado de gastos, Clasificación, Status y Presupuesto anual. El problema era que cargar datos en el Excel requería abrirlo cada vez, y no había una forma rápida y cómoda de registrar gastos en el momento.

---

## La app original — v1

Se construyó una mini app web en React que funcionaba como formulario de carga rápida, directamente en el chat de Claude. Permitía registrar gastos con categoría, monto, vía de pago y observación, y exportar un CSV compatible con el formato exacto del Excel para pegarlo en la hoja "Consolidado gastos".

Las categorías, la clasificación Indispensable/Discrecional y las columnas del CSV se definieron a partir de la planilla Excel real de la usuaria.

### Iteraciones de la v1

Se fueron agregando funcionalidades progresivamente:

- Tarjetas de crédito con lógica de cierre: si el gasto es antes del día de cierre impacta el mes siguiente, si es después impacta dos meses más tarde
- Cuatro tarjetas configuradas: VISA Santander, AMEX Santander, Mastercard Nación y VISA Nación, todas con cierre el día 19
- División de gastos en 2 para gastos compartidos con la pareja
- Resumen mensual con desglose por categoría y comparativa real vs presupuesto
- Datos del Excel precargados en la app para no perder el histórico

### Diseño — proceso de elección

Se presentaron tres opciones de diseño visual:
- **A:** Editorial oscuro
- **B:** Minimalista claro
- **C:** Moderno con acento naranja

Se eligió la **opción C**. El diseño usa fondo piedra cálido, header oscuro, tipografía Georgia para títulos en negrita y Barlow Condensed para etiquetas, iconos SVG geométricos propios sin emojis, y acento naranja quemado.

---

## La v2 — rediseño completo

Se reconstruyó la app desde cero con todas las mejoras acumuladas:

- Categorías editables desde la app, con ícono, nombre y tipo Indispensable/Discrecional configurables
- Nuevas categorías: Delivery, Comidas afuera, Suscripciones, Gastos extraordinarios, Salud, Estética/Belleza, Bienes muebles
- Tarjetas de crédito configurables con día de cierre variable por mes
- Tres tipos de movimiento: Gasto, Ingreso y Ahorro/Inversión, cada uno con sus propias categorías
- Categorías de Ingreso: Sueldo, Devolución impuestos, Bono, Aguinaldo, Otros
- Categorías de Ahorro: USD en cuenta, Inversiones varias, Otros
- Soporte de múltiples monedas ARS y USD con tipo de cambio manual
- Presupuesto mensual configurable por categoría y mes
- Objetivo de ahorro mensual configurable
- Remanente del mes: Ingresos − Gastos − Ahorro
- Vista Personal y Compartida separadas en el Resumen
- Presupuesto compartido para gastos del hogar
- Reporte anual con selector Personal/Compartido, barras de progreso y RAF por categoría
- Edición y eliminación de gastos ya cargados
- Exportar CSV para respaldar datos
- Publicación en GitHub Pages: https://paularuiz21.github.io/control-gastos/
- Diseño responsive para verse bien en celular y PC

---

## La v3 — sincronización entre dispositivos y nuevas funcionalidades

### Funcionalidad 1 — Usar la app desde cualquier dispositivo

**Limitación que resolvió:** los datos se guardaban únicamente en el dispositivo donde se cargaban. Lo que se registraba en el celular no aparecía en la computadora, y viceversa.

#### 1.1 — Elegir cómo ingresar a la app

**Qué ve el usuario:** al abrir la app, aparece una pantalla con tres opciones para entrar:
- **Continuar con Google** — usás tu cuenta de Gmail, sin crear nada nuevo
- **Continuar con Email** — creás una cuenta con cualquier email y una contraseña
- **Solo en este dispositivo** — entrás sin cuenta, los datos siguen guardándose únicamente en ese dispositivo, igual que antes

**Cómo se hizo:** se integró Firebase Authentication, un servicio de Google que maneja el login de forma segura. No se guarda ninguna contraseña en la app — Google o Firebase se encargan de verificar la identidad. Se programó una pantalla de bienvenida nueva que aparece antes de mostrar cualquier dato.

#### 1.2 — Guardar los datos en la nube

**Qué ve el usuario:** nada diferente. Los datos aparecen igual que antes, pero ahora cada cambio se guarda automáticamente en la nube. Al abrir la app en otro dispositivo con la misma cuenta, todo está ahí.

**Cómo se hizo:** se creó una base de datos en Firestore (un servicio de Google) ubicada en São Paulo — el servidor más cercano a Argentina. Cada vez que el usuario modifica algo, la app espera 1.5 segundos y luego guarda todo en la nube automáticamente. Ese pequeño retraso evita guardar con cada letra que se escribe.

#### 1.3 — Proteger los datos de cada usuario

**Qué ve el usuario:** nada. Pero sus datos son completamente privados — nadie más puede verlos ni modificarlos.

**Cómo se hizo:** se configuraron dos capas de seguridad:
- **Reglas en la base de datos:** cada usuario solo puede leer y escribir su propio espacio. Aunque alguien intentara acceder, la base de datos lo rechaza.
- **Restricción de la clave de acceso:** la clave que conecta la app con Firebase se limitó para que solo funcione desde el sitio oficial de la app. Si alguien copiara esa clave e intentara usarla desde otro sitio, no funcionaría.

---

### Corrección — Categorías de Ingreso y Ahorro no se guardaban

**Qué pasaba:** al editar los nombres de las categorías de Ingreso o Ahorro, los cambios se perdían al cerrar. Las categorías de Gasto sí se guardaban correctamente.

**Por qué pasaba:** en el código original, el botón "Guardar cambios" del panel de categorías solo procesaba las de tipo Gasto. Las de Ingreso y Ahorro tenían incluso una nota interna que decía *"en una versión futura esto podría guardarse"* — y nunca se había implementado.

**Cómo se resolvió:** se agregaron dos nuevos espacios de almacenamiento — uno para Ingreso y otro para Ahorro — conectados al mismo sistema de guardado automático. Se corrigió el botón para que procese los tres tipos al mismo tiempo.

---

### Funcionalidad 2 — Carga desde foto de comprobante

**Qué resuelve:** en vez de tipear manualmente cada gasto, la usuaria saca una foto del comprobante (ticket, email de tarjeta, comprobante de MercadoPago, resumen de PedidosYa) y la app lee los datos automáticamente y pre-completa el formulario.

**Cómo funciona:**
1. En el formulario de carga aparece el botón **"Cargar desde foto"**
2. Se abre el selector de archivos — permite elegir entre cámara o galería
3. La imagen se envía a Claude (la IA de Anthropic) que lee el comprobante
4. Claude extrae: monto, fecha, comercio, medio de pago, categoría sugerida
5. El formulario se completa automáticamente — la usuaria puede revisar y corregir antes de guardar

**Decisiones técnicas:**
- La funcionalidad requiere una clave de API de Anthropic (servicio pago, ~USD 0.01 por foto)
- Cada usuario configura su propia clave en la sección Configuración — así cada uno paga su propio uso
- La clave se guarda solo en el dispositivo, no se sube a la nube
- Para que funcione desde el navegador sin errores de seguridad, se implementó un intermediario (Cloudflare Worker) que hace de puente entre la app y la API de Anthropic

**Formatos reconocidos:** comprobantes de MercadoPago, emails de tarjetas Santander, pedidos de PedidosYa/Rappi, y cualquier comprobante con datos legibles.

---

## Próximas funcionalidades

| Funcionalidad | Descripción |
|---|---|
| **Balance compartido** | Registro de gastos entre dos personas con división configurable, saldo en tiempo real e historial de pagos |
| **PIN de seguridad** | La app pide un código antes de mostrar cualquier dato |

### Pendiente de definición

| Tema | Estado |
|---|---|
| Nombre en el popup de login de Google | Requiere dominio propio (ej: `controldegastos.app`) |

---

*Documento actualizado: mayo 2026*
