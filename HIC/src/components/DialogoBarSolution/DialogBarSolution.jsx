import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import BarSolution from "./BarSolution";
import { green } from '@material-ui/core/colors';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab'
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';

function PaperComponent(props) {
  return (
    <Draggable handle="#dragable_dialog_solucion" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} style={{ backgroundColor: "#EDF1F4" }} />
    </Draggable>
  );
}

export default function DraggableDialog() {

  /*
  Estados:
    open: Ventana abierta o no
    formato: En grid o en Carusel
    items: Variable con todos los diagramas de barras de las soluciones
    tam: el tamayo de los graficos
    ls: Lista con los numero de datos
    pointsys: Lista de Conjuntos de tamayo de barras
    pointsxs : Lista de Conjuntos de clases
  */

  const [open, setOpen] = React.useState(false);
  const [formato, setFormato] = React.useState(true);
  const [items, setItems] = React.useState([])
  const [tam, setTam] = React.useState(500)
  const [ls, setls] = React.useState([])
  const [pointys, setpointys] = React.useState([])
  const [pointxs, setpointxs] = React.useState([])


  /*
  Detonante: Al abrir la ventana
  Descripcion: Esta funcion llama al servidor para que le de todos los datos para hacer los diagramas de barras de las soluciones. Luego los pinta y los guarda en items. Por ultimo, abre la ventana.  
  */
  const handleClickOpen = () => {
    fetch('/resultadoSolucion', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "GET",
    }).then((response) => response.json())
      .then((points) => {
        setFormato(true);
        setTam(500);
        setls(points.l);
        setpointys(points.y);
        setpointxs(points.x);
        const aux = [];
        const colors = ["#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#bc80bd", "#ccebc5", "#ffed6f", "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c",
          "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928", "#00C0C7", '#E8871A', '#268D6C', '#DA3490', '#47E26F', '#9BEC54', '#DFBF03', '#CB6F10'];
        if (points.x.length == 1) {
          aux.push(<BarSolution tam={500} x={points.x[0]} y={points.y[0]} sum={points.l[0]} color={colors[0]} />)
        }
        else {
          for (const [index, value] of points.x.entries()) {
            aux.push(<div key={index}><BarSolution tam={500} x={value} y={points.y[index]} sum={points.l[index]} color={colors[index % colors.length]} /> </div>)
          }
        }
        setItems([])
        setItems(aux)
      }
      );
    setOpen(true);
  };


  /*
 Detonante: Presiona el boton de cerrar
 Descripcion: se cierra la ventana.  
 */
  const handleClose = () => {
    setOpen(false);
  };

  /*
  dimensiones para distintos tipos de ventanas
  */
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

  /* FORMROW Y FORMCOLUMNS
 Detonante: Al seleccionar grid
 Descripcion: Pone los diagramas en modo grid  
 */
  function FormRow(elements) {
    const item = []
    for (const value of elements) {
      item.push(
        <Grid item xs={4}>
          {value}
        </Grid>)
    }
    return item;
  }

  function FormColumns() {
    const item = []
    for (let i = 0; i < items.length; i += 3) {
      const elements = []
      elements.push(items[i])
      if (items.length - i - 1 >= 1) {
        elements.push(items[i + 1])
      } if (items.length - i - 1 >= 2) {
        elements.push(items[i + 2])
      }
      item.push(<Grid container item xs={12} spacing={3}>{FormRow(elements)}</Grid>)
    }
    return item;
  }

  /* 
Detonante: Al presionar el switch
Descripcion: ALterna el modo grid con el carousel
*/
  const handleChange = (event) => {
    setFormato(event.target.checked);
    let tamayo = 0;
    if (tam === 500) {
      tamayo = 305;
      setTam(305);
    } else if (tam === 305) {
      tamayo = 500;
      setTam(500);
    }
    const aux = []
    const colors = ["#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#bc80bd", "#ccebc5", "#ffed6f", "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928", "#00C0C7", '#E8871A', '#268D6C', '#DA3490', '#47E26F', '#9BEC54', '#DFBF03', '#CB6F10']
    if (pointxs.length == 1) {

      aux.push(<BarSolution tam={tamayo} x={pointxs[0]} y={pointys[0]} sum={ls[0]} color={colors[0]} />)
    }
    else {
      for (const [index, value] of pointxs.entries()) {
        aux.push(<div key={index}><BarSolution tam={tamayo} x={value} y={pointys[index]} sum={ls[index]} color={colors[index % colors.length]} /> </div>)
      }
    }
    setItems([])
    setItems(aux)
  };



  return (
    <div>
      <ThemeProvider theme={createMuiTheme({
        palette: {
          primary: green,
        },
      })}>
        <Fab variant="extended" className="classes.fab" style={{ marginTop: '-5.3vh', marginRight: '-2vw' }} onClick={handleClickOpen} >
          Solución
        </Fab>
      </ThemeProvider>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle disableTypography style={{ cursor: 'move', color: 'black' }} id="draggable-dialog-title">
          <Typography variant="h6" style={{ color: 'black', textAlign: 'left' }}>Soluciones </Typography>
        </DialogTitle>

        <DialogContent style={{ backgroundColor: 'white' }}>
          {formato ?
            [items.length > 1 ?
              <Carousel
                swipeable={false}
                draggable={false}
                showDots={false}
                responsive={responsive}
                ssr={true} // means to render carousel on server-side.
                infinite={false}
                keyBoardControl={false}
                containerClass="carousel-container"
                deviceType="desktop"
                dotListClass="custom-dot-list-style"
                itemClass="carousel-item-padding-40-px"
              >
                {items}
              </Carousel>
              : <div>{items}</div>]
            :
            <div>

              <Grid container spacing={1}>
                <FormColumns />
              </Grid>

            </div>
          }
        </DialogContent>
        <DialogActions style={{ backgroundColor: 'white' }}>
          <Switch
            checked={formato}
            onChange={handleChange}
            name="checkedA"
            inputProps={{ 'aria-label': 'secondary checkbox' }}
          />
          <Button variant="contained" autoFocus onClick={handleClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}