import { compareAnswers, serialize } from '../utils/utils.ts';
import type { FullModeEntry, LearningEntry } from './types';

type QuestionType = 'english-close' | 'native-close' | 'english-open' | 'native-open';

export interface Question {
  entry: FullModeEntry;
  entryIndex: number;
  type: QuestionType;
  question: string;
  questionWords: string;
  options?: string[];
  correctAnswers: string[];
}

export function createEntries(sourceEntries: LearningEntry[]): FullModeEntry[] {
  return sourceEntries.map((entry) => ({
    ...entry,
    englishCloseCounter: 0,
    nativeCloseCounter: 0,
    englishOpenCounter: 0,
    nativeOpenCounter: 0,
  }));
}

export function selectNextQuestion(
  currentEntries: FullModeEntry[],
  previousWord?: string,
  random = Math.random,
): Question | null {
  const shuffledEntries = [...currentEntries].sort(() => random() - 0.5);
  const selectedEntries = shuffledEntries.slice(0, Math.min(7, shuffledEntries.length));

  let eligibleEntries = selectedEntries.filter((entry) => {
    return (
      entry.englishCloseCounter < 1 ||
      entry.nativeCloseCounter < 1 ||
      entry.englishOpenCounter < 2 ||
      entry.nativeOpenCounter < 2
    );
  });

  if (eligibleEntries.length > 1 && previousWord) {
    eligibleEntries = eligibleEntries.filter((entry) => entry.word !== previousWord);
  }

  if (eligibleEntries.length === 0) {
    const allComplete = currentEntries.every(
      (entry) =>
        entry.englishCloseCounter >= 1 &&
        entry.nativeCloseCounter >= 1 &&
        entry.englishOpenCounter >= 2 &&
        entry.nativeOpenCounter >= 2,
    );

    if (allComplete) {
      return null;
    }

    return selectNextQuestion(currentEntries, previousWord, random);
  }

  const selectedEntry = eligibleEntries[Math.floor(random() * eligibleEntries.length)];
  const entryIndex = currentEntries.findIndex((e) => e.word === selectedEntry.word);

  const availableTypes: QuestionType[] = [];

  if (selectedEntry.englishCloseCounter < 1) {
    availableTypes.push('english-close');
  }

  if (selectedEntry.nativeCloseCounter < 1) {
    availableTypes.push('native-close');
  }

  if (availableTypes.length === 0) {
    if (selectedEntry.englishOpenCounter < 2) {
      availableTypes.push('english-open');
    }

    if (selectedEntry.nativeOpenCounter < 2) {
      availableTypes.push('native-open');
    }
  }

  const questionType: QuestionType = availableTypes[Math.floor(random() * availableTypes.length)];
  const question = generateQuestion(selectedEntry, entryIndex, questionType, currentEntries, random);
  return question;
}

function generateQuestion(
  entry: FullModeEntry,
  entryIndex: number,
  type: QuestionType,
  allEntries: FullModeEntry[],
  random: () => number,
): Question {
  switch (type) {
    case 'english-close': {
      const correctTranslation = entry.translations ?? [];
      const wrongOptions = allEntries
        .filter((e) => e.word !== entry.word)
        .flatMap((e) => serialize(e.translations))
        .slice(0, 3);

      const options = [serialize(correctTranslation), ...wrongOptions].sort(() => random() - 0.5);

      return {
        entry,
        entryIndex,
        type,
        question: `What does "${entry.word}" mean?`,
        questionWords: entry.word ?? '',
        options,
        correctAnswers: correctTranslation,
      };
    }

    case 'native-close': {
      const correctWord = entry.word;
      const wrongWords = allEntries
        .filter((e) => e.word !== entry.word)
        .map((e) => e.word || '')
        .filter((word) => word !== '')
        .slice(0, 3);

      const wordOptions = [correctWord || '', ...wrongWords].sort(() => random() - 0.5);
      const serializedNativeCloseTranslations = serialize(entry.translations);

      return {
        entry,
        entryIndex,
        type,
        question: `What is the English word for "${serializedNativeCloseTranslations}"?`,
        questionWords: serializedNativeCloseTranslations,
        options: wordOptions,
        correctAnswers: correctWord ? [correctWord] : [],
      };
    }

    case 'english-open':
      return {
        entry,
        entryIndex,
        type,
        question: `What does "${entry.word}" mean? (Type your answer)`,
        questionWords: entry.word ?? '',
        correctAnswers: entry.translations ?? [],
      };

    case 'native-open': {
      const serializedNativeOpenTranslations = serialize(entry.translations);

      return {
        entry,
        entryIndex,
        type,
        question: `What is the English word for "${serializedNativeOpenTranslations}"? (Type your answer)`,
        questionWords: serializedNativeOpenTranslations,
        correctAnswers: entry.word ? [entry.word] : [],
      };
    }

    default:
      throw new Error('Invalid question type');
  }
}

export function answerQuestion(entries: FullModeEntry[], currentQuestion: Question, userAnswer: string) {
  const isCorrect = compareAnswers(userAnswer, currentQuestion.correctAnswers);

  const answer = {
    modeType: 'full',
    questionType: currentQuestion.type,
    question: currentQuestion.questionWords,
    givenAnswer: userAnswer,
    expectedAnswer: serialize(currentQuestion.correctAnswers),
    isCorrect,
    wordId: currentQuestion.entry.wordId,
  };

  const updatedEntries = entries.map((entry) => ({ ...entry }));
  const entry = updatedEntries[currentQuestion.entryIndex];

  if (isCorrect) {
    switch (currentQuestion.type) {
      case 'english-close':
        entry.englishCloseCounter += 1;
        break;
      case 'native-close':
        entry.nativeCloseCounter += 1;
        break;
      case 'english-open':
        entry.englishOpenCounter += 1;
        break;
      case 'native-open':
        entry.nativeOpenCounter += 1;
        break;
    }
  } else {
    entry.englishCloseCounter = 0;
    entry.nativeCloseCounter = 0;
    entry.englishOpenCounter = 0;
    entry.nativeOpenCounter = 0;
  }

  return { entries: updatedEntries, isCorrect, answer };
}

export function getProgress(entries: FullModeEntry[]) {
  const totalRequired = entries.length * 6;
  const currentProgress = entries.reduce((sum, entry) => {
    return (
      sum +
      Math.min(entry.englishCloseCounter, 1) +
      Math.min(entry.nativeCloseCounter, 1) +
      Math.min(entry.englishOpenCounter, 2) +
      Math.min(entry.nativeOpenCounter, 2)
    );
  }, 0);

  return totalRequired > 0 ? (currentProgress / totalRequired) * 100 : 0;
}

export function getCompletedCount(currentEntries: FullModeEntry[]) {
  return currentEntries.filter(
    (entry) =>
      entry.englishCloseCounter >= 1 &&
      entry.nativeCloseCounter >= 1 &&
      entry.englishOpenCounter >= 2 &&
      entry.nativeOpenCounter >= 2,
  ).length;
}
