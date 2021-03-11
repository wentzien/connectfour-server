const oldBoard = [
    ["a", "a", 0, "a", "a", 0],
    [0, "a", 0, 0, 0, 0],
    [0, 0, "a", 0, 0, 0],
    [0, 0, "a", "b", "b", 0],
    [0, "a", 0, "a", "b", 0],
    [0, "a", "a", 0, "a", 0],
    [0, "a", 0, 0, 0, "a"],
];

const newBoard = [
    [0, 0, 0, 0, "a", "b"],
    [0, 0, 0, 0, "a", 0],
    ["a", 0, "b", "a", "a", "a"],
    [0, 0, "a", "a", 0, 0],
    [0, 0, "b", 0, 0, 0],
    [0, "a", 0, 0, 0, 0],
    ["a", 0, 0, 0, 0, "a"],
];

const player = "a";

// const result = checkMove(oldBoard, newBoard, player);
// console.log(result);

function checkMove(oldBoard, newBoard, player) {
    let countDiff = 0;
    for (let row = 0; row < 7; row++) {
        for (let field = 0; field < 6; field++) {
            if (oldBoard[row][field] !== newBoard[row][field]) {
                // check all field below an break
                // if field below are not filled, return false
                // if all field are filled countDiff ++
                if (newBoard[row][field] !== player) return false;
                for (let i = field; i < 6; i++) {
                    if (newBoard[row][i] !== "a" && newBoard[row][i] !== "b") return false;
                }
                countDiff++;

            }
        }
    }
    return countDiff === 1;
}

const result = hasWon(newBoard, player);
console.log(result);

function hasWon(board, player) {

    let winCounter;

    // vertikal
    for (let row = 0; row < 7; row++) {
        winCounter = 0;
        for (let line = 0; line < 6; line++) {
            if (board[row][line] === player) {
                winCounter++;
                if (winCounter >= 4) return true;
            } else {
                winCounter = 0;
            }
        }
    }

    // horizontal
    for (let line = 0; line < 6; line++) {
        winCounter = 0;
        for (let row = 0; row < 7; row++) {
            if (board[row][line] === player) {
                winCounter++;
                if (winCounter >= 4) return true;
            } else {
                winCounter = 0;
            }
        }
    }

    // diagonal rechts
    for (let row = 0; row < 4; row++) {
        for (let line = 3; line < 6; line++) {
            if (board[row][line] === player) {
                if ((board[row][line] === player)
                    && (board[row + 1][line - 1] === player)
                    && (board[row + 2][line - 2] === player)
                    && (board[row + 3][line - 3] === player)) return true;
            }
        }
    }

    // diagonal links
    for (let row = 0; row < 4; row++) {
        for (let line = 0; line < 3; line++) {
            if (board[row][line] === player) {
                if ((board[row][line] === player)
                    && (board[row + 1][line + 1] === player)
                    && (board[row + 2][line + 2] === player)
                    && (board[row + 3][line + 3] === player)) return true;
            }
        }
    }

    return false;
}

function checkDraw(board) {
    for (let row = 0; row < 7; row++) {
        for (let line = 0; line < 6; line++) {
            if (board[row][line] === 0) {
                return false;
            }
        }
    }
    return true;
}