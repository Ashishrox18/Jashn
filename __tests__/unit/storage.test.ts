import {
  safeGetStore,
  safeSetStore,
  getUserId,
  saveEvent,
  getEvent,
  listEvents,
  updateEventState,
  deleteEvent,
  exportAll,
  importAll,
  STORAGE_KEY,
  MAX_EVENTS,
} from '@/lib/storage';
import { EventRecord } from '@/types';
import { buildFallbackPlan } from '@/lib/fallbackPlan';

const sampleEvent: EventRecord = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: '2026-11-01T12:00:00Z',
  source: 'fallback',
  brief: {
    eventType: 'wedding',
    title: 'Aarav & Diya Wedding',
    eventDate: '2027-01-15',
    city: 'Jaipur',
    guestCount: 300,
    totalBudgetInr: 2000000,
    vibe: 'Classic Indian royal wedding',
    constraints: ['vegetarian_only'],
    weddingFunctions: ['sangeet', 'ceremony', 'reception'],
    honoreeAge: null,
    communityKind: null,
  },
  plan: buildFallbackPlan({
    eventType: 'wedding',
    title: 'Aarav & Diya Wedding',
    eventDate: '2027-01-15',
    city: 'Jaipur',
    guestCount: 300,
    totalBudgetInr: 2000000,
    vibe: 'Classic Indian royal wedding',
    constraints: ['vegetarian_only'],
    weddingFunctions: ['sangeet', 'ceremony', 'reception'],
    honoreeAge: null,
    communityKind: null,
  }),
  state: {
    spentByCategory: { catering: 50000 },
    completedTaskIds: ['wed-1'],
    vendorStatus: { catering: 'booked' },
  },
};

describe('Storage Layer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes a fresh valid store when storage is empty', () => {
    const store = safeGetStore();
    expect(store.version).toBe('1');
    expect(store.events).toEqual([]);
    expect(store.userId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('gracefully recovers when localStorage contains malformed JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, 'NOT_VALID_JSON{:::');
    const store = safeGetStore();
    expect(store.version).toBe('1');
    expect(store.events).toEqual([]);
  });

  it('resets store when schema validation fails (tampered fields)', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 'wrong_version', events: 'not-an-array' })
    );
    const store = safeGetStore();
    expect(store.version).toBe('1');
    expect(store.events).toEqual([]);
  });

  it('saves and retrieves an event successfully', () => {
    const result = saveEvent(sampleEvent);
    expect(result.success).toBe(true);

    const retrieved = getEvent(sampleEvent.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(sampleEvent.id);
    expect(retrieved?.brief.title).toBe(sampleEvent.brief.title);
  });

  it('enforces maximum event cap of 10 events', () => {
    for (let i = 0; i < MAX_EVENTS; i++) {
      const e: EventRecord = {
        ...sampleEvent,
        id: `00000000-0000-4000-a000-00000000000${i}`,
        brief: { ...sampleEvent.brief, title: `Event #${i}` },
      };
      const res = saveEvent(e);
      expect(res.success).toBe(true);
    }

    expect(listEvents().length).toBe(MAX_EVENTS);

    // 11th event attempt
    const extraEvent: EventRecord = {
      ...sampleEvent,
      id: '99999999-9999-4999-a999-999999999999',
      brief: { ...sampleEvent.brief, title: 'Excess Event' },
    };
    const extraRes = saveEvent(extraEvent);
    expect(extraRes.success).toBe(false);
    expect(extraRes.error).toContain('Maximum of 10 events reached');
  });

  it('updates event state immutably', () => {
    saveEvent(sampleEvent);

    const res = updateEventState(sampleEvent.id, (prev) => ({
      ...prev,
      spentByCategory: { ...prev.spentByCategory, catering: 75000 },
      completedTaskIds: [...prev.completedTaskIds, 'wed-2'],
    }));

    expect(res.success).toBe(true);

    const updated = getEvent(sampleEvent.id);
    expect(updated?.state.spentByCategory.catering).toBe(75000);
    expect(updated?.state.completedTaskIds).toContain('wed-2');
  });

  it('deletes an event cleanly', () => {
    saveEvent(sampleEvent);
    expect(listEvents().length).toBe(1);

    const deleted = deleteEvent(sampleEvent.id);
    expect(deleted).toBe(true);
    expect(listEvents().length).toBe(0);
  });

  it('exports and imports backup JSON with schema validation', () => {
    saveEvent(sampleEvent);
    const backupJson = exportAll();
    expect(backupJson).toContain(sampleEvent.id);

    // Clear storage
    window.localStorage.clear();
    expect(listEvents().length).toBe(0);

    // Import valid backup
    const importRes = importAll(backupJson);
    expect(importRes.success).toBe(true);
    expect(listEvents().length).toBe(1);
    expect(getEvent(sampleEvent.id)?.brief.title).toBe(sampleEvent.brief.title);
  });

  it('rejects tampered or corrupt backup imports', () => {
    const corruptJson = '{"version":"2","events":["invalid"]}';
    const res = importAll(corruptJson);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});

