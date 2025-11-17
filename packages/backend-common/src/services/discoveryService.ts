import { createServiceFactory, coreServices } from '@backstage/backend-plugin-api';
import type { DiscoveryService } from '@backstage/backend-plugin-api';

/**
 * Custom Discovery Service Implementation for Multi-Backend Architecture
 * 
 * This service maps plugin IDs to their respective backend service URLs,
 * enabling direct service-to-service communication without HTTP proxy overhead.
 * 
 * Perfect for Kubernetes deployments where service discovery is handled natively.
 * 
 * Usage:
 *   backend.add(customDiscoveryServiceFactory);
 */
class CustomDiscoveryService implements DiscoveryService {
  private readonly serviceMap: Map<string, string>;

  constructor() {
    // Map plugin IDs to backend service URLs from environment variables
    this.serviceMap = new Map([
      // Catalog service (backend-catalog)
      ['catalog', process.env.CATALOG_SERVICE_URL || 'http://localhost:7008'],
      
      // Main service plugins (backend-main)
      ['auth', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['proxy', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['scaffolder', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['techdocs', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['search', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['kubernetes', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['permission', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['notifications', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['signals', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
      ['events', process.env.MAIN_SERVICE_URL || 'http://localhost:7007'],
    ]);
    
    console.log('✅ Custom Discovery Service initialized:');
    this.serviceMap.forEach((url, plugin) => {
      console.log(`   ${plugin} → ${url}`);
    });
  }

  async getBaseUrl(pluginId: string): Promise<string> {
    const url = this.serviceMap.get(pluginId);
    if (!url) {
      throw new Error(
        `No service URL configured for plugin: ${pluginId}. ` +
        `Available plugins: ${Array.from(this.serviceMap.keys()).join(', ')}`
      );
    }
    const fullUrl = `${url}/api/${pluginId}`;
    console.log(`🔍 Discovery: ${pluginId} → ${fullUrl}`);
    return fullUrl;
  }

  async getExternalBaseUrl(pluginId: string): Promise<string> {
    // For external access, use the same URLs
    // In production, you might want to return public URLs here
    return this.getBaseUrl(pluginId);
  }
}

/**
 * Custom Discovery Service Factory
 * 
 * Replaces the default Backstage DiscoveryService with our custom implementation
 * that supports multi-backend architecture with direct service-to-service calls.
 * 
 * Environment Variables Required:
 * - CATALOG_SERVICE_URL: URL for backend-catalog (e.g., http://backend-catalog:7008)
 * - MAIN_SERVICE_URL: URL for backend-main (e.g., http://backend-main:7007)
 * 
 * For Kubernetes:
 * - CATALOG_SERVICE_URL: http://backend-catalog.namespace.svc.cluster.local:7008
 * - MAIN_SERVICE_URL: http://backend-main.namespace.svc.cluster.local:7007
 */
export const customDiscoveryServiceFactory = createServiceFactory({
  service: coreServices.discovery,
  deps: {},
  async factory() {
    return new CustomDiscoveryService();
  },
});
