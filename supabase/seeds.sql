-- ====================================================================
-- NEXUS CRM MULTIEMPRESA - DATOS DE PRUEBA (SEEDS MULTI-TENANT)
-- ====================================================================

-- 1. ORGANIZACIONES
INSERT INTO organizations (id, name, slug, status, phone, email, address, city, country, timezone, currency)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Demo Company México Norte, S.A. de C.V.', 'demo-norte', 'active', '+52 81 8123 4567', 'contacto@norte-crm.mx', 'Av. Constitución 2050, Obispado', 'Monterrey', 'México', 'America/Monterrey', 'MXN'),
('22222222-2222-2222-2222-222222222222', 'Demo Company Bajío e Innovación, S.A.', 'demo-sur', 'active', '+52 442 214 9876', 'info@bajio-innovacion.mx', 'Bernardo Quintana 500, Alamos', 'Querétaro', 'México', 'America/Mexico_City', 'MXN')
ON CONFLICT (id) DO NOTHING;

-- 2. USUARIOS POR ORGANIZACIÓN (Con diferentes roles)
-- Organización Norte (1111...)
INSERT INTO users (id, organization_id, full_name, email, phone, role, status)
VALUES
('u1111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111111', 'Elena Morales (Admin)', 'elena.morales@norte-crm.mx', '+52 81 1600 1122', 'admin', 'active'),
('u1111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111111', 'Carlos Vega (Gerente)', 'carlos.vega@norte-crm.mx', '+52 81 1600 2233', 'manager', 'active'),
('u1111111-1111-1111-1111-111111111103', '11111111-1111-1111-1111-111111111111', 'Lucía Benítez (Vendedora)', 'lucia.benitez@norte-crm.mx', '+52 81 1600 3344', 'salesperson', 'active'),
('u1111111-1111-1111-1111-111111111104', '11111111-1111-1111-1111-111111111111', 'David Ramos (Atención)', 'david.ramos@norte-crm.mx', '+52 81 1600 4455', 'customer_service', 'active')
ON CONFLICT (id) DO NOTHING;

-- Organización Sur (2222...)
INSERT INTO users (id, organization_id, full_name, email, phone, role, status)
VALUES
('u2222222-2222-2222-2222-222222222201', '22222222-2222-2222-2222-222222222222', 'Alejandro Marín (Admin Sur)', 'alejandro.marin@bajio-innovacion.mx', '+52 442 111 2233', 'admin', 'active'),
('u2222222-2222-2222-2222-222222222202', '22222222-2222-2222-2222-222222222222', 'Sofía Navarro (Gerente Sur)', 'sofia.navarro@bajio-innovacion.mx', '+52 442 222 3344', 'manager', 'active'),
('u2222222-2222-2222-2222-222222222203', '22222222-2222-2222-2222-222222222222', 'Pablo Herrera (Vendedor Sur)', 'pablo.herrera@bajio-innovacion.mx', '+52 442 333 4455', 'salesperson', 'active'),
('u2222222-2222-2222-2222-222222222204', '22222222-2222-2222-2222-222222222222', 'Marta Ortiz (Atención Sur)', 'marta.ortiz@bajio-innovacion.mx', '+52 442 444 5566', 'customer_service', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. PIPELINES Y ETAPAS
-- Pipeline Norte
INSERT INTO pipelines (id, organization_id, name, is_default)
VALUES ('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Pipeline Ventas B2B', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pipeline_stages (id, organization_id, pipeline_id, name, order_index, probability, color, is_won_stage, is_lost_stage)
VALUES
('s1111111-0001-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Nuevo', 1, 10.0, '#94a3b8', false, false),
('s1111111-0002-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Contactado', 2, 25.0, '#38bdf8', false, false),
('s1111111-0003-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Interesado', 3, 50.0, '#6366f1', false, false),
('s1111111-0004-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Cotización', 4, 75.0, '#f59e0b', false, false),
('s1111111-0005-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Negociación', 5, 90.0, '#ec4899', false, false),
('s1111111-0006-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Ganado', 6, 100.0, '#10b981', true, false),
('s1111111-0007-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Perdido', 7, 0.0, '#ef4444', false, true)
ON CONFLICT (id) DO NOTHING;

-- Pipeline Sur
INSERT INTO pipelines (id, organization_id, name, is_default)
VALUES ('p2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Pipeline Industrial Sur', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pipeline_stages (id, organization_id, pipeline_id, name, order_index, probability, color, is_won_stage, is_lost_stage)
VALUES
('s2222222-0001-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'Lead Entrante', 1, 15.0, '#94a3b8', false, false),
('s2222222-0002-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'Visita Técnica', 2, 40.0, '#38bdf8', false, false),
('s2222222-0003-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'Propuesta Económica', 3, 70.0, '#f59e0b', false, false),
('s2222222-0004-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'Cerrado Ganado', 4, 100.0, '#10b981', true, false),
('s2222222-0005-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'Cerrado Perdido', 5, 0.0, '#ef4444', false, true)
ON CONFLICT (id) DO NOTHING;

-- 4. CATEGORÍAS Y PRODUCTOS
INSERT INTO product_categories (id, organization_id, name, description)
VALUES 
('cat-1111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111111', 'Suscripciones Software', 'Planes SaaS mensuales y anuales'),
('cat-1111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111111', 'Servicios de Consultoría', 'Horas de implantación y formación')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, organization_id, sku, name, description, category_id, type, price, cost, tax_rate)
VALUES
('prd-1111-0001', '11111111-1111-1111-1111-111111111111', 'SAAS-PRO-Y', 'Licencia Nexus Pro (Anual)', 'Acceso ilimitado por usuario anual', 'cat-1111-1111-1111-1111-111111111101', 'service', 28800.00, 4000.00, 16.00),
('prd-1111-0002', '11111111-1111-1111-1111-111111111111', 'CNS-ONBOARD', 'Pack Onboarding Empresarial', '15 horas de configuración y migración', 'cat-1111-1111-1111-1111-111111111102', 'service', 56000.00, 16000.00, 16.00),
('prd-1111-0003', '11111111-1111-1111-1111-111111111111', 'MOD-API', 'Conector ERP Dedicado', 'Módulo de sincronización en tiempo real', 'cat-1111-1111-1111-1111-111111111101', 'product', 98000.00, 25000.00, 16.00)
ON CONFLICT (id) DO NOTHING;
