# LexicaNext MCP Server

A Model Context Protocol (MCP) server that provides Claude with tools to interact with the LexicaNext vocabulary
learning application API.

## Overview

This MCP server enables Claude to perform vocabulary set management operations through a standardized interface. It
provides tools for reading, creating, and updating vocabulary sets in the LexicaNext application.

## Available Tools

- `get_lexica_status` - Check the API status of the LexicaNext service.
- `get_lexica_sets` - Retrieve vocabulary sets with optional filtering and pagination.
- `get_lexica_set` - Get a specific vocabulary set by ID.
- `create_lexica_set` - Create a new vocabulary set.
- `update_lexica_set` - Update an existing vocabulary set.

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
