/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { CRMRepository, ExecutionContext, validateContext } from './src/server/crm-repository';
import * as XLSX from 'xlsx';

const app = express();
const PORT = 3000;

app.use(express.json());

// =========================================================================
// CONTEXT EXTRACTOR MIDDLEWARE
// =========================================================================
function extractExecutionContext(req: Request): ExecutionContext {
  const organizationId =
    (req.headers['x-organization-id'] as string) ||
    (req.query.organization_id as string) ||
    req.body?.organization_id;

  const userId =
    (req.headers['x-user-id'] as string) ||
    (req.query.user_id as string) ||
    req.body?.user_id;

  return { organizationId, userId };
}

// =========================================================================
// API ROUTES (Backend Intermedio con Validación Multiempresa)
// =========================================================================

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Nexus CRM Backend', timestamp: new Date().toISOString() });
});

// 2. Organizations & User Session context selector
app.get('/api/organizations', (req: Request, res: Response) => {
  try {
    const orgs = CRMRepository.getOrganizations();
    res.json({ success: true, data: orgs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/users', (req: Request, res: Response) => {
  try {
    const orgId = req.query.organization_id as string;
    if (!orgId) {
      return res.status(400).json({ success: false, error: { message: 'organization_id es requerido' } });
    }
    const users = CRMRepository.getUsersByOrganization(orgId);
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// 3. Clients
app.get('/api/clients', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      assigned_user_id: req.query.assigned_user_id as string,
      source: req.query.source as string,
    };
    const clients = CRMRepository.getClients(ctx, filters);
    res.json({ success: true, data: clients });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/clients/check-duplicates', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const duplicates = CRMRepository.checkDuplicateClient(ctx, req.body);
    res.json({ success: true, data: duplicates });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/clients/:id', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const client = CRMRepository.getClientById(ctx, req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: { message: 'Cliente no encontrado' } });
    }
    res.json({ success: true, data: client });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/clients', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const client = CRMRepository.createClient(ctx, req.body);
    res.json({ success: true, data: client });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.put('/api/clients/:id', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const client = CRMRepository.updateClient(ctx, req.params.id, req.body);
    res.json({ success: true, data: client });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.delete('/api/clients/:id', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    CRMRepository.archiveClient(ctx, req.params.id);
    res.json({ success: true, message: 'Cliente archivado correctamente' });
  } catch (error: any) {
    res.status(403).json({ success: false, error: { message: error.message } });
  }
});

// 4. Contacts
app.get('/api/contacts', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const clientId = req.query.client_id as string;
    if (!clientId) {
      return res.status(400).json({ success: false, error: { message: 'client_id es requerido' } });
    }
    const contacts = CRMRepository.getContactsByClient(ctx, clientId);
    res.json({ success: true, data: contacts });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/contacts', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const contact = CRMRepository.createContact(ctx, req.body);
    res.json({ success: true, data: contact });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 5. Pipeline & Stages
app.get('/api/pipeline', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const pipelines = CRMRepository.getPipelines(ctx);
    const stages = CRMRepository.getPipelineStages(ctx);
    res.json({ success: true, data: { pipelines, stages } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 6. Opportunities
app.get('/api/opportunities', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const filters = {
      status: req.query.status as string,
      stage_id: req.query.stage_id as string,
      assigned_user_id: req.query.assigned_user_id as string,
      client_id: req.query.client_id as string,
    };
    const opportunities = CRMRepository.getOpportunities(ctx, filters);
    res.json({ success: true, data: opportunities });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/opportunities/:id', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const opp = CRMRepository.getOpportunityById(ctx, req.params.id);
    if (!opp) {
      return res.status(404).json({ success: false, error: { message: 'Oportunidad no encontrada' } });
    }
    res.json({ success: true, data: opp });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/opportunities', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const opp = CRMRepository.createOpportunity(ctx, req.body.opportunity, req.body.items);
    res.json({ success: true, data: opp });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.put('/api/opportunities/:id/stage', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const { stage_id } = req.body;
    if (!stage_id) {
      return res.status(400).json({ success: false, error: { message: 'stage_id requerido' } });
    }
    const opp = CRMRepository.updateOpportunityStage(ctx, req.params.id, stage_id);
    res.json({ success: true, data: opp });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 7. Products & Categories
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const products = CRMRepository.getProducts(ctx);
    const categories = CRMRepository.getProductCategories(ctx);
    res.json({ success: true, data: { products, categories } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/products', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const product = CRMRepository.createProduct(ctx, req.body);
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(403).json({ success: false, error: { message: error.message } });
  }
});

// 8. Tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      assigned_user_id: req.query.assigned_user_id as string,
      client_id: req.query.client_id as string,
    };
    const tasks = CRMRepository.getTasks(ctx, filters);
    res.json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/tasks', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const task = CRMRepository.createTask(ctx, req.body);
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.patch('/api/tasks/:id/status', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const { status } = req.body;
    const task = CRMRepository.updateTaskStatus(ctx, req.params.id, status);
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 9. Activities
app.get('/api/activities', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const filters = {
      client_id: req.query.client_id as string,
      opportunity_id: req.query.opportunity_id as string,
    };
    const activities = CRMRepository.getActivities(ctx, filters);
    res.json({ success: true, data: activities });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/activities', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const activity = CRMRepository.createActivity(ctx, req.body);
    res.json({ success: true, data: activity });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 10. Notes
app.get('/api/notes', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const clientId = req.query.client_id as string;
    const oppId = req.query.opportunity_id as string;
    const notes = CRMRepository.getNotes(ctx, clientId, oppId);
    res.json({ success: true, data: notes });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/notes', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const note = CRMRepository.createNote(ctx, req.body);
    res.json({ success: true, data: note });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 11. Dashboard & Reports metrics
app.get('/api/reports/dashboard', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const metrics = CRMRepository.getDashboardMetrics(ctx);
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 12. Audit Logs
app.get('/api/audit', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const limit = Number(req.query.limit || 50);
    const logs = CRMRepository.getAuditLogs(ctx, limit);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// 13. Data Export (CSV & XLSX with filters and permission verification)
app.get('/api/export/:entity', (req: Request, res: Response) => {
  try {
    const ctx = extractExecutionContext(req);
    const { user } = validateContext(ctx);

    if (user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ success: false, error: { message: '403: No tienes permisos para exportar datos del sistema.' } });
    }

    const { entity } = req.params;
    const format = (req.query.format as string) || 'xlsx';
    let dataToExport: any[] = [];

    if (entity === 'clients') {
      const clients = CRMRepository.getClients(ctx);
      dataToExport = clients.map((c) => ({
        'Nombre Completo': c.full_name,
        Empresa: c.company_name || '-',
        Cargo: c.position || '-',
        Email: c.email || '-',
        Teléfono: c.phone || '-',
        WhatsApp: c.whatsapp || '-',
        Ciudad: c.city || '-',
        Vendedor: c.assigned_user?.full_name || 'Sin Asignar',
        Estado: c.status,
        Origen: c.source,
        'Oportunidades ($ MXN)': c.total_opportunity_value || 0,
        'Fecha Alta': c.created_at.split('T')[0],
      }));
    } else if (entity === 'opportunities') {
      const opps = CRMRepository.getOpportunities(ctx);
      dataToExport = opps.map((o) => ({
        Oportunidad: o.name,
        Cliente: o.client?.company_name || o.client?.full_name || '-',
        'Valor Estimado ($ MXN)': o.estimated_value,
        'Probabilidad (%)': o.probability,
        Etapa: o.stage?.name || '-',
        Estado: o.status,
        Responsable: o.assigned_user?.full_name || '-',
        'Fecha Prevista Cierre': o.expected_close_date || '-',
      }));
    } else if (entity === 'products') {
      const products = CRMRepository.getProducts(ctx);
      dataToExport = products.map((p) => ({
        SKU: p.sku,
        Nombre: p.name,
        Tipo: p.type,
        'Precio ($ MXN)': p.price,
        'Costo ($ MXN)': p.cost,
        'IVA (%)': p.tax_rate,
        Estado: p.status,
      }));
    } else {
      return res.status(400).json({ success: false, error: { message: 'Entidad de exportación no soportada' } });
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, entity.toUpperCase());

    if (format === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${entity}_${ctx.organizationId.slice(0, 8)}.csv"`);
      return res.send(csv);
    } else {
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${entity}_${ctx.organizationId.slice(0, 8)}.xlsx"`);
      return res.send(buffer);
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

// =========================================================================
// VITE MIDDLEWARE & SERVER START
// =========================================================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus CRM Server listening on port ${PORT}`);
  });
}

start();
