import createClient from 'openapi-fetch';
import { components, operations, type paths } from '../api-types/api-types.js';
import { config } from './config.js';
import { logger } from './logger.js';

export type GetSetsQueryParams = operations['GetSets']['parameters']['query'];
export type CreateSetRequestPayload = components['schemas']['CreateSetRequestPayload'];
export type UpdateSetRequestPayload = components['schemas']['UpdateSetRequestPayload'];

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = createClient<paths>({
  baseUrl: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': config.apiKey,
  },
});

export async function getStatus() {
  logger.debug('API call: GET /api/status');
  const { data, error } = await client.GET('/api/status');

  error
    ? logger.error('API call failed: GET /api/status', { error })
    : logger.debug('API call successful: GET /api/status');

  return { data, error };
}

export async function getSets(params?: GetSetsQueryParams) {
  logger.debug('API call: GET /api/sets', { params });
  const { data, error } = await client.GET('/api/sets', {
    params: {
      query: params,
    },
  });

  error
    ? logger.error('API call failed: GET /api/sets', { error, params })
    : logger.debug('API call successful: GET /api/sets', { resultCount: data?.data?.length });

  return { data, error };
}

export async function getSet(setId: string) {
  logger.debug('API call: GET /api/sets/{setId}', { setId });
  const { data, error } = await client.GET('/api/sets/{setId}', {
    params: {
      path: { setId },
    },
  });

  error
    ? logger.error('API call failed: GET /api/sets/{setId}', { error, setId })
    : logger.debug('API call successful: GET /api/sets/{setId}', { setId, setName: data?.name });

  return { data, error };
}

export async function createSet(payload: CreateSetRequestPayload) {
  logger.debug('API call: POST /api/sets', { setName: payload?.setName, entriesCount: payload?.entries?.length });
  const { data, error } = await client.POST('/api/sets', {
    body: payload,
  });

  error
    ? logger.error('API call failed: POST /api/sets', { error, setName: payload?.setName })
    : logger.info('API call successful: POST /api/sets', { setName: payload?.setName, setId: data?.setId });

  return { data, error };
}

export async function updateSet(setId: string, payload: UpdateSetRequestPayload) {
  logger.debug('API call: PUT /api/sets/{setId}', {
    setId,
    setName: payload?.setName,
    entriesCount: payload?.entries?.length,
  });
  const { data, error } = await client.PUT('/api/sets/{setId}', {
    params: {
      path: { setId },
    },
    body: payload,
  });

  error
    ? logger.error('API call failed: PUT /api/sets/{setId}', { error, setId, setName: payload?.setName })
    : logger.info('API call successful: PUT /api/sets/{setId}', { setId, setName: payload?.setName });

  return { data, error };
}
