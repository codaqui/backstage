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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SearchIcon from '@material-ui/icons/Search';
import { Link } from 'react-router-dom';
import { useKubernetesResources } from '../hooks/useKubernetesResources';
import React, { useState } from 'react';

const useStyles = makeStyles(theme => ({
  statsBox: {
    marginBottom: theme.spacing(4),
  },
  statsCard: {
    textAlign: 'center',
    padding: theme.spacing(3),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 180,
  },
  statValue: {
    fontSize: 56,
    fontWeight: 700,
    lineHeight: 1,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catalogedIcon: {
    color: theme.palette.success.main,
    marginRight: theme.spacing(0.5),
  },
  uncatalogedIcon: {
    color: theme.palette.warning.main,
    marginRight: theme.spacing(0.5),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  table: {
    marginTop: theme.spacing(2),
  },
  catalogedRow: {
    backgroundColor: theme.palette.success.light + '10',
  },
  uncatalogedRow: {
    backgroundColor: theme.palette.warning.light + '10',
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
  },
  searchBox: {
    marginBottom: theme.spacing(2),
  },
  clusterIcon: {
    fontSize: 64,
    color: theme.palette.primary.main,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

export const KubernetesResourcesPage = () => {
  const classes = useStyles();
  const { data, loading, error } = useKubernetesResources();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="Recursos Kubernetes" />
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
        <Header title="Recursos Kubernetes" />
        <Content>
          <Typography color="error" variant="h6">
            Erro ao carregar recursos: {error.message}
          </Typography>
        </Content>
      </Page>
    );
  }

  if (!data) {
    return (
      <Page themeId="tool">
        <Header title="Recursos Kubernetes" />
        <Content>
          <Typography variant="h6">Nenhum dado disponível</Typography>
        </Content>
      </Page>
    );
  }

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredResources = data.allResources.filter(resource => {
    const search = searchTerm.toLowerCase();
    return (
      resource.name.toLowerCase().includes(search) ||
      resource.namespace.toLowerCase().includes(search) ||
      resource.kind.toLowerCase().includes(search) ||
      resource.cluster.toLowerCase().includes(search)
    );
  });

  const catalogedResources = filteredResources.filter(r => r.cataloged);

  return (
    <Page themeId="tool">
      <Header
        title="Recursos Kubernetes"
        subtitle={`${data.clusters.length} cluster(s) conectado(s) com ${data.catalogedCount} recursos catalogados`}
      />
      <Content>
        {/* Statistics (cataloged-only view) */}
        <Box className={classes.statsBox}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={6}>
              <Card className={classes.statsCard} elevation={2}>
                <CloudQueueIcon style={{ fontSize: 48, color: '#1976d2', marginBottom: 8 }} />
                <Typography variant="h2" className={classes.statValue} style={{ color: '#1976d2' }}>
                  {data.clusters.length}
                </Typography>
                <Typography className={classes.statLabel} color="textSecondary">
                  Clusters
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Card className={classes.statsCard} elevation={2}>
                <CheckCircleIcon style={{ fontSize: 48, color: '#4caf50', marginBottom: 8 }} />
                <Typography variant="h2" className={classes.statValue} style={{ color: '#4caf50' }}>
                  {data.catalogedCount}
                </Typography>
                <Typography className={classes.statLabel} color="textSecondary">
                  Recursos Catalogados
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Search */}
        <TextField
          className={classes.searchBox}
          fullWidth
          variant="outlined"
          placeholder="Buscar recursos por nome, namespace, tipo ou cluster..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Tabs */}
        <Paper>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={`Catalogados (${catalogedResources.length})`} />
            <Tab label={`Clusters (${data.clusters.length})`} />
          </Tabs>

          {/* Cataloged Resources */}
          <TabPanel value={tabValue} index={0}>
            <ResourcesTable resources={catalogedResources} classes={classes} />
          </TabPanel>

          {/* Clusters */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {data.clusters.map(cluster => (
                <Grid item xs={12} key={cluster.name}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        <CloudQueueIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                        {cluster.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        URL: {cluster.url}
                      </Typography>
                      <Typography variant="body1" style={{ marginTop: 16 }}>
                        Recursos: {cluster.resources.length}
                      </Typography>
                      <Box display="flex" marginTop={2} style={{ gap: 8 }}>
                        <Chip
                          label={`${cluster.resources.filter(r => r.cataloged).length} Catalogados`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Paper>
      </Content>
    </Page>
  );
};

interface KubernetesResource {
  name: string;
  namespace?: string;
  kind?: string;
  cluster: string;
  labels: Record<string, string>;
  cataloged?: boolean;
  catalogEntity?: string;
  [key: string]: any; // Add other properties as needed
}

interface ResourcesTableProps {
  resources: KubernetesResource[];
  classes: Record<string, string>;
}

const ResourcesTable = ({ resources, classes }: ResourcesTableProps) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      setRowsPerPage(parsed);
    } else {
      // fallback to default value
      setRowsPerPage(10);
    }
    setPage(0);
  };

  if (resources.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="textSecondary">
          Nenhum recurso encontrado
        </Typography>
      </Box>
    );
  }

  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const visible = resources.slice(start, end);

  return (
    <>
      <TableContainer className={classes.table}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Namespace</TableCell>
              <TableCell>Cluster</TableCell>
              <TableCell>Labels</TableCell>
              <TableCell>Ação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((resource, idx) => (
              <TableRow
                key={`${resource.cluster}-${resource.namespace}-${resource.name}-${idx}`}
                className={resource.cataloged ? classes.catalogedRow : classes.uncatalogedRow}
              >
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon className={classes.catalogedIcon} />
                    <Typography variant="body2">Catalogado</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={resource.kind} size="small" />
                </TableCell>
                <TableCell>{resource.name}</TableCell>
                <TableCell>{resource.namespace}</TableCell>
                <TableCell>{resource.cluster}</TableCell>
                <TableCell>
                  <div className={classes.chipContainer}>
                    {Object.entries(resource.labels)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <Chip
                          key={key}
                          label={`${key}: ${value}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    {Object.keys(resource.labels).length > 3 && (
                      <Chip label={`+${Object.keys(resource.labels).length - 3}`} size="small" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {resource.cataloged && resource.catalogEntity ? (
                    <Button
                      component={Link}
                      to={`/catalog/${resource.catalogEntity}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      Ver no Catálogo
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      to="/create"
                      size="small"
                      variant="contained"
                      color="primary"
                    >
                      Catalogar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <TablePagination
          component="div"
          count={resources.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Box>
    </>
  );
};
