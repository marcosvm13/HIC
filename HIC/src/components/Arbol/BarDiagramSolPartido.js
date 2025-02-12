import React from "react";
import Plotly from 'plotly.js-dist';
import Button from '@material-ui/core/Button';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);


class BarDiagramSolPartido extends React.Component {
  /*props:{
    x,
    y
}*/

  constructor(props) {
    super(props)



    this.state = {

      line1: {
        type: "bar",
        y: this.props.y1,
        x: this.props.x1,
        marker: { color: this.props.color1 },
        name: "Izq (" + this.props.sum1 + " elementos)",

      },
      line2: {
        type: "bar",
        y: this.props.y2,
        x: this.props.x2,
        marker: { color: this.props.color2 },
        name: "Der (" + this.props.sum2 + " elementos)",

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

        plot_bgcolor: this.props.colorb,
        paper_bgcolor: this.props.colorb,
        font: { color: "black" },
        datarevision: 0,
        width: this.props.tamw,
        height: this.props.tamh,
        margin: { "t": this.props.mar, "b": this.props.mar, "l": this.props.mar, "r": this.props.mar },
        barmode: 'stack',
      },

    }


  }


  render() {
    return (
      <div className="App">

        <h3 style={{ color: "black", marginBottom: '0vh' }}>Partición</h3>
        <Plot

          data={[
            this.state.line1, this.state.line2]}
          graphDiv="graph"
          layout={this.state.layout}
          config={{ 'displayModeBar': false }}

        />


      </div>
    );

  }

}

export default BarDiagramSolPartido;