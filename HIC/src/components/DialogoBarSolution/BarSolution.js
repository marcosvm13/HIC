import React from "react";
import Plotly from 'plotly.js-dist';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);


class BarSolution extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      line1: {
        type: "bar",
        y: this.props.y,
        x: this.props.x,
        marker: { color: this.props.color },
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
        title: {
          text: "Número de Casos: " + this.props.sum
        },
        plot_bgcolor: "white",
        paper_bgcolor: "white",
        font: { color: "black" },
        datarevision: 0,
        width: this.props.tam,
        height: this.props.tam,
        margin: { "t": 50, "b": 50, "l": 50, "r": 50 },
      },
    }
  }

  render() {
    return (
      <div className="App">
        <div>
          <Plot
            data={[
              this.state.line1]}
            graphDiv="graph"
            layout={this.state.layout}
            config={{ 'displayModeBar': false }}
          />
        </div>
      </div>
    );
  }
}

export default BarSolution;