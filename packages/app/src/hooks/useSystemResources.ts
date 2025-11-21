import type { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useAsync } from 'react-use';

export interface SystemResource {
  name: string;
  title: string;
  description: string;
  link?: { url: string; title: string };
  tags: string[];
  type: string;
  entity: Entity;
}

function extractSystemResourceInfo(entity: Entity): SystemResource {
  // Usa o primeiro link do Backstage (se existir)
  const firstLink = entity.metadata.links?.[0];

  return {
    name: entity.metadata.name,
    title:
      entity.metadata.annotations?.['human-name'] ||
      entity.metadata.title ||
      entity.metadata.name,
    description: entity.metadata.description || 'Sem descrição',
    link: firstLink
      ? { url: firstLink.url, title: firstLink.title || 'Acessar' }
      : undefined,
    tags: entity.metadata.tags || [],
    // eslint-disable-next-line dot-notation
    type: (entity.spec?.['type'] as string) || 'unknown',
    entity,
  };
}

/**
 * Hook para buscar recursos de um sistema específico
 * @param systemName Nome do sistema (e.g., 'learning-resources', 'social-resources')
 */
export function useSystemResources(systemName: string): {
  resources: SystemResource[];
  loading: boolean;
  error: Error | undefined;
} {
  const catalogApi = useApi(catalogApiRef);

  const {
    value: resources,
    loading,
    error,
  } = useAsync(async (): Promise<SystemResource[]> => {
    const entities = await catalogApi.getEntities({
      filter: {
        kind: 'Component',
      },
    });

    // Filtrar por sistema
    const filtered = entities.items.filter(
      entity =>
        // eslint-disable-next-line dot-notation
        entity.spec?.['system'] === systemName ||
        entity.relations?.some(
          rel =>
            rel.type === 'partOf' &&
            rel.targetRef.includes(`system:default/${systemName}`),
        ),
    );

    return filtered.map(extractSystemResourceInfo);
  }, [catalogApi, systemName]);

  return { resources: resources || [], loading, error };
}
