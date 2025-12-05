const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "83c4f67c000826295816c72b682fe8d3"; 


/* ----------------------------------------
   WEATHER ICON FUNCTION (Your Icons8 Icons)
---------------------------------------- */
function getWeatherIcon(condition, description) {
    condition = condition.toLowerCase();
    description = description.toLowerCase();

    // CLEAR SKY
    if (condition === "clear") {
        return "icons/sun.png";
    }

    // CLOUDS
    if (condition === "clouds") {

        // Few / scattered clouds → partly cloudy
        if (description.includes("few") || description.includes("scattered")) {
            return "icons/partly-cloudy.png";
        }

        // Broken / overcast clouds
        if (description.includes("broken") || description.includes("overcast")) {
            return "icons/cloud.png";
        }

        return "icons/cloud.png";
    }

    // RAIN / DRIZZLE
    if (condition === "rain" || condition === "drizzle") {
        return "icons/umbrella.png";
    }

    // THUNDERSTORM
    if (condition === "thunderstorm") {
        return "icons/storm.png";
    }

    // SNOW
    if (condition === "snow") {

        if (description.includes("heavy") || description.includes("storm")) {
            return "icons/snowfall.png"; // heavy snowfall icon
        }

        return "icons/snow.png";
    }

    // FOG / MIST / HAZE / SMOKE / DUST
    if (
        condition === "mist" ||
        condition === "fog" ||
        condition === "haze" ||
        condition === "smoke" ||
        condition === "dust"
    ) {
        return "icons/cloud.png";
    }

    // STRONG WIND / SQUALL / TORNADO
    if (condition === "squall" || condition === "tornado") {
        return "icons/wind-cloud.png";
    }

    // FALLBACK
    return "icons/partly-cloudy.png";
}



/* ----------------------------------------
   CREATE WEATHER CARDS
---------------------------------------- */
const createWeatherCard = (cityName, weatherItem, index) => {

    const icon = getWeatherIcon(
        weatherItem.weather[0].main,
        weatherItem.weather[0].description
    );

    if (index === 0) { // MAIN CURRENT WEATHER CARD
        return `
            <div class="details">
                <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(1)}°C</h6>
                <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                <h6>Humidity: ${weatherItem.main.humidity}%</h6>
            </div>

            <div class="icon">
                <img src="${icon}" class="weather-icon" alt="Weather icon">
                <h6>${weatherItem.weather[0].description}</h6>
            </div>
        `;
    }

    // 5-DAY FORECAST CARD
    return `
        <li class="card">
            <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
            <img src="${icon}" class="weather-icon" alt="Weather icon">
            <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(1)}°C</h6>
            <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
        </li>
    `;
};


/* ----------------------------------------
   FETCH WEATHER DATA
---------------------------------------- */
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {

            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Clear previous UI
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Insert new cards
            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);

                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        })
        .catch(() => alert("An error occurred while fetching weather data."));
};



/* ----------------------------------------
   GET CITY COORDINATES
---------------------------------------- */
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;

    const API_URL =
        `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);

            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => alert("An error occurred while fetching coordinates."));
};



/* ----------------------------------------
   GET USER LOCATION (GEOLOCATION)
---------------------------------------- */
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;

            const API_URL =
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => alert("An error occurred while fetching your city."));
        },

        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Location permission denied. Please enable to use current location.");
            } else {
                alert("Unable to fetch your location.");
            }
        }
    );
};


/* ----------------------------------------
   EVENT LISTENERS
---------------------------------------- */
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
