import { JSX } from "react";

interface DayForecastProps {
  day: string;
  icon: JSX.Element;
  hi: number | string;
  lo: number | string;
  scale: string;
}

export default function DayForecast({
  day,
  icon,
  hi,
  lo,
  scale,
}: DayForecastProps) {
  const formatTemp = (temp: number | string) => {
    return typeof temp === "number"
      ? `${temp}°${scale === "Fahrenheit" ? "F" : "C"}`
      : temp;
  };

  return (
    <div className="day">
      <div className="label">{day}</div>
      <div className="icon">{icon}</div>
      <div className="hi">{formatTemp(hi)}</div>
      <div className="lo">{formatTemp(lo)}</div>
    </div>
  );
}
