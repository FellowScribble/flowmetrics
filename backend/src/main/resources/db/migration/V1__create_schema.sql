-- FlowMetrics — V1: esquema inicial
-- Reconstruido a partir del esquema real (pg_dump de la base de datos de desarrollo).
-- Equivale a las 9 tablas actuales: activity, categories, companies, customers,
-- demo_sessions, products, reports, sale_items, sales.
--
-- Nota: no forma parte de la ruta de arranque todavía; Flyway sigue desactivado
-- (spring.flyway.enabled=false). Ver docs/ai-memory/DECISIONS.md (D-09, D-31).

CREATE TABLE companies (
    id          bigserial    PRIMARY KEY,
    name        varchar(100) NOT NULL,
    industry    varchar(100) NOT NULL,
    country     varchar(100) NOT NULL,
    currency    varchar(3)   NOT NULL,
    is_template boolean      NOT NULL DEFAULT false,
    created_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id          bigserial    PRIMARY KEY,
    company_id  bigint       NOT NULL,
    name        varchar(100) NOT NULL,
    description text,
    created_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_name UNIQUE (company_id, name)
);

CREATE TABLE customers (
    id         bigserial    PRIMARY KEY,
    company_id bigint       NOT NULL,
    name       varchar(100) NOT NULL,
    email      varchar(255),
    phone      varchar(20),
    city       varchar(100),
    country    varchar(100),
    is_active  boolean      NOT NULL DEFAULT true,
    created_at timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id            bigserial      PRIMARY KEY,
    company_id    bigint         NOT NULL,
    category_id   bigint         NOT NULL,
    name          varchar(150)   NOT NULL,
    sale_price    numeric(10,2)  NOT NULL,
    cost_price    numeric(10,2)  NOT NULL,
    stock         integer        NOT NULL DEFAULT 0,
    minimum_stock integer        NOT NULL DEFAULT 0,
    is_active     boolean        NOT NULL DEFAULT true,
    created_at    timestamp      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    timestamp      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_sale_price_check    CHECK (sale_price >= 0),
    CONSTRAINT products_cost_price_check    CHECK (cost_price >= 0),
    CONSTRAINT products_stock_check         CHECK (stock >= 0),
    CONSTRAINT products_minimum_stock_check CHECK (minimum_stock >= 0)
);

CREATE TABLE sales (
    id             bigserial     PRIMARY KEY,
    company_id     bigint        NOT NULL,
    customer_id    bigint        NOT NULL,
    sale_date      timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total          numeric(10,2) NOT NULL,
    payment_method varchar(50)   NOT NULL,
    payment_status varchar(50)   NOT NULL,
    status         varchar(50)   NOT NULL,
    notes          text,
    created_at     timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sales_total_check CHECK (total >= 0)
);

CREATE TABLE sale_items (
    id         bigserial     PRIMARY KEY,
    sale_id    bigint        NOT NULL,
    product_id bigint        NOT NULL,
    quantity   integer       NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal   numeric(10,2) NOT NULL,
    CONSTRAINT sale_items_quantity_check   CHECK (quantity > 0),
    CONSTRAINT sale_items_unit_price_check CHECK (unit_price >= 0),
    CONSTRAINT sale_items_subtotal_check   CHECK (subtotal >= 0)
);

CREATE TABLE activity (
    id          bigserial   PRIMARY KEY,
    company_id  bigint      NOT NULL,
    title       varchar(150) NOT NULL,
    description text,
    type        varchar(50) NOT NULL,
    entity_type varchar(50),
    entity_id   bigint,
    created_at  timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE demo_sessions (
    id            bigserial    PRIMARY KEY,
    company_id    bigint       NOT NULL,
    session_token varchar(255) NOT NULL,
    is_active     boolean      NOT NULL DEFAULT true,
    created_at    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at    timestamp    NOT NULL,
    CONSTRAINT demo_sessions_session_token_key UNIQUE (session_token)
);

CREATE TABLE reports (
    id           bigserial    PRIMARY KEY,
    company_id   bigint       NOT NULL,
    title        varchar(150) NOT NULL,
    report_type  varchar(50)  NOT NULL,
    generated_at timestamp,
    created_at   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_company   ON activity (company_id);
CREATE INDEX idx_category_company   ON categories (company_id);
CREATE INDEX idx_customer_company   ON customers (company_id);
CREATE INDEX idx_demo_company       ON demo_sessions (company_id);
CREATE INDEX idx_demo_token         ON demo_sessions (session_token);
CREATE INDEX idx_product_category   ON products (category_id);
CREATE INDEX idx_product_company    ON products (company_id);
CREATE INDEX idx_report_company     ON reports (company_id);
CREATE INDEX idx_sale_company       ON sales (company_id);
CREATE INDEX idx_sale_customer      ON sales (customer_id);
CREATE INDEX idx_sale_date          ON sales (sale_date);
CREATE INDEX idx_saleitem_product   ON sale_items (product_id);
CREATE INDEX idx_saleitem_sale      ON sale_items (sale_id);

ALTER TABLE activity      ADD CONSTRAINT fk_activity_company   FOREIGN KEY (company_id)  REFERENCES companies(id)  ON DELETE CASCADE;
ALTER TABLE categories    ADD CONSTRAINT fk_category_company   FOREIGN KEY (company_id)  REFERENCES companies(id)  ON DELETE CASCADE;
ALTER TABLE customers     ADD CONSTRAINT fk_customer_company   FOREIGN KEY (company_id)  REFERENCES companies(id)  ON DELETE CASCADE;
ALTER TABLE demo_sessions ADD CONSTRAINT fk_demo_company       FOREIGN KEY (company_id)  REFERENCES companies(id)  ON DELETE CASCADE;
ALTER TABLE products      ADD CONSTRAINT fk_product_category   FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE products      ADD CONSTRAINT fk_product_company    FOREIGN KEY (company_id)  REFERENCES companies(id)  ON DELETE CASCADE;
ALTER TABLE reports       ADD CONSTRAINT fk_report_company     FOREIGN KEY (company_id)  REFERENCES companies(id)  ON DELETE CASCADE;
ALTER TABLE sales         ADD CONSTRAINT fk_sale_company       FOREIGN KEY (company_id)  REFERENCES companies(id)  ON DELETE CASCADE;
ALTER TABLE sales         ADD CONSTRAINT fk_sale_customer      FOREIGN KEY (customer_id) REFERENCES customers(id)  ON DELETE RESTRICT;
ALTER TABLE sale_items    ADD CONSTRAINT fk_saleitem_product   FOREIGN KEY (product_id)  REFERENCES products(id)   ON DELETE RESTRICT;
ALTER TABLE sale_items    ADD CONSTRAINT fk_saleitem_sale      FOREIGN KEY (sale_id)     REFERENCES sales(id)      ON DELETE CASCADE;
