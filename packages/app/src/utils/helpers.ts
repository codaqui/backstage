import { Entity } from '@backstage/catalog-model';
import { WhatsAppGroup } from './types';

/**
 * Extrai informações de um grupo WhatsApp de uma entidade do catálogo
 */
export function extractWhatsAppGroupInfo(entity: Entity): WhatsAppGroup {
  const firstLink = entity.metadata.links?.[0];
  
  return {
    name: entity.metadata.name,
    title: entity.metadata.annotations?.['human-name'] || entity.metadata.name,
    description: entity.metadata.description || '',
    url: firstLink?.url || '',
    tags: entity.metadata.tags || [],
    entity,
  };
}

/**
 * Gera URL de filtro do catálogo para um tipo específico
 */
export function getCatalogFilterUrl(
  type: string,
  kind: string = 'component',
): string {
  return `/catalog?filters[kind]=${kind}&filters[type]=${type}`;
}

/**
 * Formata um nome de componente para exibição
 */
export function formatComponentName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extrai o tipo de uma entidade
 */
export function getEntityType(entity: Entity): string | undefined {
  return entity.spec?.type as string | undefined;
}
