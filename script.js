const preloadBackgrounds = () => {
  const backgrounds = [
    "img/home-cat.webp",
    "img/nublado.webp",
    "img/lluvia.webp",
    "img/soleado.webp",
    "img/nieve.webp",
    "img/tormenta.webp"
  ];

  backgrounds.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

window.addEventListener("DOMContentLoaded", preloadBackgrounds);

// traducciones a la UI
function applyLanguage(lang) {
  const t = translations[lang];
  document.getElementById("search").placeholder = t.placeholder;
  document.getElementById("submit").value = t.searchBtn;
}


window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "es";
  document.getElementById("lang-select").value = savedLang;
  applyLanguage(savedLang);
});

document.getElementById("lang-select").addEventListener("change", (e) => {
  const newLang = e.target.value;
  localStorage.setItem("lang", newLang); 
  applyLanguage(newLang); 
});



async function fetchWeather() {
  let searchInput = document.getElementById("search").value.trim();
  const weatherDataSection = document.getElementById("weather-data");
  const lang = document.getElementById("lang-select").value || "en";
  const t = translations[lang];
  const apiKey = "4859d08d072e174a6d40e92ffeaf469f";

  weatherDataSection.style.display = "block";

  // aplicar idioma 
  applyLanguage(lang);

  if (searchInput === "") {
    weatherDataSection.innerHTML = `
      <div>
        <h2>${t.emptyTitle}</h2>
        <p>${t.emptyMsg}</p>
      </div>`;
    return;
  }

  async function getLonAndLat() {
    const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${searchInput}&limit=5&appid=${apiKey}`;
    const response = await fetch(geocodeURL);
    if (!response.ok) return;

    const data = await response.json();
    if (data.length === 0) {
      weatherDataSection.innerHTML = `
        <div>
          <h2>${t.invalidTitle}: "${searchInput}"</h2>
          <p>${t.invalidMsg}</p>
        </div>`;
      return;
    } else if (data.length === 1) {
      getWeatherData(data[0].lon, data[0].lat, `${data[0].name}, ${data[0].country}`);
    } else {
      let options = data.map(
        city => `<option value="${city.lat},${city.lon}">
                   ${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}
                 </option>`
      ).join("");

      weatherDataSection.innerHTML = `
        <div>
          <h2>${t.multiple}</h2>
          <select id="city-select">
            <option disabled selected>--</option>
            ${options}
          </select>
        </div>
      `;

      document.getElementById("city-select").addEventListener("change", (e) => {
        const [lat, lon] = e.target.value.split(",");
        const label = e.target.options[e.target.selectedIndex].text;
        getWeatherData(lon, lat, label);
      });
    }
  }

  async function getWeatherData(lon, lat, label) {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=${lang}&units=metric`;
    const response = await fetch(weatherURL);
    if (!response.ok) return;

    const data = await response.json();

    // cambiar fondo según clima
    const weatherMain = data.weather[0].main.toLowerCase();
    const body = document.body;

    if (weatherMain.includes("cloud")) {
      body.style.backgroundImage = "url('img/nublado.webp')";
    } else if (weatherMain.includes("rain")) {
      body.style.backgroundImage = "url('img/lluvia.webp')";
    } else if (weatherMain.includes("clear")) {
      body.style.backgroundImage = "url('img/soleado.webp')";
    } else if (weatherMain.includes("snow")) {
      body.style.backgroundImage = "url('img/nieve.webp')";
    } else if (weatherMain.includes("thunder")) {
      body.style.backgroundImage = "url('img/tormenta.webp')";
    } else {
      body.style.backgroundImage = "url('img/home-cat.webp')";
    }

    const img = new Image();
      img.src = newBg;
      img.onload = () => {
        body.style.backgroundImage = `url('${newBg}')`;
        body.style.backgroundSize = "cover";
        body.style.backgroundPosition = "center";
  };
    weatherDataSection.style.display = "flex";
    weatherDataSection.innerHTML = `
      <div class="fade-in" style="display:flex; align-items:center; gap:15px;">
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" 
             alt="${data.weather[0].description}" width="100" />
        <div>
          <h2>${label || data.name}</h2>
          <p><strong>${t.temp}:</strong> ${Math.round(data.main.temp)}°C</p>
          <p><strong>${t.desc}:</strong> ${data.weather[0].description}</p>
        </div>
      </div>`;
  }

  const geocodeData = await getLonAndLat();
  if (geocodeData) {
    getWeatherData(geocodeData.lon, geocodeData.lat);
  }

  document.getElementById("search").value = "";
}
