import { useEffect, useState } from "react";
import { store } from "@telemetryos/sdk";
import { WiDaySunny, WiCloudy, WiSnow } from "react-icons/wi";
import { getWeatherIcon } from "./utils/weatherIcons";
import { formatTemperature } from "./utils/temperatureUtils";
import DayForecast from "./components/DayForecast";
import "./WeatherCard.css";

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface ColorTheme {
  leftBg: string;
  todayBg: string;
  forecastBg: string;
  accent: string;
}

interface WeatherData {
  name: string;
  main: {
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
  }>;
}

interface ScaleSettings {
  scale: string;
}

const THEMES: Record<string, ColorTheme> = {
  flamingo: {
    leftBg: "#2f2f2f",
    todayBg: "#3a3a3a",
    forecastBg: "#a01650",
    accent: "#b03060",
  },
  sky: {
    leftBg: "#0D47A1",
    todayBg: "#1565C0",
    forecastBg: "#42A5F5",
    accent: "#90CAF9",
  },
  urban: {
    leftBg: "#B71C1C",
    todayBg: "#C62828",
    forecastBg: "#9FA8DA",
    accent: "#EF9A9A",
  },
  watermelon: {
    leftBg: "#00600F",
    todayBg: "#2E7D32",
    forecastBg: "#EF5350",
    accent: "#A5D6A7",
  },
  neapolitan: {
    leftBg: "#795548",
    todayBg: "#A98274",
    forecastBg: "#FF8A80",
    accent: "#FFCCBC",
  },
  meadow: {
    leftBg: "#7CB342",
    todayBg: "#8BC34A",
    forecastBg: "#FBC02D",
    accent: "#DCEDC8",
  },
  forest: {
    leftBg: "#6D4C41",
    todayBg: "#9C786C",
    forecastBg: "#8BC34A",
    accent: "#D7CCC8",
  },
};

interface WeatherCardProps {
  theme:
    | "flamingo"
    | "sky"
    | "urban"
    | "watermelon"
    | "neapolitan"
    | "meadow"
    | "forest";
}

export default function WeatherCard({ theme }: WeatherCardProps) {
  const colors = THEMES[theme];
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null
  );
  const [forecastWeather, setForecastWeather] = useState<ForecastData | null>(
    null
  );
  const [dailyForecasts, setDailyForecasts] = useState<any[]>([]);
  const [dateTimeSettings, setDateTimeSettings] = useState<any>({
    option: "Default",
    formattedDate: "",
    formattedTime: "",
  });
  const [scale, setScale] = useState<string>("Celsius");

  useEffect(() => {
    const loadInitialData = async () => {
      const weatherData = await store().instance.get<WeatherData>(
        "currentWeather"
      );
      setCurrentWeather(weatherData || null);

      const forecast = await store().instance.get<ForecastData>(
        "forecastWeather"
      );
      setForecastWeather(forecast || null);

      const settings = await store().instance.get("dateTimeSettings");
      if (settings) {
        console.log("Loaded date/time settings:", settings);
        setDateTimeSettings(settings);
      }

      const scaleSettings = await store().instance.get<ScaleSettings>(
        "scaleSettings"
      );
      if (scaleSettings && scaleSettings.scale) {
        setScale(scaleSettings.scale);
      }

      if (forecast && forecast.list) {
        const dailyData: any = {};

        forecast.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000);
          const dayKey = date.toISOString().split("T")[0];

          if (!dailyData[dayKey]) {
            dailyData[dayKey] = {
              date: date,
              temps: [],
              weather: item.weather[0],
              dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
            };
          }
          dailyData[dayKey].temps.push(item.main.temp);
        });

        const days = Object.values(dailyData)
          .slice(1, 5)
          .map((day: any) => ({
            day: day.dayName,
            icon: getWeatherIcon(day.weather.main),
            hi: Math.round(Math.max(...day.temps)),
            lo: Math.round(Math.min(...day.temps)),
            description: day.weather.description,
          }));

        console.log("Processed daily forecasts:", days);
        setDailyForecasts(days);
      }
    };
    loadInitialData();

    // Subscribe to updates
    const unsubscribe = store().instance.subscribe("currentWeather", (data) => {
      console.log("Current weather updated:", data);
      setCurrentWeather(data as WeatherData | null);
    });

    const unsubscribeForecast = store().instance.subscribe(
      "forecastWeather",
      (data) => {
        console.log("Forecast weather updated:", data);
        setForecastWeather(data as ForecastData | null);
      }
    );

    const unsubscribeScale = store().instance.subscribe(
      "scaleSettings",
      (data) => {
        const scaleData = data as ScaleSettings;
        if (scaleData && scaleData.scale) {
          console.log("Scale updated:", scaleData.scale);
          setScale(scaleData.scale);
        }
      }
    );

    const unsubscribeDateTime = store().instance.subscribe(
      "dateTimeSettings",
      (data) => {
        if (data) {
          console.log("Date/Time settings updated:", data);
          setDateTimeSettings(data);
        }
      }
    );

    return () => {
      unsubscribe?.then((unsub: any) => unsub?.());
      unsubscribeForecast?.then((unsub: any) => unsub?.());
      unsubscribeScale?.then((unsub: any) => unsub?.());
      unsubscribeDateTime?.then((unsub: any) => unsub?.());
    };
  }, [theme]);

  return (
    <div className="app">
      <div className="card">
        {/* Left panel */}
        <div className="left" style={{ background: colors.leftBg }}>
          <h1 className="city">{currentWeather?.name || "Loading..."}</h1>
          {dateTimeSettings.option !== "Do Not Show" && (
            <div className="datetime">
              <div className="time" style={{ color: colors.accent }}>
                {dateTimeSettings.formattedTime || ""}
              </div>
              <div className="date" style={{ color: colors.accent }}>
                {dateTimeSettings.formattedDate || ""}
              </div>
            </div>
          )}

          <div className="current">
            <div className="temp">
              {formatTemperature(currentWeather?.main.temp, scale)}
            </div>
            <div className="icon">
              {currentWeather ? (
                getWeatherIcon(currentWeather.weather[0].main)
              ) : (
                <WiDaySunny />
              )}
            </div>
          </div>
        </div>

        {/* Today column */}
        <div className="today" style={{ background: colors.todayBg }}>
          <div className="label">Today</div>
          <div className="icon">
            {currentWeather ? (
              getWeatherIcon(currentWeather.weather[0].main)
            ) : (
              <WiCloudy />
            )}
          </div>
          <div className="hi">
            {formatTemperature(currentWeather?.main.temp_max, scale)}
          </div>
          <div className="lo">
            {formatTemperature(currentWeather?.main.temp_min, scale)}
          </div>
        </div>

        {/* Forecast */}
        <div className="forecast" style={{ background: colors.forecastBg }}>
          {dailyForecasts.length > 0
            ? dailyForecasts.map((d, index) => (
                <DayForecast
                  key={index}
                  day={d.day}
                  icon={d.icon}
                  hi={d.hi}
                  lo={d.lo}
                  scale={scale}
                />
              ))
            : [
                { day: "Sunday", icon: <WiCloudy />, hi: "--", lo: "--" },
                { day: "Monday", icon: <WiSnow />, hi: "--", lo: "--" },
                { day: "Tuesday", icon: <WiDaySunny />, hi: "--", lo: "--" },
                { day: "Wednesday", icon: <WiDaySunny />, hi: "--", lo: "--" },
              ].map((d, index) => (
                <DayForecast
                  key={index}
                  day={d.day}
                  icon={d.icon}
                  hi={d.hi}
                  lo={d.lo}
                  scale={scale}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
