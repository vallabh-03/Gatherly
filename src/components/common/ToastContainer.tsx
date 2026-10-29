import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGatherly();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-60 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications & Feedback"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in bg-white ${
              isSuccess 
                ? 'border-emerald-200 text-stone-800' 
                : isError 
                ? 'border-rose-200 text-stone-800' 
                : 'border-violet-200 text-stone-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-violet-600" />}
            </div>

            <div className="flex-1 min-w-0 text-xs">
              <span className="font-bold text-stone-900 block leading-tight">
                {toast.title}
              </span>
              {toast.message && (
                <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
