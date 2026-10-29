import React from 'react';
import { 
  CalendarDays, 
  Wallet, 
  CheckSquare, 
  Users, 
  Plus, 
  Sparkles, 
  Clock, 
  MapPin, 
  ChevronRight,
  AlertCircle,
  Check,
  Calendar as CalendarIcon,
  Bell,
  ArrowUpRight
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { 
  getOverallMetrics, 
  calculateEventBudget, 
  calculateGuestStats, 
  calculateTaskProgress, 
  formatCurrency, 
  formatEventDate, 
  getDaysUntil 
} from '../../utils/calculations';
import { CelebrationEvent } from '../../types';

interface DashboardViewProps {
  onOpenEventDetail: (event: CelebrationEvent) => void;
  onOpenAddGuest: () => void;
  onOpenAddExpense: () => void;
  onOpenAddTask: () => void;
}

const PASTEL_THEMES = [
  { bg: 'bg-[#EAE4F5]', border: 'border-[#DDD6FE]/80', accent: '#7C3AED', name: 'Lavender' },
  { bg: 'bg-[#FDE8D7]', border: 'border-[#FED7AA]/80', accent: '#EA580C', name: 'Peach' },
  { bg: 'bg-[#E1EDFA]', border: 'border-[#BAE6FD]/80', accent: '#0284C7', name: 'Powder Blue' },
  { bg: 'bg-[#FEF7D6]', border: 'border-[#FDE68A]/80', accent: '#CA8A04', name: 'Pale Yellow' },
  { bg: 'bg-[#E3F4EB]', border: 'border-[#BBF7D0]/80', accent: '#16A34A', name: 'Soft Mint' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenEventDetail,
  onOpenAddTask,
}) => {
  const { 
    events, 
    guests, 
    budgets, 
    tasks, 
    setIsCreateEventModalOpen, 
    setActiveView, 
    setSelectedEventId, 
    resetToDemoData,
    toggleTaskStatus 
  } = useGatherly();

  const metrics = getOverallMetrics(events, guests, budgets, tasks);

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const topThreeCelebrations = sortedEvents.slice(0, 3);

  // Collect schedule milestones
  const upcomingSchedule = sortedEvents.slice(0, 4).flatMap(e => 
    (e.schedule || []).map(s => ({
      ...s,
      eventId: e.id,
      eventTitle: e.title,
      eventDate: e.eventDate,
      themeColor: e.themeColor,
      daysUntil: getDaysUntil(e.eventDate),
    }))
  ).slice(0, 4);

  // Top pending tasks for Today's Tasks panel
  const todayTasks = tasks
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 5);

  // Category badge helper
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'wedding':
        return { label: 'Wedding', bg: 'bg-[#EAE4F5] text-stone-900 border-[#DDD6FE]/80' };
      case 'birthday':
        return { label: 'Birthday', bg: 'bg-[#FDE8D7] text-stone-900 border-[#FED7AA]/80' };
      case 'anniversary':
        return { label: 'Anniversary', bg: 'bg-[#E1EDFA] text-stone-900 border-[#BAE6FD]/80' };
      case 'college_fest':
        return { label: 'College Fest', bg: 'bg-[#FEF7D6] text-stone-900 border-[#FDE68A]/80' };
      case 'family_gathering':
        return { label: 'Family Gathering', bg: 'bg-[#E3F4EB] text-stone-900 border-[#BBF7D0]/80' };
      case 'baby_shower':
        return { label: 'Baby Shower', bg: 'bg-[#FCE7F3] text-stone-900 border-[#FBCFE8]/80' };
      default:
        return { label: category.replace('_', ' '), bg: 'bg-stone-200/80 text-stone-800 border-stone-300' };
    }
  };

  // SVG Donut Chart Calculations for Celebration Overview
  const categoryCounts: Record<string, number> = {};
  events.forEach(e => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  const categoryEntries = Object.entries(categoryCounts);
  const totalEvents = events.length;

  const donutColors = ['#C4B5FD', '#FDBA74', '#93C5FD', '#FDE047', '#86EFAC', '#FBCFE8'];
  const circumference = 2 * Math.PI * 40; // r=40
  let cumulativeOffset = 0;

  // Alerts calculation
  const alerts: Array<{
    id: string;
    type: 'warning' | 'info' | 'urgent';
    title: string;
    description: string;
    actionView?: 'events' | 'tasks' | 'budget' | 'guests';
    eventId?: string;
  }> = [];

  // 1. Approaching event alert
  const nearestEvent = sortedEvents.find(e => getDaysUntil(e.eventDate) >= 0);
  if (nearestEvent) {
    const days = getDaysUntil(nearestEvent.eventDate);
    alerts.push({
      id: 'alert-date',
      type: days <= 14 ? 'urgent' : 'info',
      title: `${nearestEvent.title}`,
      description: days === 0 ? 'Happening today!' : `Celebration is only ${days} days away. Confirm venue arrival timeline.`,
      actionView: 'events',
      eventId: nearestEvent.id,
    });
  }

  // 2. High priority pending tasks alert
  const highPriorityPending = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
  if (highPriorityPending.length > 0) {
    alerts.push({
      id: 'alert-tasks',
      type: 'warning',
      title: `${highPriorityPending.length} Urgent Checklist Action${highPriorityPending.length > 1 ? 's' : ''}`,
      description: `Pending review: ${highPriorityPending[0].title}`,
      actionView: 'tasks',
    });
  }

  // 3. Pending guest RSVPs
  if (metrics.totalGuestsPending > 0) {
    alerts.push({
      id: 'alert-rsvps',
      type: 'info',
      title: `${metrics.totalGuestsPending} Awaiting RSVP Responses`,
      description: 'Follow up with unconfirmed guests before catering cutoff.',
      actionView: 'guests',
    });
  }

  // 4. Budget check
  const overBudgetEvents = events.filter(e => {
    const eventBudgets = budgets.filter(b => b.eventId === e.id);
    const bStats = calculateEventBudget(eventBudgets, e.targetBudget);
    return bStats.isOverBudget;
  });

  if (overBudgetEvents.length > 0) {
    alerts.push({
      id: 'alert-budget',
      type: 'urgent',
      title: 'Budget Allocation Alert',
      description: `${overBudgetEvents[0].title} has exceeded allocated spending.`,
      actionView: 'budget',
    });
  } else {
    alerts.push({
      id: 'alert-budget-safe',
      type: 'info',
      title: 'Budget Status Healthy',
      description: `${formatCurrency(metrics.totalActualSpend)} spent across all celebrations within planned ₹ limits.`,
      actionView: 'budget',
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Celebration Command Center</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500 font-normal">Every celebration, beautifully organized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tracking-tight">
            Celebration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5 max-w-2xl">
            Overview of upcoming milestones, today's checklist, running schedules, and celebration budgets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateEventModalOpen(true)}
            className="rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold py-2.5 px-5 shadow-xs transition-transform active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-stone-300" />
            <span>Create Celebration</span>
          </button>
        </div>
      </div>

      {/* Honest Demo Mode Banner */}
      <div className="bg-[#FAF7EE] border border-stone-200/80 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 text-stone-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-semibold">Interactive Local Mode:</span>
          <span className="text-stone-600">
            Real data persisted in your browser. All figures formatted in Indian Rupee (INR ₹).
          </span>
        </div>
        <button
          onClick={resetToDemoData}
          className="text-stone-800 hover:text-black font-semibold underline text-left sm:text-right shrink-0"
        >
          Reset Demo Data
        </button>
      </div>

      {events.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-[#FCFAF4] rounded-3xl border border-dashed border-stone-300 shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-200/80 text-stone-700 flex items-center justify-center">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold font-editorial text-stone-900">No celebrations planned yet</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Create your first celebration or load realistic demo data to explore the planner.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateEventModalOpen(true)}
              className="rounded-full px-5 py-2.5 bg-black text-white text-xs font-semibold shadow-xs hover:bg-stone-800 transition-colors"
            >
              Create First Celebration
            </button>
            <button
              onClick={resetToDemoData}
              className="rounded-full px-5 py-2.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold"
            >
              Load Demo Events
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ============================================================== */}
          {/* TOP SECTION: Top-left Wide Upcoming Celebrations + Top-right Today's Tasks */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Top-left: Wide Upcoming Celebrations panel containing three pastel event cards */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-[#FCFAF4] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                    Upcoming Celebrations
                  </h2>
                  <p className="text-xs text-stone-500">
                    High-priority celebration milestones and readiness progress.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('events')}
                  className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1 group"
                >
                  <span>View all ({events.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* 3 Pastel Event Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 flex-1">
                {topThreeCelebrations.map((event, index) => {
                  const theme = PASTEL_THEMES[index % PASTEL_THEMES.length];
                  const eventGuests = guests.filter(g => g.eventId === event.id);
                  const eventTasks = tasks.filter(t => t.eventId === event.id);
                  const tStats = calculateTaskProgress(eventTasks);
                  const gStats = calculateGuestStats(eventGuests);
                  const daysUntil = getDaysUntil(event.eventDate);
                  const categoryInfo = getCategoryBadge(event.category);

                  return (
                    <div
                      key={event.id}
                      onClick={() => onOpenEventDetail(event)}
                      className={`p-4 rounded-2xl ${theme.bg} border ${theme.border} hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group`}
                    >
                      <div>
                        {/* Category Badge & Days Pill */}
                        <div className="flex items-center justify-between gap-1 mb-2.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/70 ${categoryInfo.bg}`}>
                            {categoryInfo.label}
                          </span>
                          <span className="text-[10px] font-bold text-stone-700 tabular-nums">
                            {daysUntil > 0 ? `${daysUntil}d away` : daysUntil === 0 ? 'Today' : 'Past'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-stone-900 group-hover:text-black line-clamp-2 leading-snug">
                          {event.title}
                        </h3>

                        {/* Date & Venue */}
                        <div className="mt-2 space-y-1 text-xs text-stone-600">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <CalendarDays className="w-3 h-3 text-stone-500 shrink-0" />
                            <span className="truncate">{formatEventDate(event.eventDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                            <span className="truncate">{event.venueName || event.location || 'Venue TBD'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Progress Bar & Headcount */}
                      <div className="mt-4 pt-3 border-t border-black/5">
                        <div className="flex items-center justify-between text-[11px] mb-1.5 text-stone-700">
                          <span>Checklist</span>
                          <span className="font-bold tabular-nums">{tStats.completionRate}%</span>
                        </div>
                        {/* Slim progress bar */}
                        <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-stone-900 transition-all duration-300"
                            style={{ width: `${Math.max(5, tStats.completionRate)}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-stone-600">
                          <span>{gStats.attendingHeadcount} attending</span>
                          <span>{formatCurrency(event.targetBudget)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Fill slots if less than 3 events */}
                {topThreeCelebrations.length < 3 && (
                  <div
                    onClick={() => setIsCreateEventModalOpen(true)}
                    className="p-4 rounded-2xl bg-white/70 border border-dashed border-stone-300 hover:border-stone-500 transition-colors cursor-pointer flex flex-col items-center justify-center text-center group min-h-[180px]"
                  >
                    <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 group-hover:bg-stone-900 group-hover:text-white transition-colors mb-2">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-stone-800">Add Next Celebration</span>
                    <span className="text-[11px] text-stone-500 mt-0.5">Birthday, Anniversary, or Fest</span>
                  </div>
                )}
              </div>
            </div>

            {/* Top-right: Today's Tasks panel with task names, due dates, and circular completion controls */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-[#FCFAF4] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                      Today's Tasks
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 tabular-nums">
                      {metrics.pendingTasksCount}
                    </span>
                  </div>
                  <button
                    onClick={onOpenAddTask}
                    className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </div>

                {/* Tasks List with Circular completion controls */}
                <div className="space-y-2.5">
                  {todayTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-500">
                      No pending tasks! All checklist items completed.
                    </div>
                  ) : (
                    todayTasks.map((task) => {
                      const isCompleted = task.status === 'completed';
                      const taskEvent = events.find(e => e.id === task.eventId);

                      return (
                        <div
                          key={task.id}
                          className={`p-2.5 rounded-2xl border transition-all flex items-center gap-3 ${
                            isCompleted 
                              ? 'bg-stone-100/60 border-stone-200/50 opacity-60' 
                              : 'bg-white border-stone-200/70 hover:border-stone-400'
                          }`}
                        >
                          {/* Circular completion control button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskStatus(task.id);
                            }}
                            className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                              isCompleted
                                ? 'bg-black border-black text-white'
                                : 'border-stone-400 hover:border-black bg-white'
                            }`}
                            aria-label={isCompleted ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as completed`}
                          >
                            {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          {/* Task details */}
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-semibold text-stone-900 block truncate ${
                              isCompleted ? 'line-through text-stone-400' : ''
                            }`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                              {taskEvent && (
                                <span className="truncate max-w-[100px] text-stone-600 font-medium">
                                  {taskEvent.title}
                                </span>
                              )}
                              <span>·</span>
                              <span className="tabular-nums">Due {task.dueDate}</span>
                            </div>
                          </div>

                          {/* Priority badge */}
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm shrink-0 ${
                            task.priority === 'high' 
                              ? 'bg-rose-100 text-rose-800' 
                              : task.priority === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500">
                <span>{metrics.taskCompletionRate}% done overall</span>
                <button
                  onClick={() => setActiveView('tasks')}
                  className="font-semibold text-stone-800 hover:text-black underline text-[11px]"
                >
                  View checklist →
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* MIDDLE SECTION: 3 Aligned Panels */}
          {/* 1. Middle-left: Upcoming Schedule */}
          {/* 2. Middle-center: Alerts panel */}
          {/* 3. Middle-right: Celebration Overview with pastel donut chart */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Middle-left: Upcoming Schedule */}
            <div className="p-6 rounded-3xl bg-[#FCFAF4] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-700" />
                    <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                      Upcoming Schedule
                    </h2>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium">Run-of-show</span>
                </div>

                <div className="space-y-3">
                  {upcomingSchedule.length === 0 ? (
                    <div className="py-8 text-center text-xs text-stone-500">
                      No schedule items yet. Add run-of-show milestones in event details.
                    </div>
                  ) : (
                    upcomingSchedule.map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-2xl bg-white border border-stone-200/70 flex items-start gap-3 hover:border-stone-400 transition-colors"
                      >
                        <div className="px-2 py-1 rounded-xl bg-stone-100 font-bold text-[10px] text-stone-800 tabular-nums shrink-0 mt-0.5">
                          {item.time}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-stone-900 block truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-stone-500 truncate block mt-0.5">
                            {item.eventTitle}
                          </span>
                          {item.description && (
                            <p className="text-[10px] text-stone-400 truncate mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-200/60">
                <button
                  onClick={() => setActiveView('calendar')}
                  className="w-full text-center text-xs font-semibold text-stone-700 hover:text-black"
                >
                  Open Full Celebration Calendar →
                </button>
              </div>
            </div>

            {/* Middle-center: Alerts Panel */}
            <div className="p-6 rounded-3xl bg-[#FCFAF4] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-stone-700" />
                    <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                      Alerts & Reminders
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => alert.actionView && setActiveView(alert.actionView)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        alert.type === 'urgent'
                          ? 'bg-rose-50/70 border-rose-200/80 hover:bg-rose-50 text-rose-950'
                          : alert.type === 'warning'
                          ? 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-50 text-amber-950'
                          : 'bg-white border-stone-200/70 hover:bg-stone-50 text-stone-900'
                      }`}
                    >
                      <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                        alert.type === 'urgent' 
                          ? 'text-rose-600' 
                          : alert.type === 'warning'
                          ? 'text-amber-600'
                          : 'text-stone-500'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">{alert.title}</span>
                          <ArrowUpRight className="w-3 h-3 text-stone-400 shrink-0 ml-1" />
                        </div>
                        <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-200/60 text-[11px] text-stone-500 text-center">
                Click any alert to navigate to resolution
              </div>
            </div>

            {/* Middle-right: Celebration Overview with Pastel Donut Chart and Legend */}
            <div className="p-6 rounded-3xl bg-[#FCFAF4] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                    Celebration Overview
                  </h2>
                  <span className="text-xs font-semibold text-stone-500">Categories</span>
                </div>

                {/* SVG Pastel Donut Chart */}
                <div className="flex items-center justify-center my-3">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {categoryEntries.map(([category, count], idx) => {
                        const fraction = count / (totalEvents || 1);
                        const strokeDash = fraction * circumference;
                        const strokeOffset = cumulativeOffset;
                        cumulativeOffset += strokeDash;
                        const color = donutColors[idx % donutColors.length];

                        return (
                          <circle
                            key={category}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={color}
                            strokeWidth="14"
                            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                            strokeDashoffset={-strokeOffset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        );
                      })}
                    </svg>
                    {/* Donut Center Count */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="text-2xl font-bold font-editorial text-stone-900 leading-none tabular-nums">
                        {totalEvents}
                      </span>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold mt-0.5">
                        Events
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-1.5 pt-1">
                  {categoryEntries.slice(0, 4).map(([category, count], idx) => {
                    const color = donutColors[idx % donutColors.length];
                    const percent = Math.round((count / (totalEvents || 1)) * 100);

                    return (
                      <div key={category} className="flex items-center justify-between text-xs text-stone-700">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="capitalize truncate text-[11px] font-medium">
                            {category.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[11px] font-semibold text-stone-900">
                          <span>{count}</span>
                          <span className="text-stone-400 font-normal">({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
                <span>Total Budget</span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {formatCurrency(metrics.totalTargetBudget)}
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BOTTOM SECTION: Upcoming Events in a 4-column grid of compact cream cards with pastel category badges */}
          {/* ============================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                  Upcoming Events
                </h2>
                <p className="text-xs text-stone-500">
                  Full celebration catalogue and planning readiness.
                </p>
              </div>
              <button
                onClick={() => setActiveView('events')}
                className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1 group"
              >
                <span>Browse All Celebrations</span>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* 4-column grid of compact cream cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sortedEvents.map((event) => {
                const eventGuests = guests.filter(g => g.eventId === event.id);
                const eventTasks = tasks.filter(t => t.eventId === event.id);
                const tStats = calculateTaskProgress(eventTasks);
                const gStats = calculateGuestStats(eventGuests);
                const categoryInfo = getCategoryBadge(event.category);
                const daysUntil = getDaysUntil(event.eventDate);

                return (
                  <div
                    key={event.id}
                    onClick={() => onOpenEventDetail(event)}
                    className="p-4 rounded-2xl bg-[#FCFAF4] border border-stone-200/80 hover:border-stone-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Pastel category badge & days tag */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryInfo.bg}`}>
                          {categoryInfo.label}
                        </span>
                        <span className="text-[10px] font-medium text-stone-500 tabular-nums">
                          {daysUntil > 0 ? `${daysUntil}d left` : daysUntil === 0 ? 'Today' : 'Past'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs font-bold text-stone-900 group-hover:text-black line-clamp-1 leading-snug">
                        {event.title}
                      </h3>

                      {/* Date & Location */}
                      <div className="mt-2 space-y-1 text-[11px] text-stone-500">
                        <div className="flex items-center gap-1.5 truncate">
                          <CalendarDays className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{formatEventDate(event.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{event.venueName || event.location || 'Venue TBD'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Guest RSVP summary, budget in INR, & slim progress bar */}
                    <div className="mt-3 pt-2.5 border-t border-stone-200/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-stone-600">
                        <span>Guests</span>
                        <span className="font-semibold text-stone-800 tabular-nums">
                          {gStats.attendingHeadcount} confirmed
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-600">
                        <span>Budget</span>
                        <span className="font-bold text-stone-900 tabular-nums">
                          {formatCurrency(event.targetBudget)}
                        </span>
                      </div>

                      {/* Slim progress bar */}
                      <div className="pt-1">
                        <div className="w-full h-1 rounded-full bg-stone-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-stone-900 transition-all"
                            style={{ width: `${Math.max(5, tStats.completionRate)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
