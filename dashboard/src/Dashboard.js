import React, { useEffect, useState, useRef, useCallback } from 'react';
import useInterval from '@use-it/interval';
import ActionPane from './ActionPane';
import ImportantActionPane from './ImportantActionPane';
import ObservationLinePlot from './ObservationLinePlot';
import RewardLinePlot from './RewardLinePlot';
import RelativeDominancePlot from './RelativeDominancePlot';
import AbsoluteDominancePlot from './AbsoluteDominancePlot';
import { useDropzone } from 'react-dropzone';

// mapping to remove coupling between frontend and backend, e.g. to set different language
const observation_variables_labels = {
  'basic_response_time': 'Basic Response Time',
  'opt_response_time': 'Opt Response Time',
  'basic_throughput': 'Basic Throughput',
  'opt_throughput': 'Opt Throughput',
  'avg_response_time': 'Avg Response Time',
  'utilization': 'Utilization',
  'current_dimmer': 'Current Dimmer',
  'active_servers': 'Active Servers',
  // 'max_servers': 'Max Servers',
  'is_booting': 'Is Booting',
  //'boot_remaining': 'Boot Remaining',
  'request_arrival_mean': 'Request Arrival Mean',
  'request_arrival_moving_mean': 'Request Arrival Moving Mean',
  //'request_arrival_variance': 'Request Arrival Variance',
  'request_arrival_moving_variance': 'Request Arrival Moving Variance',
  //'low_fidelity_service_time': 'Low Fidelity Service Time',
  //'low_fidelity_service_time_variance': 'Low Fidelity Service Time Variance',
  //'service_time': 'Service Time',
  //'service_time_variance': 'Service Time Variance',
  // 'server_threads': 'Server Threads'
}

const reward_channel_labels = {
  'Running Costs': 'Running Costs',
  'Revenue': 'Revenue',
  'User Satisfaction': 'User Satisfaction'
}

const action_semantic_labels = {
  'No Operation': 'No Operation',
  'Increase Dimmer': 'Increase Dimmer',
  'Decrease Dimmer': 'Decrease Dimmer',
  'Add Server': 'Add Server',
  'Remove Server': 'Remove Server'
}

const rewardColors = {
  'Running Costs': ['#DDAA33', '#C1932E'],
  'Revenue': ['#BB5566', '#A04958'],
  'User Satisfaction': ['#0056AD', '#004891'],
};

function Dashboard() {
  const [explanations, setExplanations] = useState([]);
  const [refreshExplanations, setRefreshExplanations] = useState(true);
  const [currentlyHoveredTimestep, setCurrentlyHoveredTimestep] = useState(null);
  const [currentlyClickedTimestep, setCurrentlyClickedTimestep] = useState(null);
  const [extremaThresholdFields, setExtremaThresholdFields] = useState({
    'Running Costs': 0.1,
    'Revenue': 0.1,
    'User Satisfaction': 0.1
  });
  const [extremaThresholds, setExtremaThresholds] = useState({
    'Running Costs': 0.1,
    'Revenue': 0.1,
    'User Satisfaction': 0.1
  });
  const [normalizeState, setNormalizeState] = useState(true);
  const dominancePlotsRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('Reading of file was aborted!');
      reader.onerror = () => console.log('Could not read file!');
      reader.onload = () => {
        const loadedExplanations = JSON.parse(reader.result);
        setRefreshExplanations(false);
        setExplanations(loadedExplanations);
      }
      reader.readAsText(file);
    })
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop: onDrop, noClick: true });

  const fetchExplanations = useCallback(() => {
    let url = process.env.PUBLIC_URL + '/data/explanations.json'
    fetch(url)
      .then(res => res.json())
      .then(newExplanations => {
        if (refreshExplanations) {
          if (explanations.length === 0 || explanations[explanations.length - 1].timestep !== newExplanations[newExplanations.length - 1].timestep)
            setExplanations(newExplanations)
        }
      })
      .catch(err => console.log(err));
  }, [explanations, refreshExplanations]);

  useEffect(() => fetchExplanations(), [fetchExplanations]);  // fetch once on startup
  useInterval(() => {
    if (currentlyClickedTimestep === null && refreshExplanations)
      fetchExplanations();
  }, 1000);

  useEffect(() => {
    if (currentlyClickedTimestep !== null)
      dominancePlotsRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [currentlyClickedTimestep]);

  const thresholdInputs = [];
  Object.entries(extremaThresholdFields).forEach(([key, value]) => {
    thresholdInputs.push(
      <div key={key} className='flex mx-2 items-center'>
        <p className='mr-2'>{reward_channel_labels[key] + ':'}</p>
        <input
          type='number'
          min='0'
          step='0.01'
          className='w-16 border rounded-md pl-2'
          value={value}
          onChange={e => setExtremaThresholdFields(prev => ({
            ...prev,
            [key]: parseFloat(e.target.value)
          }))}
        />
      </div>
    );
  })
  thresholdInputs.push(
    <input
      key='refresh-btn'
      type='button'
      value='Refresh'
      className='px-2 ml-2 rounded-md'
      onClick={() => setExtremaThresholds(extremaThresholdFields)}
    />
  )

  return (
    <div {...getRootProps()}>
      <div className="line-plot-container">
        <ObservationLinePlot
          explanations={explanations}
          currentlyHoveredTimestep={currentlyHoveredTimestep}
          setCurrentlyHoveredTimestep={setCurrentlyHoveredTimestep}
          currentlyClickedTimestep={currentlyClickedTimestep}
          observation_variables_labels={observation_variables_labels}
          normalizeState={normalizeState}
        />
        <RewardLinePlot
          explanations={explanations}
          rewardColors={rewardColors}
          currentlyHoveredTimestep={currentlyHoveredTimestep}
          setCurrentlyHoveredTimestep={setCurrentlyHoveredTimestep}
          currentlyClickedTimestep={currentlyClickedTimestep}
          extremaThresholds={extremaThresholds}
          rewardChannelLabels={reward_channel_labels}
        />
      </div>
      <ActionPane
        explanations={explanations}
        currentlyHoveredTimestep={currentlyHoveredTimestep}
        setCurrentlyHoveredTimestep={setCurrentlyHoveredTimestep}
        currentlyClickedTimestep={currentlyClickedTimestep}
        setCurrentlyClickedTimestep={setCurrentlyClickedTimestep}
      />
      <ImportantActionPane
        explanations={explanations}
        depth={1}
        rewardColors={rewardColors}
        currentlyHoveredTimestep={currentlyHoveredTimestep}
        setCurrentlyHoveredTimestep={setCurrentlyHoveredTimestep}
        currentlyClickedTimestep={currentlyClickedTimestep}
        setCurrentlyClickedTimestep={setCurrentlyClickedTimestep}
      />
      <ImportantActionPane
        explanations={explanations}
        depth={2}
        rewardColors={rewardColors}
        currentlyHoveredTimestep={currentlyHoveredTimestep}
        setCurrentlyHoveredTimestep={setCurrentlyHoveredTimestep}
        currentlyClickedTimestep={currentlyClickedTimestep}
        setCurrentlyClickedTimestep={setCurrentlyClickedTimestep}
      />
      <div className='flex mt-5' ref={dominancePlotsRef}>
        <div className='dominance-plot'>
          <AbsoluteDominancePlot
            explanations={explanations}
            rewardColors={rewardColors}
            currentlyClickedTimestep={currentlyClickedTimestep}
            reward_channel_labels={reward_channel_labels}
            action_semantic_labels={action_semantic_labels}
          />
        </div>
        <div className='dominance-plot' style={{ left: '50vw' }}>
          <RelativeDominancePlot
            explanations={explanations}
            rewardColors={rewardColors}
            currentlyClickedTimestep={currentlyClickedTimestep}
            reward_channel_labels={reward_channel_labels}
            action_semantic_labels={action_semantic_labels}
          />
        </div>
      </div>
      <div className='flex justify-start border py-2'>
        <input {...getInputProps()} style={{ display: 'block' }} />
        {thresholdInputs}
        <div className='flex ml-32 items-center'>
          <p className='mr-2'>{'Normalize State: '}</p>
          <input
            type='checkbox'
            className='w-16 border rounded-md pl-2'
            value={normalizeState}
            checked={normalizeState}
            onChange={e => {
              setNormalizeState(e.target.checked);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
