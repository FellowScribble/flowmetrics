-- FlowMetrics — V2: datos de demostración
-- Crea la empresa plantilla (is_template = true) que el servicio de demo clona en cada
-- sesión, junto con su catálogo y ventas. Contenido fiel a la plantilla real
-- ("NovaTech Store"): 4 categorías, 9 productos, 5 clientes y 4 ventas.
--
-- Las fechas de venta se generan de forma relativa (now() - intervalo) para que la
-- demo siempre muestre actividad reciente.
--
-- Importante: se insertan ids explícitos y luego se reposicionan las secuencias con
-- setval. Sin ese setval, el clonado de la plantilla fallaría por PK duplicada
-- (bug del seed antiguo en database/seeds/V1_demo_data.sql).

INSERT INTO companies (id, name, industry, country, currency, is_template)
VALUES (1, 'NovaTech Store', 'Tecnología', 'España', 'EUR', true);

INSERT INTO categories (id, company_id, name, description) VALUES
    (1, 1, 'Portátiles',  'Ordenadores portátiles y ultrabooks'),
    (2, 1, 'Smartphones', 'Teléfonos móviles y accesorios de conectividad'),
    (3, 1, 'Monitores',   'Pantallas y monitores para oficina y gaming'),
    (4, 1, 'Accesorios',  'Periféricos, cables y complementos tecnológicos');

INSERT INTO products (id, company_id, category_id, name, sale_price, cost_price, stock, minimum_stock, is_active) VALUES
    (1, 1, 1, 'Portátil 15" 16GB RAM',    899.99, 650.00, 25,  5, true),
    (2, 1, 1, 'Ultrabook 13" 8GB RAM',    749.00, 520.00, 15,  5, true),
    (3, 1, 2, 'Smartphone Pro 128GB',     599.00, 410.00, 40, 10, true),
    (4, 1, 2, 'Smartphone Lite 64GB',     299.00, 190.00, 60, 15, true),
    (5, 1, 3, 'Monitor 27" 4K',           349.00, 240.00, 20,  5, true),
    (6, 1, 3, 'Monitor 24" Full HD',      159.00, 100.00, 30,  8, true),
    (7, 1, 4, 'Ratón inalámbrico',         24.99,  12.00, 80, 20, true),
    (8, 1, 4, 'Teclado mecánico',          69.99,  38.00, 45, 10, true),
    (9, 1, 4, 'Auriculares Bluetooth',     49.99,  28.00, 55, 10, true);

INSERT INTO customers (id, company_id, name, email, phone, city, country, is_active) VALUES
    (1, 1, 'Laura Martínez', 'laura.martinez@example.com', '600111222', 'Madrid',    'España', true),
    (2, 1, 'Carlos Ruiz',    'carlos.ruiz@example.com',    '600222333', 'Barcelona', 'España', true),
    (3, 1, 'Ana Gómez',      'ana.gomez@example.com',      '600333444', 'Valencia',  'España', true),
    (4, 1, 'David López',    'david.lopez@example.com',    '600444555', 'Sevilla',   'España', true),
    (5, 1, 'Marta Sánchez',  'marta.sanchez@example.com',  '600555666', 'Bilbao',    'España', true);

INSERT INTO sales (id, company_id, customer_id, sale_date, total, payment_method, payment_status, status, notes) VALUES
    (2, 1, 1, now() - interval '45 days', 899.99, 'CARD',     'PAID', 'COMPLETED', NULL),
    (3, 1, 2, now() - interval '41 days', 648.99, 'CARD',     'PAID', 'COMPLETED', NULL),
    (4, 1, 3, now() - interval '38 days', 318.00, 'TRANSFER', 'PAID', 'COMPLETED', NULL),
    (5, 1, 4, now() - interval '36 days',  94.98, 'CASH',     'PAID', 'COMPLETED', NULL);

INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (1, 2, 1, 1, 899.99, 899.99),
    (2, 3, 3, 1, 599.00, 599.00),
    (3, 3, 9, 1,  49.99,  49.99),
    (4, 4, 6, 2, 159.00, 318.00),
    (5, 5, 8, 1,  69.99,  69.99),
    (6, 5, 7, 1,  24.99,  24.99);

SELECT setval(pg_get_serial_sequence('companies',   'id'), (SELECT max(id) FROM companies));
SELECT setval(pg_get_serial_sequence('categories',  'id'), (SELECT max(id) FROM categories));
SELECT setval(pg_get_serial_sequence('products',    'id'), (SELECT max(id) FROM products));
SELECT setval(pg_get_serial_sequence('customers',   'id'), (SELECT max(id) FROM customers));
SELECT setval(pg_get_serial_sequence('sales',       'id'), (SELECT max(id) FROM sales));
SELECT setval(pg_get_serial_sequence('sale_items',  'id'), (SELECT max(id) FROM sale_items));
