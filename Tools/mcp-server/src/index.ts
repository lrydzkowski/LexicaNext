import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  createSet,
  createWord,
  deleteSets,
  deleteWords,
  generateSentences,
  generateTranslations,
  getSet,
  getSets,
  getStatus,
  getWord,
  getWords,
  getWordSets,
  updateSet,
  updateWord,
  type CreateWordRequestPayload,
  type UpdateWordRequestPayload,
} from './api-client.js';
import { logger } from './logger.js';

const server = new Server(
  {
    name: 'lexica-next',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

logger.info('MCP server initialized', {
  serverName: 'lexica-next',
  version: '2.0.0',
  capabilities: ['tools'],
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug('Received ListTools request');
  const tools: Tool[] = [
    {
      name: 'get_lexica_status',
      description: 'Get the Lexica API status',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      annotations: {
        title: 'Get Lexica Status',
        readOnlyHint: true,
      },
    },
    {
      name: 'get_lexica_sets',
      description: 'Get vocabulary sets with optional filtering and pagination',
      inputSchema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page',
          },
          sortingFieldName: {
            type: 'string',
            description: 'Field name to sort by',
          },
          sortingOrder: {
            type: 'string',
            description: 'Sorting order (asc/desc)',
          },
          searchQuery: {
            type: 'string',
            description: 'Search query to filter sets',
          },
          timeZoneId: {
            type: 'string',
            description: 'Time zone ID for date formatting (e.g. Europe/Warsaw)',
          },
        },
      },
      annotations: {
        title: 'Get Lexica Sets',
        readOnlyHint: true,
      },
    },
    {
      name: 'get_lexica_set',
      description: 'Get a specific vocabulary set by ID, including its words',
      inputSchema: {
        type: 'object',
        properties: {
          setId: {
            type: 'string',
            description: 'The ID of the vocabulary set',
          },
        },
        required: ['setId'],
      },
      annotations: {
        title: 'Get Lexica Set',
        readOnlyHint: true,
      },
    },
    {
      name: 'create_lexica_set',
      description: 'Create a new vocabulary set from existing word IDs. The set name is auto-generated.',
      inputSchema: {
        type: 'object',
        properties: {
          wordIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of word IDs to include in the set',
          },
        },
        required: ['wordIds'],
      },
      annotations: {
        title: 'Create Lexica Set',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    {
      name: 'update_lexica_set',
      description: 'Update an existing vocabulary set by replacing its word IDs',
      inputSchema: {
        type: 'object',
        properties: {
          setId: {
            type: 'string',
            description: 'The ID of the vocabulary set to update',
          },
          wordIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'New array of word IDs for the set',
          },
        },
        required: ['setId', 'wordIds'],
      },
      annotations: {
        title: 'Update Lexica Set',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    {
      name: 'delete_lexica_sets',
      description: 'Delete multiple vocabulary sets by their IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of set IDs to delete',
          },
        },
        required: ['ids'],
      },
      annotations: {
        title: 'Delete Lexica Sets',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    {
      name: 'get_lexica_words',
      description: 'Get words with optional filtering and pagination',
      inputSchema: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: 'Page number for pagination',
          },
          pageSize: {
            type: 'number',
            description: 'Number of items per page',
          },
          sortingFieldName: {
            type: 'string',
            description: 'Field name to sort by',
          },
          sortingOrder: {
            type: 'string',
            description: 'Sorting order (asc/desc)',
          },
          searchQuery: {
            type: 'string',
            description: 'Search query to filter words',
          },
          timeZoneId: {
            type: 'string',
            description: 'Time zone ID for date formatting (e.g. Europe/Warsaw)',
          },
        },
      },
      annotations: {
        title: 'Get Lexica Words',
        readOnlyHint: true,
      },
    },
    {
      name: 'get_lexica_word',
      description: 'Get a specific word by ID, including translations and example sentences',
      inputSchema: {
        type: 'object',
        properties: {
          wordId: {
            type: 'string',
            description: 'The ID of the word',
          },
        },
        required: ['wordId'],
      },
      annotations: {
        title: 'Get Lexica Word',
        readOnlyHint: true,
      },
    },
    {
      name: 'create_lexica_word',
      description: 'Create a new word with translations and example sentences',
      inputSchema: {
        type: 'object',
        properties: {
          word: {
            type: 'string',
            description: 'The English word',
          },
          wordType: {
            type: 'string',
            description: 'Grammatical type: Noun, Verb, Adjective, or Adverb',
            enum: ['Noun', 'Verb', 'Adjective', 'Adverb'],
          },
          translations: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of Polish translations',
          },
          exampleSentences: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of example sentences',
          },
        },
        required: ['word', 'wordType', 'translations'],
      },
      annotations: {
        title: 'Create Lexica Word',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
      },
    },
    {
      name: 'update_lexica_word',
      description: 'Update an existing word by ID',
      inputSchema: {
        type: 'object',
        properties: {
          wordId: {
            type: 'string',
            description: 'The ID of the word to update',
          },
          word: {
            type: 'string',
            description: 'The English word',
          },
          wordType: {
            type: 'string',
            description: 'Grammatical type: Noun, Verb, Adjective, or Adverb',
            enum: ['Noun', 'Verb', 'Adjective', 'Adverb'],
          },
          translations: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of Polish translations',
          },
          exampleSentences: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of example sentences',
          },
        },
        required: ['wordId'],
      },
      annotations: {
        title: 'Update Lexica Word',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    {
      name: 'delete_lexica_words',
      description: 'Delete multiple words by their IDs',
      inputSchema: {
        type: 'object',
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of word IDs to delete',
          },
        },
        required: ['ids'],
      },
      annotations: {
        title: 'Delete Lexica Words',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
      },
    },
    {
      name: 'get_lexica_word_sets',
      description: 'Get all vocabulary sets that contain a specific word',
      inputSchema: {
        type: 'object',
        properties: {
          wordId: {
            type: 'string',
            description: 'The ID of the word',
          },
        },
        required: ['wordId'],
      },
      annotations: {
        title: 'Get Lexica Word Sets',
        readOnlyHint: true,
      },
    },
    {
      name: 'generate_lexica_translations',
      description: 'Generate Polish translations for an English word using AI',
      inputSchema: {
        type: 'object',
        properties: {
          word: {
            type: 'string',
            description: 'The English word to translate',
          },
          wordType: {
            type: 'string',
            description: 'Grammatical type: Noun, Verb, Adjective, or Adverb',
            enum: ['Noun', 'Verb', 'Adjective', 'Adverb'],
          },
          count: {
            type: 'number',
            description: 'Number of translations to generate (default: 3)',
          },
        },
        required: ['word', 'wordType'],
      },
      annotations: {
        title: 'Generate Lexica Translations',
        readOnlyHint: true,
      },
    },
    {
      name: 'generate_lexica_sentences',
      description: 'Generate example sentences for an English word using AI',
      inputSchema: {
        type: 'object',
        properties: {
          word: {
            type: 'string',
            description: 'The English word to generate sentences for',
          },
          wordType: {
            type: 'string',
            description: 'Grammatical type: Noun, Verb, Adjective, or Adverb',
            enum: ['Noun', 'Verb', 'Adjective', 'Adverb'],
          },
          count: {
            type: 'number',
            description: 'Number of sentences to generate (default: 3)',
          },
        },
        required: ['word', 'wordType'],
      },
      annotations: {
        title: 'Generate Lexica Sentences',
        readOnlyHint: true,
      },
    },
  ];

  logger.debug('Returning tools list', { toolCount: tools.length, toolNames: tools.map((t) => t.name) });
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info('Tool call received', { toolName: name, args });

  try {
    switch (name) {
      case 'get_lexica_status': {
        logger.debug('Executing get_lexica_status tool');
        const result = await getStatus();
        logger.debug('get_lexica_status completed', { success: !result.error });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_lexica_sets': {
        const params = args || {};
        logger.debug('Executing get_lexica_sets tool', { params });
        const result = await getSets(params);
        logger.debug('get_lexica_sets completed', { success: !result.error, resultCount: result.data?.data?.length });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_lexica_set': {
        const setId = args?.setId as string;
        if (!setId) {
          logger.warn('get_lexica_set called without setId');
          throw new Error('setId is required');
        }

        logger.debug('Executing get_lexica_set tool', { setId });
        const result = await getSet(setId);
        logger.debug('get_lexica_set completed', { setId, success: !result.error });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'create_lexica_set': {
        const wordIds = args?.wordIds as string[];
        if (!wordIds || !Array.isArray(wordIds)) {
          logger.warn('create_lexica_set called without wordIds');
          throw new Error('wordIds is required and must be an array');
        }

        logger.debug('Executing create_lexica_set tool', { wordIdsCount: wordIds.length });
        const result = await createSet(wordIds);
        logger.info('create_lexica_set completed', { success: !result.error, setId: result.data?.setId });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'update_lexica_set': {
        const setId = args?.setId as string;
        const wordIds = args?.wordIds as string[];
        if (!setId) {
          logger.warn('update_lexica_set called without setId');
          throw new Error('setId is required');
        }
        if (!wordIds || !Array.isArray(wordIds)) {
          logger.warn('update_lexica_set called without wordIds');
          throw new Error('wordIds is required and must be an array');
        }

        logger.debug('Executing update_lexica_set tool', { setId, wordIdsCount: wordIds.length });
        const result = await updateSet(setId, wordIds);
        logger.info('update_lexica_set completed', { setId, success: !result.error });

        return {
          content: [
            {
              type: 'text',
              text: result.error ? JSON.stringify(result, null, 2) : JSON.stringify({ success: true }, null, 2),
            },
          ],
        };
      }

      case 'delete_lexica_sets': {
        const ids = args?.ids as string[];
        if (!ids || !Array.isArray(ids)) {
          logger.warn('delete_lexica_sets called without ids');
          throw new Error('ids is required and must be an array');
        }

        logger.debug('Executing delete_lexica_sets tool', { ids });
        const result = await deleteSets(ids);
        logger.info('delete_lexica_sets completed', { ids, success: !result.error });

        return {
          content: [
            {
              type: 'text',
              text: result.error ? JSON.stringify(result, null, 2) : JSON.stringify({ success: true }, null, 2),
            },
          ],
        };
      }

      case 'get_lexica_words': {
        const params = args || {};
        logger.debug('Executing get_lexica_words tool', { params });
        const result = await getWords(params);
        logger.debug('get_lexica_words completed', {
          success: !result.error,
          resultCount: result.data?.data?.length,
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'get_lexica_word': {
        const wordId = args?.wordId as string;
        if (!wordId) {
          logger.warn('get_lexica_word called without wordId');
          throw new Error('wordId is required');
        }

        logger.debug('Executing get_lexica_word tool', { wordId });
        const result = await getWord(wordId);
        logger.debug('get_lexica_word completed', { wordId, success: !result.error });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'create_lexica_word': {
        const payload = {
          word: args?.word,
          wordType: args?.wordType,
          translations: args?.translations,
          exampleSentences: args?.exampleSentences,
        } as CreateWordRequestPayload;

        if (!payload.word || !payload.wordType || !payload.translations) {
          logger.warn('create_lexica_word called with missing required fields');
          throw new Error('word, wordType, and translations are required');
        }

        logger.debug('Executing create_lexica_word tool', { word: payload.word, wordType: payload.wordType });
        const result = await createWord(payload);
        logger.info('create_lexica_word completed', {
          word: payload.word,
          success: !result.error,
          wordId: result.data?.wordId,
        });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'update_lexica_word': {
        const wordId = args?.wordId as string;
        if (!wordId) {
          logger.warn('update_lexica_word called without wordId');
          throw new Error('wordId is required');
        }

        const payload = {
          word: args?.word,
          wordType: args?.wordType,
          translations: args?.translations,
          exampleSentences: args?.exampleSentences,
        } as UpdateWordRequestPayload;

        logger.debug('Executing update_lexica_word tool', { wordId, word: payload.word });
        const result = await updateWord(wordId, payload);
        logger.info('update_lexica_word completed', { wordId, success: !result.error });

        return {
          content: [
            {
              type: 'text',
              text: result.error ? JSON.stringify(result, null, 2) : JSON.stringify({ success: true }, null, 2),
            },
          ],
        };
      }

      case 'delete_lexica_words': {
        const ids = args?.ids as string[];
        if (!ids || !Array.isArray(ids)) {
          logger.warn('delete_lexica_words called without ids');
          throw new Error('ids is required and must be an array');
        }

        logger.debug('Executing delete_lexica_words tool', { ids });
        const result = await deleteWords(ids);
        logger.info('delete_lexica_words completed', { ids, success: !result.error });

        return {
          content: [
            {
              type: 'text',
              text: result.error ? JSON.stringify(result, null, 2) : JSON.stringify({ success: true }, null, 2),
            },
          ],
        };
      }

      case 'get_lexica_word_sets': {
        const wordId = args?.wordId as string;
        if (!wordId) {
          logger.warn('get_lexica_word_sets called without wordId');
          throw new Error('wordId is required');
        }

        logger.debug('Executing get_lexica_word_sets tool', { wordId });
        const result = await getWordSets(wordId);
        logger.debug('get_lexica_word_sets completed', { wordId, success: !result.error });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'generate_lexica_translations': {
        const word = args?.word as string;
        const wordType = args?.wordType as string;
        const count = args?.count as number | undefined;

        if (!word || !wordType) {
          logger.warn('generate_lexica_translations called with missing required fields');
          throw new Error('word and wordType are required');
        }

        logger.debug('Executing generate_lexica_translations tool', { word, wordType, count });
        const result = await generateTranslations(word, wordType, count);
        logger.debug('generate_lexica_translations completed', { word, success: !result.error });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'generate_lexica_sentences': {
        const word = args?.word as string;
        const wordType = args?.wordType as string;
        const count = args?.count as number | undefined;

        if (!word || !wordType) {
          logger.warn('generate_lexica_sentences called with missing required fields');
          throw new Error('word and wordType are required');
        }

        logger.debug('Executing generate_lexica_sentences tool', { word, wordType, count });
        const result = await generateSentences(word, wordType, count);
        logger.debug('generate_lexica_sentences completed', { word, success: !result.error });

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        logger.warn('Unknown tool requested', { toolName: name });
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error('Tool execution failed', {
      toolName: name,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  try {
    logger.info('Starting MCP server connection');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('MCP server connected successfully');
  } catch (error) {
    logger.error('Failed to start MCP server', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

main().catch((error) => {
  logger.error('MCP server startup failed', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  console.error(error);
  process.exit(1);
});
