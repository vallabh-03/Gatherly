import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, UtensilsCrossed, Users } from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { RSVPStatus } from '../../types';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventId?: string | null;
}

export const AddGuestModal: React.FC<AddGuestModalProps> = ({ isOpen, onClose, defaultEventId }) => {
  const { events, selectedEventId, addGuest } = useGatherly();

  const initialEventId = defaultEventId || selectedEventId || (events[0]?.id || '');
  const [eventId, setEventId] = useState(initialEventId);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('pending');
  const [plusOneCount, setPlusOneCount] = useState('0');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('None');
  const [tableAssignment, setTableAssignment] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !eventId) return;

    addGuest({
      eventId,
      fullName: fullName.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: phone.trim() || undefined,
      rsvpStatus,
      plusOneCount: Number(plusOneCount) || 0,
      dietaryRestrictions: dietaryRestrictions.trim() || 'None',
      tableAssignment: tableAssignment.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-editorial">Invite Guest</h2>
              <p className="text-xs text-stone-500">Record RSVP status, dietary notes, and seating.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50" aria-label="Close dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Target Event */}
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

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Guest Name / Couple <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Arthur & Penelope Miller"
              className="w-full px-3.5 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="penelope@example.com"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Mobile / Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(415) 555-0192"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
          </div>

          {/* RSVP Status & Plus One */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">RSVP Status</label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RSVPStatus)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-stone-800"
              >
                <option value="attending">Confirmed Attending</option>
                <option value="pending">Awaiting RSVP (Pending)</option>
                <option value="declined">Regretfully Declined</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Plus-One Companions</label>
              <select
                value={plusOneCount}
                onChange={(e) => setPlusOneCount(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white text-stone-800"
              >
                <option value="0">No Plus-One (1 guest total)</option>
                <option value="1">+1 Guest (2 guests total)</option>
                <option value="2">+2 Guests (3 guests total)</option>
                <option value="3">+3 Guests (Family group)</option>
              </select>
            </div>
          </div>

          {/* Dietary Restrictions & Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Dietary Preferences</label>
              <input
                type="text"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="Vegetarian, Gluten-Free, Allergies..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Table / Seating Assignment</label>
              <input
                type="text"
                value={tableAssignment}
                onChange={(e) => setTableAssignment(e.target.value)}
                placeholder="Table 4 - Garden Lawn"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Guest Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Arriving early with speech, special accommodations..."
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
            />
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
              Save Guest Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
