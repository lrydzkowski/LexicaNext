import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  answerQuestion,
  createEntries,
  getCompletedCount,
  getProgress,
  selectNextQuestion,
  type Question,
} from '../../learning/full-mode';
import type { FullModeEntry } from '../../learning/types';
import { clearSession, loadSession, saveSession } from '../../services/session-storage';
import { useRegisterAnswer, type GetSetResponse } from '../api';
import { usePronunciation } from '../usePronunciation';

export function useFullMode(set: GetSetResponse) {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth0();
  const userId = isAuthenticated && !isAuthLoading ? user?.sub : undefined;
  const [entries, setEntries] = useState<FullModeEntry[]>([]);
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
    if (!set?.entries || !set.setId) {
      return;
    }

    const saved = loadSession<FullModeEntry>(userId, set.setId, 'full');
    if (saved && saved.length > 0) {
      setEntries(saved);
      generateNextQuestion(saved);
      return;
    }

    const initialEntries = createEntries(set.entries);
    setEntries(initialEntries);
    generateNextQuestion(initialEntries);
  }, [set, userId]);

  useEffect(() => {
    if (showFeedback && currentQuestion) {
      const timer = setTimeout(() => {
        playAudio();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showFeedback, currentQuestion, playAudio]);

  const generateNextQuestion = (currentEntries: FullModeEntry[], previousWord?: string) => {
    const question = selectNextQuestion(currentEntries, previousWord);
    setCurrentQuestion(question);
    if (!question) {
      setIsComplete(true);
      if (set.setId) {
        clearSession(userId, set.setId, 'full');
      }
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

    if (set?.setId) {
      saveSession(userId, set.setId, set.name ?? '', 'full', result.entries);
    }
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
