import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Check, 
  Clock, 
  X, 
  Trash2, 
  UtensilsCrossed, 
  Send, 
  AlertCircle,
  Sparkles,
  Download
} from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { RSVPStatus, Guest } from '../../types';
import { calculateGuestStats } from '../../utils/calculations';

interface GuestsViewProps {
  onOpenAddGuest: () => void;
}

export const GuestsView: React.FC<GuestsViewProps> = ({ onOpenAddGuest }) => {
  const { 
    guests, 
    events, 
    selectedEventId, 
    setSelectedEventId, 
    searchQuery, 
    updateGuest, 
    deleteGuest 
  } = useGatherly();

  const [rsvpFilter, setRsvpFilter] = useState<'all' | RSVPStatus>('all');
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  // Filter guests by selected event & search
  const currentEvent = events.find(e => e.id === selectedEventId);
  const eventFilteredGuests = selectedEventId 
    ? guests.filter(g => g.eventId === selectedEventId) 
    : guests;

  const filteredGuests = eventFilteredGuests.filter((g) => {
    const matchesRsvp = rsvpFilter === 'all' || g.rsvpStatus === rsvpFilter;
    const matchesSearch = !searchQuery.trim() ||
      g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.tableAssignment && g.tableAssignment.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRsvp && matchesSearch;
  });

  const stats = calculateGuestStats(eventFilteredGuests);

  // Count dietary restrictions
  const dietaryCounts: Record<string, number> = {};
  eventFilteredGuests.forEach(g => {
    if (g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase() !== 'none') {
      dietaryCounts[g.dietaryRestrictions] = (dietaryCounts[g.dietaryRestrictions] || 0) + 1;
    }
  });

  const handleSimulateSendReminders = () => {
    const pendingCount = eventFilteredGuests.filter(g => g.rsvpStatus === 'pending').length;
    setSimulationToast(
      `Demo Simulation: Simulated personalized RSVP follow-up invitations to ${pendingCount} pending guests. (Note: No actual external emails sent in local demo environment.)`
    );
    setTimeout(() => {
      setSimulationToast(null);
    }, 6000);
  };

  const handleExportCSV = () => {
    const headers = 'Name,Email,RSVP Status,Plus Ones,Dietary Notes,Table\n';
    const rows = filteredGuests.map(g => 
      `"${g.fullName}","${g.email}","${g.rsvpStatus}","${g.plusOneCount}","${g.dietaryRestrictions || ''}","${g.tableAssignment || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gatherly-guestlist-${selectedEventId || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>{currentEvent ? currentEvent.title : 'All Celebrations'}</span>
            <span aria-hidden="true">·</span>
            <span>Guest & RSVP Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tracking-tight">
            Guest List & RSVPs
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track confirmed attendees, companion plus-ones, meal requirements, and table seating assignments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            title="Download CSV for catering or printing"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleSimulateSendReminders}
            className="flex items-center gap-1.5 px-3 py-2 border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-900 rounded-xl text-xs font-semibold transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-violet-700" />
            <span>Remind Pending (Demo)</span>
          </button>

          <button
            onClick={onOpenAddGuest}
            className="flex items-center gap-1.5 bg-black hover:bg-stone-800 text-white text-xs font-semibold py-2 px-4 rounded-full transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-stone-300" />
            <span>Invite Guest</span>
          </button>
        </div>
      </div>

      {/* Simulation Feedback Toast */}
      {simulationToast && (
        <div className="p-3 bg-violet-50 border border-violet-200 rounded-2xl text-xs text-violet-900 flex items-start justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{simulationToast}</p>
          </div>
          <button
            onClick={() => setSimulationToast(null)}
            className="text-violet-400 hover:text-violet-700 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 block">Total Headcount</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-editorial text-stone-900 tabular-nums">
              {stats.totalHeadcount}
            </span>
            <span className="text-xs text-stone-400">attending & pending</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">Confirmed Attending</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-editorial text-emerald-800 tabular-nums">
              {stats.attendingHeadcount}
            </span>
            <span className="text-xs text-stone-400">guests</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 block">Awaiting RSVP</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-editorial text-amber-800 tabular-nums">
              {stats.pendingHeadcount}
            </span>
            <span className="text-xs text-stone-400">pending</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 block">Acceptance Rate</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-editorial text-stone-900 tabular-nums">
              {stats.acceptanceRate}%
            </span>
            <span className="text-xs text-stone-400">{stats.declinedHeadcount} declined</span>
          </div>
        </div>
      </div>

      {/* Dietary Special Notes Summary (if any) */}
      {Object.keys(dietaryCounts).length > 0 && (
        <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-stone-200/80 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-stone-800 mr-2">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
            <span>Catering & Dietary Summary:</span>
          </div>
          {Object.entries(dietaryCounts).map(([diet, count]) => (
            <span
              key={diet}
              className="bg-white border border-stone-200/80 px-2.5 py-1 rounded-lg text-stone-700 font-medium text-[11px] flex items-center gap-1 shadow-2xs"
            >
              <span>{diet}</span>
              <span className="font-bold text-stone-900 tabular-nums">({count})</span>
            </span>
          ))}
        </div>
      )}

      {/* Filter Tabs & Event Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/60 self-start">
          {[
            { id: 'all', label: `All (${eventFilteredGuests.length})` },
            { id: 'attending', label: `Attending (${eventFilteredGuests.filter(g => g.rsvpStatus === 'attending').length})` },
            { id: 'pending', label: `Pending (${eventFilteredGuests.filter(g => g.rsvpStatus === 'pending').length})` },
            { id: 'declined', label: `Declined (${eventFilteredGuests.filter(g => g.rsvpStatus === 'declined').length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRsvpFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                rsvpFilter === tab.id
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Celebration selector */}
        <div className="text-xs text-stone-500 flex items-center gap-2">
          <span>Showing:</span>
          <select
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(e.target.value || null)}
            className="px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 text-xs focus:outline-hidden"
          >
            <option value="">All Celebrations</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Guest Table */}
      {filteredGuests.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300 space-y-3">
          <Users className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No guests match the current filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Invite guests to keep track of confirmations and dietary requirements.
          </p>
          <button
            onClick={onOpenAddGuest}
            className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold"
          >
            Invite Guest
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3 font-semibold">Guest / Party</th>
                  <th className="px-4 py-3 font-semibold">Celebration</th>
                  <th className="px-4 py-3 font-semibold">RSVP Status</th>
                  <th className="px-4 py-3 font-semibold">Plus-Ones</th>
                  <th className="px-4 py-3 font-semibold">Dietary & Seating</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredGuests.map((guest) => {
                  const ev = events.find(e => e.id === guest.eventId);

                  return (
                    <tr key={guest.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-stone-900">{guest.fullName}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1.5">
                          <span>{guest.email}</span>
                          {guest.phone && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{guest.phone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Event */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-stone-800 truncate block max-w-[150px]">
                          {ev ? ev.title : 'Celebration'}
                        </span>
                      </td>

                      {/* RSVP Status Dropdown */}
                      <td className="px-4 py-3.5">
                        <select
                          value={guest.rsvpStatus}
                          onChange={(e) => updateGuest(guest.id, { rsvpStatus: e.target.value as RSVPStatus })}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border focus:outline-hidden ${
                            guest.rsvpStatus === 'attending'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : guest.rsvpStatus === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-stone-100 text-stone-600 border-stone-200'
                          }`}
                        >
                          <option value="attending">Attending</option>
                          <option value="pending">Pending</option>
                          <option value="declined">Declined</option>
                        </select>
                      </td>

                      {/* Plus-ones */}
                      <td className="px-4 py-3.5 tabular-nums">
                        {guest.plusOneCount > 0 ? (
                          <span className="font-semibold text-stone-800">
                            +{guest.plusOneCount} <span className="font-normal text-stone-400">({1 + guest.plusOneCount} total)</span>
                          </span>
                        ) : (
                          <span className="text-stone-400">Solo (1)</span>
                        )}
                      </td>

                      {/* Dietary & Seating */}
                      <td className="px-4 py-3.5">
                        <div>
                          {guest.dietaryRestrictions && guest.dietaryRestrictions !== 'None' ? (
                            <span className="text-amber-800 font-medium block">
                              {guest.dietaryRestrictions}
                            </span>
                          ) : (
                            <span className="text-stone-400">Standard menu</span>
                          )}
                          {guest.tableAssignment && (
                            <span className="text-[11px] text-stone-600 block mt-0.5">
                              {guest.tableAssignment}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => deleteGuest(guest.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
                          title="Delete guest entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
