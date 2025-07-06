import { useCallback, useEffect, useState } from 'react';
import { useRecording } from './api';

interface UsePronunciationOptions {
  autoPlay?: boolean;
  enabled?: boolean;
}

interface UsePronunciationReturn {
  playAudio: () => Promise<void>;
  isLoading: boolean;
  isPlaying: boolean;
}

export function usePronunciation(
  word: string,
  wordType?: string,
  options: UsePronunciationOptions = {},
): UsePronunciationReturn {
  const { autoPlay = false, enabled = true } = options;
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: recordingData, isLoading } = useRecording(word, wordType, enabled && !!word);

  const playRecordingData = useCallback(async (data: Blob) => {
    if (!(data instanceof Blob) || !data.type.startsWith('audio/')) {
      console.error('Unexpected data type for audio:', typeof data, data);
      return;
    }

    setIsPlaying(true);
    const url = URL.createObjectURL(data);
    setAudioUrl(url);

    const audio = new Audio(url);

    const handleLoadedData = () => {
      audio.play().catch((error) => {
        console.error('Failed to play audio blob:', error);
        setIsPlaying(false);
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };

    const handleError = () => {
      console.error('Audio element error');
      setIsPlaying(false);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
  }, []);

  const playAudio = useCallback(async () => {
    if (!word || !recordingData) {
      return;
    }

    try {
      await playRecordingData(recordingData);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    }
  }, [word, recordingData, playRecordingData]);

  useEffect(() => {
    if (recordingData && autoPlay) {
      playRecordingData(recordingData);
    }
  }, [recordingData, autoPlay, playRecordingData]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    playAudio,
    isLoading,
    isPlaying,
  };
}
