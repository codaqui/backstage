# Codaqui Backstage Portal

Welcome to the Codaqui Backstage Portal! This is a developer portal built with [Backstage](https://backstage.io) that provides a unified interface for managing software components, APIs, and documentation.

> 📖 **For Technical Documentation**: See [AGENTS.md](./AGENTS.md) for complete architecture details, multi-backend setup, AI agent instructions, and development guidelines.

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or 22 (managed via nvm)
- Yarn (enabled via corepack)
- Podman or Docker
- GitHub Account

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/codaqui/backstage.git
   cd backstage
   ```

2. **Install Node.js and dependencies**

   ```bash
   nvm use 22
   corepack enable
   yarn install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:

   - **GitHub OAuth App**: Create at https://github.com/settings/applications/new
   - **GitHub App**: Create at https://github.com/organizations/codaqui/settings/apps/new
   - See `.env.example` for detailed instructions

4. **Run the portal**

   ```bash
   yarn docker:up:build
   ```

   Access the portal at http://localhost:3000

## 🏗️ Architecture Overview

The portal uses a **multi-backend architecture** with NGINX as reverse proxy:

| Service              | Port | Responsibility                        |
| -------------------- | ---- | ------------------------------------- |
| **frontend**         | 3000 | NGINX serving React app + API proxy   |
| **backend-main**     | 7007 | Auth, Scaffolder, Search, Permissions |
| **backend-catalog**  | 7008 | Catalog, GitHub Org sync              |
| **backend-techdocs** | 7009 | TechDocs generation and serving       |
| **postgres**         | 5432 | Database                              |

> See [AGENTS.md](./AGENTS.md#-deployment--infrastructure) for the complete architecture diagram and detailed service descriptions.

### Available Commands

```bash
# Development
yarn docker:up:build    # Build and start all services
yarn docker:down        # Stop all services
yarn docker:logs        # View logs

# Code Quality
yarn quality:check      # Lint + type-check + format
yarn validate           # Quality + tests

# Testing
yarn test               # Run unit tests
yarn test:e2e           # Run Playwright e2e tests
```

> See [AGENTS.md](./AGENTS.md#available-scripts) for the complete list of scripts.

### Kubernetes Testing (Optional)

For testing Kubernetes integration locally:

```bash
# Apply K8s resources to your cluster
kubectl apply -f ./default/k8s/deployment.yaml

# Start with K8s profile enabled
export CODAQUI_TESTING_WITH_KUBERNETES=true
yarn docker:up:build
```

## 📚 Documentation

- [AGENTS.md](./AGENTS.md) - Complete technical documentation
- [Backstage Documentation](https://backstage.io/docs)

## 🤝 Contributing

Contributions are welcome! **Before contributing, please read [`AGENTS.md`](./AGENTS.md)** for:

- Project architecture and structure
- Code standards and patterns
- Testing guidelines
- Common pitfalls to avoid

## 📄 License

This project is licensed under the Apache License 2.0 - see the original [LICENSE file](https://github.com/backstage/backstage?tab=Apache-2.0-1-ov-file#readme) for details.

## 🆘 Support

- GitHub Issues: https://github.com/codaqui/backstage/issues
- Email: contato@codaqui.dev
