import { useEffect, useState, useRef } from "react";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

function ObservationLinePlot({ explanations, currentlyHoveredTimestep, setCurrentlyHoveredTimestep, currentlyClickedTimestep, observation_variables_labels, normalizeState }) {
  const [series, setSeries] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const data = [];
    const ordered_keys = Object.keys(observation_variables_labels).sort((a, b) => a.localeCompare(b));
    for (let i = 0; i < ordered_keys.length; i++) {
      const key = ordered_keys[i];
      data.push({
        //visible: false,
        name: observation_variables_labels[key],
        data: []
      })
    }

    for (let i = 0; i < explanations.length; i++) {
      const explanation = explanations[i];
      for (let i = 0; i < ordered_keys.length; i++) {
        const key = ordered_keys[i];
        if (normalizeState)
          data[i].data.push([explanation.timestep, explanation.current_normalized_state[key]]);
        else
          data[i].data.push([explanation.timestep, explanation.current_state[key]]);
      }
    }
    setSeries(data);
  }, [explanations, observation_variables_labels, normalizeState]);

  const options = {
    title: {
      text: ''
    },
    legend: {
      width: 1600,
    },
    xAxis: {
      minPadding: 0,
      maxPadding: 0,
      labels: {
        enabled: false
      },
      plotLines: [{
        color: '#C3CBD8',
        width: 3,
        value: currentlyHoveredTimestep,
      }, {
        color: '#9CA3AF',
        width: 3,
        value: currentlyClickedTimestep,
      }]
    },
    yAxis: {
      visible: false,
    },
    credits: false,
    series: series,
    plotOptions: {
      series: {
        tooltip: {
          valueDecimals: 4
        },
        stickyTracking: true,
        point: {
          events: {
            mouseOver: (e) => {
              setCurrentlyHoveredTimestep(e.target.category);
            }
          }
        }
      },
      columnrange: {
        grouping: false
      }
    },
  }

  const alignLegend = () => {
    if (chartRef.current !== null) {
      chartRef.current.chart.legend.options.x = (window.innerWidth - chartRef.current.chart.legend.itemX) / 2 + window.scrollX - (chartRef.current.chart.chartWidth / 2 - chartRef.current.chart.legend.itemX / 2);
      chartRef.current.chart.legend.render();
    }
  }

  useEffect(() => {
    var timer = setTimeout(() => {
      console.log("hi")
      chartRef.current.chart.reflow();
      alignLegend();
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [explanations, normalizeState]);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      alignLegend();
    });
  }, []);

  return (
    <div>
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
}

export default ObservationLinePlot;
