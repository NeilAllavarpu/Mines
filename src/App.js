import "./App.css";
import {Board} from "./Board.js";
import {GAME} from "./constants.json";
import {Input} from "./Input.js";
import React from "react";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // start out in the input phase
            "height": 15,
            "numMines": 75,
            "playing": GAME.INPUT,
            "width": 30,
        };
    }

    componentDidMount() {
        // when the window loses focus
        window.addEventListener("blur", () => {
            // if we were in a game, pause it
            if (this.state.playing === GAME.IN_PROGRESS) {
                this.setState({
                    "playing": GAME.PAUSE,
                });
            }
        });
    }

    updateState(updates) {
        this.setState(updates);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({
            "playing": GAME.IN_PROGRESS,
        });
    }

    handleInputChange(inputType, event) {
        this.setState({
            [inputType]: event.target.value,
        });
    }

    render() {
        if (this.state.playing === GAME.INPUT) {
            return (
                <Input
                    width={this.state.width}
                    height={this.state.height}
                    numMines={this.state.numMines}
                    handleSubmit={this.handleSubmit.bind(this)}
                    handleInputChange={this.handleInputChange.bind(this)} />
            );
        } else {
            return (
                <Board
                    width={this.state.width}
                    height={this.state.height}
                    numMines={this.state.numMines}
                    playing={this.state.playing}
                    updateState={this.updateState.bind(this)} />
            );
        }
    }
}

export default App;
