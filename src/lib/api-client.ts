/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAppStore } from '../stores/useAppStore';

/**
 * Custom fetch wrapper that injects multi-tenant context headers
 * into every request to the backend.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { message: string } }> {
  const { currentOrganization, currentUser } = useAppStore.getState();

  const headers = new Headers(options.headers || {});
  if (currentOrganization) {
    headers.set('x-organization-id', currentOrganization.id);
  }
  if (currentUser) {
    headers.set('x-user-id', currentUser.id);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const json = await res.json();
    return json;
  } catch (error: any) {
    return {
      success: false,
      error: { message: error.message || 'Error de conexión con el servidor' },
    };
  }
}
