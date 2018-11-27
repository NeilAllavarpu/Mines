import {MINE} from "./constants.json";
import PropTypes from "prop-types";
import React from "react";

/**
 * Renders a mine based on its current status
 * @param {Object} props Contains a mine with its state (hidden, revealed, or marked), number of mines near it, a click handler + right click handler, and any potential custom classes
 * @returns {JSX} The rendered mine
 */
export function Mine({mine, handleClick, handleRightClick}) {
    // CSS classes of the mine
    let classes = `mine ${mine.customClasses}`,
        // text to show on the mine
        labelText = null;
    // if the mine is revealed
    if (mine.state === MINE.REVEALED) {
        // if it is a mine
        if (mine.isMine === true) {
            // style it as a mine
            classes += " mineLoss";
            // revealed mines show a X
            labelText = "X";
        } else {
            // not a mine, style it based on number of nearby mines
            classes += ` mineNum${mine.minesNear}`;
            // don't show 0 on squares
            if (mine.minesNear !== 0) {
                // any other number of nearby mines should be displayed
                labelText = mine.minesNear;
            }
        }
    } else if (mine.state === MINE.MARKED) {
        // marked squares show a !
        labelText = "!";
    }
    return (
        <div
            // set the computed classes
            className={classes}
            // set up the click handler
            onClick={handleClick}
            // set up the right click handler
            onContextMenu={handleRightClick}>
            {/* show the computed text */}
            <div className="label">{labelText}</div>
        </div>
    );
}

Mine.propTypes = {
    "handleClick": PropTypes.func.isRequired,
    "handleRightClick": PropTypes.func.isRequired,
    "mine": PropTypes.object.isRequired,
};
