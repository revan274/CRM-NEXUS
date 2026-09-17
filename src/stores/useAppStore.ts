/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Organization, User, UserRole } from '../types/crm';

export type NavigationTab =
  | 'dashboard'
  | 'clients'
  | 'opportunities'
  | 'pipeline'
  | 'products'
  | 'tasks'
  | 'activities'
  | 'reports'
  | 'audit';

interface AppState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  users: User[];
  currentUser: User | null;
  activeTab: NavigationTab;
  selectedClientId: string | null;
  globalSearchQuery: string;
  isContextModalOpen: boolean;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  isLoading: boolean;

  // Actions
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentOrganization: (org: Organization) => void;
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setSelectedClientId: (id: string | null) => void;
  setGlobalSearchQuery: (q: string) => void;
  setIsContextModalOpen: (open: boolean) => void;
  setNotification: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  switchContext: (orgId: string, userId: string) => Promise<void>;
  fetchContext: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  organizations: [],
  currentOrganization: null,
  users: [],
  currentUser: null,
  activeTab: 'dashboard',
  selectedClientId: null,
  globalSearchQuery: '',
  isContextModalOpen: false,
  notification: null,
  isLoading: false,

  setOrganizations: (organizations) => set({ organizations }),
  setCurrentOrganization: (currentOrganization) => set({ currentOrganization }),
  setUsers: (users) => set({ users }),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedClientId: (selectedClientId) => set({ selectedClientId }),
  setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
  setIsContextModalOpen: (isContextModalOpen) => set({ isContextModalOpen }),
  setNotification: (notification) => {
    set({ notification });
    if (notification) {
      setTimeout(() => {
        if (get().notification?.message === notification.message) {
          set({ notification: null });
        }
      }, 4000);
    }
  },

  switchContext: async (orgId: string, userId: string) => {
    try {
      set({ isLoading: true });
      const org = get().organizations.find((o) => o.id === orgId);
      if (!org) return;

      // Fetch users for this org
      const res = await fetch(`/api/users?organization_id=${orgId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message);

      const users: User[] = json.data;
      const user = users.find((u) => u.id === userId) || users[0];

      // Persist in localStorage for convenience
      localStorage.setItem('nexus_org_id', orgId);
      localStorage.setItem('nexus_user_id', user.id);

      set({
        currentOrganization: org,
        users,
        currentUser: user,
        isContextModalOpen: false,
        isLoading: false,
      });

      get().setNotification({
        type: 'info',
        message: `Contexto cambiado a: ${org.name} (${user.full_name} - ${user.role.toUpperCase()})`,
      });
    } catch (e: any) {
      set({ isLoading: false });
      get().setNotification({ type: 'error', message: e.message || 'Error al cambiar contexto' });
    }
  },

  fetchContext: async () => {
    try {
      set({ isLoading: true });
      const resOrgs = await fetch('/api/organizations');
      const jsonOrgs = await resOrgs.json();
      if (!jsonOrgs.success) throw new Error(jsonOrgs.error?.message);

      const organizations: Organization[] = jsonOrgs.data;
      const savedOrgId = localStorage.getItem('nexus_org_id') || organizations[0]?.id;
      const currentOrg = organizations.find((o) => o.id === savedOrgId) || organizations[0];

      if (!currentOrg) return;

      const resUsers = await fetch(`/api/users?organization_id=${currentOrg.id}`);
      const jsonUsers = await resUsers.json();
      const users: User[] = jsonUsers.data || [];

      const savedUserId = localStorage.getItem('nexus_user_id');
      const currentUser = users.find((u) => u.id === savedUserId) || users[0];

      set({
        organizations,
        currentOrganization: currentOrg,
        users,
        currentUser,
        isLoading: false,
      });
    } catch (e: any) {
      set({ isLoading: false });
      get().setNotification({ type: 'error', message: 'Error cargando organizaciones' });
    }
  },
}));
