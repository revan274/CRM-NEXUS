/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const GlobalNotification: React.FC = () => {
  const { notification, setNotification } = useAppStore();

  if (!notification) return null;

  const getStyle = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
        };
      case 'error':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          icon: <Info className="w-4 h-4 text-indigo-600 shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200 max-w-md">
      <div className={`flex items-center gap-3 p-3.5 rounded-lg border shadow-lg ${style.bg}`}>
        {style.icon}
        <span className="text-xs font-medium flex-1">{notification.message}</span>
        <button
          onClick={() => setNotification(null)}
          className="text-slate-400 hover:text-slate-600 p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
