import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  PolicyDecision,
  isResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import {
  catalogConditions,
  createCatalogConditionalDecision,
} from '@backstage/plugin-catalog-backend/alpha';

/**
 * Custom Permission Policy para o Codaqui Backstage
 *
 * Regras implementadas:
 * 1. Usuário 'guest' e membros do grupo 'guests' têm apenas permissão de leitura (READ) global
 * 2. Para ações que modificam recursos do catálogo, apenas o owner pode executar
 * 3. Outras ações são permitidas por padrão para usuários autenticados
 */
class CustomPermissionPolicy implements PermissionPolicy {
  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    // Se não há nenhuma informação recusa o acesso.
    if (!user?.info) {
      return { result: AuthorizeResult.DENY };
    }

    // Lista de entidades que representam usuários/grupos guest
    const guestEntityRefs = ['user:default/guest', 'group:default/guests'];

    // Verifica se o usuário atual é guest ou membro do grupo guests
    const isGuestUser =
      user.info.ownershipEntityRefs?.some(ref =>
        guestEntityRefs.includes(ref.toLowerCase()),
      ) ?? false;

    // Se for usuário guest, permitir apenas ações de leitura
    if (isGuestUser) {
      // Lista de permissões permitidas para guests (apenas leitura)
      const allowedGuestPermissions = [
        'catalog.entity.read',
        'catalog.location.read',
        'scaffolder.template.parameter.read',
        'scaffolder.action.execute',
      ];

      // Verifica se a permissão solicitada é de leitura
      const isReadPermission =
        request.permission.name.includes('.read') ||
        allowedGuestPermissions.includes(request.permission.name);

      if (isReadPermission) {
        return { result: AuthorizeResult.ALLOW };
      }

      // Nega todas as outras ações para guests
      return { result: AuthorizeResult.DENY };
    }

    // Para usuários autenticados (não-guests):

    // Verificar se é uma permissão relacionada a recursos do catálogo
    if (isResourcePermission(request.permission, 'catalog-entity')) {
      // Para operações no catálogo, usar decisão condicional baseada em ownership
      // Isso permite que apenas o owner do recurso possa executar a ação
      return createCatalogConditionalDecision(
        request.permission,
        catalogConditions.isEntityOwner({
          claims: user?.info.ownershipEntityRefs ?? [],
        }),
      );
    }

    // Para permissões de criação no catálogo (não têm resource type)
    // Permitir para usuários autenticados (não-guests)
    if (
      request.permission.name === 'catalog.entity.create' ||
      request.permission.name === 'catalog.location.create'
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Permissões do Scaffolder - permitir para usuários autenticados
    if (request.permission.name.startsWith('scaffolder.')) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Padrão: permitir para usuários autenticados
    return { result: AuthorizeResult.ALLOW };
  }
}

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'permission-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint },
      async init({ policy }) {
        policy.setPolicy(new CustomPermissionPolicy());
      },
    });
  },
});
