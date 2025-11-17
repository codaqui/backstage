# Codaqui Backstage Portal

Welcome to the Codaqui Backstage Portal! This is a developer portal built with [Backstage](https://backstage.io) that provides a unified interface for managing software components, APIs, and documentation.

> 📖 **For Technical Documentation**: See [AGENTS.md](./AGENTS.md) for complete architecture details, multi-backend setup, AI agent instructions, and development guidelines.

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ (managed via nvm)
- Yarn (enabled via corepack)
- Podman or Docker
- GitHub Account
- **Optional**: Local Kubernetes cluster for testing K8s features

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
   - **Kubernetes Testing** (Optional): Set `CODAQUI_TESTING_WITH_KUBERNETES=true`
   - See `.env.example` for detailed instructions

4. **Run the portal**

   **Standard mode (without Kubernetes resources):**
   ```bash
   podman compose --profile standard up --build --force-recreate
   ```

   **Kubernetes testing mode (includes K8s resources):**
   ```bash
   # Verify ./default/k8s/deployment.yaml is configured correctly for your K8s cluster
   kubectl apply -f ./default/k8s/deployment.yaml

   # Turn on containers for K8s testing (enables both profiles)
   export CODAQUI_TESTING_WITH_KUBERNETES=true
   podman compose --profile kubernetes --profile standard up --build --force-recreate
   ```

   > **Note**: The `CODAQUI_TESTING_WITH_KUBERNETES` variable controls:
   > - Whether Kubernetes resources (`default/k8s/*.yaml`) are loaded in the catalog
   > - Activation of kubectl-proxy service (port 8001)
   > - K8s-specific configuration from `app-config.k8s.yaml`
   > 
   > **Architecture**: Multi-backend microservices with **Custom Discovery Service** (Kubernetes-ready):
   
   ```text
    ┌─────────────────────────────────────┐
    │   Browser (localhost:3000)          │
    └──────────────┬──────────────────────┘
                   │ All requests via NGINX
                   │ http://localhost:3000/api/*
                   │
    ┌──────────────▼──────────────────────┐
    │   NGINX (Frontend Container)        │
    │   - Serves static files             │
    │   - Acts as API Gateway             │
    │   - Routes /api/catalog/* → :7008   │
    │   - Routes /api/* → :7007           │
    └───────┬──────────────────┬───────────┘
            │                  │
     ┌──────▼──────┐    ┌──────▼──────┐
     │ Backend     │    │ Backend     │
     │ Catalog     │◄───│ Main        │
     │ :7008       │    │ :7007       │
     │ (internal)  │    │ (internal)  │
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
    
    Discovery Service (shared via @internal/backend-common)
    ┌──────────────────────┐
    │ Plugin → Service URL │
    ├──────────────────────┤
    │ catalog   → :7008    │
    │ auth      → :7007    │
    │ scaffolder→ :7007    │
    └──────────────────────┘
    ```
    
   > **Key Features:**
   > - **Custom Discovery Service**: Direct backend-to-backend calls (zero HTTP proxy overhead)
   > - **Kubernetes Ready**: Uses service names (e.g., `backend-catalog.namespace.svc.cluster.local`)
   > - **Shared Code**: `@internal/backend-common` for reusable logic (RBAC, discovery, utilities)
   > - **NGINX Gateway**: Exposes only port 3000 externally
   > - **Scalable**: Add new backends easily - just import from `@internal/backend-common`
   > 
   > See [AGENTS.md](./AGENTS.md) for complete architecture and development guidelines

## 📚 Documentation

- [Backstage Documentation](https://backstage.io/docs)

## 🤝 Contributing

Contributions are welcome! **Before contributing, please read [`AGENTS.md`](./AGENTS.md)** for detailed technical guidelines, architecture patterns, and best practices.

**For human and AI contributors:**
1. Read [`AGENTS.md`](./AGENTS.md) completely
2. Fork the repository
3. Create a feature branch following naming conventions
4. Make your changes following established patterns
5. Test locally
6. Submit a pull request

The `AGENTS.md` file contains:
- Project architecture and structure
- Code standards and patterns
- TypeScript conventions
- Component/hook/page patterns
- Theme and branding guidelines
- Common pitfalls to avoid

## 📄 License

This project is licensed under the Apache License 2.0 - see the original [LICENSE file](https://github.com/backstage/backstage?tab=Apache-2.0-1-ov-file#readme) for details.

## 🆘 Support

- GitHub Issues: https://github.com/codaqui/backstage/issues
- Email: contato@codaqui.dev
