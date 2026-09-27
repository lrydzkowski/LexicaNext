import type { components } from '../../api-types/api-types';

export type LearningEntry = components['schemas']['EntryDto'];
export type SessionMode = 'spelling' | 'full' | 'open-questions' | 'sentences';

export interface FullModeEntry extends LearningEntry {
  englishCloseCounter: number;
  nativeCloseCounter: number;
  englishOpenCounter: number;
  nativeOpenCounter: number;
}

export interface OpenQuestionsEntry extends LearningEntry {
  englishOpenCounter: number;
  nativeOpenCounter: number;
}

export interface SpellingEntry extends LearningEntry {
  counter: number;
}

export interface SentencesEntry extends LearningEntry {
  selectedSentenceIndices: number[];
  sentenceCounters: Record<number, number>;
}
