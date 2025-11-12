import { useApi, configApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';

export interface KubernetesResource {
  kind: string;
  name: string;
  namespace: string;
  cluster: string;
  labels: Record<string, string>;
  cataloged: boolean;
  catalogEntity?: string;
}

export interface KubernetesCluster {
  name: string;
  url: string;
  resources: KubernetesResource[];
}

export const useKubernetesResources = () => {
  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  
  const baseUrl = config.getString('backend.baseUrl');

  const { value, loading, error } = useAsync(async () => {
    const { token } = await identityApi.getCredentials();
    
    // Get clusters info
    const clustersResponse = await fetch(`${baseUrl}/api/kubernetes/clusters`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!clustersResponse.ok) {
      throw new Error('Failed to fetch clusters');
    }
    
    const clustersData = await clustersResponse.json();
    const clusters = Array.isArray(clustersData) ? clustersData : (clustersData.items || []);
    
    // Get all catalog entities to check what's cataloged
    const catalogResponse = await fetch(`${baseUrl}/api/catalog/entities?filter=kind=Component`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const catalogData = await catalogResponse.json();

    const allResources: KubernetesResource[] = [];
    
    // Initialize cluster data from configured clusters
    const clusterData: KubernetesCluster[] = clusters.map((cluster: any) => ({
      name: cluster.name,
      url: cluster.url || 'N/A',
      resources: [],
    }));

    // Get K8s resources from all cataloged components
    // The catalog API returns an array directly, not wrapped in items
    const catalogedComponents = (Array.isArray(catalogData) ? catalogData : catalogData.items || []).filter(
      (entity: any) => entity.metadata?.annotations?.['backstage.io/kubernetes-id']
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
          }
        );

        if (k8sResponse.ok) {
          const k8sData = await k8sResponse.json();
          
          // Process resources from all clusters
          k8sData.items?.forEach((clusterItem: any) => {
            const clusterName = clusterItem.cluster?.name || 'unknown';
            
            // Process all resource types
            clusterItem.resources?.forEach((resourceGroup: any) => {
              
              
              resourceGroup.resources?.forEach((resource: any) => {
                const catalogEntity = `${component.kind.toLowerCase()}:${component.metadata.namespace || 'default'}/${component.metadata.name}`;
                
                // Determine resource type
                let resourceType = resource.type || resourceGroup.type || 'Unknown';
                if (resource.kind) {
                  resourceType = resource.kind;
                }
                
                const resourceObj: KubernetesResource = {
                  kind: resourceType,
                  name: resource.metadata?.name || resource.name || 'Unknown',
                  namespace: resource.metadata?.namespace || resource.namespace || 'default',
                  cluster: clusterName,
                  labels: resource.metadata?.labels || resource.labels || {},
                  cataloged: true,
                  catalogEntity,
                };
                
                allResources.push(resourceObj);
                
                // Add to cluster data
                let cluster = clusterData.find(c => c.name === clusterName);
                if (!cluster) {
                  cluster = {
                    name: clusterName,
                    url: clusters.find((c: any) => c.name === clusterName)?.url || 'N/A',
                    resources: [],
                  };
                  clusterData.push(cluster);
                }
                cluster.resources.push(resourceObj);
              });
            });
          });
        } else {
          // failed to fetch k8s data for this component
        }
      } catch (err) {
        // error fetching k8s resources for component
      }
    }


    // Return only cataloged resources; uncataloged discovery removed per design decision
    return {
      clusters: clusterData,
      allResources,
      catalogedCount: allResources.filter(r => r.cataloged).length,
      uncatalogedCount: 0,
    };
  }, [baseUrl]);

  return {
    data: value,
    loading,
    error,
  };
};
