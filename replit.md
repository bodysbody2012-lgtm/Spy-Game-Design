# Replit.md - SpyGame

## Overview

SpyGame is a multiplayer social deduction game built as a full-stack web application. Players join game sessions where one player is secretly assigned as the "spy" while others receive a secret word from a chosen category. Through questioning rounds, players try to identify the spy while the spy attempts to blend in without knowing the secret word.

The application features user authentication, score tracking, a leaderboard system, and an admin dashboard for game management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local component state for UI
- **Styling**: Tailwind CSS with custom design system (dark theme, neon/cyberpunk aesthetic)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Build Tool**: Vite with hot module replacement

The frontend follows a page-based structure with:
- Authentication pages (login, register)
- Main menu and navigation
- Game flow pages (mode selection, setup, play, vote, result)
- Admin dashboard and leaderboard

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express-session with MemoryStore (development) and connect-pg-simple support
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation schemas

Key architectural decisions:
- Shared schema definitions between frontend and backend via `shared/` directory
- Type-safe API contracts using Zod schemas
- Session-based authentication with token versioning for security
- Role-based access control (admin vs regular users)

### Data Storage
- **Database**: PostgreSQL accessed via Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Tables**: 
  - `users`: Player accounts with scores, games played, and admin status
  - `site_stats`: Visit tracking for analytics
- **Migrations**: Drizzle Kit with push-based schema sync (`db:push`)

### Authentication Flow
- Session-based auth stored server-side
- Token versioning to invalidate sessions on password changes
- Admin detection via username check ("admin")
- Protected routes use `requireAuth` and `requireAdmin` middleware

### Game Logic
- Game state managed client-side in `use-game-logic.ts` hook
- Categories with predefined word lists (football, heroes, tech, games, food, countries, cars)
- Session data persisted to localStorage during active games
- Pass-and-play mechanics for local multiplayer

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations

### UI/Component Libraries
- Radix UI primitives (dialogs, dropdowns, forms, etc.)
- shadcn/ui styled components
- Lucide React icons
- Framer Motion for animations (referenced in requirements)

### Development Tools
- Vite development server with Replit-specific plugins
- TypeScript with strict mode
- ESBuild for production server bundling

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Optional, defaults to "spygame_secret" in development