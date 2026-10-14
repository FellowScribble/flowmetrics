# FlowMetrics — API REST

> Base de las rutas: `http://localhost:8080/api`. Las respuestas y cuerpos están basados en el código
> (controladores y DTO) y en pruebas de runtime registradas. Autenticación: **cookie de sesión demo**
> `demoSession` (se obtiene con `POST /api/demo/start`; usar cookies con `withCredentials`).

Convenciones:
- Fechas en formato ISO-8601 (`LocalDateTime`).
- **Aislamiento por sesión:** todas las operaciones sobre datos de clientes, categorías, productos,
  ventas, actividad e informes **exigen una sesión demo activa**; sin ella responden **401**
  (`{ "error": ... }`). El `companyId` autorizado se obtiene **siempre** de la sesión del servidor:
  el `?companyId=` enviado por el cliente **se ignora** y un `companyId` en el cuerpo de escritura
  **no autoriza** otra empresa. Los `{id}` ajenos a la sesión responden **404**.
- **Rutas públicas:** solo `POST /demo/start`, `GET /demo/me` y `POST /demo/cleanup`.
- Los errores de dominio devuelven JSON con al menos `error` (p. ej. 401/404/409/400). Ver «Errores».

## Demo / sesión

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/demo/start` | Crea una empresa demo (clon de la plantilla) y devuelve la cookie `demoSession`. |
| `GET` | `/demo/me` | Devuelve la sesión activa. **401** si no hay cookie válida. |
| `POST` | `/demo/cleanup` | Ejecuta la limpieza de sesiones caducadas. Devuelve texto plano. |

`POST /demo/start` → **200**
```json
{ "companyId": 20, "companyName": "NovaTech Store", "expiresAt": "2026-10-14T15:14:24" }
```
`GET /demo/me` sin sesión → **401** `{ "error": "No hay sesión de demo activa" }`

## Empresas (`Company`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/companies` | Devuelve un **array** con la empresa propia de la sesión (un elemento). **404** si no hay sesión. |
| `GET` | `/companies/{id}` | Devuelve la empresa propia; **404** si no hay sesión o si `id` no es la de la sesión. |

> Las escrituras (`POST`/`PUT`/`DELETE`) se retiraron de la superficie pública (el demo no las usa;
> responden **405**).

`CompanyDTO`: `id`, `name`, `industry`, `country`, `currency`, `isTemplate`, `createdAt`, `updatedAt`.

## Clientes (`Customer`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/customers` | Lista los clientes de la sesión. **401** sin sesión. |
| `GET` | `/customers/{id}` | Devuelve un cliente; **404** si es de otra empresa. |
| `POST` | `/customers` | Crea un cliente. |
| `PUT` | `/customers/{id}` | Actualiza un cliente. |
| `DELETE` | `/customers/{id}` | Elimina un cliente; **409** si tiene ventas asociadas. |

Cuerpo (`CreateCustomerDTO`): `name` (obligatorio), `email`, `phone`, `city`, `country`, `isActive`.
`companyId` se ignora si se envía: **siempre se toma de la sesión**.
`CustomerDTO`: como el anterior + `id`, `companyId`, `createdAt`, `updatedAt`.

## Categorías (`Category`)

| Método | Ruta |
|---|---|
| `GET` | `/categories`, `/categories/{id}` |
| `POST` | `/categories` |
| `PUT` | `/categories/{id}` |
| `DELETE` | `/categories/{id}` |

Cuerpo (`CreateCategoryDTO`): `name` (obligatorio), `description`.
`CategoryDTO`: `id`, `companyId`, `name`, `description`, `createdAt`, `updatedAt`.

## Productos (`Product`)

| Método | Ruta |
|---|---|
| `GET` | `/products`, `/products/{id}` |
| `POST` | `/products` |
| `PUT` | `/products/{id}` |
| `DELETE` | `/products/{id}` |

Cuerpo (`CreateProductDTO`): `categoryId`, `name`, `salePrice`, `costPrice`, `stock`,
`minimumStock`, `isActive`.
`companyId` se ignora si se envía: **siempre se toma de la sesión**. La `categoryId` debe pertenecer a
la empresa de la sesión; si no, **404**.
`ProductDTO`: + `id`, `companyId`, `createdAt`, `updatedAt`.

## Ventas (`Sale`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/sales` | Lista las ventas de la sesión. **401** sin sesión. |
| `GET` | `/sales/{id}` | Detalle de una venta; **404** si es de otra empresa. |
| `POST` | `/sales` | Crea una venta (descuenta stock; **400** si no hay stock). |
| `PUT` | `/sales/{id}` | Actualiza una venta (restaura el stock anterior y descuenta el nuevo). |
| `DELETE` | `/sales/{id}` | Elimina una venta (restaura el stock). |

Cuerpo (`CreateSaleDTO`):
```json
{
  "customerId": 92,
  "paymentMethod": "CARD",
  "paymentStatus": "PAID",
  "status": "COMPLETED",
  "notes": null,
  "items": [{ "productId": 165, "quantity": 2 }]
}
```
`SaleDTO`: `id`, `companyId`, `customerId`, `saleDate`, `total`, `paymentMethod`, `paymentStatus`,
`status`, `notes`, `items[]` (`id`, `productId`, `productName`, `quantity`, `unitPrice`, `subtotal`),
`createdAt`, `updatedAt`.

## Actividad (`Activity`)

| Método | Ruta |
|---|---|
| `GET` | `/activity` |

Requiere sesión (**401** sin ella). Se registra una actividad al crear una venta (`SALE_CREATED`).

## Reportes (`Report`)

| Método | Ruta | Respuesta |
|---|---|---|
| `GET` | `/reports/summary` | `SalesSummaryDTO`: `totalRevenue`, `revenueThisMonth`, `activeCustomers`, `lowStockProducts`. |
| `GET` | `/reports/sales-by-month` | `MonthlySalesDTO[]`: `month`, `total`. |
| `GET` | `/reports/top-products` | `TopProductDTO[]`: `productName`, `totalQuantity`, `totalRevenue`. |

Todas requieren sesión (**401** sin ella) y usan la empresa de la sesión; el `?companyId=` se ignora.

## Errores

Manejados por `GlobalExceptionHandler`:

| Situación | Código |
|---|---|
| Sin sesión demo válida en datos de empresa | **401** |
| Recurso no encontrado (o de otra empresa) | **404** |
| Conflicto de integridad (p. ej. borrar cliente con ventas) | **409** |
| Empresa plantilla protegida | **409** |
| Stock insuficiente | **400** |
| Método/ruta no soportados | **405** / **404** (manejo por defecto; sin `trace`) |

> Las respuestas de error **no** exponen `trace` ni mensajes técnicos
> (`spring.web.error.include-stacktrace/message/binding-errors=never`).

## Ejemplos con `curl`

```bash
# Iniciar sesión demo (guarda la cookie)
curl -s -c cookies.txt -X POST http://localhost:8080/api/demo/start

# Listar clientes de la sesión
curl -s -b cookies.txt http://localhost:8080/api/customers

# Crear una venta
curl -s -b cookies.txt -H 'Content-Type: application/json' -X POST \
  http://localhost:8080/api/sales \
  -d '{"customerId":92,"paymentMethod":"CARD","paymentStatus":"PAID","status":"COMPLETED","notes":null,"items":[{"productId":165,"quantity":1}]}'
```
