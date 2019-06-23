import PropTypes from "prop-types";
import React from "react";

const msPerSecond = 1000,
    secondsPerMinute = 60;

export class Timer extends React.Component {
    constructor(props) {
        super(props);
        // time to indicate when the timer was started
        this.start = Date.now();
        this.state = {
            "last": Date.now(),
            // amound of seconds that have passed since starting
            "timePassed": 0,
        };
        // ask to update the timer (will occur every rendering until stopped)
        this.requestID = null;
    }

    componentDidMount() {
        this.requestID = window.requestAnimationFrame(() => {
            this.updateTimer();
        });
    }

    /**
     * Update the number of seconds for the timer
     */
    updateTimer() {
        this.setState((prevState) => ({
            "last": Date.now(),
            // update the number of seconds taht have passed since start
            "timePassed": prevState.timePassed + (Date.now() - prevState.last),
        }), () => {
            // if we are still running
            if (this.props.running === true) {
                // update the timer again
                window.requestAnimationFrame(this.updateTimer.bind(this));
            }
        });
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.requestID);
    }

    /**
     * Continues the timer after it was stopped
     */
    resume() {
        this.setState({
            // update the last tick timing to prevent a large spike in time
            "last": Date.now(),
        }, () => {
            // begin the updating loop for the timer
            window.requestAnimationFrame(this.updateTimer.bind(this));
        });
    }

    getTime() {
        return this.state.timePassed / 1000;
    }

    render() {
        // only show timer if that is wanted
        if (this.props.display === true) {
            // number of seconds to display on timer
            const timePassed = Math.floor(this.state.timePassed / msPerSecond),
                // minutes part of the time
                minutes = Math.floor(timePassed / secondsPerMinute),
                // seconds part of the time
                seconds = (timePassed % secondsPerMinute).toLocaleString([], {
                    "minimumIntegerDigits": 2,
                });
            return (
                <div>Time: {minutes}:{seconds}</div>
            );
        } else {
            return null;
        }
    }
}

Timer.propTypes = {
    "display": PropTypes.bool.isRequired,
    "running": PropTypes.bool.isRequired,
};
