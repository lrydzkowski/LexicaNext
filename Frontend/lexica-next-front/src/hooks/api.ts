import { useAuth0 } from '@auth0/auth0-react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '../../api-types/api-types';
import { createAuthenticatedClient } from '../services/api-client';

export type EntryDto = components['schemas']['EntryDto'];
export type SetRecordDto = components['schemas']['SetRecordDto'];
export type GetSetResponse = components['schemas']['GetSetResponse'];
export type GetSetsResponse = components['schemas']['GetSetsResponse'];
export type CreateSetRequestPayload = components['schemas']['CreateSetRequestPayload'];
export type UpdateSetRequestPayload = components['schemas']['UpdateSetRequestPayload'];
export type GenerateTranslationsRequest = components['schemas']['GenerateTranslationsRequest'];
export type GenerateTranslationsResponse = components['schemas']['GenerateTranslationsResponse'];

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

export const useCreateSet = () => {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSetRequestPayload): Promise<void> => {
      const { error } = await client.POST('/api/sets', {
        body: data,
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
        throw new Error(`API error: ${error}`);
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
