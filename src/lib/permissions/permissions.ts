/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole, Client, Opportunity } from '../../types/crm';

export interface UserContext {
  userId: string;
  role: UserRole;
  organizationId: string;
}

/**
 * Checks if the user can view the client.
 * - Admin, Manager, Customer Service: Can view all clients in the organization.
 * - Salesperson: Can view if assigned, or if organization allows broad visibility.
 */
export function canViewClient(user: UserContext, client?: Client | { assigned_user_id?: string | null }): boolean {
  if (user.role === 'admin' || user.role === 'manager' || user.role === 'customer_service') {
    return true;
  }
  if (user.role === 'salesperson') {
    if (!client) return true;
    return !client.assigned_user_id || client.assigned_user_id === user.userId;
  }
  return false;
}

/**
 * Checks if the user can create a client.
 * Admin, Manager, Salesperson can create. Customer Service can create prospect/contact.
 */
export function canCreateClient(user: UserContext): boolean {
  return ['admin', 'manager', 'salesperson', 'customer_service'].includes(user.role);
}

/**
 * Checks if the user can edit a client.
 * - Admin, Manager: Yes.
 * - Salesperson: Yes, if assigned.
 * - Customer Service: Limited (notes/contact updates).
 */
export function canEditClient(user: UserContext, client?: Client | { assigned_user_id?: string | null }): boolean {
  if (user.role === 'admin' || user.role === 'manager') {
    return true;
  }
  if (user.role === 'salesperson') {
    if (!client) return true;
    return !client.assigned_user_id || client.assigned_user_id === user.userId;
  }
  if (user.role === 'customer_service') {
    return true; // Can update client details and add interactions
  }
  return false;
}

/**
 * Checks if the user can delete or archive a client.
 * Only Admins can archive/delete.
 */
export function canDeleteClient(user: UserContext): boolean {
  return user.role === 'admin';
}

/**
 * Checks if the user can view an opportunity.
 * - Admin, Manager: Can view all.
 * - Salesperson: Can view their assigned opportunities.
 * - Customer Service: Typically no access to commercial pipeline.
 */
export function canViewOpportunity(user: UserContext, opp?: Opportunity | { assigned_user_id?: string }): boolean {
  if (user.role === 'admin' || user.role === 'manager') {
    return true;
  }
  if (user.role === 'salesperson') {
    if (!opp) return true;
    return opp.assigned_user_id === user.userId;
  }
  return false;
}

/**
 * Checks if the user can create or edit an opportunity.
 * Admin, Manager, and Salesperson (for self).
 */
export function canEditOpportunity(user: UserContext, opp?: Opportunity | { assigned_user_id?: string }): boolean {
  if (user.role === 'admin' || user.role === 'manager') {
    return true;
  }
  if (user.role === 'salesperson') {
    if (!opp) return true;
    return opp.assigned_user_id === user.userId;
  }
  return false;
}

/**
 * Checks if the user can manage users and roles.
 * Strictly Admins.
 */
export function canManageUsers(user: UserContext): boolean {
  return user.role === 'admin';
}

/**
 * Checks if the user can view executive reports.
 * Admins and Managers view full reports. Salesperson views personal metrics.
 */
export function canViewReports(user: UserContext): boolean {
  return ['admin', 'manager', 'salesperson'].includes(user.role);
}

/**
 * Checks if the user can export CRM data to CSV/Excel.
 * Admins and Managers only.
 */
export function canExportData(user: UserContext): boolean {
  return user.role === 'admin' || user.role === 'manager';
}

/**
 * Checks if the user can manage product catalog.
 * Only Admins.
 */
export function canManageProducts(user: UserContext): boolean {
  return user.role === 'admin';
}

/**
 * Checks if the user can configure pipelines and stages.
 * Only Admins.
 */
export function canManagePipeline(user: UserContext): boolean {
  return user.role === 'admin';
}
