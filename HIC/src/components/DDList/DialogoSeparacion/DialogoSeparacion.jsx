import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import Histogram from "./Histogram";
import { green} from '@material-ui/core/colors';
import { createMuiTheme, ThemeProvider  } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} style={{backgroundColor:"#EDF1F4"}}/>
    </Draggable>
  );
}

export default function DraggableDialog({props, x, v}) {
  const [open, setOpen] = React.useState(false);


  /*
  Dialogo con el histograma de separacion y un boton para cerrar la ventana
  */

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
    
        <Button variant="contained" color="primary" onClick={handleClickOpen} style={{textPrimary:"green"}}>
              Seleccionar Para Separar
        </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle disableTypography style={{ cursor: 'move', color: 'black'}} id="draggable-dialog-title">     
        <Typography variant="h6" style={{ cursor: 'move', color: 'black', textAlign: 'left'}}>Seleccione El Corte: </Typography>
        </DialogTitle>
        <DialogContent style={{backgroundColor:'white'}}>
          <Histogram x={x} v={v} sep={props}/>
        </DialogContent>
        <DialogActions style={{backgroundColor:'white'}}>
          <Button  variant="contained" autoFocus onClick={handleClose} color="secondary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}