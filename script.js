const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const keys = document.querySelectorAll(".key");

let current = "0";
let previous = null;
let operator = null;
let justEvaluated = false;

const OP_SYMBOLS = { "+": "+", "−": "-", "×": "*", "÷": "/" };

function formatNumber(numStr) {
    if (numStr === "Error") return numStr;
    const num = Number(numStr);
    if (!isFinite(num)) return "Error";

    let str = num.toString();
    if (str.length > 12) {
        str = num.toPrecision(8).toString();
        if (str.includes(".")) {
            str = str.replace(/0+$/, "").replace(/\.$/, "");
        }
        if (Math.abs(num) >= 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
            str = num.toExponential(4);
        }
    }
    return str;
}

function updateScreen() {
    resultEl.textContent = formatNumber(current);

    if (operator && previous !== null) {
        expressionEl.textContent = `${formatNumber(previous)} ${operator}`;
    } else {
        expressionEl.textContent = "\u00A0";
    }

    resultEl.classList.remove("pulse");
    void resultEl.offsetWidth;
    resultEl.classList.add("pulse");
}

function inputDigit(digit) {
    if (current === "Error" || justEvaluated) {
        current = digit;
        justEvaluated = false;
        clearActiveOperator();
    } else if (current === "0") {
        current = digit;
    } else {
        current += digit;
    }
    updateScreen();
}

function inputDecimal() {
    if (current === "Error" || justEvaluated) {
        current = "0.";
        justEvaluated = false;
        clearActiveOperator();
        updateScreen();
        return;
    }
    if (!current.includes(".")) {
        current += ".";
        updateScreen();
    }
}

function compute(a, op, b) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? NaN : a / b;
        default: return b;
    }
}

function setOperator(symbol) {
    if (current === "Error") return;

    if (operator && previous !== null && !justEvaluated) {
        const result = compute(parseFloat(previous), OP_SYMBOLS[operator], parseFloat(current));
        previous = isNaN(result) ? "Error" : result;
        current = previous;
    } else {
        previous = current;
    }

    operator = symbol;
    justEvaluated = false;
    highlightOperator(symbol);

    if (current === "Error") {
        previous = null;
        operator = null;
    }

    updateScreen();
}

function highlightOperator(symbol) {
    keys.forEach(k => k.classList.remove("is-active"));
    if (!symbol) return;
    const btn = document.querySelector(`.key--op[data-op="${symbol}"]`);
    if (btn) btn.classList.add("is-active");
}

function clearActiveOperator() {
    if (justEvaluated) highlightOperator(null);
}

function evaluate() {
    if (operator === null || previous === null || current === "Error") return;

    const result = compute(parseFloat(previous), OP_SYMBOLS[operator], parseFloat(current));
    current = isNaN(result) ? "Error" : result.toString();
    previous = null;
    operator = null;
    justEvaluated = true;
    highlightOperator(null);
    updateScreen();
}

function percent() {
    if (current === "Error") return;
    current = (parseFloat(current) / 100).toString();
    updateScreen();
}

function backspace() {
    if (current === "Error" || justEvaluated) {
        clearAll();
        return;
    }
    current = current.length > 1 ? current.slice(0, -1) : "0";
    updateScreen();
}

function clearAll() {
    current = "0";
    previous = null;
    operator = null;
    justEvaluated = false;
    highlightOperator(null);
    updateScreen();
}

function handleAction(el) {
    const action = el.dataset.action;

    if (action === "digit") inputDigit(el.dataset.digit);
    else if (action === "decimal") inputDecimal();
    else if (action === "operator") setOperator(el.dataset.op);
    else if (action === "equals") evaluate();
    else if (action === "percent") percent();
    else if (action === "backspace") backspace();
    else if (action === "clear") clearAll();
}

keys.forEach(key => {
    key.addEventListener("click", () => handleAction(key));
});

window.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
    } else if (e.key === ".") {
        inputDecimal();
    } else if (e.key === "+" || e.key === "-") {
        setOperator(e.key === "+" ? "+" : "−");
    } else if (e.key === "*") {
        setOperator("×");
    } else if (e.key === "/") {
        e.preventDefault();
        setOperator("÷");
    } else if (e.key === "Enter" || e.key === "=") {
        evaluate();
    } else if (e.key === "Backspace") {
        backspace();
    } else if (e.key === "Escape") {
        clearAll();
    } else if (e.key === "%") {
        percent();
    }
});

updateScreen();
