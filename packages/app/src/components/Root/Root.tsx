import { PropsWithChildren } from 'react';
import { makeStyles, Typography, Box } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import ExtensionIcon from '@material-ui/icons/Extension';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import SchoolIcon from '@material-ui/icons/School';
import PeopleIcon from '@material-ui/icons/People';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
  useSidebarOpenState,
  Link,
} from '@backstage/core-components';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import { MyGroupsSidebarItem } from '@backstage/plugin-org';
import GroupIcon from '@material-ui/icons/People';
import { NotificationsSidebarItem } from '@backstage/plugin-notifications';

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

const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={classes.root}>
      <Link to="/" underline="none" className={classes.link} aria-label="Início">
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

const useSidebarFooterStyles = makeStyles(theme => ({
  footer: {
    padding: theme.spacing(2),
    textAlign: 'center',
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  madeWith: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  heart: {
    color: '#e25555',
    fontSize: '0.875rem',
  },
  cnpj: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
}));

const SidebarFooter = () => {
  const classes = useSidebarFooterStyles();
  const { isOpen } = useSidebarOpenState();

  if (!isOpen) return null;

  return (
    <Box className={classes.footer}>
      <Typography variant="caption" className={classes.madeWith} display="block">
        Feito com <FavoriteIcon className={classes.heart} /> Backstage
      </Typography>
      <Typography variant="caption" className={classes.cnpj} display="block">
        Associação Codaqui
      </Typography>
      <Typography variant="caption" className={classes.cnpj} display="block">
        CNPJ 44.593.429/0001-05
      </Typography>
    </Box>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => (
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
        <SidebarDivider />
        <SidebarItem icon={WhatsAppIcon} to="whatsapp-groups" text="WhatsApp" />
        <SidebarItem icon={SchoolIcon} to="learning-resources" text="Aprendizado" />
        <SidebarItem icon={PeopleIcon} to="social-resources" text="Redes Sociais" />
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
      <SidebarGroup
        label="Configurações"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarSettings />
      </SidebarGroup>
      <SidebarFooter />
    </Sidebar>
    {children}
  </SidebarPage>
);
