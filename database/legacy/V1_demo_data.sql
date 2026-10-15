-- =====================================================
-- COMPANY
-- =====================================================

INSERT INTO companies (
    id,
    name,
    industry,
    country,
    currency,
    is_template
)
VALUES (
    1,
    'FlowMetrics Demo',
    'Coffee Shop',
    'España',
    'EUR',
    TRUE
);

-- =====================================================
-- CATEGORIES
-- =====================================================

INSERT INTO categories (
    company_id,
    name,
    description
)
VALUES
(1,'Bebidas','Bebidas frías y calientes'),
(1,'Panadería','Pan y bollería'),
(1,'Postres','Postres artesanales');

-- =====================================================
-- PRODUCTS
-- =====================================================

INSERT INTO products (
    company_id,
    category_id,
    name,
    sale_price,
    cost_price,
    stock,
    minimum_stock
)
VALUES
(1,1,'Café Premium',8.50,3.20,120,20),

(1,1,'Zumo Natural',3.20,1.05,60,10),

(1,2,'Croissant',2.30,0.80,80,15),

(1,2,'Tostada Integral',4.10,1.30,45,10),

(1,3,'Cheesecake',5.50,2.20,30,5);

-- =====================================================
-- CUSTOMERS
-- =====================================================

INSERT INTO customers (
    company_id,
    name,
    email,
    phone,
    city,
    country
)
VALUES

(1,'Juan Pérez','juan@email.com','600111222','Madrid','España'),

(1,'Laura García','laura@email.com','600333444','Barcelona','España'),

(1,'Carlos Sánchez','carlos@email.com','600555666','Valencia','España');

-- =====================================================
-- SALES
-- =====================================================

INSERT INTO sales (
    company_id,
    customer_id,
    sale_date,
    total,
    payment_method,
    payment_status,
    status,
    notes
)
VALUES

(
1,
1,
CURRENT_TIMESTAMP,
22.50,
'TARJETA',
'PAID',
'COMPLETED',
'Venta realizada desde mostrador'
),

(
1,
2,
CURRENT_TIMESTAMP,
13.70,
'EFECTIVO',
'PAID',
'COMPLETED',
NULL
);

-- =====================================================
-- SALE ITEMS
-- =====================================================

INSERT INTO sale_items (
    sale_id,
    product_id,
    quantity,
    unit_price,
    subtotal
)
VALUES

(1,1,2,8.50,17.00),
(1,3,1,2.30,2.30),
(1,2,1,3.20,3.20),

(2,5,1,5.50,5.50),
(2,4,2,4.10,8.20);

-- =====================================================
-- ACTIVITY
-- =====================================================

INSERT INTO activity (
    company_id,
    title,
    description,
    type,
    entity_type,
    entity_id
)
VALUES

(
1,
'Nueva venta registrada',
'Venta completada correctamente',
'SALE',
'SALE',
1
),

(
1,
'Cliente añadido',
'Se añadió Laura García',
'CUSTOMER',
'CUSTOMER',
2
),

(
1,
'Producto actualizado',
'Se actualizó el stock del Café Premium',
'PRODUCT',
'PRODUCT',
1
);

-- =====================================================
-- REPORTS
-- =====================================================

INSERT INTO reports (
    company_id,
    title,
    report_type,
    generated_at
)
VALUES

(
1,
'Ventas del día',
'SALES',
CURRENT_TIMESTAMP
);