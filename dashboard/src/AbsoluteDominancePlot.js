import { useEffect, useState } from "react";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


function AbsoluteDominancePlot({ explanations, rewardColors, currentlyClickedTimestep, action_semantic_labels, reward_channel_labels }) {
  const [chartOptions, setChartOptions] = useState({ title: { text: '' }, credits: false, plotOptions: { visible: false } });

  useEffect(() => {
    if (currentlyClickedTimestep === null)
      return;

    const ordered_action_semantic_keys = [  // alphabetic order is useless here
      'No Operation',
      'Increase Dimmer',
      'Decrease Dimmer',
      'Add Server',
      'Remove Server'
    ];
    const order_action_labels = [
      action_semantic_labels['No Operation'],
      action_semantic_labels['Increase Dimmer'],
      action_semantic_labels['Decrease Dimmer'],
      action_semantic_labels['Add Server'],
      action_semantic_labels['Remove Server']
    ]
    const ordered_reward_channel_keys = Object.keys(reward_channel_labels).sort((a, b) => a.localeCompare(b));
    const data = [];
    for (let i = 0; i < ordered_reward_channel_keys.length; i++) {
      const key = ordered_reward_channel_keys[i];
      data.push({
        color: rewardColors[key][0],
        name: reward_channel_labels[key],
        data: []
      })
    }

    for (let i = 0; i < explanations.length; i++) {
      const explanation = explanations[i];

      if (currentlyClickedTimestep !== explanation.timestep)
        continue;

      for (let j = 0; j < ordered_action_semantic_keys.length; j++) {
        const action_key = ordered_action_semantic_keys[j];
        for (let k = 0; k < ordered_reward_channel_keys.length; k++) {
          const reward_key = ordered_reward_channel_keys[k];
          data[k].data.push(explanation.absolute_reward_channel_dominance[action_key][reward_key]);
        }
      }
    }

    var options = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Absolute Reward Channel Dominance'
      },
      xAxis: {
        categories: order_action_labels,
        labels: {
          style: {
            color: 'black'
          }
        }
      },
      yAxis: {
        plotLines: [{
          color: 'black',
          width: 2,
          value: 0,
          zIndex: 5
        }],
        title: {
          text: 'Action Value'
        },
        stackLabels: {
          enabled: false,
          style: {
            fontWeight: 'bold',
            color: 'gray'
          },
          formatter: function () {
            return Math.round(this.total * 100) / 100;
          }
        }
      },
      plotOptions: {
        column: {
          tooltip: {
            valueDecimals: 2
          },
          stacking: 'normal',
          borderWidth: 1,
          borderColor: 'black'
        }
      },
      series: data
    };
    setChartOptions(options);
  }, [explanations, currentlyClickedTimestep, rewardColors, action_semantic_labels, reward_channel_labels]);

  return (
    <div style={{ display: currentlyClickedTimestep == null ? 'none' : 'block' }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
      />
    </div>
  );
}

export default AbsoluteDominancePlot;
