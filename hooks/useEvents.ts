'use client';

import { useState, useEffect, useCallback } from 'react';
import { EventRecord } from '@/types';
import {
  listEvents,
  deleteEvent,
  exportAll,
  importAll,
} from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';

export function useEvents() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { showToast } = useToast();

  const refreshEvents = useCallback(() => {
    const data = listEvents();
    setEvents(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const removeEvent = useCallback(
    (id: string) => {
      const success = deleteEvent(id);
      if (success) {
        refreshEvents();
        showToast('Event deleted successfully', 'info');
      } else {
        showToast('Failed to delete event', 'error');
      }
      return success;
    },
    [refreshEvents, showToast]
  );

  const exportBackup = useCallback(() => {
    try {
      const json = exportAll();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jashn_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup downloaded successfully', 'success');
    } catch {
      showToast('Failed to export backup', 'error');
    }
  }, [showToast]);

  const importBackup = useCallback(
    (fileContent: string) => {
      const res = importAll(fileContent);
      if (res.success) {
        refreshEvents();
        showToast('Backup imported successfully!', 'success');
        return true;
      } else {
        showToast(res.error || 'Invalid backup file', 'error');
        return false;
      }
    },
    [refreshEvents, showToast]
  );

  return {
    events,
    isLoaded,
    refreshEvents,
    removeEvent,
    exportBackup,
    importBackup,
  };
}

