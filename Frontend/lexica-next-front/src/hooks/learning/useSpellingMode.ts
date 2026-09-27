import { useEffect, useState } from 'react';
import {
  answerQuestion,
  createEntries,
  getProgress,
  selectNextEntryIndex,
  skipUnavailablePronunciation,
} from '../../learning/spelling-mode';
import type { SpellingEntry } from '../../learning/types';
import { clearSession, loadSession, saveSession } from '../../services/session-storage';
import { useRegisterAnswer, type GetSetResponse } from '../api';
import { usePronunciation } from '../usePronunciation';

export function useSpellingMode(set: GetSetResponse) {
  const [entries, setEntries] = useState<SpellingEntry[]>([]);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [iteration, setIteration] = useState(0);
  const registerAnswer = useRegisterAnswer();
  const currentEntry = entries[currentEntryIndex];
  const {
    playAudio,
    isLoading: pronunciationLoading,
    error: pronunciationError,
  } = usePronunciation(currentEntry?.word || '', currentEntry?.wordType, {
    autoPlay: false,
    enabled: currentEntry != null,
  });

  useEffect(() => {
    if (!set?.entries || !set.setId) {
      return;
    }

    const saved = loadSession<SpellingEntry>(set.setId, 'spelling');
    setEntries(saved && saved.length > 0 ? saved : createEntries(set.entries));
  }, [set]);

  useEffect(() => {
    if (!currentEntry) {
      return;
    }

    if (pronunciationError) {
      console.error('Pronunciation error:', pronunciationError);
      const updatedEntries = skipUnavailablePronunciation(entries, currentEntryIndex);
      persistEntries(updatedEntries);
      advanceQuestion(updatedEntries);
      return;
    }

    const timer = setTimeout(() => {
      playAudio();
    }, 100);
    return () => clearTimeout(timer);
  }, [currentEntry?.word, currentEntry?.wordType, currentEntryIndex, iteration, playAudio, pronunciationError]);

  const persistEntries = (updatedEntries: SpellingEntry[]) => {
    setEntries(updatedEntries);
    if (set.setId) {
      saveSession(set.setId, set.name ?? '', 'spelling', updatedEntries);
    }
  };

  const checkAnswer = () => {
    if (!currentEntry) {
      return;
    }

    const result = answerQuestion(entries, currentEntryIndex, userInput);
    registerAnswer.mutate(result.answer);
    setIsCorrect(result.isCorrect);
    setShowFeedback(true);
    persistEntries(result.entries);
  };

  const advanceQuestion = (currentEntries: SpellingEntry[]) => {
    setShowFeedback(false);
    setUserInput('');
    const nextIndex = selectNextEntryIndex(currentEntries, currentEntryIndex);
    if (nextIndex === null) {
      setIsComplete(true);
      if (set.setId) {
        clearSession(set.setId, 'spelling');
      }
      return;
    }

    setCurrentEntryIndex(nextIndex);
    setIteration((previous) => previous + 1);
  };

  const nextQuestion = () => advanceQuestion(entries);

  return {
    entries,
    currentEntry,
    userInput,
    setUserInput,
    showFeedback,
    isCorrect,
    isComplete,
    playAudio,
    pronunciationLoading,
    checkAnswer,
    nextQuestion,
    ...getProgress(entries),
  };
}
