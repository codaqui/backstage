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
│   ├── backend/                      # Backend Node.js application
│   └── plugins/                      # Custom Backstage plugins
├── default/                          # Default entities
│   ├── guest.yaml                    # Guest user/group config
│   ├── system-general.yaml           # System entity
│   └── domain-codaqui.yaml           # Domain entity
├── docs/                             # Documentation files
├── docker/                           # Docker-related files
├── app-config.yaml                   # Main Backstage config
├── app-config.docker.yaml            # Docker-specific config
├── app-config.production.yaml        # Production config
├── docker-compose.yml                # Podman/Docker compose
├── catalog-info.yaml                 # Backstage catalog descriptor
├── .env.example                      # Environment variables template
├── README.md                         # User-facing documentation
└── AGENTS.md                         # This file (technical guide)
```

## 🔧 Technical Configuration

### Environment Variables

Required environment variables (never commit actual values):

```bash
# GitHub OAuth App (for user authentication)
AUTH_GITHUB_CLIENT_ID=your_oauth_app_client_id
AUTH_GITHUB_CLIENT_SECRET=your_oauth_app_client_secret

# GitHub App (for GitHub integration)
GITHUB_TOKEN=your_github_token
APP_CONFIG_APP_BASEURL=http://localhost:3000
APP_CONFIG_BACKEND_BASEURL=http://localhost:7007

# Database (PostgreSQL)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secret
```

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
    - type: file
      target: ./default/*.yaml

    - type: url
      target: https://github.com/codaqui/templates/blob/main/catalog-info.yaml
```

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

### Current State (as of 2025-11-07)

- **Status**: Beta
- **Backstage Version**: Latest (check package.json)
- **Node Version**: 22+
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint + Prettier
- **Container**: Podman Compose (Docker compatible)

### Recent Improvements

1. **Theme Customization**: Codaqui green (#57B593) throughout
2. **Logo Reorganization**: Moved to `assets/logos/` structure
3. **Permission Policy**: Custom policy with guest support
4. **GitHub Integration**: Automatic organization sync
5. **Software Templates**: Starting template library
6. **Architecture Documentation**: Consolidated in AGENTS.md

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

#### 4. Logo not showing

Check:
- File exists in `assets/logos/`
- Import path is correct (relative from component)
- SVG file is valid

## 📞 Support

- **GitHub Issues**: https://github.com/codaqui/backstage/issues
- **Email**: contato@codaqui.dev
- **Discord**: https://discord.com/invite/xuTtxqCPpz
- **WhatsApp Community**: Check catalog for groups

---

**Last Updated**: 2025-11-07  
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
yarn dev                # Local development
yarn build              # Build production
yarn tsc                # Check TypeScript
yarn lint               # Run linter
yarn lint:fix           # Fix lint issues
yarn test               # Run tests (when available)
podman compose up       # Run with containers
```

---

**Remember**: This is a living document. Update it as the project evolves! 🚀
