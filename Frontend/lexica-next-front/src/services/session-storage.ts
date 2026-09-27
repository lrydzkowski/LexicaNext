import { links } from '@/config/links';
import type { FullModeEntry, OpenQuestionsEntry, SentencesEntry, SessionMode, SpellingEntry } from '@/learning/types';

export type { SessionMode } from '@/learning/types';

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

const KEY_PREFIX = 'lexica-session:v2:';

function buildUserPrefix(userId: string): string {
  return `${KEY_PREFIX}${encodeURIComponent(userId)}:`;
}

function buildKey(userId: string, setId: string, mode: SessionMode): string {
  return `${buildUserPrefix(userId)}${encodeURIComponent(setId)}:${mode}`;
}

export function saveSession(
  userId: string | undefined,
  setId: string,
  setName: string,
  mode: SessionMode,
  entries: ModeEntriesDto,
): void {
  if (!userId) {
    return;
  }

  try {
    const data: SessionData = {
      setId,
      setName,
      mode,
      timestamp: Date.now(),
      entries,
    };
    localStorage.setItem(buildKey(userId, setId, mode), JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function loadSession<T>(userId: string | undefined, setId: string, mode: SessionMode): T[] | null {
  if (!userId) {
    return null;
  }

  try {
    const raw = localStorage.getItem(buildKey(userId, setId, mode));
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

export function clearSession(userId: string | undefined, setId: string, mode: SessionMode): void {
  if (!userId) {
    return;
  }

  try {
    localStorage.removeItem(buildKey(userId, setId, mode));
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

export function findAllSessions(userId: string | undefined): SessionSummary[] {
  if (!userId) {
    return [];
  }

  const sessions: SessionSummary[] = [];

  try {
    const userPrefix = buildUserPrefix(userId);
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(userPrefix)) {
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
  switch (setId) {
    case 'practice:random':
      return links.randomOpenQuestionsPractice.getUrl();
    case 'practice:weakest':
      return links.weakestOpenQuestionsPractice.getUrl();
  }

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
