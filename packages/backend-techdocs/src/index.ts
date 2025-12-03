import { createBackend } from '@backstage/backend-defaults';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  customDiscoveryServiceFactory,
  permissionsPolicyExtension,
} from '@internal/backend-common';

const backend = createBackend();

// Log environment configuration at startup
const logStartupConfig = createBackendModule({
  pluginId: 'app',
  moduleId: 'startup-logger',
  register(env) {
    env.registerInit({
      deps: { logger: coreServices.logger },
      async init({ logger }) {
        logger.info('🚀 Backend TechDocs starting up');
        logger.debug('Environment configuration', {
          // eslint-disable-next-line dot-notation
          catalogServiceUrl: process.env['CATALOG_SERVICE_URL'] || 'not set',
          // eslint-disable-next-line dot-notation
          mainServiceUrl: process.env['MAIN_SERVICE_URL'] || 'not set',
          // eslint-disable-next-line dot-notation
          techdocsServiceUrl: process.env['TECHDOCS_SERVICE_URL'] || 'not set',
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

// auth plugin (needed to validate tokens from other backends)
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// permission plugin (needed to enforce permissions)
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(permissionsPolicyExtension);

// techdocs plugin - the main purpose of this backend
backend.add(import('@backstage/plugin-techdocs-backend'));

// Let's go! Start!
backend.start();
