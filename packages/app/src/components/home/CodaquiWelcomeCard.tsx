import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Link,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import GitHubIcon from '@material-ui/icons/GitHub';
import SchoolIcon from '@material-ui/icons/School';
import GroupIcon from '@material-ui/icons/Group';
import { useResourceCounts } from '../../hooks';

const useStyles = makeStyles(theme => ({
  card: {
    height: '100%',
  },
  highlight: {
    color: theme.palette.primary.main,
    fontWeight: 'bold',
  },
  listItem: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  icon: {
    minWidth: 40,
    color: theme.palette.primary.main,
  },
  linkBox: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
  },
}));

export const CodaquiWelcomeCard = () => {
  const classes = useStyles();
  const { counts, loading } = useResourceCounts();

  const whatsappCount = counts?.whatsapp || 0;
  const learningCount = counts?.learningResources || 0;

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          👋 Bem-vindo à Comunidade Codaqui!
        </Typography>
        
        <Typography variant="body1" paragraph>
          Este é o <span className={classes.highlight}>portal centralizado</span> de
          recursos, comunicação e aprendizado da Codaqui.
        </Typography>

        <Divider />

        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            🎯 O que você pode fazer aqui:
          </Typography>
          
          <List>
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.icon}>
                <WhatsAppIcon />
              </ListItemIcon>
              <ListItemText
                primary="Entrar nos Grupos WhatsApp"
                secondary={
                  loading ? (
                    <CircularProgress size={16} />
                  ) : (
                    `${whatsappCount} grupos temáticos para networking e aprendizado`
                  )
                }
              />
            </ListItem>
            
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.icon}>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText
                primary="Acessar Trilhas de Aprendizado"
                secondary={
                  loading ? (
                    <CircularProgress size={16} />
                  ) : (
                    `${learningCount} recursos de aprendizado incluindo cursos e trilhas`
                  )
                }
              />
            </ListItem>
            
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.icon}>
                <GitHubIcon />
              </ListItemIcon>
              <ListItemText
                primary="Contribuir em Projetos Open Source"
                secondary="Repositórios da comunidade no GitHub"
              />
            </ListItem>
            
            <ListItem className={classes.listItem}>
              <ListItemIcon className={classes.icon}>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText
                primary="Conectar-se com Comunidades"
                secondary="DevParaná, CamposTech e ElasNoCódigo"
              />
            </ListItem>
          </List>
        </Box>

        <Box className={classes.linkBox}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <CheckCircleIcon style={{ fontSize: 16, verticalAlign: 'middle' }} />{' '}
            <strong>CNPJ:</strong> 44.593.429/0001-05
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <CheckCircleIcon style={{ fontSize: 16, verticalAlign: 'middle' }} />{' '}
            <strong>Missão:</strong> Democratizar o ensino tecnológico para jovens
          </Typography>
          <Box mt={1}>
            <Link 
              href="https://codaqui.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              color="primary"
            >
              → Conheça mais sobre a Codaqui
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
