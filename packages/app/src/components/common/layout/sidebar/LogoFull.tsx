import { makeStyles } from '@material-ui/core';
import LogoMono from '../../assets/logos/codaqui-mono.svg';

const useStyles = makeStyles({
  img: {
    width: 'auto',
    height: 30,
  },
});

const LogoFull = (): JSX.Element => {
  const classes = useStyles();

  return <img src={LogoMono} alt="Codaqui Logo" className={classes.img} />;
};

export default LogoFull;
