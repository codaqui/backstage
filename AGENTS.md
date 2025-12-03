# 🤖 AI Agent Instructions for Codaqui Backstage Portal

## 📋 Project Overview

This is a **Backstage-based developer portal** for the Codaqui community, built as a monorepo using Yarn Berry v4.4.1. The portal serves as a centralized hub for resources, communication, and learning within the Codaqui technology community.

### 🏗️ Architecture

- **Framework**: Backstage (developer portal platform)
- **Frontend**: React 18.x with TypeScript, Material-UI v4.12.2
- **Backend**: Multi-service architecture with 4 specialized backends
- **Build Tool**: Webpack 5.96.0
- **Database**: PostgreSQL
- **Testing**: Jest and Playwright
- **Package Manager**: Yarn Berry v4.4.1
- **Styling**: Material-UI v4 with custom Codaqui theme (#57B593 green, #3A2F39 dark gray)

### 📁 Project Structure

```
codaqui-portal/
├── packages/
│   ├── app/                    # React frontend application
│   │   ├── src/
│   │   │   ├── components/     # Custom React components
│   │   │   │   └── home/
│   │   │   │       └── CodaquiWelcomeCard.tsx
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   │   └── useResourceCounts.ts
│   │   │   ├── theme/          # Material-UI theme configuration
│   │   │   │   └── codaquiTheme.ts
│   │   │   └── utils/          # Utility functions
│   │   └── package.json        # Frontend dependencies
│   │
│   ├── backend-main/           # Main backend (port 7007)
│   │   ├── src/
│   │   │   └── index.ts        # Auth, Scaffolder, Search, K8s, Permissions
│   │   └── package.json        # Backend dependencies
│   │
│   ├── backend-catalog/        # Catalog backend (port 7008)
│   │   ├── src/
│   │   │   ├── index.ts        # Catalog-specific backend config
│   │   │   └── transformers.ts # GitHub org transformers
│   │   └── package.json        # Catalog backend dependencies
│   │
│   ├── backend-techdocs/       # TechDocs backend (port 7009)
│   │   ├── src/
│   │   │   └── index.ts        # TechDocs generation and serving
│   │   └── package.json        # TechDocs backend dependencies
│   │
│   └── backend-common/         # Shared backend utilities
│       ├── src/
│       │   ├── extensions/     # Backend extensions
│       │   │   └── permissionsPolicyExtension.ts
│       │   ├── services/       # Shared services
│       │   │   └── discoveryService.ts
│       │   └── utils/          # Utility functions
│       │       └── runPeriodically.ts
│       └── package.json        # Common dependencies
│
├── app-config.yaml             # Main application configuration
├── app-config.main.yaml        # Backend-main specific config
├── app-config.catalog.yaml     # Backend-catalog specific config
├── app-config.techdocs.yaml    # Backend-techdocs specific config
├── docker-compose.yml          # Multi-service Docker setup
├── package.json                # Root monorepo configuration
└── yarn.lock                   # Yarn Berry lockfile
```

## 🔧 Development Environment Setup

### Prerequisites

- Node.js (20 or 22)
- Yarn Berry v4.4.1
- Podman & Podman Compose (for containerized development)
- PostgreSQL (via Podman)

### Quick Start

```bash
# Install dependencies
yarn install

# Set up environment (copy and configure .env files)
cp .env.example .env
# Edit .env with your actual values

# Start all services via Podman Compose
yarn docker:up:build

# Or start individual services
yarn start         # Frontend (port 3000)
yarn build:backend # Build backends
# Then run backends individually if needed
```

### Available Scripts

Based on analysis of package.json:

```bash
# Development
yarn dev                    # Alias for start
yarn start                  # Start frontend dev server

# Building
yarn build                  # Build current package
yarn build:backend          # Build all backends (main, catalog, techdocs)
yarn build:backend-main     # Build backend-main
yarn build:backend-catalog  # Build backend-catalog
yarn build:backend-techdocs # Build backend-techdocs
yarn build:all              # Build all packages

# Testing
yarn test                   # Run tests
yarn test:all               # Run tests with coverage
yarn test:e2e               # Run Playwright e2e tests

# Code Quality
yarn lint                   # Lint since origin/main
yarn lint:all               # Lint all files
yarn lint:fix               # Fix linting issues
yarn type-check             # TypeScript type checking
yarn type-check:watch       # Watch mode type checking
yarn format                 # Format code with Prettier
yarn format:check           # Check formatting
yarn quality:check          # Lint + type-check + format check
yarn quality:fix            # Fix linting and formatting
yarn validate               # Quality check + tests
yarn validate:ci            # Full CI validation

# Docker (Podman)
yarn docker:build           # Build all containers
yarn docker:build:frontend  # Build frontend container
yarn docker:build:backend   # Build backend containers
yarn docker:build:main      # Build backend-main container
yarn docker:build:catalog   # Build backend-catalog container
yarn docker:build:techdocs  # Build backend-techdocs container
yarn docker:up              # Start containers
yarn docker:up:build        # Build and start containers
yarn docker:down            # Stop containers
yarn docker:logs            # View container logs

# Utilities
yarn clean                  # Clean build artifacts
yarn new                    # Create new Backstage component
yarn setup                  # Initial setup
yarn setup:complete         # Complete setup with validation
```

## 🎨 Code Patterns & Conventions

### Frontend Patterns

#### Custom Hooks

```typescript
// packages/app/src/hooks/useResourceCounts.ts
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useAsync } from 'react-use';

export interface SystemResourceCount {
  whatsapp: number;
  learningResources: number;
  socialResources: number;
  total: number;
}

export function useResourceCounts(): {
  counts: SystemResourceCount | undefined;
  loading: boolean;
  error: Error | undefined;
} {
  const catalogApi = useApi(catalogApiRef);

  const { value, loading, error } = useAsync(async () => {
    // Implementation using Backstage catalog API
  }, []);

  return { counts: value, loading, error };
}
```

#### Material-UI Components with Custom Theme

```typescript
// packages/app/src/components/home/CodaquiWelcomeCard.tsx
import { Box, Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  card: {
    height: '100%',
  },
  highlight: {
    color: theme.palette.primary.main, // Uses custom Codaqui green
    fontWeight: 'bold',
  },
}));

export const CodaquiWelcomeCard = (): JSX.Element => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          👋 Bem-vindo à Comunidade Codaqui!
        </Typography>
        <Typography variant="body1" paragraph>
          Este é o{' '}
          <span className={classes.highlight}>portal centralizado</span> de
          recursos da Codaqui.
        </Typography>
      </CardContent>
    </Card>
  );
};
```

#### Custom Theme Configuration

```typescript
// packages/app/src/theme/codaquiTheme.ts
import { createTheme } from '@material-ui/core/styles';

export const codaquiTheme = createTheme({
  palette: {
    primary: {
      main: '#57B593', // Codaqui green
    },
    secondary: {
      main: '#3A2F39', // Codaqui dark gray
    },
  },
  // Additional theme customizations...
});
```

### Backend Patterns

#### Backend Module Registration

```typescript
// packages/backend-main/src/index.ts
import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';

const backend = createBackend();

// Custom startup logging module
const logStartupConfig = createBackendModule({
  pluginId: 'app',
  moduleId: 'startup-logger',
  register(env) {
    env.registerInit({
      deps: { logger: coreServices.logger },
      async init({ logger }) {
        logger.info('🚀 Backend Main starting up');
        // Log environment configuration
      },
    });
  },
});

backend.add(logStartupConfig);

// Add Backstage plugins
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-catalog-backend'));
// ... more plugins

backend.start();
```

#### Custom Transformers

```typescript
// packages/backend-catalog/src/transformers.ts
import type {
  TeamTransformer,
  UserTransformer,
} from '@backstage/plugin-catalog-backend-module-github';

export const myTeamTransformer: TeamTransformer = async (team, ctx) => {
  const backstageTeam = await defaultOrganizationTeamTransformer(team, ctx);
  if (backstageTeam && backstageTeam.spec) {
    backstageTeam.metadata.description = 'Integrated via GitHub Org Provider';
    backstageTeam.metadata.labels = {
      ...backstageTeam.metadata.labels,
      'github-org-integration': 'true',
    };
  }
  return backstageTeam;
};
```

#### Advanced Permission System

```typescript
// packages/backend-common/src/extensions/permissionsPolicyExtension.ts
const SPECIAL_GROUPS = {
  guests: ['user:default/guest', 'group:default/guests'],
  conselho: ['group:default/conselho'],
} as const;

const GROUP_PERMISSIONS: GroupPermissions = {
  conselho: ['announcement.entity.*'],
  guests: ['*.read'],
} as const;

class CustomPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    // Complex permission logic with wildcard support
    // Group-based permissions, ownership checks, etc.
  }
}
```

## 🔌 Key Backstage Plugins & Integrations

### Core Plugins

- **Catalog**: Entity management and discovery
- **Auth**: GitHub OAuth + Guest provider
- **Scaffolder**: Template-based project creation
- **TechDocs**: Documentation hosting
- **Search**: Full-text search with PostgreSQL backend
- **Kubernetes**: Cluster integration (optional)
- **Notifications**: User notifications system
- **Announcements**: Community announcements

### Custom Extensions

- **Custom Discovery Service**: Service-to-service communication
- **GitHub Org Integration**: Team/user sync with custom transformers
- **Advanced Permission Policy**: Group-based permissions with wildcards
- **Codaqui Theme**: Custom Material-UI theme
- **Resource Counting**: Dynamic resource statistics

## 🗄️ Database & Data Models

### PostgreSQL Schema

- **Search Index**: Full-text search data
- **User Sessions**: Authentication state
- **Catalog Entities**: Backstage catalog data
- **Audit Logs**: Permission and action logs

### Key Entity Types

- **Components**: Software projects and services
- **Users**: Community members (GitHub integration)
- **Groups**: Teams and organizations
- **Systems**: Logical groupings
- **Resources**: Learning materials, social links, etc.

## 🚀 Deployment & Infrastructure

### Docker Compose Setup

The project uses Podman Compose with profiles for different deployment scenarios:

- **standard**: Basic services (postgres, backend-catalog, backend-techdocs, backend-main, frontend)
- **kubernetes**: Optional kubectl proxy for local Kubernetes testing

```
                              ┌─────────────────┐
                              │   PostgreSQL    │
                              │    (port 5432)  │
                              └────────┬────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       │                               │                               │
       ▼                               ▼                               ▼
┌─────────────────┐           ┌──────────────────┐           ┌───────────────────┐
│  backend-main   │◀─────────▶│  backend-catalog │◀─────────▶│  backend-techdocs │
│   (port 7007)   │           │    (port 7008)   │           │    (port 7009)    │
│                 │           │                  │           │                   │
│ • Auth          │           │ • Catalog        │           │ • TechDocs        │
│ • Scaffolder    │           │ • GitHub Org     │           │ • Static files    │
│ • Search        │           │ • Entity sync    │           │ • Doc generation  │
│ • Permissions   │           │                  │           │                   │
│ • Notifications │           │                  │           │                   │
└────────┬────────┘           └────────┬─────────┘           └─────────┬─────────┘
         │                             │                               │
         │         ┌───────────────────┴───────────────────┐           │
         │         │      Custom Discovery Service         │           │
         │         │  (service-to-service communication)   │           │
         │         └───────────────────────────────────────┘           │
         │                             │                               │
         └─────────────────────────────┼───────────────────────────────┘
                                       │
                              ┌────────▼────────┐
                              │     NGINX       │
                              │  (port 3000)    │
                              │                 │
                              │ /api/           │──▶ backend-main
                              │ /api/catalog/   │──▶ backend-catalog
                              │ /api/techdocs/  │──▶ backend-techdocs
                              │ /*              │──▶ static frontend
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │     Browser     │
                              │  (localhost)    │
                              └─────────────────┘
```

```bash
# Start standard services
yarn docker:up

# Start with Kubernetes integration
CODAQUI_TESTING_WITH_KUBERNETES=true yarn docker:up

# Build and start
yarn docker:up:build
```

Services include health checks and proper dependency management.

### Environment Variables

Based on .env.example, key variables include:

```bash
# Database
POSTGRES_HOST="postgres"
POSTGRES_PORT="5432"
POSTGRES_USER="backstage"
POSTGRES_PASSWORD="change-this-password"
POSTGRES_DB="backstage"

# GitHub OAuth
GITHUB_CLIENT_ID="your-oauth-app-client-id"
GITHUB_CLIENT_SECRET="your-oauth-app-client-secret"

# GitHub App (Org Integration)
GITHUB_ORG_APP_ID="your-github-app-id"
GITHUB_ORG_WEBHOOK_URL="your-webhook-url-or-smee-url"
GITHUB_ORG_CLIENT_ID="your-github-app-client-id"
GITHUB_ORG_CLIENT_SECRET="your-github-app-client-secret"
GITHUB_ORG_WEBHOOK_SECRET="your-webhook-secret"
GITHUB_ORG_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nyour-private-key-content-here\n-----END RSA PRIVATE KEY-----"

# Application
NODE_ENV="development"
BACKEND_SECRET="change-this-to-a-random-secret-in-production"

# Service URLs (auto-configured in Docker)
CATALOG_SERVICE_URL="http://localhost:7008"
TECHDOCS_SERVICE_URL="http://localhost:7009"
MAIN_SERVICE_URL="http://localhost:7007"

# Kubernetes (optional)
CODAQUI_TESTING_WITH_KUBERNETES="false"
```

## 🧪 Testing Strategy

### Frontend Testing

```typescript
// Example test with React Testing Library
import { render, screen } from '@testing-library/react';
import { CodaquiWelcomeCard } from './CodaquiWelcomeCard';

describe('CodaquiWelcomeCard', () => {
  it('renders welcome message', () => {
    render(<CodaquiWelcomeCard />);
    expect(
      screen.getByText('Bem-vindo à Comunidade Codaqui!'),
    ).toBeInTheDocument();
  });
});
```

### Backend Testing

- Unit tests for utilities and transformers
- Integration tests for API endpoints
- Permission policy tests
- Plugin configuration tests

### E2E Testing

Uses Playwright for end-to-end testing:

```bash
yarn test:e2e
```

## 🔒 Security & Permissions

### Permission Levels

1. **Unauthenticated**: Read-only access to public resources
2. **Guest**: Authenticated read-only access
3. **Authenticated**: Full read + ownership-based write access
4. **Special Groups**: Custom permissions (e.g., conselho can manage announcements)

### Key Security Features

- GitHub OAuth integration
- Guest authentication provider
- Ownership-based resource permissions
- Audit logging
- CORS configuration
- Secret management

## 📚 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Backstage configuration
- **Prettier**: Consistent formatting
- **Import Order**: Backstage > external > internal

### Git Workflow

- Feature branches from `main`
- Pull requests with reviews
- Automated testing on PR
- Semantic versioning for releases

### Documentation

- **README.md**: Project overview and setup
- **AGENTS.md**: AI agent instructions (this file)
- Inline code documentation
- API documentation via TechDocs

## 🐛 Common Issues & Solutions

### Build Issues

- **Yarn Berry conflicts**: Delete `node_modules` and `yarn.lock`, then `yarn install`
- **TypeScript errors**: Check `@backstage/*` version compatibility
- **Material-UI warnings**: Ensure v4 compatibility (not v5)

### Runtime Issues

- **Database connection**: Check PostgreSQL container is running
- **Auth failures**: Verify GitHub OAuth configuration
- **Permission denied**: Check user group membership and permission policies

### Development Issues

- **Hot reload not working**: Restart dev servers
- **Plugin conflicts**: Check plugin version compatibility
- **Theme not applying**: Clear browser cache, check theme imports

## 🎯 AI Agent Responsibilities

When working on this project, you should:

1. **Use correct technologies**: Backstage, Material-UI v4, Webpack, PostgreSQL, Jest, Playwright
2. **Follow monorepo structure**: Respect package boundaries and dependencies
3. **Implement Backstage patterns**: Use proper plugin architecture and APIs
4. **Apply custom theme**: Use Codaqui colors (#57B593, #3A2F39) consistently
5. **Handle permissions**: Implement proper authorization checks
6. **Test thoroughly**: Write tests for new functionality
7. **Document changes**: Update relevant documentation

Remember: This is a Backstage portal for a Brazilian technology community focused on democratizing tech education. Keep implementations accessible, inclusive, and community-oriented.
