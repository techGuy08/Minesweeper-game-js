document.addEventListener("DOMContentLoaded", () => {
  const allRange = document.querySelectorAll(".slider-range");
  allRange.forEach((el) => {
    const ratio = 100 / (+el.max - +el.min);
    const parent = el.parentNode;
    const tooltip = el.previousElementSibling;
    el.addEventListener("input", function () {
      const value = ratio * (this.value - this.min);
      tooltip && (tooltip.textContent = this.value);
      parent.style.setProperty("--value", +value);
      parent.dataset.value = this.value;
    });
    el.dispatchEvent(new Event("input"));
  });
});

window.addEventListener("load", () => {
  let gridCols = 9;
  let gridRows = 9;
  let bombs = 10;
  let gridWidth = gridCols * 30;
  const gameGridEl = document.getElementById("minesweeper-grid");
  const flagSwitchEl = document.getElementById("flagSwitch");
  const bombPercentInputEl = document.getElementById("bombPercentInput");
  let activeGameGrid = createArrGrid(gridCols, gridRows);
  let isGameOver = false;
  let isFlagging = false;
  function createRandomBombs(num) {
    activeGameGrid = activeGameGrid.map((row) =>
      row.map((v) => (Math.abs(v) == 2 ? 1 : v))
    );
    let count = 0;
    while (count < num) {
      let x = Math.floor(Math.random() * gridCols);
      let y = Math.floor(Math.random() * gridRows);
      if (activeGameGrid[y][x] && activeGameGrid[y][x] !== 2) {
        activeGameGrid[y][x] = 2;

        count++;
      }
    }
  }
  function createArrGrid(cols, rows) {
    return new Array(rows).fill(new Array(cols).fill(1));
  }
  function getRevealNumber(x, y) {
    const surroundCellsPos = [
      [x - 1, y - 1],
      [x, y - 1],
      [x + 1, y - 1],
      [x - 1, y],
      [x + 1, y],
      [x - 1, y + 1],
      [x, y + 1],
      [x + 1, y + 1],
    ];
    let count = 0;
    surroundCellsPos.forEach(([x, y]) => {
      if (
        activeGameGrid[y] &&
        activeGameGrid[y][x] &&
        Math.abs(activeGameGrid[y][x]) == 2
      ) {
        count++;
      }
    });

    return count > 0 ? count : "";
  }
  function reavelCell(x, y) {
    const el = document.getElementById("btn-" + x + "-" + y);
    let num = getRevealNumber(x, y);
    if (el && !isGameOver) {
      el.disabled = true;

      if (activeGameGrid[y]) {
        let value = activeGameGrid[y][x];
        if (value !== 2) {
          el.innerHTML = num;
        }
        if (value == 1) {
          activeGameGrid[y][x] = 0;
        } else if (value == 2) {
          isGameOver = true;
          el.classList.add("boom");
          showBombBtns();
        }
      }
      if (num) {
        el.classList.add("color" + (num < 3 ? num : 3));
      }
    }
  }
  function floodReveal(x, y) {
    const surroundCellsPos = [
      [x - 1, y - 1],
      [x, y - 1],
      [x + 1, y - 1],
      [x - 1, y],
      [x + 1, y],
      [x - 1, y + 1],
      [x, y + 1],
      [x + 1, y + 1],
    ];
    let num = getRevealNumber(x, y);
    if (num === "") {
      for (let i = 0; i < surroundCellsPos.length; i++) {
        const [x, y] = surroundCellsPos[i];
        if (activeGameGrid[y] && activeGameGrid[y][x] === 1) {
          let num2 = getRevealNumber(x, y);
          reavelCell(x, y);
          if (num2 > 0) {
            continue;
          } else {
            setTimeout(() => {
              floodReveal(x, y);
            }, 60);
          }
        }
      }
    }
  }
  function showBombBtns() {
    activeGameGrid.forEach((row, y) => {
      row.forEach((cell, x) => {
        const el = document.getElementById("btn-" + x + "-" + y);
        if (Math.abs(cell) == 2 && el && !el.classList.contains("boom")) {
          el.classList.add("bomb");
        }
      });
    });
  }
  function cellFlaggingClick(x, y, el) {
    if (activeGameGrid[y] && activeGameGrid[y][x]) {
      if (
        activeGameGrid.flat(Infinity).filter((v) => v < 0).length === bombs &&
        activeGameGrid[y][x] > 0
      ) {
        return false;
      }
      activeGameGrid[y][x] *= -1;
      if (activeGameGrid[y][x] > 0) {
        el.classList.remove("flagged");
      } else {
        el.classList.add("flagged");
      }
    }
  }
  function cellClick([x, y], el) {
    if (!isGameOver) {
      if (isFlagging) {
        cellFlaggingClick(x, y, el);
      } else if (!isFlagging && !el.classList.contains("flagged")) {
        reavelCell(x, y);
        floodReveal(x, y);
      }
      checkGameEnd();
    }
  }
  function createBtnGrid() {
    gameGridEl.innerHTML = "";
    activeGameGrid.forEach((row, y) => {
      row.forEach((col, x) => {
        const btn = document.createElement("button");
        btn.id = "btn-" + x + "-" + y;
        btn.addEventListener("click", (e) => {
          cellClick([x, y], btn);
        });
        gameGridEl.insertAdjacentElement("beforeend", btn);
      });
    });
  }
  function flagSwitchClick() {
    isFlagging = !isFlagging;
    if (isFlagging) {
      flagSwitchEl.classList.add("on");
    } else {
      flagSwitchEl.classList.remove("on");
    }
  }
  function checkGameEnd() {
    let isGameEnded = false;
    const checkEndGateArr = [
      activeGameGrid.flat(Infinity).every((v) => Math.abs(v) == 2 || v == 0),
      activeGameGrid.flat(Infinity).filter((v) => v === -2).length === bombs,
    ];

    if (checkEndGateArr.some((v) => v)) {
      isGameEnded = true;
    }
    if (isGameEnded) {
      isGameOver = true;
      showBombBtns();
      alert("Congrats! You've won this Round");
    }
    return false;
  }
  function resetGame() {
    activeGameGrid = createArrGrid(gridCols, gridRows);
    createRandomBombs(bombs);
    for (let i = 0; i <= gameGridEl.children.length; i++) {
      if (i == gameGridEl.children.length) {
        setTimeout(() => {
          createBtnGrid();
        }, 10 * i);
        break;
      }
      setTimeout(() => {
        gameGridEl.children[i].disabled = true;
      }, 10 * i);
    }

    gameGridEl.style.width = gridWidth + "px";
    isGameOver = false;
    isFlagging = false;
    flagSwitchEl.classList.remove("on");
    bombPercentInputEl.min = 1;
    bombPercentInputEl.max = gridCols * gridRows - 1;
  }
  function bombPercentChange(e) {
    let value = +bombPercentInputEl.value;

    bombs = value;
    resetGame();
  }

  resetGame();

  document.getElementById("reset").addEventListener("click", resetGame);
  flagSwitchEl.addEventListener("click", flagSwitchClick);
  bombPercentInputEl.addEventListener("change", bombPercentChange);
  document.getElementById("randomHint").addEventListener("click", function () {
    if (!isGameOver) {
      const btnEls = [
        ...document.querySelectorAll(
          "#minesweeper-grid button:not(.hinted):not(:disabled)"
        ),
      ].filter((el) => {
        let pos = el.id.replace("btn-", "").split("-");
        return Math.abs(activeGameGrid[pos[1]][pos[0]]) !== 2;
      });
      let i = Math.floor(Math.random() * btnEls.length);
      if (btnEls[i]) {
        let pos = btnEls[i].id.replace("btn-", "").split("-");
        btnEls[i].innerHTML = getRevealNumber(+pos[0], +pos[1]);
        btnEls[i].classList.add("hinted");
      }
      if (btnEls.length == 0) {
        alert(
          "Oops, we are out of Hints!!\nBut Here is a Tip: \nA bomb is not numbered and will have 8 number cells around it unless there is a bomb there too"
        );
      }
    }
  });
});
