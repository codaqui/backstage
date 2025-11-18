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

// ==============================================================================
// 🎯 CENTRALIZED GROUP PERMISSIONS CONFIGURATION
// ==============================================================================

/**
 * Special groups configuration and their permissions
 * 
 * 📝 How to add new groups and permissions:
 * 1. Add the group to SPECIAL_GROUPS
 * 2. Define specific permissions in GROUP_PERMISSIONS
 * 3. The system will automatically apply the rules
 * 
 * 🌟 Wildcard Support:
 * - Use "*.read" to grant all read permissions
 * - Use "announcement.*" to grant all announcement permissions
 * - Use "catalog.entity.*" for all catalog entity operations
 * - Wildcards are processed before exact matches
 */
const PERMISSION_CONFIG = {
  // 👥 Special groups with custom permissions
  SPECIAL_GROUPS: {
    GUESTS: ['user:default/guest', 'group:default/guests'],
    CONSELHO: ['group:default/conselho'],
    // ADMINS: ['group:default/admins'],
    // MODERATORS: ['group:default/moderators'],
  },

  // 🎯 Specific permissions by group (supports wildcards)
  GROUP_PERMISSIONS: {
    // Conselho: Can manage announcements
    conselho: [
      'announcement.entity.*',      // All announcement operations
      // Or use specific permissions:
      // 'announcement.entity.create',
      // 'announcement.entity.update', 
      // 'announcement.entity.delete',
      // 'announcement.entity.read',
    ],
    
    // Example of other groups (uncomment and configure as needed)
    // admins: [
    //   'catalog.entity.*',           // All catalog operations
    //   'scaffolder.*',               // All scaffolder operations
    //   '*.read',                     // All read operations
    // ],
    // moderators: [
    //   'catalog.entity.update',
    //   'techdocs.*',                 // All TechDocs operations
    //   '*.read',                     // All read operations
    // ],
  },

  // 📋 Base permissions always allowed for authenticated users
  AUTHENTICATED_BASE_PERMISSIONS: [
    '*.read',
  ],

  // 🔓 Permissions allowed for unauthenticated users
  UNAUTHENTICATED_PERMISSIONS: [
    '*.read',
  ],

  // 👤 Specific permissions for authenticated guests
  GUEST_PERMISSIONS: [
    '*.read',
  ],
} as const;

// ==============================================================================
// 🛠️ PERMISSION VERIFICATION UTILITIES
// ==============================================================================

/**
 * Checks if a permission matches a wildcard pattern
 * 
 * Examples:
 * - "*.read" matches "catalog.entity.read", "announcement.entity.read"
 * - "announcement.*" matches "announcement.entity.create", "announcement.entity.update"
 * - "catalog.entity.*" matches "catalog.entity.read", "catalog.entity.update"
 */
function matchesWildcard(permission: string, pattern: string): boolean {
  if (!pattern.includes('*')) {
    return permission === pattern;
  }
  
  const regexPattern = pattern
    .replace(/\./g, '\\.')  // Escape dots
    .replace(/\*/g, '.*');   // Convert * to .*
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(permission);
}

/**
 * Checks if the user belongs to a specific group
 */
function isUserInGroup(userEntityRefs: string[], groupRefs: readonly string[]): boolean {
  const normalizedUserRefs = userEntityRefs.map(ref => ref.toLowerCase());
  const normalizedGroupRefs = [...groupRefs].map(ref => ref.toLowerCase());
  
  return normalizedUserRefs.some(userRef => 
    normalizedGroupRefs.includes(userRef)
  );
}

/**
 * Gets all user-specific permissions based on groups (supports wildcards)
 */
function getUserSpecificPermissions(userEntityRefs: string[]): string[] {
  const permissions: string[] = [];

  // Check each group and add their permissions
  Object.entries(PERMISSION_CONFIG.SPECIAL_GROUPS).forEach(([groupKey, groupRefs]) => {
    if (isUserInGroup(userEntityRefs, groupRefs)) {
      const groupName = groupKey.toLowerCase();
      const groupPermissions = PERMISSION_CONFIG.GROUP_PERMISSIONS[groupName as keyof typeof PERMISSION_CONFIG.GROUP_PERMISSIONS];
      if (groupPermissions) {
        permissions.push(...groupPermissions);
      }
    }
  });

  return [...new Set(permissions)]; // Remove duplicates
}

/**
 * Checks if a permission is granted considering wildcards
 */
function hasPermissionWithWildcards(permission: string, grantedPermissions: string[]): boolean {
  return grantedPermissions.some(granted => matchesWildcard(permission, granted));
}

/**
 * Checks if a permission is considered a read permission
 */
function isReadPermission(permissionName: string, allowedReadPermissions: readonly string[]): boolean {
  return permissionName.includes('.read') || 
         (allowedReadPermissions as readonly string[]).some(allowed => 
           matchesWildcard(permissionName, allowed)
         );
}

/**
 * Custom Permission Policy for Codaqui Backstage
 *
 * 🎯 Implemented rules:
 * 1. Unauthenticated users: Limited READ-only access
 * 2. Guest users: READ-only access when authenticated
 * 3. Special groups: Custom permissions (e.g., conselho can manage announcements)
 * 4. Authenticated users: Read access + ownership-based permissions
 * 5. Catalog resources: Only owner can modify/delete
 * 6. Wildcard support: Use patterns like '*.read', 'announcement.*'
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
    const permissionName = request.permission.name;

    // 📊 Detailed logging for debug
    this.logger.debug('🔍 Permission check initiated', {
      permission: permissionName,
      userId: user?.info?.userEntityRef,
      userGroups: user?.info?.ownershipEntityRefs,
      hasUser: !!user?.info,
    });

    // 🚫 UNAUTHENTICATED USERS
    if (!user?.info) {
      const isAllowed = isReadPermission(permissionName, PERMISSION_CONFIG.UNAUTHENTICATED_PERMISSIONS);
      
      this.logger.debug(isAllowed ? '✅ ALLOW: Unauthenticated read access' : '❌ DENY: Unauthenticated non-read access', {
        permission: permissionName,
        allowed: isAllowed,
      });

      return { result: isAllowed ? AuthorizeResult.ALLOW : AuthorizeResult.DENY };
    }

    const userEntityRefs = user.info.ownershipEntityRefs || [];

    // 👤 CHECK IF USER IS GUEST
    const isGuestUser = isUserInGroup(userEntityRefs, PERMISSION_CONFIG.SPECIAL_GROUPS.GUESTS);
    
    if (isGuestUser) {
      const isAllowed = isReadPermission(permissionName, PERMISSION_CONFIG.GUEST_PERMISSIONS);
      
      this.logger.debug(isAllowed ? '✅ ALLOW: Guest read access' : '❌ DENY: Guest non-read access', {
        permission: permissionName,
        userRefs: userEntityRefs,
        allowed: isAllowed,
      });

      return { result: isAllowed ? AuthorizeResult.ALLOW : AuthorizeResult.DENY };
    }

    // 🎯 CHECK GROUP-SPECIFIC PERMISSIONS (with wildcard support)
    const userSpecificPermissions = getUserSpecificPermissions(userEntityRefs);
    
    if (hasPermissionWithWildcards(permissionName, userSpecificPermissions)) {
      this.logger.debug('✅ ALLOW: Group-specific permission granted (wildcard match)', {
        permission: permissionName,
        userRefs: userEntityRefs,
        grantedPermissions: userSpecificPermissions,
        wildcardMatch: true,
      });

      return { result: AuthorizeResult.ALLOW };
    }

    // 📚 CATALOG PERMISSIONS (with ownership verification)
    if (isResourcePermission(request.permission, 'catalog-entity')) {
      // Read: allow for all authenticated users
      if (isReadPermission(permissionName, PERMISSION_CONFIG.AUTHENTICATED_BASE_PERMISSIONS)) {
        this.logger.debug('✅ ALLOW: Authenticated user reading catalog entity', {
          permission: permissionName,
          userRefs: userEntityRefs,
        });
        return { result: AuthorizeResult.ALLOW };
      }

      // Write/Delete: owner only
      this.logger.debug('🔄 CONDITIONAL: Catalog resource ownership check', {
        permission: permissionName,
        userRefs: userEntityRefs,
      });

      return createCatalogConditionalDecision(
        request.permission,
        catalogConditions.isEntityOwner({
          claims: userEntityRefs,
        }),
      );
    }

    // 🏗️ CATALOG CREATION PERMISSIONS
    if (['catalog.entity.create', 'catalog.location.create'].includes(permissionName)) {
      this.logger.debug('✅ ALLOW: Catalog creation permission for authenticated user', {
        permission: permissionName,
        userRefs: userEntityRefs,
      });
      return { result: AuthorizeResult.ALLOW };
    }

    // 🚀 SCAFFOLDER PERMISSIONS
    if (permissionName.startsWith('scaffolder.')) {
      this.logger.debug('✅ ALLOW: Scaffolder permission for authenticated user', {
        permission: permissionName,
        userRefs: userEntityRefs,
      });
      return { result: AuthorizeResult.ALLOW };
    }

    // 🔧 BASE AUTHENTICATED PERMISSIONS
    if (isReadPermission(permissionName, PERMISSION_CONFIG.AUTHENTICATED_BASE_PERMISSIONS)) {
      this.logger.debug('✅ ALLOW: Base authenticated permission', {
        permission: permissionName,
        userRefs: userEntityRefs,
      });
      return { result: AuthorizeResult.ALLOW };
    }

    // ⚠️ DEFAULT: DENY UNRECOGNIZED PERMISSIONS
    this.logger.warn('❌ DENY: Unknown or unauthorized permission', {
      permission: permissionName,
      userRefs: userEntityRefs,
      message: 'Permission not explicitly allowed - consider adding to configuration',
    });

    return { result: AuthorizeResult.DENY };
  }
}

// ==============================================================================
// 🎯 BACKSTAGE EXTENSION MODULE
// ==============================================================================

/**
 * Extension module for Backstage permission system
 * 
 * 📋 How to use:
 * 1. Import this module in your backend
 * 2. Add to backend with: backend.add(import('./extensions/permissionsPolicyExtension'))
 * 3. Configure groups in PERMISSION_CONFIG above
 * 
 * 🔧 How to add new permissions:
 * 1. Add the group to SPECIAL_GROUPS
 * 2. Define permissions in GROUP_PERMISSIONS
 * 3. Permissions will be automatically applied
 * 
 * 🌟 Wildcard examples:
 * ```typescript
 * GROUP_PERMISSIONS: {
 *   // Grant all read permissions
 *   readers: ['*.read'],
 *   
 *   // Grant all announcement operations
 *   announcers: ['announcement.*'],
 *   
 *   // Grant all catalog entity operations
 *   catalogAdmins: ['catalog.entity.*'],
 *   
 *   // Mixed specific and wildcard permissions
 *   moderators: [
 *     'announcement.*',
 *     'techdocs.entity.update',
 *     '*.read',
 *   ],
 * }
 * ```
 */
export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'codaqui-permission-policy',
  register(reg) {
    reg.registerInit({
      deps: { 
        policy: policyExtensionPoint,
        log: coreServices.logger,
      },
      async init({ policy, log }) {
        log.info('🚀 Setting up CustomPermissionPolicy for Codaqui permission system');
        
        // Configuration logging for debug
        log.debug('📋 Permission configuration loaded', {
          specialGroups: Object.keys(PERMISSION_CONFIG.SPECIAL_GROUPS),
          groupPermissions: Object.keys(PERMISSION_CONFIG.GROUP_PERMISSIONS),
          unauthenticatedPermissions: PERMISSION_CONFIG.UNAUTHENTICATED_PERMISSIONS.length,
          authenticatedBasePermissions: PERMISSION_CONFIG.AUTHENTICATED_BASE_PERMISSIONS.length,
          wildcardSupport: true,
        });
        
        policy.setPolicy(new CustomPermissionPolicy(log));
        log.info('✅ CustomPermissionPolicy configured successfully!');
      },
    });
  },
});

// ==============================================================================
// 📚 EXPORT UTILITIES FOR TESTING (OPTIONAL)
// ==============================================================================

export {
  PERMISSION_CONFIG,
  matchesWildcard,
  isUserInGroup,
  getUserSpecificPermissions,
  hasPermissionWithWildcards,
  isReadPermission,
};
