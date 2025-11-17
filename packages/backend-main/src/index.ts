import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
import { 
  runPeriodically, 
  permissionsPolicyExtension,
  customDiscoveryServiceFactory 
} from '@internal/backend-common';
import { Duration } from 'luxon';
import {
  ClusterDetails,
  KubernetesClustersSupplier,
  kubernetesClusterSupplierExtensionPoint,
} from '@backstage/plugin-kubernetes-node';

// Debug Environment Variables
console.log('🔍 Backend Main - Environment Variables:');
console.log(`   CATALOG_SERVICE_URL: ${process.env.CATALOG_SERVICE_URL}`);
console.log(`   MAIN_SERVICE_URL: ${process.env.MAIN_SERVICE_URL}`);
console.log(`   BACKEND_SECRET: ${process.env.BACKEND_SECRET ? '***' + process.env.BACKEND_SECRET.slice(-4) : 'NOT SET'}`);

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

// Replace default Discovery Service with custom implementation
// This enables direct service-to-service communication (K8s ready)
backend.add(customDiscoveryServiceFactory);

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
