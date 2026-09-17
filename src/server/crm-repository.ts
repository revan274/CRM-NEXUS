/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Organization,
  User,
  Client,
  Contact,
  Product,
  ProductCategory,
  Pipeline,
  PipelineStage,
  Opportunity,
  OpportunityItem,
  OpportunityStageHistory,
  Task,
  Activity,
  Note,
  Tag,
  AuditLog,
} from '../types/crm';
import { getSupabaseServerClient } from '../lib/supabase/supabase-server';

// =========================================================================
// IN-MEMORY HIGH-FIDELITY STORE (Used for active execution & Supabase sync)
// =========================================================================

interface DBState {
  organizations: Organization[];
  users: User[];
  clients: Client[];
  contacts: Contact[];
  productCategories: ProductCategory[];
  products: Product[];
  pipelines: Pipeline[];
  pipelineStages: PipelineStage[];
  opportunities: Opportunity[];
  opportunityItems: OpportunityItem[];
  stageHistory: OpportunityStageHistory[];
  tasks: Task[];
  activities: Activity[];
  notes: Note[];
  tags: Tag[];
  auditLogs: AuditLog[];
}

const INITIAL_DB: DBState = {
  organizations: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Nexus México Corporativo, S.A. de C.V.',
      slug: 'nexus-mexico',
      logo_url: null,
      status: 'active',
      phone: '+52 55 5234 5678',
      email: 'contacto@nexus-crm.mx',
      address: 'Paseo de la Reforma 222, Piso 15',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
      updated_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Nexus Monterrey Industrial, S.A.P.I.',
      slug: 'nexus-monterrey',
      logo_url: null,
      status: 'active',
      phone: '+52 81 8345 6789',
      email: 'info@nexus-monterrey.mx',
      address: 'Av. Constitución 2050',
      city: 'Monterrey',
      state: 'Nuevo León',
      country: 'México',
      timezone: 'America/Monterrey',
      currency: 'MXN',
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
      updated_at: new Date('2026-02-01T10:00:00Z').toISOString(),
    },
  ],
  users: [
    // Norte Users
    {
      id: 'u1111111-1111-1111-1111-111111111101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Elena Morales',
      email: 'elena.morales@norte-crm.com',
      phone: '+34 600 111 222',
      role: 'admin',
      status: 'active',
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
      updated_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: 'u1111111-1111-1111-1111-111111111102',
      organization_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Carlos Vega',
      email: 'carlos.vega@norte-crm.com',
      phone: '+34 600 222 333',
      role: 'manager',
      status: 'active',
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
      updated_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: 'u1111111-1111-1111-1111-111111111103',
      organization_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'Lucía Benítez',
      email: 'lucia.benitez@norte-crm.com',
      phone: '+34 600 333 444',
      role: 'salesperson',
      status: 'active',
      created_at: new Date('2026-01-11T09:00:00Z').toISOString(),
      updated_at: new Date('2026-01-11T09:00:00Z').toISOString(),
    },
    {
      id: 'u1111111-1111-1111-1111-111111111104',
      organization_id: '11111111-1111-1111-1111-111111111111',
      full_name: 'David Ramos',
      email: 'david.ramos@norte-crm.com',
      phone: '+34 600 444 555',
      role: 'customer_service',
      status: 'active',
      created_at: new Date('2026-01-12T09:00:00Z').toISOString(),
      updated_at: new Date('2026-01-12T09:00:00Z').toISOString(),
    },
    // Sur Users
    {
      id: 'u2222222-2222-2222-2222-222222222201',
      organization_id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Alejandro Marín',
      email: 'alejandro.marin@sur-innovacion.es',
      phone: '+34 611 111 222',
      role: 'admin',
      status: 'active',
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
      updated_at: new Date('2026-02-01T10:00:00Z').toISOString(),
    },
    {
      id: 'u2222222-2222-2222-2222-222222222202',
      organization_id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Sofía Navarro',
      email: 'sofia.navarro@sur-innovacion.es',
      phone: '+34 611 222 333',
      role: 'manager',
      status: 'active',
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
      updated_at: new Date('2026-02-01T10:00:00Z').toISOString(),
    },
    {
      id: 'u2222222-2222-2222-2222-222222222203',
      organization_id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Pablo Herrera',
      email: 'pablo.herrera@sur-innovacion.es',
      phone: '+34 611 333 444',
      role: 'salesperson',
      status: 'active',
      created_at: new Date('2026-02-02T10:00:00Z').toISOString(),
      updated_at: new Date('2026-02-02T10:00:00Z').toISOString(),
    },
    {
      id: 'u2222222-2222-2222-2222-222222222204',
      organization_id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Marta Ortiz',
      email: 'marta.ortiz@sur-innovacion.es',
      phone: '+34 611 444 555',
      role: 'customer_service',
      status: 'active',
      created_at: new Date('2026-02-03T10:00:00Z').toISOString(),
      updated_at: new Date('2026-02-03T10:00:00Z').toISOString(),
    },
  ],
  pipelines: [
    {
      id: 'p1111111-1111-1111-1111-111111111111',
      organization_id: '11111111-1111-1111-1111-111111111111',
      name: 'Pipeline Ventas B2B',
      is_default: true,
      stages: [],
    },
    {
      id: 'p2222222-2222-2222-2222-222222222222',
      organization_id: '22222222-2222-2222-2222-222222222222',
      name: 'Pipeline Industrial Sur',
      is_default: true,
      stages: [],
    },
  ],
  pipelineStages: [
    // Norte Stages
    {
      id: 's1111111-0001-0000-0000-000000000001',
      organization_id: '11111111-1111-1111-1111-111111111111',
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      name: 'Nuevo',
      order_index: 1,
      probability: 10,
      color: '#64748b',
      is_won_stage: false,
      is_lost_stage: false,
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: 's1111111-0002-0000-0000-000000000002',
      organization_id: '11111111-1111-1111-1111-111111111111',
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      name: 'Contactado',
      order_index: 2,
      probability: 25,
      color: '#0284c7',
      is_won_stage: false,
      is_lost_stage: false,
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: 's1111111-0003-0000-0000-000000000003',
      organization_id: '11111111-1111-1111-1111-111111111111',
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      name: 'Interesado',
      order_index: 3,
      probability: 50,
      color: '#4f46e5',
      is_won_stage: false,
      is_lost_stage: false,
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: 's1111111-0004-0000-0000-000000000004',
      organization_id: '11111111-1111-1111-1111-111111111111',
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      name: 'Cotización',
      order_index: 4,
      probability: 75,
      color: '#d97706',
      is_won_stage: false,
      is_lost_stage: false,
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: 's1111111-0005-0000-0000-000000000005',
      organization_id: '11111111-1111-1111-1111-111111111111',
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      name: 'Negociación',
      order_index: 5,
      probability: 90,
      color: '#db2777',
      is_won_stage: false,
      is_lost_stage: false,
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: 's1111111-0006-0000-0000-000000000006',
      organization_id: '11111111-1111-1111-1111-111111111111',
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      name: 'Ganado',
      order_index: 6,
      probability: 100,
      color: '#059669',
      is_won_stage: true,
      is_lost_stage: false,
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: 's1111111-0007-0000-0000-000000000007',
      organization_id: '11111111-1111-1111-1111-111111111111',
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      name: 'Perdido',
      order_index: 7,
      probability: 0,
      color: '#dc2626',
      is_won_stage: false,
      is_lost_stage: true,
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    // Sur Stages
    {
      id: 's2222222-0001-0000-0000-000000000001',
      organization_id: '22222222-2222-2222-2222-222222222222',
      pipeline_id: 'p2222222-2222-2222-2222-222222222222',
      name: 'Lead Entrante',
      order_index: 1,
      probability: 15,
      color: '#64748b',
      is_won_stage: false,
      is_lost_stage: false,
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
    },
    {
      id: 's2222222-0002-0000-0000-000000000002',
      organization_id: '22222222-2222-2222-2222-222222222222',
      pipeline_id: 'p2222222-2222-2222-2222-222222222222',
      name: 'Visita Técnica',
      order_index: 2,
      probability: 40,
      color: '#0284c7',
      is_won_stage: false,
      is_lost_stage: false,
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
    },
    {
      id: 's2222222-0003-0000-0000-000000000003',
      organization_id: '22222222-2222-2222-2222-222222222222',
      pipeline_id: 'p2222222-2222-2222-2222-222222222222',
      name: 'Propuesta',
      order_index: 3,
      probability: 70,
      color: '#d97706',
      is_won_stage: false,
      is_lost_stage: false,
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
    },
    {
      id: 's2222222-0004-0000-0000-000000000004',
      organization_id: '22222222-2222-2222-2222-222222222222',
      pipeline_id: 'p2222222-2222-2222-2222-222222222222',
      name: 'Cerrado Ganado',
      order_index: 4,
      probability: 100,
      color: '#059669',
      is_won_stage: true,
      is_lost_stage: false,
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
    },
    {
      id: 's2222222-0005-0000-0000-000000000005',
      organization_id: '22222222-2222-2222-2222-222222222222',
      pipeline_id: 'p2222222-2222-2222-2222-222222222222',
      name: 'Cerrado Perdido',
      order_index: 5,
      probability: 0,
      color: '#dc2626',
      is_won_stage: false,
      is_lost_stage: true,
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
    },
  ],
  productCategories: [
    {
      id: 'cat-1101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      name: 'Software SaaS',
      description: 'Suscripciones y licencias en la nube',
      status: 'active',
    },
    {
      id: 'cat-1102',
      organization_id: '11111111-1111-1111-1111-111111111111',
      name: 'Consultoría & Servicios',
      description: 'Capacitación y desarrollo a medida',
      status: 'active',
    },
    {
      id: 'cat-2201',
      organization_id: '22222222-2222-2222-2222-222222222222',
      name: 'Maquinaria y Repuestos',
      description: 'Equipos y mantenimiento para plantas',
      status: 'active',
    },
  ],
  products: [
    {
      id: 'prd-1101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      sku: 'NEXUS-PRO-Y',
      name: 'Licencia Nexus Pro (Anual)',
      description: 'Plan anual para equipos comerciales',
      category_id: 'cat-1101',
      type: 'service',
      price: 28800.0,
      cost: 5000.0,
      tax_rate: 16.0,
      status: 'active',
      created_at: new Date('2026-01-10T10:00:00Z').toISOString(),
      updated_at: new Date('2026-01-10T10:00:00Z').toISOString(),
    },
    {
      id: 'prd-1102',
      organization_id: '11111111-1111-1111-1111-111111111111',
      sku: 'ONBOARDING-CORP',
      name: 'Pack Onboarding Empresarial',
      description: '20 horas de configuración e integración API',
      category_id: 'cat-1102',
      type: 'service',
      price: 56000.0,
      cost: 18000.0,
      tax_rate: 16.0,
      status: 'active',
      created_at: new Date('2026-01-10T10:00:00Z').toISOString(),
      updated_at: new Date('2026-01-10T10:00:00Z').toISOString(),
    },
    {
      id: 'prd-1103',
      organization_id: '11111111-1111-1111-1111-111111111111',
      sku: 'API-CONNECTOR',
      name: 'Conector ERP Dedicado',
      description: 'Módulo puente SAP / Microsip / Aspel',
      category_id: 'cat-1101',
      type: 'product',
      price: 98000.0,
      cost: 22000.0,
      tax_rate: 16.0,
      status: 'active',
      created_at: new Date('2026-01-12T10:00:00Z').toISOString(),
      updated_at: new Date('2026-01-12T10:00:00Z').toISOString(),
    },
    // Sur Products
    {
      id: 'prd-2201',
      organization_id: '22222222-2222-2222-2222-222222222222',
      sku: 'TURB-IND-500',
      name: 'Turbina Centrífuga TC-500',
      description: 'Generador industrial de flujo para naves',
      category_id: 'cat-2201',
      type: 'product',
      price: 370000.0,
      cost: 184000.0,
      tax_rate: 16.0,
      status: 'active',
      created_at: new Date('2026-02-01T10:00:00Z').toISOString(),
      updated_at: new Date('2026-02-01T10:00:00Z').toISOString(),
    },
  ],
  clients: [
    {
      id: 'c1111111-0001-0000-0000-000000000001',
      organization_id: '11111111-1111-1111-1111-111111111111',
      assigned_user_id: 'u1111111-1111-1111-1111-111111111103', // Lucía (Vendedora)
      first_name: 'Santiago',
      last_name: 'Alonso Gómez',
      full_name: 'Santiago Alonso Gómez',
      company_name: 'IberTech México, S.A. de C.V.',
      position: 'Director de IT',
      phone: '+52 55 5122 3456',
      whatsapp: '+52 55 6509 9887',
      email: 'salonso@ibertech.es',
      address: 'Paseo de la Reforma 180, Planta 8',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postal_code: '06600',
      source: 'referral',
      status: 'prospect',
      notes: 'Requieren migrar desde un CRM heredado a Nexus con 15 usuarios concurrentes.',
      last_contact_at: new Date('2026-09-12T11:30:00Z').toISOString(),
      next_follow_up_at: new Date('2026-09-20T10:00:00Z').toISOString(),
      created_by: 'u1111111-1111-1111-1111-111111111103',
      created_at: new Date('2026-08-15T09:00:00Z').toISOString(),
      updated_at: new Date('2026-09-12T11:30:00Z').toISOString(),
    },
    {
      id: 'c1111111-0002-0000-0000-000000000002',
      organization_id: '11111111-1111-1111-1111-111111111111',
      assigned_user_id: 'u1111111-1111-1111-1111-111111111103', // Lucía (Vendedora)
      first_name: 'Beatriz',
      last_name: 'Pérez Domínguez',
      full_name: 'Beatriz Pérez Domínguez',
      company_name: 'Logística del Norte y Bajío, S.A.',
      position: 'Directora de Operaciones',
      phone: '+52 81 8421 1099',
      whatsapp: '+52 81 8221 4455',
      email: 'bperez@logcantabria.com',
      address: 'Parque Industrial Milimex 120',
      city: 'Apodaca',
      state: 'Nuevo León',
      country: 'México',
      postal_code: '66637',
      source: 'website',
      status: 'customer',
      notes: 'Cliente activo con contrato de soporte y conector ERP operativo.',
      last_contact_at: new Date('2026-09-08T15:00:00Z').toISOString(),
      next_follow_up_at: new Date('2026-09-25T12:00:00Z').toISOString(),
      created_by: 'u1111111-1111-1111-1111-111111111102',
      created_at: new Date('2026-05-10T10:00:00Z').toISOString(),
      updated_at: new Date('2026-09-08T15:00:00Z').toISOString(),
    },
    {
      id: 'c1111111-0003-0000-0000-000000000003',
      organization_id: '11111111-1111-1111-1111-111111111111',
      assigned_user_id: 'u1111111-1111-1111-1111-111111111102', // Carlos Vega
      first_name: 'Javier',
      last_name: 'Montero Sanz',
      full_name: 'Javier Montero Sanz',
      company_name: 'Montero & Asociados Consultores, S.C.',
      position: 'Socio Director',
      phone: '+52 33 3915 6789',
      whatsapp: '+52 33 3622 3344',
      email: 'jmontero@monteroconsulting.com',
      address: 'Av. Américas 1500, Providencia',
      city: 'Guadalajara',
      state: 'Jalisco',
      country: 'México',
      postal_code: '44630',
      source: 'campaign',
      status: 'contacted',
      notes: 'Interesados en la versión SaaS para un equipo de 8 consultores.',
      last_contact_at: new Date('2026-09-14T09:30:00Z').toISOString(),
      next_follow_up_at: new Date('2026-09-18T16:00:00Z').toISOString(),
      created_by: 'u1111111-1111-1111-1111-111111111102',
      created_at: new Date('2026-09-01T08:30:00Z').toISOString(),
      updated_at: new Date('2026-09-14T09:30:00Z').toISOString(),
    },
    // Sur Clients (Should NEVER be visible to Norte)
    {
      id: 'c2222222-0001-0000-0000-000000000001',
      organization_id: '22222222-2222-2222-2222-222222222222',
      assigned_user_id: 'u2222222-2222-2222-2222-222222222203', // Pablo Herrera
      first_name: 'Rodrigo',
      last_name: 'Castillo Valiente',
      full_name: 'Rodrigo Castillo Valiente',
      company_name: 'Agroindustrias del Bajío, S.A.',
      position: 'Jefe de Planta',
      phone: '+52 442 558 8990',
      whatsapp: '+52 442 670 1239',
      email: 'rcastillo@agrobajio.mx',
      address: 'Carretera a Celaya km 14',
      city: 'Querétaro',
      state: 'Querétaro',
      country: 'México',
      postal_code: '76116',
      source: 'event',
      status: 'prospect',
      notes: 'Evaluando 2 turbinas centrífugas para línea de envasado.',
      last_contact_at: new Date('2026-09-11T12:00:00Z').toISOString(),
      next_follow_up_at: new Date('2026-09-22T10:00:00Z').toISOString(),
      created_by: 'u2222222-2222-2222-2222-222222222203',
      created_at: new Date('2026-08-10T10:00:00Z').toISOString(),
      updated_at: new Date('2026-09-11T12:00:00Z').toISOString(),
    },
  ],
  contacts: [
    {
      id: 'cnt-1101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      client_id: 'c1111111-0001-0000-0000-000000000001',
      first_name: 'Santiago',
      last_name: 'Alonso Gómez',
      position: 'Director de IT',
      email: 'salonso@ibertech.es',
      phone: '+34 913 224 550',
      whatsapp: '+34 650 998 877',
      is_primary: true,
      notes: 'Contacto decisor principal para la infraestructura de software.',
      created_at: new Date('2026-08-15T09:00:00Z').toISOString(),
      updated_at: new Date('2026-08-15T09:00:00Z').toISOString(),
    },
    {
      id: 'cnt-1102',
      organization_id: '11111111-1111-1111-1111-111111111111',
      client_id: 'c1111111-0001-0000-0000-000000000001',
      first_name: 'Patricia',
      last_name: 'López Ramos',
      position: 'Responsable de Compras',
      email: 'plopez@ibertech.es',
      phone: '+34 913 224 552',
      whatsapp: '+34 650 998 878',
      is_primary: false,
      notes: 'Gestiona la validación de presupuestos y facturación.',
      created_at: new Date('2026-08-18T10:00:00Z').toISOString(),
      updated_at: new Date('2026-08-18T10:00:00Z').toISOString(),
    },
  ],
  opportunities: [
    {
      id: 'opp-1101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      name: 'Implementación Nexus CRM Pro + Conector ERP',
      client_id: 'c1111111-0001-0000-0000-000000000001',
      contact_id: 'cnt-1101',
      assigned_user_id: 'u1111111-1111-1111-1111-111111111103', // Lucía
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      stage_id: 's1111111-0004-0000-0000-000000000004', // Cotización (75%)
      status: 'open',
      estimated_value: 212048.0,
      probability: 75,
      expected_close_date: '2026-10-15',
      source: 'referral',
      notes: 'Propuesta formal enviada con 15 licencias y conector ERP incluido.',
      manual_value: false,
      created_by: 'u1111111-1111-1111-1111-111111111103',
      created_at: new Date('2026-08-20T10:00:00Z').toISOString(),
      updated_at: new Date('2026-09-12T11:30:00Z').toISOString(),
    },
    {
      id: 'opp-1102',
      organization_id: '11111111-1111-1111-1111-111111111111',
      name: 'Renovación y Ampliación Logística del Norte',
      client_id: 'c1111111-0002-0000-0000-000000000002',
      assigned_user_id: 'u1111111-1111-1111-1111-111111111103', // Lucía
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      stage_id: 's1111111-0006-0000-0000-000000000006', // Ganado (100%)
      status: 'won',
      estimated_value: 84800.0,
      probability: 100,
      expected_close_date: '2026-09-08',
      source: 'website',
      notes: 'Venta cerrada y cobrada con contrato firmado.',
      manual_value: false,
      created_by: 'u1111111-1111-1111-1111-111111111102',
      created_at: new Date('2026-07-01T10:00:00Z').toISOString(),
      updated_at: new Date('2026-09-08T15:00:00Z').toISOString(),
    },
    {
      id: 'opp-1103',
      organization_id: '11111111-1111-1111-1111-111111111111',
      name: 'Suscripción Equipo Montero Consultores',
      client_id: 'c1111111-0003-0000-0000-000000000003',
      assigned_user_id: 'u1111111-1111-1111-1111-111111111102', // Carlos
      pipeline_id: 'p1111111-1111-1111-1111-111111111111',
      stage_id: 's1111111-0002-0000-0000-000000000002', // Contactado (25%)
      status: 'open',
      estimated_value: 70000.0,
      probability: 25,
      expected_close_date: '2026-11-01',
      source: 'campaign',
      notes: 'En proceso de demo con el socio director.',
      manual_value: true,
      created_by: 'u1111111-1111-1111-1111-111111111102',
      created_at: new Date('2026-09-02T10:00:00Z').toISOString(),
      updated_at: new Date('2026-09-14T09:30:00Z').toISOString(),
    },
    // Sur Opportunity
    {
      id: 'opp-2201',
      organization_id: '22222222-2222-2222-2222-222222222222',
      name: 'Suministro 2x Turbinas TC-500 Agroindustrias Bajío',
      client_id: 'c2222222-0001-0000-0000-000000000001',
      assigned_user_id: 'u2222222-2222-2222-2222-222222222203', // Pablo
      pipeline_id: 'p2222222-2222-2222-2222-222222222222',
      stage_id: 's2222222-0003-0000-0000-000000000003', // Propuesta (70%)
      status: 'open',
      estimated_value: 858400.0,
      probability: 70,
      expected_close_date: '2026-10-30',
      source: 'event',
      notes: 'Esperando aprobación de la dirección técnica.',
      manual_value: true,
      created_by: 'u2222222-2222-2222-2222-222222222203',
      created_at: new Date('2026-08-15T11:00:00Z').toISOString(),
      updated_at: new Date('2026-09-11T12:00:00Z').toISOString(),
    },
  ],
  opportunityItems: [
    {
      id: 'item-1101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      opportunity_id: 'opp-1101',
      product_id: 'prd-1101',
      item_name: 'Licencia Nexus Pro (Anual)',
      quantity: 1,
      unit_price: 28800.0,
      discount: 0,
      tax: 16,
      subtotal: 28800.0,
      total: 33408.0,
    },
    {
      id: 'item-1102',
      organization_id: '11111111-1111-1111-1111-111111111111',
      opportunity_id: 'opp-1101',
      product_id: 'prd-1102',
      item_name: 'Pack Onboarding Empresarial',
      quantity: 1,
      unit_price: 56000.0,
      discount: 0,
      tax: 16,
      subtotal: 56000.0,
      total: 64960.0,
    },
    {
      id: 'item-1103',
      organization_id: '11111111-1111-1111-1111-111111111111',
      opportunity_id: 'opp-1101',
      product_id: 'prd-1103',
      item_name: 'Conector ERP Dedicado',
      quantity: 1,
      unit_price: 98000.0,
      discount: 0,
      tax: 16,
      subtotal: 98000.0,
      total: 113680.0,
    },
  ],
  stageHistory: [
    {
      id: 'hist-1101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      opportunity_id: 'opp-1101',
      previous_stage_id: 's1111111-0001-0000-0000-000000000001',
      new_stage_id: 's1111111-0002-0000-0000-000000000002',
      changed_by: 'u1111111-1111-1111-1111-111111111103',
      changed_at: new Date('2026-08-25T10:00:00Z').toISOString(),
    },
    {
      id: 'hist-1102',
      organization_id: '11111111-1111-1111-1111-111111111111',
      opportunity_id: 'opp-1101',
      previous_stage_id: 's1111111-0002-0000-0000-000000000002',
      new_stage_id: 's1111111-0004-0000-0000-000000000004',
      changed_by: 'u1111111-1111-1111-1111-111111111103',
      changed_at: new Date('2026-09-12T11:30:00Z').toISOString(),
    },
  ],
  tasks: [
    {
      id: 'tsk-1101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      title: 'Llamada de seguimiento propuesta económica',
      description: 'Consultar si el departamento de compras tiene observaciones a los términos.',
      client_id: 'c1111111-0001-0000-0000-000000000001',
      opportunity_id: 'opp-1101',
      assigned_user_id: 'u1111111-1111-1111-1111-111111111103', // Lucía
      created_by: 'u1111111-1111-1111-1111-111111111103',
      type: 'call',
      priority: 'high',
      status: 'pending',
      due_date: '2026-09-20',
      due_time: '11:00',
      reminder_at: '2026-09-20T10:30:00Z',
      created_at: new Date('2026-09-12T11:35:00Z').toISOString(),
      updated_at: new Date('2026-09-12T11:35:00Z').toISOString(),
    },
    {
      id: 'tsk-1102',
      organization_id: '11111111-1111-1111-1111-111111111111',
      title: 'Enviar demo grabada a Montero Consultores',
      description: 'Preparar vídeo personalizado de 5 minutos mostrando flujo de tareas y CRM.',
      client_id: 'c1111111-0003-0000-0000-000000000003',
      opportunity_id: 'opp-1103',
      assigned_user_id: 'u1111111-1111-1111-1111-111111111102', // Carlos
      created_by: 'u1111111-1111-1111-1111-111111111102',
      type: 'email',
      priority: 'medium',
      status: 'in_progress',
      due_date: '2026-09-18',
      due_time: '16:00',
      created_at: new Date('2026-09-14T09:40:00Z').toISOString(),
      updated_at: new Date('2026-09-14T09:40:00Z').toISOString(),
    },
    {
      id: 'tsk-1103',
      organization_id: '11111111-1111-1111-1111-111111111111',
      title: 'Auditoría mensual de satisfacción cliente',
      description: 'Revisar tickets y feedback con Beatriz Pérez.',
      client_id: 'c1111111-0002-0000-0000-000000000002',
      assigned_user_id: 'u1111111-1111-1111-1111-111111111104', // David (Atención)
      created_by: 'u1111111-1111-1111-1111-111111111101',
      type: 'follow_up',
      priority: 'low',
      status: 'completed',
      due_date: '2026-09-10',
      completed_at: new Date('2026-09-10T14:30:00Z').toISOString(),
      created_at: new Date('2026-09-01T09:00:00Z').toISOString(),
      updated_at: new Date('2026-09-10T14:30:00Z').toISOString(),
    },
  ],
  activities: [
    {
      id: 'act-1101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      client_id: 'c1111111-0001-0000-0000-000000000001',
      opportunity_id: 'opp-1101',
      user_id: 'u1111111-1111-1111-1111-111111111103',
      type: 'stage_change',
      title: 'Etapa cambiada a Cotización',
      description: 'Oportunidad avanzada a etapa Cotización con presupuesto formal adjunto.',
      result: 'Propuesta enviada por correo electrónico.',
      created_at: new Date('2026-09-12T11:30:00Z').toISOString(),
    },
    {
      id: 'act-1102',
      organization_id: '11111111-1111-1111-1111-111111111111',
      client_id: 'c1111111-0001-0000-0000-000000000001',
      user_id: 'u1111111-1111-1111-1111-111111111103',
      type: 'meeting',
      title: 'Reunión de demostración técnica por videollamada',
      description: 'Presentación en vivo del módulo de oportunidades e integración ERP.',
      result: 'Feedback altamente positivo por parte de Santiago Alonso.',
      created_at: new Date('2026-09-10T16:00:00Z').toISOString(),
    },
    {
      id: 'act-1103',
      organization_id: '11111111-1111-1111-1111-111111111111',
      client_id: 'c1111111-0002-0000-0000-000000000002',
      opportunity_id: 'opp-1102',
      user_id: 'u1111111-1111-1111-1111-111111111102',
      type: 'stage_change',
      title: 'Oportunidad Ganada',
      description: 'Venta cerrada y contrato firmado por Beatriz Pérez.',
      result: 'Ingreso total: 4.240 €',
      created_at: new Date('2026-09-08T15:00:00Z').toISOString(),
    },
  ],
  notes: [
    {
      id: 'not-1101',
      organization_id: '11111111-1111-1111-1111-111111111111',
      client_id: 'c1111111-0001-0000-0000-000000000001',
      opportunity_id: 'opp-1101',
      created_by: 'u1111111-1111-1111-1111-111111111103',
      content: 'El cliente prefiere facturación anual anticipada para obtener descuento por pronto pago.',
      created_at: new Date('2026-09-12T11:40:00Z').toISOString(),
      updated_at: new Date('2026-09-12T11:40:00Z').toISOString(),
    },
  ],
  tags: [
    {
      id: 'tag-1',
      organization_id: '11111111-1111-1111-1111-111111111111',
      name: 'Cliente VIP',
      color: '#f59e0b',
    },
    {
      id: 'tag-2',
      organization_id: '11111111-1111-1111-1111-111111111111',
      name: 'Sector TI',
      color: '#3b82f6',
    },
    {
      id: 'tag-3',
      organization_id: '11111111-1111-1111-1111-111111111111',
      name: 'Logística',
      color: '#10b981',
    },
  ],
  auditLogs: [
    {
      id: 'aud-1',
      organization_id: '11111111-1111-1111-1111-111111111111',
      user_id: 'u1111111-1111-1111-1111-111111111101',
      action: 'ORGANIZATION_INITIALIZED',
      entity: 'organizations',
      entity_id: '11111111-1111-1111-1111-111111111111',
      metadata: { initial_users: 4, pipeline: 'Pipeline Ventas B2B' },
      created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
    },
    {
      id: 'aud-2',
      organization_id: '11111111-1111-1111-1111-111111111111',
      user_id: 'u1111111-1111-1111-1111-111111111103',
      action: 'STAGE_CHANGED',
      entity: 'opportunities',
      entity_id: 'opp-1101',
      metadata: { from: 'Interesado', to: 'Cotización', value: 9140 },
      created_at: new Date('2026-09-12T11:30:00Z').toISOString(),
    },
  ],
};

// Singleton in-memory database reference (isolated per process)
const memoryDB: DBState = JSON.parse(JSON.stringify(INITIAL_DB));

// Helper for generating UUIDs
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =========================================================================
// VALIDATION & SECURITY GUARDIAN (7-Step Context & RBAC Verifier)
// =========================================================================

export interface ExecutionContext {
  organizationId: string;
  userId: string;
}

export function validateContext(ctx: ExecutionContext): { user: User; organization: Organization } {
  if (!ctx.organizationId || !ctx.userId) {
    throw new Error('400: Parámetros de contexto requeridos (organizationId y userId).');
  }

  const organization = memoryDB.organizations.find((o) => o.id === ctx.organizationId);
  if (!organization) {
    throw new Error('404: Organización no encontrada en el sistema.');
  }

  const user = memoryDB.users.find((u) => u.id === ctx.userId);
  if (!user) {
    throw new Error('404: Usuario no encontrado.');
  }

  if (user.organization_id !== ctx.organizationId) {
    throw new Error('403: El usuario seleccionado no pertenece a la organización solicitada.');
  }

  if (user.status !== 'active') {
    throw new Error('403: La cuenta del usuario se encuentra inactiva o suspendida.');
  }

  return { user, organization };
}

// Log an audit event
export function recordAuditLog(
  ctx: ExecutionContext,
  action: string,
  entity: string,
  entityId: string,
  metadata?: Record<string, any>
) {
  const log: AuditLog = {
    id: generateUUID(),
    organization_id: ctx.organizationId,
    user_id: ctx.userId,
    action,
    entity,
    entity_id: entityId,
    metadata: metadata || null,
    created_at: new Date().toISOString(),
  };
  memoryDB.auditLogs.unshift(log);
}

// =========================================================================
// REPOSITORY METHODS
// =========================================================================

export const CRMRepository = {
  // Organizations
  getOrganizations(): Organization[] {
    return memoryDB.organizations;
  },

  getOrganizationById(id: string): Organization | undefined {
    return memoryDB.organizations.find((o) => o.id === id);
  },

  // Users
  getUsersByOrganization(organizationId: string): User[] {
    return memoryDB.users.filter((u) => u.organization_id === organizationId);
  },

  getUserById(userId: string): User | undefined {
    return memoryDB.users.find((u) => u.id === userId);
  },

  // Clients
  getClients(ctx: ExecutionContext, filters?: { search?: string; status?: string; assigned_user_id?: string; source?: string }): Client[] {
    validateContext(ctx);
    let list = memoryDB.clients.filter((c) => c.organization_id === ctx.organizationId && !c.archived_at);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          (c.company_name && c.company_name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q))
      );
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((c) => c.status === filters.status);
    }

    if (filters?.assigned_user_id && filters.assigned_user_id !== 'all') {
      list = list.filter((c) => c.assigned_user_id === filters.assigned_user_id);
    }

    if (filters?.source && filters.source !== 'all') {
      list = list.filter((c) => c.source === filters.source);
    }

    // Join with assigned user and stats
    return list.map((client) => {
      const assigned = memoryDB.users.find((u) => u.id === client.assigned_user_id);
      const contacts = memoryDB.contacts.filter((cnt) => cnt.client_id === client.id);
      const opps = memoryDB.opportunities.filter((o) => o.client_id === client.id);
      const totalOppValue = opps.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);

      return {
        ...client,
        assigned_user: assigned || null,
        contacts_count: contacts.length,
        opportunities_count: opps.length,
        total_opportunity_value: totalOppValue,
      };
    });
  },

  getClientById(ctx: ExecutionContext, clientId: string): Client | undefined {
    validateContext(ctx);
    const client = memoryDB.clients.find((c) => c.id === clientId && c.organization_id === ctx.organizationId);
    if (!client) return undefined;

    const assigned = memoryDB.users.find((u) => u.id === client.assigned_user_id);
    const contacts = memoryDB.contacts.filter((cnt) => cnt.client_id === client.id);
    const opps = memoryDB.opportunities.filter((o) => o.client_id === client.id);
    const totalOppValue = opps.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);

    return {
      ...client,
      assigned_user: assigned || null,
      contacts_count: contacts.length,
      opportunities_count: opps.length,
      total_opportunity_value: totalOppValue,
    };
  },

  checkDuplicateClient(ctx: ExecutionContext, data: { email?: string; phone?: string; whatsapp?: string; company_name?: string; first_name?: string; last_name?: string; excludeId?: string }): Client[] {
    validateContext(ctx);
    const duplicates: Client[] = [];
    const orgClients = memoryDB.clients.filter((c) => c.organization_id === ctx.organizationId && c.id !== data.excludeId && !c.archived_at);

    for (const c of orgClients) {
      let isMatch = false;
      if (data.email && c.email && c.email.trim().toLowerCase() === data.email.trim().toLowerCase()) {
        isMatch = true;
      }
      if (data.phone && c.phone && c.phone.replace(/\D/g, '') === data.phone.replace(/\D/g, '')) {
        isMatch = true;
      }
      if (data.whatsapp && c.whatsapp && c.whatsapp.replace(/\D/g, '') === data.whatsapp.replace(/\D/g, '')) {
        isMatch = true;
      }
      if (
        data.company_name &&
        c.company_name &&
        data.company_name.trim().toLowerCase() === c.company_name.trim().toLowerCase() &&
        data.first_name &&
        c.first_name.trim().toLowerCase() === data.first_name.trim().toLowerCase()
      ) {
        isMatch = true;
      }

      if (isMatch) {
        duplicates.push(c);
      }
    }

    return duplicates;
  },

  createClient(ctx: ExecutionContext, data: Partial<Client>): Client {
    const { user } = validateContext(ctx);

    const id = generateUUID();
    const now = new Date().toISOString();
    const newClient: Client = {
      id,
      organization_id: ctx.organizationId,
      assigned_user_id: data.assigned_user_id || ctx.userId,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      company_name: data.company_name || null,
      position: data.position || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || 'España',
      postal_code: data.postal_code || null,
      source: data.source || 'other',
      status: data.status || 'lead',
      notes: data.notes || null,
      created_by: ctx.userId,
      created_at: now,
      updated_at: now,
    };

    memoryDB.clients.unshift(newClient);

    // Create primary contact automatically if email or phone is given
    if (newClient.email || newClient.phone) {
      const contact: Contact = {
        id: generateUUID(),
        organization_id: ctx.organizationId,
        client_id: id,
        first_name: newClient.first_name,
        last_name: newClient.last_name,
        position: newClient.position,
        email: newClient.email,
        phone: newClient.phone,
        whatsapp: newClient.whatsapp,
        is_primary: true,
        notes: 'Contacto principal generado al crear cliente.',
        created_at: now,
        updated_at: now,
      };
      memoryDB.contacts.push(contact);
    }

    // Record Activity
    memoryDB.activities.unshift({
      id: generateUUID(),
      organization_id: ctx.organizationId,
      client_id: id,
      user_id: ctx.userId,
      type: 'system',
      title: 'Cliente creado en el sistema',
      description: `Cliente registrado por ${user.full_name} (${user.role}).`,
      created_at: now,
    });

    // Record Audit
    recordAuditLog(ctx, 'CLIENT_CREATED', 'clients', id, { client_name: newClient.full_name, company: newClient.company_name });

    return newClient;
  },

  updateClient(ctx: ExecutionContext, clientId: string, data: Partial<Client>): Client {
    const { user } = validateContext(ctx);
    const index = memoryDB.clients.findIndex((c) => c.id === clientId && c.organization_id === ctx.organizationId);
    if (index === -1) {
      throw new Error('404: Cliente no encontrado.');
    }

    const current = memoryDB.clients[index];
    const updated: Client = {
      ...current,
      ...data,
      full_name: `${data.first_name || current.first_name} ${data.last_name || current.last_name}`.trim(),
      updated_at: new Date().toISOString(),
    };

    memoryDB.clients[index] = updated;

    recordAuditLog(ctx, 'CLIENT_UPDATED', 'clients', clientId, { changes: Object.keys(data) });
    return updated;
  },

  archiveClient(ctx: ExecutionContext, clientId: string): void {
    const { user } = validateContext(ctx);
    if (user.role !== 'admin') {
      throw new Error('403: Solo un Administrador puede archivar o eliminar clientes.');
    }

    const client = memoryDB.clients.find((c) => c.id === clientId && c.organization_id === ctx.organizationId);
    if (!client) {
      throw new Error('404: Cliente no encontrado.');
    }

    client.archived_at = new Date().toISOString();
    client.status = 'archived';

    recordAuditLog(ctx, 'CLIENT_ARCHIVED', 'clients', clientId, { name: client.full_name });
  },

  // Contacts
  getContactsByClient(ctx: ExecutionContext, clientId: string): Contact[] {
    validateContext(ctx);
    return memoryDB.contacts.filter((c) => c.organization_id === ctx.organizationId && c.client_id === clientId);
  },

  createContact(ctx: ExecutionContext, data: Partial<Contact>): Contact {
    validateContext(ctx);
    const now = new Date().toISOString();
    const contact: Contact = {
      id: generateUUID(),
      organization_id: ctx.organizationId,
      client_id: data.client_id!,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      position: data.position || null,
      email: data.email || null,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      is_primary: data.is_primary || false,
      notes: data.notes || null,
      created_at: now,
      updated_at: now,
    };

    if (contact.is_primary) {
      memoryDB.contacts.forEach((c) => {
        if (c.client_id === contact.client_id) c.is_primary = false;
      });
    }

    memoryDB.contacts.unshift(contact);
    recordAuditLog(ctx, 'CONTACT_CREATED', 'contacts', contact.id, { client_id: contact.client_id, name: `${contact.first_name} ${contact.last_name}` });
    return contact;
  },

  // Pipelines & Stages
  getPipelines(ctx: ExecutionContext): Pipeline[] {
    validateContext(ctx);
    const pipelines = memoryDB.pipelines.filter((p) => p.organization_id === ctx.organizationId);
    return pipelines.map((p) => {
      const stages = memoryDB.pipelineStages
        .filter((s) => s.pipeline_id === p.id)
        .sort((a, b) => a.order_index - b.order_index);
      return { ...p, stages };
    });
  },

  getPipelineStages(ctx: ExecutionContext, pipelineId?: string): PipelineStage[] {
    validateContext(ctx);
    let list = memoryDB.pipelineStages.filter((s) => s.organization_id === ctx.organizationId);
    if (pipelineId) {
      list = list.filter((s) => s.pipeline_id === pipelineId);
    }
    return list.sort((a, b) => a.order_index - b.order_index);
  },

  // Opportunities
  getOpportunities(ctx: ExecutionContext, filters?: { status?: string; stage_id?: string; assigned_user_id?: string; client_id?: string }): Opportunity[] {
    validateContext(ctx);
    let list = memoryDB.opportunities.filter((o) => o.organization_id === ctx.organizationId && !o.archived_at);

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((o) => o.status === filters.status);
    }
    if (filters?.stage_id && filters.stage_id !== 'all') {
      list = list.filter((o) => o.stage_id === filters.stage_id);
    }
    if (filters?.assigned_user_id && filters.assigned_user_id !== 'all') {
      list = list.filter((o) => o.assigned_user_id === filters.assigned_user_id);
    }
    if (filters?.client_id) {
      list = list.filter((o) => o.client_id === filters.client_id);
    }

    return list.map((opp) => {
      const client = memoryDB.clients.find((c) => c.id === opp.client_id);
      const contact = memoryDB.contacts.find((cnt) => cnt.id === opp.contact_id);
      const assigned = memoryDB.users.find((u) => u.id === opp.assigned_user_id);
      const stage = memoryDB.pipelineStages.find((s) => s.id === opp.stage_id);
      const items = memoryDB.opportunityItems.filter((i) => i.opportunity_id === opp.id);

      return {
        ...opp,
        client,
        contact,
        assigned_user: assigned,
        stage,
        items,
      };
    });
  },

  getOpportunityById(ctx: ExecutionContext, id: string): Opportunity | undefined {
    validateContext(ctx);
    const opp = memoryDB.opportunities.find((o) => o.id === id && o.organization_id === ctx.organizationId);
    if (!opp) return undefined;

    const client = memoryDB.clients.find((c) => c.id === opp.client_id);
    const contact = memoryDB.contacts.find((cnt) => cnt.id === opp.contact_id);
    const assigned = memoryDB.users.find((u) => u.id === opp.assigned_user_id);
    const stage = memoryDB.pipelineStages.find((s) => s.id === opp.stage_id);
    const items = memoryDB.opportunityItems.filter((i) => i.opportunity_id === opp.id);

    return {
      ...opp,
      client,
      contact,
      assigned_user: assigned,
      stage,
      items,
    };
  },

  createOpportunity(ctx: ExecutionContext, data: Partial<Opportunity>, items?: Partial<OpportunityItem>[]): Opportunity {
    const { user } = validateContext(ctx);
    const now = new Date().toISOString();
    const id = generateUUID();

    const pipelines = this.getPipelines(ctx);
    const pipelineId = data.pipeline_id || pipelines[0]?.id || 'p1111111-1111-1111-1111-111111111111';
    const stages = this.getPipelineStages(ctx, pipelineId);
    const stageId = data.stage_id || stages[0]?.id || 's1111111-0001-0000-0000-000000000001';
    const currentStage = stages.find((s) => s.id === stageId);

    let calculatedValue = Number(data.estimated_value || 0);
    const hasItems = items && items.length > 0;

    const opp: Opportunity = {
      id,
      organization_id: ctx.organizationId,
      name: data.name || 'Nueva Negociación',
      client_id: data.client_id!,
      contact_id: data.contact_id || null,
      assigned_user_id: data.assigned_user_id || ctx.userId,
      pipeline_id: pipelineId,
      stage_id: stageId,
      status: currentStage?.is_won_stage ? 'won' : currentStage?.is_lost_stage ? 'lost' : 'open',
      estimated_value: calculatedValue,
      probability: currentStage?.probability ?? 10,
      expected_close_date: data.expected_close_date || null,
      source: data.source || null,
      notes: data.notes || null,
      manual_value: !hasItems,
      created_by: ctx.userId,
      created_at: now,
      updated_at: now,
    };

    if (hasItems) {
      let totalSum = 0;
      items.forEach((item) => {
        const qty = Number(item.quantity || 1);
        const price = Number(item.unit_price || 0);
        const discount = Number(item.discount || 0);
        const tax = Number(item.tax || 21);
        const subtotal = qty * price * (1 - discount / 100);
        const total = subtotal * (1 + tax / 100);
        totalSum += total;

        memoryDB.opportunityItems.push({
          id: generateUUID(),
          organization_id: ctx.organizationId,
          opportunity_id: id,
          product_id: item.product_id || null,
          item_name: item.item_name || 'Ítem cotizado',
          quantity: qty,
          unit_price: price,
          discount,
          tax,
          subtotal: Math.round(subtotal * 100) / 100,
          total: Math.round(total * 100) / 100,
        });
      });
      opp.estimated_value = Math.round(totalSum * 100) / 100;
    }

    memoryDB.opportunities.unshift(opp);

    // Record stage history
    memoryDB.stageHistory.push({
      id: generateUUID(),
      organization_id: ctx.organizationId,
      opportunity_id: id,
      previous_stage_id: null,
      new_stage_id: stageId,
      changed_by: ctx.userId,
      changed_at: now,
    });

    // Record activity
    memoryDB.activities.unshift({
      id: generateUUID(),
      organization_id: ctx.organizationId,
      client_id: opp.client_id,
      opportunity_id: id,
      user_id: ctx.userId,
      type: 'system',
      title: `Oportunidad creada: "${opp.name}"`,
      description: `Valor estimado: ${opp.estimated_value} € (Etapa: ${currentStage?.name})`,
      created_at: now,
    });

    recordAuditLog(ctx, 'OPPORTUNITY_CREATED', 'opportunities', id, { name: opp.name, value: opp.estimated_value });

    return opp;
  },

  updateOpportunityStage(ctx: ExecutionContext, opportunityId: string, newStageId: string): Opportunity {
    const { user } = validateContext(ctx);
    const opp = memoryDB.opportunities.find((o) => o.id === opportunityId && o.organization_id === ctx.organizationId);
    if (!opp) {
      throw new Error('404: Oportunidad no encontrada.');
    }

    const previousStageId = opp.stage_id;
    const stages = this.getPipelineStages(ctx, opp.pipeline_id);
    const prevStage = stages.find((s) => s.id === previousStageId);
    const nextStage = stages.find((s) => s.id === newStageId);

    if (!nextStage) {
      throw new Error('404: Etapa de destino no encontrada.');
    }

    const now = new Date().toISOString();
    opp.stage_id = newStageId;
    opp.probability = nextStage.probability;
    opp.updated_at = now;

    if (nextStage.is_won_stage) {
      opp.status = 'won';
    } else if (nextStage.is_lost_stage) {
      opp.status = 'lost';
    } else {
      opp.status = 'open';
    }

    // Record in stage history
    memoryDB.stageHistory.push({
      id: generateUUID(),
      organization_id: ctx.organizationId,
      opportunity_id: opportunityId,
      previous_stage_id: previousStageId,
      new_stage_id: newStageId,
      changed_by: ctx.userId,
      changed_at: now,
    });

    // Record activity
    memoryDB.activities.unshift({
      id: generateUUID(),
      organization_id: ctx.organizationId,
      client_id: opp.client_id,
      opportunity_id: opp.id,
      user_id: ctx.userId,
      type: 'stage_change',
      title: `Cambio de etapa: "${opp.name}"`,
      description: `Movida de "${prevStage?.name || 'Etapa previa'}" a "${nextStage.name}" (${nextStage.probability}%) por ${user.full_name}.`,
      created_at: now,
    });

    recordAuditLog(ctx, 'OPPORTUNITY_STAGE_CHANGED', 'opportunities', opportunityId, {
      from: prevStage?.name,
      to: nextStage.name,
      status: opp.status,
    });

    return opp;
  },

  // Products
  getProducts(ctx: ExecutionContext): Product[] {
    validateContext(ctx);
    const products = memoryDB.products.filter((p) => p.organization_id === ctx.organizationId);
    return products.map((p) => {
      const category = memoryDB.productCategories.find((c) => c.id === p.category_id);
      return { ...p, category };
    });
  },

  getProductCategories(ctx: ExecutionContext): ProductCategory[] {
    validateContext(ctx);
    return memoryDB.productCategories.filter((c) => c.organization_id === ctx.organizationId);
  },

  createProduct(ctx: ExecutionContext, data: Partial<Product>): Product {
    const { user } = validateContext(ctx);
    if (user.role !== 'admin') {
      throw new Error('403: Solo un Administrador puede crear productos en el catálogo.');
    }

    const now = new Date().toISOString();
    const id = generateUUID();
    const product: Product = {
      id,
      organization_id: ctx.organizationId,
      sku: data.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: data.name || 'Nuevo Producto/Servicio',
      description: data.description || null,
      category_id: data.category_id || null,
      type: data.type || 'product',
      price: Number(data.price || 0),
      cost: Number(data.cost || 0),
      tax_rate: Number(data.tax_rate || 21),
      status: 'active',
      created_at: now,
      updated_at: now,
    };

    memoryDB.products.unshift(product);
    recordAuditLog(ctx, 'PRODUCT_CREATED', 'products', id, { name: product.name, sku: product.sku });
    return product;
  },

  // Tasks
  getTasks(ctx: ExecutionContext, filters?: { status?: string; priority?: string; assigned_user_id?: string; client_id?: string }): Task[] {
    validateContext(ctx);
    let list = memoryDB.tasks.filter((t) => t.organization_id === ctx.organizationId);

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter((t) => t.priority === filters.priority);
    }
    if (filters?.assigned_user_id && filters.assigned_user_id !== 'all') {
      list = list.filter((t) => t.assigned_user_id === filters.assigned_user_id);
    }
    if (filters?.client_id) {
      list = list.filter((t) => t.client_id === filters.client_id);
    }

    return list.map((task) => {
      const client = memoryDB.clients.find((c) => c.id === task.client_id);
      const opportunity = memoryDB.opportunities.find((o) => o.id === task.opportunity_id);
      const assigned = memoryDB.users.find((u) => u.id === task.assigned_user_id);

      return {
        ...task,
        client,
        opportunity,
        assigned_user: assigned,
      };
    });
  },

  createTask(ctx: ExecutionContext, data: Partial<Task>): Task {
    const { user } = validateContext(ctx);
    const now = new Date().toISOString();
    const id = generateUUID();

    const task: Task = {
      id,
      organization_id: ctx.organizationId,
      title: data.title || 'Nueva Tarea de Seguimiento',
      description: data.description || null,
      client_id: data.client_id || null,
      opportunity_id: data.opportunity_id || null,
      assigned_user_id: data.assigned_user_id || ctx.userId,
      created_by: ctx.userId,
      type: data.type || 'follow_up',
      priority: data.priority || 'medium',
      status: 'pending',
      due_date: data.due_date || new Date().toISOString().split('T')[0],
      due_time: data.due_time || '10:00',
      reminder_at: data.reminder_at || null,
      completed_at: null,
      created_at: now,
      updated_at: now,
    };

    memoryDB.tasks.unshift(task);

    // Record activity
    memoryDB.activities.unshift({
      id: generateUUID(),
      organization_id: ctx.organizationId,
      client_id: task.client_id,
      opportunity_id: task.opportunity_id,
      user_id: ctx.userId,
      type: 'system',
      title: `Tarea programada: "${task.title}"`,
      description: `Asignada a ${user.full_name} para la fecha ${task.due_date}`,
      created_at: now,
    });

    recordAuditLog(ctx, 'TASK_CREATED', 'tasks', id, { title: task.title, due_date: task.due_date });
    return task;
  },

  updateTaskStatus(ctx: ExecutionContext, taskId: string, status: Task['status']): Task {
    const { user } = validateContext(ctx);
    const task = memoryDB.tasks.find((t) => t.id === taskId && t.organization_id === ctx.organizationId);
    if (!task) {
      throw new Error('404: Tarea no encontrada.');
    }

    const now = new Date().toISOString();
    task.status = status;
    task.updated_at = now;
    if (status === 'completed') {
      task.completed_at = now;
      memoryDB.activities.unshift({
        id: generateUUID(),
        organization_id: ctx.organizationId,
        client_id: task.client_id,
        opportunity_id: task.opportunity_id,
        user_id: ctx.userId,
        type: 'task_completed',
        title: `Tarea completada: "${task.title}"`,
        description: `Completada por ${user.full_name}.`,
        created_at: now,
      });
    }

    recordAuditLog(ctx, 'TASK_STATUS_UPDATED', 'tasks', taskId, { status });
    return task;
  },

  // Activities & Timeline
  getActivities(ctx: ExecutionContext, filters?: { client_id?: string; opportunity_id?: string }): Activity[] {
    validateContext(ctx);
    let list = memoryDB.activities.filter((a) => a.organization_id === ctx.organizationId);

    if (filters?.client_id) {
      list = list.filter((a) => a.client_id === filters.client_id);
    }
    if (filters?.opportunity_id) {
      list = list.filter((a) => a.opportunity_id === filters.opportunity_id);
    }

    return list.map((act) => {
      const user = memoryDB.users.find((u) => u.id === act.user_id);
      const client = memoryDB.clients.find((c) => c.id === act.client_id);
      const opportunity = memoryDB.opportunities.find((o) => o.id === act.opportunity_id);
      return { ...act, user, client, opportunity };
    });
  },

  createActivity(ctx: ExecutionContext, data: Partial<Activity>): Activity {
    const { user } = validateContext(ctx);
    const now = new Date().toISOString();
    const act: Activity = {
      id: generateUUID(),
      organization_id: ctx.organizationId,
      client_id: data.client_id || null,
      opportunity_id: data.opportunity_id || null,
      user_id: ctx.userId,
      type: data.type || 'note',
      title: data.title || 'Actividad registrada',
      description: data.description || null,
      result: data.result || null,
      follow_up_at: data.follow_up_at || null,
      created_at: now,
    };

    memoryDB.activities.unshift(act);

    // If client is present, update last_contact_at
    if (act.client_id) {
      const client = memoryDB.clients.find((c) => c.id === act.client_id);
      if (client) {
        client.last_contact_at = now;
        if (act.follow_up_at) {
          client.next_follow_up_at = act.follow_up_at;
        }
      }
    }

    recordAuditLog(ctx, 'ACTIVITY_LOGGED', 'activities', act.id, { type: act.type, title: act.title });
    return act;
  },

  // Notes
  getNotes(ctx: ExecutionContext, clientId?: string, opportunityId?: string): Note[] {
    validateContext(ctx);
    let list = memoryDB.notes.filter((n) => n.organization_id === ctx.organizationId);
    if (clientId) list = list.filter((n) => n.client_id === clientId);
    if (opportunityId) list = list.filter((n) => n.opportunity_id === opportunityId);

    return list.map((n) => {
      const user = memoryDB.users.find((u) => u.id === n.created_by);
      return { ...n, user };
    });
  },

  createNote(ctx: ExecutionContext, data: { content: string; client_id?: string; opportunity_id?: string }): Note {
    const { user } = validateContext(ctx);
    const now = new Date().toISOString();
    const note: Note = {
      id: generateUUID(),
      organization_id: ctx.organizationId,
      client_id: data.client_id || null,
      opportunity_id: data.opportunity_id || null,
      created_by: ctx.userId,
      content: data.content,
      created_at: now,
      updated_at: now,
    };

    memoryDB.notes.unshift(note);

    // Also register in activities timeline
    memoryDB.activities.unshift({
      id: generateUUID(),
      organization_id: ctx.organizationId,
      client_id: data.client_id || null,
      opportunity_id: data.opportunity_id || null,
      user_id: ctx.userId,
      type: 'note',
      title: 'Nota agregada',
      description: data.content,
      created_at: now,
    });

    recordAuditLog(ctx, 'NOTE_CREATED', 'notes', note.id);
    return { ...note, user };
  },

  // Audit logs
  getAuditLogs(ctx: ExecutionContext, limit = 50): AuditLog[] {
    validateContext(ctx);
    const logs = memoryDB.auditLogs
      .filter((l) => l.organization_id === ctx.organizationId)
      .slice(0, limit);

    return logs.map((l) => {
      const user = memoryDB.users.find((u) => u.id === l.user_id);
      return { ...l, user };
    });
  },

  // Dashboard & Reports Metrics Engine
  getDashboardMetrics(ctx: ExecutionContext) {
    validateContext(ctx);
    const orgClients = memoryDB.clients.filter((c) => c.organization_id === ctx.organizationId && !c.archived_at);
    const orgOpps = memoryDB.opportunities.filter((o) => o.organization_id === ctx.organizationId && !o.archived_at);
    const orgTasks = memoryDB.tasks.filter((t) => t.organization_id === ctx.organizationId);

    const activeOpps = orgOpps.filter((o) => o.status === 'open');
    const wonOpps = orgOpps.filter((o) => o.status === 'won');
    const lostOpps = orgOpps.filter((o) => o.status === 'lost');
    const closedOppsCount = wonOpps.length + lostOpps.length;

    // Calculations as defined in section 36
    const totalPipelineValue = activeOpps.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);
    const weightedPipelineValue = activeOpps.reduce((acc, curr) => acc + (curr.estimated_value || 0) * (curr.probability / 100), 0);
    const totalSalesWon = wonOpps.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);
    const averageTicket = wonOpps.length > 0 ? totalSalesWon / wonOpps.length : 0;
    const conversionRate = closedOppsCount > 0 ? (wonOpps.length / closedOppsCount) * 100 : 0;

    const pendingTasks = orgTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
    const overdueTasks = orgTasks.filter((t) => {
      if (t.status === 'completed' || t.status === 'cancelled') return false;
      return new Date(t.due_date) < new Date(new Date().toISOString().split('T')[0]);
    });

    // Pipeline by Stage
    const stages = memoryDB.pipelineStages.filter((s) => s.organization_id === ctx.organizationId);
    const pipelineByStage = stages.map((stage) => {
      const oppsInStage = orgOpps.filter((o) => o.stage_id === stage.id);
      const stageValue = oppsInStage.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);
      return {
        stageId: stage.id,
        stageName: stage.name,
        color: stage.color,
        count: oppsInStage.length,
        value: stageValue,
      };
    });

    // Sales by Rep
    const users = memoryDB.users.filter((u) => u.organization_id === ctx.organizationId && (u.role === 'salesperson' || u.role === 'manager' || u.role === 'admin'));
    const salesByRep = users.map((user) => {
      const userWon = wonOpps.filter((o) => o.assigned_user_id === user.id);
      const userActive = activeOpps.filter((o) => o.assigned_user_id === user.id);
      const totalWon = userWon.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);
      const totalActive = userActive.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);
      return {
        userId: user.id,
        userName: user.full_name,
        role: user.role,
        wonValue: totalWon,
        activeValue: totalActive,
        dealsCount: userWon.length,
      };
    });

    // Clients by Source
    const sourcesMap: Record<string, number> = {};
    orgClients.forEach((c) => {
      sourcesMap[c.source] = (sourcesMap[c.source] || 0) + 1;
    });
    const clientsBySource = Object.entries(sourcesMap).map(([source, count]) => ({
      source,
      count,
    }));

    // Monthly Trend (Simulated realistic series)
    const monthlySales = [
      { month: 'Mayo', won: 4200, active: 12500 },
      { month: 'Junio', won: 7800, active: 16000 },
      { month: 'Julio', won: 6100, active: 18400 },
      { month: 'Agosto', won: 9500, active: 22000 },
      { month: 'Septiembre', won: totalSalesWon, active: totalPipelineValue },
    ];

    return {
      totalClients: orgClients.length,
      newClientsThisMonth: orgClients.filter((c) => new Date(c.created_at) > new Date('2026-09-01')).length,
      activeOpportunitiesCount: activeOpps.length,
      totalPipelineValue,
      weightedPipelineValue,
      totalSalesWon,
      averageTicket,
      conversionRate,
      pendingTasksCount: pendingTasks.length,
      overdueTasksCount: overdueTasks.length,
      pipelineByStage,
      salesByRep,
      clientsBySource,
      monthlySales,
    };
  },
};
