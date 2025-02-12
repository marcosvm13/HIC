  import React from 'react';
  import {Container} from './Container'
	import { DndProvider } from 'react-dnd'
	import { HTML5Backend } from 'react-dnd-html5-backend'

/*Ejemplo de drag and drop list sacado de la pagina del componente*/

class DList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <DndProvider backend={HTML5Backend}>
      <Container  puntos = {this.props.puntos} props={this.props.sep} eliminar ={this.props.eliminar}/>
    </DndProvider>
    );
  }
}

export default DList;