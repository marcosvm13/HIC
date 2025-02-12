import React from "react";
import Plotly from 'plotly.js-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


class Histogram extends React.Component {
  constructor(props) {
    super(props)


    this.state = {

      hola: [],

      layout: {
        xaxis: {
          fixedrange: true,
          color: "black"
        },
        yaxis: {
          fixedrange: true,
          color: "black"
        },
        datarevision: 0,
        width: this.props.tamw,
        height: this.props.tamh,
        margin: {
          l: this.props.mar,
          r: this.props.mar,
          b: this.props.mar,
          t: this.props.mar
        },
        plot_bgcolor: "white",
        paper_bgcolor: "white",
        font: { color: "black" },
        title: false
      },

    }


  }

  render() {
    return (
      <div className="App">

        <h3 style={{ color: this.props.titleColor, marginBottom: this.props.mb }}>Histograma</h3>
        <Plot
          data={[
            {
              x: this.props.x,
              type: 'histogram',
              marker: {
                color: '#FF8F00'
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

export default Histogram;