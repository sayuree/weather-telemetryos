import { configure, store, proxy } from "@telemetryos/sdk";

configure("weather-forecast-app");
async function fetchLocationsList() {
  try {
    const response = await proxy().fetch(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Astana&key=AIzaSyBRG2lQZ1P9JfEd9o_CnDAxSbM7sobyKfs"
    );

    const data = await response.json();
    const setResult = await store().device.set(
      "locationsList",
      data.predictions
    );
    console.log("Locations list stored:", setResult);
  } catch (error) {
    console.error("Error fetching locations list:", error);
  }
}

export default async function googlePlacesWorker() {
  console.log("🚀 Google Places worker STARTED at", new Date().toISOString());

  // Initial fetch with logging
  console.log("📍 Running initial fetch...");
  await fetchLocationsList();
  console.log("✅ Initial fetch completed");

  const intervalId = setInterval(async () => {
    console.log("⏰ Interval triggered at", new Date().toISOString());
    await fetchLocationsList();
  }, 60 * 60 * 1000);

  console.log("⏱️ Worker scheduled with interval ID:", intervalId);
}
