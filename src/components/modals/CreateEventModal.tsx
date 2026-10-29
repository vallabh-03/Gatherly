import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, DollarSign, Users, Clock, Sparkles, AlertCircle, History } from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { EventCategory, CelebrationEvent } from '../../types';
import { validateEventData, isPastDate } from '../../utils/calculations';

const THEME_COLORS = [
  { label: 'Royal Violet', hex: '#7C3AED' },
  { label: 'Sunset Coral', hex: '#F43F5E' },
  { label: 'Warm Amber', hex: '#D97706' },
  { label: 'Olive Garden', hex: '#059669' },
  { label: 'Twilight Indigo', hex: '#4F46E5' },
  { label: 'Linen Stone', hex: '#57534E' },
];

const CATEGORIES: { label: string; value: EventCategory }[] = [
  { label: 'Birthday', value: 'birthday' },
  { label: 'Wedding', value: 'wedding' },
  { label: 'College Fest', value: 'college_fest' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Family Gathering', value: 'family_gathering' },
  { label: 'Dinner Party', value: 'dinner' },
  { label: 'Baby Shower', value: 'baby_shower' },
  { label: 'Other', value: 'other' },
];

export const CreateEventModal: React.FC = () => {
  const { 
    isCreateEventModalOpen, 
    setIsCreateEventModalOpen, 
    editingEvent, 
    setEditingEvent, 
    createEvent, 
    updateEvent, 
    setSelectedEventId, 
    setActiveView 
  } = useGatherly();

  const isOpen = isCreateEventModalOpen || editingEvent !== null;

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('wedding');
  const [eventDate, setEventDate] = useState('2026-12-12');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('23:00');
  const [venueName, setVenueName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [targetBudget, setTargetBudget] = useState('10000');
  const [expectedGuestCount, setExpectedGuestCount] = useState('50');
  const [themeColor, setThemeColor] = useState('#7C3AED');
  const [initialMilestone, setInitialMilestone] = useState('Welcome cocktails & greetings');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Populate form if editing
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setCategory(editingEvent.category);
      setEventDate(editingEvent.eventDate);
      setStartTime(editingEvent.startTime || '17:00');
      setEndTime(editingEvent.endTime || '23:00');
      setVenueName(editingEvent.venueName);
      setLocation(editingEvent.location);
      setDescription(editingEvent.description);
      setTargetBudget(String(editingEvent.targetBudget));
      setExpectedGuestCount(String(editingEvent.expectedGuestCount));
      setThemeColor(editingEvent.themeColor || '#7C3AED');
      setFormErrors({});
    } else {
      // Default initial date 2 weeks from now
      setTitle('');
      setCategory('birthday');
      setEventDate('2026-11-28');
      setStartTime('18:00');
      setEndTime('23:00');
      setVenueName('');
      setLocation('');
      setDescription('');
      setTargetBudget('8000');
      setExpectedGuestCount('40');
      setThemeColor('#7C3AED');
      setInitialMilestone('Welcome reception & greetings');
      setFormErrors({});
    }
  }, [editingEvent, isCreateEventModalOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsCreateEventModalOpen(false);
    setEditingEvent(null);
    setFormErrors({});
  };

  const pastDateWarning = isPastDate(eventDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using pure testable helper
    const validation = validateEventData({
      title,
      eventDate,
      startTime,
      endTime,
      targetBudget,
      expectedGuestCount,
      venueName,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    if (editingEvent) {
      // Update existing celebration
      updateEvent(editingEvent.id, {
        title: title.trim(),
        category,
        eventDate,
        startTime,
        endTime,
        venueName: venueName.trim() || 'Private Venue',
        location: location.trim() || 'Host Residence',
        description: description.trim(),
        targetBudget: Number(targetBudget) || 0,
        expectedGuestCount: Number(expectedGuestCount) || 1,
        themeColor,
      });
      setSelectedEventId(editingEvent.id);
    } else {
      // Create new celebration
      const newEvt = createEvent({
        title: title.trim(),
        category,
        eventDate,
        startTime,
        endTime,
        venueName: venueName.trim() || 'Private Venue',
        location: location.trim() || 'Host Residence',
        description: description.trim() || 'A thoughtfully planned celebration with loved ones.',
        targetBudget: Number(targetBudget) || 5000,
        expectedGuestCount: Number(expectedGuestCount) || 30,
        themeColor,
        schedule: [
          { id: `sch-${Date.now()}-1`, time: startTime, title: initialMilestone || 'Celebration Begins', location: venueName || 'Venue' },
          { id: `sch-${Date.now()}-2`, time: endTime || '22:00', title: 'Farewell & Closing', location: venueName || 'Venue' },
        ],
      });
      setSelectedEventId(newEvt.id);
      setActiveView('events');
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" 
        onClick={handleClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-editorial">
                {editingEvent ? 'Edit Celebration Studio' : 'Plan a New Celebration'}
              </h2>
              <p className="text-xs text-stone-500">
                {editingEvent ? 'Update details, schedule limits, and theme palette.' : 'Coordinate guests, budgets, schedules, and checklist milestones.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* General Past Date Notice */}
          {pastDateWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Note: Selected date is in the past. This celebration will be saved as completed / archived.</span>
            </div>
          )}

          {/* Event Title */}
          <div>
            <label htmlFor="event-title" className="block font-semibold text-stone-700 mb-1">
              Celebration Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Liam's 40th Birthday Soirée, Annual College Fest 2026..."
              className={`w-full px-3.5 py-2.5 border rounded-xl text-stone-800 transition-colors ${
                formErrors.title ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-violet-600 focus:outline-hidden'
              }`}
            />
            {formErrors.title && (
              <span className="text-[11px] text-rose-600 mt-1 block flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {formErrors.title}
              </span>
            )}
          </div>

          {/* Category & Theme Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-category" className="block font-semibold text-stone-700 mb-1">Category</label>
              <select
                id="event-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800 bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Theme Accent</label>
              <div className="flex items-center gap-2 pt-1">
                {THEME_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setThemeColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full transition-transform ${themeColor === c.hex ? 'ring-2 ring-stone-900 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'}`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="event-date" className="block font-semibold text-stone-700 mb-1">
                Event Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="event-date"
                type="date"
                required
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  if (formErrors.eventDate) setFormErrors(prev => ({ ...prev, eventDate: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-xl text-stone-800 ${
                  formErrors.eventDate ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-violet-600'
                }`}
              />
              {formErrors.eventDate && (
                <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.eventDate}</span>
              )}
            </div>
            <div>
              <label htmlFor="event-start-time" className="block font-semibold text-stone-700 mb-1">Start Time</label>
              <input
                id="event-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
            <div>
              <label htmlFor="event-end-time" className="block font-semibold text-stone-700 mb-1">End Time</label>
              <input
                id="event-end-time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (formErrors.endTime) setFormErrors(prev => ({ ...prev, endTime: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-xl text-stone-800 ${
                  formErrors.endTime ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-violet-600'
                }`}
              />
              {formErrors.endTime && (
                <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.endTime}</span>
              )}
            </div>
          </div>

          {/* Venue & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-venue" className="block font-semibold text-stone-700 mb-1">Venue Name</label>
              <input
                id="event-venue"
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Meadowood Estate, The University Quad"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
            <div>
              <label htmlFor="event-location" className="block font-semibold text-stone-700 mb-1">City / Address</label>
              <input
                id="event-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Napa Valley, CA or Campus Grounds"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
          </div>

          {/* Budget & Guest targets with numeric validations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-budget" className="block font-semibold text-stone-700 mb-1">Planned Budget (INR · ₹)</label>
              <input
                id="event-budget"
                type="number"
                min="0"
                max="100000000"
                step="5000"
                value={targetBudget}
                onChange={(e) => {
                  setTargetBudget(e.target.value);
                  if (formErrors.targetBudget) setFormErrors(prev => ({ ...prev, targetBudget: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-xl text-stone-800 tabular-nums ${
                  formErrors.targetBudget ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {formErrors.targetBudget && (
                <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.targetBudget}</span>
              )}
            </div>
            <div>
              <label htmlFor="event-guests" className="block font-semibold text-stone-700 mb-1">Expected Guests</label>
              <input
                id="event-guests"
                type="number"
                min="1"
                max="50000"
                value={expectedGuestCount}
                onChange={(e) => {
                  setExpectedGuestCount(e.target.value);
                  if (formErrors.expectedGuestCount) setFormErrors(prev => ({ ...prev, expectedGuestCount: '' }));
                }}
                className={`w-full px-3 py-2 border rounded-xl text-stone-800 tabular-nums ${
                  formErrors.expectedGuestCount ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {formErrors.expectedGuestCount && (
                <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.expectedGuestCount}</span>
              )}
            </div>
          </div>

          {/* Vision / Description */}
          <div>
            <label htmlFor="event-description" className="block font-semibold text-stone-700 mb-1">Celebration Vision & Atmosphere</label>
            <textarea
              id="event-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dress code, catering cues, musical genres, special moments..."
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-stone-900 text-stone-800"
            />
          </div>

          {/* Initial milestone (for creation only) */}
          {!editingEvent && (
            <div>
              <label htmlFor="event-milestone" className="block font-semibold text-stone-700 mb-1">Opening Milestone</label>
              <input
                id="event-milestone"
                type="text"
                value={initialMilestone}
                onChange={(e) => setInitialMilestone(e.target.value)}
                placeholder="e.g. Welcome sparkling wine, Registration booth open..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-stone-900 text-stone-800"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-full font-medium transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black hover:bg-stone-800 text-white rounded-full font-semibold shadow-xs transition-colors text-xs"
            >
              {editingEvent ? 'Save Changes' : 'Create Celebration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
