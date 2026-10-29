import { BudgetItem, Guest, Task, CelebrationEvent } from '../types';

export function calculateEventBudget(items: BudgetItem[], targetBudget: number = 0) {
  const totalEstimated = items.reduce((acc, item) => acc + (Number(item.estimatedCost) || 0), 0);
  const totalActual = items.reduce((acc, item) => acc + (Number(item.actualCost) || 0), 0);
  const totalPaid = items.filter(i => i.paid).reduce((acc, item) => acc + (Number(item.actualCost || item.estimatedCost) || 0), 0);
  const paidCount = items.filter(i => i.paid).length;
  
  const referenceBudget = targetBudget > 0 ? targetBudget : totalEstimated;
  const percentSpent = referenceBudget > 0 ? Math.min(100, Math.round((totalActual / referenceBudget) * 100)) : 0;
  const isOverBudget = totalActual > referenceBudget && referenceBudget > 0;
  const remainingBudget = Math.max(0, referenceBudget - totalActual);

  return {
    totalEstimated,
    totalActual,
    totalPaid,
    paidCount,
    totalItems: items.length,
    remainingBudget,
    percentSpent,
    isOverBudget,
    overAmount: isOverBudget ? totalActual - referenceBudget : 0,
  };
}

export function calculateGuestStats(guests: Guest[]) {
  const totalInvitedEntries = guests.length;
  // Total headcount includes primary guests + accepted/pending plus-ones
  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending');
  const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending');
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined');

  const attendingHeadcount = attendingGuests.reduce((acc, g) => acc + 1 + (Number(g.plusOneCount) || 0), 0);
  const pendingHeadcount = pendingGuests.reduce((acc, g) => acc + 1 + (Number(g.plusOneCount) || 0), 0);
  const declinedHeadcount = declinedGuests.reduce((acc, g) => acc + 1, 0);

  const totalPossibleHeadcount = attendingHeadcount + pendingHeadcount + declinedHeadcount;
  const acceptanceRate = totalPossibleHeadcount > 0 
    ? Math.round((attendingHeadcount / totalPossibleHeadcount) * 100) 
    : 0;

  return {
    totalInvitedEntries,
    attendingHeadcount,
    pendingHeadcount,
    declinedHeadcount,
    totalHeadcount: attendingHeadcount + pendingHeadcount,
    acceptanceRate,
  };
}

export function calculateTaskProgress(tasks: Task[]) {
  const total = tasks.length;
  if (total === 0) {
    return { total: 0, completed: 0, inProgress: 0, todo: 0, completionRate: 0 };
  }
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const completionRate = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    inProgress,
    todo,
    completionRate,
  };
}

export function getOverallMetrics(
  events: CelebrationEvent[],
  guests: Guest[],
  budgets: BudgetItem[],
  tasks: Task[]
) {
  const totalTargetBudget = events.reduce((sum, e) => sum + (Number(e.targetBudget) || 0), 0);
  const totalActualSpend = budgets.reduce((sum, b) => sum + (Number(b.actualCost) || 0), 0);
  const guestStats = calculateGuestStats(guests);
  const taskProgress = calculateTaskProgress(tasks);

  return {
    upcomingEventsCount: events.length,
    totalTargetBudget,
    totalActualSpend,
    budgetSpentPercentage: totalTargetBudget > 0 ? Math.round((totalActualSpend / totalTargetBudget) * 100) : 0,
    totalGuestsAttending: guestStats.attendingHeadcount,
    totalGuestsPending: guestStats.pendingHeadcount,
    pendingTasksCount: taskProgress.todo + taskProgress.inProgress,
    taskCompletionRate: taskProgress.completionRate,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatEventDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysUntil(dateString: string): number {
  if (!dateString) return 0;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return 0;
  
  const targetDate = new Date(year, month - 1, day).getTime();
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  const diffTime = targetDate - todayMidnight;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isPastDate(dateString: string): boolean {
  if (!dateString) return false;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return false;
  const eventDate = new Date(year, month - 1, day, 23, 59, 59).getTime();
  const now = new Date().getTime();
  return eventDate < now;
}

export function validateEventData(data: {
  title?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  targetBudget?: number | string;
  expectedGuestCount?: number | string;
  venueName?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Celebration title is required.';
  } else if (data.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters.';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Title must be under 100 characters.';
  }

  if (!data.eventDate || !data.eventDate.trim()) {
    errors.eventDate = 'Event date is required.';
  } else {
    const parts = data.eventDate.split('-');
    if (parts.length !== 3 || isNaN(Number(parts[0])) || isNaN(Number(parts[1])) || isNaN(Number(parts[2]))) {
      errors.eventDate = 'Valid date (YYYY-MM-DD) is required.';
    }
  }

  const budgetNum = Number(data.targetBudget);
  if (isNaN(budgetNum) || budgetNum < 0) {
    errors.targetBudget = 'Budget must be a non-negative number.';
  } else if (budgetNum > 10000000) {
    errors.targetBudget = 'Budget cannot exceed $10,000,000.';
  }

  const guestNum = Number(data.expectedGuestCount);
  if (isNaN(guestNum) || guestNum < 1) {
    errors.expectedGuestCount = 'Expected guest count must be at least 1.';
  } else if (guestNum > 50000) {
    errors.expectedGuestCount = 'Guest count cannot exceed 50,000.';
  }

  if (data.startTime && data.endTime) {
    if (data.startTime >= data.endTime) {
      errors.endTime = 'End time must be later than start time.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function duplicateEventModel(event: CelebrationEvent): CelebrationEvent {
  const newId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const clonedSchedule = (event.schedule || []).map((s, idx) => ({
    ...s,
    id: `sch-dup-${Date.now()}-${idx}`,
  }));

  return {
    ...event,
    id: newId,
    title: `${event.title} (Copy)`,
    schedule: clonedSchedule,
    createdAt: new Date().toISOString().split('T')[0],
  };
}

export function searchAllRecords(
  events: CelebrationEvent[],
  guests: Guest[],
  tasks: Task[],
  query: string
) {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) {
    return { events: [], guests: [], tasks: [], totalMatches: 0 };
  }

  const matchedEvents = events.filter(e => 
    e.title.toLowerCase().includes(cleanQ) ||
    e.venueName.toLowerCase().includes(cleanQ) ||
    e.location.toLowerCase().includes(cleanQ) ||
    e.category.toLowerCase().includes(cleanQ)
  );

  const matchedGuests = guests.filter(g =>
    g.fullName.toLowerCase().includes(cleanQ) ||
    g.email.toLowerCase().includes(cleanQ) ||
    (g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase().includes(cleanQ)) ||
    (g.tableAssignment && g.tableAssignment.toLowerCase().includes(cleanQ))
  );

  const matchedTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(cleanQ) ||
    t.category.toLowerCase().includes(cleanQ) ||
    (t.assigneeName && t.assigneeName.toLowerCase().includes(cleanQ))
  );

  return {
    events: matchedEvents,
    guests: matchedGuests,
    tasks: matchedTasks,
    totalMatches: matchedEvents.length + matchedGuests.length + matchedTasks.length,
  };
}

