/**
 * @internal/backend-common
 * Shared utilities and extensions for Codaqui Backstage backends
 */

// Exports all shared backend code

// Extensions
export { default as permissionsPolicyExtension } from './extensions/permissionsPolicyExtension';

// Services
export { customDiscoveryServiceFactory } from './services/discoveryService';

// Utils
export { runPeriodically } from './utils/runPeriodically';
