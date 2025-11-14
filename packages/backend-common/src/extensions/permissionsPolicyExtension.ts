import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import type { LoggerService } from '@backstage/backend-plugin-api';
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
 * Custom Permission Policy for Codaqui Backstage
 *
 * Implemented rules:
 * 1. Unauthenticated users have READ-only access to catalog entities
 * 2. User 'guest' and members of 'guests' group have only READ permission when authenticated
 * 3. Authenticated users can READ all catalog entities
 * 4. For actions that modify catalog resources (create/update/delete), only the owner can execute
 * 5. Other actions are allowed by default for authenticated users
 */
class CustomPermissionPolicy implements PermissionPolicy {
  private readonly logger: LoggerService;

  constructor(logger: LoggerService) {
    this.logger = logger;
  }

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {

    // If there is no user information (unauthenticated), allow only read permissions
    const hasUserInfo = user?.info !== undefined && user?.info !== null;
    if (!hasUserInfo) {
      // List of allowed permissions for unauthenticated users (read-only)
      const allowedUnauthenticatedPermissions = [
        'catalog.entity.read',
        'catalog.location.read',
        'scaffolder.template.parameter.read',
      ];

      // Check if requested permission is read-only
      const isReadPermission =
        request.permission.name.includes('.read') ||
        allowedUnauthenticatedPermissions.includes(request.permission.name);
      
      if (isReadPermission) {
        this.logger.debug(`✅ ALLOW: Unauthenticated user accessing read permission`, {
          permission: request.permission.name,
        });
        return { result: AuthorizeResult.ALLOW };
      }

      // Deny all other actions for unauthenticated users
      this.logger.warn(`❌ DENY: Unauthenticated user attempting non-read permission`, {
        permission: request.permission.name,
      });
      return { result: AuthorizeResult.DENY };
    }

    // Debug Logging
    this.logger.debug('Permission check details', {
      userId: user.info.userEntityRef,
      ownershipEntityRefs: user.info.ownershipEntityRefs,
      permissionName: request.permission.name,
      permissionAttributes: request.permission.attributes,
    });

    // List of entities representing guest users/groups
    const guestEntityRefs = ['user:default/guest', 'group:default/guests'];

    // Check if current user is guest or member of guests group
    const userEntityRefs = user.info.ownershipEntityRefs || [];
    const isGuestUser = userEntityRefs.some(entityRef => {
      const normalizedRef = entityRef.toLowerCase();
      return guestEntityRefs.includes(normalizedRef);
    });

    // If guest user, allow only read actions
    if (isGuestUser) {

      // List of allowed permissions for guests (read-only)
      const allowedGuestPermissions = [
        'catalog.entity.read',
        'catalog.location.read',
        'scaffolder.template.parameter.read',
      ];

      // Check if requested permission is read-only
      const isReadPermission =
        request.permission.name.includes('.read') ||
        allowedGuestPermissions.includes(request.permission.name);
      
      // Allow only read actions for guests
      if (isReadPermission) {
        this.logger.debug(`✅ ALLOW: Guest user accessing read permission`, {
          permission: request.permission.name,
          userRefs: userEntityRefs,
        });
        return { result: AuthorizeResult.ALLOW };
      }

      // Deny all other actions for guests
      this.logger.debug(`❌ DENY: Guest user attempting non-read permission`, {
        permission: request.permission.name,
        userRefs: userEntityRefs,
      });
      return { result: AuthorizeResult.DENY };
    }
    // Logging for authenticated users
    this.logger.debug('Authenticated user permission check', {
      permission: request.permission.name,
      userRefs: userEntityRefs,
    });

    // For authenticated users (non-guests):
    // Check if it's a catalog resource-related permission
    if (isResourcePermission(request.permission, 'catalog-entity')) {
      // For READ operations, allow all authenticated users
      if (request.permission.name.includes('.read')) {
        this.logger.debug(`✅ ALLOW: Authenticated user reading catalog entity`, {
          permission: request.permission.name,
          userRefs: userEntityRefs,
        });
        return { result: AuthorizeResult.ALLOW };
      }

      // For WRITE/DELETE operations, use conditional decision based on ownership
      // This allows only the resource owner to execute the action
      return createCatalogConditionalDecision(
        request.permission,
        catalogConditions.isEntityOwner({
          claims: user?.info.ownershipEntityRefs ?? [],
        }),
      );
    }

    // For catalog creation permissions (no resource type)
    // Allow for authenticated users (non-guests)
    this.logger.debug(`✅ ALLOW: Authenticated user accessing catalog create permission`, {
      permission: request.permission.name,
      userRefs: userEntityRefs,
    });
    if (
      request.permission.name === 'catalog.entity.create' ||
      request.permission.name === 'catalog.location.create'
    ) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Scaffolder permissions - allow for authenticated users
    if (request.permission.name.startsWith('scaffolder.')) {
      return { result: AuthorizeResult.ALLOW };
    }

    // Default: allow for authenticated users
    return { result: AuthorizeResult.ALLOW };
  }
}

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'permission-policy',
  register(reg) {
    reg.registerInit({
      deps: { 
        policy: policyExtensionPoint,
        log: coreServices.logger,
      },
      async init({ policy, log }) {
        log.info('Setting up CustomPermissionPolicy for Backstage Permission System');
        policy.setPolicy(new CustomPermissionPolicy(log));
        log.info('CustomPermissionPolicy has been set successfully');
      },
    });
  },
});
