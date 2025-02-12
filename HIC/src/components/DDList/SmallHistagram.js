import React from "react";
import Plotly from 'plotly.js-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);


class SmallHistogram extends React.Component {
  constructor(props) {
    super(props)
  }
 
  render() {
    return (
      <div className="App">         
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
          layout={{ 
            xaxis:{
                fixedrange: true,
                color:"black",
                range: [this.props.min, this.props.max]
            },
            yaxis:{
                fixedrange: true,
                color:"black"
            },
            datarevision: 0,
            width: 400,
            height: 350,
            margin: {
                l: 40,
                r: 40,
                b: 40,
                t: 40
            }, 
            plot_bgcolor:"white",
            paper_bgcolor:"white",
            font: {color:"black"},
            title: false
          }}
          config={{'displayModeBar': false}}
      />
      </div>
    );
  }
}

export default SmallHistogram;