const displayEl = document.getElementById("display");
const historyEl = document.getElementById("history");

const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

let current = "0";      // number being typed
let previous = null;    // first operand
let operator = null;    // pending operator
let justEvaluated = false;
let hasError = false;

function calculate(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? null : a / b;
  }
}

function format(value) {
  // Avoid floating point noise like 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(value.toPrecision(12)));
}

function updateScreen() {
  displayEl.textContent = current;
  historyEl.textContent =
    previous !== null && operator ? `${previous} ${SYMBOLS[operator]}` : "";

  document.querySelectorAll(".op").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.op === operator && !justEvaluated);
  });
}

function inputNumber(digit) {
  if (hasError) clearAll();
  if (justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
  current = current === "0" ? digit : current + digit;
  updateScreen();
}

function inputDecimal() {
  if (hasError) clearAll();
  if (justEvaluated) {
    current = "0";
    justEvaluated = false;
  }
  if (!current.includes(".")) current += ".";
  updateScreen();
}

function chooseOperator(op) {
  if (hasError) return;
  // Chain operations: 2 + 3 + ... evaluates 2 + 3 first
  if (operator && !justEvaluated && previous !== null) {
    evaluate(true);
    if (hasError) return;
  }
  previous = current;
  operator = op;
  justEvaluated = false;
  current = "0";
  updateScreen();
  // Keep showing the first number until the user types the next one
  displayEl.textContent = previous;
}

function evaluate(isChain = false) {
  if (hasError || operator === null || previous === null) return;

  const secondOperand = current;
  const result = calculate(parseFloat(previous), parseFloat(current), operator);

  if (result === null) {
    current = "Can't divide by 0";
    previous = null;
    operator = null;
    hasError = true;
    updateScreen();
    return;
  }

  current = format(result);
  if (!isChain) {
    const expression = `${previous} ${SYMBOLS[operator]} ${secondOperand} =`;
    previous = null;
    operator = null;
    justEvaluated = true;
    updateScreen();
    historyEl.textContent = expression;
  }
}

function backspace() {
  if (hasError || justEvaluated) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  updateScreen();
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  hasError = false;
  updateScreen();
}

// Button clicks
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else if (btn.dataset.action === "decimal") inputDecimal();
  else if (btn.dataset.action === "equals") evaluate();
  else if (btn.dataset.action === "clear") clearAll();
  else if (btn.dataset.action === "backspace") backspace();
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputNumber(e.key);
  else if (["+", "-", "*", "/"].includes(e.key)) {
    e.preventDefault();
    chooseOperator(e.key);
  }
  else if (e.key === "." ) inputDecimal();
  else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    evaluate();
  }
  else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape" || e.key.toLowerCase() === "c") clearAll();
});

updateScreen();
