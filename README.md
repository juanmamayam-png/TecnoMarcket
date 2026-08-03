# TecnoMarket — Manual de usuario

Plataforma de e-commerce para TecnoMarket: catálogo en línea, compras
con pago, seguimiento de pedidos, facturación electrónica automática y
un panel administrativo para gestionar productos, inventario, ventas y
usuarios.

**Sitio en línea:** https://tecno-marcket-4emz.vercel.app

---

## ¿Qué puede hacer el sistema?

### Como cliente
- Buscar y filtrar productos por nombre, categoría, marca o rango de precio.
- Ver el detalle de cada producto, incluyendo el stock disponible en tiempo real.
- Agregar productos a un carrito de compras y editar cantidades.
- Pagar el pedido (pasarela de pago simulada — no se cobra dinero real).
- Recibir automáticamente la factura electrónica de cada compra.
- Ver el estado de sus pedidos (pagado → en preparación → enviado → entregado).
- Recibir notificaciones cuando cambia el estado de un pedido.

### Como administrador
Todo lo anterior, más:
- Crear, editar y desactivar productos.
- Ajustar el inventario manualmente (con motivo, para trazabilidad).
- Consultar reportes de ventas (por rango de fechas) e inventario.
- Avanzar el estado de los pedidos de los clientes (marcar como enviado, entregado, etc.).
- Gestionar los usuarios del sistema y sus roles (cliente, administrador, soporte).

---

## Cómo iniciar sesión

1. Entra a **https://tecno-marcket-4emz.vercel.app**
2. Haz clic en **"Ingresar"** (esquina superior derecha).
3. Usa una de estas dos opciones:

**Opción A — Cuenta de administrador (ya creada):**
| Campo | Valor |
|---|---|
| Email | `admin@tecnomarket.com` |
| Contraseña | `Admin123!` |

**Opción B — Crear una cuenta de cliente nueva:**
1. En la pantalla de login, haz clic en **"Regístrate"**.
2. Completa nombre, email, teléfono y contraseña.
3. Al registrarte, quedas automáticamente con sesión iniciada como cliente.

---

## Guía paso a paso — Flujo de compra (cliente)

1. **Explorar el catálogo**: en la página principal, usa la barra de
   búsqueda o los filtros (categoría, marca, precio mínimo/máximo) para
   encontrar un producto.
2. **Ver detalle**: haz clic sobre cualquier producto para ver su
   descripción completa y el stock disponible.
3. **Agregar al carrito**: elige la cantidad deseada y haz clic en
   **"Agregar al carrito"**.
4. **Ir al carrito**: haz clic en **"Carrito"** en la barra de
   navegación. Ahí puedes ajustar cantidades o quitar productos.
5. **Pagar**: haz clic en **"Continuar a pagar"**. Si no has iniciado
   sesión, te pedirá hacerlo primero.
6. **Checkout**: ingresa la dirección de envío y elige el medio de pago
   (Tarjeta o PSE) → clic en **"Pagar"**.
   - *Nota de prueba*: cualquier monto se aprueba automáticamente,
     excepto si el total del pedido fuera exactamente $1 (caso reservado
     para probar un pago rechazado).
7. **Confirmación**: tras el pago aprobado, se genera la factura
   electrónica automáticamente y puedes verla en el detalle del pedido.
8. **Seguimiento**: ve a **"Mis pedidos"** en cualquier momento para ver
   el estado actualizado (pagado, en preparación, enviado, entregado).

---

## Guía paso a paso — Panel administrativo

*(Requiere iniciar sesión con la cuenta de administrador.)*

1. Inicia sesión con `admin@tecnomarket.com` / `Admin123!`.
2. Haz clic en **"Panel admin"** en la barra de navegación.
3. Dentro encontrarás tres pestañas:
   - **Productos e inventario**: formulario para crear productos nuevos,
     tabla para editarlos/desactivarlos, y un control para ajustar
     stock (requiere indicar cantidad y motivo).
   - **Reportes**: ventas totales y por producto en un rango de fechas,
     más el estado actual del inventario y sus movimientos recientes.
   - **Usuarios y roles**: lista de usuarios registrados, con opción de
     cambiar su rol (cliente / administrador / soporte) o
     activar/desactivar su cuenta.
4. Para avanzar el estado de un pedido de un cliente: entra a
   **"Mis pedidos"** (los administradores ven todos los pedidos, no solo
   los propios) → abre el pedido → botón para marcarlo como
   "En preparación", "Enviado" o "Entregado" según corresponda. Esto
   notifica automáticamente al cliente.

---

## Notas importantes

- El pago es **simulado**: no se procesan pagos reales ni se cobra dinero.
- Los datos de productos son de ejemplo (portátil, smartphone, mouse,
  audífonos) cargados para propósitos de demostración.
- Si el catálogo aparece vacío o hay errores de conexión, puede deberse
  a que el backend está iniciando (los servicios gratuitos de Vercel a
  veces "duermen" tras inactividad y tardan unos segundos en responder
  la primera vez).
