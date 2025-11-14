import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import type { DiscoveryService } from '@backstage/backend-plugin-api';
import { runPeriodically, permissionsPolicyExtension } from '@internal/backend-common';
import { Duration } from 'luxon';
import {
  ClusterDetails,
  KubernetesClustersSupplier,
  kubernetesClusterSupplierExtensionPoint,
} from '@backstage/plugin-kubernetes-node';

// Custom Discovery Service
// Maps plugins to their respective backend services
class CustomDiscoveryService implements DiscoveryService {
  private readonly serviceMap: Map<string, string>;

  constructor() {
    this.serviceMap = new Map([
      // Catalog service (other backend)
      ['catalog', process.env.CATALOG_SERVICE_URL || 'http://localhost:7008'],
      
      // Main service (this backend)
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

// Custom Kubernetes Clusters Supplier
// https://backstage.io/docs/features/kubernetes/installation
export class CustomClustersSupplier implements KubernetesClustersSupplier {
  constructor(private clusterDetails: ClusterDetails[] = []) {}

  static create(refreshInterval: Duration) {
    const clusterSupplier = new CustomClustersSupplier();
    // setup refresh, e.g. using a copy of https://github.com/backstage/backstage/blob/master/plugins/kubernetes-backend/src/service/runPeriodically.ts
    runPeriodically(
      () => clusterSupplier.refreshClusters(),
      refreshInterval.toMillis(),
    );
    return clusterSupplier;
  }

  async refreshClusters(): Promise<void> {
    this.clusterDetails = []; // fetch from somewhere
  }

  async getClusters(): Promise<ClusterDetails[]> {
    return this.clusterDetails;
  }
}

const backend = createBackend();

// Add custom discovery service
backend.add(discoveryModule);

// Example of replacing the default Kubernetes cluster discovery and service locator
// See https://backstage.io/docs/features/kubernetes/installation#extending-the-kubernetes-backend

export const kubernetesModuleCustomClusterDiscovery = createBackendModule({
  pluginId: 'kubernetes',
  moduleId: 'custom-cluster-discovery',
  register(env) {
    env.registerInit({
      deps: {
        clusterSupplier: kubernetesClusterSupplierExtensionPoint,
      },
      async init({ clusterSupplier }) {
        // simple replace of the internal dependency
        clusterSupplier.addClusterSupplier(
          CustomClustersSupplier.create(Duration.fromObject({ minutes: 60 })),
        );

        // Optional: Add custom service locator if needed
        // serviceLocator.addServiceLocator(
        //   async ({ getDefault, clusterSupplier }) => {
        //     const defaultImplementation = await getDefault();
        //     return new MyCustomServiceLocator({ clusterSupplier });
        //   },
        // );
      },
    });
  },
});

// Separate Frontend (app)
// backend.add(import('@backstage/plugin-app-backend'));

// Maintain the proxy plugin for the frontend app
backend.add(import('@backstage/plugin-proxy-backend'));

// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);

// techdocs plugin
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));

// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));

// Improve Permission System - https://backstage.io/docs/permissions/getting-started
backend.add(permissionsPolicyExtension);

// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
// backend.add(
//   import('@backstage/plugin-permission-backend-module-allow-all-policy'),
// );

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes plugin
backend.add(import('@backstage/plugin-kubernetes-backend'));
// backend.add(kubernetesModuleCustomClusterDiscovery); // Commented out - using config-based discovery instead

// notifications and signals plugins
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

// Let's go! Start!
backend.start();
