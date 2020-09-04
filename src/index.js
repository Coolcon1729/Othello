import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const size = 8;

function Square(props) {
    let content;
    switch (props.value) {
        case " ":
            content = "";
            break;
        case "O":
            content = <svg><circle fillOpacity="0"/></svg>;
            break;
        case "B":
            content = <svg><circle fillOpacity="0.95" fill="#101010"/></svg>;
            break;
        case "W":
            content = <svg><circle fillOpacity="0.95" fill="#F0F0F0"/></svg>;
            break;
        default:
            alert("Something ain't right here.");
    }
    return(
        <button
            className="square"
            onClick={props.onClick}
        >{content}</button>
    );
}

class Board extends React.Component {
    constructor(props) {
        super(props);

        // middle of the board
        const middle = Math.floor((size - 1) / 2);

        // holds the state of each square on the board
        // W: White, B: Black, O: Open, " ": Not Open
        const newSquares = Array(size).fill(null).map(x => Array(size).fill(" "));
        
        // Initialize fresh board
        newSquares[middle][middle] = newSquares[middle + 1][middle + 1] = "W";
        newSquares[middle][middle + 1] = newSquares[middle + 1][middle] = "B";
        newSquares[middle - 1][middle] = newSquares[middle][middle - 1] =
        newSquares[middle + 1][middle + 2] = newSquares[middle + 2][middle + 1] = "O";

        const newFlipSquares = Array(size).fill(null).map(x => Array(size).fill(null).map(x => []));
        newFlipSquares[middle - 1][middle].push([middle, middle]);
        newFlipSquares[middle][middle - 1].push([middle, middle]);
        newFlipSquares[middle + 1][middle + 2].push([middle + 1, middle + 1]);
        newFlipSquares[middle + 2][middle + 1].push([middle + 1, middle + 1]);

        this.state = {
            squares: newSquares,
            flipSquares: newFlipSquares,
            bIsNext: true,
            blackScore: 2,
            whiteScore: 2
        };
    }
    handleClick(i, j) {
        const squares = this.state.squares.slice();
        let blackScore = this.state.blackScore;
        let whiteScore = this.state.whiteScore;

        // If it is not a valid square, do nothing.
        if (!this.state.flipSquares[i][j].length) return;
        
        // Update the state of the squares and the value of the scores. (Flipping and Scoring)
        squares[i][j] = this.state.bIsNext ? "B" : "W";
        this.state.bIsNext ? blackScore++ : whiteScore++;
        for (let square of this.state.flipSquares[i][j]) {
            squares[square[0]][square[1]] = this.state.bIsNext ? "B" : "W";
            if (this.state.bIsNext) {
                blackScore++;
                whiteScore--;
            } else {
                whiteScore++;
                blackScore--;
            }
        }

        // For each square on the board determine which squares will be flipped when clicked.
        const flipSquares = Array(size).fill(null).map(x => Array(size).fill(null).map(x => []));
        const directions = [
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1],
            [-1, 0],
            [-1, -1],
            [0, -1],
            [1, -1]
        ]
        const regex = new RegExp("^[O ]" + (this.state.bIsNext ? "B" : "W") + "+" + (this.state.bIsNext ? "W" : "B"));
        for (let n = 0; n < size; n++) {
            for (let m = 0; m < size; m++) {
                if (squares[n][m] === "W" || squares[n][m] === "B") continue;
                for (let direction of directions) {
                    let line = "";
                    let x = n;
                    let y = m;
                    do {
                        line += squares[x][y];
                        x += direction[0];
                        y += direction[1];
                    } while (x >= 0 && x < size && y >= 0 && y < size && !line.includes("  "))
                    if (regex.test(line)) {
                        x = n + direction[0];
                        y = m + direction[1];
                        while (squares[x][y] === (this.state.bIsNext ? "B" : "W")) {
                            flipSquares[n][m].push([x, y]);
                            x += direction[0];
                            y += direction[1];
                        }
                    }
                }
            }
        }

        // Update the state of each square based on the new flipSquare.
        for (let n = 0; n < size; n++) {
            for (let m = 0; m < size; m++) {
                if (squares[n][m] === "B" || squares[n][m] === "W") continue;
                if (flipSquares[n][m].length) {
                    squares[n][m] = "O";
                } else {
                    squares[n][m] = " ";
                }
            }
        }

        // Set the new state.
        this.setState({
            squares: squares,
            flipSquares: flipSquares,
            bIsNext: !this.state.bIsNext,
            blackScore: blackScore,
            whiteScore: whiteScore
        });
    }
    renderSquare(i, j) {
        return(
            <Square
                key={size * i + j}
                value={this.state.squares[i][j]}
                onClick={() => this.handleClick(i, j)}
            />
        );
    }
    render() {
        let items = [];
        for (let i = 0; i < size; i++) {
            let row = [];
            for (let j = 0; j < size; j++) {
                row.push(this.renderSquare(i, j));
            }
            items.push(<div className="board-row" key={i}>{row}</div>);
        }
        let status;
        if (this.state.blackScore + this.state.whiteScore === size * size) {
            if (this.state.blackScore === this.state.whiteScore) {
                status = `Draw!`
            } else {
                status = `${(this.state.blackScore > this.state.whiteScore) ? "Black" : "White"} is the winner!`
            }
        } else {
            status = `It's ${this.state.bIsNext ? "Black" : "White"}'s turn!`
        }
        return(
            <div>
                <div className="status">
                    {status}
                    <div className="scoreDisplay">
                        Black: {this.state.blackScore}  White: {this.state.whiteScore}
                    </div>
                </div>
                {items}
            </div>
        );
    }
}

class Game extends React.Component {
    render() {
        return(
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
            </div>
        );
    }
}

class Layout extends React.Component {
    render() {
        return(
            <div className="page">
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
ReactDOM.render(<Layout />, document.getElementById("root"));