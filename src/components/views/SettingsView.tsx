import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Mail, 
  MapPin, 
  IndianRupee, 
  RefreshCw, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  CalendarDays,
  Users,
  Wallet
} from 'lucide-react';
import { useGatherly, STORAGE_KEYS } from '../../context/GatherlyContext';

export const SettingsView: React.FC = () => {
  const { 
    hostProfile, 
    updateHostProfile, 
    resetToDemoData, 
    clearAllData, 
    addToast,
    events,
    guests,
    tasks,
    budgets 
  } = useGatherly();

  const [name, setName] = useState(hostProfile.hostName || '');
  const [email, setEmail] = useState(hostProfile.email || '');
  const [phone, setPhone] = useState(hostProfile.phone || '');
  const [defaultCity, setDefaultCity] = useState(hostProfile.defaultLocation || 'Mumbai, Maharashtra');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateHostProfile({
      hostName: name.trim() || 'Celebration Host',
      email: email.trim(),
      phone: phone.trim(),
      defaultLocation: defaultCity.trim(),
      currency: 'INR',
    });
    setIsSaved(true);
    addToast('success', 'Profile Updated', 'Profile preferences updated successfully');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportData = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        hostProfile,
        events,
        guests,
        tasks,
        budgets,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gatherly-celebrations-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('info', 'Export Complete', 'Celebration data exported successfully');
    } catch {
      addToast('error', 'Export Failed', 'Failed to export celebration data');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.events && Array.isArray(parsed.events)) {
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(parsed.events));
          if (parsed.guests && Array.isArray(parsed.guests)) {
            localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(parsed.guests));
          }
          if (parsed.tasks && Array.isArray(parsed.tasks)) {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(parsed.tasks));
          }
          if (parsed.budgets && Array.isArray(parsed.budgets)) {
            localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(parsed.budgets));
          }
          if (parsed.hostProfile && typeof parsed.hostProfile === 'object') {
            localStorage.setItem(STORAGE_KEYS.HOST_PROFILE, JSON.stringify(parsed.hostProfile));
          }
          addToast('success', 'Import Successful', 'Celebration data restored.');
          setTimeout(() => {
            window.location.reload();
          }, 600);
        } else {
          addToast('error', 'Import Failed', 'Invalid backup file format');
        }
      } catch {
        addToast('error', 'Import Failed', 'Error reading backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
            <Settings className="w-3.5 h-3.5 text-stone-700" />
            <span>Preferences & Settings</span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500 font-normal">Manage your organizer profile and data</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 tracking-tight">
            Settings & Workspace
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Configure host details, Indian Rupee (INR ₹) currency formatting, celebration defaults, and data backups.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Host Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-[#FCFAF4] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm">
                  {name ? name[0] : 'H'}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">Host Profile</h2>
                  <p className="text-xs text-stone-500">Your details appear on invitations, summaries, and printouts.</p>
                </div>
              </div>
              {isSaved && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hostName" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Host / Organizer Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="hostName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Clara & Julian"
                      className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="hostEmail" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="hostEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="host@gatherly.app"
                      className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="hostPhone" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    id="hostPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="defaultCity" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Primary City / Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="defaultCity"
                      type="text"
                      value={defaultCity}
                      onChange={(e) => setDefaultCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru, Delhi"
                      className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-stone-900 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Currency & Financial Standards */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Currency Standard
                </label>
                <div className="p-3.5 bg-stone-100/80 rounded-2xl border border-stone-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white text-stone-800 flex items-center justify-center font-bold shadow-xs">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Indian Rupee (INR · ₹)</span>
                      <span className="text-[11px] text-stone-500">
                        Configured as the default currency across all celebration budgets, expenses, and invoices.
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-full bg-black text-white px-6 py-2.5 text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Backup & Data Management */}
          <div className="p-6 rounded-3xl bg-[#FCFAF4] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Data & Workspace Management</h2>
              <p className="text-xs text-stone-500">
                All data is safely persisted in your browser's local storage. You can export backups anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 text-stone-800 text-xs font-semibold transition-all group"
              >
                <Download className="w-4 h-4 text-stone-500 group-hover:text-black" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-400 text-stone-800 text-xs font-semibold transition-all cursor-pointer group">
                <Upload className="w-4 h-4 text-stone-500 group-hover:text-black" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Safe local storage with zero cloud tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetToDemoData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Reset Demo Data</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all celebrations? This cannot be undone.')) {
                      clearAllData();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Workspace Summary & Tips */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#FCFAF4] border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Workspace Overview</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200/60">
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <CalendarDays className="w-4 h-4 text-violet-600" />
                  <span>Celebrations</span>
                </div>
                <span className="font-bold text-xs text-stone-900">{events.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200/60">
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Guests on List</span>
                </div>
                <span className="font-bold text-xs text-stone-900">{guests.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200/60">
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>Expense Line Items</span>
                </div>
                <span className="font-bold text-xs text-stone-900">{budgets.length}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Planning Advice</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Confirm RSVPs at least 14 days before your celebration to lock in catering minimums and seating arrangements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
