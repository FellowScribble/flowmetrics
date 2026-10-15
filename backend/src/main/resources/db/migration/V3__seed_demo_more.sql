-- FlowMetrics — V3: más datos de demostración
-- Enriquece la empresa plantilla (is_template = true), que es la que el servicio de
-- demo clona en cada sesión, con un catálogo y un histórico de ventas más amplio.
-- Objetivo: que los informes (ventas por mes, productos más vendidos) y los KPIs
-- muestren datos representativos en lugar de 4 ventas repartidas en 2 meses.
--
-- Criterios de diseño:
--   * No se insertan ids explícitos: las filas nuevas los toman de la secuencia, por
--     lo que no hay riesgo de colisión con datos existentes (ni en dev ni en BD nuevas).
--   * Las referencias (categoría, cliente, producto) se resuelven por NOMBRE dentro de
--     la propia empresa plantilla, no por id.
--   * Se generan ~60 ventas repartidas en ~12 meses (5 por mes), con 1..3 líneas cada
--     una; los totales se calculan a partir de las líneas para que cuadren.
--   * No se editan V1/V2 (checksums estables); ver docs/ai-memory y D-36.

DO $$
DECLARE
    template_id bigint;
    cust        text[];
    prod        text[];
    m           int;
    k           int;
    i           int;
    nlines      int;
    v_sale_id   bigint;
    pname       text;
    qty         int;
    d           timestamp;
    pm          text;
    ps          text;
    st          text;
BEGIN
    SELECT id INTO template_id
    FROM companies
    WHERE is_template = true
    ORDER BY id
    LIMIT 1;

    IF template_id IS NULL THEN
        RAISE EXCEPTION 'V3: no hay empresa plantilla (is_template = true)';
    END IF;

    -- 1. Clientes adicionales (8)
    INSERT INTO customers (company_id, name, email, phone, city, country, is_active) VALUES
        (template_id, 'Javier Fernández', 'javier.fernandez@example.com', '600666777', 'Málaga',     'España', true),
        (template_id, 'Lucía Torres',     'lucia.torres@example.com',     '600777888', 'Zaragoza',   'España', true),
        (template_id, 'Pablo Moreno',     'pablo.moreno@example.com',     '600888999', 'Murcia',     'España', true),
        (template_id, 'Elena Navarro',    'elena.navarro@example.com',    '600999000', 'Palma',      'España', true),
        (template_id, 'Sergio Iglesias',  'sergio.iglesias@example.com',  '601111222', 'Alicante',   'España', true),
        (template_id, 'Carmen Ortiz',     'carmen.ortiz@example.com',     '601222333', 'Granada',    'España', true),
        (template_id, 'Andrés Romero',    'andres.romero@example.com',    '601333444', 'Valladolid', 'España', true),
        (template_id, 'Nuria Vega',       'nuria.vega@example.com',       '601444555', 'Santander',  'España', true);

    -- 2. Productos adicionales (8), con la categoría resuelta por nombre.
    --    Algunos quedan por debajo del stock mínimo para que el KPI "Stock bajo"
    --    deje de ser 0.
    INSERT INTO products (company_id, category_id, name, sale_price, cost_price, stock, minimum_stock, is_active)
    SELECT template_id, c.id, v.name, v.sale_price, v.cost_price, v.stock, v.minimum_stock, true
    FROM (VALUES
        ('Portátiles',  'Ultrabook 14" 16GB RAM',    999.00, 700.00, 12,  5),
        ('Portátiles',  'Portátil Gaming RTX 4060', 1299.00, 980.00,  3,  5),
        ('Smartphones', 'Smartphone Max 256GB',       899.00, 620.00, 25, 10),
        ('Smartphones', 'Tablet 11" 128GB',           429.00, 300.00, 18,  8),
        ('Monitores',   'Monitor 32" QHD',            429.00, 300.00,  2,  5),
        ('Accesorios',  'Webcam Full HD',              59.99,  32.00, 40, 10),
        ('Accesorios',  'Hub USB-C 7 en 1',            39.99,  20.00, 35, 10),
        ('Accesorios',  'Altavoz Bluetooth',           79.99,  45.00,  4, 10)
    ) AS v(cat_name, name, sale_price, cost_price, stock, minimum_stock)
    JOIN categories c ON c.company_id = template_id AND c.name = v.cat_name;

    -- 3. Nombres de los clientes/productos activos de la plantilla para repartir ventas.
    cust := ARRAY(SELECT name FROM customers WHERE company_id = template_id AND is_active ORDER BY id);
    prod := ARRAY(SELECT name FROM products  WHERE company_id = template_id AND is_active ORDER BY id);

    -- 4. ~60 ventas repartidas en ~12 meses (5 por mes).
    FOR m IN 0..11 LOOP
        FOR k IN 1..5 LOOP
            d  := now() - ((m * 30 + k * 4 + 2) || ' days')::interval;
            pm := (ARRAY['CARD', 'CASH', 'TRANSFER'])[1 + ((m + k) % 3)];
            ps := CASE WHEN (m + k) % 5 = 0 THEN 'PENDING' ELSE 'PAID' END;
            st := CASE WHEN (m + k) % 5 = 0 THEN 'PENDING' ELSE 'COMPLETED' END;

            INSERT INTO sales (company_id, customer_id, sale_date, total, payment_method, payment_status, status)
            SELECT template_id,
                   c.id,
                   d,
                   0,
                   pm,
                   ps,
                   st
            FROM customers c
            WHERE c.company_id = template_id
              AND c.name = cust[1 + ((m * 5 + k) % array_length(cust, 1))]
            RETURNING id INTO v_sale_id;

            nlines := 1 + ((m + k) % 3);   -- 1..3 líneas

            FOR i IN 1..nlines LOOP
                pname := prod[1 + ((m * 7 + k * 3 + i) % array_length(prod, 1))];
                qty   := 1 + ((m + k + i) % 3);   -- 1..3 unidades

                INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
                SELECT v_sale_id, p.id, qty, p.sale_price, p.sale_price * qty
                FROM products p
                WHERE p.company_id = template_id AND p.name = pname;
            END LOOP;

            UPDATE sales s
            SET total = COALESCE((SELECT SUM(si.subtotal) FROM sale_items si WHERE si.sale_id = s.id), 0)
            WHERE s.id = v_sale_id;
        END LOOP;
    END LOOP;

    -- 5. Reposicionar secuencias (mismo criterio que V2).
    PERFORM setval(pg_get_serial_sequence('customers',  'id'), (SELECT max(id) FROM customers));
    PERFORM setval(pg_get_serial_sequence('products',   'id'), (SELECT max(id) FROM products));
    PERFORM setval(pg_get_serial_sequence('sales',      'id'), (SELECT max(id) FROM sales));
    PERFORM setval(pg_get_serial_sequence('sale_items', 'id'), (SELECT max(id) FROM sale_items));
END $$;
