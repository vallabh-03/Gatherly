import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CelebrationEvent, 
  Guest, 
  BudgetItem, 
  Task, 
  AppNotification, 
  ActiveView,
  ToastMessage,
  HostProfile
} from '../types';
import { 
  SEED_EVENTS, 
  SEED_GUESTS, 
  SEED_BUDGETS, 
  SEED_TASKS, 
  SEED_NOTIFICATIONS 
} from '../data/seedData';
import { duplicateEventModel } from '../utils/calculations';

interface GatherlyContextType {
  events: CelebrationEvent[];
  guests: Guest[];
  budgets: BudgetItem[];
  tasks: Task[];
  notifications: AppNotification[];
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isCreateEventModalOpen: boolean;
  setIsCreateEventModalOpen: (open: boolean) => void;
  
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  removeToast: (id: string) => void;

  editingEvent: CelebrationEvent | null;
  setEditingEvent: (event: CelebrationEvent | null) => void;

  deleteConfirmEvent: CelebrationEvent | null;
  setDeleteConfirmEvent: (event: CelebrationEvent | null) => void;

  isHostProfileModalOpen: boolean;
  setIsHostProfileModalOpen: (open: boolean) => void;

  hostProfile: HostProfile;
  updateHostProfile: (profile: Partial<HostProfile>) => void;

  // Event Actions
  createEvent: (event: Omit<CelebrationEvent, 'id' | 'createdAt'>) => CelebrationEvent;
  updateEvent: (id: string, updates: Partial<CelebrationEvent>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => CelebrationEvent | null;

  // Guest Actions
  addGuest: (guest: Omit<Guest, 'id'>) => Guest;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;

  // Budget Actions
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => BudgetItem;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;

  // Reset / State Switchers
  resetToDemoData: () => void;
  clearAllData: () => void;
}

export const STORAGE_KEYS = {
  EVENTS: 'gatherly_events_v3',
  GUESTS: 'gatherly_guests_v3',
  BUDGETS: 'gatherly_budgets_v3',
  TASKS: 'gatherly_tasks_v3',
  NOTIFICATIONS: 'gatherly_notifications_v3',
  HOST_PROFILE: 'gatherly_host_profile_v3',
};

const DEFAULT_PROFILE: HostProfile = {
  hostName: 'Eleanor Vance',
  organization: 'Vance & Co. Celebrations',
  email: 'eleanor.host@gatherly.suite',
  phone: '(415) 880-9210',
  defaultLocation: 'San Francisco & Bay Area',
  currency: 'INR',
};

const GatherlyContext = createContext<GatherlyContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(fallback)) {
      return [] as unknown as T;
    }
    return (parsed ?? fallback) as T;
  } catch (err) {
    console.warn(`Error parsing localStorage key ${key}:`, err);
    return fallback;
  }
}

export const GatherlyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CelebrationEvent[]>(() => 
    loadFromStorage<CelebrationEvent[]>(STORAGE_KEYS.EVENTS, SEED_EVENTS)
  );
  const [guests, setGuests] = useState<Guest[]>(() => 
    loadFromStorage<Guest[]>(STORAGE_KEYS.GUESTS, SEED_GUESTS)
  );
  const [budgets, setBudgets] = useState<BudgetItem[]>(() => 
    loadFromStorage<BudgetItem[]>(STORAGE_KEYS.BUDGETS, SEED_BUDGETS)
  );
  const [tasks, setTasks] = useState<Task[]>(() => 
    loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() => 
    loadFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS)
  );
  const [hostProfile, setHostProfile] = useState(() =>
    loadFromStorage(STORAGE_KEYS.HOST_PROFILE, DEFAULT_PROFILE)
  );

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CelebrationEvent | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<CelebrationEvent | null>(null);
  const [isHostProfileModalOpen, setIsHostProfileModalOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts(prev => [...prev.slice(-3), newToast]); // Keep at most 4 toasts

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Keyboard accessibility: Escape to dismiss top-level modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirmEvent) {
          setDeleteConfirmEvent(null);
        } else if (editingEvent) {
          setEditingEvent(null);
        } else if (isCreateEventModalOpen) {
          setIsCreateEventModalOpen(false);
        } else if (isHostProfileModalOpen) {
          setIsHostProfileModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirmEvent, editingEvent, isCreateEventModalOpen, isHostProfileModalOpen]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOST_PROFILE, JSON.stringify(hostProfile));
  }, [hostProfile]);

  const updateHostProfile = (profileUpdates: Partial<typeof DEFAULT_PROFILE>) => {
    setHostProfile(prev => ({ ...prev, ...profileUpdates }));
    addToast('success', 'Profile Updated', 'Host preferences and contact info saved.');
  };

  // Event Handlers
  const createEvent = (data: Omit<CelebrationEvent, 'id' | 'createdAt'>): CelebrationEvent => {
    const newEvent: CelebrationEvent = {
      ...data,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString().split('T')[0],
      schedule: data.schedule || [
        { id: `sch-init-1`, time: data.startTime || '18:00', title: 'Celebration begins', location: data.venueName || 'Main Hall' }
      ]
    };
    setEvents(prev => [newEvent, ...prev]);

    // Push welcoming notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Celebration Created',
      description: `"${newEvent.title}" was added to your planner.`,
      timestamp: 'Just now',
      type: 'milestone',
      read: false,
      eventId: newEvent.id,
    };
    setNotifications(prev => [newNotif, ...prev]);
    addToast('success', 'Celebration Created', `"${newEvent.title}" is ready in your planner.`);

    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CelebrationEvent>) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        const updated = { ...e, ...updates };
        return updated;
      }
      return e;
    }));
    addToast('success', 'Event Updated', 'Changes were saved successfully.');
  };

  const duplicateEvent = (id: string): CelebrationEvent | null => {
    const original = events.find(e => e.id === id);
    if (!original) {
      addToast('error', 'Duplicate Failed', 'Original celebration could not be found.');
      return null;
    }

    const copy = duplicateEventModel(original);
    setEvents(prev => [copy, ...prev]);

    // Duplicate initial tasks for this event as well to speed up host planning!
    const originalTasks = tasks.filter(t => t.eventId === id);
    if (originalTasks.length > 0) {
      const clonedTasks: Task[] = originalTasks.map((t, idx) => ({
        ...t,
        id: `tsk-dup-${Date.now()}-${idx}`,
        eventId: copy.id,
        status: 'todo',
      }));
      setTasks(prev => [...clonedTasks, ...prev]);
    }

    // Add notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Celebration Duplicated',
      description: `Created a copy of "${original.title}".`,
      timestamp: 'Just now',
      type: 'milestone',
      read: false,
      eventId: copy.id,
    };
    setNotifications(prev => [newNotif, ...prev]);
    addToast('success', 'Celebration Duplicated', `Created "${copy.title}".`);

    return copy;
  };

  const deleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setGuests(prev => prev.filter(g => g.eventId !== id));
    setBudgets(prev => prev.filter(b => b.eventId !== id));
    setTasks(prev => prev.filter(t => t.eventId !== id));
    if (selectedEventId === id) {
      setSelectedEventId(null);
    }
    setDeleteConfirmEvent(null);
    addToast('info', 'Celebration Deleted', target ? `"${target.title}" and its records were removed.` : 'Event removed.');
  };

  // Guest Handlers
  const addGuest = (data: Omit<Guest, 'id'>): Guest => {
    const newGuest: Guest = {
      ...data,
      id: `gst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      invitationSentDate: new Date().toISOString().split('T')[0],
    };
    setGuests(prev => [newGuest, ...prev]);
    addToast('success', 'Guest Added', `${newGuest.fullName} added to the guest ledger.`);
    return newGuest;
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    addToast('success', 'Guest Updated', 'RSVP details updated.');
  };

  const deleteGuest = (id: string) => {
    setGuests(prev => prev.filter(g => g.id !== id));
    addToast('info', 'Guest Removed', 'Guest entry was removed.');
  };

  // Budget Handlers
  const addBudgetItem = (data: Omit<BudgetItem, 'id'>): BudgetItem => {
    const newItem: BudgetItem = {
      ...data,
      id: `bg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setBudgets(prev => [...prev, newItem]);
    addToast('success', 'Expense Logged', `${newItem.name} saved to budget ledger.`);
    return newItem;
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    addToast('success', 'Budget Updated', 'Expense line item updated.');
  };

  const deleteBudgetItem = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    addToast('info', 'Expense Removed', 'Line item removed from budget.');
  };

  // Task Handlers
  const addTask = (data: Omit<Task, 'id'>): Task => {
    const newTask: Task = {
      ...data,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setTasks(prev => [newTask, ...prev]);
    addToast('success', 'Task Created', `"${newTask.title}" added to checklist.`);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    addToast('success', 'Task Updated', 'Checklist item updated.');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addToast('info', 'Task Removed', 'Checklist item deleted.');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nextStatus: Task['status'] = t.status === 'completed' ? 'todo' : 'completed';
      return { ...t, status: nextStatus };
    }));
  };

  // Notification Handlers
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('info', 'Notifications Cleared', 'All notifications marked as read.');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    addToast('info', 'Notifications Emptied', 'Notification drawer cleared.');
  };

  // State Resets
  const resetToDemoData = () => {
    setEvents(SEED_EVENTS);
    setGuests(SEED_GUESTS);
    setBudgets(SEED_BUDGETS);
    setTasks(SEED_TASKS);
    setNotifications(SEED_NOTIFICATIONS);
    setHostProfile(DEFAULT_PROFILE);
    setSelectedEventId(null);
    addToast('success', 'Demo Data Restored', 'Realistic celebrations and budgets reloaded.');
  };

  const clearAllData = () => {
    setEvents([]);
    setGuests([]);
    setBudgets([]);
    setTasks([]);
    setNotifications([]);
    setSelectedEventId(null);
    addToast('info', 'Data Cleared', 'Local storage emptied for testing empty states.');
  };

  return (
    <GatherlyContext.Provider
      value={{
        events,
        guests,
        budgets,
        tasks,
        notifications,
        activeView,
        setActiveView,
        selectedEventId,
        setSelectedEventId,
        searchQuery,
        setSearchQuery,
        isCreateEventModalOpen,
        setIsCreateEventModalOpen,
        toasts,
        addToast,
        removeToast,
        editingEvent,
        setEditingEvent,
        deleteConfirmEvent,
        setDeleteConfirmEvent,
        isHostProfileModalOpen,
        setIsHostProfileModalOpen,
        hostProfile,
        updateHostProfile,
        createEvent,
        updateEvent,
        deleteEvent,
        duplicateEvent,
        addGuest,
        updateGuest,
        deleteGuest,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </GatherlyContext.Provider>
  );
};

export const useGatherly = () => {
  const context = useContext(GatherlyContext);
  if (!context) {
    throw new Error('useGatherly must be used within a GatherlyProvider');
  }
  return context;
};
