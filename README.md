# Codaqui Backstage Portal

Welcome to the Codaqui Backstage Portal! This is a developer portal built with [Backstage](https://backstage.io) that provides a unified interface for managing software components, APIs, and documentation.

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ (managed via nvm)
- Yarn (enabled via corepack)
- Podman or Docker
- GitHub Account
- Kubernetes Local Cluster
  - Apply the `default/k8s-sample/deployment.yaml` to create a local cluster for testing

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

4. **Run with Podman Compose**

   ```bash
   podman compose up --build --force-recreate
   ```

5. **Access the portal**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7007

## 🔒 Security Notes

- **NEVER commit** `.env`, `.env.front`, `.env.database`, or `*-credentials.yaml` files
- All secrets must be stored in environment variables
- Rotate credentials regularly
- Use GitHub Secrets for CI/CD pipelines

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
