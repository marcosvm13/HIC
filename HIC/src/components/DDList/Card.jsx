import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import SmallHistogram from "./SmallHistagram";
import DraggableDialog from "./DialogoSeparacion/DialogoSeparacion"
import React, { Component }  from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/paper'

/*Ejemplo Comp*/

const style = {
  border: "0px solid black",
  padding: "0.5rem 1rem",
  marginBottom: ".8rem",
  backgroundColor: "#fffff",
  cursor: "move"
};
export const Card = ({ min, max, id, x, v, index, props, moveCard, eliminar}) => {
  const ref = useRef(null);
 
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  /*Elementos de cada elemento de la lista: Histograma y dos botones: Separar (que abre el dialogo de separaracion) y eleiminar*/
  return (
    <div ref={ref} style={{ ...style, opacity}} data-handler-id={handlerId} >
       <Paper m="auto" justify = "center" elevation={3} style={{overflow: 'auto', paddingBottom:'2vh', marginLeft:'-2vw', marginTop:'-5vh', marginBottom:'6vh', width:'20vw'}}>
      <SmallHistogram min={min} max={max} x={x}/>
      <DraggableDialog props={props} x={x} v={v}/>
      <Button
        onClick = {() => {eliminar(id)}}
        variant="contained"
        color="secondary"
        style={{marginTop:"1vh"}}
      >
        Eliminar
      </Button>
    </Paper>
    </div>
  );
};