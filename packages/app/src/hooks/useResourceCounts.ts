import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useAsync } from 'react-use';

export interface SystemResourceCount {
  whatsapp: number;
  learningResources: number;
  socialResources: number;
  total: number;
}

export function useResourceCounts(): {
  counts: SystemResourceCount | undefined;
  loading: boolean;
  error: Error | undefined;
} {
  const catalogApi = useApi(catalogApiRef);

  const { value, loading, error } = useAsync(async () => {
    const entities = await catalogApi.getEntities({
      filter: { kind: 'Component' },
    });

    const counts: SystemResourceCount = {
      whatsapp: 0,
      learningResources: 0,
      socialResources: 0,
      total: 0,
    };

    entities.items.forEach(entity => {
      counts.total++;

      // eslint-disable-next-line dot-notation
      const type = entity.spec?.['type'] as string;
      // eslint-disable-next-line dot-notation
      const system = entity.spec?.['system'] as string;

      // WhatsApp tem tratamento especial (é social mas mostramos separado)
      if (type === 'whatsapp') {
        counts.whatsapp++;
        return;
      }

      // Contar por sistema
      if (system === 'learning-resources') {
        counts.learningResources++;
      } else if (system === 'social-resources') {
        counts.socialResources++;
      }
      // Se não tem sistema, tentar inferir pelo tipo
      else if (
        type === 'learning-path' ||
        type === 'blog' ||
        type === 'website'
      ) {
        counts.learningResources++;
      } else if (
        type === 'discord' ||
        type === 'youtube' ||
        type === 'github' ||
        type === 'linkedin' ||
        type === 'instagram' ||
        type === 'twitter'
      ) {
        counts.socialResources++;
      }
    });

    return counts;
  }, []);

  return {
    counts: value,
    loading,
    error,
  };
}
