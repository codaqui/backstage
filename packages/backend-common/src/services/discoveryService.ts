import type {
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import {
  coreServices,
  createServiceFactory,
} from '@backstage/backend-plugin-api';

// ============================================================================
// CONFIGURATION - Edit this section to manage plugin routing
// ============================================================================

/**
 * Logging Levels:
 * - info: Service initialization, configuration summary
 * - debug: Individual discovery calls (internal/external routing)
 * - error: Configuration errors, missing plugins
 *
 * To enable debug logs, set in app-config.yaml:
 * backend:
 *   logger:
 *     level: debug
 *     filters:
 *       discovery:
 *         level: debug
 */

/**
 * Plugin IDs hosted by backend-catalog (port 7008)
 * These plugins use CATALOG_SERVICE_URL and internal URLs for discovery
 */
const CATALOG_PLUGINS = ['catalog'] as const;

/**
 * Plugin IDs hosted by backend-techdocs (port 7009)
 * These plugins use TECHDOCS_SERVICE_URL and internal URLs for discovery
 */
const TECHDOCS_PLUGINS = ['techdocs'] as const;

/**
 * Plugin IDs hosted by backend-main (port 7007)
 * These plugins use MAIN_SERVICE_URL internally but expose via external URL
 */
const MAIN_PLUGINS = [
  // Core
  'auth',
  'proxy',
  'permission',

  // Features
  'scaffolder',
  'search',
  'kubernetes',

  // Integrations
  'notifications',
  'signals',
  'events',

  // Community
  'announcements',
  'categories',
  'tags',
  'adr',
] as const;

/**
 * Default service URLs (fallback if environment variables are not set)
 */
const DEFAULT_URLS = {
  catalog: 'http://localhost:7008',
  techdocs: 'http://localhost:7009',
  main: 'http://localhost:7007',
  external: 'http://localhost:7007',
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type CatalogPlugin = (typeof CATALOG_PLUGINS)[number];
type TechdocsPlugin = (typeof TECHDOCS_PLUGINS)[number];
type MainPlugin = (typeof MAIN_PLUGINS)[number];
type PluginId = CatalogPlugin | TechdocsPlugin | MainPlugin;

interface DiscoveryConfig {
  externalBaseUrl: string; // Will fallback to mainServiceUrl if not set
  catalogServiceUrl: string;
  techdocsServiceUrl: string;
  mainServiceUrl: string;
  logger: LoggerService;
}

// ============================================================================
// DISCOVERY SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Custom Discovery Service Implementation for Multi-Backend Architecture
 *
 * This service maps plugin IDs to their respective backend service URLs,
 * enabling direct service-to-service communication without HTTP proxy overhead.
 *
 * Key Features:
 * - Internal URLs for service-to-service communication
 * - External URLs for browser-accessible endpoints (OAuth, etc.)
 * - Environment-based configuration
 * - Type-safe plugin routing
 *
 * Perfect for Kubernetes deployments where service discovery is handled natively.
 *
 * Usage:
 *   backend.add(customDiscoveryServiceFactory);
 */
class CustomDiscoveryService implements DiscoveryService {
  private readonly config: DiscoveryConfig;
  private readonly logger: LoggerService;
  private readonly serviceMap: Map<PluginId, string>;
  // Plugins that need external URLs for browser access (OAuth, cookies, static files, etc.)
  private readonly externalPlugins: Set<MainPlugin | TechdocsPlugin>;

  constructor(config: DiscoveryConfig) {
    this.config = config;
    this.logger = config.logger.child({ service: 'discovery' });
    // TechDocs needs external URL for cookie-based static file authentication
    // (cookie domain must match browser origin, not internal service name)
    this.externalPlugins = new Set([...MAIN_PLUGINS, ...TECHDOCS_PLUGINS]);

    // Build service map from configuration
    this.serviceMap = new Map([
      ...CATALOG_PLUGINS.map((plugin): [PluginId, string] => [
        plugin,
        config.catalogServiceUrl,
      ]),
      ...TECHDOCS_PLUGINS.map((plugin): [PluginId, string] => [
        plugin,
        config.techdocsServiceUrl,
      ]),
      ...MAIN_PLUGINS.map((plugin): [PluginId, string] => [
        plugin,
        config.mainServiceUrl,
      ]),
    ]);

    this.logInitialization();
  }

  private logInitialization(): void {
    this.logger.info(
      '🚀 Setting up Custom Discovery Service for multi-backend architecture',
    );

    // Warn if external URL is same as internal (likely using fallback)
    const usingFallback =
      this.config.externalBaseUrl === this.config.mainServiceUrl;
    if (usingFallback) {
      this.logger.warn(
        '⚠️  Using mainServiceUrl as externalBaseUrl (backend.baseUrl not set). ' +
          'This works for local dev but should be configured for Docker/Production.',
      );
    }

    this.logger.debug('📋 Discovery configuration loaded', {
      externalBaseUrl: this.config.externalBaseUrl,
      catalogServiceUrl: this.config.catalogServiceUrl,
      techdocsServiceUrl: this.config.techdocsServiceUrl,
      mainServiceUrl: this.config.mainServiceUrl,
      usingFallback,
      totalPlugins: this.serviceMap.size,
      catalogPlugins: CATALOG_PLUGINS.length,
      techdocsPlugins: TECHDOCS_PLUGINS.length,
      mainPlugins: MAIN_PLUGINS.length,
    });
    this.logger.info('✅ Custom Discovery Service configured successfully!');
  }

  async getBaseUrl(pluginId: string): Promise<string> {
    const serviceUrl = this.serviceMap.get(pluginId as PluginId);

    if (!serviceUrl) {
      this.logger.error(
        `❌ No service URL configured for plugin: ${pluginId}`,
        {
          pluginId,
          availablePlugins: Array.from(this.serviceMap.keys()),
        },
      );
      throw new Error(
        `No service URL configured for plugin: ${pluginId}. ` +
          `Available plugins: ${Array.from(this.serviceMap.keys()).join(', ')}`,
      );
    }

    const fullUrl = `${serviceUrl}/api/${pluginId}`;
    this.logger.debug(`🔍 Internal discovery: ${pluginId}`, {
      pluginId,
      url: fullUrl,
    });
    return fullUrl;
  }

  async getExternalBaseUrl(pluginId: string): Promise<string> {
    // Plugins that need external URL for browser access:
    // - MAIN_PLUGINS: OAuth callbacks, browser-accessible endpoints
    // - TECHDOCS_PLUGINS: Cookie-based auth for static files (domain must match browser origin)
    if (this.externalPlugins.has(pluginId as MainPlugin | TechdocsPlugin)) {
      const externalUrl = `${this.config.externalBaseUrl}/api/${pluginId}`;
      this.logger.debug(`🌐 External discovery: ${pluginId}`, {
        pluginId,
        url: externalUrl,
        type: 'external',
      });
      return externalUrl;
    }

    // Other plugins use internal URLs
    this.logger.debug(`🔗 Internal discovery (via getBaseUrl): ${pluginId}`, {
      pluginId,
      type: 'internal',
    });
    return this.getBaseUrl(pluginId);
  }
}

// ============================================================================
// FACTORY
// ============================================================================

/**
 * Custom Discovery Service Factory
 *
 * Replaces the default Backstage DiscoveryService with our custom implementation
 * that supports multi-backend architecture with direct service-to-service calls.
 *
 * Environment Variables:
 * - CATALOG_SERVICE_URL: URL for backend-catalog (default: http://localhost:7008)
 *   - Docker: http://backend-catalog:7008
 *   - K8s: http://backend-catalog.namespace.svc.cluster.local:7008
 *
 * - TECHDOCS_SERVICE_URL: URL for backend-techdocs (default: http://localhost:7009)
 *   - Docker: http://backend-techdocs:7009
 *   - K8s: http://backend-techdocs.namespace.svc.cluster.local:7009
 *
 * - MAIN_SERVICE_URL: URL for backend-main (default: http://localhost:7007)
 *   - Docker: http://backend-main:7007
 *   - K8s: http://backend-main.namespace.svc.cluster.local:7007
 *
 * Configuration (app-config.yaml):
 * - backend.baseUrl: External URL for OAuth callbacks and browser-accessible endpoints
 *   - OPTIONAL: Falls back to MAIN_SERVICE_URL if not set
 *   - IMPORTANT: Must be set in app-config.docker.yaml for OAuth to work correctly
 *
 *   Examples:
 *   - Local dev (no Docker): http://localhost:7007 (can be omitted, uses fallback)
 *   - Docker: http://localhost:3000 (REQUIRED - NGINX proxy)
 *   - Production: https://your-domain.com (REQUIRED)
 *
 * Why backend.baseUrl matters:
 * - OAuth callbacks MUST point to browser-accessible URL
 * - backend-catalog doesn't need it (no browser endpoints)
 * - backend-techdocs doesn't need it (no browser endpoints)
 * - backend-main REQUIRES it for auth plugin (GitHub OAuth, etc.)
 */
export const customDiscoveryServiceFactory = createServiceFactory({
  service: coreServices.discovery,
  deps: {
    config: coreServices.rootConfig,
    logger: coreServices.logger,
  },
  async factory({ config, logger }) {
    // Internal service URLs from environment (used for backend-to-backend calls)
    const catalogServiceUrl =
      process.env['CATALOG_SERVICE_URL'] || DEFAULT_URLS.catalog; // eslint-disable-line dot-notation -- TypeScript requires bracket notation for process.env
    const techdocsServiceUrl =
      process.env['TECHDOCS_SERVICE_URL'] || DEFAULT_URLS.techdocs; // eslint-disable-line dot-notation -- TypeScript requires bracket notation for process.env
    const mainServiceUrl = process.env['MAIN_SERVICE_URL'] || DEFAULT_URLS.main; // eslint-disable-line dot-notation -- TypeScript requires bracket notation for process.env

    // External URL from app-config (used for OAuth callbacks, browser access)
    // Falls back to mainServiceUrl if backend.baseUrl is not explicitly set
    // This is important for backend-main (OAuth) but optional for backend-catalog/backend-techdocs
    const externalBaseUrl =
      config.getOptionalString('backend.baseUrl') || mainServiceUrl;

    const discoveryConfig: DiscoveryConfig = {
      externalBaseUrl,
      catalogServiceUrl,
      techdocsServiceUrl,
      mainServiceUrl,
      logger,
    };

    return new CustomDiscoveryService(discoveryConfig);
  },
});
