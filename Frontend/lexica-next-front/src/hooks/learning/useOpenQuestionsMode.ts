import { useEffect, useState } from 'react';
import {
  answerQuestion,
  createEntries,
  getCompletedCount,
  getProgress,
  selectNextQuestion,
  type Question,
} from '../../learning/open-questions-mode';
import type { OpenQuestionsEntry } from '../../learning/types';
import { clearSession, loadSession, saveSession } from '../../services/session-storage';
import { useRegisterAnswer, type EntryDto } from '../api';
import { usePronunciation } from '../usePronunciation';

export function useOpenQuestionsMode(sourceEntries: EntryDto[], sessionSetId: string, title: string) {
  const [entries, setEntries] = useState<OpenQuestionsEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const registerAnswer = useRegisterAnswer();

  const { playAudio } = usePronunciation(currentQuestion?.entry.word || '', currentQuestion?.entry.wordType, {
    autoPlay: false,
    enabled: !!currentQuestion?.entry.word,
  });

  useEffect(() => {
    if (!sourceEntries) {
      return;
    }

    const saved = loadSession<OpenQuestionsEntry>(sessionSetId, 'open-questions');
    if (saved && saved.length > 0) {
      setEntries(saved);
      generateNextQuestion(saved);
      return;
    }

    const initialEntries = createEntries(sourceEntries);
    setEntries(initialEntries);
    generateNextQuestion(initialEntries);
  }, [sourceEntries, sessionSetId]);

  useEffect(() => {
    if (showFeedback && currentQuestion) {
      const timer = setTimeout(() => {
        playAudio();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showFeedback, currentQuestion, playAudio]);

  const generateNextQuestion = (currentEntries: OpenQuestionsEntry[], previousWord?: string) => {
    const question = selectNextQuestion(currentEntries, previousWord);
    setCurrentQuestion(question);
    if (!question) {
      setIsComplete(true);
      clearSession(sessionSetId, 'open-questions');
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion) {
      return;
    }

    const result = answerQuestion(entries, currentQuestion, userAnswer);
    registerAnswer.mutate(result.answer);
    setIsCorrect(result.isCorrect);
    setShowFeedback(true);
    setEntries(result.entries);

    saveSession(sessionSetId, title, 'open-questions', result.entries);
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setUserAnswer('');
    generateNextQuestion(entries, currentQuestion?.entry.word);
  };

  return {
    entries,
    currentQuestion,
    userAnswer,
    setUserAnswer,
    showFeedback,
    isCorrect,
    isComplete,
    checkAnswer,
    nextQuestion,
    progress: getProgress(entries),
    completedCount: getCompletedCount(entries),
  };
}
