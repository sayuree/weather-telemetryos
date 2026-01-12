import { store, proxy } from "@telemetryos/sdk";

async function getCurrentWeather() {
  try {
    const response = await proxy().fetch(
      "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}"
    );
    const results = await response.json();
    await store().device.set("currentWeather", results);
    console.log("Current weather data:", results);
  } catch (error) {
    console.error("Error fetching current weather data:", error);
  }
}

async function getForecast() {
  try {
    const response = await proxy().fetch(
      "https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}"
    );
    const results = await response.json();
    await store().device.set("weatherForecast", results);
    console.log("Weather forecast data:", results);
  } catch (error) {
    console.error("Error fetching weather forecast data:", error);
  }
}

export default async function openWeatherMapWorker() {
  console.log("🚀 OpenWeatherMap worker STARTED at", new Date().toISOString());

  // Initial fetch with logging
  console.log("🌤️ Running initial weather fetch...");
  await getCurrentWeather();
  await getForecast();
  console.log("✅ Initial weather fetch completed");

  const intervalId = setInterval(async () => {
    console.log(
      "⏰ Weather fetch interval triggered at",
      new Date().toISOString()
    );
    await getCurrentWeather();
  }, 30 * 60 * 1000); // Fetch every 30 minutes

  console.log("⏱️ Worker scheduled with interval ID:", intervalId);
}
