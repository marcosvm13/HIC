import Tree from "react-d3-tree";
import React from "react";
import Paper from '@material-ui/core/paper'
import Histogram from "./Histogram";
import BarDiagramSol from "./BarDiagramSol";
import BarDiagramSolPartido from "./BarDiagramSolPartido";
import LateralBarDiagramProperties from "./LateralBarDiagramProperties";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";
import { VscGraph } from 'react-icons/vsc';
import { IconContext } from "react-icons";
import DraggableDialog from "./DialogoInformacionSeparacion/DialogInfoSep"
import SeleccionTipo from "./SeleccionTipo/SeleccionTipo"
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import { purple } from '@material-ui/core/colors';

const PurpleSwitch = withStyles({
  switchBase: {
    color: purple[300],
    '&$checked': {
      color: purple[500],
    },
    '&$checked + $track': {
      backgroundColor: purple[500],
    },
  },
  checked: {},
  track: {},
})(Switch);

class Arbol extends React.Component {

  constructor(props) {
    super(props)
    this.elements = 0 //

    /*Estados:
    colors: Guarda los colores
    nodeSize: tamyo para que el componente interprete como colocar los demas nodos del arbol (no es = a las dimensiones reales)
    activado: booleano que dice si se ha activado el switch => Esto dira si se enseyan los diagramas de barras de las soluciones debajo de cada nodo o como un tooltip 
    data: Donde se guardan los nodos
          name: Lo que pone el nodo
          attributes: 
                id: identificador => nodo inicial 0 => Hijos del nodo => izq = 2*nodo_padre + 1  ;   der = 2*nodo_padre + 2
                separacionStart: Booleano que dice si la separacion esta en marcha
                separacion: Cuando se separan los datos se guarda la separacion
                y: datos
                x: vector direccion
                aux: Componente con la lista de diagramas de barras de las soluciones 
                xi, yi, li: Los datos para crear los diagramas de barras de las soluciones
          children: Los hijos del nodo.
*/
    this.state = {
      colors: ["#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#bc80bd", "#ccebc5", "#ffed6f", "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928", "#00C0C7", '#E8871A', '#268D6C', '#DA3490', '#47E26F', '#9BEC54', '#DFBF03', '#CB6F10'],
      nodeSize: { x: 800, y: 200 },
      activado: false,
      data: [{
        name: "Empezar Partición",
        attributes: {
          id: 0,
          separacionStart: false,
          separacion: null,
          y: null,
          x: null,
          aux: null,
          xi: null,
          yi: null,
          li: null,
        },
        children: []
      }],

    }
  };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////   Funciones que responden a eventos    ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



 /*
  Detonante: Cambia alguna prop de gen
  prop:  
        Sep: Cuando se modifica la separacion quiere decir que se acaba de dividir en dos el histogama y este guarda el valor donde se ha separado
             Se pasara la info de este valor al nodo actual y se crearan dos hijos. Luego se pone a null la separacion (lo que proboca que se vacie la frontera de pareto) y se eliminan los puntos seleccionados (lo que elimina los histogramas)
        busquedaActiva: Busqueda Activa marca si el boton de off (el que pulsa el usuario para acabar de ejecutar el algoritmo) esta pulsado. Si se ha pulsado se cambian el texto del nodo  seleccionado para que pueda deseleccionarse
        iniciall: Es una de los datos inciales que da el servidor sobre la base de datos con soluciones. Junto con inicialx e inicialy, son los elementos que dan informacion sobre el diagrama de barras de soluciones inicial. Este se guarda en el nodo inicial hasta que es separado. 
        divisionIzq: Es el no. de valores de datos que se ha ido por la izq y der. Esto quiere decir que la separacion ya se ha llevado a cabo en el servidor (antes solo teniamos el valor de "sep" => por donde se iba a partir). Se envia una peticion al servidor
                    para que nos de info de la separacion (si tiene sol) y se hace "aux" => la lista de diagramas de barras soluciones. Por ultimo, se modifican los nodos para poner la info en el nombre del numero de datos que se ha ido por la derecha y la izq.
*/
  componentDidUpdate(prevProps) {
    if (this.props.sep !== prevProps.sep) {
      if (this.props.sep != null) {
        var copy = [...this.state.data];
        this.nuevaSeparacion(copy)
        this.setState({ data: copy });
        this.props.sepM(null)
        this.props.eliminarPuntos()
      }
    } if (this.props.busquedaActiva !== prevProps.busquedaActiva) {
      const pos = this.props.nodo;
      var copy = [...this.state.data];
      this.stopAsignacion(copy, pos)
      this.setState({ data: copy });
    }
    if (this.props.iniciall != prevProps.iniciall) {
      var copy = [...this.state.data];
      copy[0].attributes.xi = this.props.inicialx;
      copy[0].attributes.li = this.props.iniciall;
      copy[0].attributes.yi = this.props.inicialy;
      this.setState({ data: copy })
    }
    if (this.props.divisionIzq !== prevProps.divisionIzq && this.props.divisionIzq != null) {
      if (this.props.tieneSol) {
        fetch('/resultadoNodoSolucion',
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({ nodo: this.props.nodo })
          }).then((response) => response.json())
          .then((points) => {
            const aux = [<div style={{ marginRight: '2vw', backgroundColor: 'white' }}><BarDiagramSolPartido x1={points.x[0]} y1={points.y[0]} sum1={points.l[0]} x2={points.x[1]} y2={points.y[1]} sum2={points.l[1]} mar={60} colorb={"white"} color1={"#F02D65"} color2={"#2DAFF0"} tamw={550} tamh={450} /> </div>]
            const pos = this.props.nodo;
            var copy = [...this.state.data];
            this.nuevaDivision(copy, pos, this.props.divisionIzq, this.props.divisionDer, this.props.y, this.props.x, aux, points.x, points.y, points.l)
            this.setState({ data: copy });
            this.props.cambiarNodo(null);
          })
      } else {
        const pos = this.props.nodo;
        var copy = [...this.state.data];
        this.nuevaDivision(copy, pos, this.props.divisionIzq, this.props.divisionDer, this.props.y, this.props.x, null, null, null, null)
        this.setState({ data: copy });
        this.props.cambiarNodo(null);
      }
    }
  }

  /*
  Detonante: Pulsa el nodo que no esta seleccionado (en azul) y pone "presiona Para separar"
  atributos: nodeData => Info del nodo seleccionado, tipo => la medida seleccioanda, tipos => las otras medidas que se calcularan y luego se permitiran seleccionar
  Descripcion: se selecciona el nodo, iniciando el algorimto en el componente del grafico. Se dejan la medida de otimizacion y las seleccionadas guardadas en gen.
*/
  handleSelectTipo = (nodeData, tipo, tipos) => {
    if (this.props.nodo == null) {
      const pos = nodeData.attributes.id;
      var copy = [...this.state.data];
      this.nuevaAsignacion(copy, pos)
      this.setState({ data: copy });
      this.props.cambiarNodo(nodeData.attributes.id)
    }

    this.props.cambiarTipo(tipo)
    this.props.cambiarTipos(tipos)
  }

 /*
  Detonante: Pulsa el nodo que esta seleccionado (en amarillo) y pone "presiona Para deseleccionar"
  atributos: nodeData => Info del nodo seleccionado
  Descripcion: se deselecciona el nodo, se pone a null la separacion (lo que proboca que se vacie la frontera de pareto) y se eliminan los puntos seleccionados (lo que elimina los histogramas)
*/
  handleClickSeleccionado = (nodeData) => {
    var copy = [...this.state.data];
    const pos = nodeData.attributes.id;
    this.eliminarAsignacion(copy, pos)
    this.setState({ data: copy });
    this.props.sepM(null)
    this.props.eliminarPuntos()
    this.props.cambiarNodo(null)

  }

 /*
  Detonante: Pulsa el boton de eliminar (la cruz) el nodo ya separado(rojo)
  atributos: nodeData => Info del nodo seleccionado
  Descripcion: se elimina el nodo y sus hijos, se pone a null la separacion (lo que proboca que se vacie la frontera de pareto) y se eliminan los puntos seleccionados (lo que elimina los histogramas). Por ultimo, se actualiza la informacion en el servidor para que junte las divisiones ya hechas
*/
  handleClickEliminado = (nodeData) => {
    var copy = [...this.state.data];
    const pos = nodeData.attributes.id;
    this.eliminarElemento(copy, pos)

    this.setState({ data: copy });
    this.props.sepM(null)
    this.props.eliminarPuntos()
    this.props.cambiarNodoEliminado(null)
    fetch('/juntar',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ nodo: pos })
      }).then((response) => response.json())
      .then((i) => {
        this.props.reducirGrupos(i)
      });

  }

 /*
  Detonante: Apretar el switch
  atributos: event => Nos indica si el switch ha sido activado o no 
  Descripcion: se cambia el booleano y se modifica el tamayo segun sea su valor actual para que al aumentar el tamayo de los nodos, se tenga en cuenta 
  */
  handleChange = (event) => {
    this.setState({
      activado: event.target.checked
    })
    if (event.target.checked) {
      this.setState({
        nodeSize: { x: 1000, y: 300 }, //Tamyo Grande
      })
    }
    else {
      this.setState({
        nodeSize: { x: 800, y: 200 }, //Tamyo Pequeyo
      })
    }
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////   Funciones auxiliares recursivas para modificar los nodos del arbol   //////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*
  detonante: Es llamada por componentDidUpdate si sep cambia => Cuando el usuario hace la separacion 
  atributos: obj => indica el id del objeto que se esta mirando 
  Descripcion: Busqueda recursiva entre los elementos del arbol (seguimos hasta que no tengan hijo o se haya encontrado)=> Cuando encontramos el nodo seleccionado actualmente le actualizamos la separacion  y le creamos dos hijos
  */
  nuevaSeparacion(obj) {
    for (var i in obj) {
      if (obj[i]["attributes"]["id"] === this.props.nodo) {
        obj[i]["attributes"]["separacion"] = this.props.sep;
        obj[i]["name"] = "Separacion: " + this.props.sep.toFixed(2);
        obj[i]["children"] = [{
          name: "Empezar Partición",
          attributes: {
            id: (2 * obj[i]["attributes"]["id"]) + 1,
            separacionStart: false,
            separacion: null,
            y: [],
            x: [],
            aux: null,
            xi: null,
            yi: null,
            li: null,
          },
          children: []
        }, {
          name: "Empezar Partición",
          attributes: {
            id: (2 * obj[i]["attributes"]["id"]) + 2,
            separacionStart: false,
            separacion: null,
            y: [],
            x: [],
            aux: null,
            xi: null,
            yi: null,
            li: null,
          },
          children: []
        }]
      }
      else if (typeof obj[i]["children"] !== []) {
        this.nuevaSeparacion(obj[i]["children"]);
      }
    }
  }


  /*
  detonante: Es llamada por handleSelectTipo => Cuando se inicia la particion con una de las medidas
  atributos: obj => indica el id del objeto que se esta mirando 
  Descripcion: Busqueda recursiva entre los elementos del arbol (seguimos hasta que no tengan hijo o se haya encontrado)=> Cuando encontramos el nodo que el usuario quiere partir se pasa el nombre a NODO SELECCIONADO y se pone a True separacionStart 
  */
  nuevaAsignacion(obj, nodo) {
    for (var i in obj) {
      if (obj[i]["attributes"]["id"] === nodo) {
        obj[i]["name"] = "Nodo Seleccionado";
        obj[i]["attributes"]["separacionStart"] = true;

      }
      else if (typeof obj[i]["children"] !== []) {
        this.nuevaAsignacion(obj[i]["children"], nodo);
      }
    }
  }

  /*
  detonante: Es llamada por componentDidUpdate cuando cambia la props.divisionIzq es decir cuando el servidor ya ha respondido con la informacion para construir los histogramas y se conocen los datos que han ido a la derecha y a la izquierda.
  atributos: obj => indica el id del objeto que se esta mirando 
  Descripcion: Busqueda recursiva entre los elementos del arbol (seguimos hasta que no tengan hijo o se haya encontrado)=> Cuando encontramos el nodo actual actualizamos la info del nodo: 
                                                                                                                                                                                              Nombre => info de datos que se han ido a la izq y der
                                                                                                                                                                                              y => datos proyectados
                                                                                                                                                                                              x => vector direccion
                                                                                                                                                                                              aux => Componente con la lista de diagramas de barras de las soluciones 
                                                                                                                                                                                              A sus hijos:
                                                                                                                                                                                                  xi, yi, li: Los datos para crear los diagramas de barras de las soluciones
  */
  nuevaDivision(obj, nodo, izq, der, y, x, aux, xi, yi, li) {
    for (var i in obj) {
      if (obj[i]["attributes"]["id"] === nodo) {

        obj[i]["name"] = +izq + "/" + der;
        obj[i]["attributes"]["y"] = y;
        obj[i]["attributes"]["x"] = x;
        obj[i]["attributes"]["aux"] = aux;
        if (this.props.tieneSol) {
          let ind = 0;
          for (var j in obj[i]["children"]) {
            obj[i]["children"][j]["attributes"]["xi"] = xi[ind];
            obj[i]["children"][j]["attributes"]["yi"] = yi[ind];
            obj[i]["children"][j]["attributes"]["li"] = li[ind];
            ind += 1;
          }
        }
      }
      else if (typeof obj[i]["children"] !== []) {
        this.nuevaDivision(obj[i]["children"], nodo, izq, der, y, x, aux, xi, yi, li);
      }
    }
  }

  /*
  detonante: Es llamada por componentDidUpdate si busquedaActiva cambia => Cuando el usuario pulsa el boton de off
  atributos: obj => indica el id del objeto que se esta mirando 
  Descripcion: Busqueda recursiva entre los elementos del arbol (seguimos hasta que no tengan hijo o se haya encontrado)=> Cuando encontramos el nodo seleccionado actualmente se cambia el nombre a "Presiona para deseleccionar"
  */
  stopAsignacion(obj, nodo) {
    for (var i in obj) {
      if (obj[i]["attributes"]["id"] === nodo) {
        obj[i]["name"] = "Presiona Para Deselecionar";
        obj[i]["attributes"]["separacionStart"] = true;

      }
      else if (typeof obj[i]["children"] !== []) {
        this.stopAsignacion(obj[i]["children"], nodo);
      }
    }
  }

  /*
  detonante: Es llamada por handleClickSeleccionado => Cuando el usuario presiona el nodo que pone "Presiona para deseleccionar"
  atributos: obj => indica el id del objeto que se esta mirando 
  Descripcion: Busqueda recursiva entre los elementos del arbol (seguimos hasta que no tengan hijo o se haya encontrado)=> Cuando encontramos el nodo seleccionado actualmente se cambia el nombre a "Empezar Partición" y se pone a false la separacion start
  */
  eliminarAsignacion(obj, nodo) {
    for (var i in obj) {
      if (obj[i]["attributes"]["id"] === nodo) {
        obj[i]["name"] = "Empezar Partición";
        obj[i]["attributes"]["separacionStart"] = false;
      }
      else if (typeof obj[i]["children"] !== []) {
        this.eliminarAsignacion(obj[i]["children"], nodo);
      }
    }
  }

  /*
  detonante: Es llamada por handleClickEliminado => Cuando el usuario presiona sobre un nodo separado la cruz de eliminacion
  atributos: obj => indica el id del objeto que se esta mirando 
  Descripcion: Busqueda recursiva entre los elementos del arbol (seguimos hasta que no tengan hijo o se haya encontrado)=> Cuando encontramos el nodo a eliminar se reinicia la info del nodo y se eliminan los hijos
  */
  eliminarElemento(obj, nodo) {
    for (var i in obj) {
      if (obj[i]["attributes"]["id"] === nodo) {
        obj[i]["name"] = "Empezar Partición";
        obj[i]["attributes"]["separacion"] = null;
        obj[i]["attributes"]["separacionStart"] = false;
        obj[i]["children"] = [];
      }
      else if (typeof obj[i]["children"] !== []) {
        this.eliminarElemento(obj[i]["children"], nodo);
      }
    }
  }



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////   Funcion que pinta los nodos del arbol   ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  renderRectSvgNode = ({ nodeDatum }) => {
    if (nodeDatum[0] != null) {
      nodeDatum = nodeDatum[0]
    }
    // Nodo sin seleccionar Activado (Azul con las graficas debajo)
    if (!nodeDatum["attributes"]["separacionStart"] && nodeDatum["attributes"]["separacion"] == null && this.state.activado) {
      return (<g>
        <path fill='#5FC7FF' d="M-150,-25 h400 a20,20 0 0 1 20,20 v500 a20,20 0 0 1 -20,20 h-400 a20,20 0 0 1 -20,-20 v-500 a20,20 0 0 1 20,-20 z" />
        <text fill="white" strokeWidth="3" x="-125" y="30" fontSize="30"   >
          {nodeDatum.name}
        </text>
        <foreignObject width="340" height="105" x='-160' y='-28'>
          <SeleccionTipo nodeDatum={nodeDatum} onClick={this.handleSelectTipo} />
        </foreignObject>
        {this.props.tieneSol ?
          <foreignObject width="400" height="400" x='-150' y='60'>
            < Paper m="auto" justify="center" elevation={3} style={{ paddingTop: '1vh', paddingBottom: '1vh' }}>
              <BarDiagramSol colorb={'white'} tamw={400} tamh={400} mar={30} x={nodeDatum['attributes']["xi"]} y={nodeDatum['attributes']["yi"]} sum={nodeDatum['attributes']["li"]} color={this.state.colors[nodeDatum["attributes"]["id"] % this.state.colors.length]} />
            </Paper>
          </foreignObject>
          : null}
      </g>)
    }
    // Nodo sin seleccionar Sin Activar (Azul con las graficas como tooltip)
    if (!nodeDatum["attributes"]["separacionStart"] && nodeDatum["attributes"]["separacion"] == null) {
      return (<g>
        <path fill='#5FC7FF' d="M-150,-25 h400 a20,20 0 0 1 20,20 v60 a20,20 0 0 1 -20,20 h-400 a20,20 0 0 1 -20,-20 v-60 a20,20 0 0 1 20,-20 z"/>
        <text fill="white" strokeWidth="3" x="-125" y="30" fontSize="30" >
          {nodeDatum.name}
        </text>
        <foreignObject width="340" height="105" x='-160' y='-28'>
          <SeleccionTipo nodeDatum={nodeDatum} onClick={this.handleSelectTipo} />
        </foreignObject>
        {this.props.tieneSol ?
          <foreignObject width="60" height="90" x='200' y='-5'>
            <div>
              <Tooltip animation="zoom" style={{ backgroundColor: '#white' }} overlay={
                <BarDiagramSol colorb={"#white"} tamw={250} tamh={250} mar={30} x={nodeDatum['attributes']["xi"]} y={nodeDatum['attributes']["yi"]} sum={nodeDatum['attributes']["li"]} color={this.state.colors[nodeDatum["attributes"]["id"] % this.state.colors.length]} />
              }>
                <span>
                  <IconContext.Provider value={{ color: "black", className: "global-class-name", size: '3.5em' }}>
                    <div>
                      <VscGraph />
                    </div>
                  </IconContext.Provider>
                </span>
              </Tooltip>
            </div>
          </foreignObject>
          : null}

      </g>)
    }

    //Nodo cuando el algoritmo ha terminado de ejecutandose (AMARILLO Y PONE Presiona Para Deseleccionarme)
    else if (nodeDatum["attributes"]["separacionStart"] && nodeDatum["attributes"]["separacion"] == null && this.props.busquedaActiva == true) {
      return (<g>
        <path fill='#FFC04B' d="M-150,-25 h400 a20,20 0 0 1 20,20 v60 a20,20 0 0 1 -20,20 h-400 a20,20 0 0 1 -20,-20 v-60 a20,20 0 0 1 20,-20 z" onClick={this.handleClickSeleccionado.bind(this, nodeDatum)} />
        <text fill="white" strokeWidth="3" x="-140" y="30" fontSize="32" onClick={this.handleClickSeleccionado.bind(this, nodeDatum)}>
          {nodeDatum.name}
        </text>

      </g>
      )
    }
    //Nodo cuando el algoritmo sigue ejecutandose (AMARILLO Y PONE PULSA OFF)
    else if (nodeDatum["attributes"]["separacionStart"] && nodeDatum["attributes"]["separacion"] == null) {
      return (<g>
        <path fill='#FFC04B' d="M-150,-25 h400 a20,20 0 0 1 20,20 v60 a20,20 0 0 1 -20,20 h-400 a20,20 0 0 1 -20,-20 v-60 a20,20 0 0 1 20,-20 z" />
        <text fill="white" strokeWidth="3" x="-25" y="30" fontSize="35">
          Pulsa OFF
        </text>
      </g>)
    } 
    //Nodo cuando la separacion se ha hecho pero el servidor no ha hecho la divsion aun (ROJO pone la separacion es...)
    else if (this.props.busquedaActiva == false) {
      return (<g>
        <path fill='#FF8484' d="M-150,-25 h400 a20,20 0 0 1 20,20 v60 a20,20 0 0 1 -20,20 h-400 a20,20 0 0 1 -20,-20 v-60 a20,20 0 0 1 20,-20 z" />

        <text fill="white" strokeWidth="3" x="-125" y="30" fontSize="35" >
          {nodeDatum.name}
        </text>

      </g>)
    } 
    //Nodo cuando la separacion ha terminado (ROJO Y con botones de eliminar y graficos con los datos)
    else {
      return (<g>
        <path fill='#FF8484' d="M-150,-25 h400 a20,20 0 0 1 20,20 v60 a20,20 0 0 1 -20,20 h-400 a20,20 0 0 1 -20,-20 v-60 a20,20 0 0 1 20,-20 z" />
        <text fill="white" strokeWidth="3" x="-130" y="30" fontSize="35" >
          {nodeDatum.name}
        </text>
        <path d="M140.551 45.24c13.204 1.155 24.845-8.613 26-21.817s-8.613-24.845-21.817-26-24.845 8.613-26 21.817 8.613 24.845 21.817 26zm-5.143-36.473 7.539 8.895 8.928-7.569 3.333 3.972-8.901 7.567 7.574 8.932-3.972 3.333-7.563-8.897-8.906 7.573-3.362-4.006 8.891-7.536-7.567-8.901 4.006-3.362z" fill="red" onClick={this.handleClickEliminado.bind(this, nodeDatum)} />
        <foreignObject width="60" height="90" x='200' y='-5'>
          <div>
            <Tooltip animation="zoom" style={{ backgroundColor: '#34353A' }} overlay={
              <div>
                <Histogram titleColor={"white"} mb={'0vh'} x={nodeDatum["attributes"]["y"]} mar={30} tamw={250} tamh={250}></Histogram>

              </div>
            }>
              <span>
                <IconContext.Provider value={{ color: "black", className: "global-class-name", size: '3.5em' }}>
                  <div>
                    {this.props.tieneSol ?
                      <DraggableDialog elementos={nodeDatum["attributes"]["aux"]} graph={<Histogram titleColor={"black"} mb={'0vh'} x={nodeDatum["attributes"]["y"]} mar={60} tamw={450} tamh={450}></Histogram>} pie={<LateralBarDiagramProperties headers={this.props.headers} mar={60} x={nodeDatum["attributes"]["x"]}></LateralBarDiagramProperties>} />
                      : <DraggableDialog elementos={null} graph={<Histogram titleColor={"black"} mb={'0vh'} x={nodeDatum["attributes"]["y"]} mar={60} tamw={450} tamh={450}></Histogram>} pie={<LateralBarDiagramProperties headers={this.props.headers} mar={60} x={nodeDatum["attributes"]["x"]}></LateralBarDiagramProperties>} />

                    }
                  </div>
                </IconContext.Provider>
              </span>
            </Tooltip>

          </div>
        </foreignObject>

      </g>)
    }
  }

  render() {

    return (
      <div className="App">

        <div id="treeWrapper" style={{ zIndex: '-1', width: '46.2vw', height: '40vh', marginLeft: '0vw', marginTop: '-2vh', marginBottom: '3vh', elevation: '50deg', backgroundColor: 'white' }}>
          <Paper m="auto" justify="center" elevation={3} style={{ width: '46.2vw', height: '40vh', marginLeft: '0vw', marginBottom: '3vh', elevation: '50deg', backgroundColor: 'white' }}>

            <Tree
              data={this.state.data}
              //onNodeClick={this.handleClick}
              nodeSize={this.state.nodeSize}
              translate={{ x: "600", y: "50" }}
              renderCustomNodeElement={this.renderRectSvgNode}
              orientation="vertical"

            />

          </Paper>

        </div>
        {this.props.tieneSol ?
          <div style={{ position: 'fixed', zIndex: '100', marginTop: '-10vh', marginLeft: '40vw' }}  >
            <PurpleSwitch
              size="medium"
              checked={this.state.activado}
              onChange={this.handleChange}
              name="checkedA"
              inputProps={{ 'aria-label': 'secondary checkbox' }}

            />
          </div> : null}
      </div>
    );
  }
}

export default Arbol;



/*
// CODIGO PARA PONER UN MENU SUPERIOR
<Paper m="auto" elevation={3} style={{width: '46.2vw', height: '4vh', marginLeft:'0vw', elevation:'50deg', backgroundColor:'white'}}>
    <div
          style={{
            display: 'flex',

            marginTop: '3vh',
            marginLeft: '20%',
            marginRight: '10%',
        }}
          >
          <Typography id="discrete-slider-restrict" gutterBottom style={{marginTop:'0.65vh'}}>
                          Solución:
                      </Typography>
          <PurpleSwitch
                  size= "medium"
                  checked={this.state.activado}
                  onChange={this.handleChange}
                  name="checkedA"
                  inputProps={{ 'aria-label': 'secondary checkbox' }}

            />
      </div>
    </Paper>*/

    
  /** 
  
    handleClick = (nodeData) => {
      if (this.props.nodo == null) {
        const pos = nodeData.attributes.id;
        var copy = [...this.state.data];
        this.nuevaAsignacion(copy, pos)
        this.setState({ data: copy });
        this.props.cambiarNodo(nodeData.attributes.id)
      }
    }
  */