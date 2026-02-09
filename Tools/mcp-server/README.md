# LexicaNext MCP Server

A Model Context Protocol (MCP) server that provides Claude with tools to interact with the LexicaNext vocabulary
learning application API.

## Overview

This MCP server enables Claude to perform vocabulary management operations through a standardized interface. It provides
tools for managing vocabulary sets, words, and AI-powered translation/sentence generation.

## Available Tools

### Status

- `get_lexica_status` - Check the API status of the LexicaNext service.

### Sets

- `get_lexica_sets` - Retrieve vocabulary sets with optional filtering, sorting, and pagination.
- `get_lexica_set` - Get a specific vocabulary set by ID, including its words.
- `create_lexica_set` - Create a new vocabulary set from existing word IDs (name is auto-generated).
- `update_lexica_set` - Update an existing vocabulary set by replacing its word IDs.
- `delete_lexica_sets` - Delete multiple vocabulary sets by their IDs.

### Words

- `get_lexica_words` - Retrieve words with optional filtering, sorting, and pagination.
- `get_lexica_word` - Get a specific word by ID, including translations and example sentences.
- `create_lexica_word` - Create a new word with translations and example sentences.
- `update_lexica_word` - Update an existing word by ID.
- `delete_lexica_words` - Delete multiple words by their IDs.
- `get_lexica_word_sets` - Get all vocabulary sets that contain a specific word.

### AI Generation

- `generate_lexica_translations` - Generate Polish translations for an English word using AI.
- `generate_lexica_sentences` - Generate example sentences for an English word using AI.

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:

   ```bash
   npm run build
   ```

3. Configure environment variables in `env-config/` directory

## Configuration

The server requires configuration for:

- API base URL for the LexicaNext service
- API key for authentication
- Logging settings

Configuration is loaded from the `env-config/.env` file.

## Usage

The server runs as a CLI tool and communicates via stdio transport with MCP clients:

```bash
npm run build
./build/index.js
```

## Development

- **Build**: `npm run build`
- **Format**: `npm run prettier`

## Logging

The server includes comprehensive logging with:

- Structured JSON logging using Winston
- Daily rotating log files in the `logs/` directory
- Separate error logging
- Debug and info level logging for tool operations and API calls

## License

MIT
