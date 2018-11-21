import React, {Component} from "react";
import "./App.css";

let WIDTH = 30;
let HEIGHT = 15;
let NUM_MINES = 75;

const GAME_INPUT = -1;
const GAME_IN_PROGRESS = 0;
const GAME_LOSS = 1;
const GAME_WIN = 2;

const MINE_HIDDEN = 0;
const MINE_REVEALED = 1;
const MINE_MARKED = 2;

class Timer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            "seconds": 0,
        };
        this.interval = window.setInterval(this.updateTimer.bind(this), 1000);
    }

    updateTimer() {
        this.setState((prevState) => {
            return {
                "seconds": prevState.seconds + 1,
            };
        });
    }

    stop() {
        window.clearInterval(this.interval);
    }

    componentWillUnmount() {
        window.clearInterval(this.interval);
    }

    render() {
        if (this.props.running === false) {
            this.stop();
        }
        return (
            <div>Time: {Math.floor(this.state.seconds / 60)}:{(this.state.seconds % 60).toLocaleString(undefined, {"minimumIntegerDigits": 2})}</div>
        );
    }
}

class Mine extends Component {
    render() {
        const {mine} = this.props;
        const text = mine.state === MINE_REVEALED ? mine.isMine ? "X" : mine.minesNear : mine.state === MINE_HIDDEN ? "" : "!";
        return (
            <div className={`mine mineNum${mine.minesNear} ${mine.state !== MINE_REVEALED ? "hidden" : mine.isMine ? "mineLoss" : ""} ${mine.customClasses}`} onClick={this.props.handleClick} onContextMenu={this.props.handleRightClick}>
                <div className="label">
                    {text !== 0 ? text : null}
                </div>
            </div>
        );
    }
}

class App extends Component {
    constructor(props) {
        super(props);
        this.width = React.createRef();
        this.height = React.createRef();
        this.numMines = React.createRef();
        this.state = {
            "mines": [],
            "playing": GAME_INPUT,
        };
        this.handleClick = this.handleClick.bind(this);
        this.markedNum = 0;
    }

    handleClick(x, y) {
        if (this.state.playing === GAME_IN_PROGRESS && this.state.mines[y][x].state !== MINE_MARKED) {
            if (this.state.mines[y][x].isMine) {
                this.setState((prevState) => {
                    prevState.mines[y][x].customClasses = "mineLossClick";
                    return {
                        "playing": GAME_LOSS,
                        "mines": prevState.mines.map((mineRow) => {
                            return mineRow.map((mine) => {
                                return {
                                    ...mine,
                                    "state": mine.state === MINE_MARKED ? MINE_MARKED : MINE_REVEALED,
                                };
                            });
                        }),
                    };
                });
            } else {
                this.setState((prevState) => {
                    let {mines} = prevState;
                    mines[y][x].state = MINE_REVEALED;
                    let temp = revealNear(mines, x, y, true);
                    if (temp.mineRevealed !== null) {
                        prevState.mines[temp.mineRevealed[1]][temp.mineRevealed[0]].customClasses = "mineLossAutoClick";
                        return {
                            "playing": GAME_LOSS,
                            "mines": prevState.mines.map((mineRow) => {
                                return mineRow.map((mine) => {
                                    return {
                                        ...mine,
                                        "state": !(mine.isMine === true && mine.state === MINE_MARKED) ? MINE_REVEALED : MINE_MARKED,
                                    };
                                });
                            }),
                        };
                    } else {
                        mines = temp.mines;
                        const numMinesLeft = this.validSquaresLeft(mines);
                        return {
                            "playing": numMinesLeft === 0 ? GAME_WIN : GAME_IN_PROGRESS,
                            "mines": mines,
                        };
                    }
                });
            }
        }
    }

    validSquaresLeft(mines) {
        return mines.reduce((numMines, mineRow) => {
            const numRowMines = mineRow.reduce((rowTotal, mine) => {
                const toAdd = mine.state === MINE_HIDDEN && mine.isMine === false ? 1 : 0;
                const toAdd2 = mine.state === MINE_MARKED && mine.isMine === false ? 1 : 0;
                return rowTotal + toAdd + toAdd2;
            }, 0);
            return numMines + numRowMines;
        }, 0);
    }

    handleRightClick(x, y) {
        const mine = this.state.mines[y][x];
        if (mine.state !== MINE_REVEALED) {
            this.setState((prevState) => {
                if (mine.state === MINE_MARKED) {
                    prevState.mines[y][x].state = MINE_HIDDEN;
                    --this.markedNum;
                } else {
                    prevState.mines[y][x].state = MINE_MARKED;
                    ++this.markedNum;
                }
                const numMinesLeft = this.validSquaresLeft(prevState.mines);
                return {
                    "playing": numMinesLeft === 0 ? GAME_WIN : GAME_IN_PROGRESS,
                    "mines": prevState.mines,
                };
            });
        }
    }

    handleSubmit() {
        WIDTH = this.width.value;
        HEIGHT = this.height.value;
        NUM_MINES = this.numMines.value;
        let mines = [];
        for (let i = 0; i < HEIGHT; ++i) {
            mines.push([]);
            for (let j = 0; j < WIDTH; ++j) {
                mines[i].push({
                    "state": MINE_HIDDEN,
                    "isMine": false,
                    "minesNear": 0,
                    "customClasses": "",
                });
            }
        }
        for (let i = 0; i < NUM_MINES; ++i) {
            let x, y;
            do {
                x = Math.floor(Math.random() * WIDTH);
                y = Math.floor(Math.random() * HEIGHT);
            } while (mines[y][x].isMine === true);
            mines[y][x].isMine = true;
        }
        for (let i = 0; i < HEIGHT; ++i) {
            for (let j = 0; j < WIDTH; ++j) {
                let numMines = 0;
                if (i > 0) {
                    if (j > 0 && mines[i - 1][j - 1].isMine) {
                        ++numMines;
                    }
                    if (mines[i - 1][j].isMine) {
                        ++numMines;
                    }
                    if (j < WIDTH - 1 && mines[i - 1][j + 1].isMine) {
                        ++numMines;
                    }
                }
                if (i < HEIGHT - 1) {
                    if (j > 0 && mines[i + 1][j - 1].isMine) {
                        ++numMines;
                    }
                    if (mines[i + 1][j].isMine) {
                        ++numMines;
                    }
                    if (j < WIDTH - 1 && mines[i + 1][j + 1].isMine) {
                        ++numMines;
                    }
                }
                if (j > 0 && mines[i][j - 1].isMine) {
                    ++numMines;
                }
                if (j < WIDTH - 1 && mines[i][j + 1].isMine) {
                    ++numMines;
                }
                mines[i][j].minesNear = numMines;
            }
        }
        this.setState({
            "mines": mines,
            "playing": GAME_IN_PROGRESS,
        });
    }

    restartGame() {
        this.markedNum = 0;
        this.setState({
            "mines": [],
            "playing": GAME_INPUT,
        });
    }

    render() {
        const revealed = this.state.mines.reduce((numMines, mineRow) => {
            const numRowMines = mineRow.reduce((rowTotal, mine) => {
                const toAdd = mine.state === MINE_REVEALED || mine.state === MINE_MARKED ? 1 : 0;
                return rowTotal + toAdd;
            }, 0);
            return numMines + numRowMines;
        }, 0);
        return (
            <div>
                <h1>Minesweeper</h1>
                {this.state.playing !== GAME_INPUT &&
                    <div className="app">
                        <Timer running={this.state.playing === GAME_IN_PROGRESS} />
                        <div className="board" style={{"marginLeft": window.innerWidth / 2 - 12.5 - 12.5 * (WIDTH)}}>
                            {this.state.mines.map((mineRow, rowIndex) => {
                                return (
                                    <div className="row" key={rowIndex}>
                                        {
                                            mineRow.map((mine, mineIndex) => {
                                                return (
                                                    <Mine
                                                        key={mineIndex}
                                                        mine={mine}
                                                        handleClick={() => {
                                                            this.handleClick(mineIndex, rowIndex);
                                                        }}
                                                        handleRightClick={(event) => {
                                                            event.preventDefault();
                                                            this.handleRightClick(mineIndex, rowIndex);
                                                        }} />
                                                );
                                            })
                                        }
                                    </div>
                                );
                            })}
                        </div>
                        <div className={`status ${this.state.playing === GAME_WIN ? "win" : ""}`}>
                            <div>
                                {this.state.playing === GAME_IN_PROGRESS ? `Mines Left: ${NUM_MINES - this.markedNum}` :
                                    this.state.playing === GAME_WIN ? "Good job!" : "You lost!"}
                            </div>
                            {this.state.playing === GAME_IN_PROGRESS &&
                                <div>
                                    Progress: {Math.round(
                                        1000 * (1 - (HEIGHT * WIDTH - revealed) / (HEIGHT * WIDTH))
                                    ) / 10}%
                                </div>
                            }
                        </div>
                        {this.state.playing !== GAME_IN_PROGRESS &&
                            <button onClick={() => {
                                this.restartGame();
                            }}>Restart</button>
                        }
                    </div>
                }
                {
                    this.state.playing === GAME_INPUT &&
                    <form onSubmit={(event) => {
                        event.preventDefault();
                        this.handleSubmit();
                    }}>
                        <label>Board width <input type="number" ref={ref => this.width = ref} min={1} max={window.innerWidth / 25 - 6} value={WIDTH} onInput={(event) => {
                            WIDTH = event.target.value;
                            this.forceUpdate();
                        }} />
                        </label>
                        <label>Board height <input type="number" value={HEIGHT} ref={ref => this.height = ref} min={1} onInput={(event) => {
                            HEIGHT = event.target.value;
                            this.forceUpdate();
                        }} />
                        </label>
                        <label>Number of mines <input type="number" ref={ref => this.numMines = ref} min={1} max={WIDTH * HEIGHT / 2} value={NUM_MINES} onInput={(event) => {
                            NUM_MINES = event.target.value;
                            this.forceUpdate();
                        }} />
                        </label>
                        <input type="submit" value="Play!" />
                    </form>
                }
            </div >
        );
    }
}

/**
 * stuff
* @param {*} mines e
* @param {*} x e
* @param {*} y e
* @returns {*} stuf
        */
function revealNear(mines, x, y) {
    let minesToTest = [];
    if (x > 0) {
        if (y > 0) {
            minesToTest.push([x - 1, y - 1]);
        }
        minesToTest.push([x - 1, y]);
        if (y < HEIGHT - 1) {
            minesToTest.push([x - 1, y + 1]);
        }
    }
    if (y > 0) {
        minesToTest.push([x, y - 1]);
    }
    if (y < HEIGHT - 1) {
        minesToTest.push([x, y + 1]);
    }
    if (x < WIDTH - 1) {
        if (y > 0) {
            minesToTest.push([x + 1, y - 1]);
        }
        minesToTest.push([x + 1, y]);
        if (y < HEIGHT - 1) {
            minesToTest.push([x + 1, y + 1]);
        }
    }
    let numMarkedNear = 0;
    minesToTest.forEach(function(coords) {
        let mine = mines[coords[1]][coords[0]];
        if (mine.state === MINE_MARKED) {
            ++numMarkedNear;
        }
    });
    let mineRevealed = null;
    if (mines[y][x].minesNear === numMarkedNear) {
        for (let index = 0; index < minesToTest.length; index++) {
            const coords = minesToTest[index];
            let mine = mines[coords[1]][coords[0]];
            if (mine.state === MINE_HIDDEN) {
                mine.state = MINE_REVEALED;
                if (mine.isMine) {
                    mineRevealed = coords;
                    return {mines, mineRevealed};
                }
                let temp = revealNear(mines, coords[0], coords[1]);
                if (temp.mineRevealed === null) {
                    mines = temp.mines;
                } else {
                    return temp;
                }
            }
        }
    }
    return {mines, mineRevealed};
}

export default App;
