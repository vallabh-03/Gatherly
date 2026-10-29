import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Calendar, 
  Users, 
  Wallet, 
  CheckSquare, 
  Plus, 
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { ActiveView } from '../../types';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { 
    activeView, 
    setActiveView, 
    setIsCreateEventModalOpen, 
    resetToDemoData, 
    clearAllData,
    events,
    guests,
    tasks 
  } = useGatherly();

  if (!isOpen) return null;

  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
    onClose();
  };

  const navItems = [
    { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events' as ActiveView, label: 'My Events', icon: CalendarDays, count: events.length },
    { id: 'calendar' as ActiveView, label: 'Calendar', icon: Calendar },
    { id: 'guests' as ActiveView, label: 'Guests & RSVPs', icon: Users, count: guests.length },
    { id: 'budget' as ActiveView, label: 'Budget Planner', icon: Wallet },
    { id: 'tasks' as ActiveView, label: 'Checklist & Tasks', icon: CheckSquare, count: tasks.filter(t => t.status !== 'completed').length },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <span className="font-editorial text-lg font-bold text-stone-900">Gatherly</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              setIsCreateEventModalOpen(true);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4 text-violet-300" />
            <span>Create Celebration</span>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-left ${
                  isActive ? 'bg-violet-50 text-violet-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-700' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[11px] tabular-nums font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100 bg-stone-50 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetToDemoData();
                onClose();
              }}
              className="flex-1 py-1.5 px-2 bg-white border border-stone-200 rounded-lg text-[11px] font-medium text-stone-700"
            >
              Reset Demo
            </button>
            <button
              onClick={() => {
                clearAllData();
                onClose();
              }}
              className="py-1.5 px-2 bg-white border border-stone-200 rounded-lg text-[11px] font-medium text-stone-500 hover:text-rose-600"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
