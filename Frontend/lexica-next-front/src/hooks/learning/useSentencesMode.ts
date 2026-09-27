import { useEffect, useState } from 'react';
import {
  answerQuestion,
  createEntries,
  getProgress,
  selectNextQuestion,
  type Question,
} from '../../learning/sentences-mode';
import type { SentencesEntry } from '../../learning/types';
import { clearSession, loadSession, saveSession } from '../../services/session-storage';
import { useRegisterAnswer, type GetSetResponse } from '../api';
import { usePronunciation } from '../usePronunciation';

export function useSentencesMode(set: GetSetResponse) {
  const [entries, setEntries] = useState<SentencesEntry[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
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

    const saved = loadSession<SentencesEntry>(set.setId, 'sentences');
    if (saved && saved.length > 0) {
      setEntries(saved);
      setHasInitialized(true);
      generateNextQuestion(saved);
      return;
    }

    const initialEntries = createEntries(set.entries);
    setEntries(initialEntries);
    setHasInitialized(true);
    if (initialEntries.length > 0) {
      generateNextQuestion(initialEntries);
    }
  }, [set]);

  useEffect(() => {
    if (showFeedback && currentQuestion) {
      const timer = setTimeout(() => {
        playAudio();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showFeedback, currentQuestion, playAudio]);

  const generateNextQuestion = (
    currentEntries: SentencesEntry[],
    previous?: { word: string; sentenceIndex: number },
  ) => {
    const question = selectNextQuestion(currentEntries, previous);
    setCurrentQuestion(question);
    if (!question) {
      setIsComplete(true);
      if (set.setId) {
        clearSession(set.setId, 'sentences');
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
      saveSession(set.setId, set.name ?? '', 'sentences', result.entries);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setUserAnswer('');
    if (currentQuestion) {
      generateNextQuestion(entries, {
        word: currentQuestion.entry.word ?? '',
        sentenceIndex: currentQuestion.sentenceIndex,
      });
    } else {
      generateNextQuestion(entries);
    }
  };

  return {
    entries,
    hasInitialized,
    currentQuestion,
    userAnswer,
    setUserAnswer,
    showFeedback,
    isCorrect,
    isComplete,
    checkAnswer,
    nextQuestion,
    ...getProgress(entries),
  };
}
