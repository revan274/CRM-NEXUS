/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'manager' | 'salesperson' | 'customer_service';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  status: 'active' | 'trial' | 'suspended';
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  timezone: string;
  currency: string;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  auth_user_id?: string | null; // Reserved for future Supabase Auth integration
  organization_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export type ClientStatus = 'lead' | 'contacted' | 'prospect' | 'customer' | 'inactive' | 'archived';
export type ClientSource = 'website' | 'referral' | 'cold_call' | 'linkedin' | 'event' | 'campaign' | 'whatsapp' | 'other';

export interface Client {
  id: string;
  organization_id: string;
  assigned_user_id?: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  company_name?: string | null;
  position?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
  source: ClientSource;
  status: ClientStatus;
  notes?: string | null;
  last_contact_at?: string | null;
  next_follow_up_at?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  // Joins / derived
  assigned_user?: User | null;
  tags?: Tag[];
  contacts_count?: number;
  opportunities_count?: number;
  total_opportunity_value?: number;
}

export interface Contact {
  id: string;
  organization_id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  position?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  is_primary: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive';
}

export interface Product {
  id: string;
  organization_id: string;
  sku: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  type: 'product' | 'service';
  price: number;
  cost: number;
  tax_rate: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  category?: ProductCategory;
}

export interface Pipeline {
  id: string;
  organization_id: string;
  name: string;
  is_default: boolean;
  stages: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  organization_id: string;
  pipeline_id: string;
  name: string;
  order_index: number;
  probability: number; // 0 to 100
  color: string;
  is_won_stage: boolean;
  is_lost_stage: boolean;
  created_at: string;
}

export type OpportunityStatus = 'open' | 'won' | 'lost' | 'archived';

export interface Opportunity {
  id: string;
  organization_id: string;
  name: string;
  client_id: string;
  contact_id?: string | null;
  assigned_user_id: string;
  pipeline_id: string;
  stage_id: string;
  status: OpportunityStatus;
  estimated_value: number;
  probability: number;
  expected_close_date?: string | null;
  source?: ClientSource | null;
  notes?: string | null;
  manual_value: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
  // Joins
  client?: Client;
  contact?: Contact;
  assigned_user?: User;
  stage?: PipelineStage;
  items?: OpportunityItem[];
}

export interface OpportunityItem {
  id: string;
  organization_id: string;
  opportunity_id: string;
  product_id?: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  discount: number; // percentage
  tax: number; // percentage
  subtotal: number;
  total: number;
}

export interface OpportunityStageHistory {
  id: string;
  organization_id: string;
  opportunity_id: string;
  previous_stage_id?: string | null;
  new_stage_id: string;
  changed_by: string;
  changed_at: string;
  previous_stage?: PipelineStage;
  new_stage?: PipelineStage;
  user?: User;
}

export type TaskType = 'call' | 'whatsapp' | 'email' | 'meeting' | 'follow_up' | 'quote' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface Task {
  id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  client_id?: string | null;
  opportunity_id?: string | null;
  assigned_user_id: string;
  created_by: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  due_time?: string | null;
  reminder_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  opportunity?: Opportunity;
  assigned_user?: User;
}

export type ActivityType = 'call' | 'email' | 'whatsapp' | 'meeting' | 'note' | 'stage_change' | 'task_completed' | 'system';

export interface Activity {
  id: string;
  organization_id: string;
  client_id?: string | null;
  opportunity_id?: string | null;
  user_id: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  result?: string | null;
  follow_up_at?: string | null;
  created_at: string;
  user?: User;
  client?: Client;
  opportunity?: Opportunity;
}

export interface Note {
  id: string;
  organization_id: string;
  client_id?: string | null;
  opportunity_id?: string | null;
  created_by: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Tag {
  id: string;
  organization_id: string;
  name: string;
  color: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  metadata?: Record<string, any> | null;
  created_at: string;
  user?: User;
}

export interface AppExecutionContext {
  organizationId: string;
  userId: string;
  role: UserRole;
}
