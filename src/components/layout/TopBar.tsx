import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  ChevronDown, 
  Check, 
  Calendar, 
  Sparkles, 
  Menu, 
  X,
  Users,
  CheckSquare,
  Wallet,
  Settings,
  RefreshCw,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { searchAllRecords, formatEventDate } from '../../utils/calculations';

interface TopBarProps {
  onToggleMobileNav?: () => void;
  onOpenEventDetail?: (eventId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileNav, onOpenEventDetail }) => {
  const { 
    events, 
    guests,
    tasks,
    selectedEventId, 
    setSelectedEventId, 
    searchQuery, 
    setSearchQuery, 
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setIsCreateEventModalOpen,
    setIsHostProfileModalOpen,
    resetToDemoData,
    clearAllData,
    setActiveView,
    hostProfile
  } = useGatherly();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEventPickerOpen, setIsEventPickerOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentEvent = events.find(e => e.id === selectedEventId);

  // Global search matches
  const searchResults = searchAllRecords(events, guests, tasks, searchQuery);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsEventPickerOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-stone-200/70 bg-[#FCFAF4]/90 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile hamburger + Context Breadcrumb / Event Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 -ml-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Event Quick Filter Dropdown */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setIsEventPickerOpen(prev => !prev)}
            className="flex items-center gap-2 text-xs font-semibold text-stone-800 bg-stone-100/80 hover:bg-stone-200/70 border border-stone-200/60 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-600"
            aria-expanded={isEventPickerOpen}
            aria-label="Filter celebration context"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: currentEvent?.themeColor || '#7C3AED' }} />
            <span className="max-w-[130px] sm:max-w-[200px] truncate">
              {currentEvent ? currentEvent.title : 'All Celebrations'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {isEventPickerOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white border border-stone-200 rounded-xl shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setSelectedEventId(null);
                  setIsEventPickerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                  !selectedEventId ? 'bg-violet-50 text-violet-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>All Celebrations Overview</span>
                {!selectedEventId && <Check className="w-3.5 h-3.5 text-violet-700" />}
              </button>

              <div className="my-1 border-t border-stone-100" />
              <div className="text-[10px] uppercase font-semibold text-stone-400 px-3 py-1">
                Filter by Event
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {events.map((e) => {
                  const isSelected = selectedEventId === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => {
                        setSelectedEventId(e.id);
                        setIsEventPickerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                        isSelected ? 'bg-violet-50 text-violet-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.themeColor }} />
                        <span className="truncate">{e.title}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-violet-700 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Universal Search Bar with Live Overlay Results */}
      <div className="flex-1 max-w-md hidden sm:block relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            placeholder="Search events, guests, tasks, venues..."
            className="w-full bg-stone-100/70 border border-stone-200/60 focus:border-violet-600 focus:bg-white focus:outline-hidden pl-9 pr-8 py-1.5 rounded-xl text-xs text-stone-800 placeholder-stone-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Overlay */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 z-40 max-h-80 overflow-y-auto animate-in fade-in duration-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 pb-1.5 border-b border-stone-100 flex justify-between">
              <span>Search Results for "{searchQuery}"</span>
              <span>{searchResults.totalMatches} matches</span>
            </div>

            {searchResults.totalMatches === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400">
                No celebrations, guests, or tasks found matching "{searchQuery}".
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {/* Events */}
                {searchResults.events.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-stone-700 px-2 block mb-1">
                      Celebrations ({searchResults.events.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.events.map(e => (
                        <div
                          key={e.id}
                          onClick={() => {
                            if (onOpenEventDetail) onOpenEventDetail(e.id);
                            else {
                              setSelectedEventId(e.id);
                              setActiveView('events');
                            }
                            setIsSearchFocused(false);
                          }}
                          className="px-2.5 py-1.5 hover:bg-stone-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.themeColor }} />
                            <span className="font-semibold text-stone-800 truncate">{e.title}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 shrink-0">{formatEventDate(e.eventDate)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guests */}
                {searchResults.guests.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-semibold text-stone-700 px-2 block mb-1">
                      Guests & RSVPs ({searchResults.guests.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.guests.slice(0, 4).map(g => (
                        <div
                          key={g.id}
                          onClick={() => {
                            setActiveView('guests');
                            setIsSearchFocused(false);
                          }}
                          className="px-2.5 py-1.5 hover:bg-stone-50 rounded-xl cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="font-medium text-stone-800 truncate">{g.fullName}</span>
                          </div>
                          <span className="text-[10px] font-semibold capitalize text-stone-500">{g.rsvpStatus}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {searchResults.tasks.length > 0 && (
                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-semibold text-stone-700 px-2 block mb-1">
                      Checklist Tasks ({searchResults.tasks.length})
                    </span>
                    <div className="space-y-1">
                      {searchResults.tasks.slice(0, 4).map(t => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setActiveView('tasks');
                            setIsSearchFocused(false);
                          }}
                          className="px-2.5 py-1.5 hover:bg-stone-50 rounded-xl cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <CheckSquare className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="font-medium text-stone-800 truncate">{t.title}</span>
                          </div>
                          <span className="text-[10px] text-stone-400 shrink-0">Due {t.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notification Affordance, Quick Create, Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-violet-600"
            aria-label="Celebration updates and reminders"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 z-40 animate-in fade-in zoom-in-95 duration-100">
              {/* Demo Mode Notice in Notifications */}
              <div className="p-2.5 mb-2 bg-stone-50 border border-stone-200/70 rounded-xl text-[11px] text-stone-500 leading-relaxed">
                <span className="font-bold text-stone-800 block">Demo Notification Feed</span>
                Real local celebration updates. In production, this syncs live RSVP webhooks.
              </div>

              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">Celebration Updates</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-violet-700 hover:text-violet-900 font-medium"
                    >
                      Mark read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-stone-400 hover:text-rose-600 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-stone-400 py-6 text-center">No notifications right now.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.eventId) {
                          setSelectedEventId(n.eventId);
                          setActiveView('events');
                          setIsNotificationsOpen(false);
                        }
                      }}
                      className={`p-2.5 rounded-xl text-left transition-colors cursor-pointer border ${
                        n.read ? 'bg-white border-transparent hover:bg-stone-50' : 'bg-violet-50/60 border-violet-100/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-stone-900">{n.title}</span>
                        <span className="text-[10px] text-stone-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">{n.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Add CTA */}
        <button
          onClick={() => setIsCreateEventModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 bg-black hover:bg-stone-800 text-white text-xs font-semibold py-1.5 px-4 rounded-full transition-all shadow-xs active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-stone-300" />
          <span>New Event</span>
        </button>

        {/* Profile Avatar / Host Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center gap-2 p-1 pl-2 hover:bg-stone-100 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-violet-600"
            aria-label="Host Profile Menu"
            aria-expanded={isProfileOpen}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white text-xs font-bold flex items-center justify-center">
              {hostProfile.hostName ? hostProfile.hostName[0] : 'H'}
            </div>
            <div className="hidden lg:block text-left text-xs leading-none pr-1">
              <span className="font-semibold text-stone-900 block mb-0.5 truncate max-w-[120px]">
                {hostProfile.hostName}
              </span>
              <span className="text-[10px] text-stone-400">Host Suite</span>
            </div>
            <ChevronDown className="w-3 h-3 text-stone-400 hidden lg:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2.5 border-b border-stone-100 mb-1">
                <span className="text-xs font-bold text-stone-900 block">{hostProfile.hostName}</span>
                <span className="text-[11px] text-stone-500">{hostProfile.organization}</span>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setIsHostProfileModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-stone-400" />
                  <span>Host Preferences & Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsCreateEventModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-400" />
                  <span>New Celebration Studio</span>
                </button>

                <div className="my-1 border-t border-stone-100" />

                <button
                  onClick={() => {
                    resetToDemoData();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                  <span>Reload Demo Events</span>
                </button>

                <button
                  onClick={() => {
                    clearAllData();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
