import React from "react";
import Plotly from 'plotly.js-dist';
import Button from '@material-ui/core/Button';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

/*Consideraciones:
    Posibles modificaciones futuras:
      El slider tiene 100 saltos
*/
class Histogram extends React.Component {
  constructor(props) {
    super(props)

    /*Estados:
           automaticoA: Valor de la separacion automatica con phi
           automaticoB: Valor de la separacion automatica con otsu
           sep: Actual posicion de la barra de separacion
           layout->shapes: Texto que indica la separacion actual seleccionada
           layout->sliders: Slider que controla la barra de separacion
       */
    this.state = {
      automaticoA: null,
      automaticoB: null,
      sep: Math.min(...props.x),
      line1: {
        x: props.x,
        type: "histogram",
        marker: { color: "orange" },
        showlegend: false,
      },
      layout: {
        xaxis: {
          fixedrange: true,
          color: "black"
        },
        yaxis: {
          fixedrange: true,
          color: "black"
        },
        plot_bgcolor: "white",
        paper_bgcolor: "white",
        font: { color: "black" },
        datarevision: 0,
        width: 600,
        height: 600,
        margin: {
          t: 10
        },
        shapes: [
          {
            yref: 'paper',
            type: "line",
            x0: Math.min(...props.x),
            y0: 0,
            x1: Math.min(...props.x),
            y1: 0.95,
            line: { color: "green" },
          },
        ],
        sliders: [
          {
            pad: { t: 30 },
            currentvalue: {
              xanchor: 'right',
              prefix: 'separación: ',
              font: {
                color: 'black',
                size: 20
              }
            },
            steps: this.range(Math.min(...props.x), Math.max(...props.x), 100), // Los saltos que da el slider => 100
          }
        ]
      },

    }
  }

  /*
  Descripcion: Funcion que calcula los saltos
  */
  range(from, to, step) {
    step = (Math.abs(to) + Math.abs(from)) / (step);
    const a = [...Array(Math.floor((to - from) / step) + 1)].map((_, i) => from + i * step);
    var sliderSteps = [];
    for (var i = 0; i < a.length; i++) {
      sliderSteps.push({
        label: a[i].toFixed(2),
        method: 'update',
        args: [{ 'annotations.text': 'External %d' % i }],
        values: a[i]

      });
    }
    return sliderSteps;
  }

/*
Detonante: Pulsar el boton automatico
fetch: Post
       atributos: los datos
       return: elem_suma: automatico phi y elem_may: automatico otsu
Descripcion: LLama al servidor para devolver 2 posibles resultados de separacion
*/
  handleAutomatico = () => {
    fetch('/divisorAutomatico',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ y: this.props.x })
      }).then((response) => response.json())
      .then((points) => {
        this.setState({
          automaticoA: points.elem_suma.toFixed(2),
          automaticoB: points.elem_may.toFixed(2),
        });
      })
  }

/*
Detonante: Pulsar el boton separar
Descripcion: Vuelve a gen la info de la separacion: Separacion, datos proyectados y direccion
*/
  handleSendData = () => {
    this.props.sep(this.state.sep, this.props.x, this.props.v)
  };

/*
Detonante: Al mover el slider
Descripcion: Se mueve la linea pintada en el grafico plotly
*/
  onSliderChange = (e) => {
    const line1 = this.state.layout.shapes[0];
    line1.x0 = e.step._input.values;
    line1.x1 = e.step._input.values;
    this.setState({
      sep: e.step._input.values
    }
    );
  };

  render() {
    return (
      <div className="App">
        <div>
          {this.state.automaticoA ?
            <div>
              <h1 style={{ color: "black" }}>Separación con Phi: {this.state.automaticoA}</h1>
              <h1 style={{ color: "black" }}>Separación con Otsu: {this.state.automaticoB}</h1>
            </div>
            : null}
          <Plot
            data={[
              this.state.line1]}
            graphDiv="graph"
            layout={this.state.layout}
            config={{ 'displayModeBar': false }}
            onSliderChange={this.onSliderChange}
          />
        </div>
        <div>
          <Button variant="contained" onClick={this.handleSendData} color="primary">
            Separar
          </Button>
          <Button variant="contained" onClick={this.handleAutomatico} color="primary" style={{ marginLeft: '1vw' }}>
            Automatico
          </Button>
        </div>
      </div>
    );
  }
}

export default Histogram;