export type EventCategory = 
  | 'birthday' 
  | 'wedding' 
  | 'college_fest' 
  | 'anniversary' 
  | 'family_gathering' 
  | 'dinner' 
  | 'baby_shower' 
  | 'other';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

export type RSVPStatus = 'attending' | 'pending' | 'declined';

export type BudgetCategory = 
  | 'venue' 
  | 'catering' 
  | 'photography' 
  | 'decor' 
  | 'music' 
  | 'attire' 
  | 'favors' 
  | 'stationery'
  | 'other';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
}

export interface CelebrationEvent {
  id: string;
  title: string;
  category: EventCategory;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "17:00"
  endTime?: string;
  venueName: string;
  location: string;
  description: string;
  targetBudget: number;
  expectedGuestCount: number;
  themeColor: string; // hex or color keyword
  coverEmojiOrSymbol?: string;
  schedule: ScheduleItem[];
  createdAt: string;
}

export interface Guest {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone?: string;
  rsvpStatus: RSVPStatus;
  plusOneCount: number;
  dietaryRestrictions?: string;
  tableAssignment?: string;
  invitationSentDate?: string;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  paid: boolean;
  vendor?: string;
  dueDate?: string;
  notes?: string;
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  category: 'logistics' | 'decor' | 'invitations' | 'vendors' | 'day_of';
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assigneeName?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'rsvp' | 'budget' | 'task' | 'milestone';
  read: boolean;
  eventId?: string;
}

export interface HostProfile {
  hostName: string;
  organization: string;
  email: string;
  phone: string;
  defaultLocation?: string;
  currency?: string;
}

export type ActiveView = 'dashboard' | 'events' | 'calendar' | 'tasks' | 'guests' | 'budget' | 'settings';
