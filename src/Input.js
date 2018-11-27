import PropTypes from "prop-types";
import React from "react";

/**
 * Input form to get game settings
 * @param {Object} props Provides a handler for input change and submit, as well as the current width, height, and number of mines
 * @returns {Component} The rendered input form
 */
export function Input({handleInputChange, handleSubmit, height, numMines, width}) {
    // const {handleInputChange, handleSubmit, height, numMines, width} = this.props;
    return (
        <form onSubmit={handleSubmit.bind(this)}>
            {/* input for width of board */}
            <label>Board width <input
                // make it a numeric input
                type="number"
                // need at least 1 wide board
                min={1}
                // don't make it too wide or weird wrapping happens
                // max={Math.floor((window.innerWidth / 25) - 6)}
                // initially set to whatever the width was
                value={width}
                onChange={handleInputChange.bind(this, "width")} />
            </label>
            {/* input for height of board */}
            <label>Board height <input
                // make it a numeric input
                type="number"
                // need at least 1 tall board
                min={1}
                // initially set to whatever the height was
                value={height}
                onChange={handleInputChange.bind(this, "height")}
            />
            </label>
            {/* input for number of mines */}
            <label>Number of mines <input
                // make it a numeric input
                type="number"
                // need at least 1 mine
                min={1}
                // must have at least 1 non-mine
                max={(width * height) - 1}
                // initially set to whatever the number of mines was
                value={numMines}
                onChange={handleInputChange.bind(this, "numMines")} />
            </label>
            {/* button to start playing */}
            <input type="submit" value="Play!" />
        </form>
    );
}

Input.propTypes = {
    "handleInputChange": PropTypes.func.isRequired,
    "handleSubmit": PropTypes.func.isRequired,
    "height": PropTypes.number.isRequired,
    "numMines": PropTypes.number.isRequired,
    "width": PropTypes.number.isRequired,
};
