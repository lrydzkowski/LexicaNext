import createClient from 'openapi-fetch';
import { components, operations, type paths } from '../api-types/api-types.js';
import { config } from './config.js';
import { logger } from './logger.js';

export type GetSetsQueryParams = operations['GetSets']['parameters']['query'];
export type GetWordsQueryParams = operations['GetWords']['parameters']['query'];
export type CreateWordRequestPayload = components['schemas']['CreateWordRequestPayload'];
export type UpdateWordRequestPayload = components['schemas']['UpdateWordRequestPayload'];

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

export async function createSet(wordIds: string[]) {
  logger.debug('API call: POST /api/sets', { wordIdsCount: wordIds.length });
  const { data, error } = await client.POST('/api/sets', {
    body: { wordIds },
  });

  error
    ? logger.error('API call failed: POST /api/sets', { error })
    : logger.info('API call successful: POST /api/sets', { setId: data?.setId });

  return { data, error };
}

export async function updateSet(setId: string, wordIds: string[]) {
  logger.debug('API call: PUT /api/sets/{setId}', { setId, wordIdsCount: wordIds.length });
  const { data, error } = await client.PUT('/api/sets/{setId}', {
    params: {
      path: { setId },
    },
    body: { wordIds },
  });

  error
    ? logger.error('API call failed: PUT /api/sets/{setId}', { error, setId })
    : logger.info('API call successful: PUT /api/sets/{setId}', { setId });

  return { data, error };
}

export async function deleteSets(ids: string[]) {
  logger.debug('API call: DELETE /api/sets', { ids });
  const { data, error } = await client.DELETE('/api/sets', {
    body: { ids },
  });

  error
    ? logger.error('API call failed: DELETE /api/sets', { error, ids })
    : logger.info('API call successful: DELETE /api/sets', { ids });

  return { data, error };
}

export async function getWords(params?: GetWordsQueryParams) {
  logger.debug('API call: GET /api/words', { params });
  const { data, error } = await client.GET('/api/words', {
    params: {
      query: params,
    },
  });

  error
    ? logger.error('API call failed: GET /api/words', { error, params })
    : logger.debug('API call successful: GET /api/words', { resultCount: data?.data?.length });

  return { data, error };
}

export async function getWord(wordId: string) {
  logger.debug('API call: GET /api/words/{wordId}', { wordId });
  const { data, error } = await client.GET('/api/words/{wordId}', {
    params: {
      path: { wordId },
    },
  });

  error
    ? logger.error('API call failed: GET /api/words/{wordId}', { error, wordId })
    : logger.debug('API call successful: GET /api/words/{wordId}', { wordId, word: data?.word });

  return { data, error };
}

export async function createWord(payload: CreateWordRequestPayload) {
  logger.debug('API call: POST /api/words', { word: payload?.word, wordType: payload?.wordType });
  const { data, error } = await client.POST('/api/words', {
    body: payload,
  });

  error
    ? logger.error('API call failed: POST /api/words', { error, word: payload?.word })
    : logger.info('API call successful: POST /api/words', { word: payload?.word, wordId: data?.wordId });

  return { data, error };
}

export async function updateWord(wordId: string, payload: UpdateWordRequestPayload) {
  logger.debug('API call: PUT /api/words/{wordId}', { wordId, word: payload?.word });
  const { data, error } = await client.PUT('/api/words/{wordId}', {
    params: {
      path: { wordId },
    },
    body: payload,
  });

  error
    ? logger.error('API call failed: PUT /api/words/{wordId}', { error, wordId })
    : logger.info('API call successful: PUT /api/words/{wordId}', { wordId });

  return { data, error };
}

export async function deleteWords(ids: string[]) {
  logger.debug('API call: DELETE /api/words', { ids });
  const { data, error } = await client.DELETE('/api/words', {
    body: { ids },
  });

  error
    ? logger.error('API call failed: DELETE /api/words', { error, ids })
    : logger.info('API call successful: DELETE /api/words', { ids });

  return { data, error };
}

export async function getWordSets(wordId: string) {
  logger.debug('API call: GET /api/words/{wordId}/sets', { wordId });
  const { data, error } = await client.GET('/api/words/{wordId}/sets', {
    params: {
      path: { wordId },
    },
  });

  error
    ? logger.error('API call failed: GET /api/words/{wordId}/sets', { error, wordId })
    : logger.debug('API call successful: GET /api/words/{wordId}/sets', { wordId });

  return { data, error };
}

export async function generateTranslations(word: string, wordType: string, count?: number) {
  logger.debug('API call: POST /api/translations/generate', { word, wordType, count });
  const { data, error } = await client.POST('/api/translations/generate', {
    body: { word, wordType, count: count ?? 3 },
  });

  error
    ? logger.error('API call failed: POST /api/translations/generate', { error, word, wordType })
    : logger.debug('API call successful: POST /api/translations/generate', {
        word,
        translationsCount: data?.translations?.length,
      });

  return { data, error };
}

export async function generateSentences(word: string, wordType: string, count?: number) {
  logger.debug('API call: POST /api/sentences/generate', { word, wordType, count });
  const { data, error } = await client.POST('/api/sentences/generate', {
    body: { word, wordType, count: count ?? 3 },
  });

  error
    ? logger.error('API call failed: POST /api/sentences/generate', { error, word, wordType })
    : logger.debug('API call successful: POST /api/sentences/generate', {
        word,
        sentencesCount: data?.sentences?.length,
      });

  return { data, error };
}
