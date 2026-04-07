'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType; }
interface ToastCtx { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void; }

const ToastContext = createContext<ToastCtx | null>(null);
let uid = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, type: ToastType) => {
    const id = ++uid;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);

  const ctx: ToastCtx = {
    success: (m) => add(m, 'success'),
    error: (m) => add(m, 'error'),
    info: (m) => add(m, 'info'),
  };

  const styles: Record<ToastType, string> = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-brand/10 border-brand/30 text-brand',
  };
  const icons: Record<ToastType, string> = { success: '✓', error: '✕', info: '●' };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[9999] pointer-events-none items-center">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border font-mono text-xs animate-fade-up backdrop-blur-sm ${styles[t.type]}`}>
            <span className="text-[10px]">{icons[t.type]}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext)!;
