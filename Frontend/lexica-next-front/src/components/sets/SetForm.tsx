import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { Button, Divider, Group, LoadingOverlay, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { links } from '@/config/links';
import { useCreateSet, useUpdateSet, type GetSetResponse } from '../../hooks/api';
import { WordSelector } from './WordSelector';

interface SelectedWord {
  wordId: string;
  word: string;
  wordType: string;
}

interface FormValues {
  setName: string;
}

interface SetFormProps {
  mode: 'create' | 'edit';
  setId?: string;
  set?: GetSetResponse;
  isLoading?: boolean;
}

export function SetForm({ mode, setId, set, isLoading }: SetFormProps) {
  const navigate = useNavigate();
  const createSetMutation = useCreateSet();
  const updateSetMutation = useUpdateSet();
  const [searchParams] = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';
  const setNameInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);

  const form = useForm<FormValues>({
    mode: 'uncontrolled',
    initialValues: {
      setName: mode === 'create' ? uuidv4() : '',
    },
    validate: {
      setName: (value) => {
        if (!value?.trim()) {
          return 'Set name is required';
        }

        if (value.trim().length < 1) {
          return 'Set name must not be empty';
        }

        if (value.trim().length > 200) {
          return 'Set name must be less than 200 characters';
        }

        return null;
      },
    },
  });

  useEffect(() => {
    if (mode === 'edit' && set) {
      form.setValues({
        setName: set.name || '',
      });
      setSelectedWords(
        (set.entries || []).map((entry) => ({
          wordId: entry.wordId || '',
          word: entry.word || '',
          wordType: entry.wordType || '',
        })),
      );
      setTimeout(() => {
        setNameInputRef.current?.focus();
      }, 0);
    }
  }, [set, mode]);

  useEffect(() => {
    if (mode === 'create') {
      setNameInputRef.current?.focus();
    }
  }, [mode]);

  const handleSubmit = (values: FormValues) => {
    if (selectedWords.length === 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please select at least one word for the set',
        color: 'red',
        position: 'top-center',
      });

      return;
    }

    const wordIds = selectedWords.map((w) => w.wordId);

    if (mode === 'create') {
      createSetMutation.mutate(
        {
          setName: values.setName,
          wordIds,
        },
        {
          onSuccess: () => {
            navigate(links.sets.getUrl());
          },
          onError: () => {
            notifications.show({
              title: 'Error Creating Set',
              message: 'Failed to create set',
              color: 'red',
              position: 'top-center',
            });
          },
        },
      );
    } else {
      if (!setId) {
        return;
      }

      updateSetMutation.mutate(
        {
          setId,
          data: {
            setName: values.setName,
            wordIds,
          },
        },
        {
          onSuccess: () => {
            navigate(links.sets.getUrl());
          },
          onError: () => {
            notifications.show({
              title: 'Error Updating Set',
              message: 'Failed to update set',
              color: 'red',
              position: 'top-center',
            });
          },
        },
      );
    }
  };

  if (isLoading) {
    return (
      <Stack pos="relative" mih="12rem">
        <LoadingOverlay visible />
      </Stack>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <TextInput
          ref={setNameInputRef}
          label="Set Name"
          placeholder="Enter set name..."
          size="md"
          {...form.getInputProps('setName')}
          key={form.key('setName')}
        />

        <Divider label="Words in Set" labelPosition="center" />

        <WordSelector selectedWords={selectedWords} onWordsChange={setSelectedWords} />

        <Group justify="space-between" mt="xl" wrap="wrap">
          <Button variant="light" onClick={() => navigate(links.sets.getUrl({}, { returnPage }))} size="md" w={120}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={mode === 'create' ? createSetMutation.isPending : updateSetMutation.isPending}
            size="md"
            w={120}>
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
