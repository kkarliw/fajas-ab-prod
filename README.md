# 🛍️ FAJAS AB Ecommerce

Aplicación frontend de ecommerce para **FAJAS AB**, construida con una base moderna de React y preparada para conectarse a un backend real. El objetivo del proyecto es vender fajas, brasieres, cinturillas, shorts y accesorios con una experiencia visual premium, navegación clara y estructura lista para escalar.

## ✨ Resumen del proyecto

Este repositorio contiene el **frontend completo** del ecommerce:

- Home editorial con secciones de marca y producto.
- Tienda con filtros, búsqueda y grilla de productos.
- Detalle de producto con galería, tallas y recomendaciones.
- Carrito lateral persistente.
- Checkout con validación de formularios.
- Autenticación demo, cuenta, PQR, páginas legales y soporte.
- Resultados de pago simulados.

El proyecto está listo para conectar un backend real mediante la capa `src/api/`, que por ahora funciona con **mock data** y demoras artificiales para simular carga.

## 🧱 Stack técnico

- **Vite** para desarrollo y build.
- **React** para la interfaz.
- **TypeScript** para tipado fuerte.
- **Tailwind CSS** para estilos.
- **Shadcn UI / Radix UI** para componentes accesibles.
- **Framer Motion** para animaciones.
- **React Router** para navegación.
- **TanStack Query** para futura capa de datos y cache.
- **React Hook Form + Zod** para formularios validados.
- **Lucide React** para iconografía.

## 🗂️ Estructura del proyecto

La organización está pensada por dominios.

### `src/pages/`
Pantallas y rutas del sitio.

- `Index.tsx`: home.
- `Shop.tsx`: catálogo y filtros.
- `ProductDetail.tsx`: detalle de producto.
- `Checkout.tsx`: checkout.
- `CheckoutSuccess.tsx` / `CheckoutError.tsx`: resultado de compra.
- `Login.tsx`, `Account.tsx`: acceso y cuenta.
- `FAQ.tsx`, `PQR.tsx`, `Contact.tsx`, `CareGuide.tsx`, `SizeGuide.tsx`, `ShippingReturns.tsx`, `PrivacyPolicy.tsx`, `TermsConditions.tsx`.

### `src/components/`
Componentes reutilizables de UI, layout y experiencia de compra.

- `Navbar`, `Footer`, `CartDrawer`, `ScrollToTop`.
- Secciones de home y tienda: `HeroSection`, `CategoriesSection`, `ProductsSection`, `Reviews`, `NewsletterSection`, etc.
- Componentes de carga: `ProductCardSkeleton`, `components/ui/Skeleton.tsx`.

### `src/context/`
Estado compartido de la app.

- `CartContext.tsx`: carrito persistente en `localStorage`.

### `src/api/`
Capa de acceso a datos.

- `client.ts`: wrapper base para requests.
- `products.ts`, `auth.ts`, `cart.ts`, `orders.ts`, `wishlist.ts`, `content.ts`.
- Actualmente todo está en **modo mock** para simular backend sin conectar infraestructura real.

### `src/types/`
DTOs compartidos entre frontend y backend.

- `dtos.ts`: productos, variantes, órdenes, usuario, dirección, cupón, PQR, etc.

### `src/data/`
Datos locales del catálogo y helpers de negocio.

- `catalog.ts`: catálogo base del ecommerce.

### `src/hooks/`
Hooks reutilizables.

### `src/lib/`
Helpers utilitarios.

## 🚀 Cómo correr el proyecto localmente

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd embrace-divine-form
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

```env
VITE_API_URL=http://localhost:3000
```

> Nota: por ahora la app sigue funcionando con mocks aunque `VITE_API_URL` esté definido. Cuando el backend esté listo, esa URL será usada por la capa `src/api/client.ts`.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Luego abrir la URL que entregue Vite, normalmente:

```bash
http://localhost:5173
```

## 📦 Scripts disponibles

```bash
npm run dev
```
Levanta el servidor de desarrollo.

```bash
npm run build
```
Genera la versión de producción.

```bash
npm run test
```
Ejecuta los tests con Vitest.

```bash
npm run lint
```
Ejecuta ESLint sobre el proyecto.

```bash
npm run preview
```
Sirve la build de producción de forma local.

## 🌍 Variables de entorno

### `VITE_API_URL`
URL base del backend cuando se conecte el API real.

Ejemplo:

```env
VITE_API_URL=https://api.fajasab.com
```

### Otras variables futuras recomendadas

- `VITE_WOMPI_PUBLIC_KEY`
- `VITE_APP_NAME`
- `VITE_CURRENCY=COP`

## 🔎 Estado actual del proyecto

**Estado: frontend completo con API mock.**

La app ya tiene:

- navegación completa;
- grilla de productos;
- detalle de producto;
- carrito;
- checkout;
- páginas de éxito/error de pago;
- login y cuenta;
- PQR y contacto;
- skeleton loaders y lazy loading por rutas;
- capa `src/api/` lista para reemplazar mocks por endpoints reales.

Lo que **aún no está conectado**:

- autenticación real;
- productos reales desde backend;
- órdenes persistidas;
- inventario real;
- wishlist real;
- bloques de contenido dinámico;
- cupones y pagos reales.

## 🏗️ Decisiones de arquitectura

### TanStack Query
Se mantiene porque más adelante permitirá:

- cache de catálogo;
- refetch automático;
- estados de carga y error consistentes;
- invalidación de datos tras compras o cambios de perfil.

### Zod
Se usa para validar formularios del lado del cliente y del servidor con el mismo contrato.

Ventajas:

- reglas consistentes entre frontend y backend;
- mensajes de error claros;
- validaciones composables;
- tipos inferidos desde el schema.

### React Router
La estructura de rutas está separada por páginas para facilitar:

- lazy loading por ruta;
- guards de autenticación;
- páginas de checkout y resultados;
- crecimiento futuro sin romper la navegación.

### DTOs compartidos
`src/types/dtos.ts` centraliza el contrato de datos para evitar divergencias entre UI y backend.

## 🔌 Puntos de integración pendientes con backend

La carpeta `src/api/` ya está preparada para cambiar mocks por endpoints reales. Los archivos que se deben conectar son:

- `src/api/client.ts`
- `src/api/products.ts`
- `src/api/auth.ts`
- `src/api/cart.ts`
- `src/api/orders.ts`
- `src/api/wishlist.ts`
- `src/api/content.ts`

Cuando el backend exista, estas funciones deben reemplazar:

- productos por `GET /api/products`
- detalle por `GET /api/products/:slug`
- login/register/me por `/auth/*`
- estimación de carrito por `/cart/estimate`
- checkout por `/orders` o `/checkout/initiate`
- favoritos por `/wishlist`
- bloques de contenido por `/content/blocks`

## 🇨🇴 Contexto colombiano

Este ecommerce está pensado para Colombia y por eso se tuvieron en cuenta estas decisiones:

- Los precios se manejan en **céntimos/cop centavos** dentro del frontend y backend.
- Las transacciones están pensadas para **Wompi**.
- El formulario de checkout usa validación de **celular colombiano**.
- El departamento se selecciona desde una lista de departamentos de Colombia.
- La moneda visual es **COP**.
- El flujo de envíos y PQR está alineado con operación local.

## ✅ Convenciones de trabajo

### Nombres de ramas

Usar prefijo:

```bash
codex/
```

Ejemplos:

- `codex/api-products`
- `codex/checkout-zod`
- `codex/private-route`

### Convención de commits

Usar commits cortos, claros y orientados a intención.

Ejemplos:

- `feat: add checkout validation`
- `fix: guard private routes`
- `chore: add api mock layer`
- `refactor: lazy load routes`

### Buenas prácticas

- mantener los cambios pequeños y por dominio;
- evitar mezclar UI con lógica de backend;
- usar DTOs comunes;
- no romper el estilo visual existente;
- preferir componentes reutilizables;
- validar todo input sensible con Zod.

## 🤝 Contribuir

1. Crear una rama nueva con prefijo `codex/`.
2. Hacer cambios pequeños y enfocados.
3. Ejecutar `npm run lint` y `npm run test` antes de enviar cambios importantes.
4. Mantener compatibilidad con el sistema visual existente.
5. No conectar el backend directamente en componentes de UI; usar `src/api/`.

## 📌 Próximos pasos recomendados

1. Conectar `src/api/` a backend real.
2. Implementar autenticación con sesión persistente.
3. Persistir pedidos, carrito y wishlist.
4. Agregar panel admin.
5. Integrar Wompi sandbox.
6. Centralizar contenido editable desde backend o CMS.

---

FAJAS AB está listo para pasar de frontend demo a ecommerce real con backend, sin rehacer la base visual ni la arquitectura de navegación.
