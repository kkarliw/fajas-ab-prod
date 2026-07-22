# 🧭 DEVELOPMENT PLAN — FAJAS AB

Documento práctico de referencia diaria para avanzar el proyecto **FAJAS AB Ecommerce** como desarrollador sola/o con apoyo de IA (Codex/Claude) a tiempo completo.

La idea de este plan es simple: mantener el foco, evitar prompts gigantes, preservar estabilidad y avanzar por capas sin romper la base visual ni la arquitectura.

---

## 📌 Estado actual

### Frontend ya hecho

- Home editorial con secciones de marca y producto.
- Tienda con filtros, búsqueda, grilla y estado visual.
- Detalle de producto con galería, tallas, tabs y productos relacionados.
- Carrito lateral persistente.
- Checkout con validación y páginas de éxito/error.
- Login, cuenta, FAQ, PQR, contacto y legales.
- Skeleton loaders y lazy loading por rutas.
- Guard de ruta privada para `/account`.
- DTOs compartidos en `src/types/dtos.ts`.
- README técnico ya documentado.

### Capa mock de API ya cubre

- `src/api/client.ts`
- `src/api/products.ts`
- `src/api/auth.ts`
- `src/api/cart.ts`
- `src/api/orders.ts`
- `src/api/wishlist.ts`
- `src/api/content.ts`

Esto ya permite:

- simular carga con delay de 400ms;
- preparar el frontend para backend real;
- definir contratos de datos sin mezclar UI con fetch directo;
- avanzar con TanStack Query después.

---

## 🤖 Reglas para trabajar con IA

Estas reglas se siguen siempre.

### 1. Siempre dar contexto

Antes de pedir una feature, compartir:

- archivos relevantes;
- comportamiento esperado;
- restricciones visuales;
- errores actuales si los hay.

No pedir cambios sin mostrar el estado real del área afectada.

### 2. Una feature por prompt

Nunca pedir todo junto.

Correcto:

- una página;
- un endpoint;
- un formulario;
- una migración;
- una mejora de UX.

Incorrecto:

- “haz el backend completo”;
- “arregla todo el ecommerce”;
- “conecta auth, checkout, orders y admin en un solo prompt”.

### 3. Después de cada prompt

Secuencia obligatoria:

1. revisar el cambio;
2. probar manualmente;
3. correr `lint` y, si aplica, tests;
4. hacer commit;
5. pasar al siguiente prompt.

### 4. Si la IA rompe algo

Hacer esto en orden:

1. revertir con `git`;
2. reducir el alcance del prompt;
3. volver a pedir una instrucción más específica;
4. volver a testear.

### 5. Prompts en inglés

Los prompts se escriben en inglés porque normalmente dan mejores resultados con modelos generales.

El contexto, decisiones y documentación pueden estar en español.  
El prompt operativo, en inglés.

### 6. No mezclar alcance

Cada prompt debe tener una sola intención:

- una ruta;
- una validación;
- un endpoint;
- una tabla;
- una pantalla.

### 7. No avanzar sin estabilidad

Nunca continuar a la siguiente fase si:

- `npm run lint` falla;
- la app rompe navegación;
- el checkout deja de funcionar;
- el build deja de compilar.

---

## 🧱 Fases del proyecto

### Fase 1 — Frontend saneado `DONE`

Objetivo cumplido:

- frontend funcional;
- navegación principal completa;
- diseño visual consistente;
- rutas lazy-loaded;
- guards implementados;
- skeleton states;
- formularios validados;
- base documental lista.

Resultado:

- frontend listo para integrarse con backend sin rehacer todo.

---

### Fase 2 — Backend MVP

Objetivo:

- tener una API real mínima que permita vender de verdad.

#### Week 1 — Base del backend

- Setup de Fastify.
- Setup de Prisma.
- Base de datos MySQL.
- Variables de entorno.
- Estructura modular del backend.
- Auth básica.
- Products API.

Entregables mínimos:

- login y register funcionales;
- perfil actual;
- listado de productos;
- detalle por slug;
- categorías.

#### Week 2 — Checkout operativo

- Cart API.
- Checkout API.
- Orders API.
- Integración sandbox de Wompi.
- Webhooks.

Entregables mínimos:

- crear orden;
- iniciar pago;
- recibir webhook;
- cambiar estado de orden;
- guardar referencia;
- resumen de compra funcional.

#### Week 3 — Operación básica

- Emails transaccionales.
- Shipments.
- Coupons básicos.

Entregables mínimos:

- confirmación de pedido;
- notificación de pago;
- seguimiento de envío;
- cupones simples con validación.

---

### Fase 3 — Admin mínimo

Objetivo:

- controlar el negocio sin depender de la base de datos manualmente.

Prioridades:

1. Productos + stock management.
2. Orders dashboard.
3. PQR management.

Entregables mínimos:

- CRUD de productos;
- stock por variante;
- ver pedidos;
- cambiar estados;
- responder PQR;
- registrar actividad básica.

---

### Fase 4 — Polish

Objetivo:

- cerrar la experiencia para que se sienta productiva y escalable.

Prioridades:

1. Wishlist real.
2. Reviews reales.
3. Newsletter real.
4. SEO dinámico.
5. Analytics.

Resultado esperado:

- frontend y backend más cercanos a producto real;
- mejor tráfico orgánico;
- más medición;
- más repetición de compra.

---

## 🧩 Prompts útiles reutilizables

### 1. Template para crear un nuevo endpoint API

```text
You are working in the FAJAS AB ecommerce project.

Create a new API endpoint for [FEATURE NAME].

Context:
- Frontend is React + Vite + TypeScript.
- API layer is in src/api/.
- DTOs are in src/types/dtos.ts.
- Current mock behavior must remain until backend is ready.

Requirements:
- Add the endpoint function in the proper api file.
- Use the existing DTOs and keep types strict.
- Return realistic mock data with a 400ms delay for now.
- Add a TODO comment to replace the mock with a real client call later.
- Do not change visual design.

Files to review first:
- [relevant files here]
```

### 2. Template para crear una nueva página con TanStack Query

```text
You are working in the FAJAS AB ecommerce project.

Create a new page for [PAGE NAME] using TanStack Query.

Context:
- React Router is used for routes.
- TanStack Query is available and should handle loading/error states.
- Existing design language is warm, premium, and minimal.

Requirements:
- Use a lazy-loaded page component if needed.
- Fetch data through src/api/.
- Show loading, empty, and error states.
- Keep the current visual style.
- Do not invent a new design language.

Files to review first:
- [relevant files here]
```

### 3. Template para crear un nuevo formulario con Zod

```text
You are working in the FAJAS AB ecommerce project.

Create a new form for [FORM NAME] using react-hook-form and Zod.

Context:
- Forms in the project already use warm premium styling.
- Validation should be strict and user-friendly.
- Inline errors are shown below each field.

Requirements:
- Use zodResolver.
- Add a Zod schema with clear messages.
- Disable submit when invalid or submitting.
- Keep visual design consistent with existing forms.
- Use the existing palette for error states.

Files to review first:
- [relevant files here]
```

### 4. Template para crear una migración Prisma

```text
You are working in the FAJAS AB ecommerce project backend.

Create a Prisma migration for [FEATURE NAME].

Context:
- Backend uses Prisma + MySQL.
- The frontend already has DTOs that describe the domain.
- Prefer minimal schema changes that preserve compatibility.

Requirements:
- Update schema.prisma.
- Add relations and indexes where needed.
- Keep naming consistent with existing DTOs.
- Explain any irreversible or risky schema decisions.

Files to review first:
- schema.prisma
- relevant DTOs
- relevant API contract files
```

---

## 🔁 Git workflow

### Branch per feature

Cada feature debe vivir en su propia rama.

Formato recomendado:

```bash
codex/<feature-name>
```

Ejemplos:

- `codex/backend-auth`
- `codex/checkout-orders`
- `codex/admin-products`
- `codex/seo-dynamic-pages`

### Commit después de cada prompt funcionando

Cuando una tarea ya:

- compila;
- pasa lint;
- está probada manualmente;

entonces se hace commit.

### Nunca commitear lint roto

Regla absoluta:

- si `npm run lint` falla, no se commitea.
- si hay warnings conocidos pero no bloquean, se documentan, pero no se usa eso como excusa para ignorar errores.

### Convención de commits

Sugerencia:

- `feat: add checkout validation`
- `fix: handle private route redirect`
- `refactor: lazy load routes`
- `chore: add backend docs`
- `test: cover checkout form validation`

---

## 🌐 Variables de entorno

### Frontend

```env
VITE_API_URL=
VITE_APP_NAME=FAJAS AB
VITE_CURRENCY=COP
VITE_WOMPI_PUBLIC_KEY=
```

### Backend

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_EVENTS_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CORS_ORIGIN=
APP_URL=
```

### Variables opcionales recomendadas

```env
CACHE_TTL_SECONDS=
UPLOAD_PROVIDER=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 📍 Qué revisar antes de empezar una nueva tarea

Checklist diario:

- [ ] ¿La tarea está acotada a una sola feature?
- [ ] ¿Se compartieron los archivos relevantes?
- [ ] ¿Se entiende el comportamiento actual?
- [ ] ¿Hay DTOs o contratos que deban respetarse?
- [ ] ¿Se sabe cómo probar manualmente el cambio?
- [ ] ¿La rama correcta está creada?
- [ ] ¿Se puede hacer la tarea sin romper el diseño existente?

---

## 🧪 Orden recomendado de trabajo diario

1. Revisar el estado del repo.
2. Definir una sola feature.
3. Preparar contexto y archivos.
4. Pedir ayuda a la IA con prompt en inglés.
5. Implementar cambio.
6. Probar manualmente.
7. Correr `lint` y tests.
8. Hacer commit.
9. Documentar si algo cambió en el contrato.
10. Pasar a la siguiente feature.

---

## 🎯 Prioridad real del proyecto

Si hay duda sobre qué hacer primero, el orden es:

1. Backend MVP.
2. Admin mínimo.
3. Integraciones reales.
4. SEO y analytics.
5. Wishlist, reviews y newsletter reales.

La regla de oro:  
**primero vender y operar, luego perfilar y escalar.**

---

## 📝 Nota final

Este documento está pensado para usarse como referencia diaria, no como plan eterno.  
Si el proyecto cambia de dirección, este archivo debe actualizarse antes de seguir construyendo.

FAJAS AB ya tiene una base frontend fuerte. El siguiente paso es convertir esa base en un ecommerce real, con backend confiable, operación clara y cambios pequeños, testables y seguros.
