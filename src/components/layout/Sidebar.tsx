import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Calendar, 
  Users, 
  Wallet, 
  CheckSquare, 
  Settings, 
  Plus, 
  Sparkles, 
  RefreshCw
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { ActiveView } from '../../types';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: (ctx: ReturnType<typeof useGatherly>) => number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: CalendarDays, badgeCount: (ctx) => ctx.events.length },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, badgeCount: (ctx) => ctx.tasks.filter(t => t.status !== 'completed').length },
  { id: 'guests', label: 'Guests', icon: Users, badgeCount: (ctx) => ctx.guests.filter(g => g.rsvpStatus === 'pending').length },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const ctx = useGatherly();
  const { activeView, setActiveView, setIsCreateEventModalOpen, events } = ctx;

  return (
    <aside className="w-60 shrink-0 m-3 my-4 mr-0 rounded-3xl bg-[#FCFAF4] border border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col h-[calc(100vh-2rem)] sticky top-4 z-20">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-stone-200/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <span className="font-editorial text-lg font-bold tracking-tight text-stone-900 block leading-none">
              Gatherly
            </span>
            <span className="text-[10px] text-stone-400 font-medium tracking-wide">
              Celebration Suite
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const count = item.badgeCount ? item.badgeCount(ctx) : null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs transition-all duration-150 text-left group ${
                isActive
                  ? 'bg-black text-white font-semibold shadow-xs'
                  : 'text-stone-700 hover:bg-stone-200/60 hover:text-black font-medium'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 transition-colors shrink-0 ${
                    isActive ? 'text-white' : 'text-stone-500 group-hover:text-black'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {count !== null && count > 0 && (
                <span
                  className={`text-[10px] tabular-nums font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-stone-800 text-stone-200'
                      : 'bg-stone-200/80 text-stone-600 group-hover:bg-stone-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Event Jump */}
      {events.length > 0 && (
        <div className="p-3.5 border-t border-stone-200/50">
          <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            <span>Pinned Events</span>
            <span className="text-stone-500 tabular-nums">{events.length}</span>
          </div>
          <div className="space-y-0.5 max-h-32 overflow-y-auto">
            {events.slice(0, 3).map((event) => {
              const isSelected = ctx.selectedEventId === event.id;
              return (
                <button
                  key={event.id}
                  onClick={() => {
                    ctx.setSelectedEventId(isSelected ? null : event.id);
                    ctx.setActiveView('events');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs truncate transition-colors flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-black text-white font-medium' 
                      : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
                  }`}
                  title={event.title}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: event.themeColor || '#7C3AED' }}
                  />
                  <span className="truncate">{event.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Storage Mode */}
      <div className="p-3 border-t border-stone-200/50 text-xs">
        <div className="bg-[#F5F1E2] p-2.5 rounded-2xl flex items-center justify-between text-[11px]">
          <span className="text-stone-600 font-medium">Local Data Active</span>
          <span className="text-[10px] font-bold text-stone-400 uppercase">INR (₹)</span>
        </div>
      </div>
    </aside>
  );
};
