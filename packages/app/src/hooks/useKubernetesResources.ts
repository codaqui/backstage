import type { Entity } from '@backstage/catalog-model';
import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';

/* eslint-disable @typescript-eslint/explicit-function-return-type */

// ============================================================================
// TYPE DEFINITIONS - Kubernetes API Response Types
// ============================================================================

/**
 * Kubernetes cluster configuration from backend
 */
export interface KubernetesClusterConfig {
  name: string;
  url?: string;
  authProvider?: string;
  serviceAccountToken?: string;
}

/**
 * Kubernetes resource metadata
 */
export interface K8sResourceMetadata {
  name?: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  uid?: string;
  creationTimestamp?: string;
}

/**
 * Raw Kubernetes resource from API
 */
export interface K8sResource {
  type?: string;
  kind?: string;
  name?: string;
  namespace?: string;
  metadata?: K8sResourceMetadata;
  labels?: Record<string, string>;
}

/**
 * Grouped Kubernetes resources by type
 */
export interface K8sResourceGroup {
  type?: string;
  resources?: K8sResource[];
}

/**
 * Cluster-specific Kubernetes data
 */
export interface K8sClusterItem {
  cluster?: {
    name?: string;
  };
  resources?: K8sResourceGroup[];
}

/**
 * Kubernetes API response structure
 */
export interface K8sApiResponse {
  items?: K8sClusterItem[];
}

/**
 * Catalog API response structure
 */
export interface CatalogApiResponse {
  items?: Entity[];
}

/**
 * Processed Kubernetes resource for display
 */
export interface KubernetesResource {
  kind: string;
  name: string;
  namespace: string;
  cluster: string;
  labels: Record<string, string>;
  cataloged: boolean;
  catalogEntity?: string;
}

/**
 * Kubernetes cluster with its resources
 */
export interface KubernetesCluster {
  name: string;
  url: string;
  resources: KubernetesResource[];
}

interface KubernetesResourcesData {
  clusters: KubernetesCluster[];
  allResources: KubernetesResource[];
  catalogedCount: number;
}

export const useKubernetesResources = () => {
  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);

  const baseUrl = config.getString('backend.baseUrl');

  const { value, loading, error } = useAsync(
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async (): Promise<KubernetesResourcesData> => {
      const { token } = await identityApi.getCredentials();

      // Get clusters info
      const clustersResponse = await fetch(
        `${baseUrl}/api/kubernetes/clusters`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!clustersResponse.ok) {
        throw new Error('Failed to fetch clusters');
      }

      const clustersData = (await clustersResponse.json()) as
        | KubernetesClusterConfig[]
        | { items: KubernetesClusterConfig[] };
      const clusters: KubernetesClusterConfig[] = Array.isArray(clustersData)
        ? clustersData
        : clustersData.items || [];

      // Get all catalog entities to check what's cataloged
      const catalogResponse = await fetch(
        `${baseUrl}/api/catalog/entities?filter=kind=Component`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const catalogData = (await catalogResponse.json()) as
        | Entity[]
        | CatalogApiResponse;

      const allResources: KubernetesResource[] = [];

      // Initialize cluster data from configured clusters
      const clusterData: KubernetesCluster[] = clusters.map(cluster => ({
        name: cluster.name,
        url: cluster.url || 'N/A',
        resources: [],
      }));

      // Get K8s resources from all cataloged components
      // The catalog API returns an array directly, not wrapped in items
      const catalogEntities: Entity[] = Array.isArray(catalogData)
        ? catalogData
        : catalogData.items || [];

      const catalogedComponents = catalogEntities.filter(
        entity => entity.metadata?.annotations?.['backstage.io/kubernetes-id'],
      );

      // Fetch resources for each cataloged component
      for (const component of catalogedComponents) {
        const componentName = component.metadata.name;

        try {
          const k8sResponse = await fetch(
            `${baseUrl}/api/kubernetes/services/${componentName}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                entity: component,
              }),
            },
          );

          if (k8sResponse.ok) {
            const k8sData = (await k8sResponse.json()) as K8sApiResponse;

            // Process resources from all clusters
            k8sData.items?.forEach((clusterItem: K8sClusterItem) => {
              const clusterName = clusterItem.cluster?.name || 'unknown';

              // Process all resource types
              clusterItem.resources?.forEach(
                (resourceGroup: K8sResourceGroup) => {
                  resourceGroup.resources?.forEach((resource: K8sResource) => {
                    const catalogEntity = `${component.kind.toLowerCase()}:${
                      component.metadata.namespace || 'default'
                    }/${component.metadata.name}`;

                    // Determine resource type
                    let resourceType =
                      resource.type || resourceGroup.type || 'Unknown';
                    if (resource.kind) {
                      resourceType = resource.kind;
                    }

                    const resourceObj: KubernetesResource = {
                      kind: resourceType,
                      name:
                        resource.metadata?.name || resource.name || 'Unknown',
                      namespace:
                        resource.metadata?.namespace ||
                        resource.namespace ||
                        'default',
                      cluster: clusterName,
                      labels:
                        resource.metadata?.labels || resource.labels || {},
                      cataloged: true,
                      catalogEntity,
                    };

                    allResources.push(resourceObj);

                    // Add to cluster data
                    let cluster = clusterData.find(c => c.name === clusterName);
                    if (!cluster) {
                      const clusterConfig = clusters.find(
                        c => c.name === clusterName,
                      );
                      cluster = {
                        name: clusterName,
                        url: clusterConfig?.url || 'N/A',
                        resources: [],
                      };
                      clusterData.push(cluster);
                    }
                    cluster.resources.push(resourceObj);
                  });
                },
              );
            });
          }
          // Silently continue if k8s data fetch fails for a component
        } catch {
          // Silently continue if error occurs fetching k8s resources
        }
      }

      return {
        clusters: clusterData,
        allResources,
        catalogedCount: allResources.filter(r => r.cataloged).length,
      };
    },
    [baseUrl, identityApi],
  );

  return {
    data: value,
    loading,
    error,
  };
};
