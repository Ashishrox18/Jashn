import { Store, EventRecord, EventState } from '@/types';
import { StoreSchema, EventRecordSchema, EventStateSchema } from '@/schemas/storage';

export const STORAGE_KEY = 'jashn_store_v1';
export const MAX_EVENTS = 10;
export const MAX_IMPORT_BYTES = 1024 * 1024; // 1 MB

/**
 * Robust UUID v4 generator safe across browser and server environments.
 */
export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC 4122 v4 compliant
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createFreshStore(userId?: string): Store {
  return {
    version: '1',
    userId: userId ?? generateUuid(),
    events: [],
  };
}

/**
 * Reads and validates the store from localStorage.
 * Guaranteed never to crash: on corruption, clears corrupted data and returns a fresh valid store.
 */
export function safeGetStore(): Store {
  if (typeof window === 'undefined') {
    return createFreshStore();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = createFreshStore();
      safeSetStore(fresh);
      return fresh;
    }

    const parsed = JSON.parse(raw);
    const result = StoreSchema.safeParse(parsed);

    if (!result.success) {
      console.warn('Jashn storage schema validation failed. Reinitializing store to avoid corruption.');
      window.localStorage.removeItem(STORAGE_KEY);
      const fresh = createFreshStore();
      safeSetStore(fresh);
      return fresh;
    }

    return result.data;
  } catch {
    console.warn('Jashn storage JSON parse failed. Resetting store.');
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    const fresh = createFreshStore();
    safeSetStore(fresh);
    return fresh;
  }
}

/**
 * Validates and writes store to localStorage.
 * Enforces Zod validation on write and guards against quota errors.
 */
export function safeSetStore(store: Store): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window is not defined' };
  }

  const validation = StoreSchema.safeParse(store);
  if (!validation.success) {
    const msg = validation.error.issues[0]?.message || 'Invalid store data';
    return { success: false, error: msg };
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validation.data));
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Storage quota exceeded';
    return { success: false, error: errorMsg };
  }
}

/**
 * Gets or creates the anonymous UUID for the current user.
 */
export function getUserId(): string {
  const store = safeGetStore();
  return store.userId;
}

/**
 * Returns all active events.
 */
export function listEvents(): EventRecord[] {
  return safeGetStore().events;
}

/**
 * Returns a specific event by ID or null.
 */
export function getEvent(id: string): EventRecord | null {
  const events = listEvents();
  return events.find((e) => e.id === id) ?? null;
}

/**
 * Saves a new event or updates an existing one. Enforces MAX_EVENTS cap.
 */
export function saveEvent(event: EventRecord): { success: boolean; error?: string } {
  const validation = EventRecordSchema.safeParse(event);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Invalid event record' };
  }

  const store = safeGetStore();
  const existingIndex = store.events.findIndex((e) => e.id === event.id);

  if (existingIndex >= 0) {
    // Update existing
    store.events[existingIndex] = validation.data;
  } else {
    // Create new: enforce cap of 10
    if (store.events.length >= MAX_EVENTS) {
      return { success: false, error: `Maximum of ${MAX_EVENTS} events reached. Please delete an older event to plan a new one.` };
    }
    store.events.unshift(validation.data);
  }

  return safeSetStore(store);
}

/**
 * Updates mutable event state (spent, completed tasks, vendor status) immutably.
 */
export function updateEventState(
  id: string,
  updater: (prev: EventState) => EventState
): { success: boolean; error?: string } {
  const store = safeGetStore();
  const event = store.events.find((e) => e.id === id);
  if (!event) {
    return { success: false, error: 'Event not found' };
  }

  const nextState = updater({ ...event.state });
  const validation = EventStateSchema.safeParse(nextState);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Invalid event state' };
  }

  event.state = validation.data;
  return safeSetStore(store);
}

/**
 * Deletes an event by ID.
 */
export function deleteEvent(id: string): boolean {
  const store = safeGetStore();
  const initialCount = store.events.length;
  store.events = store.events.filter((e) => e.id !== id);
  if (store.events.length === initialCount) {
    return false;
  }
  return safeSetStore(store).success;
}

/**
 * Exports complete store as formatted JSON.
 */
export function exportAll(): string {
  const store = safeGetStore();
  return JSON.stringify(store, null, 2);
}

/**
 * Imports store from JSON string. Validates schema and enforces size limits.
 */
export function importAll(jsonString: string): { success: boolean; error?: string } {
  if (jsonString.length > MAX_IMPORT_BYTES) {
    return { success: false, error: 'Backup file exceeds maximum allowed size (1 MB).' };
  }

  try {
    const parsed = JSON.parse(jsonString);
    const validation = StoreSchema.safeParse(parsed);
    if (!validation.success) {
      return { success: false, error: 'Invalid backup file structure or corrupted data.' };
    }

    return safeSetStore(validation.data);
  } catch {
    return { success: false, error: 'File is not valid JSON.' };
  }
}

