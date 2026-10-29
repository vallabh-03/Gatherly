/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GatherlyProvider, useGatherly } from './context/GatherlyContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MobileNav } from './components/layout/MobileNav';

import { DashboardView } from './components/views/DashboardView';
import { EventsView } from './components/views/EventsView';
import { CalendarView } from './components/views/CalendarView';
import { GuestsView } from './components/views/GuestsView';
import { BudgetView } from './components/views/BudgetView';
import { TasksView } from './components/views/TasksView';
import { SettingsView } from './components/views/SettingsView';

import { CreateEventModal } from './components/modals/CreateEventModal';
import { AddGuestModal } from './components/modals/AddGuestModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddTaskModal } from './components/modals/AddTaskModal';
import { EventDetailModal } from './components/modals/EventDetailModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { HostProfileModal } from './components/modals/HostProfileModal';
import { ToastContainer } from './components/common/ToastContainer';

import { CelebrationEvent } from './types';

const MainApp: React.FC = () => {
  const { activeView, events } = useGatherly();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Modals state
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CelebrationEvent | null>(null);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [targetModalEventId, setTargetModalEventId] = useState<string | null>(null);

  const handleOpenEventDetail = (event: CelebrationEvent) => {
    setSelectedEventForDetail(event);
  };

  const handleOpenEventDetailById = (eventId: string) => {
    const target = events.find(e => e.id === eventId);
    if (target) {
      setSelectedEventForDetail(target);
    }
  };

  const handleOpenAddGuest = (eventId?: string) => {
    setTargetModalEventId(eventId || null);
    setIsAddGuestModalOpen(true);
  };

  const handleOpenAddExpense = (eventId?: string) => {
    setTargetModalEventId(eventId || null);
    setIsAddExpenseModalOpen(true);
  };

  const handleOpenAddTask = (eventId?: string) => {
    setTargetModalEventId(eventId || null);
    setIsAddTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F0DF] text-[#1C1917] flex">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onClose={() => setIsMobileNavOpen(false)} 
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          onToggleMobileNav={() => setIsMobileNavOpen(true)}
          onOpenEventDetail={handleOpenEventDetailById}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-16">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenEventDetail={handleOpenEventDetail}
              onOpenAddGuest={() => handleOpenAddGuest()}
              onOpenAddExpense={() => handleOpenAddExpense()}
              onOpenAddTask={() => handleOpenAddTask()}
            />
          )}

          {activeView === 'events' && (
            <EventsView
              onOpenEventDetail={handleOpenEventDetail}
            />
          )}

          {activeView === 'calendar' && (
            <CalendarView
              onOpenEventDetail={handleOpenEventDetail}
            />
          )}

          {activeView === 'guests' && (
            <GuestsView
              onOpenAddGuest={() => handleOpenAddGuest()}
            />
          )}

          {activeView === 'budget' && (
            <BudgetView
              onOpenAddExpense={() => handleOpenAddExpense()}
            />
          )}

          {activeView === 'tasks' && (
            <TasksView
              onOpenAddTask={() => handleOpenAddTask()}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <CreateEventModal />

      <AddGuestModal
        isOpen={isAddGuestModalOpen}
        onClose={() => setIsAddGuestModalOpen(false)}
        defaultEventId={targetModalEventId}
      />

      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        defaultEventId={targetModalEventId}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        defaultEventId={targetModalEventId}
      />

      <EventDetailModal
        event={selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onOpenAddGuest={(evtId) => handleOpenAddGuest(evtId)}
        onOpenAddExpense={(evtId) => handleOpenAddExpense(evtId)}
        onOpenAddTask={(evtId) => handleOpenAddTask(evtId)}
      />

      <DeleteConfirmModal />

      <HostProfileModal />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <GatherlyProvider>
      <MainApp />
    </GatherlyProvider>
  );
}
