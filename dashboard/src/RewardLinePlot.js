import { useEffect, useState, useRef } from "react";
import Highcharts from 'highcharts'
import highchartsAnnotations from "highcharts/modules/annotations";
import HighchartsReact from 'highcharts-react-official'

highchartsAnnotations(Highcharts);

function RewardLinePlot({ explanations, rewardColors, currentlyHoveredTimestep, setCurrentlyHoveredTimestep, currentlyClickedTimestep, extremaThresholds, rewardChannelLabels }) {
  const [series, setSeries] = useState([]);
  const [minimaAnnotations, setMinimaAnnotations] = useState([]);
  const [maximaAnnotations, setMaximaAnnotations] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const data = [];
    const minAnnotations = [];
    const maxAnnotations = [];
    const ordered_keys = Object.keys(rewardChannelLabels).sort((a, b) => a.localeCompare(b));
    for (let i = 0; i < ordered_keys.length; i++) {
      const key = ordered_keys[i];
      data.push({
        name: rewardChannelLabels[key],
        data: [],
        color: rewardColors[key][0]
      })
    }

    for (let i = 0; i < explanations.length; i++) {
      const explanation = explanations[i];
      for (let i = 0; i < ordered_keys.length; i++) {
        const key = ordered_keys[i];
        data[i].data.push({
          x: explanation.timestep,
          y: explanation.last_rewards[key],
          id: key + (explanation.timestep).toString()
        });
        
        const isMin = explanation.current_state_value[key] + extremaThresholds[key] < explanation.min_next_state_value[key];
        if (isMin) {
          minAnnotations.push({
            point: key + (explanation.timestep).toString(),
            text: 'Minimum' 
          });
        }

        const isMax = explanation.current_state_value[key] > extremaThresholds[key] + explanation.max_next_state_value[key];
        if (!isMin && isMax) {
          maxAnnotations.push({
            point: key + (explanation.timestep).toString(),
            text: 'Maximum' 
          });
        }
      }
    }

    setSeries(data);
    setMinimaAnnotations(minAnnotations);
    setMaximaAnnotations(maxAnnotations);
  }, [explanations, rewardColors, extremaThresholds, rewardChannelLabels]);

  const options = {
    annotations: [{
      draggable: '',
      labelOptions: {
          backgroundColor: '#E5E7EB',
          verticalAlign: 'top',
          y: 11
      },
      labels: minimaAnnotations,
    }, {
      draggable: '',
      labelOptions: {
          backgroundColor: '#E5E7EB',
          verticalAlign: 'bottom',
          y: -11
      },
      labels: maximaAnnotations, 
    }],
    title: {
      text: ''
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
      chartRef.current.chart.reflow();
      alignLegend();
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [explanations]);

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

export default RewardLinePlot;
