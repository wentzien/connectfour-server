require('dotenv').config();
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const app = express();
const {v4: uuidv4} = require("uuid");


const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.static(process.env.PUBLIC_FOLDER));

const gamesRouter = require("./routes/games");
const db = require("./db/mysql");

app.use(cors());
app.use(express.json());

app.use("/api/games", gamesRouter);

io.on("connection", socket => {
    console.log("new connection");

    socket.on("join", async game => {
        // objekt mit playerId & gameId
        const {gameId, playerId} = game;


        if (gameId && playerId) {
            let gameData = await db.getLatestGame(gameId);
            const {aPlayerId, bPlayerId} = gameData;

            if (playerId === aPlayerId || playerId === bPlayerId) {
                socket.join(gameId);

                io.to(gameId).emit("gameData", gameData);
            }
        }
    });

    socket.on("gameProgress", async game => {
        // objekt mit playerId & gameId & neues Board
        const {playerId, gameId, board: newBoard} = game;

        // Status:
        // aTurn: A ist an der Reihe
        // bTurn: B ist an der Reihe
        // aWon: A hat gewonnen
        // bWon: B hat gewonnen
        // draw: unentschieden
        // pending: falls Server noch keine Daten geschickt hat
        // waiting: for other player

        if (gameId && playerId) {
            let gameData = await db.getLatestGame(gameId);
            const {aPlayerId, bPlayerId, board: oldBoard, gameStatus, gameCount} = gameData;

            if ((gameStatus !== "aWon" || gameStatus !== "bWon" || gameStatus !== "draw")
                && ((playerId === aPlayerId && gameStatus === "aTurn" && checkMove(oldBoard, newBoard, "a")
                    || (playerId === bPlayerId && gameStatus === "bTurn" && checkMove(oldBoard, newBoard, "b"))))) {

                const aWon = hasWon(newBoard, "a");
                const bWon = hasWon(newBoard, "b");
                const draw = checkDraw(newBoard);

                if (aWon) {
                    gameData.gameStatus = "aWon";
                    gameData.aScore++;
                } else if (bWon) {
                    gameData.gameStatus = "bWon";
                    gameData.bScore++;
                } else if (draw) {
                    gameData.gameStatus = "draw";
                } else {
                    // anderer Spieler ist am Zug
                    gameData.gameStatus = gameData.gameStatus === "aTurn" ? "bTurn" : "aTurn";
                }

                gameData.board = newBoard;
                await db.updateGame(gameData);
            }
            gameData = await db.getLatestGame(gameId);

            io.to(gameId).emit("gameData", gameData);
        }
    });

    socket.on("nextGame", async game => {
        const {playerId, gameId} = game;
        if (gameId && playerId) {
            let gameData = await db.getLatestGame(gameId);
            let {aPlayerId, bPlayerId, gameStatus, starter, aScore, bScore, gameCount} = gameData;
            if ((gameStatus === "aWon" || gameStatus === "bWon" || gameStatus === "draw")
                && (playerId === aPlayerId || playerId === bPlayerId)) {
                // erst dann ist ein weiteres Spiel möglich

                gameStatus = starter === "b" ? "aTurn" : "bTurn";
                starter = starter === "b" ? "a" : "b";
                gameCount++;

                let gameData = {
                    gameId: gameId,
                    gameCount: gameCount,
                    aPlayerId: aPlayerId,
                    bPlayerId: bPlayerId,
                    board: [
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0, 0]
                    ],
                    aScore: aScore,
                    bScore: bScore,
                    gameStatus: gameStatus,
                    starter: starter
                };

                await db.setGame(gameData);

                gameData = await db.getLatestGame(gameId);

                io.to(gameId).emit("gameData", gameData);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("user left");
    });
});

// Port
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`App listening on port ${port}...)`));


//helper functions
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