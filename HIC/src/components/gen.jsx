import React from "react";
import Paper from '@material-ui/core/paper'
import Grid from '@material-ui/core/Grid';
import Arbol from "./Arbol/Arbol"
import FronteraPareto from "./FronteraPareto/FronteraPareto"
import DList from "./DDList/DList"
import Fab from '@material-ui/core/Fab'
import LoadingOverlay from 'react-loading-overlay';
import DraggableDialog from "./DialogoBarSolution/DialogBarSolution"
//import { useToasts } from 'react-toast-notifications'

class Gen extends React.Component {
  constructor(props) {
    super(props);


    /*Estados:
        tieneSol: Booleano que dice si la base de datos tiene solucion
        maximo: marca el numero maximo visto en los histogramas de los puntos selecionados
        minimo: marca el numero minimo visto en los histogramas de los puntos selecionados
        puntos: lista con los puntos seleccionados
        tamayoPuntos: Numero de puntos seleccionados
        nodo: El nodo seleccionado en este momento
        sep: Cuando se separa la base de datos, aqui se guarda el punto de separacion
        busquedaActiva: Booleano que dice si La busqueda de puntos ha terminado
        divisionIzq y divisionDer: Cuando se separan los datos en dos, guardan el numero de datos que se va por cada lado
        activo: Marca cuando aun habiendose parado el boton los ulitmos puntos aun no han regresado del servidor
        y: Guarda los datos del nodo a separar
        separaciones: El numero de separaciones
        v: El vector direccion
        headers: Lista con el nombre de las cabeceras de la base de datos
        titulo: titulo de la base de datos
        inicialx, inicialy y iniciall: Datos para pintar el diagrama de barras de la solucion. inicialx es el numero de elementos. inicialy es la altura de las barras. iniciall es el numero inicial de datos
        tipo: La medida seleccionada, phi, psi o bc
        tiposEnseyar: Las medidas disponiobles para seleccionar en el grafico: Phi, psi, bc y sus opuestas
        n: Columnas
        N: Filas
    */
    this.state = {
      tieneSol: true,
      maximo: null,
      minimo: null,
      puntos: [],
      tamayoPuntos: 0,
      nodo: null,
      sep: null,
      busquedaActiva: false,
      divisionIzq: -1,
      divisionDer: -1,
      activo: false,
      y: null,
      separaciones: 1,
      v: null,
      headers: [],
      titulo: 'separar.csv',
      inicialx: null,
      inicialy: null,
      iniciall: null,
      tipo: 3,
      tiposEnseyar: [],
      n: 1,
      N: 1,
    }
  };



  /*
  Detonante: Iniciar la aplicacion
  fetch: Get
         return: titulo, heaaders (si no tiene son numeros), inicialx (si tiene sol), inicialy (si tiene sol),  iniciall (si tiene sol), tieneSol
  Descripcion: LLama al servidor para cargar los datos iniciales necesarios para cargar la aplicacion. Tiene dos metodos: Carga con solucion y sin solucion
  */
  componentDidMount() {
    fetch('/cargaDatos',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "GET",
      }).then((response) => response.json())
      .then((points) => {
            console.log(points.n)
        if (points.tieneSol) {
          this.setState({
            titulo: points.titulo,
            headers: points.headers,
            inicialx: points.inicialx,
            inicialy: points.inicialy,
            iniciall: points.iniciall,
            tieneSol: points.tieneSol,
            n: points.n,
            N: points.N,
          })
        } else {
          this.setState({
            titulo: points.titulo,
            headers: points.headers,
            iniciall: points.iniciall,
            tieneSol: points.tieneSol,
            n: points.n,
            N: points.N,
          })
        }
      });
  }
 /*
  Detonante: Presiona el boton de download
  fetch: Get
         return: documento csv con la respuesta en la utima fila y si tiene sol la pone en la penultima
  Descripcion: Descarga la solucion con nombre solucion.csv
  */
  handleDownload = () => {
    fetch('/download',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "GET",
      }).then(response => {
        response.blob().then(blob => {
          let url = window.URL.createObjectURL(blob);
          let a = document.createElement('a');
          a.href = url;
          a.download = 'solucion.csv';
          a.click();
        });
      });

  };

  /*
  Detonante: Presiona sobre uno de los puntos. Se llamara desde la frotera de pareto.
  atributos: pointx es el valor de la medida (eje x), pointy el de la varianza (eje y), v es el vector direccion, x son los datos proyectados sobre la direccion
  Descripcion: Cada vez que se pulsa sobre un punto se ayade su informacion a la lista de puntos. Si ya esta, en la lista de puntos seleccionados no se ayade.
  */ 
  nuevosPuntos = (x, v, pointx, pointy) => {
    var repetido = false;
    for (let points of this.state.puntos) {
      if (Math.abs(points.pointx - pointx) < 0.00000001 && Math.abs(points.pointy - pointy) < 0.00000001) {
        /*addToast("Ya se ha incluido este grafico", {
          appearance: 'warning',
          autoDismiss: true,
        });*/
        repetido = true;
        break;
      }
    }
    const max = Math.max(...x);
    if (!this.state.maximo || this.state.maximo < max) {
      this.setState({
        maximo: max
      })
    }
    const min = Math.min(...x);
    if (!this.state.minimo || this.state.minimo > min) {
      this.setState({
        minimo: min
      })
    }
    if (!repetido) {
      const aux = this.state.puntos;
      for (var i in aux) {
        aux[i]["max"] = this.state.maximo;
        aux[i]["min"] = this.state.minimo
      }
      aux.push({
        "id": this.state.tamayoPuntos + 1,
        "x": x,
        "v": v,
        "pointx": pointx,
        "pointy": pointy,
        "max": this.state.maximo,
        "min": this.state.minimo,
        "maximo": max,
        "minimo": min
      });
      this.setState({ puntos: [] })
      this.setState({ puntos: aux, tamayoPuntos: this.state.tamayoPuntos + 1 })
    }
  }

   /*
  Detonante: Presiona sobre el boton de eliminar un histograma
  atributos: i => el identificador del punto
  Descripcion: Esta funcion elimina un punto de la lista de puntos.
  Consideraciones:
      Se deben crear de nuevo los ids (bug en Dlist)
      Se debe volver a calcular el numero maximo y minimo de nuevo. Posible fix => Lista ordenada segun tamayo
  */ 
  eliminarPunto = (i) => {
    let aux = []
    let boolaux = false
    for (var k in this.state.puntos) {
      if (!boolaux) {
        if (Number(this.state.puntos[k]["id"]) !== Number(i)) {
          aux.push({ ...this.state.puntos[k] });
        } else {
          boolaux = true
        }
      } else {
        let elementAux = { ...this.state.puntos[k] };
        elementAux["id"] -= 1;
        aux.push(elementAux)
      }
    }
    let newMaximo = null;
    let newMinimo = null;
    for (var i in aux) {
      if (!newMaximo || newMaximo < aux[i]["maximo"]) {
        newMaximo = aux[i]["maximo"]
      }
      if (!newMinimo || newMinimo > aux[i]["minimo"]) {
        newMinimo = aux[i]["minimo"]
      }
    }
    this.setState({ minimo: newMinimo, maximo: newMaximo });
    for (var i in aux) {
      aux[i]["max"] = newMaximo;
      aux[i]["min"] = newMinimo;
    }
    this.setState({ puntos: [] }, () => {
      this.setState({ puntos: aux, tamayoPuntos: this.state.tamayoPuntos - 1 })
    })
  }
  //CAMBIOS DE ESTADOS
  eliminarPuntos = () => { this.setState({ puntos: [], tamayoPuntos: 0, maximo: null, minimo: null } ); } // ELIMINA TODOS LOS PUNTOS
  cambiarNodo = (i) => {  
    this.setState({ nodo: i, } );
    if (i != null) this.setState({ busquedaActiva: false }); 
  }
  cambiarNodoEliminado = (i) => { this.setState({ nodo: i, divisionIzq: null, divisionDer: null } );}
  cambiarbusquedaActiva = () => { this.setState({ busquedaActiva: true } ); }
  cambiarActivo = (el) => { this.setState({ activo: el } ); }
  cambiarGrupos = (i) => { this.setState({ separaciones: this.state.separaciones - i } ); }
  cambiarTipo = (i) => { this.setState({ tipo: i } ); }
  cambiarTipos = (i) => { this.setState({ tiposEnseyar: i } ); }
  /*
  Detonante: Separar el histograma
  fetch: POST
         datos: sep => Seoaracion, nodo => El nodo, y => Los datos
         return: der => no. de datos a la der, izq => no. de datos a la izq
  Descripcion: Se actualizan varios estados despues de la separacion. Y ahora guarda los datos, v la direccion seleccionada y separaciones ahora marca +1
  */
  cambiarSep = (i, x, v) => {
    this.setState({ sep: i, } );
    if (i != null) {
      fetch('/separacion',
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({ sep: i, nodo: this.state.nodo, y: x })
        }).then((response) => response.json())
        .then((points) => {
          this.setState({
            divisionDer: points.der,
            divisionIzq: points.izq,
            y: x,
            v: v,
            separaciones: this.state.separaciones + 1
          });
        }
        )
    }
  }

  /*
    COMPONENTES IMPORTANTES Y SUS PROPS:

    FronteraPareto: 
                    tipos: Lista con las medidas
                    tiposSeleccionados: Las medidas que se permiten seleccionar
                    tipo: La medida seleccionada a optimizar
                    nuevosPuntos: Funcion que es llamada al presionar nuevos puntos
                    nodo: Nodo seleccionado
                    cambiarbusquedaActiva y activar: funciones que cambian los booleandos que indican si ha terminado la busqueda de puntos.
    Arbol:
                    x: vector direccion
                    y: datos
                    nodo: El nodo seleccionado
                    sep: La separacion que el usuairo ha hecho de los datos al partir el histograma
                    headers: cabeceras de la base de datos
                    inicialx, inicialy, iniciall: Los valores iniciales de las soluciones
                    divisionIzq y divisionDer: numero de datos que se ha ido a cada lado en la division
                    tieneSol: booleano. Tiene solucion?
                    busquedaActiva: bool si sigue la busqueda de puntos
                    cambiarNodo: funcion que cambia el nodo
                    sepM: Funcion que cambia la separacion
                    eliminarPuntos: Funcion que elimina todos los puntos cuando se divide, quitando los histagrmas de la Dlist
                    cambiarNodoEliminado: 
                    reducirGrupos: 
                    cambiarTipos: Cambia las medidas a seleccionar cuando se termine el algoritmo
                    cambiarTipo: Cambia la medida a optimizar
                    
    DList:
                    puntos: Los puntos seleccionados
                    sep: Funcion que cambia la separacion
                    eliminar: Funcion que elimina puntos
  */
  render() {
    return (
      <div className="App" style={{ maxHeight: '100vh', overflow: 'hidden', backgroundColor: "#EDF1F4" }}>
        <LoadingOverlay
          active={this.state.busquedaActiva && this.state.activo}
          spinner
          text='Cargando los ultimos puntos...'
        >
          <div style={{ display: "flex", flexFlow: "row wrap" }}>
            <h1 style={{ width: "50%", textAlign: "center", color: "black", marginLeft:'7vw', marginTop: "3vh" }}>{this.state.titulo}</h1>
            <h2 style={{ width: "10.3333%", textAlign: "right", color: "black",  marginRight: "1vw" }}>Propiedades: {this.state.n}</h2>
            <h2 style={{ width: "10.3333%", textAlign: "right", color: "black",  marginRight: "0.9vw" }}>Elementos: {this.state.N}</h2>
            <h2 style={{ width: "10.3333%", textAlign: "right", color: "black",  marginRight: "1vw" }}>Particiones: {this.state.separaciones}</h2>
          </div>
          <div style={{ paddingTop: '3vh' }}>
            <Grid container spacing={5}>
              <Grid item xs={8}>
                <FronteraPareto tipos={[" Phi", " BC", " Psi", ""]} tiposSeleccionados={this.state.tiposEnseyar} tipo={this.state.tipo} nuevosPuntos={this.nuevosPuntos} nodo={this.state.nodo} cambiarbusquedaActiva={this.cambiarbusquedaActiva} activar={this.cambiarActivo}></FronteraPareto>
                <div style={{ marginLeft: '10vw' }}>
                  <Arbol  x={this.state.v} y={this.state.y}  nodo={this.state.nodo}  sep={this.state.sep} headers={this.state.headers} inicialx={this.state.inicialx} inicialy={this.state.inicialy} 
                          iniciall={this.state.iniciall} divisionIzq={this.state.divisionIzq} divisionDer={this.state.divisionDer} tieneSol={this.state.tieneSol} busquedaActiva={this.state.busquedaActiva}
                          cambiarNodo={this.cambiarNodo} sepM={this.cambiarSep} eliminarPuntos={this.eliminarPuntos}  cambiarNodoEliminado={this.cambiarNodoEliminado} reducirGrupos={this.cambiarGrupos}  cambiarTipos={this.cambiarTipos} cambiarTipo={this.cambiarTipo}      
                  />
                </div>
              </Grid>
              <Grid item xs={4}>
                <div style={{ marginBottom: '70vh' }}>
                  <Paper m="auto" justify="center" elevation={3} style={{ height: '75vh', overflow: 'auto', marginLeft: '-5vw', marginRight: '10vw', marginBottom: '5vh', backgroundColor: "white" }}>
                    {this.state.puntos.length ? <h1 style={{ marginLeft: "1vw", marginTop: '4vh', color: "white" }}>Histogramas: </h1> : <h1 style={{ marginLeft: "1vw", marginTop: '4vh', color: "black" }}>Seleccione Nuevos Puntos</h1>}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '5vh' }}>
                      <DList puntos={this.state.puntos} sep={this.cambiarSep} eliminar={this.eliminarPunto} />
                    </div>
                  </Paper>
                  <Fab variant="extended" className="classes.fab" style={{ marginRight: '25vw' }} onClick={this.handleDownload}>
                    Download
                  </Fab>
                  {this.state.tieneSol ?
                    <DraggableDialog />
                    : null}
                </div>

              </Grid>




            </Grid>
          </div>
        </LoadingOverlay>
      </div>
    );
  }
}

export default Gen;