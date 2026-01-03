import { useAuth0 } from '@auth0/auth0-react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '../../api-types/api-types';
import { createAuthenticatedClient } from '../services/api-client';

export type EntryDto = components['schemas']['EntryDto'];
export type SetRecordDto = components['schemas']['SetRecordDto'];
export type GetSetResponse = components['schemas']['GetSetResponse'];
export type GetSetsResponse = components['schemas']['GetSetsResponse'];
export type WordRecordDto = components['schemas']['WordRecordDto'];
export type GetWordsResponse = components['schemas']['GetWordsResponse'];
export type GetWordResponse = components['schemas']['GetWordResponse'];
export type GetWordSetsResponse = components['schemas']['GetWordSetsResponse'];
export type CreateWordRequestPayload = components['schemas']['CreateWordRequestPayload'];
export type CreateWordResponse = components['schemas']['CreateWordResponse'];
export type UpdateWordRequestPayload = components['schemas']['UpdateWordRequestPayload'];
export type CreateSetRequestPayload = components['schemas']['CreateSetRequestPayload'];
export type UpdateSetRequestPayload = components['schemas']['UpdateSetRequestPayload'];
export type GenerateTranslationsRequest = components['schemas']['GenerateTranslationsRequest'];
export type GenerateTranslationsResponse = components['schemas']['GenerateTranslationsResponse'];
export type GenerateExampleSentencesRequest = components['schemas']['GenerateExampleSentencesRequest'];
export type GenerateExampleSentencesResponse = components['schemas']['GenerateExampleSentencesResponse'];

export const useApiClient = () => {
  const { getAccessTokenSilently } = useAuth0();
  const client = createAuthenticatedClient(getAccessTokenSilently);

  return client;
};

export const useSets = (params?: {
  page?: number;
  pageSize?: number;
  sortingFieldName?: string;
  sortingOrder?: string;
  searchQuery?: string;
}) => {
  const client = useApiClient();

  return useQuery({
    queryKey: ['sets', params],
    queryFn: async ({ signal }): Promise<GetSetsResponse> => {
      const { data, error } = await client.GET('/api/sets', {
        params: {
          query: params,
        },
        signal,
      });

      if (error) {
        throw new Error(`API error: ${error}`);
      }

      return data!;
    },
    placeholderData: keepPreviousData,
  });
};

export const useWords = (params?: {
  page?: number;
  pageSize?: number;
  sortingFieldName?: string;
  sortingOrder?: string;
  searchQuery?: string;
}) => {
  const client = useApiClient();

  return useQuery({
    queryKey: ['words', params],
    queryFn: async ({ signal }): Promise<GetWordsResponse> => {
      const { data, error } = await client.GET('/api/words', {
        params: {
          query: params,
        },
        signal,
      });

      if (error) {
        throw new Error(`API error: ${error}`);
      }

      return data!;
    },
    placeholderData: keepPreviousData,
  });
};

export const useSet = (setId: string) => {
  const client = useApiClient();

  return useQuery({
    queryKey: ['set', setId],
    queryFn: async ({ signal }): Promise<GetSetResponse> => {
      const { data, error } = await client.GET('/api/sets/{setId}', {
        params: {
          path: { setId },
        },
        signal,
      });

      if (error) {
        throw new Error(`API error: ${error}`);
      }

      return data!;
    },
    enabled: !!setId,
  });
};

export const useProposedSetName = () => {
  const client = useApiClient();

  return useQuery({
    queryKey: ['proposedSetName'],
    queryFn: async ({ signal }): Promise<string> => {
      const { data, error } = await client.GET('/api/sets/proposed-name', {
        signal,
      });

      if (error) {
        throw new Error(`API error: ${error}`);
      }

      return data!.proposedName!;
    },
    staleTime: 0,
  });
};

export const useCreateSet = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSetRequestPayload): Promise<void> => {
      const { error } = await client.POST('/api/sets', {
        body: data,
      });

      if (error) {
        const errorDetails = error as { errors?: Record<string, string[]> };
        if (errorDetails.errors) {
          const messages = Object.values(errorDetails.errors).flat();
          throw new Error(messages.join(', '));
        }
        throw new Error(`Failed to create set`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
    },
  });
};

export const useWord = (wordId: string) => {
  const client = useApiClient();

  return useQuery({
    queryKey: ['word', wordId],
    queryFn: async ({ signal }): Promise<GetWordResponse> => {
      const { data, error } = await client.GET('/api/words/{wordId}', {
        params: {
          path: { wordId },
        },
        signal,
      });

      if (error) {
        throw new Error(`API error: ${error}`);
      }

      return data!;
    },
    enabled: !!wordId,
  });
};

export const useCreateWord = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWordRequestPayload): Promise<CreateWordResponse> => {
      const { data: responseData, error } = await client.POST('/api/words', {
        body: data,
      });

      if (error || !responseData) {
        throw new Error(`API error: ${error}`);
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
};

export const useUpdateWord = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wordId, data }: { wordId: string; data: UpdateWordRequestPayload }): Promise<void> => {
      const { error } = await client.PUT('/api/words/{wordId}', {
        params: {
          path: { wordId },
        },
        body: data,
      });

      if (error) {
        throw new Error(`API error: ${error}`);
      }
    },
    onSuccess: (_, { wordId }) => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
      queryClient.invalidateQueries({ queryKey: ['word', wordId] });
    },
  });
};

export const useDeleteWord = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wordId: string): Promise<void> => {
      const { error } = await client.DELETE('/api/words/{wordId}', {
        params: {
          path: { wordId },
        },
      });

      if (error) {
        throw new Error(`API error: ${error}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
};

export const useDeleteWords = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wordIds: string[]): Promise<number> => {
      let failedCount = 0;

      for (const wordId of wordIds) {
        const { error } = await client.DELETE('/api/words/{wordId}', {
          params: {
            path: { wordId },
          },
        });

        if (error) {
          failedCount++;
        }
      }

      return failedCount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words'] });
    },
  });
};

export const useWordSets = (wordId: string, enabled = true) => {
  const client = useApiClient();

  return useQuery({
    queryKey: ['wordSets', wordId],
    queryFn: async ({ signal }): Promise<GetWordSetsResponse> => {
      const { data, error } = await client.GET('/api/words/{wordId}/sets', {
        params: {
          path: { wordId },
        },
        signal,
      });

      if (error) {
        throw new Error(`API error: ${error}`);
      }

      return data!;
    },
    enabled: enabled && !!wordId,
  });
};

export const useUpdateSet = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ setId, data }: { setId: string; data: UpdateSetRequestPayload }): Promise<void> => {
      const { error } = await client.PUT('/api/sets/{setId}', {
        params: {
          path: { setId },
        },
        body: data,
      });

      if (error) {
        const errorDetails = error as { errors?: Record<string, string[]> };
        if (errorDetails.errors) {
          const messages = Object.values(errorDetails.errors).flat();
          throw new Error(messages.join(', '));
        }
        throw new Error(`Failed to update set`);
      }
    },
    onSuccess: (_, { setId }) => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
      queryClient.invalidateQueries({ queryKey: ['set', setId] });
    },
  });
};

export const useDeleteSet = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setId: string): Promise<void> => {
      const { error } = await client.DELETE('/api/sets/{setId}', {
        params: {
          path: { setId },
        },
      });

      if (error) {
        throw new Error(`API error: ${error}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
    },
  });
};

export const useDeleteSets = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setIds: string[]): Promise<number> => {
      let failedCount = 0;

      for (const setId of setIds) {
        const { error } = await client.DELETE('/api/sets/{setId}', {
          params: {
            path: { setId },
          },
        });

        if (error) {
          failedCount++;
        }
      }

      return failedCount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] });
    },
  });
};

export const useRecording = (word: string, wordType?: string, enabled = true) => {
  const client = useApiClient();

  return useQuery({
    queryKey: ['recording', word, wordType],
    queryFn: async ({ signal }): Promise<Blob> => {
      const { data, error, response } = await client.GET('/api/recordings/{word}', {
        params: {
          path: { word },
          query: wordType ? { wordType } : undefined,
        },
        parseAs: 'blob',
        signal,
      });

      if (error) {
        throw new Error(`API error: ${JSON.stringify(error)}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return data as Blob;
    },
    enabled: enabled && !!word,
  });
};

export const useGenerateTranslations = () => {
  const client = useApiClient();

  return useMutation({
    mutationFn: async (request: GenerateTranslationsRequest): Promise<GenerateTranslationsResponse> => {
      const { data, error } = await client.POST('/api/translations/generate', {
        body: request,
      });

      if (error) {
        throw new Error(`API error: ${JSON.stringify(error)}`);
      }

      return data!;
    },
  });
};

export const useGenerateExampleSentences = () => {
  const client = useApiClient();

  return useMutation({
    mutationFn: async (request: GenerateExampleSentencesRequest): Promise<GenerateExampleSentencesResponse> => {
      const { data, error } = await client.POST('/api/sentences/generate', {
        body: request,
      });

      if (error) {
        throw new Error(`API error: ${JSON.stringify(error)}`);
      }

      return data!;
    },
  });
};
