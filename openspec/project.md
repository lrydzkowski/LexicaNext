# LexicaNext

A comprehensive English vocabulary learning platform designed to help you master new words through various interactive learning modes.

## Architecture & Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine UI
- **State Management**: TanStack Query
- **Routing**: React Router 7
- **Authentication**: Auth0

### Backend
- **Framework**: .NET 10.0 (ASP.NET Core)
- **Database**: PostgreSQL with Entity Framework Core
- **Architecture**: Clean Architecture with CQRS pattern
- **Validation**: FluentValidation
- **Documentation**: OpenAPI/Swagger

### Key Patterns
- **CQRS**: Command Query Responsibility Segregation for separating read and write operations
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Service registration with Scrutor
- **Type Safety**: Auto-generated TypeScript types from OpenAPI specification

## Project Structure

### Frontend (`Frontend/lexica-next-front/`)
- `src/config/`: Environment configuration and route definitions
- `src/components/sets/`: Vocabulary set management UI
- `src/components/sets/modes/`: Study mode implementations
- `src/components/auth/`: Authentication components
- `src/hooks/api.ts`: Custom hooks for API operations
- `src/services/api-client.ts`: HTTP client with auth
- `api-types/api-types.d.ts`: Auto-generated API types

### Backend
- `LexicaNext.Core/Commands/`: CQRS command handlers
- `LexicaNext.Core/Queries/`: CQRS query handlers
- `LexicaNext.Infrastructure/Db/`: Database context and repositories
- `LexicaNext.Infrastructure/EnglishDictionary/`: External API integration
- `LexicaNext.WebApp/`: API endpoints and configuration

### Tools (`Tools/mcp-server/`)
- MCP server for Claude Desktop integration

## Development Guidelines

### General

- When you generate code, don't use comments.
- When you analyze existing code, don't go up in the files hierarchy. In other words, treat the current directory as the main directory of the current project.
- Use return early pattern.
- When you generate markdown, you should follow markdown lint rules: <https://github.com/DavidAnson/markdownlint/tree/v0.39.0/doc>

### Philosophy

#### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

#### Simplicity Means

- Single responsibility per function/class
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

### Technical Standards

#### Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

#### Error Handling

- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions

### Decision Framework

When multiple valid approaches exist, choose based on:

1. **Testability** - Can I easily test this?
2. **Readability** - Will someone understand this in 6 months?
3. **Consistency** - Does this match project patterns?
4. **Simplicity** - Is this the simplest solution that works?
5. **Reversibility** - How hard to change later?

### Project Integration

#### Learning the Codebase

- Find 3 similar features/components
- Identify common patterns and conventions
- Use same libraries/utilities when possible
- Follow existing test patterns

#### Tooling

- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Development Commands

### Frontend

Navigate to `Frontend/lexica-next-front/` directory:

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint
- `npm run prettier` - Format code

### Backend

From repository root:

- `dotnet build LexicaNext.sln` - Build entire solution
- `dotnet run --project LexicaNext.WebApp` - Run web application
- `dotnet run --project LexicaNext.CLI` - Run CLI commands

### Database Management

From `LexicaNext.Infrastructure` directory:

- `dotnet ef migrations add <migration_name> -o Db\Migrations` - Create EF Core migration
- `dotnet ef database update` - Apply migrations to database

### Docker Deployment

From repository root:

- `docker compose -f ./compose.yaml -p lexica-next up --build` - Build and run entire stack
