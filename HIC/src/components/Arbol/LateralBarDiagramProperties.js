import React from "react";
import Plotly from 'plotly.js-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


class LateralBarDiagramProperties extends React.Component {
  /*props:{
    x,
    y
}*/

  constructor(props) {
    super(props)

    if (this.props.headers.length == 0) {
      this.state = {

        hola: [],
        y: [...Array(this.props.x.length).keys()],
        layout: {
          height: 400,
          width: 500,
          margin: { "t": 40, "b": 40, "l": 40, "r": 40 },
          showlegend: false,
          paper_bgcolor: "white",
          plot_bgcolor: "white",
          font: { color: "black" }
        },

      }
    } else {
      this.state = {

        hola: [],
        y: this.props.headers,
        layout: {
          height: 450,
          width: 500,
          margin: { "t": 60, "b": 60, "l": 80, "r": 60 },
          showlegend: false,
          paper_bgcolor: "white",
          plot_bgcolor: "white",
          font: { color: "black" }
        },

      }
    }

  }

  render() {
    return (
      <div className="App">

        <h3 style={{ color: "black", marginBottom: '0vh' }}>Importancia de Atributos</h3>
        <Plot
          data={[
            {
              type: "bar",
              x: this.props.x,
              y: this.state.y,
              automargin: true,
              orientation: 'h',
              marker: {
                color: 'rgba(50,171,96,0.6)',
                line: {
                  color: '#315E20',
                  width: 1
                }
              },
            },
          ]}
          graphDiv="graph"
          layout={this.state.layout}
          config={{ 'displayModeBar': false }}
        />
      </div>
    );

  }

}

export default LateralBarDiagramProperties;