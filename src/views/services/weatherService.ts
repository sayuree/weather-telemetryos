import { proxy, store } from "@telemetryos/sdk";
import type { PlacePrediction } from "../types";

interface FetchPredictionsOptions {
  input: string;
  onSuccess: (predictions: PlacePrediction[]) => void;
  onError?: (error: any) => void;
}

export async function fetchPlacePredictions({
  input,
  onSuccess,
  onError,
}: FetchPredictionsOptions): Promise<void> {
  if (!input || input.length < 2) {
    onSuccess([]);
    return;
  }

  try {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error("Google Places API key not configured");
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&types=(cities)&key=${apiKey}`;

    const response = await proxy().fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "OK" && data.predictions) {
      console.log(
        `✅ Got ${data.predictions.length} predictions for "${input}"`
      );
      onSuccess(data.predictions);
    } else if (data.status === "ZERO_RESULTS") {
      onSuccess([]);
    } else {
      console.error("API error:", data.status);
      onSuccess([]);
    }
  } catch (err) {
    console.error("Error fetching predictions:", err);
    onSuccess([]);
    if (onError) onError(err);
  }
}

interface FetchWeatherDataOptions {
  cityName: string;
  scale: string;
  language: string;
  onWeatherData?: (data: any) => void;
  onForecastData?: (data: any) => void;
  onError?: (error: any) => void;
}

export async function fetchWeatherData({
  cityName,
  scale,
  language,
  onWeatherData,
  onForecastData,
  onError,
}: FetchWeatherDataOptions): Promise<void> {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.error("OpenWeatherMap API key not configured");
      return;
    }

    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      cityName
    )}&limit=1&appid=${apiKey}`;

    const geoResponse = await proxy().fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error(`Geocoding HTTP ${geoResponse.status}`);
    }
    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      throw new Error("Location not found");
    }

    const { lat, lon, name, country } = geoData[0];

    const units = scale === "Fahrenheit" ? "imperial" : "metric";

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=${language}`;

    const weatherResponse = await proxy().fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error(`Weather HTTP ${weatherResponse.status}`);
    }

    const data = await weatherResponse.json();
    if (onWeatherData) onWeatherData(data);

    await store().instance.set("currentWeather", data);
    console.log("💾 Weather data stored");

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=${language}`;

    const forecastResponse = await proxy().fetch(forecastUrl);

    if (!forecastResponse.ok) {
      throw new Error(`Forecast HTTP ${forecastResponse.status}`);
    }

    const forecast = await forecastResponse.json();

    if (onForecastData) onForecastData(forecast);

    await store().instance.set("forecastWeather", forecast);
    console.log("💾 Forecast data stored");
  } catch (err) {
    console.error("❌ Error fetching weather:", err);
    if (onWeatherData) onWeatherData(null);
    if (onForecastData) onForecastData(null);
    if (onError) onError(err);
  }
}
