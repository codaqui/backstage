import { Route } from 'react-router-dom';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';
import { HomePage } from './components/home';
import {
  WhatsAppGroupsPage,
  LearningResourcesPage,
  SocialResourcesPage,
  KubernetesResourcesPage,
} from './pages';
import { codaquiLightTheme, codaquiDarkTheme } from './theme/codaquiTheme';
import { UnifiedThemeProvider } from '@backstage/theme';
import { AnnouncementsPage } from '@backstage-community/plugin-announcements';

import {
  AlertDisplay,
  OAuthRequestDialog,
  SignInPage,
} from '@backstage/core-components';
import { createApp } from '@backstage/frontend-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';
import { NotificationsPage } from '@backstage/plugin-notifications';
import { SignalsDisplay } from '@backstage/plugin-signals';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import {
  convertLegacyAppOptions,
  convertLegacyAppRoot,
} from '@backstage/core-compat-api';
import adrPlugin from '@backstage-community/plugin-adr/alpha';

const convertedOptionsModule = convertLegacyAppOptions({
  apis,
  themes: [
    {
      id: 'codaqui-light',
      title: 'Codaqui Light',
      variant: 'light',
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={codaquiLightTheme}>
          {children}
        </UnifiedThemeProvider>
      ),
    },
    {
      id: 'codaqui-dark',
      title: 'Codaqui Dark',
      variant: 'dark',
      Provider: ({ children }) => (
        <UnifiedThemeProvider theme={codaquiDarkTheme}>
          {children}
        </UnifiedThemeProvider>
      ),
    },
  ],
  components: {
    SignInPage: props => (
      <SignInPage
        {...props}
        align="center"
        title="Selecione o método de login"
        providers={[
          {
            id: 'github-auth-provider',
            title: 'GitHub',
            message:
              'Entre com sua conta do GitHub se você fizer parte da organização.',
            apiRef: githubAuthApiRef,
          },
          'guest',
        ]}
      />
    ),
  },
});

const routes = (
  <FlatRoutes>
    <Route path="/" element={<HomePage />} />
    <Route path="/whatsapp-groups" element={<WhatsAppGroupsPage />} />
    <Route path="/learning-resources" element={<LearningResourcesPage />} />
    <Route path="/social-resources" element={<SocialResourcesPage />} />
    <Route path="/kubernetes-resources" element={<KubernetesResourcesPage />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />} />
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/announcements" element={<AnnouncementsPage />} />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
  </FlatRoutes>
);

const convertedRootFeatures = convertLegacyAppRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <SignalsDisplay />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);

const app = createApp({
  features: [adrPlugin, convertedOptionsModule, ...convertedRootFeatures],
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
});

export default app.createRoot();
