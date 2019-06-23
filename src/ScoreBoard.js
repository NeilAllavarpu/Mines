import React from "react";
import {GAME} from "./constants.json";

export class ScoreBoard extends React.Component {
    render() {
        let scores = localStorage.getItem("scores");
        if (scores) {
            scores = scores.split(",")
            return (
                <div>
                    <h2>Fastest Times</h2>
                    <ol>
                        {scores.map((score) => (
                            <li>
                                {Math.floor(score / 60)}:{(score % 60).toLocaleString([], {
                                    "minimumIntegerDigits": 2,
                                })}
                            </li>
                        ))}
                    </ol>
                    <button onClick={this.props.updateState.bind(this, {
                        "playing": GAME.INPUT,
                    })}>Restart</button>
                </div>
            );
        } else {
            return (
                <div>
                    Play to get some times here!
                </div>
            );
        }
    }
}
