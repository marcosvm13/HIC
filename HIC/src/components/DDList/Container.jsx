import { useState, useCallback, useEffect } from 'react';
import React, { Component }  from 'react';
import { Card } from './Card';
import Grid from '@material-ui/core/Grid';
import update from 'immutability-helper';

/*Ejemplo Comp*/

const style = {
    width: 400,
};

export const Container = ({puntos, props, eliminar}) => {
        const [cards, setCards] = useState([...puntos]);
        useEffect(() => {
            setCards(puntos);
        }, [puntos])
        const moveCard = useCallback((dragIndex, hoverIndex) => {
            const dragCard = cards[dragIndex];
            setCards(update(cards, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragCard],
                ],
            }));
        }, [cards]);
        const renderCard = (card, index) => {
            return (
            <Card  key={card.id} index={index} id={card.id} x={card.x} v={card.v} props={props} moveCard={moveCard} eliminar={eliminar} min={card.min} max={card.max}/>
            );
        };
        return (
				<div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
			);
};