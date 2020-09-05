import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const size = 8;

function Square({value, onClick, placed}) {
    let content;
    // holds a red dot if the disk was just placed
    const indicator = placed ? <circle r="3px" fill="#FF0000" style={{strokeWidth:"0px"}}/> : null;

    // determine what to display
    switch (value) {
        case " ":
            content = "";
            break;
        case "O":
            content = <svg><circle r="30px" fillOpacity="0"/>{indicator}</svg>;
            break;  
        case "B":
            content = <svg><circle r="30px" fillOpacity="0.95" fill="#101010"/>{indicator}</svg>;
            break;
        case "W":
            content = <svg><circle r="30px" fillOpacity="0.95" fill="#F0F0F0"/>{indicator}</svg>;
            break;
        default:
            alert("Something ain't right here.");
    }
    return(
        <button
            className="square"
            onClick={onClick}
        >{content}</button>
    );
}

class Board extends React.Component {
    renderSquare(i, j) {
        return(
            <Square
                key={size * i + j}
                value={this.props.squares[i][j]}
                onClick={() => this.props.onClick(i, j)}
                placed={this.props.placed && i === this.props.placed[0] && j === this.props.placed[1]}
            />
        );
    }
    render() {
        // build a 2D array of squares.
        let items = [];
        for (let i = 0; i < size; i++) {
            let row = [];
            for (let j = 0; j < size; j++) {
                row.push(this.renderSquare(i, j));
            }
            items.push(<div className="board-row" key={i}>{row}</div>);
        }
        return(
            <div>
                {items}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        // middle of the board
        const middle = Math.floor((size - 1) / 2);

        // holds the state of each square on the board
        // W: White, B: Black, O: Open, " ": Not Open
        const newSquares = Array(size).fill(null).map(x => Array(size).fill(" "));
        // holds which tiles will be flipped when played for each colour
        const newFlipSquares = {
            B: Array(size).fill(null).map(x => Array(size).fill(null).map(x => [])),
            W: Array(size).fill(null).map(x => Array(size).fill(null).map(x => []))            
        };

        // Initialize fresh board.
        newSquares[middle][middle] = newSquares[middle + 1][middle + 1] = "W";
        newSquares[middle][middle + 1] = newSquares[middle + 1][middle] = "B";
        newSquares[middle - 1][middle] = newSquares[middle][middle - 1] =
        newSquares[middle + 1][middle + 2] = newSquares[middle + 2][middle + 1] = "O";

        newFlipSquares["B"][middle - 1][middle].push([middle, middle]);
        newFlipSquares["B"][middle][middle - 1].push([middle, middle]);
        newFlipSquares["B"][middle + 1][middle + 2].push([middle + 1, middle + 1]);
        newFlipSquares["B"][middle + 2][middle + 1].push([middle + 1, middle + 1]);
        newFlipSquares["W"][middle - 1][middle + 1].push([middle, middle + 1]);
        newFlipSquares["W"][middle][middle + 2].push([middle, middle + 1]);
        newFlipSquares["W"][middle + 1][middle - 1].push([middle + 1, middle]);
        newFlipSquares["W"][middle + 2][middle].push([middle + 1, middle]);

        // Initialize the game state.
        this.state = {
            history: [{
                squares: newSquares,
                flipSquares: newFlipSquares,
                placed: null,
                blackScore: 2,
                whiteScore: 2
            }],
            bIsNext: true,
            turn: 0
        };
    }
    handleClick(i, j) {
        const history = this.state.history.slice(0, this.state.turn + 1);
        const current = history[history.length - 1];
        const currentPlayer = this.state.bIsNext ? "B" : "W";
        const nextPlayer = this.state.bIsNext ? "W" : "B";

        // If it is not a valid square, do nothing.
        if (!current.flipSquares[currentPlayer][i][j].length) return;
        
        const squares = current.squares.map(arr => arr.slice());
        let blackScore = current.blackScore;
        let whiteScore = current.whiteScore;
        
        // Update the state of the squares and the value of the scores. (Flipping and Scoring)
        squares[i][j] = currentPlayer;
        this.state.bIsNext ? blackScore++ : whiteScore++;
        for (let square of current.flipSquares[currentPlayer][i][j]) {
            squares[square[0]][square[1]] = currentPlayer;
            if (this.state.bIsNext) {
                blackScore++;
                whiteScore--;
            } else {
                whiteScore++;
                blackScore--;
            }
        }

        // For each square on the board determine which squares will be flipped when clicked.
        const flipSquares = {
            B: Array(size).fill(null).map(x => Array(size).fill(null).map(x => [])),
            W: Array(size).fill(null).map(x => Array(size).fill(null).map(x => []))            
        };
        const directions = [
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1],
            [-1, 0],
            [-1, -1],
            [0, -1],
            [1, -1]
        ];
        const nextRegex = new RegExp("^[O ]" + currentPlayer + "+" + nextPlayer);
        const currentRegex = new RegExp("^[O ]" + nextPlayer + "+" + currentPlayer);
        for (let n = 0; n < size; n++) {
            for (let m = 0; m < size; m++) {
                if (/[BW]/.test(squares[n][m])) continue;
                for (let direction of directions) {
                    let line = "";
                    let x = n;
                    let y = m;
                    do {
                        line += squares[x][y];
                        x += direction[0];
                        y += direction[1];
                    } while (x >= 0 && x < size && y >= 0 && y < size && !line.includes("  "))
                    if (nextRegex.test(line)) {
                        x = n + direction[0];
                        y = m + direction[1];
                        while (squares[x][y] === currentPlayer) {
                            flipSquares[nextPlayer][n][m].push([x, y]);
                            x += direction[0];
                            y += direction[1];
                        }
                    }
                    if (currentRegex.test(line)) {
                        x = n + direction[0];
                        y = m + direction[1];
                        while (squares[x][y] === nextPlayer) {
                            flipSquares[currentPlayer][n][m].push([x, y]);
                            x += direction[0];
                            y += direction[1];
                        }
                    }
                }
            }
        }

        // determines whether the next player will have any moves on the next turn
        const noMoves = !hasMoves(flipSquares, nextPlayer);

        // Update the state of each square based on the new flipSquare.
        for (let n = 0; n < size; n++) {
            for (let m = 0; m < size; m++) {
                if (/[BW]/.test(squares[n][m])) continue;
                if (flipSquares[noMoves ? currentPlayer : nextPlayer][n][m].length) {
                    squares[n][m] = "O";
                } else {
                    squares[n][m] = " ";
                }
            }
        }

        // Set the new state.
        this.setState({
            history: history.concat([{
                squares: squares,
                flipSquares: flipSquares,
                placed: [i, j],
                blackScore: blackScore,
                whiteScore: whiteScore
            }]),
            bIsNext: !this.state.bIsNext ^ noMoves,
            turn: this.state.turn + 1
        });
    }
    undo() {
        // determines whether the last turn was passed
        const noMoves = !hasMoves(this.state.history[this.state.turn].flipSquares, this.state.bIsNext ? "W" : "B");
        this.setState({
            history: this.state.history,
            bIsNext: !this.state.bIsNext ^ noMoves,
            turn: this.state.turn - 1
        });
    }
    render() {
        const history = this.state.history;
        const current = history[this.state.turn];

        // holds current game status
        let status;
        if (!(hasMoves(current.flipSquares, "B") + hasMoves(current.flipSquares, "W"))) {
            if (current.blackScore === current.whiteScore) {
                status = "Draw!";
            } else if (current.blackScore > current.whiteScore) {
                status = `Black has won with ${current.blackScore} points!`;
            } else {
                status = `White has won with ${current.whiteScore} points!`;
            }
            if (current.blackScore + current.whiteScore < size * size) {
                status = `No mores moves. ${status}`;
            }
        } else {
            status = `It's ${this.state.bIsNext ? "Black" : "White"}'s turn!`;
        }

        return(
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i, j) => this.handleClick(i, j)}
                        placed={current.placed}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div className="scoreDisplay">
                        Black: {current.blackScore}  White: {current.whiteScore}
                    </div>
                    <button onClick={() => this.undo()} disabled={!this.state.turn}>Undo</button>
                </div>
            </div>
        );
    }
}

class App extends React.Component {
    render() {
        return(
            <div className="app">
                <div className="header">
                    <h1>2 Player Othello</h1>
                    <h4>How to play</h4>
                </div>
                <Game />
            </div>
        );
    }
}

// =========================
ReactDOM.render(<App />, document.getElementById("root"));

function hasMoves(flipSquares, player) {
    return !!flipSquares[player].reduce(
                (sum, arr) => sum += arr.reduce(
                    (sum, val) => sum += val.length, 0), 0);
}