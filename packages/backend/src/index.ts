import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
// import { githubOrgEntityProviderTransformsExtensionPoint } from '@backstage/plugin-catalog-backend-module-github-org';
// import { myTeamTransformer, myUserTransformer } from './transformers';
import { runPeriodically } from './utils/runPeriodically';
import { Duration } from 'luxon';
import {
  ClusterDetails,
  KubernetesClustersSupplier,
  kubernetesClusterSupplierExtensionPoint,
} from '@backstage/plugin-kubernetes-node';

// GitHub Org Module - Uncomment to use custom transformers
// const githubOrgModule = createBackendModule({
//   pluginId: 'catalog',
//   moduleId: 'github-org-extensions',
//   register(env) {
//     env.registerInit({
//       deps: {
//         githubOrg: githubOrgEntityProviderTransformsExtensionPoint,
//       },
//       async init({ githubOrg }) {
//         githubOrg.setTeamTransformer(myTeamTransformer);
//         githubOrg.setUserTransformer(myUserTransformer);
//       },
//     });
//   },
// });

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

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// https://backstage.io/docs/integrations/github/discovery
backend.add(import('@backstage/plugin-catalog-backend-module-github'));

// https://backstage.io/docs/integrations/github/org
backend.add(import('@backstage/plugin-catalog-backend-module-github-org'));
// backend.add(githubOrgModule);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));

// Improve Permission System - https://backstage.io/docs/permissions/getting-started
backend.add(import('./extensions/permissionsPolicyExtension'));

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
