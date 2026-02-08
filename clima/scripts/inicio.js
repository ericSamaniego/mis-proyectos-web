// ===============================
// CLIMA - Open Meteo (Gratis)
// ===============================

// Asunción por defecto
cargarClima(-25.2637, -57.5759, "Asunción, PY");

// Buscar con Enter
document.getElementById("cityInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    buscarCiudad();
  }
});

function buscarCiudad() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;

  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=es`)
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        alert("Ciudad no encontrada");
        return;
      }

      const { latitude, longitude, name, country } = data.results[0];
      cargarClima(latitude, longitude, `${name}, ${country}`);
    })
    .catch(() => alert("Error buscando la ciudad"));
}

function cargarClima(lat, lon, nombre) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      mostrarClima(data, nombre);
    })
    .catch(() => alert("Error cargando el clima"));
}

function mostrarClima(data, nombre) {
  // Location
  document.getElementById("location").innerHTML = `
    <h2>${nombre}</h2>
  `;

  // Detectar lluvia
  const llueveAhora = data.hourly.precipitation[0] > 0;
  const llueveHoy = data.daily.precipitation_sum[0] > 0;

  // Weather code
  const weatherCode = data.current_weather.weathercode;

  let estadoClima = "";
  let imagen = "";

  if (weatherCode === 0) {
    estadoClima = "Soleado";
    imagen = "imagenes/soleado.jpeg";
  } else if (weatherCode <= 3) {
    estadoClima = "Parcialmente nublado";
    imagen = "imagenes/nublado.jpeg";
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    estadoClima = "Lluvia";
    imagen = "imagenes/lluvia.jpeg";
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    estadoClima = "Nieve";
    imagen = "imagenes/nieve.jpeg";
  } else if (weatherCode >= 95) {
    estadoClima = "Tormenta";
    imagen = "imagenes/tormenta.jpeg";
  } else {
    estadoClima = "Nublado";
    imagen = "imagenes/nublado.jpeg";
  }

  // Temperatura grande
  document.getElementById("tempOnly").innerHTML = `
    ${data.current_weather.temperature}°C
  `;

  // Current completo (para el grid)
  document.getElementById("current").innerHTML = `
    <div>🌡️ Temperatura</div><div>${data.current_weather.temperature}°C</div>
    <div>🌤️ Estado</div><div>${estadoClima}</div>
    <div>🌧️ Ahora</div><div>${llueveAhora ? "Sí" : "No"}</div>
    <div>☔ Hoy</div><div>${llueveHoy ? "Posible lluvia" : "Sin lluvia"}</div>
  `;

  // Imagen
  document.getElementById("weatherImage").innerHTML = `
    <img src="${imagen}" alt="${estadoClima}">
  `;

  // Hourly horizontal
  let hourlyHTML = "<ul>";
  for (let i = 0; i < 12; i++) {
    const hora = data.hourly.time[i].split("T")[1];
    hourlyHTML += `<li>${hora}<br>${data.hourly.temperature_2m[i]}°C</li>`;
  }
  hourlyHTML += "</ul>";
  document.getElementById("hourly").innerHTML = hourlyHTML;

  // Daily vertical
  const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  let dailyHTML = "<ul>";

  for (let i = 1; i <= 7 && i < data.daily.time.length; i++) {
    const fecha = new Date(data.daily.time[i]);
    const dia = diasSemana[fecha.getDay()];
    dailyHTML += `
      <li>
        <strong>${dia}</strong><br>
        ⬆️ ${data.daily.temperature_2m_max[i]}°C | ⬇️ ${data.daily.temperature_2m_min[i]}°C
      </li>
    `;
  }

  dailyHTML += "</ul>";
  document.getElementById("daily").innerHTML = dailyHTML;
}
