import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  AlertCircle, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { calculateTaskProgress } from '../../utils/calculations';

interface TasksViewProps {
  onOpenAddTask: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenAddTask }) => {
  const { 
    tasks, 
    events, 
    selectedEventId, 
    setSelectedEventId, 
    searchQuery, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus 
  } = useGatherly();

  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [quickTitle, setQuickTitle] = useState('');

  const currentEvent = events.find(e => e.id === selectedEventId);
  const eventFilteredTasks = selectedEventId 
    ? tasks.filter(t => t.eventId === selectedEventId) 
    : tasks;

  const filteredTasks = eventFilteredTasks.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesSearch = !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assigneeName && t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const progress = calculateTaskProgress(eventFilteredTasks);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const targetEvtId = selectedEventId || events[0]?.id;
    if (!targetEvtId) return;

    addTask({
      eventId: targetEvtId,
      title: quickTitle.trim(),
      category: 'logistics',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assigneeName: 'Host Team',
    });

    setQuickTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>{currentEvent ? currentEvent.title : 'All Celebrations'}</span>
            <span aria-hidden="true">·</span>
            <span>Checklist & Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tracking-tight">
            Celebration Tasks & Checklist
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Coordinate day-of timelines, vendor meetings, tastings, and seating arrangements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 bg-black hover:bg-stone-800 text-white text-xs font-semibold py-2 px-4 rounded-full transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-stone-300" />
            <span>Add Checklist Item</span>
          </button>
        </div>
      </div>

      {/* Progress Metric Card */}
      <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Milestone Readiness
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-editorial text-stone-900 tabular-nums">
              {progress.completionRate}%
            </span>
            <span className="text-xs text-stone-500">
              ({progress.completed} of {progress.total} tasks resolved)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-72 space-y-1.5">
          <div className="flex justify-between text-[11px] text-stone-500">
            <span>{progress.todo} to do</span>
            <span>{progress.inProgress} in progress</span>
            <span>{progress.completed} done</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden flex">
            <div 
              className="bg-emerald-600 h-full transition-all" 
              style={{ width: `${progress.completionRate}%` }} 
            />
            <div 
              className="bg-amber-500 h-full transition-all" 
              style={{ width: `${progress.total > 0 ? (progress.inProgress / progress.total) * 100 : 0}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Quick add: e.g. Book acoustic guitarist for terrace cocktail hour..."
          className="flex-1 bg-white border border-stone-300 focus:border-violet-600 focus:outline-hidden px-4 py-2.5 rounded-xl text-xs text-stone-800 placeholder-stone-400 shadow-2xs"
        />
        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-violet-300" />
          <span>Quick Add</span>
        </button>
      </form>

      {/* Filter Tabs & Celebration Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/60 self-start overflow-x-auto">
          {[
            { id: 'all', label: `All (${eventFilteredTasks.length})` },
            { id: 'todo', label: `To Do (${eventFilteredTasks.filter(t => t.status === 'todo').length})` },
            { id: 'in_progress', label: `In Progress (${eventFilteredTasks.filter(t => t.status === 'in_progress').length})` },
            { id: 'completed', label: `Completed (${eventFilteredTasks.filter(t => t.status === 'completed').length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === tab.id
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

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300 space-y-3">
          <CheckSquare className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No tasks in this view</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Add checklist tasks for vendors, invitations, styling, and run-of-show.
          </p>
          <button
            onClick={onOpenAddTask}
            className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
          >
            Add Checklist Item
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((t) => {
            const ev = events.find(e => e.id === t.eventId);
            const isDone = t.status === 'completed';

            return (
              <div
                key={t.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-3 ${
                  isDone 
                    ? 'bg-stone-50/70 border-stone-200/70 text-stone-400' 
                    : 'bg-white border-stone-200 hover:border-violet-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Interactive toggle */}
                  <button
                    onClick={() => toggleTaskStatus(t.id)}
                    className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                      isDone 
                        ? 'bg-violet-600 border-violet-600 text-white' 
                        : 'border-stone-300 hover:border-violet-600 bg-white'
                    }`}
                    aria-label={`Toggle status for ${t.title}`}
                  >
                    {isDone && <CheckSquare className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span className={`text-xs sm:text-sm font-semibold block leading-tight ${
                      isDone ? 'line-through text-stone-400' : 'text-stone-900'
                    }`}>
                      {t.title}
                    </span>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-stone-500 mt-1">
                      <span className="capitalize font-medium text-stone-600">{t.category.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ev ? ev.title : 'Celebration'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>Due {t.dueDate}</span>
                      </span>
                      {t.assigneeName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-stone-700">Lead: {t.assigneeName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right badges & delete */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status select */}
                  <select
                    value={t.status}
                    onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border focus:outline-hidden ${
                      t.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : t.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                    t.priority === 'high' ? 'bg-rose-100 text-rose-700' : t.priority === 'medium' ? 'bg-stone-100 text-stone-600' : 'bg-stone-50 text-stone-400'
                  }`}>
                    {t.priority}
                  </span>

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
