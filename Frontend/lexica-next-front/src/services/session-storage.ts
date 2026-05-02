import { FullModeEntry } from '@/components/sets/modes/SetFullMode';
import { OpenQuestionsEntry } from '@/components/sets/modes/SetOnlyOpenQuestionsMode';
import { SentencesEntry } from '@/components/sets/modes/SetSentencesMode';
import { SpellingEntry } from '@/components/sets/modes/SetSpellingMode';
import type { EntryDto } from '../hooks/api';

export type SessionMode = 'spelling' | 'full' | 'open-questions' | 'sentences';
type ModeEntriesDto = SpellingEntry[] | OpenQuestionsEntry[] | FullModeEntry[] | SentencesEntry[];

export interface SessionData {
  setId: string;
  setName: string;
  mode: SessionMode;
  timestamp: number;
  entries: ModeEntriesDto;
}

export interface SessionSummary {
  setId: string;
  setName: string;
  mode: SessionMode;
  timestamp: number;
  totalEntries: number;
}

const KEY_PREFIX = 'lexica-session:';

function buildKey(setId: string, mode: SessionMode): string {
  return `${KEY_PREFIX}${setId}:${mode}`;
}

function buildKeyFromString(key: string): string {
  return `${KEY_PREFIX}${key}`;
}

export function saveSession(setId: string, setName: string, mode: SessionMode, entries: ModeEntriesDto): void {
  try {
    const data: SessionData = {
      setId,
      setName,
      mode,
      timestamp: Date.now(),
      entries,
    };
    localStorage.setItem(buildKey(setId, mode), JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function loadSession<T>(setId: string, mode: SessionMode): T[] | null {
  try {
    const raw = localStorage.getItem(buildKey(setId, mode));
    if (!raw) {
      return null;
    }

    const data: SessionData = JSON.parse(raw);
    return data.entries as T[];
  } catch (error) {
    console.error('Failed to load session:', error);

    return null;
  }
}

export function clearSession(setId: string, mode: SessionMode): void {
  try {
    localStorage.removeItem(buildKey(setId, mode));
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

export function saveSessionByKey(key: string, setName: string, mode: SessionMode, entries: ModeEntriesDto): void {
  try {
    const data: SessionData = {
      setId: key,
      setName,
      mode,
      timestamp: Date.now(),
      entries,
    };
    localStorage.setItem(buildKeyFromString(key), JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function loadSessionByKey<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(buildKeyFromString(key));
    if (!raw) {
      return null;
    }

    const data: SessionData = JSON.parse(raw);
    return data.entries as T[];
  } catch (error) {
    console.error('Failed to load session:', error);

    return null;
  }
}

export function clearSessionByKey(key: string): void {
  try {
    localStorage.removeItem(buildKeyFromString(key));
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

export function findAllSessions(): SessionSummary[] {
  const sessions: SessionSummary[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(KEY_PREFIX)) {
        continue;
      }

      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const data: SessionData = JSON.parse(raw);
      sessions.push({
        setId: data.setId,
        setName: data.setName,
        mode: data.mode,
        timestamp: data.timestamp,
        totalEntries: data.entries.length,
      });
    }
  } catch (error) {
    console.error('Failed to find all sessions:', error);

    return [];
  }

  return sessions.sort((a, b) => b.timestamp - a.timestamp);
}

export function validateSession(savedEntries: ModeEntriesDto, currentEntries: EntryDto[]): boolean {
  if (savedEntries.length !== currentEntries.length) {
    return false;
  }

  const savedWords = new Set(savedEntries.map((e) => e.word as string));
  const currentWords = new Set(currentEntries.map((e) => e.word));

  if (savedWords.size !== currentWords.size) {
    return false;
  }

  for (const word of currentWords) {
    if (word && !savedWords.has(word)) {
      return false;
    }
  }

  return true;
}

export function getModeLabel(mode: SessionMode): string {
  switch (mode) {
    case 'spelling':
      return 'Spelling Mode';
    case 'full':
      return 'Full Mode';
    case 'open-questions':
      return 'Open Questions Mode';
    case 'sentences':
      return 'Sentences Mode';
  }
}

export function getModeUrl(setId: string, mode: SessionMode): string {
  switch (mode) {
    case 'spelling':
      return `/sets/${setId}/spelling-mode`;
    case 'full':
      return `/sets/${setId}/full-mode`;
    case 'open-questions':
      return `/sets/${setId}/open-questions-mode`;
    case 'sentences':
      return `/sets/${setId}/sentences-mode`;
  }
}
