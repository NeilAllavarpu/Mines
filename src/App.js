import React, {Component} from "react";
import "./App.css";

// various states of the game
const GAME_INPUT = -1;
const GAME_IN_PROGRESS = 0;
const GAME_LOSS = 1;
const GAME_WIN = 2;
const GAME_PAUSE = 3;

// possible states of mines
const MINE_HIDDEN = 0;
const MINE_REVEALED = 1;
const MINE_MARKED = 2;

// timer to tell the player how long their game has been in progress
class Timer extends Component {
    constructor(props) {
        super(props);
        // time to indicate when the timer was started
        this.start = Date.now();
        this.state = {
            // amound of seconds that have passed since starting
            "seconds": 0,
            "last": Date.now(),
        };
        // ask to update the timer (will occur every rendering until stopped)
        requestAnimationFrame(this.updateTimer.bind(this));
    }

    /**
     * Update the number of seconds for the timer
     */
    updateTimer() {
        this.setState((prevState) => {
            // update the number of seconds taht have passed since start
            return {
                "seconds": prevState.seconds + (Date.now() - prevState.last),
                "last": Date.now(),
            };
        }, function() {
            // if we are still running
            if (this.props.running === true) {
                // update the timer again
                requestAnimationFrame(this.updateTimer.bind(this));
            }
        });
    }

    /**
     * Continue the timer after it was stopped
     */
    resume() {
        this.setState({
            // update the last tick timing to prevent a large spike in time
            "last": Date.now(),
        }, function() {
            // begin the updating loop for the timer
            requestAnimationFrame(this.updateTimer.bind(this));
        });
    }

    render() {
        // number of seconds to display on timer
        const seconds = Math.floor(this.state.seconds / 1000);
        return this.props.display ?
            // only show timer if that is wanted
            (<div>
                {/* Format of timer => `Time: minutes:seconds` */}
                Time: {Math.floor(seconds / 60)}:
                {(seconds % 60).toLocaleString(undefined, {"minimumIntegerDigits": 2})}
                {/* if we want to not show timer, just return null */}
            </div>) : null;
    }
}

/**
 * Renders a mine based on its current status
 * @param {Object} props Contains a mine with its state (hidden, revealed, or marked), number of mines near it, a click handler + right click handler, and any potential custom classes
 * @returns {JSX} The rendered mine
 */
function Mine(props) {
    // get the mine from props
    const {mine} = props;
    return (
        <div
            // style it as a square on the board
            // non-revealed mines have no background
            // if a mine is revealed it should flash red and balck
            // otherwise just color it based on the number of mines near it (green for none, red for many)
            className={`mine mineNum${mine.minesNear} ${mine.state !== MINE_REVEALED ? "hidden" : mine.isMine ? "mineLoss" : ""} ${mine.customClasses}`}
            // set up the click handler
            onClick={props.handleClick}
            // set up the right click handler
            onContextMenu={props.handleRightClick}>
            {/* don't show any text on hidden mines or revealed non-mines with no mines near them */}
            {mine.state !== MINE_HIDDEN &&
                !(mine.state === MINE_REVEALED && mine.isMine === false && mine.minesNear === 0) &&
                // give the text proper styling
                <div className="label">
                    {/* depending on whether or not the mine is revealed */}
                    {mine.state === MINE_REVEALED ?
                        // revealed mines show an X, otherwise show how many mines near this non-mine
                        mine.isMine ? "X" : mine.minesNear :
                        // hidden mines show nothing, marked mines show a !
                        mine.state === MINE_HIDDEN ? "" : "!"}
                </div>}
        </div>
    );
}

class Board extends Component {
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
                    // should start out hidden
                    "state": MINE_HIDDEN,
                    // will be set later
                    "isMine": false,
                    // will be set later
                    "minesNear": 0,
                    // no custom CSS for mines currently
                    "customClasses": "",
                });
            }
        }
        // a click has not yet happened
        this.firstClick = true;
        this.state = {
            // set mines to our (empty) 2-D array
            "mines": mines,
        };
    }

    /**
     * Get all the adjacent coordinates of a specified mine
     * @param {Number} x X-coordinate of the mine
     * @param {Number} y Y-coordinate of the mine
     * @returns {Array} A 2-D array containing adjcanet coordinate pairs
     */
    getMinesToTest(x, y) {
        // block comments refer to the position of the mine to add
        // where the x indicates the location of the specified
        // and the * indicates the adjacent mine

        // array to store nearby mines
        let mines = [];
        // if we aren't on the left edge
        if (x > 0) {
            // if we aren't at the top edge
            if (y > 0) {
                /*
                * - -
                - x -
                - - -
                */
                mines.push([x - 1, y - 1]);
            }
            /*
            - - -
            * x -
            - - -
            */
            mines.push([x - 1, y]);
            // if we aren't on the bottom edge
            if (y < this.props.height - 1) {
                /*
                - - -
                - x -
                * - -
                */
                mines.push([x - 1, y + 1]);
            }
        }
        // if we aren't at the top edge
        if (y > 0) {
            /*
            - * -
            - x -
            - - -
            */
            mines.push([x, y - 1]);
        }
        // if we aren't on the bottom edge
        if (y < this.props.height - 1) {
            /*
            - - -
            - x -
            - * -
            */
            mines.push([x, y + 1]);
        }
        // if we aren't on the right edge
        if (x < this.props.width - 1) {
            // if we aren't at the top edge
            if (y > 0) {
                /*
                - - *
                - x -
                - - -
                */
                mines.push([x + 1, y - 1]);
            }
            /*
            - - -
            - x *
            - - -
            */
            mines.push([x + 1, y]);
            // if we aren't on the bottom edge
            if (y < this.props.height - 1) {
                /*
                - - -
                - x -
                - - *
                */
                mines.push([x + 1, y + 1]);
            }
        }
        // return our 2-D array of coordinates
        return mines;
    }

    /**
     * Reveal all mines near a target mine recursively
     * @param {Array} mines 2-D array containing the status of all mines
     * @param {Number} x X-coordiante of the initially revealed mine
     * @param {Number} y Y-coordiante of the initially revealed mine
     * @returns {Object} Contains mines, the updated 2-D mines array, and a mine indicating any if tripped, or null if not
     */
    revealNear(mines, x, y) {
        const boundRevealNear = this.revealNear.bind(this);
        // get the mines that should be checked
        const minesToTest = this.getMinesToTest(x, y);
        // count up all the number of nearby marked squares
        const numMarkedNear = minesToTest.reduce((numMines, coords) => (
            numMines + (mines[coords[1]][coords[0]].state === MINE_MARKED ? 1 : 0)
        ), 0);
        // variable to store the triggered mine, if any
        let mineRevealed = null;
        // if there are exactly as many marked nearby squares as there are mines (user is ready to reveal nearby)
        if (mines[y][x].minesNear === numMarkedNear) {
            // for each mine to test
            let toContinue = true;
            minesToTest.forEach(function(coords) {
                if (toContinue) {
                    // get the mine associated with that coordiante
                    let mine = mines[coords[1]][coords[0]];
                    // if the mine is still hidden
                    if (mine.state === MINE_HIDDEN) {
                        // reveal it
                        mine.state = MINE_REVEALED;
                        // if we tripped a mine
                        if (mine.isMine) {
                            mineRevealed = coords;
                            // indicate that the mine was autotripped
                            mine.customClasses = "mineLossAutoClick";
                        } else {
                            // recursively call the reveal function, using the coordinates of the newly revealed mine
                            const temp = boundRevealNear(mines, coords[0], coords[1]);
                            // if we didn't trip any mines
                            if (temp.mineRevealed === null) {
                                // update the state of the board
                                mines = temp.mines;
                            } else {
                                toContinue = false;
                                mineRevealed = temp.mineRevealed;
                            }
                        }
                    }
                }
            });
        }
        // return the mines and any tripped mine, if applicable
        return {mines, mineRevealed};
    }

    /**
     * Calculate how many non-mine squares are unrevealed
     * @param {Array} mines 2-D array of mines to search through
     * @returns {Number} The number of unrevealed non-mine squares
     */
    validSquaresLeft(mines) {
        // for each row of mines
        return mines.reduce((numMines, mineRow) =>
            // add in a calculated number of mines per row
            numMines + mineRow.reduce((rowTotal, mine) =>
                // only add mines that are hidden but not mines
                rowTotal + (mine.state === MINE_HIDDEN && mine.isMine === false ? 1 : 0
                ), 0
            ), 0);
    }

    // handler for when a mine is clicked
    handleClick(x, y) {
        // if this is the first click
        if (this.firstClick === true) {
            // generate the mines to ensure a protected first click
            this.setState(function(prevState) {
                // get all the coordinates
                let possibilities = [];
                for (let i = 0; i < prevState.mines.length; ++i) {
                    for (let j = 0; j < prevState.mines[i].length; ++j) {
                        // but don't add the clicked coordinate as a possible mien
                        if (!(j === x && i === y)) {
                            possibilities.push([j, i]);
                        }
                    }
                }
                // generate the desired number of mines
                for (let i = 0; i < this.props.numMines; ++i) {
                    // get a random index that isn't the clicked coordinate or already a mine
                    const index = Math.floor(Math.random() * possibilities.length);
                    // get the coordinates of that index
                    const coord = possibilities[index];
                    // make sure we don't re-pick that for the next mine
                    possibilities.splice(index, 1);
                    // set that square to be a mine
                    prevState.mines[coord[1]][coord[0]].isMine = true;
                    // for each adjacent square
                    this.getMinesToTest(coord[0], coord[1]).forEach(function(coords) {
                        // increment the amount of nearby mines that it has
                        ++prevState.mines[coords[1]][coords[0]].minesNear;
                    });
                }
                // set our mines
                return {
                    "mines": prevState.mines,
                };
            }, function() {
                // click has already happened, don't repeat this
                this.firstClick = false;
                // do the revealing for that square
                this.handleClick(x, y);
            });
        } else if (this.props.playing === GAME_IN_PROGRESS && this.state.mines[y][x].state !== MINE_MARKED) {
            // if the game is going on and the mine isn't marked, we can perform a click
            // if a mine was clicked
            if (this.state.mines[y][x].isMine) {
                this.props.updateState({
                    "playing": GAME_LOSS,
                });
                this.setState((prevState) => {
                    // single out the clicked mine
                    prevState.mines[y][x].customClasses = "mineLossClick";
                    return {
                        // for each of the rows of mines
                        "mines": prevState.mines.map((mineRow) => (
                            // for each square in each row
                            mineRow.map((mine) => {
                                // set the square to be revealed, unless it was properly marked (show the user their correct markings)
                                return {
                                    ...mine,
                                    "state": !(mine.isMine === true && mine.state === MINE_MARKED) ? MINE_REVEALED : MINE_MARKED,
                                    "customClasses": `${mine.customClasses} ${mine.state === MINE_HIDDEN && mine.customClasses !== "mineLossClick" ? "after" : ""}`,
                                };
                            })
                        )),
                    };
                });
            } else {
                // wasn't a mine
                this.setState((prevState) => {
                    // get the current board state
                    let {mines} = prevState;
                    // reveal the clicked square
                    mines[y][x].state = MINE_REVEALED;
                    // reveal all nearby squares based on marked square
                    let temp = this.revealNear(mines, x, y);
                    // if a mine got tripped
                    if (temp.mineRevealed !== null) {
                        this.props.updateState({
                            "playing": GAME_LOSS,
                        });
                        return {
                            // for each of the rows of mines
                            "mines": prevState.mines.map((mineRow) => (
                                // for each square in each row
                                mineRow.map((mine) => {
                                    return {
                                        ...mine,
                                        // set the square to be revealed, unless it was properly marked (show the user their correct markings)
                                        // and make any squares revealed after the loss be greyed out
                                        "customClasses": mine.isMine === false && mine.state === MINE_MARKED ? "falseMark" : mine.state === MINE_HIDDEN && mine.customClasses !== "mineLossAutoClick" ? "after" : mine.customClasses,
                                        "state": !(mine.isMine === true && mine.state === MINE_MARKED) ? MINE_REVEALED : MINE_MARKED,
                                    };
                                })
                            )),
                        };
                    } else if (this.validSquaresLeft(temp.mines) === 0) {
                        // if nothing is left, victory!
                        this.props.updateState({
                            "playing": GAME_WIN,
                        });
                        return {
                            "mines": prevState.mines.map((mineRow) => (
                                // for each square in each row
                                mineRow.map((mine) => {
                                    // if it was a mine, mark it (but don't actually make it an X)
                                    return {
                                        ...mine,
                                        "state": mine.isMine === true ? MINE_MARKED : MINE_REVEALED,
                                    };
                                })
                            )),
                        };
                    } else {
                        // nothing got tripped, continue
                        // continue play with the revealed mine
                        return {
                            // update the mines
                            "mines": temp.mines,
                        };
                    }
                });
            }
        }
    }

    // handler for when a mine is right clicked
    handleRightClick(x, y) {
        if (this.props.playing === GAME_IN_PROGRESS) {
            // get the mine that was clicked
            const mine = this.state.mines[y][x];
            // if it wasn't already revealed
            if (mine.state !== MINE_REVEALED) {
                this.setState((prevState) => {
                    // if it was marked
                    if (mine.state === MINE_MARKED) {
                        // set it to be hidden (unmarked)
                        prevState.mines[y][x].state = MINE_HIDDEN;
                        // decrement the number of marked mines
                        --this.markedNum;
                    } else {
                        // otherwise set it to be marked
                        prevState.mines[y][x].state = MINE_MARKED;
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
        const progress = this.firstClick === true ? 0 : 100 - (100 * this.validSquaresLeft(this.state.mines) / (height * width - numMines));
        return (
            <div> {/* timer to show how long the game has been, only runs while the player hasn't won or lost */}
                <Timer running={playing === GAME_IN_PROGRESS} display={playing !== GAME_PAUSE} ref={ref => this.timer = ref} />
                {(playing === GAME_PAUSE) ? (
                    // if the game is paused, show the pause screen
                    <div>
                        Paused<br />
                        {/* button that will resume the game */}
                        <button onClick={() => {
                            this.props.updateState({
                                "playing": GAME_IN_PROGRESS,
                            });
                            this.timer.resume();
                        }}>
                            Resume
                        </button>
                    </div>
                ) : (<div>
                    {/* otherwise, show the main game screen */}
                    {/* main board, dynamically adjust it to be in the middle of the screen */}
                    <div
                        className="board"
                        style={{
                            "marginLeft": (window.innerWidth - (this.props.width * 27)) / 2,
                        }}>
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
                                        handleClick={this.handleClick.bind(this, mineIndex, rowIndex)}
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
                    <div className="status">
                        <div className={playing === GAME_WIN ? "win" : ""}>
                            {/* if playing, show number of mines left, or 0 if the user placed too many markers */}
                            {playing === GAME_IN_PROGRESS ? `Mines Left: ${Math.max(this.props.numMines - this.markedNum, 0)}` :
                                // otherwise, good job! if the user won, you lost! if the user lost
                                playing === GAME_WIN ? "Good job!" : "You lost!"}
                        </div>
                        {playing === GAME_IN_PROGRESS &&
                            <div>
                                Progress:
                                {/* the containing blue progress bar, style it as such */}
                                <div className="bar">
                                    {/* the inner progress bar */}
                                    <div
                                        // necessary styling for the green inner bar
                                        className="innerBar"
                                        // make it as wide as the progress, relative to the containing bar
                                        style={{"width": `${progress}%`}}>
                                        {/* display percent progress to the nearest tenth */}
                                        {Math.round(10 * progress) / 10}%
                                    </div>
                                </div>
                            </div>}
                    </div>
                    {/* if the game ended, offer up a restart */}
                    {playing !== GAME_IN_PROGRESS ?
                        <button onClick={this.props.updateState.bind(this, {
                            "playing": GAME_INPUT,
                        })}>Restart</button> :
                        <button onClick={this.props.updateState.bind(this, {
                            "playing": GAME_PAUSE,
                        })}>Pause</button>}
                </div>)}
            </div >
        );
    }
}

/**
 * Input form to get game settings
 * @param {Object} props Provides a handler for input change and submit, as well as the current width, height, and number of mines
 * @returns {Component} The rendered input form
 */
function Input({handleInputChange, handleSubmit, height, numMines, width}) {
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
                max={window.innerWidth / 25 - 6}
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
                max={width * height - 1}
                // initially set to whatever the number of mines was
                value={numMines}
                onChange={handleInputChange.bind(this, "numMines")} />
            </label>
            {/* button to start playing */}
            <input type="submit" value="Play!" />
        </form>
    );
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // start out in the input phase
            "playing": GAME_INPUT,
            "width": 30,
            "height": 15,
            "numMines": 75,
        };
        // variable so that the callback can set the app's state
        const app = this;
        // when the window loses focus
        window.addEventListener("blur", function() {
            // update the state of the app
            app.setState((prevState) => {
                return {
                    // if we were in a game, pause it, otherwise nothing to do
                    "playing": prevState.playing === GAME_IN_PROGRESS ? GAME_PAUSE : prevState.playing,
                };
            });
        }, false);
    }

    updateState(updates) {
        this.setState(updates);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({
            "playing": GAME_IN_PROGRESS,
        });
    }

    handleInputChange(inputType, event) {
        this.setState({
            [inputType]: event.target.value,
        });
    }

    render() {
        return (
            <div>
                {/* are we playing the game? */}
                {this.state.playing !== GAME_INPUT ?
                    // if so, show the game!
                    <Board
                        width={this.state.width}
                        height={this.state.height}
                        numMines={this.state.numMines}
                        playing={this.state.playing}
                        updateState={this.updateState.bind(this)} /> :
                    // otherwise, waiting on user input, show the form
                    <Input
                        width={this.state.width}
                        height={this.state.height}
                        numMines={this.state.numMines}
                        handleSubmit={this.handleSubmit.bind(this)}
                        handleInputChange={this.handleInputChange.bind(this)} />}
            </div>
        );
    }
}

export default App;
