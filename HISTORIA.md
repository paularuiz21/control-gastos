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

### Corrección — Los gastos con tarjeta aparecían en el mes equivocado

**Qué pasaba:** un gasto cargado con tarjeta de crédito mostraba correctamente el mes en que iba a impactar (por ejemplo, "JUN"), pero en la lista de movimientos aparecía en el mes siguiente (julio en lugar de junio).

**Por qué pasaba:** en una mejora anterior se había hecho que el día de cierre de cada tarjeta pudiera variar por mes. Para eso se cambió el formato interno de ese dato. El problema es que una parte del código — la que calcula en qué mes cae realmente el gasto — quedó sin actualizar y seguía leyendo el dato en el formato viejo, que ahora no reconocía. Ante la confusión, siempre sumaba dos meses en lugar de uno.

**Cómo se resolvió:** se corrigió esa parte del código para que lea el día de cierre de la misma forma que el resto de la app ya lo hacía.

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

---

### Funcionalidad 3 — Gastos compartidos entre dos personas

**Qué resuelve:** Paula y Leandro comparten muchos gastos del hogar — expensas, supermercado, salidas. Antes cada uno lo registraba por separado o se perdía el rastro de quién pagó qué y cuánto se debían.

**Cómo funciona:**
- Al cargar un gasto, se puede marcar como "compartido" e indicar si lo pagó Paula o Leandro
- La app divide el monto automáticamente (por defecto al 50%) y registra la parte de cada uno
- Se lleva un saldo en tiempo real: cuánto le debe uno al otro, mes por mes
- Cuando alguien salda la deuda, se registra como pago y el saldo se actualiza

**Cómo se hizo:** se creó un espacio compartido en Firestore donde ambos usuarios tienen acceso. Cada gasto compartido queda guardado ahí, y la app de cada uno lo sincroniza automáticamente mostrando solo su parte proporcional. No hace falta que estén los dos conectados al mismo tiempo.

---

### Funcionalidad 4 — Carga desde foto para gastos compartidos

La funcionalidad de foto (que ya existía para gastos personales) se extendió también a los gastos compartidos. Si Leandro paga el supermercado y saca foto del ticket, la app pre-completa el formulario y registra su parte automáticamente.

---

### Funcionalidad 5 — ClearFigures: nuevo nombre y dominio propio

**Qué cambió:** la app dejó de llamarse "Control de Gastos" y pasó a llamarse **ClearFigures**. Se registró el dominio `clearfigures.app` — ahora la app vive en esa dirección en lugar del link técnico de GitHub.

**Por qué:** tener un dominio propio resolvió también el problema del popup de login de Google, que antes no podía mostrar el nombre correcto sin dominio registrado. Además le da a la app una identidad más propia.

**Qué más cambió visualmente:**
- Se diseñó un logo nuevo: tres barras apiladas bicolores que representan a dos personas que comparten gastos. El ícono funciona como acceso directo en el celular.
- La app se puede **instalar como aplicación nativa** desde Safari en iPhone o desde Chrome en Android — aparece en la pantalla de inicio igual que una app descargada de la App Store, sin necesidad de publicarla en ninguna tienda.

---

### Mejora — Resumen rediseñado

**Qué mejoró:** la pantalla de Resumen era difícil de leer, con demasiada información a la vez y números que no siempre cuadraban.

**Qué se hizo:**
- Los indicadores de Indispensable/Discrecional pasaron de ser tarjetas grandes a chips pequeños, solo para referencia rápida
- Se quitó la sección de "gastos recurrentes" del resumen (era confusa y poco útil)
- Cada categoría ahora tiene un botón **"+"** que se puede expandir para ver el detalle de cada gasto individual, con fecha y monto. Al expandir, los números siempre coinciden exactamente con lo que muestra la pestaña Movimientos
- Se corrigió un error donde los gastos compartidos aparecían con signo negativo en el detalle, haciendo que la suma diera cero

---

### Corrección — Configuración sin scroll

**Qué pasaba:** al abrir la pantalla de Configuración en un celular, el contenido quedaba cortado y no se podía hacer scroll para ver las opciones de abajo (la clave de API de fotos, por ejemplo).

**Cómo se resolvió:** se corrigió el panel de configuración para que tenga scroll cuando el contenido no entra en pantalla.

---

### Corrección — Botón de foto desaparecía al borrar la clave de API

**Qué pasaba:** si la usuaria borraba su clave de API de Anthropic (necesaria para la carga por foto), el botón "Cargar desde foto" desaparecía del formulario.

**Cómo se resolvió:** ahora el botón siempre está visible. Si no hay clave configurada, al tocarlo lleva directamente a la pantalla de Configuración para agregarla.

---

### Corrección — El balance se adelantaba 3 horas (bug de zona horaria)

**Qué pasaba:** la noche del 30 de junio, cerca de las 22hs, el total del Balance saltó de golpe a un número mucho más alto y los gastos "en cola" (los que impactan el mes siguiente) desaparecieron — como si ya fuera 1 de julio, cuando en Argentina todavía faltaban dos horas.

**Por qué pasaba:** para saber "qué día es hoy", la app leía el reloj en horario de Greenwich (UTC), que va 3 horas adelantado respecto de Argentina. Desde las 21hs de acá, para la app ya era el día siguiente. La mayoría de las noches el error era invisible, pero en el cambio de mes movía toda la cola de gastos pendientes de golpe.

**Cómo se resolvió:** se corrigió la app para que lea la fecha en hora local. De paso quedó arreglada también la fecha por defecto al cargar un gasto de noche (proponía la fecha de mañana).

---

### Mejora — El Balance agrupa por mes de impacto

**Qué mejoró:** al destaparse el bug anterior, apareció una inconsistencia que siempre había estado oculta: el detalle del Balance agrupaba los gastos por la fecha en que se **pagaron**, mientras que Movimientos y Resumen agrupan por el mes en que **impactan** (clave para los gastos con tarjeta). Al llegar julio, los gastos de tarjeta que impactaban ese mes se dispersaban entre mayo y junio en vez de formar su propio grupo.

**Cómo quedó:** ahora el Balance agrupa igual que el resto de la app. Cuando un gasto llega a su mes de impacto, forma un grupo nuevo arriba del mes anterior (ej. JULIO arriba de JUNIO). La cola de "Pendiente — activa cuando llegue el mes de impacto" sigue funcionando igual que siempre.

---

### Corrección — Restaurar desde la papelera no devolvía el gasto al Balance

**Qué pasaba:** al restaurar un gasto compartido desde la papelera, volvía a aparecer en Movimientos pero no en el Balance. El gasto quedaba "huérfano": la deuda con la otra persona no se recalculaba.

**Por qué pasaba:** un gasto compartido vive en dos lugares a la vez — el registro personal y la entrada en el espacio compartido del grupo. Al borrar, la app guardaba en la papelera solo el registro personal; la entrada del grupo se perdía. Al restaurar, no había con qué reconstruirla.

**Cómo se resolvió (en dos etapas):**
1. La papelera ahora guarda también la entrada del grupo. Restaurar re-crea las dos partes: Movimientos y Balance quedan consistentes para ambos usuarios.
2. Lo mismo para el caso inverso: si la **otra persona** borra un gasto compartido, la copia que va a tu papelera también guarda lo necesario para restaurarlo completo.

**Aviso:** los gastos borrados antes de esta corrección no tienen guardada la entrada del grupo — restaurarlos solo los devuelve a Movimientos; hay que recargarlos a mano.

---

### Mejora — Eliminar transferencias ahora es seguro

**Qué pasaba:** el botón de eliminar una transferencia en el Balance borraba directo: sin confirmación, sin poder deshacer y sin pasar por la papelera. Un toque accidental significaba un pago perdido para siempre, y el balance cambiaba silenciosamente para los dos.

**Cómo se resolvió:** ahora pide confirmación antes de borrar, y la transferencia va a la papelera (30 días), desde donde se puede restaurar.

---

### Mejora — Ediciones simultáneas ya no se pisan entre sí

**Qué pasaba (riesgo latente):** cuando alguien editaba o borraba un gasto compartido, la app subía a la nube la **lista completa** de gastos del grupo, calculada desde su copia local. Si la otra persona había agregado o cambiado algo en ese mismo momento, ese cambio se **pisaba en silencio** — sin error ni aviso. El caso más grave estaba en el ingreso al grupo: al aceptar una invitación se reescribía el documento completo del grupo, pudiendo borrar gastos cargados en ese instante. Es el candidato más probable para las pérdidas "misteriosas" de datos del pasado.

**Cómo se resolvió:** todas las escrituras pasaron a ser **atómicas por elemento**: en vez de subir la lista entera, se le dice a la base de datos exactamente qué entrada sacar y cuál agregar. La nube aplica cada operación sin tocar el resto, aunque los dos estén escribiendo a la vez. Además quedó definida una regla de conflicto sensata: si uno borra un gasto que el otro acaba de editar, sobrevive la edición (antes podía perderse todo).

---

### Funcionalidad 6 — Notificaciones push

**Qué resuelve:** igual que Tricount — cuando la otra persona carga un gasto compartido o registra una transferencia, te llega una notificación al celular aunque la app esté cerrada: *"Leandro cargó Supermercado — Total $8.500 · tu parte $4.250"*.

**Cómo funciona:**
- Cada uno activa las notificaciones una sola vez desde **Configuración → Notificaciones → Activar** (el navegador pide permiso).
- Al cargar un gasto compartido o una transferencia, la app le avisa automáticamente al otro.
- Tocando la notificación se abre ClearFigures.

**Cómo se hizo:** se usó Firebase Cloud Messaging (el sistema de notificaciones de Google). Tres piezas: un *service worker* (código que corre en segundo plano en el celular y muestra la notificación), un registro del "buzón" de cada usuario en la base de datos, y un intermediario en Cloudflare que es quien realmente envía la notificación — porque para enviar hace falta una credencial secreta que no puede estar en el código público de la app. Todo dentro de los planes gratuitos.

**Limitaciones conocidas:**
- En iPhone requiere iOS 16.4+ y que la app esté **instalada en la pantalla de inicio** (no abierta desde el navegador).
- iOS puede "dormir" las notificaciones web si la app no se abre por semanas — limitación de Apple para todas las apps web.
- Si el que carga el gasto está sin conexión, el aviso sale cuando recupera internet.

---

## Análisis de robustez — temas identificados a futuro

De una revisión general del código (julio 2026) quedaron identificados:

- ~~**Ediciones simultáneas**~~ — ✅ resuelto (ver sección anterior).
- **Múltiples grupos de balance:** hoy la app soporta un solo grupo de exactamente 2 personas. Tener varios grupos (ej. uno con la pareja y otro con hermanas) requiere cambios medianos; grupos de 3+ personas requieren rediseñar el cálculo del balance.
- **Gasto solo-Balance:** poder cargar algo que genere deuda en el balance pero no aparezca como gasto propio en Movimientos (ej. adelantarle plata a alguien).

---

## Próximas funcionalidades

| Funcionalidad | Descripción |
|---|---|
| **Comparativa con mes anterior** | En el resumen, mostrar el delta respecto al mismo mes del año anterior (ej. +12% vs mayo 2025) |
| **Cierre de mes** | Al entrar en un mes nuevo, la app propone cerrar el anterior con un resumen y archivarlo |
| **Historial anual** | Archivo de gastos de años anteriores, con posibilidad de consulta |
| **Balance: meses colapsados** | En la vista de balance, los meses anteriores arrancan minimizados; solo el mes actual aparece expandido |
| **Onboarding animado** | Intro tipo video al entrar por primera vez (en revisión, sin publicar) |
| **Múltiples grupos de balance** | Poder tener un balance con la pareja y otro con otras personas (ej. hermanas) |
| **Gasto solo-Balance** | Cargar deudas que no son gastos propios (ej. adelantos de plata) |

---

*Documento actualizado: julio 2026*
