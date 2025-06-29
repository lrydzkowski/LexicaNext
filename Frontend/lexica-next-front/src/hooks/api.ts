import { useAuth0 } from '@auth0/auth0-react';
import { keepPreviousData } from '@tanstack/react-query';
import createClient from 'openapi-react-query';
import type { components } from '../../api-types/api-types';
import { createAuthenticatedClient } from '../services/api-client';

export type EntryDto = components['schemas']['EntryDto'];
export type SetRecordDto = components['schemas']['SetRecordDto'];
export type GetSetResponse = components['schemas']['GetSetResponse'];
export type GetSetsResponse = components['schemas']['GetSetsResponse'];
export type CreateSetRequestPayload = components['schemas']['CreateSetRequestPayload'];
export type UpdateSetRequestPayload = components['schemas']['UpdateSetRequestPayload'];

export const useApiClient = () => {
  const { getAccessTokenSilently } = useAuth0();

  const client = createAuthenticatedClient(getAccessTokenSilently);
  const $api = createClient(client);

  return { client, $api };
};

export const useSets = (params?: {
  page?: number;
  pageSize?: number;
  sortingFieldName?: string;
  sortingOrder?: string;
  searchQuery?: string;
}) => {
  const { $api } = useApiClient();

  return $api.useQuery('get', '/api/sets', {
    params: {
      query: params,
    },
    queryOptions: {
      placeholderData: keepPreviousData,
    },
  });
};

export const useSet = (setId: string) => {
  const { $api } = useApiClient();

  return $api.useQuery('get', '/api/sets/{setId}', {
    params: {
      path: { setId },
    },
  });
};

export const useCreateSet = () => {
  const { $api } = useApiClient();

  return $api.useMutation('post', '/api/sets');
};

export const useUpdateSet = () => {
  const { $api } = useApiClient();

  return $api.useMutation('put', '/api/sets/{setId}');
};

export const useDeleteSet = () => {
  const { $api } = useApiClient();

  return $api.useMutation('delete', '/api/sets/{setId}');
};

export const useRecording = (word: string, wordType?: string, enabled = true) => {
  const { $api } = useApiClient();

  return $api.useQuery('get', '/api/recordings/{word}', {
    params: {
      path: { word },
      query: wordType ? { wordType } : undefined,
    },
    enabled: enabled && !!word,
  });
};
