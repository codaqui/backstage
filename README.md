# Codaqui Backstage Portal

Welcome to the Codaqui Backstage Portal! This is a developer portal built with [Backstage](https://backstage.io) that provides a unified interface for managing software components, APIs, and documentation.

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ (managed via nvm)
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

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## 🆘 Support

- GitHub Issues: https://github.com/codaqui/backstage/issues
- Email: contato@codaqui.dev
