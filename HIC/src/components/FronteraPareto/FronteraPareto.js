import React from "react";
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import Paper from '@material-ui/core/paper'
import Fab from '@material-ui/core/Fab'
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.css';
const Plot = createPlotlyComponent(Plotly);
class FronteraPareto extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activacion: false, // si aun queda algun elemento que no haya llegado del servidor
      enseyar: false, // Si hay que enseyar el boton de parar
      busquedaActiva: true, // Se ha parado el boton
      line1: { // frontera de pareto
        x: [],
        y: [],
        type: "scatter",
        mode: "lines+markers",
        marker: { color: "orange" },
      },
      
      /*line2: { // puntos no pareto (ACTUALMENTE NO SE MUESTRAN)
        x: [],
        y: [],
        type: "scatter",
        mode: "markers",
        marker: { color: "blue" },
        hoverinfo: "none",
      },*/

      layout: {
        xaxis: { color: "black" },
        yaxis: { color: "black" },
        datarevision: 0,
        title: {
          text: "<b>Frontera de Pareto<b>",
          font: {
            family: 'Arial',
            size: 28
          },
        },
        width: 900,
        height: 500,
        margin: {
          l: 100,
          r: 100,
          b: 50,
          t: 80
        },
        plot_bgcolor: "white",
        paper_bgcolor: "white",
        font: { color: "black" },
        modebar: { color: "black", orientation: "v" },
        xaxis: {
          title: {
            text: 'BIMODALIDAD',
            standoff: 60,
            font: {
              family: 'Arial, sans-serif',
              size: 18,
              color: 'darkgrey'
            }
          },
        },
        yaxis: {
          title: {
            text: 'VARIANZA',
            font: {
              family: 'Arial, sans-serif',
              size: 18,
              color: 'darkgrey'
            }
          }
        }
      },

      revision: 0, // VARIABLE QUE CAMBIA CADA VEZ QUE HAY QUE HACER UN CAMBIO EN EL GRAFICO PARA ACTUALIZAR EL GRAFICO PLOTLY
    }
  }


   /*
    Detonante: LLamada de la funcion
    Descripcion: El servidor devueve todos los puntos de la frontera de pareto teniendo en cuenta el nuevo punto seleccionado
    */ 
  increaseGraphic = async () => {
    if (this.props.nodo != null && this.props.nodo != -1 && this.state.busquedaActiva && this.state.activacion != true) {
      this.setState({ activacion: true })
      // SOLO SI NO SE HA PAUSADO EL ALGORITMO HACEMOS UNA LLAMADA AL BK PARA QUE NOS DE LOS PUNTOS NUEVOS
      fetch('/graph',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({ n: this.props.nodo, tipo: this.props.tipo, tipos: this.props.tiposSeleccionados.map(a => a.value - 1) }) // Le mandamos el nodo actual
        })
        .then((response) => response.json())
        .then((lines) => {
          this.setState({ activacion: false })
         
          const { line1/*, line2*/, layout } = this.state;
          line1.x = lines.line1x;
          line1.y = lines.line1y;
          //line2.x = lines.line2x;
          //line2.y = lines.line2y;
          this.setState({ revision: this.state.revision + 1, enseyar: true }); // ACTUALIZAMOS EL STATE PARA QUE SE ACTUALICE EL DIAGRAMA
          layout.datarevision = this.state.revision + 1;
          if (!this.state.busquedaActiva) {
            this.props.activar(false)
          }
         
        }
        );
    }
  }
   /*
    Detonante: El usuario cambia la medida del eje y 
    atributos: i => la medida que ha seleccionado
    Descripcion: El servidor devueve todos los puntos de la frontera de pareto de la nueva medida
    */ 
  onChangeTipo = (i) => {
    fetch('/paretoOtro',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ tipo: this.props.tipo, tipo_nuevo: i.value }) // Le mandamos el nodo actual
      })
      .then((response) => response.json())
      .then((lines) => {
        this.setState({ activacion: false })
        const { line1/*, line2*/, layout } = this.state;
        line1.x = lines.line1x;
        line1.y = lines.line1y;
        /*.x = lines.line2x;
        line2.y = lines.line2y;*/
        this.setState({ revision: this.state.revision + 1 }); // ACTUALIZAMOS EL STATE PARA QUE SE ACTUALICE EL DIAGRAMA
        layout.datarevision = this.state.revision + 1;
      }
      );
  }
  /*
    Detonante1: Cuando se actualicen la prop de nodo, es decir cuando se cambie el nodo
    Descripcion1: se vacia la frontera de pareto
    Detonante2: Cuando se actualicen la prop de revision, es decir cuando el punto ya haya llegado
    Descripcion2: se pide un nuevo punto al back
  */ 
  componentDidUpdate(prevProps) {
    if (this.props.nodo !== prevProps.nodo) { //Si cambio el nodo vaciamos los puntos
      if (this.props.nodo == null || this.props.nodo == -1) {
        const { line1 /*line2,*/  } = this.state;
        line1.x = [];
        line1.y = [];
        /*line2.x = [];
        line2.y = [];*/
        this.setState({ busquedaActiva: true });
      }
    }
    if (this.state.revision !== prevProps.revision) { //Si cambio la revision llamamos otra vez a pedir puntos al bk
      this.increaseGraphic();
    }
  }
  render() {
    return (
      <div className="App">
        <Paper m="auto" justify="center" elevation={3} style={{ height: '42vh', overflow: 'auto', marginLeft: '10vw', marginRight: '10vw', marginBottom: '5vh', backgroundColor: "white" }}>
          {this.state.enseyar && this.props.nodo != null && this.state.busquedaActiva ?
            <div>
              <Paper elevation={3} style={{ backgroundColor: '#F9F9F9', width: '55vh', height: '4vh', marginLeft: '8vw', marginRight: '1vw', marginBottom: '1vh', marginTop: '1.5vh', paddingTop: '0.8vh' }}>
                <h1 style={{ marginTop: '-0.4vh', marginLeft: '-12vw', color: 'black' }}>{"min: " + this.props.tipos[this.props.tipo]}</h1>
                <Fab variant="extended" className="classes.fab" style={{ marginLeft: '4vw', marginTop: '-3.8vh' }} onClick={() => {
                  this.setState(state => ({
                    busquedaActiva: false,
                    enseyar: false
                  }));
                  this.props.cambiarbusquedaActiva();
                  if (this.state.activacion == true) {
                    this.props.activar(true)
                  }
                }
                }>
                  OFF
                </Fab>
              </Paper>
            </div> : null}
          {this.props.nodo != null && !this.state.busquedaActiva ?
            <div>
              <Paper elevation={3} style={{ backgroundColor: '#F9F9F9', width: '55vh', height: '4vh', marginLeft: '8vw', marginRight: '1vw', marginBottom: '1vh', marginTop: '1.5vh', paddingTop: '0.8vh' }}>
                <h1 style={{ marginTop: '-0.4vh', marginLeft: '-12vw', color: 'black' }}>{"min: " + this.props.tipos[this.props.tipo]}</h1>
                <div style={{ marginLeft: '30vh', marginTop: '-2vh' }}>
                  <Select className="col-md-6 col-offset-4"
                    onChange={this.onChangeTipo}
                    closeMenuOnSelect={false}
                    options={[{ value: '7', label: 'Varianza' }].concat(this.props.tiposSeleccionados)}
                  />
                </div>
              </Paper>
            </div> : null}
          <div>
            <Plot
              data={[
                this.state.line1
              ]}
              onClick={(e) => {
                /*
                Detonante: Presiona sobre uno de los puntos. 
                atributos: e => punto seleccionado
                Descripcion: Se le pasa al servidor el punto seleccioando para que nos de inforrmacion sobre el: los datos proyectados sobre la direccion y la direccion. Posteriormente, se sube a gen con la funcion de props nuevos puntos pasandole esta info, la varianza y la medida
                */ 
                this.setState(state => ({
                  busquedaActiva: false,
                  enseyar: false
                }));
                fetch('/newPoint', {
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  method: "POST",
                  body: JSON.stringify({ x: e.points[0].x })
                }).then((response) => response.json())
                  .then((points) => {
                    this.props.nuevosPuntos(points.x, points.v, e.points[0].x, e.points[0].y);
                  }
                  );
              }}
              layout={this.state.layout}
              revision={this.state.revision}
              graphDiv="graph"
            />
          </div>
          <div>
          </div>
        </Paper>
      </div>
    );
  }
}
export default FronteraPareto;