import React, { useState } from 'react';
import { X, User, Building, Mail, Phone, RefreshCw, Trash2, Sparkles, ShieldCheck } from 'lucide-react';
import { useGatherly } from '../../context/GatherlyContext';
import { formatCurrency } from '../../utils/calculations';

export const HostProfileModal: React.FC = () => {
  const { 
    isHostProfileModalOpen, 
    setIsHostProfileModalOpen, 
    hostProfile, 
    updateHostProfile,
    events,
    guests,
    budgets,
    resetToDemoData,
    clearAllData
  } = useGatherly();

  const [hostName, setHostName] = useState(hostProfile.hostName);
  const [organization, setOrganization] = useState(hostProfile.organization);
  const [email, setEmail] = useState(hostProfile.email);
  const [phone, setPhone] = useState(hostProfile.phone);

  if (!isHostProfileModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHostProfile({
      hostName: hostName.trim() || 'Host Coordinator',
      organization: organization.trim() || 'Gatherly Suite',
      email: email.trim() || 'host@gatherly.suite',
      phone: phone.trim() || '',
    });
    setIsHostProfileModalOpen(false);
  };

  const totalBudgetTracked = events.reduce((sum, e) => sum + (e.targetBudget || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" 
        onClick={() => setIsHostProfileModalOpen(false)}
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs">
              G
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-editorial">Host Suite & Preferences</h2>
              <p className="text-xs text-stone-500">Manage celebration coordinator profile and local data.</p>
            </div>
          </div>
          <button
            onClick={() => setIsHostProfileModalOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-stone-200/70 text-center">
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Events</span>
              <span className="text-base font-bold text-stone-900 tabular-nums">{events.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Invited Guests</span>
              <span className="text-base font-bold text-stone-900 tabular-nums">{guests.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-semibold block">Budget Tracked</span>
              <span className="text-base font-bold text-stone-900 tabular-nums">{formatCurrency(totalBudgetTracked)}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Host Name</label>
            <input
              type="text"
              required
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Planning Agency / Studio</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-hidden focus:border-violet-600 text-stone-800"
              />
            </div>
          </div>

          {/* Local Storage & Reset Section */}
          <div className="pt-2 border-t border-stone-100">
            <span className="font-semibold text-stone-800 block mb-1">Storage Management</span>
            <p className="text-[11px] text-stone-500 mb-3 leading-relaxed">
              Your celebration plans are stored securely in your browser's local storage.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  resetToDemoData();
                  setIsHostProfileModalOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl font-medium text-stone-700 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                <span>Reload Demo Events</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllData();
                  setIsHostProfileModalOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-medium text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsHostProfileModalOpen(false)}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold text-xs shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
