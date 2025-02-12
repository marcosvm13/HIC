import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import { green } from '@material-ui/core/colors';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab'
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { VscGraph } from 'react-icons/vsc';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import SelectMat from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

function PaperComponent(props) {
  return (
    <Draggable handle="#dragable_dialog_solucion" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} style={{ backgroundColor: "#EDF1F4" }} />
    </Draggable>
  );
}

export default function SeleccionTipo({ nodeDatum, onClick }) {
  const [open, setOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState([]);
  const [normalizacion, setNormalizacion] = React.useState(-1);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const [options, setOption] = React.useState([
    { value: '1', label: 'Phi Min' },
    { value: '2', label: 'BC Max' },
    { value: '3', label: 'Psi Max' },
    { value: '4', label: 'Phi Max (P)' },
    { value: '5', label: 'BC Min (P)' },
    { value: '6', label: 'Psi Min (P)' },
  ]);
  const handleClose = () => {
    setOption([
      { value: '1', label: 'Phi' },
      { value: '2', label: 'BC' },
      { value: '3', label: 'Psi' },
      { value: '4', label: 'Phi Max (P)' },
      { value: '5', label: 'BC Min (P)' },
      { value: '6', label: 'Psi Min (P)' },
    ]);
    setNormalizacion(-1)
    setOpen(false);
  };

  const handleSelect = () => {

    onClick(nodeDatum, normalizacion, selectedOption)
    setOption([
      { value: '1', label: 'Phi' },
      { value: '2', label: 'BC' },
      { value: '3', label: 'Psi' },
      { value: '4', label: 'Phi Max (P)' },
      { value: '5', label: 'BC Min (P)' },
      { value: '6', label: 'Psi Min (P)' },
    ]);
    setNormalizacion(-1)
    setOpen(false);
  };

  const animatedComponents = makeAnimated();


  const handleChange = (i) => {

    let aux = options
    aux[parseInt(i.target.value)]['isDisabled'] = true
    aux[parseInt(i.target.value) + 3]['isDisabled'] = true
    setOption(aux)
    setNormalizacion(i.target.value)
  }

  return (
    <div >
      <div style={{ marginTop: '-30px', width: '400px', height: '180px', display: 'block' }} onClick={handleClickOpen} />


      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        fullWidth
      >
        <DialogTitle disableTypography style={{ color: 'white' }} id="draggable-dialog-title">
          <Typography variant="h6" style={{ color: 'black', textAlign: 'center' }}>Datos de la partición </Typography>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: 'white', height: '30vh' }}>
          <form style={{ height: 'auto', marginBottom: '10vh' }}>

            {normalizacion === -1 ?
              <FormControl style={{ width: '20vw' }}>
                <InputLabel style={{}}>Normalización</InputLabel>
                <SelectMat
                  value={normalizacion}
                  onChange={handleChange}
                >
                  <MenuItem value="0"> <ListItemText>Phi</ListItemText></MenuItem>
                  <MenuItem value="1"> <ListItemText>BC</ListItemText></MenuItem>
                  <MenuItem value="2"> <ListItemText>Psi</ListItemText></MenuItem>
                </SelectMat>
              </FormControl>
              :
              <Select
                onChange={setSelectedOption}
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                options={options}
                style={{ marginBottom: '10vh' }}

              />}
          </form>
        </DialogContent>
        <DialogActions style={{ backgroundColor: 'white' }}>

          {normalizacion !== -1 ?
            <Button variant="contained" autoFocus onClick={handleSelect} color="primary">
              Empezar
            </Button>
            : null}
          <Button variant="contained" autoFocus onClick={handleClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}