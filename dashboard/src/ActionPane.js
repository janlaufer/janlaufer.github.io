import { useEffect, useState } from "react";

function ActionPane({ explanations, currentlyHoveredTimestep, setCurrentlyHoveredTimestep, currentlyClickedTimestep, setCurrentlyClickedTimestep }) {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    const actionElements = [];
    for (let i = 0; i < explanations.length; i++) {
      const explanation = explanations[i];

      var classes = "flex text-white justify-center items-center even-size border-2 border-r-0 cursor-pointer border-black p-2"
      if (currentlyHoveredTimestep === explanation.timestep || currentlyClickedTimestep === explanation.timestep)
        classes += ' bg-gray-500';
      else
        classes += ' bg-gray-400';

      if (i === explanations.length - 1)
        classes += " border-r-2"

      actionElements.push(
        <div
          key={explanation.timestep}
          className={classes}
          onMouseEnter={() => setCurrentlyHoveredTimestep(explanation.timestep)}
          onMouseLeave={() => {
            if (currentlyHoveredTimestep === explanation.timestep)
              setCurrentlyHoveredTimestep(null);
          }}
          onClick={() => {
            if (currentlyClickedTimestep !== explanation.timestep) setCurrentlyClickedTimestep(explanation.timestep);
            else setCurrentlyClickedTimestep(null);
          }}>
          <p className="text-center m-auto">{explanation.current_selected_action}</p>
        </div>
      )
      setActions(actionElements);
    }
  }, [explanations, currentlyHoveredTimestep, setCurrentlyHoveredTimestep, currentlyClickedTimestep, setCurrentlyClickedTimestep]);

  return (<div className="flex actions-pane-wrapper">{actions}</div>);
}

export default ActionPane;
