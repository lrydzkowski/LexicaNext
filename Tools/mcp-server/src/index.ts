import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { components } from '../api-types/api-types.js';
import { createSet, getSet, getSets, getStatus, updateSet } from './api-client.js';
import { logger } from './logger.js';

type CreateSetRequestPayload = components['schemas']['CreateSetRequestPayload'];
type UpdateSetRequestPayload = components['schemas']['UpdateSetRequestPayload'];

const server = new Server(
  {
    name: 'lexica-next',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

logger.info('MCP server initialized', {
  serverName: 'lexica-next',
  version: '1.0.0',
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
        },
      },
      annotations: {
        title: 'Get Lexica Sets',
        readOnlyHint: true,
      },
    },
    {
      name: 'get_lexica_set',
      description: 'Get a specific vocabulary set by ID',
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
      description: 'Create a new vocabulary set',
      inputSchema: {
        type: 'object',
        properties: {
          setName: {
            type: 'string',
            description: 'Name of the vocabulary set',
          },
          entries: {
            type: 'array',
            description: 'Array of vocabulary entries (EntryDto)',
            items: {
              type: 'object',
              properties: {
                word: {
                  type: 'string',
                  description: 'The vocabulary word',
                },
                wordType: {
                  type: 'string',
                  description: 'The grammatical type of the word (e.g., noun, verb, adjective)',
                },
                translations: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of translations for the word',
                },
              },
              additionalProperties: false,
              required: ['word', 'wordType', 'translations'],
            },
          },
        },
        additionalProperties: false,
        required: ['setName', 'entries'],
      },
      annotations: {
        title: 'Create Lexica Set',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
      },
    },
    {
      name: 'update_lexica_set',
      description: 'Update an existing vocabulary set',
      inputSchema: {
        type: 'object',
        properties: {
          setId: {
            type: 'string',
            description: 'The ID of the vocabulary set to update',
          },
          setName: {
            type: 'string',
            description: 'Updated name of the vocabulary set',
          },
          entries: {
            type: 'array',
            description: 'Updated array of vocabulary entries',
            items: {
              type: 'object',
              properties: {
                word: {
                  type: 'string',
                  description: 'The vocabulary word',
                },
                wordType: {
                  type: 'string',
                  description: 'The grammatical type of the word',
                },
                translations: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Array of translations for the word',
                },
              },
              additionalProperties: false,
              required: ['word', 'wordType', 'translations'],
            },
          },
        },
        additionalProperties: false,
        required: ['setId', 'setName', 'entries'],
      },
      annotations: {
        title: 'Update Lexica Set',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
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
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_lexica_sets': {
        const params = args || {};
        logger.debug('Executing get_lexica_sets tool', { params });
        const result = await getSets(params);
        logger.debug('get_lexica_sets completed', { success: !result.error, resultCount: result.data?.data?.length });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
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
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_lexica_set': {
        const payload = args as CreateSetRequestPayload;
        logger.debug('Executing create_lexica_set tool', {
          setName: payload?.setName,
          entriesCount: payload?.entries?.length,
        });
        const result = await createSet(payload);
        logger.info('create_lexica_set completed', {
          setName: payload?.setName,
          success: !result.error,
          setId: result.data?.setId,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_lexica_set': {
        const { setId, ...updateData } = args as { setId: string } & UpdateSetRequestPayload;
        if (!setId) {
          logger.warn('update_lexica_set called without setId');
          throw new Error('setId is required');
        }

        logger.debug('Executing update_lexica_set tool', {
          setId,
          setName: updateData?.setName,
          entriesCount: updateData?.entries?.length,
        });
        const result = await updateSet(setId, updateData);
        logger.info('update_lexica_set completed', { setId, setName: updateData?.setName, success: !result.error });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
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
