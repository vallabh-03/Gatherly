import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  CheckSquare, 
  Plus, 
  Printer, 
  Trash2, 
  Edit3,
  Copy,
  CheckCircle2,
  AlertCircle,
  History,
  Layers
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { CelebrationEvent, ScheduleItem } from '../../types';
import { 
  calculateEventBudget, 
  calculateGuestStats, 
  calculateTaskProgress, 
  formatCurrency, 
  formatEventDate, 
  getDaysUntil,
  isPastDate 
} from '../../utils/calculations';

interface EventDetailModalProps {
  event: CelebrationEvent | null;
  onClose: () => void;
  onOpenAddGuest: (eventId: string) => void;
  onOpenAddExpense: (eventId: string) => void;
  onOpenAddTask: (eventId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onOpenAddGuest,
  onOpenAddExpense,
  onOpenAddTask,
}) => {
  const { 
    guests, 
    budgets, 
    tasks, 
    updateEvent, 
    setDeleteConfirmEvent,
    setEditingEvent,
    duplicateEvent,
    toggleTaskStatus, 
    deleteGuest, 
    deleteBudgetItem 
  } = useGatherly();

  const [activeTab, setActiveTab] = useState<'schedule' | 'guests' | 'budget' | 'tasks' | 'print'>('schedule');
  const [newScheduleTime, setNewScheduleTime] = useState('');
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleLocation, setNewScheduleLocation] = useState('');

  if (!event) return null;

  const eventGuests = guests.filter(g => g.eventId === event.id);
  const eventBudgets = budgets.filter(b => b.eventId === event.id);
  const eventTasks = tasks.filter(t => t.eventId === event.id);

  const budgetStats = calculateEventBudget(eventBudgets, event.targetBudget);
  const guestStats = calculateGuestStats(eventGuests);
  const taskStats = calculateTaskProgress(eventTasks);
  const daysUntil = getDaysUntil(event.eventDate);
  const isPast = isPastDate(event.eventDate);

  const handleAddScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTime.trim() || !newScheduleTitle.trim()) return;

    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      time: newScheduleTime.trim(),
      title: newScheduleTitle.trim(),
      location: newScheduleLocation.trim() || event.venueName,
    };

    const updated = [...(event.schedule || []), newItem].sort((a, b) => a.time.localeCompare(b.time));
    updateEvent(event.id, { schedule: updated });
    setNewScheduleTime('');
    setNewScheduleTitle('');
    setNewScheduleLocation('');
  };

  const handleRemoveScheduleItem = (schId: string) => {
    const updated = (event.schedule || []).filter(s => s.id !== schId);
    updateEvent(event.id, { schedule: updated });
  };

  const handleTriggerEdit = () => {
    setEditingEvent(event);
    onClose();
  };

  const handleTriggerDuplicate = () => {
    duplicateEvent(event.id);
    onClose();
  };

  const handleTriggerDelete = () => {
    setDeleteConfirmEvent(event);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Banner with Theme Accent */}
        <div 
          className="h-2.5 w-full shrink-0" 
          style={{ backgroundColor: event.themeColor || '#7C3AED' }} 
        />

        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200/80 bg-[#FAF7F2]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span className="capitalize font-medium text-stone-700">{event.category.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-stone-900">{formatEventDate(event.eventDate)}</span>
              <span aria-hidden="true">·</span>
              {isPast ? (
                <span className="font-semibold text-stone-500 flex items-center gap-1">
                  <History className="w-3.5 h-3.5" />
                  Past Celebration
                </span>
              ) : (
                <span className="tabular-nums font-semibold text-violet-700">
                  {daysUntil > 0 ? `${daysUntil} days away` : 'Today!'}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-editorial text-stone-900 tracking-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-500 mt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {event.venueName} — {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
              </span>
            </div>
          </div>

          {/* Quick Action Affordances */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleTriggerEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
              title="Edit Celebration Details"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleTriggerDuplicate}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
              title="Duplicate Celebration"
            >
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
              title="Print Run of Show Summary"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Print</span>
            </button>
            <button
              onClick={handleTriggerDelete}
              className="p-2 border border-stone-300 bg-white hover:bg-rose-50 hover:border-rose-200 text-stone-400 hover:text-rose-600 rounded-xl transition-colors shadow-2xs"
              title="Delete Celebration"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-stone-200 bg-white px-6 py-3 text-xs gap-3">
          <div>
            <span className="text-stone-400 block text-[11px] font-medium">Confirmed RSVPs</span>
            <span className="font-bold text-stone-900 text-sm tabular-nums">
              {guestStats.attendingHeadcount} <span className="text-xs font-normal text-stone-400">/ {event.expectedGuestCount} target</span>
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px] font-medium">Actual Spend</span>
            <span className="font-bold text-stone-900 text-sm tabular-nums">
              {formatCurrency(budgetStats.totalActual)}
            </span>
            <span className="text-[10px] text-stone-500 block">
              Budget: {formatCurrency(event.targetBudget)}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px] font-medium">Task Completion</span>
            <span className="font-bold text-stone-900 text-sm tabular-nums">
              {taskStats.completionRate}%
            </span>
            <span className="text-[10px] text-stone-500 block">
              {taskStats.completed} of {taskStats.total} done
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px] font-medium">Run-of-Show</span>
            <span className="font-bold text-stone-900 text-sm tabular-nums">
              {event.schedule?.length || 0} milestones
            </span>
          </div>
        </div>

        {/* Tab Controls (Segmented clean control) */}
        <div className="px-6 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between overflow-x-auto">
          <div className="flex gap-1 py-2">
            {[
              { id: 'schedule', label: `Run of Show (${event.schedule?.length || 0})` },
              { id: 'guests', label: `Guest List (${eventGuests.length})` },
              { id: 'budget', label: `Budget Ledger (${eventBudgets.length})` },
              { id: 'tasks', label: `Checklist (${eventTasks.length})` },
              { id: 'print', label: 'Vendor Summary' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="flex-1 overflow-y-auto p-6 bg-white text-xs">
          {/* TAB 1: SCHEDULE / RUN OF SHOW */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {event.description && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/70 text-stone-700 leading-relaxed text-xs">
                  <span className="font-bold text-stone-900 block mb-0.5">Celebration Atmosphere:</span>
                  {event.description}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Day-of Run of Show</h3>
                  <p className="text-xs text-stone-500">Sequential milestone timeline for catering, photography, and hosts.</p>
                </div>
              </div>

              {/* Schedule list */}
              <div className="relative border-l-2 border-stone-200 ml-3 space-y-4 pl-4 py-1">
                {(event.schedule || []).map((item) => (
                  <div key={item.id} className="relative group flex items-start justify-between gap-3">
                    <span 
                      className="absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white bg-violet-600 shadow-xs" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900 tabular-nums">
                          {item.time}
                        </span>
                        <span className="font-semibold text-stone-800">{item.title}</span>
                      </div>
                      {item.location && (
                        <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {item.location}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveScheduleItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 p-1 transition-opacity"
                      title="Remove timeline item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add schedule item inline form */}
              <form onSubmit={handleAddScheduleItem} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="font-semibold text-stone-800 block text-[11px]">Add Milestone to Schedule</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="time"
                    required
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    className="px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-800"
                  />
                  <input
                    type="text"
                    required
                    value={newScheduleTitle}
                    onChange={(e) => setNewScheduleTitle(e.target.value)}
                    placeholder="Milestone title (e.g. First Dance)"
                    className="sm:col-span-2 px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-800"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-xs transition-colors"
                  >
                    Add Milestone
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: GUESTS */}
          {activeTab === 'guests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Event Guest List</h3>
                  <p className="text-xs text-stone-500">
                    {guestStats.attendingHeadcount} attending · {guestStats.pendingHeadcount} awaiting response · {guestStats.declinedHeadcount} declined
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddGuest(event.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Invite Guest</span>
                </button>
              </div>

              {eventGuests.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 rounded-xl">
                  <p className="text-stone-500">No guests invited yet for this celebration.</p>
                  <button
                    onClick={() => onOpenAddGuest(event.id)}
                    className="mt-2 text-violet-700 font-semibold underline text-xs"
                  >
                    Add first guest
                  </button>
                </div>
              ) : (
                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                  {eventGuests.map((g) => (
                    <div key={g.id} className="p-3 flex items-center justify-between hover:bg-stone-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">{g.fullName}</span>
                          {g.plusOneCount > 0 && (
                            <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                              +{g.plusOneCount} companion
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                          <span>{g.email}</span>
                          {g.dietaryRestrictions && g.dietaryRestrictions !== 'None' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-700">Diet: {g.dietaryRestrictions}</span>
                            </>
                          )}
                          {g.tableAssignment && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-stone-700">{g.tableAssignment}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          g.rsvpStatus === 'attending' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : g.rsvpStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {g.rsvpStatus}
                        </span>
                        <button
                          onClick={() => deleteGuest(g.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove guest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BUDGET */}
          {activeTab === 'budget' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Celebration Budget Ledger</h3>
                  <p className="text-xs text-stone-500">
                    Total: {formatCurrency(budgetStats.totalActual)} / Planned: {formatCurrency(event.targetBudget)}
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddExpense(event.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Expense</span>
                </button>
              </div>

              {eventBudgets.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 rounded-xl">
                  <p className="text-stone-500">No budget line items recorded yet.</p>
                  <button
                    onClick={() => onOpenAddExpense(event.id)}
                    className="mt-2 text-violet-700 font-semibold underline text-xs"
                  >
                    Add first expense
                  </button>
                </div>
              ) : (
                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                  {eventBudgets.map((b) => (
                    <div key={b.id} className="p-3 flex items-center justify-between hover:bg-stone-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">{b.name}</span>
                          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                            {b.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {b.vendor && <span>Vendor: {b.vendor} · </span>}
                          <span>Estimated: {formatCurrency(b.estimatedCost)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-stone-900 text-xs tabular-nums block">
                            {formatCurrency(b.actualCost)}
                          </span>
                          <span className={`text-[10px] font-semibold ${b.paid ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {b.paid ? 'Paid in Full' : 'Pending Payment'}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteBudgetItem(b.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          title="Remove expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Event Checklist</h3>
                  <p className="text-xs text-stone-500">
                    {taskStats.completed} completed · {taskStats.inProgress} in progress · {taskStats.todo} to do
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddTask(event.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {eventTasks.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 rounded-xl">
                  <p className="text-stone-500">No tasks logged for this event yet.</p>
                  <button
                    onClick={() => onOpenAddTask(event.id)}
                    className="mt-2 text-violet-700 font-semibold underline text-xs"
                  >
                    Add first checklist item
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {eventTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => toggleTaskStatus(t.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                        t.status === 'completed' 
                          ? 'bg-stone-50 border-stone-200/80 text-stone-400' 
                          : 'bg-white border-stone-200 hover:border-violet-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          t.status === 'completed' ? 'bg-violet-600 border-violet-600 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {t.status === 'completed' && <CheckSquare className="w-3 h-3" />}
                        </div>
                        <div>
                          <span className={`font-medium ${t.status === 'completed' ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                            {t.title}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                            <span>Due: {t.dueDate}</span>
                            {t.assigneeName && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>Assignee: {t.assigneeName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm ${
                        t.priority === 'high' ? 'bg-rose-100 text-rose-700' : t.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PRINT SUMMARY */}
          {activeTab === 'print' && (
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-6">
              <div className="border-b border-stone-200 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">Official Run Sheet</span>
                  <h2 className="text-xl font-bold font-editorial text-stone-900">{event.title}</h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {formatEventDate(event.eventDate)} · {event.venueName} ({event.location})
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Chronological Schedule</h4>
                <div className="divide-y divide-stone-200 border border-stone-200 bg-white rounded-xl">
                  {(event.schedule || []).map((s) => (
                    <div key={s.id} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-stone-900 text-xs tabular-nums">{s.time}</span>
                        <span className="font-medium text-stone-800">{s.title}</span>
                      </div>
                      <span className="text-stone-500 text-[11px]">{s.location}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Vendor & Budget Directory</h4>
                  <div className="divide-y divide-stone-200 border border-stone-200 bg-white rounded-xl p-2 space-y-1">
                    {eventBudgets.map(b => (
                      <div key={b.id} className="py-1 flex justify-between text-[11px]">
                        <span className="font-medium text-stone-800">{b.name} ({b.vendor || 'Direct'})</span>
                        <span className="font-bold tabular-nums text-stone-900">{formatCurrency(b.actualCost)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Special Dietary Requirements</h4>
                  <div className="divide-y divide-stone-200 border border-stone-200 bg-white rounded-xl p-2 space-y-1">
                    {eventGuests.filter(g => g.dietaryRestrictions && g.dietaryRestrictions !== 'None').map(g => (
                      <div key={g.id} className="py-1 flex justify-between text-[11px]">
                        <span className="font-medium text-stone-800">{g.fullName}</span>
                        <span className="text-amber-700">{g.dietaryRestrictions}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
