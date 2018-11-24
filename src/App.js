import React, {Component} from "react";
import "./App.css";

// game settings
let WIDTH = 30;
let HEIGHT = 15;
let NUM_MINES = 75;

// various states of the game
const GAME_INPUT = -1;
const GAME_IN_PROGRESS = 0;
const GAME_LOSS = 1;
const GAME_WIN = 2;

// possible states of mines
const MINE_HIDDEN = 0;
const MINE_REVEALED = 1;
const MINE_MARKED = 2;

/**
 * Get all the adjacent coordinates of a specified mine
 * @param {Number} x X-coordinate of the mine
 * @param {Number} y Y-coordinate of the mine
 * @returns {Array} A 2-D array containing adjcanet coordinate pairs
 */
function getMinesToTest(x, y) {
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
        if (y < HEIGHT - 1) {
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
    if (y < HEIGHT - 1) {
        /*
        - - -
        - x -
        - * -
        */
        mines.push([x, y + 1]);
    }
    // if we aren't on the right edge
    if (x < WIDTH - 1) {
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
        if (y < HEIGHT - 1) {
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
function revealNear(mines, x, y) {
    // get the mines that should be checked
    const minesToTest = getMinesToTest(x, y);
    // count up all the number of nearby marked squares
    const numMarkedNear = minesToTest.reduce((numMines, coords) => (
        numMines + (mines[coords[1]][coords[0]].state === MINE_MARKED ? 1 : 0)
    ), 0);
    // variable to store the triggered mine, if any
    let mineRevealed = null;
    // if there are exactly as many marked nearby squares as there are mines (user is ready to reveal nearby)
    if (mines[y][x].minesNear === numMarkedNear) {
        // for each mine to test
        minesToTest.forEach(function(coords) {
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
                    const temp = revealNear(mines, coords[0], coords[1]);
                    // if we didn't trip any mines
                    if (temp.mineRevealed === null) {
                        // update the state of the board
                        mines = temp.mines;
                    }
                }
            }
        });
    }
    // return the mines and any tripped mine, if applicable
    return {mines, mineRevealed};
}

// timer to tell the player how long their game has been in progress
class Timer extends Component {
    constructor(props) {
        super(props);
        // time to indicate when the timer was started
        this.start = Date.now();
        this.state = {
            // amound of seconds that have passed since starting
            "seconds": 0,
        };
        // ask to update the timer (will occur every rendering until stopped)
        requestAnimationFrame(this.updateTimer.bind(this));
    }

    /**
     * Update the number of seconds for the timer
     */
    updateTimer() {
        this.setState({
            // update the number of seconds taht have passed since start
            "seconds": Math.floor((Date.now() - this.start) / 1000),
        }, function() {
            // if we are still running
            if (this.props.running === true) {
                // update the timer again
                requestAnimationFrame(this.updateTimer.bind(this));
            }
        });
    }

    render() {
        return (
            <div>
                {/* Format of timer => `Time: minutes:seconds` (calculated based on how long since the timer was started) */}
                Time: {Math.floor(this.state.seconds / 60)}:
                {(this.state.seconds % 60).toLocaleString(undefined, {"minimumIntegerDigits": 2})}
            </div>
        );
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

class App extends Component {
    constructor(props) {
        super(props);
        // ref to get width from input
        this.width = React.createRef();
        // ref to get height from input
        this.height = React.createRef();
        // ref to get number of mines from input
        this.numMines = React.createRef();
        this.state = {
            // to be initialized once settings are input
            "mines": [],
            // start out in the input phase
            "playing": GAME_INPUT,
        };
        // number of marked squares
        this.markedNum = 0;
    }

    // handler for when a mine is clicked
    handleClick(x, y) {
        // if the game is going on and the mine isn't marked, we can perform a click
        if (this.state.playing === GAME_IN_PROGRESS && this.state.mines[y][x].state !== MINE_MARKED) {
            // if a mine was clicked
            if (this.state.mines[y][x].isMine) {
                this.setState((prevState) => {
                    // single out the clicked mine
                    prevState.mines[y][x].customClasses = "mineLossClick";
                    return {
                        "playing": GAME_LOSS,
                        // for each of the rows of mines
                        "mines": prevState.mines.map((mineRow) => (
                            // for each square in each row
                            mineRow.map((mine) => {
                                // set the square to be revealed, unless it was properly marked (show the user their correct markings)
                                return {
                                    ...mine,
                                    "state": !(mine.isMine === true && mine.state === MINE_MARKED) ? MINE_REVEALED : MINE_MARKED,
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
                    let temp = revealNear(mines, x, y, true);
                    // if a mine got tripped
                    if (temp.mineRevealed !== null) {
                        return {
                            // game was lost
                            "playing": GAME_LOSS,
                            // for each of the rows of mines
                            "mines": prevState.mines.map((mineRow) => (
                                // for each square in each row
                                mineRow.map((mine) => {
                                    // set the square to be revealed, unless it was properly marked (show the user their correct markings)
                                    return {
                                        ...mine,
                                        "state": !(mine.isMine === true && mine.state === MINE_MARKED) ? MINE_REVEALED : MINE_MARKED,
                                    };
                                })
                            )),
                        };
                    } else {
                        // nothing got tripped, continue
                        return {
                            // if all non-mines are revealed, they won, otherwise continue
                            "playing": this.validSquaresLeft(temp.mines) === 0 ? GAME_WIN : GAME_IN_PROGRESS,
                            // update the mines
                            "mines": temp.mines,
                        };
                    }
                });
            }
        }
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

    // handler for when a mine is right clicked
    handleRightClick(x, y) {
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

    // handler for when the inputs are finalized
    handleSubmit() {
        // set width, height, number of mines based on inputs
        WIDTH = this.width.value;
        HEIGHT = this.height.value;
        NUM_MINES = this.numMines.value;
        // array to store the generated mines
        let mines = [];
        // create HEIGHT inner arrays (rows)
        for (let i = 0; i < HEIGHT; ++i) {
            mines.push([]);
            // create WIDTH mine states per row (columns)
            for (let j = 0; j < WIDTH; ++j) {
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
        // generate the desired number of mines
        for (let i = 0; i < NUM_MINES; ++i) {
            // keep picking random X and Y values until we hit a non-mine
            let x, y;
            do {
                x = Math.floor(Math.random() * WIDTH);
                y = Math.floor(Math.random() * HEIGHT);
            } while (mines[y][x].isMine === true);
            // set that square to be a mine
            mines[y][x].isMine = true;
            // for each adjacent square
            getMinesToTest(x, y).forEach(function(coords) {
                // increment the amount of nearby mines that it has
                ++mines[coords[1]][coords[0]].minesNear;
            });
        }
        this.setState({
            // set mines to our generated 2-D array
            "mines": mines,
            // game has begun
            "playing": GAME_IN_PROGRESS,
        });
    }

    /**
     * Resets the game state
     */
    restartGame() {
        // no marked squares
        this.markedNum = 0;
        this.setState({
            // clear mines
            "mines": [],
            // go back to the input page
            "playing": GAME_INPUT,
        });
    }

    render() {
        // calculate the percent of all non-mines that are revealed
        const progress = 100 - (100 * this.validSquaresLeft(this.state.mines) / (HEIGHT * WIDTH - NUM_MINES));
        return (
            <div>
                {/* header atop the whole app */}
                <h1>Minesweeper</h1>
                {/* are we playing the game? */}
                {this.state.playing !== GAME_INPUT ?
                    // if so render the play screen
                    <div>
                        {/* timer to show how long the game has been, only runs while the player hasn't won or lost */}
                        <Timer running={this.state.playing === GAME_IN_PROGRESS} />
                        {/* main board, dynamically adjust it to be in the middle of the screen */}
                        <div className="board" style={{"marginLeft": window.innerWidth / 2 - 12.5 - 12.5 * (WIDTH)}}>
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
                            <div className={this.state.playing === GAME_WIN ? "win" : ""}>
                                {/* if playing, show number of mines left, or 0 if the user placed too many markers */}
                                {this.state.playing === GAME_IN_PROGRESS ? `Mines Left: ${Math.max(NUM_MINES - this.markedNum, 0)}` :
                                    // otherwise, good job! if the user won, you lost! if the user lost
                                    this.state.playing === GAME_WIN ? "Good job!" : "You lost!"}
                            </div>
                            {this.state.playing === GAME_IN_PROGRESS &&
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
                                </div>
                            }
                        </div>
                        {/* if the game ended, offer up a restart */}
                        {this.state.playing !== GAME_IN_PROGRESS &&
                            <button onClick={this.restartGame.bind(this)}>Restart</button>}
                    </div> :
                    // waiting on user input, show the form
                    <form onSubmit={(event) => {
                        // prevent default redirect on submit
                        event.preventDefault();
                        // use the custom handler
                        this.handleSubmit();
                    }}>
                        {/* input for width of board */}
                        <label>Board width <input
                            // make it a numeric input
                            type="number"
                            // store the ref to this.width
                            ref={ref => this.width = ref}
                            // need at least 1 wide board
                            min={1}
                            // don't make it too wide or weird wrapping happens
                            max={window.innerWidth / 25 - 6}
                            // initially set to whatever the width was
                            defaultValue={WIDTH} />
                        </label>
                        {/* input for height of board */}
                        <label>Board height <input
                            // make it a numeric input
                            type="number"
                            // store the ref to this.height
                            ref={ref => this.height = ref}
                            // need at least 1 tall board
                            min={1}
                            // initially set to whatever the height was
                            defaultValue={HEIGHT} />
                        </label>
                        {/* input for number of mines */}
                        <label>Number of mines <input
                            // make it a numeric input
                            type="number"
                            // store the ref to this.numMines
                            ref={ref => this.numMines = ref}
                            // need at least 1 mine
                            min={1}
                            // too many mines means the random mine generation could stall, don't allow this
                            max={WIDTH * HEIGHT / 2}
                            // initially set to whatever the number of mines was
                            defaultValue={NUM_MINES} />
                        </label>
                        {/* button to start playing */}
                        <input type="submit" value="Play!" />
                    </form>
                }
            </div>
        );
    }
}

export default App;
