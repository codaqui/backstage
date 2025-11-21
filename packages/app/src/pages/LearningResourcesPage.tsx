import { Content, Header, Page } from '@backstage/core-components';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BookIcon from '@material-ui/icons/Book';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import SchoolIcon from '@material-ui/icons/School';
import { useSystemResources } from '../hooks/useSystemResources';

const useStyles = makeStyles(theme => ({
  resourceCard: {
    height: '100%',
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  mainIcon: {
    color: theme.palette.primary.main,
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
  accessButton: {
    marginTop: theme.spacing(1),
  },
  typeChip: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

export const LearningResourcesPage = (): JSX.Element => {
  const classes = useStyles();
  const { resources, loading, error } =
    useSystemResources('learning-resources');

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="Recursos de Aprendizado" />
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
        <Header title="Recursos de Aprendizado" />
        <Content>
          <Typography color="error" variant="h6">
            Erro ao carregar recursos: {error.message}
          </Typography>
        </Content>
      </Page>
    );
  }

  return (
    <Page themeId="tool">
      <Header
        title="Recursos de Aprendizado Codaqui"
        subtitle={`${resources.length} recursos disponíveis para seu desenvolvimento`}
      />
      <Content>
        <Box className={classes.statsBox}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" style={{ gap: 16 }}>
              <SchoolIcon className={classes.mainIcon} />
              <Box>
                <Typography variant="h4">{resources.length}</Typography>
                <Typography variant="body1" color="textSecondary">
                  Recursos de aprendizado cadastrados
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              color="primary"
              href="/catalog?filters[system]=learning-resources"
            >
              Ver no Catálogo
            </Button>
          </Box>
        </Box>

        {resources.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nenhum recurso cadastrado ainda
              </Typography>
              <Typography color="textSecondary">
                Os recursos de aprendizado aparecerão aqui quando forem
                adicionados ao catálogo.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {resources.map(resource => (
              <Grid item xs={12} sm={6} md={4} key={resource.name}>
                <Card className={classes.resourceCard}>
                  <CardContent>
                    <Box
                      display="flex"
                      alignItems="center"
                      style={{ gap: 8, marginBottom: 8 }}
                    >
                      <BookIcon color="primary" />
                      <Typography variant="h6" noWrap>
                        {resource.title}
                      </Typography>
                    </Box>

                    <Chip
                      label={resource.type}
                      size="small"
                      color="secondary"
                      className={classes.typeChip}
                    />

                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ minHeight: 60, marginTop: 8, marginBottom: 8 }}
                    >
                      {resource.description}
                    </Typography>

                    {resource.tags.length > 0 && (
                      <div className={classes.chipContainer}>
                        {resource.tags.map(tag => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </div>
                    )}

                    {resource.link && (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        className={classes.accessButton}
                        href={resource.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon />}
                      >
                        {resource.link.title}
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
