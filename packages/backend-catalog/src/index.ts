import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import type { DiscoveryService } from '@backstage/backend-plugin-api';
import { githubOrgEntityProviderTransformsExtensionPoint } from '@backstage/plugin-catalog-backend-module-github-org';
import { myTeamTransformer, myUserTransformer } from './transformers';
import { permissionsPolicyExtension } from '@internal/backend-common';

// Custom Discovery Service
// Maps plugins to their respective backend services
class CustomDiscoveryService implements DiscoveryService {
  private readonly serviceMap: Map<string, string>;

  constructor() {
    this.serviceMap = new Map([
      // Catalog service (this backend)
      ['catalog', process.env.CATALOG_SERVICE_URL || 'http://localhost:7008'],
      
      // Main service (other backend)
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
      throw new Error(`No URL configured for plugin: ${pluginId}`);
    }
    return `${url}/api/${pluginId}`;
  }

  async getExternalBaseUrl(pluginId: string): Promise<string> {
    return this.getBaseUrl(pluginId);
  }
}

// Discovery Service Module
const discoveryModule = createBackendModule({
  pluginId: 'app',
  moduleId: 'custom-discovery',
  register(reg) {
    reg.registerInit({
      deps: { discovery: coreServices.discovery },
      async init({ discovery }) {
        // Override with custom discovery
        Object.assign(discovery, new CustomDiscoveryService());
      },
    });
  },
});

// GitHub Org Module - Custom transformers for users and teams
const githubOrgModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'github-org-extensions',
  register(env) {
    env.registerInit({
      deps: {
        githubOrg: githubOrgEntityProviderTransformsExtensionPoint,
      },
      async init({ githubOrg }) {
        githubOrg.setTeamTransformer(myTeamTransformer);
        githubOrg.setUserTransformer(myUserTransformer);
      },
    });
  },
});

const backend = createBackend();

// Add custom discovery service
backend.add(discoveryModule);

// auth plugin (needed to validate tokens from backend-main)
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// permission plugin (needed to enforce permissions)
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(permissionsPolicyExtension);

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// https://backstage.io/docs/integrations/github/discovery
backend.add(import('@backstage/plugin-catalog-backend-module-github'));

// https://backstage.io/docs/integrations/github/org
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));
backend.add(githubOrgModule);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// Let's go! Start!
backend.start();
