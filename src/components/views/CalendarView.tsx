import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  CheckSquare, 
  Sparkles,
  ArrowUpRight,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { CelebrationEvent, EventCategory } from '../../types';
import { formatCurrency, formatEventDate, isPastDate } from '../../utils/calculations';

interface CalendarViewProps {
  onOpenEventDetail: (event: CelebrationEvent) => void;
}

const CATEGORY_FILTERS = [
  { label: 'All Occasions', value: 'all' },
  { label: 'Birthday', value: 'birthday' },
  { label: 'Wedding', value: 'wedding' },
  { label: 'College Fest', value: 'college_fest' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Family Gathering', value: 'family_gathering' },
  { label: 'Other', value: 'other' },
];

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenEventDetail }) => {
  const { events, tasks, setIsCreateEventModalOpen } = useGatherly();

  // Current calendar viewing month (defaults to November 2026 for rich seed demo)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 10, 1));
  const [selectedDay, setSelectedDay] = useState<string | null>('2026-11-21');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewType, setViewType] = useState<'month' | 'agenda'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDay(todayStr);
  };

  // Filter events by category
  const filteredEvents = events.filter(e => {
    if (categoryFilter === 'all') return true;
    return e.category === categoryFilter;
  });

  // Calendar generation logic (strictly local dates)
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ dayNumber: null, dateString: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dayNumber: d, dateString });
  }

  // Events in this specific month
  const monthEvents = filteredEvents.filter(e => {
    if (!e.eventDate) return false;
    const [eYear, eMonth] = e.eventDate.split('-').map(Number);
    return eYear === year && eMonth === month + 1;
  });

  // Selected date items
  const dayEvents = filteredEvents.filter(e => e.eventDate === selectedDay);
  const dayTasks = tasks.filter(t => t.dueDate === selectedDay);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tracking-tight">
            Celebration Calendar
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Month overview of scheduled celebrations, vendor load-ins, and task milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/60">
            <button
              onClick={() => setViewType('month')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewType === 'month' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Month Grid View"
              aria-label="Month Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('agenda')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewType === 'agenda' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Month Agenda View"
              aria-label="Month Agenda View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center bg-white border border-stone-200/90 rounded-xl p-1 shadow-xs">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-stone-900"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-stone-900 px-3 min-w-[140px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-stone-900"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={goToToday}
            className="px-4 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-full text-xs font-semibold transition-colors shadow-2xs"
          >
            Today
          </button>

          <button
            onClick={() => setIsCreateEventModalOpen(true)}
            className="flex items-center gap-1.5 bg-black hover:bg-stone-800 text-white text-xs font-semibold py-2 px-4 rounded-full transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-stone-300" />
            <span>New Celebration</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Segmented control) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap ${
              categoryFilter === cat.value
                ? 'bg-black text-white font-semibold shadow-xs'
                : 'bg-white/80 text-stone-600 hover:bg-stone-100 border border-stone-200/80 font-medium'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Empty Month Notice if no celebrations in current month */}
      {monthEvents.length === 0 && (
        <div className="p-4 bg-[#FAF7F2] border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-violet-700 shrink-0" />
            <span>No celebrations scheduled in <strong>{monthName}</strong> for the selected filter.</span>
          </div>
          <button
            onClick={() => setIsCreateEventModalOpen(true)}
            className="text-xs font-bold text-violet-700 hover:text-violet-900 underline text-left sm:text-right"
          >
            + Plan an event for this month
          </button>
        </div>
      )}

      {/* View Switch: Month Grid or Agenda List */}
      {viewType === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Month Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/70 text-center py-2.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Month Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-stone-100">
              {days.map((item, idx) => {
                if (!item.dateString) {
                  return <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-stone-50/30" />;
                }

                const isSelected = selectedDay === item.dateString;
                const cellEvents = filteredEvents.filter(e => e.eventDate === item.dateString);
                const cellTasks = tasks.filter(t => t.dueDate === item.dateString);
                const isPast = isPastDate(item.dateString);

                return (
                  <div
                    key={item.dateString}
                    onClick={() => setSelectedDay(item.dateString)}
                    className={`h-24 sm:h-28 p-1.5 sm:p-2 transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected ? 'bg-violet-50/50 ring-2 ring-violet-600 ring-inset z-1' : 'hover:bg-stone-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold tabular-nums rounded-full w-5 h-5 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-violet-700 text-white' 
                          : isPast 
                          ? 'text-stone-400' 
                          : 'text-stone-800'
                      }`}>
                        {item.dayNumber}
                      </span>
                      {(cellEvents.length > 0 || cellTasks.length > 0) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                      )}
                    </div>

                    {/* Stacked Event indicators */}
                    <div className="space-y-1 overflow-hidden mt-1">
                      {cellEvents.map(e => (
                        <div
                          key={e.id}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            onOpenEventDetail(e);
                          }}
                          className="truncate text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-stone-900 bg-white hover:bg-stone-50 border border-stone-200/80 flex items-center gap-1 shadow-2xs transition-transform active:scale-[0.98]"
                          style={{ borderLeftColor: e.themeColor || '#7C3AED', borderLeftWidth: '3px' }}
                          title={`${e.startTime} - ${e.title} (Click to open)`}
                        >
                          <span className="truncate">{e.title}</span>
                        </div>
                      ))}
                      {cellTasks.length > 0 && cellEvents.length === 0 && (
                        <div className="truncate text-[9px] font-medium text-stone-500 px-1 py-0.5">
                          {cellTasks.length} task{cellTasks.length > 1 ? 's' : ''} due
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 1 Col: Selected Date Inspect Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5 space-y-4">
              <div className="border-b border-stone-100 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">Date Agenda</span>
                  <h2 className="text-base font-bold font-editorial text-stone-900 mt-0.5">
                    {selectedDay ? formatEventDate(selectedDay) : 'Select a date'}
                  </h2>
                </div>
                {selectedDay && isPastDate(selectedDay) && (
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                    Past
                  </span>
                )}
              </div>

              {/* Celebrations on this date */}
              <div>
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                  Celebrations ({dayEvents.length})
                </span>

                {dayEvents.length === 0 ? (
                  <p className="text-xs text-stone-400 py-2">No celebration booked on this date.</p>
                ) : (
                  <div className="space-y-3">
                    {dayEvents.map(e => (
                      <div
                        key={e.id}
                        onClick={() => onOpenEventDetail(e)}
                        className="p-3.5 rounded-xl border border-stone-200 hover:border-violet-300 hover:bg-stone-50/60 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.themeColor }} />
                          <span className="text-xs font-bold text-stone-900 group-hover:text-violet-900">
                            {e.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{e.startTime}{e.endTime ? ` - ${e.endTime}` : ''}</span>
                        </p>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{e.venueName}</span>
                        </p>
                        <div className="mt-2 text-[11px] font-semibold text-violet-700 flex items-center gap-1">
                          <span>Open Celebration Studio</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks due on this date */}
              <div className="pt-3 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                  Checklist Deadlines ({dayTasks.length})
                </span>

                {dayTasks.length === 0 ? (
                  <p className="text-xs text-stone-400 py-1">No deadlines scheduled for this date.</p>
                ) : (
                  <div className="space-y-1.5">
                    {dayTasks.map(t => (
                      <div key={t.id} className="p-2 bg-stone-50 rounded-lg text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-medium text-stone-800 truncate">{t.title}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-stone-500 uppercase">{t.priority}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {monthEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-400">
              No celebrations in this month matching the category filter.
            </div>
          ) : (
            monthEvents.map(e => (
              <div
                key={e.id}
                onClick={() => onOpenEventDetail(e)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: e.themeColor || '#7C3AED' }}
                  />
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-stone-900">{formatEventDate(e.eventDate)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{e.startTime}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{e.category.replace('_', ' ')}</span>
                    </div>
                    <h3 className="text-base font-bold font-editorial text-stone-900 group-hover:text-violet-900 mt-0.5">
                      {e.title}
                    </h3>
                    <span className="text-xs text-stone-500 mt-0.5 block">
                      {e.venueName} — {e.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold text-violet-700 flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
