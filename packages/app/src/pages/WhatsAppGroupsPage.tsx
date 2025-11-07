import { Content, Header, Page } from '@backstage/core-components';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  CircularProgress,
  Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import GroupIcon from '@material-ui/icons/Group';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { useWhatsAppGroups } from '../hooks';

const useStyles = makeStyles(theme => ({
  groupCard: {
    height: '100%',
    borderLeft: `4px solid #25D366`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  whatsappIcon: {
    color: '#25D366',
    fontSize: 48,
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  statsBox: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
  joinButton: {
    marginTop: theme.spacing(1),
  },
}));

export const WhatsAppGroupsPage = () => {
  const classes = useStyles();
  const { groups, loading, error } = useWhatsAppGroups();

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="Grupos WhatsApp" />
        <Content>
          <div className={classes.loadingContainer}>
            <CircularProgress size={60} />
          </div>
        </Content>
      </Page>
    );
  }

  if (error) {
    return (
      <Page themeId="tool">
        <Header title="Grupos WhatsApp" />
        <Content>
          <Typography color="error" variant="h6">
            Erro ao carregar grupos: {error.message}
          </Typography>
        </Content>
      </Page>
    );
  }

  return (
    <Page themeId="tool">
      <Header
        title="Grupos WhatsApp da Codaqui"
        subtitle={`${groups.length} grupos disponíveis para você participar`}
      />
      <Content>
        <Box className={classes.statsBox}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" style={{ gap: 16 }}>
              <WhatsAppIcon className={classes.whatsappIcon} />
              <Box>
                <Typography variant="h4">{groups.length}</Typography>
                <Typography variant="body1" color="textSecondary">
                  Grupos WhatsApp cadastrados
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              href="https://codaqui.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sobre a Codaqui
            </Button>
          </Box>
        </Box>

        {groups.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nenhum grupo cadastrado ainda
              </Typography>
              <Typography color="textSecondary">
                Os grupos WhatsApp aparecerão aqui quando forem adicionados ao catálogo.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {groups.map(group => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={group.name}>
                <Card className={classes.groupCard}>
                  <CardContent>
                    <Box display="flex" alignItems="center" style={{ gap: 8, marginBottom: 8 }}>
                      <GroupIcon color="primary" />
                      <Typography variant="h6" noWrap>
                        {group.title}
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ minHeight: 60, marginBottom: 8 }}
                    >
                      {group.description}
                    </Typography>

                    {group.tags.length > 0 && (
                      <div className={classes.chipContainer}>
                        {group.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" color="primary" />
                        ))}
                      </div>
                    )}

                    {group.url && (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={classes.joinButton}
                        href={group.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon />}
                      >
                        Entrar no Grupo
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Content>
    </Page>
  );
};
