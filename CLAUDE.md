# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React + TypeScript)
Navigate to `Frontend/lexica-next-front/` directory:
- `npm run dev` - Start development server with Vite
- `npm run build` - Build production bundle (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run prettier` - Format code with Prettier
- `npm run preview` - Preview production build locally

### Backend (.NET 9.0)
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

## Architecture Overview

This is a full-stack English vocabulary learning application with a React frontend and .NET backend.

### Frontend Architecture
**Tech Stack:** React 19, TypeScript, Vite, Mantine UI, TanStack Query, Auth0

**Key Patterns:**
- **Route Protection**: `RequireAuth` and `NotRequireAuth` components control access
- **API Integration**: Type-safe client using `openapi-fetch` with auto-generated types
- **State Management**: TanStack Query for server state, React state for UI
- **Configuration**: Environment-based config in `src/config/app-config.ts`

**Study Modes:**
- Spelling Mode - Practice spelling vocabulary words
- Full Mode - Complete vocabulary practice  
- Open Questions Mode - Answer open-ended questions

### Backend Architecture
**Tech Stack:** .NET 9.0, PostgreSQL, Entity Framework Core, Auth0, Docker

**Clean Architecture Pattern:**
- **LexicaNext.Core**: Domain models, CQRS commands/queries, business logic
- **LexicaNext.Infrastructure**: Data access, external services, repositories
- **LexicaNext.WebApp**: API endpoints, authentication, configuration
- **LexicaNext.CLI**: Data seeding and utility commands

**Key Patterns:**
- **CQRS**: Separate commands (CreateSet, UpdateSet, DeleteSet) and queries (GetSet, GetSets)
- **Repository Pattern**: Interfaces in Core, implementations in Infrastructure
- **Dependency Injection**: Automatic service registration with Scrutor using marker interfaces
- **Minimal APIs**: Each operation has dedicated endpoint class

**Domain Models:**
- `Set`: Main vocabulary set aggregate
- `Entry`: Individual word with translations
- `WordType`: Enumeration for grammatical categories
- `Recording`: Audio pronunciation files

### Database Schema
PostgreSQL with Entity Framework Core:
- `set` - Vocabulary sets with metadata
- `word` - Individual words with order and type
- `translation` - Word translations with order
- `word_type` - Grammatical categories (seeded data)
- `recording` - Audio pronunciation files

### API Endpoints
RESTful API at `/api/sets`:
- `GET /api/sets` - List sets (paginated, sortable, filterable)
- `GET /api/sets/{id}` - Get specific set
- `POST /api/sets` - Create new set
- `PUT /api/sets/{id}` - Update set
- `DELETE /api/sets/{id}` - Delete set
- `GET /api/recordings/{word}/{wordType}` - Get pronunciation

### Authentication
Auth0 integration with JWT Bearer tokens and role-based authorization.

### Development Environment
- Frontend dev server proxies `/api` requests to `https://localhost:7226`
- Frontend build output goes to `LexicaNext.WebApp/wwwroot`
- Environment variables loaded from `Frontend/lexica-next-front/env-config` directory
- OpenAPI spec available at: `https://localhost:7226/openapi/v1.json`

### Key Features
- **Type Safety**: Auto-generated TypeScript types from OpenAPI specification
- **Real-time Updates**: TanStack Query for cache management and invalidation
- **Audio Playback**: Integration with English Dictionary API for pronunciation
- **Comprehensive Validation**: FluentValidation for input validation
- **Modern .NET**: Nullable reference types, treat warnings as errors
- **Health Checks**: Database and external service monitoring
- **Docker Support**: Multi-stage builds with Node.js frontend and .NET backend

## Project Structure

### Frontend (`Frontend/lexica-next-front/`)
- `src/config/` - Environment configuration and route definitions
- `src/components/sets/` - Vocabulary set management UI
- `src/components/sets/modes/` - Study mode implementations
- `src/components/auth/` - Authentication components
- `src/hooks/api.ts` - Custom hooks for API operations
- `src/services/api-client.ts` - HTTP client with auth
- `api-types/api-types.d.ts` - Auto-generated API types

### Backend
- `LexicaNext.Core/Commands/` - CQRS command handlers
- `LexicaNext.Core/Queries/` - CQRS query handlers  
- `LexicaNext.Infrastructure/Db/` - Database context and repositories
- `LexicaNext.Infrastructure/EnglishDictionary/` - External API integration
- `LexicaNext.WebApp/` - API endpoints and configuration