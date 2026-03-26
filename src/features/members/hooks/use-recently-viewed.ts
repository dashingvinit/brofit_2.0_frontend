import { useCallback } from 'react';

const STORAGE_KEY = 'brofit:recently_viewed_members';
const MAX_ITEMS = 10;

export interface RecentMember {
  id: string;
  name: string;
  phone: string;
  visitedAt: number;
}

function readFromStorage(): RecentMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentMember[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(items: RecentMember[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export function useRecentlyViewed() {
  const record = useCallback((member: Omit<RecentMember, 'visitedAt'>) => {
    const existing = readFromStorage().filter((m) => m.id !== member.id);
    const updated: RecentMember[] = [
      { ...member, visitedAt: Date.now() },
      ...existing,
    ].slice(0, MAX_ITEMS);
    writeToStorage(updated);
  }, []);

  const getRecent = useCallback((): RecentMember[] => {
    return readFromStorage();
  }, []);

  return { record, getRecent };
}
