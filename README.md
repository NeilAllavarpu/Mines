# Mines

A simple minesweeper game, made with React.

## Installation

1. Make sure you have `npm` installed, which comes with [Node JS](https://nodejs.org/en/download/)
2. Clone the repository
3. Navigate to the repository directory on the command line (ex: `~/mines`)
4. Run `npm install` to install the necessary packages for the app.
5. Once complete, run `npm start` to launch the application
6. `node` should automatically redirect you to [`localhost:3000`](localhost:3000) (if not, open a browser at that address), where the application should be running

## How to play

At the start screen, enter your desired width, height, and number of mines for your game. The board cannot be wider than the screen, and the number of mines must be less than half the number of total squares, to prevent the application from freezing when generating the mines; play will not commence until these requirements are met. Default is a 30x15 board with 75 mines.

Clicking on untested squares reveals them. Right-clicking on a square flags it as a mine as a `!`, but is not required.

If a mine is revealed, the game will end immediately as a loss, all mines are revealed, and the triggered mine will flash blue and red.

Clicking on a square with the same number of flagged squares adjacent to it as number of mines adjacent to it (ex: any square with no adjacent mines and no adjacent flagged squares, or a `2` with 2 adjacent flagged sqaures) automatically reveals all non-flagged adjacent squares. If a mine is revealed at an adjacent square (due to a misflagged square), the misflagged square flashes blue and red and the game follows the same loss conditions as above. If any of the revealed squares satisfies the same condition, that square will reveal adjacent squares by the same logic. This occurs repeatedly until no squares that are revealed that satisfy this condition.

When all non-mine squares have been revealed, the game ends in victory.

A timer above the board indicates how long the game has lasted; this stops immediately on victory or loss. A counter below the board indicates how many mines are left based on the number of flagged squares (number of total mines - number of flagged squares), but never dips below 0. This is simply based on flagged squares, and does not indicate whether or not those flags are correct. Below this counter is a progress bar indicating how many of the non-mine squares have been revealed.
