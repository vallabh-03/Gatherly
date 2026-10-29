import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  Trash2, 
  Edit3,
  Copy,
  Sparkles,
  ArrowUpRight,
  History,
  Filter
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { CelebrationEvent, EventCategory } from '../../types';
import { 
  calculateEventBudget, 
  calculateGuestStats, 
  calculateTaskProgress, 
  formatCurrency, 
  formatEventDate, 
  getDaysUntil,
  isPastDate 
} from '../../utils/calculations';

interface EventsViewProps {
  onOpenEventDetail: (event: CelebrationEvent) => void;
}

const CATEGORY_FILTERS = [
  { label: 'All Celebrations', value: 'all' },
  { label: 'Birthday', value: 'birthday' },
  { label: 'Wedding', value: 'wedding' },
  { label: 'College Fest', value: 'college_fest' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Family Gathering', value: 'family_gathering' },
  { label: 'Other', value: 'other' },
];

export const EventsView: React.FC<EventsViewProps> = ({ onOpenEventDetail }) => {
  const { 
    events, 
    guests, 
    budgets, 
    tasks, 
    searchQuery, 
    setIsCreateEventModalOpen,
    setEditingEvent,
    duplicateEvent,
    setDeleteConfirmEvent 
  } = useGatherly();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter events by category, date timeline, and search query
  const filteredEvents = events.filter((e) => {
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const isPast = isPastDate(e.eventDate);
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'upcoming' && !isPast) ||
      (dateFilter === 'past' && isPast);
    const matchesSearch = !searchQuery.trim() || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDate && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tracking-tight">
            Celebration Catalog & Studio
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Create, duplicate, schedule, and orchestrate all milestones in one centralized workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateEventModalOpen(true)}
            className="flex items-center gap-1.5 bg-black hover:bg-stone-800 text-white text-xs font-semibold py-2 px-4 rounded-full transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-stone-300" />
            <span>New Celebration</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Category Tabs & Timeline Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-black text-white font-semibold shadow-xs'
                  : 'bg-white/80 text-stone-600 hover:bg-stone-100 border border-stone-200/80 font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Date Filter Select */}
        <div className="flex items-center gap-2 text-xs text-stone-500 shrink-0 self-start md:self-auto">
          <span>Date:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 text-xs focus:outline-hidden"
          >
            <option value="all">All Dates ({events.length})</option>
            <option value="upcoming">Upcoming Celebrations</option>
            <option value="past">Past / Completed</option>
          </select>
        </div>
      </div>

      {/* Events Listing */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300 space-y-3">
          <CalendarDays className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No celebrations found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No events match "${searchQuery}". Try clearing the search filter.`
              : 'There are no celebrations matching the current category and date filters.'}
          </p>
          <button
            onClick={() => setIsCreateEventModalOpen(true)}
            className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Create Celebration
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const evGuests = guests.filter(g => g.eventId === event.id);
            const evBudgets = budgets.filter(b => b.eventId === event.id);
            const evTasks = tasks.filter(t => t.eventId === event.id);

            const bStats = calculateEventBudget(evBudgets, event.targetBudget);
            const gStats = calculateGuestStats(evGuests);
            const tStats = calculateTaskProgress(evTasks);
            const daysUntil = getDaysUntil(event.eventDate);
            const isPast = isPastDate(event.eventDate);

            return (
              <div
                key={event.id}
                onClick={() => onOpenEventDetail(event)}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-violet-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Color Accent Stripe */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: event.themeColor || '#7C3AED' }} />

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span className="capitalize font-medium text-stone-700">{event.category.replace('_', ' ')}</span>
                      {isPast ? (
                        <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                          <History className="w-3 h-3" />
                          Past
                        </span>
                      ) : (
                        <span className="font-semibold text-violet-700 tabular-nums">
                          {daysUntil > 0 ? `${daysUntil}d away` : 'Today'}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold font-editorial text-stone-900 group-hover:text-violet-950 transition-colors line-clamp-1">
                      {event.title}
                    </h2>

                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{event.venueName}</span>
                    </p>

                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{formatEventDate(event.eventDate)} at {event.startTime}</span>
                    </p>

                    <p className="text-xs text-stone-600 mt-3 line-clamp-2 leading-relaxed">
                      {event.description || 'Custom curated celebration with family and friends.'}
                    </p>
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="p-4 bg-stone-50/70 border-t border-stone-100 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-[11px] text-stone-600">
                    <span>RSVPs Confirmed:</span>
                    <span className="font-bold text-stone-900 tabular-nums">
                      {gStats.attendingHeadcount} / {event.expectedGuestCount}
                    </span>
                  </div>
                  <div className="w-full bg-stone-200/70 rounded-full h-1 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (gStats.attendingHeadcount / (event.expectedGuestCount || 1)) * 100)}%` }} 
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-stone-600 pt-1">
                    <span>Budget Spent:</span>
                    <span className="font-bold text-stone-900 tabular-nums">
                      {formatCurrency(bStats.totalActual)} <span className="font-normal text-stone-400">/ {formatCurrency(event.targetBudget)}</span>
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(event);
                        }}
                        className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-200/50 rounded-lg transition-colors"
                        title="Edit celebration"
                        aria-label="Edit celebration"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateEvent(event.id);
                        }}
                        className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-200/50 rounded-lg transition-colors"
                        title="Duplicate celebration"
                        aria-label="Duplicate celebration"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmEvent(event);
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-200/50 rounded-lg transition-colors"
                        title="Delete celebration"
                        aria-label="Delete celebration"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs text-violet-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Open Studio</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {filteredEvents.map((event) => {
            const evGuests = guests.filter(g => g.eventId === event.id);
            const evBudgets = budgets.filter(b => b.eventId === event.id);
            const bStats = calculateEventBudget(evBudgets, event.targetBudget);
            const gStats = calculateGuestStats(evGuests);
            const daysUntil = getDaysUntil(event.eventDate);
            const isPast = isPastDate(event.eventDate);

            return (
              <div
                key={event.id}
                onClick={() => onOpenEventDetail(event)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: event.themeColor || '#7C3AED' }}
                  />
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="capitalize font-medium text-stone-700">{event.category.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatEventDate(event.eventDate)}</span>
                      <span aria-hidden="true">·</span>
                      {isPast ? (
                        <span className="text-stone-400 font-medium">Past</span>
                      ) : (
                        <span className="tabular-nums font-semibold text-violet-700">
                          {daysUntil > 0 ? `${daysUntil}d away` : 'Today'}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold font-editorial text-stone-900 mt-0.5">
                      {event.title}
                    </h2>
                    <span className="text-xs text-stone-500 mt-0.5 block">
                      {event.venueName} — {event.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-600 sm:self-center">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-semibold">Confirmed</span>
                    <span className="font-bold text-stone-900 tabular-nums">
                      {gStats.attendingHeadcount} guests
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-semibold">Spend</span>
                    <span className="font-bold text-stone-900 tabular-nums">
                      {formatCurrency(bStats.totalActual)}
                    </span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 border-l border-stone-200 pl-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                      }}
                      className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateEvent(event.id);
                      }}
                      className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmEvent(event);
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
