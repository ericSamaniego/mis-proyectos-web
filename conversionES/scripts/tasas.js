const API_URL = "https://api.frankfurter.app";
const ratesGrid = document.getElementById("ratesGrid");

// Moneda base (Frankfurter usa EUR por defecto)
fetch(`${API_URL}/latest`)
  .then(res => res.json())
  .then(data => {
    const rates = data.rates;

    for (const currency in rates) {
      const card = document.createElement("div");
      card.className = "rate-card";

      card.innerHTML = `
        <h3>${currency}</h3>
        <span>1 EUR</span>
        <div class="rate-value">${rates[currency]}</div>
      `;

      ratesGrid.appendChild(card);
    }
  })
  .catch(err => {
    ratesGrid.innerHTML = "<p>Error cargando las tasas</p>";
    console.error(err);
  });
