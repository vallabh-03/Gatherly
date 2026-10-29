import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteConfirmEvent, setDeleteConfirmEvent, deleteEvent } = useGatherly();

  if (!deleteConfirmEvent) return null;

  const handleConfirm = () => {
    deleteEvent(deleteConfirmEvent.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" 
        onClick={() => setDeleteConfirmEvent(null)}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-10 p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <h3 className="text-base font-bold text-stone-900 font-editorial">
              Delete Celebration?
            </h3>
            <p className="text-stone-600 mt-1 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-stone-900">"{deleteConfirmEvent.title}"</strong>?
            </p>
            <p className="text-[11px] text-stone-500 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
              This action will remove all linked guest RSVPs, budget line items, checklists, and run-of-show milestones.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setDeleteConfirmEvent(null)}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Yes, Delete Celebration
          </button>
        </div>
      </div>
    </div>
  );
};
