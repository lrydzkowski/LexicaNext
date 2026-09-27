import type { LearningEntry, SentencesEntry } from './types';

const MAX_SENTENCES_PER_ENTRY = 5;
const MASTERY_THRESHOLD = 2;
const BLANK_PLACEHOLDER = '_____';

export interface Question {
  entry: SentencesEntry;
  entryIndex: number;
  sentenceIndex: number;
  originalSentence: string;
  sentenceWithBlank: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildWholeWordRegex(word: string, flags: string): RegExp {
  return new RegExp(`\\b${escapeRegExp(word)}\\b`, flags);
}

function sentenceContainsWord(sentence: string, word: string): boolean {
  if (!word) {
    return false;
  }

  return buildWholeWordRegex(word, 'i').test(sentence);
}

function buildSentenceWithBlank(sentence: string, word: string): string {
  return sentence.replace(buildWholeWordRegex(word, 'i'), BLANK_PLACEHOLDER);
}

export function createEntries(rawEntries: LearningEntry[]): SentencesEntry[] {
  return rawEntries
    .map((entry) => {
      const sentences = entry.exampleSentences ?? [];
      const word = entry.word ?? '';
      const eligibleIndices = sentences
        .map((sentence, index) => ({ sentence, index }))
        .filter(({ sentence }) => sentenceContainsWord(sentence, word))
        .map(({ index }) => index);

      const selectedSentenceIndices = eligibleIndices.slice(0, MAX_SENTENCES_PER_ENTRY);
      const sentenceCounters: Record<number, number> = {};
      for (const index of selectedSentenceIndices) {
        sentenceCounters[index] = 0;
      }

      return {
        ...entry,
        selectedSentenceIndices,
        sentenceCounters,
      } satisfies SentencesEntry;
    })
    .filter((entry) => entry.selectedSentenceIndices.length > 0);
}

function collectEligibleQuestions(currentEntries: SentencesEntry[]): Question[] {
  const questions: Question[] = [];
  currentEntries.forEach((entry, entryIndex) => {
    for (const sentenceIndex of entry.selectedSentenceIndices) {
      const counter = entry.sentenceCounters[sentenceIndex] ?? 0;
      if (counter >= MASTERY_THRESHOLD) {
        continue;
      }

      const originalSentence = entry.exampleSentences?.[sentenceIndex];
      if (!originalSentence) {
        continue;
      }

      questions.push({
        entry,
        entryIndex,
        sentenceIndex,
        originalSentence,
        sentenceWithBlank: buildSentenceWithBlank(originalSentence, entry.word ?? ''),
      });
    }
  });

  return questions;
}

export function selectNextQuestion(
  currentEntries: SentencesEntry[],
  previous?: { word: string; sentenceIndex: number },
  random = Math.random,
): Question | null {
  let eligible = collectEligibleQuestions(currentEntries);

  if (eligible.length === 0) {
    return null;
  }

  if (eligible.length > 1 && previous) {
    const filteredSamePair = eligible.filter(
      (q) => !(q.entry.word === previous.word && q.sentenceIndex === previous.sentenceIndex),
    );
    if (filteredSamePair.length > 0) {
      eligible = filteredSamePair;
    }

    const filteredSameEntry = eligible.filter((q) => q.entry.word !== previous.word);
    if (filteredSameEntry.length > 0) {
      eligible = filteredSameEntry;
    }
  }

  const shuffled = [...eligible].sort(() => random() - 0.5);
  return shuffled[0];
}

export function answerQuestion(entries: SentencesEntry[], currentQuestion: Question, userAnswer: string) {
  const expected = (currentQuestion.entry.word ?? '').toLowerCase();
  const correct = userAnswer.trim().toLowerCase() === expected;

  const answer = {
    modeType: 'sentences',
    questionType: 'sentence-fill',
    question: currentQuestion.sentenceWithBlank,
    givenAnswer: userAnswer,
    expectedAnswer: currentQuestion.entry.word ?? '',
    isCorrect: correct,
    wordId: currentQuestion.entry.wordId,
  };

  const updatedEntries = entries.map((entry) => ({
    ...entry,
    sentenceCounters: { ...entry.sentenceCounters },
  }));
  const entry = updatedEntries[currentQuestion.entryIndex];
  const previousCounter = entry.sentenceCounters[currentQuestion.sentenceIndex] ?? 0;

  if (correct) {
    entry.sentenceCounters[currentQuestion.sentenceIndex] = Math.min(previousCounter + 1, MASTERY_THRESHOLD);
  } else {
    entry.sentenceCounters[currentQuestion.sentenceIndex] = 0;
  }

  return { entries: updatedEntries, isCorrect: correct, answer };
}

export function getProgress(entries: SentencesEntry[]) {
  const totalQuestions = entries.reduce((sum, entry) => sum + entry.selectedSentenceIndices.length, 0);

  const masteredQuestions = entries.reduce((sum, entry) => {
    return (
      sum +
      entry.selectedSentenceIndices.filter(
        (sentenceIndex) => (entry.sentenceCounters[sentenceIndex] ?? 0) >= MASTERY_THRESHOLD,
      ).length
    );
  }, 0);

  const totalProgressPoints = totalQuestions * MASTERY_THRESHOLD;
  const earnedProgressPoints = entries.reduce((sum, entry) => {
    return (
      sum +
      entry.selectedSentenceIndices.reduce(
        (entrySum, sentenceIndex) => entrySum + Math.min(entry.sentenceCounters[sentenceIndex] ?? 0, MASTERY_THRESHOLD),
        0,
      )
    );
  }, 0);

  const progress = totalProgressPoints > 0 ? (earnedProgressPoints / totalProgressPoints) * 100 : 0;

  return { totalQuestions, masteredQuestions, progress };
}
