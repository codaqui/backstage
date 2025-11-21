import { Box, makeStyles, Typography } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import type { PropsWithChildren } from 'react';
// Announcements Icon
import {
  Link,
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
  useSidebarOpenState,
} from '@backstage/core-components';
import { NotificationsSidebarItem } from '@backstage/plugin-notifications';
import { MyGroupsSidebarItem } from '@backstage/plugin-org';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
import Announcement from '@material-ui/icons/Announcement';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import ExtensionIcon from '@material-ui/icons/Extension';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import MenuIcon from '@material-ui/icons/Menu';
import {
  default as GroupIcon,
  default as PeopleIcon,
} from '@material-ui/icons/People';
import SchoolIcon from '@material-ui/icons/School';
import SearchIcon from '@material-ui/icons/Search';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';

const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 24,
  },
});

const SidebarLogo = (): JSX.Element => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={classes.root}>
      <Link
        to="/"
        underline="none"
        className={classes.link}
        aria-label="Início"
      >
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

const useSidebarFooterStyles = makeStyles(theme => ({
  footer: {
    width: '100%',
    padding: theme.spacing(1.5, 1),
    textAlign: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
    margin: 0,
  },
  madeWith: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  heart: {
    color: '#e25555',
    fontSize: '0.875rem',
  },
  organization: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.3,
  },
}));

const SidebarFooter = (): JSX.Element | null => {
  const classes = useSidebarFooterStyles();
  const { isOpen } = useSidebarOpenState();

  if (!isOpen) return null;

  return (
    <Box className={classes.footer}>
      <Typography variant="caption" className={classes.madeWith}>
        Feito com <FavoriteIcon className={classes.heart} /> Backstage
      </Typography>
      <Typography
        variant="caption"
        className={classes.organization}
        display="block"
      >
        Associação Codaqui
      </Typography>
      <Typography
        variant="caption"
        className={classes.organization}
        display="block"
      >
        CNPJ 44.593.429/0001-05
      </Typography>
    </Box>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>): JSX.Element => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Buscar" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        {/* Global nav, not org-specific */}
        <SidebarItem icon={HomeIcon} to="/" text="Início" />
        <SidebarItem icon={HomeIcon} to="catalog" text="Catálogo" />
        <SidebarItem icon={Announcement} to="announcements" text="Notícias" />
        <SidebarDivider />
        <SidebarItem icon={WhatsAppIcon} to="whatsapp-groups" text="WhatsApp" />
        <SidebarItem
          icon={SchoolIcon}
          to="learning-resources"
          text="Aprendizado"
        />
        <SidebarItem
          icon={PeopleIcon}
          to="social-resources"
          text="Redes Sociais"
        />
        <SidebarItem
          icon={CloudQueueIcon}
          to="kubernetes-resources"
          text="Kubernetes"
        />
        <SidebarDivider />
        <MyGroupsSidebarItem
          singularTitle="Meu Grupo"
          pluralTitle="Meus Grupos"
          icon={GroupIcon}
        />
        <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs" />
        <SidebarItem icon={LibraryBooks} to="docs" text="Documentação" />
        <SidebarItem icon={CreateComponentIcon} to="create" text="Criar..." />
        {/* End global nav */}
        <SidebarDivider />
        <SidebarScrollWrapper>
          {/* Items in this group will be scrollable if they run out of space */}
        </SidebarScrollWrapper>
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <NotificationsSidebarItem />
      <SidebarDivider />
      <SidebarGroup label="Configurações" icon={<UserSettingsSignInAvatar />}>
        <SidebarSettings />
      </SidebarGroup>
      <SidebarFooter />
    </Sidebar>
    {children}
  </SidebarPage>
);
