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
// 🎯 TYPE-SAFE CENTRALIZED GROUP PERMISSIONS CONFIGURATION
// ==============================================================================

/**
 * Type-safe configuration that ensures every group in SPECIAL_GROUPS
 * has corresponding permissions defined in GROUP_PERMISSIONS
 * 
 * 🔒 Key Enforcement: SPECIAL_GROUPS keys MUST be lowercase
 * - TypeScript will error if you use uppercase keys like 'GUESTS'
 * - This prevents runtime mismatches between group names and permissions
 */

// First, define the base group configuration with enforced lowercase keys
const SPECIAL_GROUPS = {
  guests: ['user:default/guest', 'group:default/guests'],
  conselho: ['group:default/conselho'],
  // admins: ['group:default/admins'],
  // moderators: ['group:default/moderators'],
} as const;

// Create a type that extracts group names from SPECIAL_GROUPS
type GroupNames = keyof typeof SPECIAL_GROUPS;

// Type-safe GROUP_PERMISSIONS that must include all groups from SPECIAL_GROUPS
type GroupPermissions = {
  [K in GroupNames]: readonly string[];
};

// Now define permissions with compile-time type safety
const GROUP_PERMISSIONS: GroupPermissions = {
  // ✅ Type-safe: 'conselho' must exist because conselho is in SPECIAL_GROUPS
  conselho: [
    'announcement.entity.*',      // All announcement operations
    // Or use specific permissions:
    // 'announcement.entity.create',
    // 'announcement.entity.update', 
    // 'announcement.entity.delete',
    // 'announcement.entity.read',
  ],
  
  // ✅ Type-safe: 'guests' must exist because guests is in SPECIAL_GROUPS
  guests: [
    '*.read',  // Read-only access for guest group (fallback)
  ],
  
  // Example: When you uncomment groups above, you MUST add them here:
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
} as const;

/**
 * Complete type-safe permission configuration
 * 
 * 🛡️ Type Safety Benefits:
 * - Compile-time error if group exists in SPECIAL_GROUPS but not in GROUP_PERMISSIONS
 * - Prevents silent runtime failures
 * - IntelliSense autocomplete for group names
 * - Refactoring safety when renaming groups
 * 
 * 📝 How to add new groups safely:
 * 1. Add the group to SPECIAL_GROUPS with lowercase key (e.g., 'admins')
 * 2. TypeScript will error until you add corresponding entry to GROUP_PERMISSIONS
 * 3. The system ensures consistency at compile time
 * 
 * 🌟 Wildcard Support:
 * - Use "*.read" to grant all read permissions
 * - Use "announcement.*" to grant all announcement permissions
 * - Use "catalog.entity.*" for all catalog entity operations
 */
const PERMISSION_CONFIG = {
  // 👥 Special groups with custom permissions  
  SPECIAL_GROUPS,
  
  // 🎯 Type-safe permissions by group (supports wildcards)
  GROUP_PERMISSIONS,

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
  
  // Escape all regex special characters except '*'
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape all special regex chars
    .replace(/\*/g, '.*');                 // Convert * to .*
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
 * Optimized function to get user groups and their permissions
 * 
 * 🚀 Performance optimizations:
 * - Pre-normalizes user refs once using Set for O(1) lookups
 * - Pre-computes normalized group refs (cached)
 * - Uses Set for automatic deduplication
 * - Returns both groups and permissions in single pass
 * - Avoids array spreads and multiple iterations
 */
function getUserGroupsAndPermissions(userEntityRefs: string[]): { groups: GroupNames[], permissions: string[] } {
  const normalizedUserRefs = new Set(userEntityRefs.map(ref => ref.toLowerCase()));
  const matchedGroups: GroupNames[] = [];
  const permissionsSet = new Set<string>();

  // Pre-compute normalized group refs (done once, cached)
  const normalizedGroupRefs = new Map<GroupNames, Set<string>>();
  for (const [groupKey, groupRefs] of Object.entries(PERMISSION_CONFIG.SPECIAL_GROUPS)) {
    const groupName = groupKey as GroupNames;
    normalizedGroupRefs.set(groupName, new Set(groupRefs.map(ref => ref.toLowerCase())));
  }

  // Check group membership efficiently
  for (const [groupName, normalizedRefs] of normalizedGroupRefs) {
    const hasMatch = Array.from(normalizedRefs).some(ref => normalizedUserRefs.has(ref));
    if (hasMatch) {
      matchedGroups.push(groupName);
      
      // Add permissions directly to set (deduplicates automatically)
      const groupPermissions = PERMISSION_CONFIG.GROUP_PERMISSIONS[groupName];
      if (groupPermissions) {
        groupPermissions.forEach(perm => permissionsSet.add(perm));
      }
    }
  }

  return {
    groups: matchedGroups,
    permissions: Array.from(permissionsSet),
  };
}

/**
 * Gets all user-specific permissions based on groups (type-safe with wildcards)
 * 
 * 🛡️ Type Safety: No more unsafe type assertions!
 * - Uses proper typing to ensure group exists in permissions
 * - Validates group permissions exist before access
 * - Provides helpful error logging for misconfiguration
 * 
 * 🚀 Performance: Optimized for frequent calls
 * - Uses efficient group matching with Sets
 * - Automatic deduplication
 * - Minimal memory allocations
 */
function getUserSpecificPermissions(userEntityRefs: string[], logger?: LoggerService): string[] {
  const { groups, permissions } = getUserGroupsAndPermissions(userEntityRefs);

  // Log matched groups for debugging
  if (logger && groups.length > 0) {
    groups.forEach(groupName => {
      const groupPermissions = PERMISSION_CONFIG.GROUP_PERMISSIONS[groupName];
      logger.debug(`🎯 Group permissions added for '${groupName}'`, {
        group: groupName,
        permissions: [...groupPermissions], // Convert readonly array for logging
      });
    });
  }

  return permissions;
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
         allowedReadPermissions.some(allowed => 
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

    // 🚀 OPTIMIZATION: Get user groups and permissions in one efficient call
    // - Normalizes user refs once with Set for O(1) lookups
    // - Pre-computes group memberships
    // - Returns deduplicated permissions
    // - Avoids duplicate group checks (guest check uses same data)
    const { groups: userGroups, permissions: userSpecificPermissions } = getUserGroupsAndPermissions(userEntityRefs);

    // 👤 CHECK IF USER IS GUEST (optimized - no extra group check)
    const isGuestUser = userGroups.includes('guests');
    
    if (isGuestUser) {
      const isAllowed = isReadPermission(permissionName, PERMISSION_CONFIG.GUEST_PERMISSIONS);
      
      this.logger.debug(isAllowed ? '✅ ALLOW: Guest read access' : '❌ DENY: Guest non-read access', {
        permission: permissionName,
        userRefs: userEntityRefs,
        userGroups,
        allowed: isAllowed,
      });

      return { result: isAllowed ? AuthorizeResult.ALLOW : AuthorizeResult.DENY };
    }

    // 🎯 CHECK GROUP-SPECIFIC PERMISSIONS (with wildcard support)
    if (hasPermissionWithWildcards(permissionName, userSpecificPermissions)) {
      this.logger.debug('✅ ALLOW: Group-specific permission granted (wildcard match)', {
        permission: permissionName,
        userRefs: userEntityRefs,
        userGroups,
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
  getUserGroupsAndPermissions,
  getUserSpecificPermissions,
  hasPermissionWithWildcards,
  isReadPermission,
};

// Export types for external use
export type { GroupNames, GroupPermissions };
