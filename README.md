# LexicaNext

A modern English vocabulary learning application built with React and .NET, featuring interactive study modes and pronunciation support.

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-supported-blue.svg)](https://www.docker.com/)

## Features

- **Interactive Study Modes**
    - Spelling Mode - Practice spelling vocabulary words
    - Full Mode - Complete vocabulary practice with all word details
    - Open Questions Mode - Answer open-ended questions about vocabulary
- **Audio Pronunciation** - Integration with English Dictionary API
- **User Authentication** - Secure login with Auth0
- **Real-time Updates** - Live synchronization across sessions
- **Responsive Design** - Modern UI with Mantine components
- **Type Safety** - Full TypeScript support with auto-generated API types

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for build tooling and development
- **Mantine** UI component library
- **TanStack Query** for server state management
- **React Router 7** for navigation
- **Auth0** for authentication

### Backend

- **.NET 9.0** with C# 13
- **PostgreSQL** database
- **Entity Framework Core** for data access
- **Clean Architecture** with CQRS pattern
- **FluentValidation** for input validation
- **OpenAPI/Swagger** documentation

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+ and npm
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL](https://www.postgresql.org/) 13+
- [Docker](https://www.docker.com/) (optional)

### Development Setup

#### Backend Setup

1. **Initialize User Secrets**

   Create a user secrets file to store sensitive configuration data in the following projects:
    - `LexicaNext.WebApp`
    - `LexicaNext.Infrastructure`

2. **Database Setup**

   ```bash
   # Create database and apply migrations
   cd LexicaNext.Infrastructure
   dotnet ef database update
   ```

3. **Run Backend**

   ```bash
   # From repository root
   dotnet run --project LexicaNext.WebApp
   ```

#### Frontend Setup

1. **Install Dependencies**

   ```bash
   cd Frontend/lexica-next-front
   npm install
   ```

2. **Environment Configuration**

   Create environment files in `Frontend/lexica-next-front/env-config/`:
    - `.env.local` for development
    - Configure Auth0 credentials and API endpoints

3. **Run Frontend**

   ```bash
   npm run dev
   ```

## API Documentation

When running the application, the OpenAPI specification is available at:

- **Local Development**: `https://localhost:7226/openapi/v1.json`
- **Swagger UI**: `https://localhost:7226/swagger`

## Development Commands

### Frontend

```bash
cd Frontend/lexica-next-front

# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run prettier
```

### Backend

```bash
# Build solution
dotnet build LexicaNext.sln

# Run web application
dotnet run --project LexicaNext.WebApp

# Run CLI commands
dotnet run --project LexicaNext.CLI
```

### Database Management

```bash
cd LexicaNext.Infrastructure

# Create migration
dotnet ef migrations add <migration_name> -o Db\Migrations

# Apply migrations
dotnet ef database update
```

## Architecture

The application follows **Clean Architecture** principles:

- **Domain Layer** (`LexicaNext.Core`) - Business logic and domain models
- **Infrastructure Layer** (`LexicaNext.Infrastructure`) - Data access and external services
- **Presentation Layer** (`LexicaNext.WebApp`) - API endpoints and web hosting
- **Frontend** (`Frontend/lexica-next-front`) - React SPA with TypeScript

### Key Patterns

- **CQRS** - Command Query Responsibility Segregation
- **Repository Pattern** - Data access abstraction
- **Dependency Injection** - Service registration with Scrutor
- **Type Safety** - Auto-generated TypeScript types from OpenAPI

## License

This project is licensed under the MIT License.

## Tools and Extensions

### MCP Server (`Tools/mcp-server/`)

A Model Context Protocol (MCP) server that enables Claude to interact with the LexicaNext API. Provides tools for vocabulary set management operations.

```bash
cd Tools/mcp-server
npm install
npm run build
```

Available MCP tools:

- `get_lexica_status` - Check API status
- `get_lexica_sets` - Retrieve vocabulary sets
- `get_lexica_set` - Get specific set by ID
- `create_lexica_set` - Create new vocabulary set
- `update_lexica_set` - Update existing set

## Related Projects

Previous iterations of the Lexica vocabulary learning system:

- [R.Systems.Lexica](https://github.com/lrydzkowski/R.Systems.Lexica) - Original backend
- [R.Systems.ReactFront](https://github.com/lrydzkowski/R.Systems.ReactFront) - Original frontend
