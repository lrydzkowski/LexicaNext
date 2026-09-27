import type { LearningEntry, SpellingEntry } from './types';

export function createEntries(sourceEntries: LearningEntry[], random = Math.random): SpellingEntry[] {
  return [...sourceEntries].sort(() => random() - 0.5).map((entry) => ({ ...entry, counter: 0 }));
}

export function selectNextEntryIndex(
  entries: SpellingEntry[],
  currentEntryIndex: number,
  random = Math.random,
): number | null {
  let remainingEntries = entries.filter((entry) => entry.counter < 2);
  if (remainingEntries.length === 0) {
    return null;
  }

  if (remainingEntries.length > 1) {
    const currentWord = entries[currentEntryIndex]?.word;
    remainingEntries = remainingEntries.filter((entry) => entry.word !== currentWord);
  }

  const shuffled = remainingEntries.sort(() => random() - 0.5);
  const nextEntry = shuffled[0];
  return entries.findIndex((entry) => entry.word === nextEntry.word);
}

function updateCounter(entries: SpellingEntry[], entryIndex: number, correct: boolean): SpellingEntry[] {
  return entries.map((entry, index) =>
    index === entryIndex ? { ...entry, counter: correct ? entry.counter + 1 : 0 } : entry,
  );
}

export function answerQuestion(entries: SpellingEntry[], entryIndex: number, userInput: string) {
  const currentEntry = entries[entryIndex];
  const isCorrect = userInput.trim().toLowerCase() === (currentEntry.word || '').toLowerCase();
  const answer = {
    modeType: 'spelling',
    questionType: 'spelling',
    question: currentEntry.word ?? '',
    givenAnswer: userInput,
    expectedAnswer: currentEntry.word ?? '',
    isCorrect,
    wordId: currentEntry.wordId,
  };

  return { entries: updateCounter(entries, entryIndex, isCorrect), isCorrect, answer };
}

export function skipUnavailablePronunciation(entries: SpellingEntry[], entryIndex: number): SpellingEntry[] {
  return updateCounter(entries, entryIndex, true);
}

export function getProgress(entries: SpellingEntry[]) {
  const totalPossiblePoints = entries.length * 2;
  const currentPoints = entries.reduce((sum, entry) => sum + Math.min(entry.counter, 2), 0);
  const progress = totalPossiblePoints > 0 ? (currentPoints / totalPossiblePoints) * 100 : 0;
  const completedCount = entries.filter((entry) => entry.counter >= 2).length;
  return { progress, completedCount };
}
