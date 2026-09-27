import { compareAnswers, serialize } from '../utils/utils.ts';
import type { LearningEntry, OpenQuestionsEntry } from './types';

type QuestionType = 'english-open' | 'native-open';

export interface Question {
  entry: OpenQuestionsEntry;
  entryIndex: number;
  type: QuestionType;
  question: string;
  questionWords: string;

  correctAnswers: string[];
}

export function createEntries(sourceEntries: LearningEntry[]): OpenQuestionsEntry[] {
  return sourceEntries.map((entry) => ({
    ...entry,
    englishOpenCounter: 0,
    nativeOpenCounter: 0,
  }));
}

export function selectNextQuestion(
  currentEntries: OpenQuestionsEntry[],
  previousWord?: string,
  random = Math.random,
): Question | null {
  const shuffledEntries = [...currentEntries].sort(() => random() - 0.5);

  let eligibleEntries = shuffledEntries.filter((entry) => {
    return entry.englishOpenCounter < 2 || entry.nativeOpenCounter < 2;
  });

  if (eligibleEntries.length > 1 && previousWord) {
    eligibleEntries = eligibleEntries.filter((entry) => entry.word !== previousWord);
  }

  if (eligibleEntries.length === 0) {
    return null;
  }

  const selectedEntry = eligibleEntries[0];
  const entryIndex = currentEntries.findIndex((e) => e.word === selectedEntry.word);

  const availableTypes: QuestionType[] = [];

  if (selectedEntry.englishOpenCounter < 2) {
    availableTypes.push('english-open');
  }

  if (selectedEntry.nativeOpenCounter < 2) {
    availableTypes.push('native-open');
  }

  const questionType: QuestionType = availableTypes[Math.floor(random() * availableTypes.length)];
  const question = generateQuestion(selectedEntry, entryIndex, questionType);
  return question;
}

function generateQuestion(entry: OpenQuestionsEntry, entryIndex: number, type: QuestionType): Question {
  switch (type) {
    case 'english-open':
      return {
        entry,
        entryIndex,
        type,
        question: `What does "${entry.word}" mean?`,
        questionWords: entry.word ?? '',
        correctAnswers: entry.translations ?? [],
      };

    case 'native-open': {
      const serializedTranslations = serialize(entry.translations);

      return {
        entry,
        entryIndex,
        type,
        question: `What is the English word for "${serializedTranslations}"?`,
        questionWords: serializedTranslations,
        correctAnswers: entry.word ? [entry.word] : [],
      };
    }

    default:
      throw new Error('Invalid question type');
  }
}

export function answerQuestion(entries: OpenQuestionsEntry[], currentQuestion: Question, userAnswer: string) {
  const isCorrect = compareAnswers(userAnswer, currentQuestion.correctAnswers);

  const answer = {
    modeType: 'open-questions',
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
      case 'english-open':
        entry.englishOpenCounter += 1;
        break;
      case 'native-open':
        entry.nativeOpenCounter += 1;
        break;
    }
  } else {
    entry.englishOpenCounter = 0;
    entry.nativeOpenCounter = 0;
  }

  return { entries: updatedEntries, isCorrect, answer };
}

export function getProgress(entries: OpenQuestionsEntry[]) {
  const totalRequired = entries.length * 4;
  const currentProgress = entries.reduce((sum, entry) => {
    return sum + Math.min(entry.englishOpenCounter, 2) + Math.min(entry.nativeOpenCounter, 2);
  }, 0);

  return totalRequired > 0 ? (currentProgress / totalRequired) * 100 : 0;
}

export function getCompletedCount(currentEntries: OpenQuestionsEntry[]) {
  return currentEntries.filter((entry) => entry.englishOpenCounter >= 2 && entry.nativeOpenCounter >= 2).length;
}
