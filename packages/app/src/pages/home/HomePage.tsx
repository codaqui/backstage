import { Content, Page } from '@backstage/core-components';
import {
  HomePageStarredEntities,
  HomePageToolkit,
} from '@backstage/plugin-home';
import { HomePageSearchBar } from '@backstage/plugin-search';
import { SearchContextProvider } from '@backstage/plugin-search-react';
import { CircularProgress, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChatIcon from '@material-ui/icons/Chat';
import PublicIcon from '@material-ui/icons/Public';
import SchoolIcon from '@material-ui/icons/School';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import { useNavigate } from 'react-router-dom';
import { CodaquiWelcomeCard, CommunityResource } from '../../components/home';
import { useResourceCounts } from '../../hooks';

const useStyles = makeStyles(theme => ({
  searchBar: {
    display: 'flex',
    maxWidth: '60vw',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    padding: '8px 0',
    borderRadius: '50px',
    margin: '24px auto',
  },
  headerSection: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    padding: theme.spacing(4),
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
    color: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  whatsappCard: {
    borderLeft: `4px solid #25D366`,
  },
  learningCard: {
    borderLeft: `4px solid #4CAF50`,
  },
  socialCard: {
    borderLeft: `4px solid #1DA1F2`,
  },
  statsBox: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: theme.spacing(3),
  },
  statItem: {
    textAlign: 'center',
  },
}));

export const HomePage = (): JSX.Element => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { counts, loading: countsLoading } = useResourceCounts();

  const whatsappCount = counts?.whatsapp || 0;
  const learningCount = counts?.learningResources || 0;
  const socialCount = counts?.socialResources || 0;

  return (
    <SearchContextProvider>
      <Page themeId="home">
        <Content>
          <div className={classes.headerSection}>
            <Typography variant="h2" component="h1" gutterBottom>
              🚀 Bem-vindo à Codaqui!
            </Typography>
            <Typography variant="h5" component="p">
              Somos uma Associação com o desejo de democratizar o aprendizado
              tecnológico e aproximar novas gerações do conteúdo técnico.
            </Typography>
            <Typography variant="body1" style={{ marginTop: 16 }}>
              Tudo isso, sem custo algum, graças à força da nossa comunidade!
            </Typography>
            <div className={classes.statsBox}>
              <div className={classes.statItem}>
                {countsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h3">{whatsappCount}</Typography>
                    <Typography variant="body2">Grupos WhatsApp</Typography>
                  </>
                )}
              </div>
              <div className={classes.statItem}>
                {countsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h3">{learningCount}</Typography>
                    <Typography variant="body2">
                      Recursos de Aprendizado
                    </Typography>
                  </>
                )}
              </div>
              <div className={classes.statItem}>
                {countsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography variant="h3">{socialCount}</Typography>
                    <Typography variant="body2">Redes Sociais</Typography>
                  </>
                )}
              </div>
            </div>
          </div>

          <HomePageSearchBar
            classes={{ root: classes.searchBar }}
            placeholder="Buscar recursos, grupos, trilhas..."
          />

          <Grid container spacing={3} style={{ marginTop: 24 }}>
            {/* WhatsApp Groups */}
            <Grid item xs={12} md={6} lg={4}>
              <CommunityResource
                title="Grupos WhatsApp"
                description={`Conecte-se com a comunidade em ${whatsappCount} grupos temáticos. Tire dúvidas, compartilhe conhecimento e faça networking.`}
                icon={<WhatsAppIcon className={classes.categoryIcon} />}
                chips={['Chat', 'Comunidade', 'Networking']}
                cardClass={classes.whatsappCard}
                onClick={() => navigate('/whatsapp-groups')}
              />
            </Grid>

            {/* Learning Resources */}
            <Grid item xs={12} md={6} lg={4}>
              <CommunityResource
                title="Recursos de Aprendizado"
                description={`${learningCount} recursos incluindo trilhas de Python, GitHub, blog posts e materiais educacionais estruturados.`}
                icon={<SchoolIcon className={classes.categoryIcon} />}
                chips={['Trilhas', 'Blog', 'Cursos', 'Documentação']}
                cardClass={classes.learningCard}
                onClick={() => navigate('/learning-resources')}
              />
            </Grid>

            {/* Social Resources */}
            <Grid item xs={12} md={6} lg={4}>
              <CommunityResource
                title="Redes Sociais"
                description={`${socialCount} canais incluindo Discord, YouTube, GitHub, LinkedIn e outras plataformas da comunidade.`}
                icon={<ChatIcon className={classes.categoryIcon} />}
                chips={['Discord', 'YouTube', 'GitHub', 'Social']}
                cardClass={classes.socialCard}
                onClick={() => navigate('/social-resources')}
              />
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid container spacing={3} style={{ marginTop: 32 }}>
            <Grid item xs={12} md={6}>
              <CodaquiWelcomeCard />
            </Grid>
            <Grid item xs={12} md={6}>
              <HomePageToolkit
                title="🛠️ Ferramentas Rápidas"
                tools={[
                  {
                    label: 'Ver Catálogo Completo',
                    url: '/catalog',
                    icon: <PublicIcon />,
                  },
                  {
                    label: 'Criar Novo Recurso',
                    url: '/create',
                    icon: <SchoolIcon />,
                  },
                  {
                    label: 'Buscar',
                    url: '/search',
                    icon: <ChatIcon />,
                  },
                  {
                    label: 'Documentação',
                    url: '/docs',
                    icon: <SchoolIcon />,
                  },
                ]}
              />
            </Grid>
          </Grid>

          {/* Starred Entities */}
          <Grid container spacing={3} style={{ marginTop: 16 }}>
            <Grid item xs={12}>
              <HomePageStarredEntities />
            </Grid>
          </Grid>
        </Content>
      </Page>
    </SearchContextProvider>
  );
};
