const oldBoard = [
    [0, 0, 0, 0, "a", "b"],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
];

const newBoard = [
    [0, 0, 0, 0, "a", "b"],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, "a"],
];

const player = "a";

const result = checkMove(oldBoard, newBoard, player);
console.log(result);

function checkMove(oldBoard, newBoard, player) {
    let countDiff = 0;
    for (let row = 0; row < 7; row++) {
        for (let fields = 0; fields < 6; fields++) {
            if (oldBoard[row][fields] !== newBoard[row][fields]) {
                // check all fields below an break
                // if fields below are not filled, return false
                // if all fields are filled countDiff ++
                if(newBoard[row][fields] !== player) return false;
                for (let i = fields; i < 6; i++) {
                    if (newBoard[row][i] !== "a" && newBoard[row][i] !== "b") return false;
                }
                countDiff++;

            }
        }
    }
    return countDiff === 1;
}