import { Entity } from '@backstage/catalog-model';

/**
 * Tipos de recursos customizados da Codaqui
 */
export type CodaquiResourceType =
  | 'whatsapp'
  | 'discord'
  | 'youtube'
  | 'github'
  | 'linkedin'
  | 'instagram'
  | 'twitter'
  | 'learning-path'
  | 'blog'
  | 'website';

/**
 * Interface para grupo WhatsApp
 */
export interface WhatsAppGroup {
  name: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  entity: Entity;
}

/**
 * Props para componentes de recurso da comunidade
 */
export interface CommunityResourceProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  chips: string[];
  cardClass: string;
  onClick?: () => void;
}
