import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useAsync } from 'react-use';
import type { WhatsAppGroup } from '../utils';
import { extractWhatsAppGroupInfo } from '../utils';

export function useWhatsAppGroups(): {
  groups: WhatsAppGroup[];
  loading: boolean;
  error: Error | undefined;
} {
  const catalogApi = useApi(catalogApiRef);

  const { value, loading, error } = useAsync(async () => {
    const entities = await catalogApi.getEntities({
      filter: {
        kind: 'Component',
        'spec.type': 'whatsapp',
      },
    });

    return entities.items.map(extractWhatsAppGroupInfo);
  }, []);

  return {
    groups: value || [],
    loading,
    error,
  };
}
