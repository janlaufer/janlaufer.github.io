import { useEffect, useState } from "react";
import ReactTooltip from 'react-tooltip';

function ImportantActionPane({ explanations, depth, rewardColors, currentlyHoveredTimestep, setCurrentlyHoveredTimestep, currentlyClickedTimestep, setCurrentlyClickedTimestep }) {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    const actionElements = [];
    for (let i = 0; i < explanations.length; i++) {
      const explanation = explanations[i];
      var classes = '';
      var bgColor = '';
      if (!explanation.is_greedy_action || explanation.contrastive_important_actions_explanations.length < depth) {
        // render placeholder
        classes = "flex justify-center items-center even-size p-2";
        if (i > 0 && explanations[i - 1].is_greedy_action && explanations[i - 1].contrastive_important_actions_explanations.length >= depth)
          classes += " border-black border-l-2";

        actionElements.push(<div key={explanation.timestep} className={classes}></div>)
      } else {
        const ciae = explanation.contrastive_important_actions_explanations[depth - 1];
        classes = "flex justify-center items-center even-size border-2 border-t-0 border-r-0 cursor-pointer border-black p-2 "

        if (currentlyHoveredTimestep === explanation.timestep || currentlyClickedTimestep === explanation.timestep)
          bgColor = rewardColors[ciae[0]][1];
        else
          bgColor = rewardColors[ciae[0]][0];

        if (i === explanations.length - 1)
          classes += " border-r-2";

        actionElements.push(
          <div
            data-tip
            data-border
            data-class='action-tooltip'
            data-border-color='black'
            data-text-color='white'
            data-delay-show='250'
            data-background-color={rewardColors[ciae[0]][1]}
            data-for={'tooltip-' + depth.toString() + '-' + explanation.timestep.toString()}
            key={explanation.timestep}
            className={classes}
            style={{ backgroundColor: bgColor, color: 'white' }}
            onMouseEnter={() => setCurrentlyHoveredTimestep(explanation.timestep)}
            onMouseLeave={() => {
              if (currentlyHoveredTimestep === explanation.timestep)
                setCurrentlyHoveredTimestep(null);
            }}
            onClick={() => {
              if (currentlyClickedTimestep !== explanation.timestep) setCurrentlyClickedTimestep(explanation.timestep);
              else setCurrentlyClickedTimestep(null);
            }}>
            <p className="text-center m-auto">{ciae[1]}</p>
            <ReactTooltip id={'tooltip-' + depth.toString() + '-' + explanation.timestep.toString()} aria-haspopup='true' place='left'>
              <span className="text-base" style={{whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{__html: ciae[2]}} />
            </ReactTooltip>
          </div>
        )
      }
    }
    setActions(actionElements);
  }, [explanations, depth, rewardColors, currentlyHoveredTimestep, setCurrentlyHoveredTimestep, currentlyClickedTimestep, setCurrentlyClickedTimestep])

  return (<div className="flex actions-pane-wrapper">{actions}</div>);
}

export default ImportantActionPane;
