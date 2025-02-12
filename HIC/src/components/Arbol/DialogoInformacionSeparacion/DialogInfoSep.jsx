import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import Typography from '@material-ui/core/Typography';
import "react-multi-carousel/lib/styles.css";
import { VscGraph } from 'react-icons/vsc';

function PaperComponent(props) {
  return (
    <Draggable handle="#dragable_dialog_solucion" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} style={{ backgroundColor: "#EDF1F4" }} />
    </Draggable>
  );
}

export default function DraggableDialog({ graph, pie, elementos }) {
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {

    setOpen(false);
  };
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
      slidesToSlide: 1 // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2 // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1 // optional, default to 1.
    }
  };

  return (
    <div>
      <VscGraph onClick={handleClickOpen} />
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle disableTypography style={{ color: 'white' }} id="draggable-dialog-title">
          <Typography variant="h6" style={{ color: 'black', textAlign: 'center' }}>Datos de la partición </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: 'white' }}>
          <div style={{ display: 'flex', flexDirection: 'row', marginLeft: '4vw' }}>
            <div style={{ marginRight: '2vw' }}>
              {graph}
            </div>
            {elementos != null ?
              elementos
              : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', marginRight: '40vw', marginLeft: '15vw', alignContent: 'center' }}>
            {pie}
          </div>
        </DialogContent>
        <DialogActions style={{ backgroundColor: 'white' }}>
          <Button variant="contained" autoFocus onClick={handleClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}