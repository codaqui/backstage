import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { githubOrgEntityProviderTransformsExtensionPoint } from '@backstage/plugin-catalog-backend-module-github-org';
import { myTeamTransformer, myUserTransformer } from './transformers';
import { 
  permissionsPolicyExtension,
  customDiscoveryServiceFactory 
} from '@internal/backend-common';

// Debug Environment Variables
console.log('🔍 Backend Catalog - Environment Variables:');
console.log(`   CATALOG_SERVICE_URL: ${process.env.CATALOG_SERVICE_URL}`);
console.log(`   MAIN_SERVICE_URL: ${process.env.MAIN_SERVICE_URL}`);
console.log(`   BACKEND_SECRET: ${process.env.BACKEND_SECRET ? '***' + process.env.BACKEND_SECRET.slice(-4) : 'NOT SET'}`);

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

// Replace default Discovery Service with custom implementation
// This enables direct service-to-service communication (K8s ready)
backend.add(customDiscoveryServiceFactory);

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
