import React from "react";
import Plotly from 'plotly.js-dist';
import Button from '@material-ui/core/Button';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);


class BarDiagramSol extends React.Component {
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
        plot_bgcolor: this.props.colorb,
        paper_bgcolor: this.props.colorb,
        font: { color: "black" },
        datarevision: 0,
        width: this.props.tamw,
        height: this.props.tamh,
        margin: { "t": this.props.mar, "b": this.props.mar, "l": this.props.mar, "r": this.props.mar },
      },
    }
  }
  render() {
    return (
      <div className="App">
        <div>
          <Plot
            data={[this.state.line1]}
            graphDiv="graph"
            layout={this.state.layout}
            config={{ 'displayModeBar': false }}
          />
        </div>
      </div>
    );

  }

}

export default BarDiagramSol;