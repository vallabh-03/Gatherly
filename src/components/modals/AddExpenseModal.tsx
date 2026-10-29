import React, { useState } from 'react';
import { X, Wallet, DollarSign, Store, Tag, CheckCircle2 } from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { BudgetCategory } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventId?: string | null;
}

const CATEGORIES: { label: string; value: BudgetCategory }[] = [
  { label: 'Venue & Location', value: 'venue' },
  { label: 'Catering & Bar', value: 'catering' },
  { label: 'Photography & Video', value: 'photography' },
  { label: 'Floral & Decor', value: 'decor' },
  { label: 'Music & Entertainment', value: 'music' },
  { label: 'Attire & Beauty', value: 'attire' },
  { label: 'Favors & Gifts', value: 'favors' },
  { label: 'Stationery & Invites', value: 'stationery' },
  { label: 'Other Expenses', value: 'other' },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, defaultEventId }) => {
  const { events, selectedEventId, addBudgetItem } = useGatherly();

  const initialEventId = defaultEventId || selectedEventId || (events[0]?.id || '');
  const [eventId, setEventId] = useState(initialEventId);
  const [category, setCategory] = useState<BudgetCategory>('catering');
  const [name, setName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('1500');
  const [actualCost, setActualCost] = useState('1500');
  const [paid, setPaid] = useState(false);
  const [vendor, setVendor] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !eventId) return;

    addBudgetItem({
      eventId,
      category,
      name: name.trim(),
      estimatedCost: Number(estimatedCost) || 0,
      actualCost: Number(actualCost) || 0,
      paid,
      vendor: vendor.trim() || undefined,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
    setName('');
    setVendor('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-editorial">Record Budget Item</h2>
              <p className="text-xs text-stone-500">Track estimated and actual vendor costs.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50" aria-label="Close dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Celebration</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-stone-800"
              required
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BudgetCategory)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-stone-800"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Expense Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wedding Cake, Acoustic Duo..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Estimated Cost ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-800 tabular-nums focus:outline-hidden focus:border-violet-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Actual Contract Cost ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-800 tabular-nums focus:outline-hidden focus:border-violet-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Vendor / Provider</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Magnolia Bakery, Studio Eight"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-800 focus:outline-hidden focus:border-violet-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Payment Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-800 focus:outline-hidden focus:border-violet-600"
              />
            </div>
          </div>

          {/* Paid Checkbox */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-800 block">Payment Settled</span>
              <span className="text-[11px] text-stone-500">Mark as fully paid to your vendor</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold shadow-xs"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
