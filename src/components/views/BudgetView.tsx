import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Building2, 
  Utensils, 
  Camera, 
  Flower2, 
  Music, 
  Gift, 
  CreditCard,
  Download
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { BudgetItem, BudgetCategory } from '../../types';
import { calculateEventBudget, formatCurrency } from '../../utils/calculations';

interface BudgetViewProps {
  onOpenAddExpense: () => void;
}

const CATEGORY_ICONS: Record<BudgetCategory, React.ComponentType<{ className?: string }>> = {
  venue: Building2,
  catering: Utensils,
  photography: Camera,
  decor: Flower2,
  music: Music,
  attire: CreditCard,
  favors: Gift,
  stationery: DollarSign,
  other: Wallet,
};

export const BudgetView: React.FC<BudgetViewProps> = ({ onOpenAddExpense }) => {
  const { 
    budgets, 
    events, 
    selectedEventId, 
    setSelectedEventId, 
    searchQuery, 
    updateBudgetItem, 
    deleteBudgetItem 
  } = useGatherly();

  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const currentEvent = events.find(e => e.id === selectedEventId);
  const targetBudget = currentEvent 
    ? currentEvent.targetBudget 
    : events.reduce((sum, e) => sum + (e.targetBudget || 0), 0);

  const eventFilteredBudgets = selectedEventId 
    ? budgets.filter(b => b.eventId === selectedEventId) 
    : budgets;

  const filteredBudgets = eventFilteredBudgets.filter(b => {
    const matchesPayment = paymentFilter === 'all' || 
      (paymentFilter === 'paid' && b.paid) ||
      (paymentFilter === 'unpaid' && !b.paid);
    const matchesSearch = !searchQuery.trim() ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.vendor && b.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPayment && matchesSearch;
  });

  const stats = calculateEventBudget(eventFilteredBudgets, targetBudget);

  // Category breakdown calculation
  const categoryTotals: Record<string, { estimated: number; actual: number }> = {};
  eventFilteredBudgets.forEach(b => {
    if (!categoryTotals[b.category]) {
      categoryTotals[b.category] = { estimated: 0, actual: 0 };
    }
    categoryTotals[b.category].estimated += Number(b.estimatedCost) || 0;
    categoryTotals[b.category].actual += Number(b.actualCost) || 0;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>{currentEvent ? currentEvent.title : 'All Celebrations'}</span>
            <span aria-hidden="true">·</span>
            <span>Financial Planning & Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tracking-tight">
            Celebration Budget Planner
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage vendor deposits, estimated balances, and final settlements with full transparency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 bg-black hover:bg-stone-800 text-white text-xs font-semibold py-2 px-4 rounded-full transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-stone-300" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Over-Budget Warning Banner if applicable */}
      {stats.isOverBudget && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 animate-in fade-in duration-150">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Over Target Budget Alert:</span> Current total contracted actuals exceed the planned celebration limit by{' '}
            <span className="font-bold tabular-nums">{formatCurrency(stats.overAmount)}</span>.
            Review vendor contracts or reallocate from decor and favors.
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 block">Planned Target Budget</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-editorial text-stone-900 tabular-nums">
              {formatCurrency(targetBudget)}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">Allocated limit</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 block">Total Contracted Spend</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-editorial tabular-nums ${stats.isOverBudget ? 'text-rose-600' : 'text-stone-900'}`}>
              {formatCurrency(stats.totalActual)}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block tabular-nums">
            {stats.percentSpent}% of target budget
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Paid & Settled</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-editorial text-emerald-800 tabular-nums">
              {formatCurrency(stats.totalPaid)}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block tabular-nums">
            {stats.paidCount} of {stats.totalItems} items settled
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 block">Remaining Allowance</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-editorial text-stone-900 tabular-nums">
              {formatCurrency(stats.remainingBudget)}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">Uncommitted funds</span>
        </div>
      </div>

      {/* Category Allocation Progress Bar Cards */}
      <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Category Distribution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(categoryTotals).map(([catKey, val]) => {
            const Icon = CATEGORY_ICONS[catKey as BudgetCategory] || Wallet;
            const pctOfTotal = stats.totalActual > 0 ? Math.round((val.actual / stats.totalActual) * 100) : 0;

            return (
              <div key={catKey} className="p-3 bg-stone-50/70 border border-stone-200/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-stone-200/70 flex items-center justify-center text-stone-700">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-stone-800 capitalize">{catKey}</span>
                  </div>
                  <span className="text-xs font-bold text-stone-900 tabular-nums">
                    {formatCurrency(val.actual)}
                  </span>
                </div>

                <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-violet-600 h-full rounded-full" style={{ width: `${pctOfTotal}%` }} />
                </div>

                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>Est: {formatCurrency(val.estimated)}</span>
                  <span className="tabular-nums font-medium text-stone-600">{pctOfTotal}% of total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Event Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/60 self-start">
          {[
            { id: 'all', label: `All Line Items (${eventFilteredBudgets.length})` },
            { id: 'paid', label: `Paid in Full (${eventFilteredBudgets.filter(b => b.paid).length})` },
            { id: 'unpaid', label: `Pending Payment (${eventFilteredBudgets.filter(b => !b.paid).length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setPaymentFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                paymentFilter === tab.id
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-500 flex items-center gap-2">
          <span>Celebration:</span>
          <select
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(e.target.value || null)}
            className="px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 text-xs focus:outline-hidden"
          >
            <option value="">All Celebrations</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredBudgets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300 space-y-3">
          <Wallet className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No budget expenses match the filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Log vendor contracts, caterer deposits, and floral styling expenses.
          </p>
          <button
            onClick={onOpenAddExpense}
            className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
          >
            Add Expense
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3 font-semibold">Expense Item</th>
                  <th className="px-4 py-3 font-semibold">Celebration</th>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold text-right">Estimated</th>
                  <th className="px-4 py-3 font-semibold text-right">Actual Cost</th>
                  <th className="px-4 py-3 font-semibold text-center">Settled</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBudgets.map((item) => {
                  const ev = events.find(e => e.id === item.eventId);

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Category */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-stone-900">{item.name}</div>
                        <span className="text-[10px] text-stone-400 capitalize font-medium">
                          {item.category}
                        </span>
                      </td>

                      {/* Event */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-stone-800 truncate block max-w-[140px]">
                          {ev ? ev.title : 'Celebration'}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="px-4 py-3.5">
                        <span className="text-stone-700">{item.vendor || '—'}</span>
                        {item.dueDate && (
                          <span className="block text-[10px] text-stone-400">Due {item.dueDate}</span>
                        )}
                      </td>

                      {/* Estimated */}
                      <td className="px-4 py-3.5 text-right font-medium text-stone-500 tabular-nums">
                        {formatCurrency(item.estimatedCost)}
                      </td>

                      {/* Actual */}
                      <td className="px-4 py-3.5 text-right font-bold text-stone-900 tabular-nums">
                        {formatCurrency(item.actualCost)}
                      </td>

                      {/* Paid Toggle Button */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => updateBudgetItem(item.id, { paid: !item.paid })}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                            item.paid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {item.paid ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => deleteBudgetItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
                          title="Delete expense entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
