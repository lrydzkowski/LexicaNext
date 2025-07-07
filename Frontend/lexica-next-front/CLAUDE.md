# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build production bundle (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run prettier` - Format code with Prettier
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a React + TypeScript frontend application for a vocabulary learning platform called Lexica. The application is
built with:

**Core Stack:**

- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **React Router 7** for client-side routing
- **Mantine** UI component library
- **TanStack Query** for server state management
- **Auth0** for authentication

**Key Architecture Patterns:**

1. **Authentication Flow**: Uses Auth0 with `RequireAuth` and `NotRequireAuth` wrapper components that control access to
   routes
2. **API Integration**: Type-safe API client using `openapi-fetch` with auto-generated types from OpenAPI specification
3. **State Management**: TanStack Query for server state, React state for local UI state
4. **Routing**: Centralized route definitions in `src/config/links.ts` with protected routes wrapped in auth guards

## Project Structure

**Configuration:**

- `vite.config.ts` - Vite configuration with proxy setup for local API development
- `src/config/app-config.ts` - Environment-based configuration management
- `api-types/api-types.d.ts` - Auto-generated TypeScript types from OpenAPI spec

**Core Application:**

- `src/main.tsx` - Application entry point with provider setup
- `src/AppRouter.tsx` - Route definitions and navigation structure
- `src/hooks/api.ts` - Custom hooks for API operations (CRUD operations for sets, recordings)
- `src/services/api-client.ts` - HTTP client factory with authentication

**Feature Organization:**

- `src/components/sets/` - Vocabulary set management components
- `src/components/sets/modes/` - Different study modes (spelling, full mode, open questions)
- `src/pages/sets/` - Page components for set-related routes
- `src/components/auth/` - Authentication-related components
- `src/components/layout/` - Layout components including breadcrumbs

## Development Environment

**Environment Configuration:**

- Environment variables are loaded from `./env-config` directory
- Required variables: `VITE_API_BASE_PATH`, `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`,
  `VITE_AUTH0_SCOPE`

**API Development:**

- Development server proxies `/api` requests to `https://localhost:7226`
- Build output goes to `../../LexicaNext.WebApp/wwwroot` by default (configurable via `VITE_OUTPUT_DIR`)

## Key Features

**Study Modes:**

- Spelling Mode - Practice spelling vocabulary words
- Full Mode - Complete vocabulary practice
- Open Questions Mode - Answer open-ended questions about vocabulary

**Authentication:**

- Auth0 integration with token-based API authentication
- Route protection based on authentication state
- Automatic token refresh and request header injection

**API Communication:**

- Type-safe API calls using generated TypeScript types
- Automatic query invalidation and cache management
- Audio recording playback for pronunciation

## Additional Instructions

- Don't write comments.
