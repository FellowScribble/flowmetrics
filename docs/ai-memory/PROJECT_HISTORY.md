# FlowMetrics — Project history and accumulated context

> **NOTA (2026-10-13):** Este documento es un **archivo histórico**. Recoge el contexto acumulado
> tal y como se conocía antes de inspeccionar el repositorio actual. Varias de sus afirmaciones
> (por ejemplo, el stack del frontend, la ubicación de las migraciones o el alcance del CRUD) han
> quedado desactualizadas respecto al código real. **El estado actual debe consultarse en
> `PROJECT_STATUS.md`.** Se conserva íntegro como antecedente; no se elimina contenido histórico.

> **Purpose:** historical handover document for continuing FlowMetrics with a local AI through OpenCode.
>
> **Evidence rule:** this document distinguishes requirements, reported implementation, and tested behavior. It is based on the conversation context available in this session, the prior handover text created for FlowMetrics, and several pasted Spring Boot logs/error artifacts mounted with the working files. It is **not** a forensic export of every message ever exchanged, nor a substitute for inspecting the current Git repository.

## 1. Project description and goals

FlowMetrics is a portfolio project intended to become a convincing, usable SaaS-style business management and analytics demo. It should present a polished public landing page and lead visitors into an interactive application where they can inspect business metrics and try common workflows.

The product concept includes:
- A dashboard with business KPIs and charts/bars derived from backend data.
- Sales listing and sale creation.
- Customers.
- Products and categories.
- Stock levels and minimum-stock indicators.
- Reports.
- Recent activity.
- A public demo mode whose writes are isolated per visitor/session.
- A visually plausible “Comenzar gratis” flow that is explicitly **not real authentication**.

The problem it is intended to solve for portfolio purposes is to demonstrate more than a static marketing page: it should show a coherent frontend/backend/database application with persistent data, CRUD operations, reporting-style views, and deliberate handling of public demo data.

The user wants to preserve the landing page already designed and make it functional. The user has expressed satisfaction with the existing landing; do not redesign it without being asked.

## 2. Intended user experience

### Landing page
Known elements already present in the design:
- Navbar.
- Hero section.
- Features section.
- Dashboard preview.
- Buttons “Comenzar gratis” and “Ver demo”.

A placeholder was present in the Hero/dashboard preview:
> “Aquí irá la captura del dashboard”.

This placeholder is known from the conversation; whether it remains in the current frontend must be checked.

### “Comenzar gratis”
This is a **visual mock interaction only**:
- Opens a modal/popup resembling login/signup.
- Does not create a user account.
- Does not implement real authentication.
- Does not persist submitted values.
- Should show a message appropriate to what the visitor enters/selects.

Do not turn it into real registration/login unless the user explicitly changes the requirement.

### “Ver demo”
This should start an interactive, database-backed demo:
- Create a demo session.
- Give the visitor an isolated copy of the template company and its demonstration data.
- Open the application dashboard.
- Allow the visitor to browse and try operations such as creating a sale.
- Keep the template and other visitors’ data unchanged.
- Expire the demo session and clean up its data after the chosen duration.

A prior proposed implementation described `POST /api/demo/start`, a cookie named `demoSession`, and an initial intended session duration of two hours. These are **design intentions, not verified implementation**.

## 3. Frontend history

The landing already existed and was visually approved by the user. The conversation context associated the intended frontend stack with:
- A `frontend/` folder in a monorepo.
- Next.js and TypeScript.
- Tailwind CSS.
- Lucide React and Framer Motion were mentioned as possible/current interface tools in prior context.

The exact frontend package manager, framework version, `package.json`, routes, component paths, and present contents are **not available in the handover context**. Do not assume the above stack or libraries are actually installed until the repository is inspected.

The user’s central frontend preference is to retain the existing landing and wire up its current buttons and flows rather than discard the design.

## 4. Backend and database evolution

### Initial stack
The backend was created using Spring Initializr. The versions chosen/observed were:
- Spring Boot `4.1.0`.
- Java `21` (startup logs show Java `21.0.11`).
- Maven.
- Spring Data JPA.
- Hibernate.
- Flyway.
- Bean Validation.
- Spring MVC/Web MVC.
- PostgreSQL driver.
- PostgreSQL `18.3` on the local database connection.
- Bruno for HTTP/API testing.
- DBeaver for inspecting the database.

The base Java package is:
`com.flowmetrics.backend`

The intended backend structure is:
```text
com.flowmetrics.backend
├── config
├── controller
├── dto
├── entity
├── mapper
├── repository
├── service
└── service.impl
```

These must be actual Java subpackages under the base package. There was a prior Eclipse package-view confusion; the user resolved the display so the packages appeared hierarchically. Do not recreate top-level packages outside `com.flowmetrics.backend`.

### Database and migrations
The local database is named `flowmetrics`. The known JDBC URL is:
`jdbc:postgresql://localhost:5432/flowmetrics`

The database/schema reported in the pasted startup logs was:
- PostgreSQL version: `18.3`.
- Default catalog/schema: `flowmetrics/public`.

Two SQL files are known by name:
- `V1__create_schema.sql`
- `V1__demo_data.sql`

The exact current filesystem paths and full contents have not been independently inspected in this handover. The schema details recorded below are from the accumulated project context and should be checked against the actual migrations before changing them.

## 5. Known schema design

Nine tables were designed:
1. `companies`
2. `demo_sessions`
3. `customers`
4. `categories`
5. `products`
6. `sales`
7. `sale_items`
8. `activity`
9. `reports`

The intended tenant/demo isolation design uses `company_id` on company-owned operational tables. `sale_items` is linked to a sale and product. Relevant relationships:
- `demo_sessions.company_id` → `companies.id`, cascading delete.
- `customers.company_id` → `companies.id`, cascading delete.
- `categories.company_id` → `companies.id`, cascading delete.
- `products.company_id` → `companies.id`, cascading delete.
- `products.category_id` → `categories.id`.
- `sales.company_id` → `companies.id`, cascading delete.
- `sales.customer_id` → `customers.id`.
- `sale_items.sale_id` → `sales.id`, cascading delete.
- `sale_items.product_id` → `products.id`.
- `activity.company_id` → `companies.id`, cascading delete.
- `reports.company_id` → `companies.id`, cascading delete.

Known column/constraint design:

### `companies`
- `id BIGSERIAL` primary key.
- `name VARCHAR(100) NOT NULL`.
- `industry VARCHAR(100) NOT NULL`.
- `country VARCHAR(100) NOT NULL`.
- `currency VARCHAR(3) NOT NULL`.
- `is_template BOOLEAN NOT NULL DEFAULT false`.
- `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`.
- `updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`.

### `demo_sessions`
- `id BIGSERIAL` primary key.
- `company_id` required FK to `companies`, cascading delete.
- `session_token VARCHAR(255) UNIQUE NOT NULL`.
- `is_active BOOLEAN DEFAULT true`.
- `created_at`, `updated_at` default to current timestamp.
- `expires_at` required.

### `customers`
- `id BIGSERIAL` primary key.
- `company_id` required FK to `companies`, cascading delete.
- `name VARCHAR(100) NOT NULL`.
- Optional `email`, `phone`, `city`, `country`.
- `is_active BOOLEAN DEFAULT true`.
- `created_at`, `updated_at`.

### `categories`
- `id BIGSERIAL` primary key.
- `company_id` required FK to `companies`, cascading delete.
- `name VARCHAR(100) NOT NULL`.
- Optional `description`.
- `created_at`, `updated_at`.
- Unique constraint on `(company_id, name)`.

### `products`
- `id BIGSERIAL` primary key.
- `company_id` required FK to `companies`, cascading delete.
- `category_id` required FK to `categories`.
- `name VARCHAR(150) NOT NULL`.
- `sale_price DECIMAL(10,2) >= 0`.
- `cost_price DECIMAL(10,2) >= 0`.
- `stock INTEGER >= 0`.
- `minimum_stock INTEGER >= 0`.
- `is_active BOOLEAN DEFAULT true`.
- `created_at`, `updated_at`.

### `sales`
- `id BIGSERIAL` primary key.
- `company_id` required FK to `companies`, cascading delete.
- `customer_id` required FK to `customers`.
- `sale_date` defaults to current timestamp.
- `total DECIMAL(10,2) >= 0`.
- `payment_method VARCHAR(50) NOT NULL`.
- `payment_status VARCHAR(50) NOT NULL`.
- `status VARCHAR(50) NOT NULL`.
- Optional `notes`.
- `created_at`, `updated_at`.

### `sale_items`
- `id BIGSERIAL` primary key.
- `sale_id` required FK to `sales`, cascading delete.
- `product_id` required FK to `products`.
- `quantity INTEGER > 0`.
- `unit_price DECIMAL(10,2) >= 0`.
- `subtotal DECIMAL(10,2) >= 0`.

### `activity`
- `id BIGSERIAL` primary key.
- `company_id` required FK to `companies`, cascading delete.
- `title VARCHAR(150) NOT NULL`.
- Optional `description`.
- `type VARCHAR(50) NOT NULL`.
- Optional `entity_type`, `entity_id`.
- `created_at`, `updated_at`.

### `reports`
- `id BIGSERIAL` primary key.
- `company_id` required FK to `companies`, cascading delete.
- `title VARCHAR(150) NOT NULL`.
- `report_type VARCHAR(50) NOT NULL`.
- `generated_at`.
- `created_at`, `updated_at`.

Indexes were said to exist for `company_id` and relevant foreign-key/date fields. Verify the real SQL before relying on exact index names or definitions.

## 6. Demo seed data known from the history

The conceptual seed data was:
- Template company: `FlowMetrics Demo`, industry `Coffee Shop`, country `España`, currency `EUR`, `is_template = true`. Its initial ID was expected to be `1`.
- Customers: `Juan Pérez`, `Laura García`.
- Categories: `Bebidas`, `Panadería`, `Postres`.
- Products:
  - `Café Premium`, sale price `8.50`, stock `120`.
  - `Croissant`, sale price `2.30`, stock `80`.
  - `Zumo Natural`, sale price `3.20`, stock `60`.
- A sale with total `22.50`, payment method `Tarjeta`, payment status `COMPLETED`, date around `2026-07-27 10:30`, linked to customer ID 1.
- Sale items:
  - 2 × Café Premium at 8.50 = 17.00.
  - 1 × Croissant at 2.30 = 2.30.
  - 1 × Zumo Natural at 3.20 = 3.20.
- Activity records describing a sale registration, a customer addition, and a product update.
- Report `Ventas de Julio`.
- An old conceptual demo session had token `demo_123456789`, created `2026-07-27 10:00` and expiring `2026-07-28 10:00`.

The old token and dates are historical seed values, not a safe session design. Real sessions must receive unpredictable tokens. IDs may have changed due to subsequent insert attempts and successful tests.

## 7. Company CRUD implementation history

The user created or reported creating:
- `Company.java` in `entity`.
- `CompanyRepository` in `repository`.
- `CompanyDTO`.
- `CreateCompanyDTO`.
- `CompanyMapper`.
- `CompanyService`.
- `CompanyServiceImpl` in `service.impl`.
- `CompanyController` in `controller`.

The exact current content of all files except the most recently documented `Company.java` is not preserved here. The actual repository must be inspected before replacing files.

### Known `Company.java`
The last recorded version is included in `PROJECT_STATUS.md`. It uses Jakarta Persistence annotations, manual getters/setters, and a `@PrePersist` hook to set timestamps and default `isTemplate` to false.

### Known working requests
- `GET /api/companies` returned JSON for the seeded template company.
- `POST /api/companies` succeeded from Bruno after a timestamp bug was fixed.
- The tested POST body was:
```json
{
  "name": "Mi Empresa",
  "industry": "Software",
  "country": "España",
  "currency": "EUR"
}
```
- URL: `http://localhost:8080/api/companies`
- Reported result: `200 OK`.
- Reported created company ID: `4`.

Do not assume IDs start at 1 or that only two companies exist. Earlier failed inserts and previous data may have advanced PostgreSQL sequences.

## 8. Error history and debugging

### Error: `created_at` null when creating a company
A pasted Spring error artifact showed a failed insert into `companies`. The key message in Spanish was:
`ERROR: el valor nulo en la columna «created_at» de la relación «companies» viola la restricción “not-null”`

The failed row shown in that artifact was:
`(3, Mi Empresa, Software, España, EUR, f, null, null)`

The SQL shown by Hibernate included explicit timestamp columns:
```sql
insert into companies (country,created_at,currency,industry,is_template,name,updated_at)
values (?,?,?,?,?,?,?)
```

Cause identified:
- Although PostgreSQL columns had `DEFAULT CURRENT_TIMESTAMP`, Hibernate was explicitly sending `NULL` for the timestamp properties, so the database default did not apply.

Solution reported and later tested:
- Add `@PrePersist` in `Company.java`.
- Set `createdAt = LocalDateTime.now()`.
- Set `updatedAt = LocalDateTime.now()`.
- If `isTemplate == null`, set it to `false`.

After this fix, Bruno returned `200 OK` and a company was saved with ID 4. Do not remove this fix without a reason and a replacement that is tested.

### Mapper property mismatch
A mapper implementation attempted to call `setTemplate(boolean)`, but that setter did not exist. The entity uses:
`setIsTemplate(Boolean isTemplate)`

This was corrected in the previous work. Keep mapper calls aligned with the actual entity property accessors.

### Service interface compile issue
`CompanyServiceImpl` had to implement `CompanyService.create(CreateCompanyDTO)`. This compile error was resolved; POST then worked.

### `Found 0 JPA repository interfaces`
Early startup logs showed:
`Found 0 JPA repository interfaces.`
That log came from a time when the repository had not yet been created/recognized. Do not treat it as a current error: later, `CompanyRepository` was created and the company endpoints worked. A current startup log should be checked if repository scanning becomes an issue again.

### Port 8080 was already occupied
An operating-system Tomcat service had occupied port 8080. The user inspected it with:
```bash
sudo ss -ltnp | grep 8080
systemctl status tomcat
```
The Java process was associated with system service `tomcat`. The user stopped/disabled that service. Later, Spring Boot itself ran on port 8080. Do not immediately change the application to port 8081; check the current process and service state first if this recurs.

### Non-blocking warning
A Spring/JPA `spring.jpa.open-in-view` warning was noted. It was not blocking the application startup and was not the focus of the current step.

## 9. Git and working method

The user asked to work on a new Git branch rather than `main`. The exact branch name is not available here. Before making changes, verify:
```bash
git branch --show-current
git status --short
```
Do not assume branch name or repository cleanliness.

The known original workspace path from a startup log was:
`/home/andreavierahernandez/Documentos/GitHub/flowmetrics/backend`
This is a historical path from a pasted log and may not be the current path on the machine running OpenCode. Confirm the actual workspace root.

## 10. Limits of historical access

This handover is based on:
- The project summary/context available to this assistant.
- The prior `FlowMetrics_contexto_completo_para_otra_IA.txt` handover document.
- Mounted pasted Spring startup logs and an error trace.
- Recent conversation content indicating the project history and latest known task.

It does **not** establish that every old conversation message, all screenshots, or the current source tree have been inspected in full. No repository files have been edited as part of this historical analysis. The next AI must verify current code and Git state before acting.
