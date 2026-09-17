/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ContextModal } from './components/layout/ContextModal';
import { GlobalNotification } from './components/common/GlobalNotification';
import { DashboardView } from './features/dashboard/DashboardView';
import { ClientsView } from './features/clients/ClientsView';
import { OpportunitiesView } from './features/opportunities/OpportunitiesView';
import { PipelineKanbanView } from './features/pipeline/PipelineKanbanView';
import { ProductsView } from './features/products/ProductsView';
import { TasksView } from './features/tasks/TasksView';
import { ActivitiesView } from './features/activities/ActivitiesView';
import { ReportsView } from './features/reports/ReportsView';
import { AuditView } from './features/audit/AuditView';

export default function App() {
  const { fetchContext, activeTab, isLoading } = useAppStore();

  useEffect(() => {
    fetchContext();
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'clients':
        return <ClientsView />;
      case 'opportunities':
        return <OpportunitiesView />;
      case 'pipeline':
        return <PipelineKanbanView />;
      case 'products':
        return <ProductsView />;
      case 'tasks':
        return <TasksView />;
      case 'activities':
        return <ActivitiesView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ContextModal />
      <GlobalNotification />
    </div>
  );
}

