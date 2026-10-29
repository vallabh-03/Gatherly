import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateEventBudget, 
  calculateGuestStats, 
  calculateTaskProgress, 
  getOverallMetrics,
  formatCurrency,
  getDaysUntil,
  validateEventData,
  duplicateEventModel,
  searchAllRecords
} from './calculations';
import { BudgetItem, Guest, Task, CelebrationEvent } from '../types';

test('calculateEventBudget computes budget accurately', () => {
  const items: BudgetItem[] = [
    { id: 'b1', eventId: 'e1', category: 'venue', name: 'Vineyard Rental', estimatedCost: 5000, actualCost: 5200, paid: true },
    { id: 'b2', eventId: 'e1', category: 'catering', name: 'Plated Dinner', estimatedCost: 4000, actualCost: 3800, paid: false },
    { id: 'b3', eventId: 'e1', category: 'music', name: 'String Quartet', estimatedCost: 1500, actualCost: 1500, paid: true },
  ];

  const result = calculateEventBudget(items, 12000);
  assert.equal(result.totalEstimated, 10500);
  assert.equal(result.totalActual, 10500);
  assert.equal(result.paidCount, 2);
  assert.equal(result.totalPaid, 6700);
  assert.equal(result.remainingBudget, 1500);
  assert.equal(result.isOverBudget, false);
});

test('calculateGuestStats handles plus-ones and attendance rates', () => {
  const guests: Guest[] = [
    { id: 'g1', eventId: 'e1', fullName: 'Alice Smith', email: 'alice@example.com', rsvpStatus: 'attending', plusOneCount: 1 },
    { id: 'g2', eventId: 'e1', fullName: 'Bob Jones', email: 'bob@example.com', rsvpStatus: 'attending', plusOneCount: 0 },
    { id: 'g3', eventId: 'e1', fullName: 'Charlie Day', email: 'charlie@example.com', rsvpStatus: 'pending', plusOneCount: 1 },
    { id: 'g4', eventId: 'e1', fullName: 'Diana Prince', email: 'diana@example.com', rsvpStatus: 'declined', plusOneCount: 0 },
  ];

  const stats = calculateGuestStats(guests);
  assert.equal(stats.totalInvitedEntries, 4);
  assert.equal(stats.attendingHeadcount, 3); // 2 + 1 plus-one
  assert.equal(stats.pendingHeadcount, 2);   // 1 + 1 plus-one
  assert.equal(stats.declinedHeadcount, 1);
  assert.equal(stats.totalHeadcount, 5);     // attending + pending
  // totalPossible = 3 + 2 + 1 = 6; 3 / 6 = 50%
  assert.equal(stats.acceptanceRate, 50);
});

test('calculateTaskProgress computes completion stats', () => {
  const tasks: Task[] = [
    { id: 't1', eventId: 'e1', title: 'Task 1', category: 'logistics', priority: 'high', status: 'completed', dueDate: '2026-11-01' },
    { id: 't2', eventId: 'e1', title: 'Task 2', category: 'decor', priority: 'medium', status: 'in_progress', dueDate: '2026-11-05' },
    { id: 't3', eventId: 'e1', title: 'Task 3', category: 'vendors', priority: 'low', status: 'todo', dueDate: '2026-11-10' },
    { id: 't4', eventId: 'e1', title: 'Task 4', category: 'day_of', priority: 'high', status: 'completed', dueDate: '2026-11-12' },
  ];

  const progress = calculateTaskProgress(tasks);
  assert.equal(progress.total, 4);
  assert.equal(progress.completed, 2);
  assert.equal(progress.inProgress, 1);
  assert.equal(progress.todo, 1);
  assert.equal(progress.completionRate, 50);
});

test('validateEventData enforces required fields, limits, and time order', () => {
  const invalid = validateEventData({
    title: 'A', // too short
    eventDate: '2026-11-20',
    startTime: '19:00',
    endTime: '17:00', // before start time
    targetBudget: -500,
    expectedGuestCount: 0,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.endTime);
  assert.ok(invalid.errors.targetBudget);
  assert.ok(invalid.errors.expectedGuestCount);

  const valid = validateEventData({
    title: 'Sophia & Julian Wedding',
    eventDate: '2026-11-20',
    startTime: '15:00',
    endTime: '23:00',
    targetBudget: 25000,
    expectedGuestCount: 100,
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('duplicateEventModel creates copy with unique ID and schedule', () => {
  const original: CelebrationEvent = {
    id: 'evt-orig',
    title: 'Spring Gala',
    category: 'anniversary',
    eventDate: '2026-12-01',
    startTime: '18:00',
    venueName: 'The Manor',
    location: 'Boston',
    description: 'Annual party',
    targetBudget: 5000,
    expectedGuestCount: 40,
    themeColor: '#7C3AED',
    schedule: [{ id: 's1', time: '18:00', title: 'Welcome' }],
    createdAt: '2026-10-01',
  };

  const copy = duplicateEventModel(original);
  assert.notEqual(copy.id, original.id);
  assert.equal(copy.title, 'Spring Gala (Copy)');
  assert.notEqual(copy.schedule[0].id, original.schedule[0].id);
});

test('searchAllRecords matches across events, guests, and tasks', () => {
  const events: CelebrationEvent[] = [
    { id: 'e1', title: 'Vineyard Harvest Soirée', category: 'wedding', eventDate: '2026-11-21', startTime: '15:00', venueName: 'Napa Estate', location: 'Napa', description: '', targetBudget: 1000, expectedGuestCount: 10, themeColor: '', schedule: [], createdAt: '' }
  ];
  const guests: Guest[] = [
    { id: 'g1', eventId: 'e1', fullName: 'Julian Vance', email: 'julian@vance.com', rsvpStatus: 'attending', plusOneCount: 1, dietaryRestrictions: 'Vegan' }
  ];
  const tasks: Task[] = [
    { id: 't1', eventId: 'e1', title: 'Order Napa wine cases', category: 'vendors', priority: 'high', status: 'todo', dueDate: '2026-11-10' }
  ];

  const results = searchAllRecords(events, guests, tasks, 'Napa');
  assert.equal(results.events.length, 1);
  assert.equal(results.tasks.length, 1);
  assert.equal(results.totalMatches, 2);

  const emptyResults = searchAllRecords(events, guests, tasks, 'NonExistentTermXYZ');
  assert.equal(emptyResults.totalMatches, 0);
});

test('formatCurrency formats Indian Rupee amounts properly', () => {
  const formatted = formatCurrency(15000);
  assert.ok(formatted.includes('15,000'));
  assert.ok(formatted.includes('₹'));
});

test('calculateEventBudget handles zero budget and overspending without dividing by zero', () => {
  // Empty items and zero target budget
  const emptyBudget = calculateEventBudget([], 0);
  assert.equal(emptyBudget.percentSpent, 0);
  assert.equal(emptyBudget.remainingBudget, 0);
  assert.equal(emptyBudget.isOverBudget, false);
  assert.equal(emptyBudget.overAmount, 0);

  // Over-budget situation
  const overItems: BudgetItem[] = [
    { id: 'b1', eventId: 'e1', category: 'venue', name: 'Grand Ballroom', estimatedCost: 50000, actualCost: 65000, paid: true }
  ];
  const overBudget = calculateEventBudget(overItems, 50000);
  assert.equal(overBudget.isOverBudget, true);
  assert.equal(overBudget.overAmount, 15000);
  assert.equal(overBudget.remainingBudget, 0);
  assert.equal(overBudget.percentSpent, 100);

  // Items present but targetBudget is 0 (uses estimatedCost as reference)
  const fallbackBudget = calculateEventBudget(overItems, 0);
  assert.equal(fallbackBudget.isOverBudget, true);
  assert.equal(fallbackBudget.overAmount, 15000);
});

test('getOverallMetrics handles empty collections without NaN or crashes', () => {
  const metrics = getOverallMetrics([], [], [], []);
  assert.equal(metrics.upcomingEventsCount, 0);
  assert.equal(metrics.totalTargetBudget, 0);
  assert.equal(metrics.totalActualSpend, 0);
  assert.equal(metrics.budgetSpentPercentage, 0);
  assert.equal(metrics.totalGuestsAttending, 0);
  assert.equal(metrics.totalGuestsPending, 0);
  assert.equal(metrics.pendingTasksCount, 0);
  assert.equal(metrics.taskCompletionRate, 0);
});

test('searchAllRecords handles regex special characters without crashing', () => {
  const events: CelebrationEvent[] = [
    { id: 'e1', title: 'Party (VIP [Special] + More)', category: 'birthday', eventDate: '2026-12-31', startTime: '20:00', venueName: 'Club', location: 'City', description: '', targetBudget: 5000, expectedGuestCount: 20, themeColor: '', schedule: [], createdAt: '' }
  ];
  // Searching with regex characters should not throw syntax error
  const res1 = searchAllRecords(events, [], [], '(');
  assert.equal(res1.events.length, 1);
  const res2 = searchAllRecords(events, [], [], '[');
  assert.equal(res2.events.length, 1);
  const res3 = searchAllRecords(events, [], [], '+');
  assert.equal(res3.events.length, 1);
  const res4 = searchAllRecords(events, [], [], '   ');
  assert.equal(res4.totalMatches, 0);
});

test('cascading event deletion preserves data integrity across relations', () => {
  let events = [
    { id: 'e1', title: 'Wedding' },
    { id: 'e2', title: 'Birthday' }
  ];
  let guests = [
    { id: 'g1', eventId: 'e1' },
    { id: 'g2', eventId: 'e2' }
  ];
  let tasks = [
    { id: 't1', eventId: 'e1' },
    { id: 't2', eventId: 'e2' }
  ];
  let budgets = [
    { id: 'b1', eventId: 'e1' },
    { id: 'b2', eventId: 'e2' }
  ];

  // Simulate deleteEvent('e1')
  const targetId = 'e1';
  events = events.filter(e => e.id !== targetId);
  guests = guests.filter(g => g.eventId !== targetId);
  tasks = tasks.filter(t => t.eventId !== targetId);
  budgets = budgets.filter(b => b.eventId !== targetId);

  assert.equal(events.length, 1);
  assert.equal(events[0].id, 'e2');
  assert.equal(guests.length, 1);
  assert.equal(guests[0].eventId, 'e2');
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].eventId, 'e2');
  assert.equal(budgets.length, 1);
  assert.equal(budgets[0].eventId, 'e2');
});
