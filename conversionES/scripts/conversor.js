// -----------------------------
//  CONFIGURACIÓN GENERAL
// -----------------------------
const API_URL = "https://api.frankfurter.app";

const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const amountInput = document.getElementById("amount");
const resultInput = document.getElementById("result");
const swapBtn = document.getElementById("swapBtn");

const rangeButtons = document.querySelectorAll(".range-btn");
const chartTitle = document.getElementById("chart-title");

let currentRange = "1M";
let chart;

// -----------------------------
// 1. CARGAR LISTA DE MONEDAS
// -----------------------------
async function loadCurrencies() {
    try {
        const response = await fetch(`${API_URL}/currencies`);
        const data = await response.json();

        fromSelect.innerHTML = "";
        toSelect.innerHTML = "";

        Object.keys(data).forEach(code => {
            const op1 = document.createElement("option");
            const op2 = document.createElement("option");

            op1.value = code;
            op2.value = code;

            op1.textContent = `${code} - ${data[code]}`;
            op2.textContent = `${code} - ${data[code]}`;

            fromSelect.appendChild(op1);
            toSelect.appendChild(op2);
        });

        fromSelect.value = "USD";
        toSelect.value = "EUR";

        convertCurrency();
        loadChart();

    } catch (error) {
        console.error("Error cargando monedas:", error);
    }
}

loadCurrencies();


// -----------------------------
// 2. CONVERTIR DIVISAS
// -----------------------------
async function convertCurrency() {
    const from = fromSelect.value;
    const to = toSelect.value;
    const amount = amountInput.value || 1;

    try {
        if (from === to) {
            resultInput.value = amount;
            return;
        }

        const response = await fetch(`${API_URL}/latest?amount=${amount}&from=${from}&to=${to}`);
        const data = await response.json();

        resultInput.value = data.rates[to].toFixed(4);

    } catch (error) {
        console.error("Error en conversión:", error);
    }
}

amountInput.addEventListener("input", convertCurrency);
fromSelect.addEventListener("change", () => {
    convertCurrency();
    loadChart();
});
toSelect.addEventListener("change", () => {
    convertCurrency();
    loadChart();
});


// -----------------------------
// 3. BOTÓN SWAP
// -----------------------------
swapBtn.addEventListener("click", () => {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;

    convertCurrency();
    loadChart();
});


// -----------------------------
// 4. HISTÓRICO PARA GRÁFICA
// -----------------------------
function getRangeDates(range) {
    const end = new Date();
    const start = new Date();

    switch (range) {
        case "1D": start.setDate(end.getDate() - 1); break;
        case "5D": start.setDate(end.getDate() - 5); break;
        case "1M": start.setMonth(end.getMonth() - 1); break;
        case "6M": start.setMonth(end.getMonth() - 6); break;
        case "1Y": start.setFullYear(end.getFullYear() - 1); break;
    }

    return {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0]
    };
}


async function loadChart() {
    const from = fromSelect.value;
    const to = toSelect.value;
    const range = getRangeDates(currentRange);

    try {
        if (from === to) {
            chartTitle.textContent = "No disponible (misma moneda)";
            return;
        }

        const url = `${API_URL}/${range.start}..${range.end}?from=${from}&to=${to}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.rates) {
            console.error("Sin datos de histórico:", data);
            return;
        }

        const labels = Object.keys(data.rates).sort();
        const values = labels.map(date => data.rates[date][to]);

        chartTitle.textContent = `Histórico: ${from} → ${to}`;

        if (chart) chart.destroy();

        const ctx = document.getElementById("currencyChart").getContext("2d");

        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: `${from} → ${to}`,
                    data: values,
                    borderWidth: 2,
                    borderColor: "#4cafef",
                    backgroundColor: "rgba(78, 172, 239, 0.1)",
                    tension: 0.3,
                    fill: true,
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: "#c9d1d9" }, grid: { color: "#1b1f24" } },
                    y: { ticks: { color: "#c9d1d9" }, grid: { color: "#1b1f24" } }
                }
            }
        });

    } catch (error) {
        console.error("Error cargando gráfica:", error);
    }
}


// -----------------------------
// 5. CAMBIO DE RANGO
// -----------------------------
rangeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        rangeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentRange = btn.textContent;
        loadChart();
    });
});
