import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  makeStyles,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  categoryCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}));

export const CommunityResource = ({
  title,
  description,
  icon,
  chips,
  cardClass,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  chips: string[];
  cardClass: string;
  onClick?: () => void;
}): JSX.Element => {
  const classes = useStyles();

  return (
    <Card className={`${classes.categoryCard} ${cardClass}`}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box display="flex" justifyContent="center">
            {icon}
          </Box>
          <Typography variant="h5" component="h3" gutterBottom align="center">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {description}
          </Typography>
          <div className={classes.chipContainer}>
            {chips.map(chip => (
              <Chip key={chip} label={chip} size="small" color="primary" />
            ))}
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
