const boardEl = document.getElementById("board");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const resetScoreBtn = document.getElementById("resetScore");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");

const SIZE = 4;

let board = Array(SIZE * SIZE).fill("");
let currentPlayer = "X";
let gameActive = true;
let scores = loadScores();

// জেতার সব লাইন: ৪ সারি, ৪ কলাম, ২ কোণাকুণি
const winPatterns = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  [0, 5, 10, 15], [3, 6, 9, 12]
];

// ঘরগুলো তৈরি
for (let i = 0; i < SIZE * SIZE; i++) {
  const btn = document.createElement("button");
  btn.className = "cell";
  btn.dataset.index = i;
  btn.setAttribute("aria-label", "ঘর " + (i + 1));
  boardEl.appendChild(btn);
}
const cells = boardEl.querySelectorAll(".cell");

function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function loadScores() {
  try {
    const saved = JSON.parse(localStorage.getItem("ttt4-scores"));
    if (saved && typeof saved.X === "number") return saved;
  } catch (e) {}
  return { X: 0, O: 0, D: 0 };
}

function saveScores() {
  try {
    localStorage.setItem("ttt4-scores", JSON.stringify(scores));
  } catch (e) {}
}

function updateScoreboard() {
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
}

function checkWinner() {
  for (const [a, b, c, d] of winPatterns) {
    if (
      board[a] !== "" &&
      board[a] === board[b] &&
      board[a] === board[c] &&
      board[a] === board[d]
    ) {
      return [a, b, c, d];
    }
  }
  return null;
}

function handleCellClick(e) {
  const cell = e.currentTarget;
  const index = Number(cell.dataset.index);

  if (!gameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add("taken", currentPlayer.toLowerCase());
  vibrate(30);

  const winPattern = checkWinner();

  if (winPattern) {
    winPattern.forEach((i) => cells[i].classList.add("win"));
    statusText.textContent = `🎉 Player ${currentPlayer} জিতেছে!`;
    scores[currentPlayer]++;
    saveScores();
    updateScoreboard();
    gameActive = false;
    vibrate([100, 60, 100]);
    return;
  }

  if (!board.includes("")) {
    statusText.textContent = "গেম ড্র হয়েছে!";
    scores.D++;
    saveScores();
    updateScoreboard();
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer} এর পালা`;
}

function restartGame() {
  board = Array(SIZE * SIZE).fill("");
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = "Player X এর পালা";

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "x", "o", "win");
  });
}

function resetScores() {
  scores = { X: 0, O: 0, D: 0 };
  saveScores();
  updateScoreboard();
  restartGame();
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
restartBtn.addEventListener("click", restartGame);
resetScoreBtn.addEventListener("click", resetScores);

updateScoreboard();

// অফলাইনে চালানোর জন্য (শুধু https হোস্টিং এ কাজ করবে)
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}