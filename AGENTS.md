# AGENTS.md - AI Agent Instructions for Codaqui Backstage Portal

> **📖 Note for Human Contributors:** This document contains technical guidelines, architecture decisions, and patterns for both human and AI contributors. Please read this file before making changes to understand the project structure and conventions.

## 📋 Project Overview

This repository contains the **Codaqui Backstage Portal**, a developer portal built with [Backstage](https://backstage.io) that provides a unified interface for managing software components, APIs, documentation, and community resources.

### Basic Information

- **Framework**: Backstage (Open Platform for building developer portals)
- **Language**: TypeScript, React
- **Package Manager**: Yarn (Berry/v4)
- **Container Runtime**: Podman/Docker
- **Node Version**: 22+ (managed via nvm)
- **Repository**: https://github.com/codaqui/backstage
- **Organization**: Codaqui (CNPJ 44.593.429/0001-05)
- **Status**: Beta (no changelog yet)

## 🎯 Project Objectives

1. **Developer Portal**: Centralize documentation, APIs, and services
2. **Community Hub**: Showcase WhatsApp groups, Discord channels, learning paths
3. **Software Templates**: Provide templates for common projects
4. **Permission Management**: Implement role-based access control
5. **GitHub Integration**: Sync GitHub organization data
6. **Brand Identity**: Maintain Codaqui visual identity (green #57B593)

## 📁 Project Structure

```
codaqui-portal/
├── packages/
│   ├── app/                          # Frontend React application
│   │   └── src/
│   │       ├── assets/               # Static assets
│   │       │   └── logos/            # Codaqui logos
│   │       │       ├── codaqui-full.svg    # Full color logo
│   │       │       └── codaqui-mono.svg    # Monochrome (sidebar)
│   │       ├── components/           # React components
│   │       │   ├── home/             # Home page components
│   │       │   │   ├── HomePage.tsx
│   │       │   │   ├── CodaquiWelcomeCard.tsx
│   │       │   │   ├── WhatsAppGroupsCard.tsx
│   │       │   │   └── index.ts
│   │       │   ├── Root/             # Root layout & navigation
│   │       │   │   ├── Root.tsx
│   │       │   │   ├── LogoFull.tsx
│   │       │   │   └── LogoIcon.tsx
│   │       │   ├── catalog/          # Catalog components
│   │       │   └── search/           # Search components
│   │       ├── pages/                # Full pages (routes)
│   │       │   ├── WhatsAppGroupsPage.tsx
│   │       │   └── index.ts
│   │       ├── hooks/                # Custom React hooks
│   │       │   ├── useWhatsAppGroups.ts
│   │       │   ├── useResourceCounts.ts
│   │       │   └── index.ts
│   │       ├── utils/                # Pure functions & types
│   │       │   ├── types.ts          # TypeScript interfaces
│   │       │   ├── helpers.ts        # Helper functions
│   │       │   └── index.ts
│   │       ├── theme/                # Custom themes
│   │       │   └── codaquiTheme.ts   # Light & dark themes
│   │       ├── App.tsx               # Main app config & routes
│   │       └── apis.ts               # API configuration
│   ├── backend-common/               # Shared Backend Code
│   │   ├── src/
│   │   │   ├── extensions/
│   │   │   │   └── permissionsPolicyExtension.ts  # Shared permission policy
│   │   │   ├── services/
│   │   │   │   └── discoveryService.ts            # Shared discovery service
│   │   │   ├── utils/
│   │   │   │   └── runPeriodically.ts             # Periodic task runner
│   │   │   └── index.ts              # Exports all shared code
│   │   └── package.json
│   ├── backend-catalog/              # Backend Catalog (Port 7008)
│   │   ├── src/
│   │   │   ├── index.ts              # Discovery Service + Catalog plugins
│   │   │   ├── transformers.ts       # GitHub org transformers
│   │   │   └── utils/
│   │   └── package.json
│   ├── backend-main/                 # Backend Main (Port 7007)
│   │   ├── src/
│   │   │   ├── index.ts              # Discovery Service + other plugins
│   │   │   └── utils/
│   │   └── package.json
│   └── plugins/                      # Custom Backstage plugins
├── default/                          # Default entities (organized by context)
│   ├── common/                       # Always loaded resources
│   │   ├── guest.yaml                # Guest user/group config
│   │   ├── system-general.yaml       # General system entity
│   │   ├── system-learning-resources.yaml  # Learning resources system
│   │   ├── system-social-resources.yaml    # Social resources system
│   │   └── system-whatsapp-groups.yaml     # WhatsApp groups system
│   ├── k8s/                          # Kubernetes-specific resources
│   │   ├── .gitkeep                  # Keeps folder in git
│   │   ├── catalog-info.yaml         # K8s sample component
│   │   └── deployment.yaml           # K8s deployment manifest
│   └── templates/                    # Software templates
│       └── favorite-animal/          # Example template
│           └── template.yaml
├── docs/                             # Documentation files
├── docker/                           # Docker-related files
├── app-config.yaml                   # Main Backstage config (base)
├── app-config.catalog.yaml           # Backend-catalog overrides (port 7008)
├── app-config.main.yaml              # Backend-main overrides (port 7007)
├── app-config.frontend.yaml          # Frontend-specific (nginx proxy)
├── app-config.docker.yaml            # Docker-specific config
├── app-config.production.yaml        # Production config
├── Dockerfile.backend                # Backend multi-stage build
├── Dockerfile.frontend               # Frontend build
├── docker-compose.yml                # Podman/Docker compose
├── catalog-info.yaml                 # Backstage catalog descriptor
├── .env.example                      # Environment variables template
├── README.md                         # User-facing documentation
└── AGENTS.md                         # This file (technical guide)
```

## 🏗️ Multi-Backend Architecture

### Overview

This project implements a **microservices architecture** with two independent backends that communicate via a custom **Discovery Service**, plus a **shared code package** for common utilities:

#### 0. **backend-common** (Shared Library)
**Purpose:** DRY principle - avoid code duplication between backends

**What's shared:**
- `permissionsPolicyExtension.ts` - Custom RBAC policy (used by both backends)
- `discoveryService.ts` - Custom Discovery Service for multi-backend communication
- `runPeriodically.ts` - Utility for periodic tasks

**Package name:** `@internal/backend-common`

**Usage:**
```typescript
// In backend-catalog or backend-main
import { 
  permissionsPolicyExtension, 
  customDiscoveryServiceFactory,
  runPeriodically 
} from '@internal/backend-common';

backend.add(customDiscoveryServiceFactory);
backend.add(permissionsPolicyExtension);
```

**Why this matters:**
- ✅ Single source of truth for shared logic
- ✅ Easier maintenance (update once, applies everywhere)
- ✅ Consistent behavior across backends
- ✅ Follows monorepo best practices
- ✅ Scalable - new backends just import and use

#### 1. **backend-catalog** (Port 7008)
**Responsibilities:**
- Catalog entities management (Components, Systems, APIs, etc)
- GitHub PAT integration (repository discovery)
- GitHub App integration (organization, teams, users)
- Custom transformers (`myTeamTransformer`, `myUserTransformer`)
- Custom Discovery Service (from backend-common)

**Key Files:**
- `packages/backend-catalog/src/index.ts` - Main entry with Catalog plugins
- `packages/backend-catalog/src/transformers.ts` - GitHub org entity transformers

**Plugins:**
- `@backstage/plugin-catalog-backend`
- `@backstage/plugin-catalog-backend-module-github`
- `@backstage/plugin-catalog-backend-module-github-org`

#### 2. **backend-main** (Port 7007)
**Responsibilities:**
- Authentication (GitHub OAuth + Guest)
- Scaffolder (software templates)
- TechDocs (documentation)
- Search (with PostgreSQL)
- Kubernetes integration
- Custom Permission Policy
- Notifications + Signals
- Proxy plugin (for frontend requests)
- Custom Discovery Service (from backend-common)

**Key Files:**
- `packages/backend-main/src/index.ts` - Main entry with all plugins
- `packages/backend-common/src/extensions/permissionsPolicyExtension.ts` - Shared custom RBAC policy
- `packages/backend-common/src/services/discoveryService.ts` - Shared discovery service

**Plugins:**
- `@backstage/plugin-auth-backend`
- `@backstage/plugin-scaffolder-backend`
- `@backstage/plugin-techdocs-backend`
- `@backstage/plugin-search-backend`
- `@backstage/plugin-kubernetes-backend`
- `@backstage/plugin-permission-backend`
- `@backstage/plugin-notifications-backend`
- `@backstage/plugin-signals-backend`
- `@backstage/plugin-proxy-backend`

### Discovery Service Pattern

**Both backends use the shared Custom Discovery Service** from `@internal/backend-common`.

The Discovery Service maps plugin IDs to their backend service URLs, enabling **direct service-to-service communication** without HTTP proxy overhead.

**Implementation** (`packages/backend-common/src/services/discoveryService.ts`):

```typescript
class CustomDiscoveryService implements DiscoveryService {
  private readonly serviceMap: Map<string, string>;

  constructor() {
    this.serviceMap = new Map([
      // Catalog service (backend-catalog)
      ['catalog', process.env.CATALOG_SERVICE_URL || 'http://localhost:7008'],
      
      // Main service plugins (backend-main)
      ['auth', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['proxy', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['scaffolder', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['techdocs', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['search', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['kubernetes', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['permission', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['notifications', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['signals', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
    ]);
  }

  async getBaseUrl(pluginId: string): Promise<string> {
    const url = this.serviceMap.get(pluginId);
    if (!url) {
      throw new Error(
        `No service URL configured for plugin: ${pluginId}. ` +
        `Available plugins: ${Array.from(this.serviceMap.keys()).join(', ')}`
      );
    }
    const fullUrl = `${url}/api/${pluginId}`;
    console.log(`🔍 Discovery: ${pluginId} → ${fullUrl}`);
    return fullUrl;
  }

  async getExternalBaseUrl(pluginId: string): Promise<string> {
    return this.getBaseUrl(pluginId);
  }
}

// Export as service factory
export const customDiscoveryServiceFactory = createServiceFactory({
  service: coreServices.discovery,
  deps: {},
  async factory() {
    return new CustomDiscoveryService();
  },
});
```

**Why Custom Discovery Service?**
- ✅ **Zero overhead**: Direct backend-to-backend calls (no proxy hop)
- ✅ **Kubernetes ready**: Works with K8s service names (e.g., `backend-catalog.namespace.svc.cluster.local`)
- ✅ **Scalable**: Easy to add new backends - just update the service map
- ✅ **Observable**: Logs every discovery call for debugging

### Configuration Structure

```yaml
# app-config.yaml (base - shared by both backends)
app:
  title: Codaqui Portal
  baseUrl: http://localhost:3000
backend:
  baseUrl: http://localhost:7007  # Main backend
  database: # PostgreSQL shared
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}  # PAT for repo access
      # GitHub App loaded from env vars (app-config.docker.yaml)
catalog:
  providers:
    github:
      codaquiPortal:
        organization: 'codaqui'
      githubOrg:
        id: 'production'
        orgUrl: 'https://github.com/codaqui'
# ... techdocs, auth, scaffolder configs ...

# app-config.catalog.yaml (backend-catalog overrides)
backend:
  listen:
    port: 7008  # Override port
  cors:
    origin:
      - http://localhost:3000
      - http://localhost:7007

# app-config.main.yaml (backend-main overrides)
backend:
  auth:
    keys:
      - secret: ${BACKEND_SECRET}
  cors:
    origin:
      - http://backend-catalog:7008
      - http://localhost:7008
      - http://localhost:3000

# Note: No proxy needed - Custom DiscoveryService handles direct backend-to-backend communication
```

### API Gateway Architecture

The portal uses **NGINX as API Gateway** in Docker/production to hide internal backend architecture.

#### 🔐 Production (Docker) - NGINX Gateway

```
┌─────────────────────────────────────┐
│   Browser (localhost:3000)          │
│   All requests: /api/*              │
└──────────────┬──────────────────────┘
               │
               │ Single entry point
               │
┌──────────────▼──────────────────────┐
│   NGINX (Frontend Container)        │
│   - Serves static files             │
│   - Acts as API Gateway             │
│   - Routes /api/catalog/* → :7008   │
│   - Routes /api/* → :7007           │
└───────┬──────────────────┬───────────┘
        │                  │
        │ (interno)        │ (interno)
        │                  │
 ┌──────▼──────┐    ┌──────▼──────┐
 │ Backend     │    │ Backend     │
 │ Catalog     │    │ Main        │
 │ :7008       │◄───│ :7007       │
 │ (interno)   │    │ (interno)   │
 │             │    │             │
 │ • Catalog   │    │ • Auth      │
 │ • GitHub    │    │ • Scaffolder│
 │ • Org Data  │    │ • TechDocs  │
 └─────────────┘    └─────┬───────┘
                          │
                    ┌─────▼───────┐
                    │ PostgreSQL  │
                    │ (Port 5432) │
                    └─────────────┘

Discovery Service (in both backends)
┌──────────────────────┐
│ Plugin → Service URL │
├──────────────────────┤
│ catalog   → :7008    │
│ auth      → :7007    │
│ scaffolder→ :7007    │
│ search    → :7007    │
└──────────────────────┘
```

**Configuration Files:**
- `docker/default.conf.template` - NGINX routing rules
- `app-config.frontend.yaml` - Frontend uses NGINX proxy
  ```yaml
  backend:
    baseUrl: http://localhost:3000  # Frontend → NGINX → Backends
  ```

**Benefits:**
✅ Client doesn't know about internal architecture  
✅ Security: Internal ports (7007, 7008) not exposed  
✅ Flexibility: Can reorganize backends without client changes  
✅ SSL/TLS termination at NGINX  
✅ Rate limiting and caching  

#### 💻 Development (Local) - Backend Main as Gateway

```
┌─────────────────────────────────────┐
│   Browser (localhost:3000)          │
│   Requests: /api/*                  │
└──────────────┬──────────────────────┘
               │
               │ Direct connection
               │
        ┌──────▼──────┐
        │ Backend     │
        │ Main        │
        │ :7007       │
        │ (exposed)   │
        │             │
        │ Proxy:      │
        │ /api/catalog│
        │    ↓        │
        └─────┬───────┘
              │
              │ Internal proxy
              │
       ┌──────▼──────┐
       │ Backend     │
       │ Catalog     │
       │ :7008       │
       │ (exposed)   │
       └─────────────┘
```

**Configuration Files:**
- `app-config.yaml` - Base config
  ```yaml
  backend:
    baseUrl: http://localhost:7007  # Frontend → Backend Main
  ```
- `app-config.main.yaml` - Backend Main config (no proxy needed)
  ```yaml
  backend:
    cors:
      origin:
        - http://backend-catalog:7008  # Docker service name
        - http://localhost:7008         # Local fallback
        - http://localhost:3000         # NGINX origin
  ```

**Why not NGINX locally?**
❌ Extra complexity for development  
❌ Requires container rebuild for changes  
❌ Makes debugging harder  
❌ Hot reload doesn't work well  

**Benefits of local mode:**
✅ Fast development (hot reload)  
✅ Direct backend debugging  
✅ Clear logs without intermediaries  
✅ No container rebuild needed  

#### Configuration Files Summary

| File | Purpose | Used In |
|------|---------|---------|
| `app-config.yaml` | Base config (backend: :7007) | Local dev |
| `app-config.frontend.yaml` | NGINX proxy (backend: :3000) | Docker |
| `app-config.main.yaml` | Backend Main config (CORS, auth) | Both |
| `app-config.catalog.yaml` | Backend Catalog config (CORS, auth) | Both |
| `docker/default.conf.template` | NGINX routing rules | Docker |
| `docker/inject-config.sh` | Runtime config (no internal URLs) | Docker |
| `docker/inject-config.sh` | Runtime config (no internal URLs) | Docker |

#### Security Comparison

| Aspect | Docker (NGINX) | Local Dev |
|--------|----------------|-----------|
| **Exposed Ports** | Only 3000 | 3000, 7007, 7008 |
| **Architecture Visibility** | Hidden | Visible |
| **Internal URLs** | Never exposed | Exposed on localhost |
| **Production Ready** | ✅ Yes | ❌ No |
| **Development Speed** | ⚠️ Slow (rebuild) | ✅ Fast (hot reload) |

### Running Backends

**Development (local):**
```bash
# Terminal 1: Backend Catalog
yarn workspace backend-catalog start --config ../../app-config.yaml --config ../../app-config.catalog.yaml

# Terminal 2: Backend Main
yarn workspace backend-main start --config ../../app-config.yaml --config ../../app-config.main.yaml

# Terminal 3: Frontend
yarn workspace app start

# Or use npm scripts:
yarn start:catalog  # Backend catalog
yarn start:main     # Backend main
yarn start          # Frontend
```

**Docker Compose:**
```bash
# Standard profile (both backends)
podman compose --profile standard up -d

# View logs
podman compose logs -f backend-catalog
podman compose logs -f backend-main
```

### Docker Build Strategy

The `Dockerfile.backend` uses **build arguments** to support both backends:

```dockerfile
# Build arguments
ARG BACKEND_PACKAGE=backend  # Can be: backend-catalog or backend-main
ARG CONFIG_FILE=app-config.yaml  # Comma-separated configs
ARG ENABLE_K8S=false

# Copy and build specific backend
COPY packages/${BACKEND_PACKAGE} ./packages/${BACKEND_PACKAGE}
RUN yarn workspace ${BACKEND_PACKAGE} build
```

**Build examples:**
```bash
# Backend Catalog
podman build \
  -f Dockerfile.backend \
  --build-arg BACKEND_PACKAGE=backend-catalog \
  --build-arg CONFIG_FILE=app-config.yaml,app-config.docker.yaml,app-config.catalog.yaml \
  -t codaqui/backstage-catalog .

# Backend Main
podman build \
  -f Dockerfile.backend \
  --build-arg BACKEND_PACKAGE=backend-main \
  --build-arg CONFIG_FILE=app-config.yaml,app-config.docker.yaml,app-config.main.yaml \
  -t codaqui/backstage-main .
```

### GitHub Integration (Dual Mode)

The project uses **two types** of GitHub integration:

1. **Personal Access Token (PAT)** - `app-config.yaml`
   - For basic repository operations (clone, read files)
   - Used by catalog discovery
   - Set via `GITHUB_TOKEN` environment variable

2. **GitHub App** - `app-config.docker.yaml`
   - For organization-level operations (users, teams, webhooks)
   - Credentials loaded from environment variables:
     - `GITHUB_ORG_APP_ID`
     - `GITHUB_ORG_CLIENT_ID`
     - `GITHUB_ORG_CLIENT_SECRET`
     - `GITHUB_ORG_WEBHOOK_URL`
     - `GITHUB_ORG_WEBHOOK_SECRET`
     - `GITHUB_ORG_PRIVATE_KEY`

**Configuration:**
```yaml
# app-config.yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}  # PAT
      # GitHub App loaded from app-config.docker.yaml

# app-config.docker.yaml
integrations:
  github:
    - host: github.com
      apps:
        - appId: ${GITHUB_ORG_APP_ID}
          clientId: ${GITHUB_ORG_CLIENT_ID}
          clientSecret: ${GITHUB_ORG_CLIENT_SECRET}
          webhookUrl: ${GITHUB_ORG_WEBHOOK_URL}
          webhookSecret: ${GITHUB_ORG_WEBHOOK_SECRET}
          privateKey: ${GITHUB_ORG_PRIVATE_KEY}
```

### Custom Transformers (backend-catalog)

Located in `packages/backend-catalog/src/transformers.ts`:

```typescript
export const myTeamTransformer: TeamTransformer = async (team, ctx) => {
  const backstageTeam = await defaultOrganizationTeamTransformer(team, ctx);
  if (backstageTeam) {
    backstageTeam.metadata.labels = {
      ...backstageTeam.metadata.labels,
      'github-org-integration': 'true',
    };
  }
  return backstageTeam;
};

export const myUserTransformer: UserTransformer = async (user, ctx) => {
  const backstageUser = await defaultUserTransformer(user, ctx);
  if (backstageUser) {
    backstageUser.metadata.labels = {
      ...backstageUser.metadata.labels,
      'github-org-integration': 'true',
    };
  }
  return backstageUser;
};
```

### Custom Permission Policy (Shared in backend-common)

Located in `packages/backend-common/src/extensions/permissionsPolicyExtension.ts`:

**Used by both backend-catalog and backend-main** via `@internal/backend-common` import.

Implements role-based access control:
- **Unauthenticated users**: Read-only catalog access
- **Guest users**: Limited permissions
- **Authenticated users**: Full read access
- **Resource owners**: Can modify/delete their resources

### 🔧 Minimum Required Plugins per Backend

When splitting backends in a microservices architecture, each backend needs **minimum infrastructure plugins** to function in the ecosystem.

#### 📦 Backend Exposing APIs (needs to validate callers)

**Always Required:**
```typescript
// Validate JWT tokens from other services
backend.add(import('@backstage/plugin-auth-backend'));

// Enforce permission policies
backend.add(import('@backstage/plugin-permission-backend'));

// Auth providers (at least the ones that issue tokens)
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
```

**Why?** Any backend exposing HTTP APIs must validate:
1. **Who** is calling (authentication via JWT tokens)
2. **What** they can do (authorization via permission policies)

#### 🔌 Backend Consuming APIs (needs to find other services)

**Always Required:**
```typescript
// Custom Discovery Service
class CustomDiscoveryService implements DiscoveryService {
  private serviceMap = new Map([
    ['catalog', 'http://backend-catalog:7008'],
    ['auth', 'http://backend-main:7007'],
    // ... map plugin ID → service URL
  ]);
}
```

**Why?** Backends need to know where other services are located to make inter-service calls.

#### 🎯 Rule of Thumb

| Backend Type | Required Plugins |
|--------------|------------------|
| **Exposes APIs** | auth + permission + discovery |
| **Consumes APIs** | discovery |
| **Both** | auth + permission + discovery |

#### ⚠️ Common Mistake

Forgetting to add auth/permission plugins to a backend that exposes APIs will result in:
- ❌ All requests return `401 Unauthorized`
- ❌ Even authenticated users can't access the API
- ❌ JWT tokens are not validated

**Example from this project:**
- `backend-catalog` initially only had catalog plugins
- It was returning 401 because it couldn't validate tokens
- **Solution:** Added auth + permission plugins to validate tokens from backend-main

#### 🔐 How Inter-Backend Authentication Works

```
1. User → Backend Main
   POST /api/auth/guest/refresh
   ← JWT token (signed by Main's auth plugin)

2. User → Backend Catalog (via NGINX)
   GET /api/catalog/entities
   Header: Authorization: Bearer <JWT token>
   
3. Backend Catalog validates:
   - Verifies JWT signature (auth plugin checks Main's public key)
   - Validates permissions (permission plugin checks policies)
   - If valid: Returns data
   - If invalid: Returns 401
```

#### 📊 Our Backend Configuration

**Backend Main (7007):**
```typescript
// Infrastructure (required)
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-permission-backend'));

// Business logic
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-techdocs-backend'));
backend.add(import('@backstage/plugin-search-backend'));
```

**Backend Catalog (7008):**
```typescript
// Infrastructure (required) ⚠️ Added to fix 401 errors
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-permission-backend'));

// Business logic
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-github'));
```

### Benefits of This Architecture

#### Technical Benefits
- ✅ **Separation of Concerns**: Each backend has clear responsibilities
- ✅ **Independent Scaling**: Scale catalog and main backends separately based on load
- ✅ **Independent Deployment**: Deploy backends independently without downtime
- ✅ **Isolated Failures**: Failure in one service doesn't crash the other
- ✅ **Better Maintainability**: Smaller codebases, easier to understand and modify

#### Operational Benefits
- ✅ **Isolated Logs**: Separate logs per service for easier debugging
- ✅ **Granular Metrics**: Monitor each service independently
- ✅ **Easier Debugging**: Smaller surface area to investigate issues
- ✅ **Testing Isolation**: Test services independently

#### Development Benefits
- ✅ **Team Autonomy**: Different teams can own different backends
- ✅ **Technology Flexibility**: Can use different tools per backend if needed
- ✅ **Faster CI/CD**: Build and test only what changed

### Request Flow Example

**Scenario**: User creates a new component via Scaffolder

1. **Frontend** → POST `/api/scaffolder/v2/tasks` → **Backend Main**
2. **Backend Main** processes template via Scaffolder
3. **Scaffolder** needs to register component in catalog
4. **Discovery Service** resolves `catalog` → `http://localhost:7008`
5. **Backend Main** → POST `http://localhost:7008/api/catalog/entities`
6. **Backend Catalog** receives and registers entity
7. **Backend Catalog** → returns success
8. **Backend Main** → returns task ID to Frontend
9. **Frontend** polls task status until complete

## 🔧 Technical Configuration

### Environment Variables

Required environment variables (never commit actual values):

```bash
# GitHub Personal Access Token (for repository operations)
GITHUB_TOKEN=your_github_pat

# GitHub OAuth App (for user authentication)
AUTH_GITHUB_CLIENT_ID=your_oauth_app_client_id
AUTH_GITHUB_CLIENT_SECRET=your_oauth_app_client_secret

# GitHub App (for organization integration)
GITHUB_ORG_APP_ID=your_github_app_id
GITHUB_ORG_CLIENT_ID=your_github_app_client_id
GITHUB_ORG_CLIENT_SECRET=your_github_app_client_secret
GITHUB_ORG_WEBHOOK_URL=https://your-domain.com/api/github/webhook
GITHUB_ORG_WEBHOOK_SECRET=your_webhook_secret
GITHUB_ORG_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"

# Service Discovery (for inter-backend communication)
CATALOG_SERVICE_URL=http://localhost:7008  # or http://backend-catalog:7008 in Docker
MAIN_SERVICE_URL=http://localhost:7007     # or http://backend-main:7007 in Docker

# App Configuration
APP_CONFIG_APP_BASEURL=http://localhost:3000
APP_CONFIG_BACKEND_BASEURL=http://localhost:7007

# Database (PostgreSQL - shared by both backends)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
POSTGRES_DB=backstage

# Node Configuration
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096

# Kubernetes Testing (optional)
CODAQUI_TESTING_WITH_KUBERNETES=false  # Set to 'true' for K8s testing mode
```

**Important Notes:**
- GitHub App credentials are loaded from **environment variables only** (no YAML file)
- Service URLs change between local development and Docker (localhost vs container names)
- Both backends share the same PostgreSQL database

See `.env.example` for detailed instructions on creating GitHub OAuth App and GitHub App.

### Key Dependencies

```json
{
  "@backstage/core-components": "Latest",
  "@backstage/core-plugin-api": "Latest",
  "@backstage/plugin-catalog": "Latest",
  "@backstage/plugin-catalog-react": "Latest",
  "@backstage/plugin-scaffolder": "Latest",
  "@backstage/theme": "Latest",
  "@material-ui/core": "^4.x",
  "react": "^18.x",
  "react-router-dom": "^6.x"
}
```

### Backstage Configuration Highlights

#### Catalog Providers

```yaml
# app-config.yaml
catalog:
  providers:
    github:
      providerId:
        organization: 'codaqui'
        catalogPath: '/catalog-info.yaml'
        filters:
          branch: 'main'
          repository: '.*'
```

#### Permission Policy

Custom permission policy implemented in `packages/backend/src/extensions/permissionPolicy.ts`:

- Unauthenticated users: Read-only access
- Guest users: Limited permissions
- Authenticated users: Full read access
- Owners: Write/delete permissions

#### Authentication

```yaml
auth:
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
```

## 🎨 Design System & Branding

### Codaqui Brand Colors

```typescript
// Primary colors
const codaquiGreen = '#57B593';      // Main brand color
const codaquiDarkGray = '#3A2F39';   // Dark elements
const codaquiLightGray = '#B5B5B5';  // Light accents
```

### Theme Configuration

Located in `packages/app/src/theme/codaquiTheme.ts`:

- **Light Theme**: Green primary, dark gray secondary
- **Dark Theme**: Green primary, light gray secondary
- **Navigation**: Dark background with green indicators
- **Header**: Custom background (no gradient)

### Logo Usage

- **Full Logo** (`codaqui-full.svg`): Colorful, used in light contexts
- **Mono Logo** (`codaqui-mono.svg`): White/gray, used in dark sidebar
- **Icon Logo**: Small icon for favicon and mobile

**Logo Components:**
- `LogoFull.tsx`: Sidebar logo (always mono)
- `LogoIcon.tsx`: Small icon with theme adaptation

## 📝 Code Standards & Patterns

### TypeScript Standards

```typescript
// ✅ GOOD: Explicit types, interfaces in types.ts
import { WhatsAppGroup } from '../../utils';

export interface WhatsAppGroup {
  name: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  entity: Entity;
}

// ✅ GOOD: Typed functions with return types
export function extractWhatsAppGroupInfo(entity: Entity): WhatsAppGroup {
  return {
    name: entity.metadata.name,
    title: entity.metadata.title || entity.metadata.name,
    // ...
  };
}

// ❌ BAD: Any types, inline interfaces
function getData(): any { }
```

### React Component Patterns

#### Components Structure

```typescript
// components/home/WhatsAppGroupsCard.tsx
import React from 'react';
import { useWhatsAppGroups } from '../../hooks';
import { Card, CardContent } from '@material-ui/core';

interface WhatsAppGroupsCardProps {
  maxGroups?: number;
}

export const WhatsAppGroupsCard = ({ maxGroups = 6 }: WhatsAppGroupsCardProps) => {
  const { groups, loading, error } = useWhatsAppGroups();

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorPanel error={error} />;

  return (
    <Card>
      <CardContent>
        {groups.slice(0, maxGroups).map(group => (
          <GroupItem key={group.name} group={group} />
        ))}
      </CardContent>
    </Card>
  );
};
```

#### Custom Hooks Pattern

```typescript
// hooks/useWhatsAppGroups.ts
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useAsync } from 'react-use';

export function useWhatsAppGroups() {
  const catalogApi = useApi(catalogApiRef);

  const { value: groups, loading, error } = useAsync(async () => {
    const entities = await catalogApi.getEntities({
      filter: {
        kind: 'Component',
        'spec.type': 'whatsapp',
      },
    });

    return entities.items.map(extractWhatsAppGroupInfo);
  }, [catalogApi]);

  return { groups: groups || [], loading, error };
}
```

#### Pages Pattern

```typescript
// pages/WhatsAppGroupsPage.tsx
import React from 'react';
import { Page, Header, Content } from '@backstage/core-components';
import { useWhatsAppGroups } from '../hooks';

export const WhatsAppGroupsPage = () => {
  const { groups, loading } = useWhatsAppGroups();

  return (
    <Page themeId="tool">
      <Header
        title="Grupos WhatsApp"
        subtitle="Comunidades da Codaqui"
      />
      <Content>
        <GroupsList groups={groups} loading={loading} />
      </Content>
    </Page>
  );
};
```

### Import Order Convention

```typescript
// 1. React and external libraries
import React from 'react';
import { useAsync } from 'react-use';

// 2. Backstage packages
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';

// 3. Material-UI
import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// 4. Internal components
import { CodaquiWelcomeCard } from './CodaquiWelcomeCard';

// 5. Hooks and utils
import { useWhatsAppGroups } from '../../hooks';
import { WhatsAppGroup } from '../../utils';
```

### File Naming Conventions

- **Components**: PascalCase - `WhatsAppGroupsCard.tsx`
- **Hooks**: camelCase with `use` prefix - `useWhatsAppGroups.ts`
- **Utils**: camelCase - `helpers.ts`
- **Types**: camelCase - `types.ts`
- **Pages**: PascalCase with `Page` suffix - `WhatsAppGroupsPage.tsx`
- **Index files**: Always lowercase - `index.ts`

## 🤖 Instructions for AI Agents

### When Adding New Features

#### 1. Adding a New Resource Type (e.g., Podcast)

**Step 1:** Add type definition
```typescript
// utils/types.ts
export type CodaquiResourceType =
  | 'whatsapp'
  | 'discord'
  | 'podcast'  // ← New
  | 'learning-path';

export interface Podcast {
  name: string;
  title: string;
  description: string;
  url: string;
  episodes: number;
  entity: Entity;
}
```

**Step 2:** Create hook
```typescript
// hooks/usePodcasts.ts
export function usePodcasts() {
  const catalogApi = useApi(catalogApiRef);

  const { value: podcasts, loading, error } = useAsync(async () => {
    const entities = await catalogApi.getEntities({
      filter: { kind: 'Component', 'spec.type': 'podcast' },
    });
    return entities.items.map(extractPodcastInfo);
  }, [catalogApi]);

  return { podcasts: podcasts || [], loading, error };
}
```

**Step 3:** Create card component
```typescript
// components/home/PodcastCard.tsx
export const PodcastCard = ({ maxPodcasts = 4 }: Props) => {
  const { podcasts, loading } = usePodcasts();
  // Render card
};
```

**Step 4:** Create page
```typescript
// pages/PodcastsPage.tsx
export const PodcastsPage = () => {
  return (
    <Page themeId="tool">
      <Header title="Podcasts Codaqui" />
      <Content>{/* List podcasts */}</Content>
    </Page>
  );
};
```

**Step 5:** Add route
```typescript
// App.tsx
<Route path="/podcasts" element={<PodcastsPage />} />
```

**Step 6:** Export properly
```typescript
// pages/index.ts
export { PodcastsPage } from './PodcastsPage';

// hooks/index.ts
export { usePodcasts } from './usePodcasts';
```

#### 2. Modifying Existing Components

**Always:**
1. Read the component file first
2. Check for existing patterns
3. Maintain TypeScript types
4. Update related tests (when they exist)
5. Keep imports organized

**Example: Adding a filter to WhatsAppGroupsCard**

```typescript
// Before modifying, understand current props
interface WhatsAppGroupsCardProps {
  maxGroups?: number;
}

// Add new prop
interface WhatsAppGroupsCardProps {
  maxGroups?: number;
  filterByTag?: string;  // ← New
}

// Implement filtering logic
const filteredGroups = groups.filter(group =>
  filterByTag ? group.tags.includes(filterByTag) : true
);
```

#### 3. Working with Themes

**When modifying themes:**

```typescript
// theme/codaquiTheme.ts

// Always maintain brand colors
const codaquiGreen = '#57B593';  // DON'T CHANGE
const codaquiDarkGray = '#3A2F39';  // DON'T CHANGE

// Extend theme carefully
export const codaquiLightTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,  // ← Keep base palette
    primary: {
      main: codaquiGreen,  // ← Brand color
      // light/dark variants OK to adjust
    },
    // Add new colors if needed
    success: {
      main: codaquiGreen,  // Reuse brand color
    },
  },
  // Component overrides
  components: {
    BackstageHeader: {
      styleOverrides: {
        header: {
          backgroundColor: codaquiDarkGray,
        },
      },
    },
  },
});
```

### Code Review Checklist

Before submitting changes:

- [ ] TypeScript compiles without errors (`yarn tsc`)
- [ ] No linting errors (`yarn lint`)
- [ ] Imports are organized (React → Backstage → MUI → Internal)
- [ ] Components have proper TypeScript types
- [ ] New files have proper exports in `index.ts`
- [ ] Follows existing naming conventions
- [ ] Brand colors maintained (green #57B593)
- [ ] No hardcoded values (use theme/config)
- [ ] Loading and error states handled
- [ ] Responsive design considered

### Common Pitfalls to Avoid

#### ❌ DON'T: Mix responsibilities

```typescript
// BAD: Component + data fetching + business logic
const MyComponent = () => {
  const catalogApi = useApi(catalogApiRef);
  const [data, setData] = useState([]);

  useEffect(() => {
    catalogApi.getEntities().then(/* complex logic */);
  }, []);

  // 100 lines of component code
};
```

#### ✅ DO: Separate concerns

```typescript
// GOOD: Hook handles data
const useMyData = () => {
  const catalogApi = useApi(catalogApiRef);
  // Data fetching logic
  return { data, loading, error };
};

// GOOD: Component just renders
const MyComponent = () => {
  const { data, loading } = useMyData();
  if (loading) return <Loading />;
  return <DataView data={data} />;
};
```

#### ❌ DON'T: Hardcode URLs or values

```typescript
// BAD
const link = 'http://localhost:3000/catalog?kind=component';
const color = '#57B593';
```

#### ✅ DO: Use config and theme

```typescript
// GOOD
import { useApi, configApiRef } from '@backstage/core-plugin-api';
const config = useApi(configApiRef);
const baseUrl = config.getString('app.baseUrl');

// GOOD: Use theme
const useStyles = makeStyles(theme => ({
  button: {
    backgroundColor: theme.palette.primary.main,
  },
}));
```

#### ❌ DON'T: Create inconsistent file structure

```typescript
// BAD
components/MyNewFeature.tsx
components/myNewFeatureHelpers.ts
components/MyNewFeaturePage.tsx
```

#### ✅ DO: Follow established patterns

```typescript
// GOOD
components/home/MyNewFeatureCard.tsx
pages/MyNewFeaturePage.tsx
hooks/useMyNewFeature.ts
utils/myNewFeatureHelpers.ts
```

## 🧪 Testing Guidelines (Future)

When tests are implemented, follow these patterns:

```typescript
// hooks/__tests__/useWhatsAppGroups.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useWhatsAppGroups } from '../useWhatsAppGroups';

describe('useWhatsAppGroups', () => {
  it('should fetch WhatsApp groups', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useWhatsAppGroups(),
    );

    await waitForNextUpdate();

    expect(result.current.groups).toHaveLength(5);
    expect(result.current.loading).toBe(false);
  });
});
```

## 🔄 Git Workflow

### Commit Message Convention

Follow conventional commits:

```bash
feat: add podcasts page and catalog integration
fix: correct logo sizing in mobile view
docs: update AGENTS.md with new patterns
style: format code with prettier
refactor: extract WhatsApp logic to custom hook
test: add unit tests for useResourceCounts
chore: update dependencies to latest Backstage version
```

### Branch Naming

```bash
feat/add-podcasts-page
fix/logo-mobile-sizing
docs/update-agents-guide
refactor/extract-hooks
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Checklist
- [ ] TypeScript compiles
- [ ] No linting errors
- [ ] Follows code patterns in AGENTS.md
- [ ] Assets organized properly
- [ ] Brand colors maintained
```

## 📚 Backstage Concepts

### Entities

Backstage uses YAML files to describe entities:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: whatsapp-devparana
  title: Dev Paraná - WhatsApp
  description: Comunidade de desenvolvedores do Paraná
  annotations:
    codaqui.dev/url: https://chat.whatsapp.com/...
  tags:
    - whatsapp
    - comunidade
    - paraná
spec:
  type: whatsapp
  lifecycle: production
  owner: community
```

### Software Templates

Templates for scaffolding new projects:

```yaml
# templates/node-service/template.yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: node-service
  title: Node.js Service
  description: Create a new Node.js microservice
spec:
  type: service
  parameters:
    - title: Service Info
      required:
        - name
        - description
      properties:
        name:
          type: string
        description:
          type: string
```

### Catalog Locations

Configure where Backstage finds entities:

```yaml
# app-config.yaml
catalog:
  locations:
    # Common resources (always loaded: users, groups, systems)
    - type: file
      target: ./default/common/*.yaml
      rules:
        - allow: [User, Group, Component, System, Domain]

    # Kubernetes resources (loaded when files exist)
    - type: file
      target: ./default/k8s/*.yaml
      rules:
        - allow: [Component, Resource]

    # Software templates
    - type: file
      target: ./default/templates/*/template.yaml
      rules:
        - allow: [Template]

    # External templates (optional)
    - type: url
      target: https://github.com/codaqui/templates/blob/main/catalog-info.yaml
```

**Note**: Kubernetes resources are conditionally loaded based on the `ENABLE_K8S` build argument. When `ENABLE_K8S=false`, the YAML files are removed during the Docker build process.

## 🎓 Resources for Learning

### Backstage Documentation

- [Backstage Official Docs](https://backstage.io/docs)
- [Plugin Development](https://backstage.io/docs/plugins)
- [Software Templates](https://backstage.io/docs/features/software-templates)
- [Catalog](https://backstage.io/docs/features/software-catalog)

### React & TypeScript

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook)
- [React Hooks](https://react.dev/reference/react)

### Material-UI

- [Material-UI v4 Docs](https://v4.mui.com)
- [makeStyles API](https://v4.mui.com/styles/api/#makestyles-styles-options-hook)

## 🔐 Security Guidelines

### Environment Variables

**NEVER commit:**
- `.env`
- `.env.front`
- `.env.database`
- `*-credentials.yaml`
- GitHub tokens
- OAuth secrets

**Always:**
- Use `.env.example` as template
- Store secrets in environment variables
- Use GitHub Secrets for CI/CD
- Rotate credentials regularly

### Permission Policy

Current policy (can be customized):
- **Unauthenticated**: Read-only catalog access
- **Guest users**: Limited to viewing public resources
- **Authenticated users**: Full read access
- **Resource owners**: Can modify/delete their resources

## 📊 Project Metrics & Status

### Current State (as of 2025-11-13)

- **Status**: Beta
- **Backstage Version**: Latest (check package.json)
- **Node Version**: 22+
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint + Prettier
- **Container**: Podman Compose (Docker compatible)

### Recent Improvements

1. **Multi-Backend Architecture**: Split into backend-catalog (7008) and backend-main (7007)
2. **Discovery Service**: Custom service for inter-backend communication
3. **GitHub App Integration**: Environment variables only, no credential files
4. **Dockerfile Optimization**: Single Dockerfile.backend with BACKEND_PACKAGE arg
5. **Docker Compose**: Support for both backends with proper service discovery
6. **Theme Customization**: Codaqui green (#57B593) throughout
7. **Logo Reorganization**: Moved to `assets/logos/` structure
8. **Permission Policy**: Custom policy with guest support
9. **GitHub Integration**: Automatic organization sync with transformers
10. **Software Templates**: Starting template library
11. **Architecture Documentation**: All technical docs consolidated in AGENTS.md
12. **Kubernetes Integration**: Conditional K8s resource loading
13. **Catalog Organization**: Separated common vs K8s resources
14. **Multi-config Support**: CONFIG_FILE accepts comma-separated values

## 🚀 Deployment

### Local Development

```bash
# Using Podman Compose (recommended)
podman compose up --build --force-recreate

# Using Docker Compose
docker compose up --build --force-recreate

# Local development (no containers)
yarn dev
```

### Production Build

```bash
# Build frontend and backend
yarn build:all

# Build Docker images
podman build -f Dockerfile.frontend -t codaqui/backstage-frontend .
podman build -f Dockerfile.backend -t codaqui/backstage-backend .
```

### Environment Configuration

- **Development**: `app-config.yaml`
- **Docker**: `app-config.docker.yaml` (merged)
- **Production**: `app-config.production.yaml` (merged)
- **Kubernetes Testing**: `app-config.k8s.yaml` (merged with docker config)

### Docker Build Arguments

```yaml
# Dockerfile.backend & Dockerfile.frontend
ARG NODE_ENV
ARG NODE_OPTIONS
ARG CONFIG_FILE
ARG ENABLE_K8S=false  # Controls K8s resource inclusion
```

**ENABLE_K8S behavior:**
- `true`: Includes `./default/k8s/*.yaml` files in catalog
- `false`: Removes K8s YAML files during build (smaller image, no K8s resources)

### Kubernetes Integration

When `CODAQUI_TESTING_WITH_KUBERNETES=true`:

1. **kubectl-proxy service** starts (port 8001)
2. **ENABLE_K8S=true** passed to Docker builds
3. **K8s resources** loaded from `./default/k8s/*.yaml`
4. **K8s-specific config** from `app-config.k8s.yaml` applied

**Required for K8s testing:**
- Local Kubernetes cluster (Kind, Minikube, etc.)
- `kubectl` configured to access cluster
- K8s resources deployed: `kubectl apply -f ./default/k8s/deployment.yaml`

## 🤝 Contributing Guidelines

### For Human Contributors

1. Read this AGENTS.md file completely
2. Check existing patterns in codebase
3. Follow TypeScript and React best practices
4. Maintain brand identity (colors, logos)
5. Test locally before submitting PR
6. Write clear commit messages

### For AI Agents

1. Always analyze existing code first
2. Follow established patterns strictly
3. Maintain type safety (TypeScript)
4. Keep brand consistency
5. Organize files in correct folders
6. Export components/hooks properly
7. Add comments for complex logic
8. Never hardcode values (use config/theme)

## 🆘 Troubleshooting

### Common Issues

#### 1. Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

#### 2. TypeScript errors

```bash
# Check for type errors
yarn tsc --noEmit

# Fix auto-fixable issues
yarn lint:fix
```

#### 3. Theme not applying

Check:
- Theme is imported in `App.tsx`
- `UnifiedThemeProvider` wraps content
- Theme object structure matches Backstage API

#### 5. Kubernetes resources not loading

**Symptoms:**
- K8s components not appearing in catalog
- kubectl-proxy connection errors

**Checks:**
```bash
# Verify K8s mode is enabled
echo $CODAQUI_TESTING_WITH_KUBERNETES  # Should be "true"

# Check if K8s files exist in container
podman exec -it codaqui-portal-backend ls -la /app/default/k8s/

# Verify kubectl-proxy is running
podman ps | grep kubectl-proxy

# Test K8s cluster connection
kubectl get nodes
```

**Solutions:**
```bash
# Enable K8s mode
export CODAQUI_TESTING_WITH_KUBERNETES=true

# Rebuild containers
podman compose down
podman compose up --build --force-recreate

# Deploy K8s resources
kubectl apply -f ./default/k8s/deployment.yaml
```

## 📞 Support

- **GitHub Issues**: https://github.com/codaqui/backstage/issues
- **Email**: contato@codaqui.dev
- **Discord**: https://discord.com/invite/xuTtxqCPpz
- **WhatsApp Community**: Check catalog for groups

---

**Last Updated**: 2025-11-13  
**Version**: 1.0.0  
**Maintained By**: Codaqui Community  
**License**: Apache License 2.0

---

## 🔖 Quick Reference

### File Organization Rules

```
✅ Components → components/
✅ Pages → pages/
✅ Hooks → hooks/
✅ Types → utils/types.ts
✅ Helpers → utils/helpers.ts
✅ Themes → theme/
✅ Assets → assets/logos/
✅ Tests → __tests__/
✅ Common entities → default/common/
✅ K8s entities → default/k8s/
✅ Templates → default/templates/
```

### Import Patterns

```typescript
// Internal imports
import { MyComponent } from './MyComponent';           // Same folder
import { useMyHook } from '../../hooks';               // Parent folders
import { MyType } from '../../utils';                  // Utils

// External imports
import { useApi } from '@backstage/core-plugin-api';  // Backstage
import { Card } from '@material-ui/core';             // Material-UI
```

### Brand Colors

```typescript
Primary:   #57B593  // Codaqui Green
Secondary: #3A2F39  // Dark Gray (light mode)
Secondary: #B5B5B5  // Light Gray (dark mode)
```

### Key Commands

```bash
# Local Development (backends separated)
yarn start:catalog      # Start backend-catalog (port 7008)
yarn start:main         # Start backend-main (port 7007)
yarn start              # Start frontend (port 3000)
yarn dev                # Start all together

# Build
yarn build:all          # Build all workspaces
yarn tsc                # Check TypeScript
yarn lint               # Run linter
yarn lint:fix           # Fix lint issues
yarn test               # Run tests (when available)

# Docker Build
yarn docker:build:catalog   # Build backend-catalog image
yarn docker:build:main      # Build backend-main image
yarn docker:build:all       # Build both backend images

# Docker/Podman Compose
podman compose --profile standard up -d         # Start all services
podman compose --profile standard up --build    # Rebuild and start
podman compose down                             # Stop all services

# Kubernetes testing mode
export CODAQUI_TESTING_WITH_KUBERNETES=true
COMPOSE_PROFILES=kubernetes,standard podman compose up --build

# Container logs
podman logs -f codaqui-portal-backend-catalog
podman logs -f codaqui-portal-backend-main
podman logs -f codaqui-portal-frontend

# Access containers
podman exec -it codaqui-portal-backend-catalog bash
podman exec -it codaqui-portal-backend-main bash

# Health checks
curl http://localhost:7008/healthcheck  # Catalog backend
curl http://localhost:7007/healthcheck  # Main backend
curl http://localhost:7008/api/catalog/entities  # List entities
```

---

**Remember**: This is a living document. Update it as the project evolves! 🚀
