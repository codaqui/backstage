import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { githubOrgEntityProviderTransformsExtensionPoint } from '@backstage/plugin-catalog-backend-module-github-org';
import {
  customDiscoveryServiceFactory,
  permissionsPolicyExtension,
} from '@internal/backend-common';
import { myTeamTransformer, myUserTransformer } from './transformers';

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

// Log environment configuration at startup
const logStartupConfig = createBackendModule({
  pluginId: 'app',
  moduleId: 'startup-logger',
  register(env) {
    env.registerInit({
      deps: { logger: coreServices.logger },
      async init({ logger }) {
        logger.info('🚀 Backend Catalog starting up');
        logger.debug('Environment configuration', {
          // eslint-disable-next-line dot-notation
          catalogServiceUrl: process.env['CATALOG_SERVICE_URL'] || 'not set',
          // eslint-disable-next-line dot-notation
          mainServiceUrl: process.env['MAIN_SERVICE_URL'] || 'not set',
          // eslint-disable-next-line dot-notation
          backendSecretConfigured: !!process.env['BACKEND_SECRET'],
        });
      },
    });
  },
});

backend.add(logStartupConfig);

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
