import { useEffect, useState } from 'react';
import { IconVolume } from '@tabler/icons-react';
import { ActionIcon, Badge, Card, Group, Stack, Text } from '@mantine/core';
import { useRecording } from '../../hooks/api';
import type { EntryDto } from '../../hooks/api';

export function WordCard({ entry, index }: { entry: EntryDto; index: number }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [shouldFetchRecording, setShouldFetchRecording] = useState(false);
  const {
    data: recordingData,
    isLoading: recordingLoading,
    refetch,
  } = useRecording(entry.word || '', entry.wordType || undefined);

  const playAudio = async () => {
    try {
      if (!shouldFetchRecording) {
        setShouldFetchRecording(true);
        const result = await refetch();
        if (result.data) {
          await playRecordingData(result as Blob);
        } else {
          playFallbackAudio();
        }
      } else if (recordingData) {
        await playRecordingData(recordingData);
      } else {
        playFallbackAudio();
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
      playFallbackAudio();
    }
  };

  const playRecordingData = async (data: Blob) => {
    // if (data instanceof Blob && data.type.startsWith('audio/')) {
    const url = URL.createObjectURL(data);
    setAudioUrl(url);
    const audio = new Audio(url);
    audio.addEventListener('loadeddata', () => {
      audio.play().catch((error) => {
        console.error('Failed to play audio blob:', error);
        playFallbackAudio();
      });
    });
    audio.addEventListener('error', () => {
      console.error('Audio element error');
      playFallbackAudio();
    });
    // } else if (typeof data === 'string') {
    //   const audio = new Audio(data);
    //   await audio.play();
    // } else {
    //   console.log('Unexpected data type for audio:', typeof data, data);
    //   playFallbackAudio();
    // }
  };

  const playFallbackAudio = () => {
    // const utterance = new SpeechSynthesisUtterance(entry.word || '');
    // utterance.lang = 'en-US';
    // speechSynthesis.speak(utterance);
  };

  const getWordTypeColor = (wordType: string) => {
    switch (wordType.toLowerCase()) {
      case 'noun':
        return 'blue';
      case 'verb':
        return 'green';
      case 'adjective':
        return 'orange';
      case 'adverb':
        return 'purple';
      default:
        return 'gray';
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <Card key={index} withBorder>
      <Stack gap="md">
        <Group justify="space-between" wrap="nowrap">
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text fz={{ base: 'lg', md: 'xl' }} fw={700} c="blue" truncate>
              {entry.word}
            </Text>
            <Badge size="sm" color={getWordTypeColor(entry.wordType || '')} variant="light">
              {entry.wordType}
            </Badge>
          </div>
          <ActionIcon
            variant="light"
            color="blue"
            onClick={playAudio}
            loading={recordingLoading}
            aria-label={`Play pronunciation of ${entry.word}`}
            style={{ flexShrink: 0 }}>
            <IconVolume size={16} />
          </ActionIcon>
        </Group>

        <div>
          <Text size="sm" c="dimmed" fw={500} mb="xs">
            Translations:
          </Text>
          <Stack gap="xs">
            {(entry.translations || []).map((translation, translationIndex) => (
              <Text key={translationIndex} size="sm">
                • {translation}
              </Text>
            ))}
          </Stack>
        </div>
      </Stack>
    </Card>
  );
}
