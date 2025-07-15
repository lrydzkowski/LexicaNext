# LexicaNext

A modern English vocabulary learning application built with React and .NET, featuring interactive study modes and pronunciation support.

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)

## Features

- Interactive Study Modes
  - Spelling Mode - Practice spelling vocabulary words
  - Full Mode - Complete vocabulary practice with all word details
  - Open Questions Mode - Answer open-ended questions about vocabulary
- Audio Pronunciation - Integration with English Dictionary API
- User Authentication - Secure login with Auth0
- Responsive Design - Modern UI with Mantine components

## Tech Stack

### Frontend

- React 19 with TypeScript
- Vite for build tooling and development
- Mantine UI component library
- OpenAPI fetch for strongly typed API integration
- TanStack Query for simplifying API calls
- React Router 7 for navigation
- Auth0 for authentication

### Backend

- .NET 9.0 with C# 13
- PostgreSQL database
- Entity Framework Core for data access
- Clean Architecture with CQRS pattern
- FluentValidation for input validation
- OpenAPI/Swagger documentation

## Getting Started

### Prerequisites

- [Node.js 22+ and npm](https://nodejs.org/)
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL 13+](https://www.postgresql.org/)

### Development Setup

#### Backend Setup

1. Create an empty PostgreSQL database.
2. Add a database connection string to user secrets in the following projects:

    - `LexicaNext.WebApp`
    - `LexicaNext.Infrastructure`

    It should look like the following:

    ```json
    {
      "ConnectionStrings": {
         "AppPostgresDb": "Server=<server>;Port=<port>;Database=<database_name>;User Id=<user_id>;Password=<user_password>"
      }
    }
    ```

3. Add other secrets to user secrets in `LexicaNext.WebApp` project.
4. Apply EF Core migration:

    ```powershell
   cd LexicaNext.Infrastructure
   dotnet ef database update
    ```

5. Run backend solution.

#### Frontend Setup

1. **Install Dependencies**

    ```powershell
    cd Frontend/lexica-next-front
    npm install
    ```

2. **Environment Configuration**

    Create environment files in `Frontend/lexica-next-front/env-config/`:
    
    - `.env.local` for development
    - Configure Auth0 credentials and API endpoints

3. **Run Frontend**

    ```powershell
    npm run dev
    ```

## API Documentation

When running the application locally, the OpenAPI specification is available at:

- Spec: <https://localhost:7226/openapi/v1.json>
- Swagger UI: <https://localhost:7226/swagger>

## Development Commands

### Frontend

```powershell
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

```powershell
# Build solution
dotnet build LexicaNext.sln

# Run web application
dotnet run --project LexicaNext.WebApp

# Run CLI commands
dotnet run --project LexicaNext.CLI
```

### Database Management

```powershell
cd LexicaNext.Infrastructure

# Create migration
dotnet ef migrations add <migration_name> -o Db\Migrations

# Apply migrations
dotnet ef database update
```

## Architecture

The application follows Clean Architecture principles:

- Domain Layer (`LexicaNext.Core`) - Business logic and domain models
- Infrastructure Layer (`LexicaNext.Infrastructure`) - Data access, auth and external services
- Presentation Layer (`LexicaNext.WebApp`) - API endpoints and web hosting
- Frontend (`Frontend/lexica-next-front`) - React SPA with TypeScript
- MCP Server (`Tools/mcp-server`) - MCP server to interact with the app through Claude Desktop

### Key Patterns

- CQRS - Command Query Responsibility Segregation
- Repository Pattern - Data access abstraction
- Dependency Injection - Service registration with Scrutor
- Type Safety - Auto-generated TypeScript types from OpenAPI

## Tools and Extensions

### MCP Server

A Model Context Protocol (MCP) server that enables Claude to interact with the LexicaNext API. Provides tools for vocabulary set management operations.

```powershell
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

## License

This project is licensed under the MIT License.
