import {GAME, MINE} from "./constants.json";
import {Mine} from "./Mine.js";
import PropTypes from "prop-types";
import React from "react";
import {Timer} from "./Timer.js";

const pct = 100;

export class Board extends React.Component {
    constructor(props) {
        super(props);
        // array to store the generated mines
        let mines = [];
        // ref for the timer so that we can resume it after pause
        this.timer = React.createRef();
        // number of marked squares
        this.markedNum = 0;
        // create HEIGHT inner arrays (rows)
        for (let i = 0; i < props.height; ++i) {
            mines.push([]);
            // create WIDTH mine states per row (columns)
            for (let j = 0; j < props.width; ++j) {
                mines[i].push({
                    // no custom CSS for mines currently
                    "customClasses": "",
                    // will be set later
                    "isMine": false,
                    // will be set later
                    "minesNear": 0,
                    // should start out hidden
                    "state": MINE.HIDDEN,
                });
            }
        }
        // a click has not yet happened
        this.firstClick = true;
        this.state = {
            // set mines to our (empty) 2-D array
            mines,
        };
    }

    /**
     * Get all the adjacent coordinates of a specified mine
     * @param {Number} mineX X-coordinate of the mine
     * @param {Number} mineY Y-coordinate of the mine
     * @returns {Array} A 2-D array containing adjacent coordinate pairs
     */
    getMinesToTest(mineX, mineY) {
        // 3-line comments refer to the position of the mine to add
        // where the x indicates the location of the specified
        // and the * indicates the adjacent mine

        // array to store nearby mines
        let mines = [];
        // if we aren't on the left edge
        if (mineX > 0) {
            // if we aren't at the top edge
            if (mineY > 0) {
                // - -
                // - x -
                // - - -
                mines.push([mineX - 1, mineY - 1]);
            }
            // - - -
            // x -
            // - - -
            mines.push([mineX - 1, mineY]);
            // if we aren't on the bottom edge
            if (mineY < this.props.height - 1) {
                // - - -
                // - x -
                // - -
                mines.push([mineX - 1, mineY + 1]);
            }
        }
        // if we aren't at the top edge
        if (mineY > 0) {
            // - * -
            // - x -
            // - - -
            mines.push([mineX, mineY - 1]);
        }
        // if we aren't on the bottom edge
        if (mineY < this.props.height - 1) {
            // - - -
            // - x -
            // - * -
            mines.push([mineX, mineY + 1]);
        }
        // if we aren't on the right edge
        if (mineX < this.props.width - 1) {
            // if we aren't at the top edge
            if (mineY > 0) {
                // - - *
                // - x -
                // - - -
                mines.push([mineX + 1, mineY - 1]);
            }
            // - - -
            // - x *
            // - - -
            mines.push([mineX + 1, mineY]);
            // if we aren't on the bottom edge
            if (mineY < this.props.height - 1) {
                // - - -
                // - x -
                // - - *
                mines.push([mineX + 1, mineY + 1]);
            }
        }
        // return our 2-D array of coordinates
        return mines;
    }

    /**
     * Reveal all mines near a target mine recursively
     * @param {Array} mines 2-D array containing the status of all mines
     * @param {Number} mineX X-coordiante of the initially revealed mine
     * @param {Number} mineY Y-coordiante of the initially revealed mine
     * @returns {Object} Contains mines, the updated 2-D mines array, and a mine indicating any if tripped, or null if not
     */
    revealNear(mines, mineX, mineY) {
        let mineRevealed = false,
            newMines = [...mines];
        // get the mines that should be checked
        const minesToTest = this.getMinesToTest(mineX, mineY),
            // count up all the number of nearby marked squares
            numMarkedNear = minesToTest.reduce((numMines, coords) => {
                if (mines[coords[1]][coords[0]].state === MINE.MARKED) {
                    return numMines + 1;
                } else {
                    return numMines;
                }
            }, 0);
        // if there are as many marked nearby squares as there are nearby mines, begin the reveal
        if (newMines[mineY][mineX].minesNear === numMarkedNear) {
            minesToTest.forEach((coords) => {
                let mine = newMines[coords[1]][coords[0]];
                if (mine.state === MINE.MARKED && !mine.isMine) {
                    mineRevealed = true;
                    mine.customClasses = "mineLossAutoClick";
                    mineRevealed = mine;
                }
            });
            // for each mine to test
            if (mineRevealed === false) {
                minesToTest.forEach((coords) => {
                    if (mineRevealed === false) {
                        // get the mine associated with that coordiante
                        let mine = mines[coords[1]][coords[0]];
                        // if the mine is still hidden
                        if (mine.state === MINE.HIDDEN) {
                            // reveal it
                            mine.state = MINE.REVEALED;
                            // if we tripped a mine
                            if (mine.isMine) {
                                mineRevealed = coords;
                                // indicate that the mine was autotripped
                                mine.customClasses = "mineLossAutoClick";
                            } else {
                                // recursively call the reveal function, using the coordinates of the newly revealed mine
                                const temp = this.revealNear(newMines, coords[0], coords[1]);
                                // if we didn't trip any mines
                                ({mineRevealed} = temp);
                                if (mineRevealed === false) {
                                    // update the state of the board
                                    newMines = temp.mines;
                                }
                            }
                        }
                    }
                }, this);
            }
        }
        // return the mines and any tripped mine, if applicable
        return {
            mineRevealed,
            mines,
        };
    }

    /**
     * Calculate how many non-mine squares are unrevealed
     * @param {Array} mines 2-D array of mines to search through
     * @returns {Number} The number of unrevealed non-mine squares
     */
    static validSquaresLeft(mines) {
        // count up all the hidden non-mine squares remaining of all rows
        return mines.reduce((numMines, mineRow) => numMines + mineRow.reduce((rowTotal, mine) => {
            if (mine.state === MINE.HIDDEN && mine.isMine === false) {
                return rowTotal + 1;
            } else {
                return rowTotal;
            }
        }, 0), 0);
    }

    triggerLoss() {
        this.setState((prevState) => ({
            // for each square on the board
            "mines": prevState.mines.map((row) => row.map((element) => {
                // shallow copy the square
                let square = {...element};
                if (square.isMine === false && square.state === MINE.MARKED) {
                    square.customClasses += " falseMark";
                }
                // mark the clicked mine specially
                if (square.state === MINE.HIDDEN) {
                    // any untouched mines are grayed out
                    square.customClasses += " after";
                }
                if (square.isMine === false || square.state === MINE.HIDDEN) {
                    square.state = MINE.REVEALED;
                }
                return square;
            })),
        }));
    }

    // handler for when a mine is clicked
    handleClick(clickX, clickY) {
        let {mines} = this.state;
        // if this is the first click
        if (this.firstClick === true) {
            // generate the mines to ensure a protected first click
            this.setState((prevState) => {
                // get all the coordinates
                let possibilities = [];
                for (let i = 0; i < prevState.mines.length; ++i) {
                    for (let j = 0; j < prevState.mines[i].length; ++j) {
                        // but don't add the clicked coordinate as a possible mine
                        if (!(j === clickX && i === clickY)) {
                            possibilities.push([j, i]);
                        }
                    }
                }
                // generate the desired number of mines
                for (let i = 0; i < this.props.numMines; ++i) {
                    // get a random index that isn't the clicked coordinate or already a mine
                    const index = Math.floor(Math.random() * possibilities.length),
                        // get the coordinates of that index
                        coord = possibilities[index];
                    // make sure we don't re-pick that for the next mine
                    possibilities.splice(index, 1);
                    // set that square to be a mine
                    prevState.mines[coord[1]][coord[0]].isMine = true;
                    // for each adjacent square
                    this.getMinesToTest(coord[0], coord[1])
                        .forEach((coords) => {
                            // increment the amount of nearby mines that it has
                            ++prevState.mines[coords[1]][coords[0]].minesNear;
                        });
                }
                // set our mines
                return {
                    "mines": prevState.mines,
                };
            }, () => {
                // click has already happened, don't repeat this
                this.firstClick = false;
                // do the revealing for that square
                this.handleClick(clickX, clickY);
            });
        } else if (this.props.playing === GAME.IN_PROGRESS &&
            this.state.mines[clickY][clickX].state !== MINE.MARKED) {
            // if the game is going on and the mine isn't marked, perform a click
            mines[clickY][clickX].state = MINE.REVEALED;
            // if a mine was clicked
            if (mines[clickY][clickX].isMine) {
                this.props.updateState({
                    // set the game to a losss
                    "playing": GAME.LOSS,
                });
                // specially mark the clicked mine
                mines[clickY][clickX].customClasses += " mineLossClick";
                this.setState({
                    // update the mines
                    mines,
                    // then trigger a loss
                }, this.triggerLoss);
            } else {
                // wasn't a mine, reveal all nearby squares based on marked squares
                let temp = this.revealNear(mines, clickX, clickY);
                // if a mine got tripped
                if (temp.mineRevealed === true) {
                    this.props.updateState({
                        "playing": GAME.LOSS,
                    });
                    this.triggerLoss();
                } else if (Board.validSquaresLeft(temp.mines) === 0) {
                    // if nothing is left, victory!
                    this.props.updateState({
                        "playing": GAME.WIN,
                    });
                    this.setState({
                        // for each of the squares
                        "mines": temp.mines.map((mineRow) => mineRow.map((element) => {
                            let mine = element;
                            // if it was a mine, mark it (but don't actually make it an X)
                            if (mine.isMine === true) {
                                mine.state = MINE.MARKED;
                            }
                            return mine;
                        })),
                    });
                } else {
                    // nothing got tripped, continue play with the revealed mine(s)
                    this.setState({
                        "mines": temp.mines,
                    });
                }
            }
        }
    }

    // handler for when a mine is right clicked
    handleRightClick(clickX, clickY) {
        if (this.props.playing === GAME.IN_PROGRESS) {
            // get the mine that was clicked
            const mine = this.state.mines[clickY][clickX];
            // if it wasn't already revealed
            if (mine.state !== MINE.REVEALED) {
                this.setState((prevState) => {
                    // if it was marked
                    if (mine.state === MINE.MARKED) {
                        // set it to be hidden (unmarked)
                        prevState.mines[clickY][clickX].state = MINE.HIDDEN;
                        // decrement the number of marked mines
                        --this.markedNum;
                    } else {
                        // otherwise set it to be marked
                        prevState.mines[clickY][clickX].state = MINE.MARKED;
                        // and increment the number of marked mines
                        ++this.markedNum;
                    }
                    return {
                        // update the toggled mine
                        "mines": prevState.mines,
                    };
                });
            }
        }
    }

    render() {
        // get relevant info from props
        const {width, height, numMines, playing} = this.props;
        // number of squares revealed of total number of non-mines, as a percentage
        let mainContent, progress;
        if (this.firstClick === true) {
            progress = 0;
        } else {
            progress = pct - (pct * Board.validSquaresLeft(this.state.mines) / ((height * width) - numMines));
        }
        if (playing === GAME.PAUSE) {
            mainContent = (
                // if the game is paused, show the pause screen
                <div>
                    Paused<br />
                    {/* button that will resume the game */}
                    <button onClick={() => {
                        this.props.updateState({
                            "playing": GAME.IN_PROGRESS,
                        });
                        this.timer.resume();
                    }}>
                        Resume
                    </button>
                </div>
            );
        } else {
            let button, status, message, mineSize;
            // while playing, show the blue and green progress bar
            if (playing === GAME.IN_PROGRESS) {
                status = (
                    <div className="status">
                        {/* show the "number of mines left", or 0 if too many are flagged */}
                        <div>Mines Left: {Math.max(this.props.numMines - this.markedNum, 0)}</div>
                        <div>
                            Progress:
                            <div className="bar">
                                <div
                                    // necessary styling for the green inner bar
                                    className="innerBar"
                                    // make it be proportionally sized to the progress
                                    style={{"width": `${progress}%`}}>
                                    {/* display percent progress to the nearest tenth */}
                                    {Math.round(10 * progress) / 10}%
                                </div>
                            </div>
                        </div>
                    </div>
                );
                button = (
                    <button onClick={this.props.updateState.bind(this, {
                        "playing": GAME.PAUSE,
                    })}>Pause</button>
                );
            } else {
                button = (
                    <button onClick={this.props.updateState.bind(this, {
                        "playing": GAME.INPUT,
                    })}>Restart</button>
                );
            }
            if (playing === GAME.WIN) {
                message = <div className="status win">Good job!</div>;
            } else if (playing === GAME.LOSS) {
                message = <div className="status">You lost!</div>;
            }
            if (80 / this.props.width < 80 / this.props.height) {
                mineSize = `${80 / this.props.width}vw`;
            } else {
                mineSize = `${80 / this.props.height}vh`;
            }
            mainContent = (
                <div>
                    {/* main board, dynamically adjust it to be in the middle of the screen */}
                    <div className="board">
                        {/* generate the board of mines */}
                        {this.state.mines.map((mineRow, rowIndex) => (
                            // create a row for each row of mines
                            <div className="row" key={rowIndex}>
                                {/* for each mine in the row */}
                                {mineRow.map((mine, mineIndex) => (
                                    // generate a mine
                                    <Mine
                                        key={mineIndex}
                                        // pass it the current data of the mine
                                        mine={mine}
                                        // pass it the click handler
                                        handleClick={() => {
                                            this.handleClick(mineIndex, rowIndex);
                                        }}
                                        mineSize={mineSize}
                                        // pass it the right click handler
                                        handleRightClick={(event) => {
                                            // make sure to prevent the default right click popup
                                            event.preventDefault();
                                            this.handleRightClick(mineIndex, rowIndex);
                                        }} />
                                ))}
                            </div>
                        ))}
                    </div>
                    {/* helpful info below the board */}
                    {status}
                    {message}
                    {/* if the game ended, offer up a restart */}
                    {button}
                </div>
            );
        }
        return (
            <div>
                {/* timer to show how long the game has been */}
                < Timer
                    // only running while game is playing
                    running={playing === GAME.IN_PROGRESS}
                    // don't show on pause screen
                    display={playing !== GAME.PAUSE}
                    ref={(ref) => {
                        this.timer = ref;
                    }} />
                {mainContent}
            </div >
        );
    }
}

Board.propTypes = {
    "height": PropTypes.number.isRequired,
    "numMines": PropTypes.number.isRequired,
    "playing": PropTypes.bool.isRequired,
    "updateState": PropTypes.func.isRequired,
    "width": PropTypes.number.isRequired,
};
