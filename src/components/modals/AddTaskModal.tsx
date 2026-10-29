import React, { useState } from 'react';
import { X, CheckSquare, Calendar, User, Flag } from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { TaskPriority } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventId?: string | null;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, defaultEventId }) => {
  const { events, selectedEventId, addTask } = useGatherly();

  const initialEventId = defaultEventId || selectedEventId || (events[0]?.id || '');
  const [eventId, setEventId] = useState(initialEventId);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'logistics' | 'decor' | 'invitations' | 'vendors' | 'day_of'>('logistics');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('2026-11-15');
  const [assigneeName, setAssigneeName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventId) return;

    addTask({
      eventId,
      title: title.trim(),
      category,
      priority,
      status: 'todo',
      dueDate,
      assigneeName: assigneeName.trim() || undefined,
    });

    onClose();
    setTitle('');
    setAssigneeName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-editorial">Add Checklist Item</h2>
              <p className="text-xs text-stone-500">Track deadlines, vendor coordination, and tasks.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50" aria-label="Close dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Celebration</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-stone-800"
              required
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Task Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Confirm flower arrangement delivery with Botanique..."
              className="w-full px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-stone-800"
              >
                <option value="logistics">Logistics & Venue</option>
                <option value="vendors">Vendor Coordination</option>
                <option value="invitations">Invitations & RSVP</option>
                <option value="decor">Decor & Styling</option>
                <option value="day_of">Day-of Run Sheet</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Priority Urgency</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-stone-800"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-800 focus:outline-hidden focus:border-violet-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Assigned Lead / Helper</label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="e.g. Clara, Julian, Maid of Honor"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-800 focus:outline-hidden focus:border-violet-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold shadow-xs"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
