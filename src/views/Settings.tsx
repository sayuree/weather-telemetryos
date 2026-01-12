import { useEffect, useState, FormEvent } from "react";
import { store } from "@telemetryos/sdk";
import { format } from "date-fns";
import type { ViewConfig, ViewId } from "./ViewConfig";
import {
  DEFAULT_CONFIG,
  SUPPORTED_LANGUAGES,
  THEME_OPTIONS,
} from "./constants";
import type { PlacePrediction } from "./types";
import {
  fetchPlacePredictions,
  fetchWeatherData as fetchWeatherDataService,
} from "./services/weatherService";
import Field from "./components/Field";
import "./Settings.css";

export default function Settings() {
  const [config, setConfig] = useState<ViewConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locationInput, setLocationInput] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [dateTimeOption, setDateTimeOption] = useState("Default");
  const [dateFormat, setDateFormat] = useState("MMM-d");
  const [timeFormat, setTimeFormat] = useState("h:mm a");

  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [forecastData, setForecastData] = useState<any>(null);

  const [scale, setScale] = useState("Celsius");
  const [language, setLanguage] = useState("en");

  const [selectedCity, setSelectedCity] = useState<string>("");

  // Generate current date/time format examples using date-fns
  const getCurrentDateFormats = () => {
    const now = new Date();

    return {
      "MMM-d": format(now, "MMM-d"),
      "EEEE, MMMM d": format(now, "EEEE, MMMM d"),
      "MM/dd": format(now, "MM/dd"),
      "dd/MM": format(now, "dd/MM"),
      "MMMM d, yyyy": format(now, "MMMM d, yyyy"),
      "d MMM yyyy": format(now, "d MMM yyyy"),
    };
  };

  const getCurrentTimeFormats = () => {
    const now = new Date();

    return {
      "h:mm a": format(now, "h:mm a"),
      "h:mm:ss a": format(now, "h:mm:ss a"),
      "HH:mm": format(now, "HH:mm"),
      "HH:mm:ss": format(now, "HH:mm:ss"),
    };
  };

  const dateFormats = getCurrentDateFormats();
  const timeFormats = getCurrentTimeFormats();

  useEffect(() => {
    store()
      .instance.get<ViewConfig>("viewConfig")
      .then((saved) => {
        if (saved) setConfig(saved);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (selectedCity) {
      console.log("🔄 Settings changed, refetching weather for:", selectedCity);
      handleFetchWeatherData(selectedCity);
    }
  }, [scale, language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showPredictions && locationInput) {
        setSearchLoading(true);
        fetchPlacePredictions({
          input: locationInput,
          onSuccess: (predictions) => {
            setPredictions(predictions);
            setSearchLoading(false);
          },
          onError: () => {
            setSearchLoading(false);
          },
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locationInput, showPredictions]);

  const handleFetchWeatherData = (cityName: string) => {
    setWeatherLoading(true);
    fetchWeatherDataService({
      cityName,
      scale,
      language,
      onWeatherData: (data) => setWeatherData(data),
      onForecastData: (data) => setForecastData(data),
      onError: () => {
        setWeatherLoading(false);
      },
    }).finally(() => {
      setWeatherLoading(false);
    });
  };

  const handleLocationSelect = (prediction: PlacePrediction) => {
    setLocationInput(prediction.description);
    setShowPredictions(false);
    setPredictions([]);

    store().instance.set("selectedLocation", prediction);
    console.log("Selected location:", prediction.description);

    const cityName = prediction.structured_formatting.main_text;
    setSelectedCity(cityName);
    handleFetchWeatherData(cityName);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const success = await store().instance.set("viewConfig", config);
      if (!success) throw new Error("Failed to save configuration");

      // Generate formatted date and time values
      const now = new Date();
      let formattedDate = "";
      let formattedTime = "";

      if (dateTimeOption === "Default") {
        formattedDate = now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });
        formattedTime = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (dateTimeOption === "Custom") {
        formattedDate = format(now, dateFormat);
        formattedTime = format(now, timeFormat);
      }

      await store().instance.set("dateTimeSettings", {
        option: dateTimeOption,
        dateFormat: dateFormat,
        timeFormat: timeFormat,
        formattedDate: formattedDate,
        formattedTime: formattedTime,
      });
      console.log("💾 Date/time settings saved");

      await store().instance.set("scaleSettings", {
        scale: scale,
      });
      console.log("💾 Scale settings saved");

      await store().instance.set("languageSettings", {
        language: language,
      });
      console.log("💾 Language settings saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSave}>
        <div className="form">
          <Field
            label="Name"
            required
            tooltip="The name will be displayed in your Assets lists."
          >
            <input placeholder="Give your wall a name" />
          </Field>

          <Field label="Scale" required={true} tooltip="Weather Scale">
            <select
              value={scale}
              onChange={(e) => {
                const newScale = e.target.value;
                setScale(newScale);
                store().instance.set("scaleSettings", { scale: newScale });
              }}
            >
              <option>Celsius</option>
              <option>Fahrenheit</option>
            </select>
          </Field>

          <Field
            label="Location"
            required
            tooltip="Location that will show up on the wall, also used for City Themes images."
          >
            <div className="location-container">
              <input
                value={locationInput}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  setShowPredictions(true);
                }}
                onFocus={() => setShowPredictions(true)}
                onBlur={() => {
                  setTimeout(() => setShowPredictions(false), 200);
                }}
                placeholder="Search for a location..."
              />

              {searchLoading && (
                <div className="loading-indicator">Loading...</div>
              )}

              {showPredictions && predictions.length > 0 && (
                <div className="predictions-dropdown">
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.place_id}
                      onMouseDown={() => handleLocationSelect(prediction)}
                      className="prediction-item"
                    >
                      <div className="prediction-main">
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className="prediction-secondary">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showPredictions &&
                predictions.length === 0 &&
                locationInput.length >= 2 &&
                !searchLoading && (
                  <div className="no-results">No locations found</div>
                )}
            </div>
          </Field>

          <Field label="Language" required={false}>
            <select
              value={language}
              onChange={(e) => {
                const newLanguage = e.target.value;
                setLanguage(newLanguage);
                store().instance.set("languageSettings", {
                  language: newLanguage,
                });
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date & Time" required={false}>
            <select
              value={dateTimeOption}
              onChange={(e) => {
                const newOption = e.target.value;
                setDateTimeOption(newOption);

                const now = new Date();
                let formattedDate = "";
                let formattedTime = "";

                if (newOption === "Default") {
                  formattedDate = now.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  });
                  formattedTime = now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                } else if (newOption === "Custom") {
                  formattedDate = format(now, dateFormat);
                  formattedTime = format(now, timeFormat);
                }

                store().instance.set("dateTimeSettings", {
                  option: newOption,
                  dateFormat: dateFormat,
                  timeFormat: timeFormat,
                  formattedDate: formattedDate,
                  formattedTime: formattedTime,
                });
              }}
            >
              <option>Default</option>
              <option>Custom</option>
              <option>Do Not Show</option>
            </select>
          </Field>

          {dateTimeOption === "Custom" && (
            <>
              <Field label="Date Format" required={false}>
                <select
                  value={dateFormat}
                  onChange={(e) => {
                    const newFormat = e.target.value;
                    setDateFormat(newFormat);

                    const now = new Date();
                    const formattedDate = format(now, newFormat);
                    const formattedTime = format(now, timeFormat);

                    store().instance.set("dateTimeSettings", {
                      option: dateTimeOption,
                      dateFormat: newFormat,
                      timeFormat: timeFormat,
                      formattedDate: formattedDate,
                      formattedTime: formattedTime,
                    });
                  }}
                >
                  <option value="MMM-d">{dateFormats["MMM-d"]}</option>
                  <option value="EEEE, MMMM d">
                    {dateFormats["EEEE, MMMM d"]}
                  </option>
                  <option value="MM/dd">{dateFormats["MM/dd"]}</option>
                  <option value="dd/MM">{dateFormats["dd/MM"]}</option>
                  <option value="MMMM d, yyyy">
                    {dateFormats["MMMM d, yyyy"]}
                  </option>
                  <option value="d MMM yyyy">
                    {dateFormats["d MMM yyyy"]}
                  </option>
                </select>
              </Field>

              <Field label="Time Format" required={false}>
                <select
                  value={timeFormat}
                  onChange={(e) => {
                    const newFormat = e.target.value;
                    setTimeFormat(newFormat);

                    const now = new Date();
                    const formattedDate = format(now, dateFormat);
                    const formattedTime = format(now, newFormat);

                    store().instance.set("dateTimeSettings", {
                      option: dateTimeOption,
                      dateFormat: dateFormat,
                      timeFormat: newFormat,
                      formattedDate: formattedDate,
                      formattedTime: formattedTime,
                    });
                  }}
                >
                  <option value="h:mm a">{timeFormats["h:mm a"]}</option>
                  <option value="h:mm:ss a">{timeFormats["h:mm:ss a"]}</option>
                  <option value="HH:mm">{timeFormats["HH:mm"]}</option>
                  <option value="HH:mm:ss">{timeFormats["HH:mm:ss"]}</option>
                </select>
              </Field>
            </>
          )}

          <Field label="Theme" required={false}>
            <select
              id="view"
              value={config.selectedView}
              onChange={(e) =>
                setConfig({ selectedView: e.target.value as ViewId })
              }
            >
              {THEME_OPTIONS.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="button-container">
            <button type="submit" disabled={loading} className="save-button">
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
