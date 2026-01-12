import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiDayRainMix,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiSmoke,
  WiDust,
  WiVolcano,
  WiStrongWind,
  WiTornado,
} from "react-icons/wi";

export const getWeatherIcon = (condition: string): JSX.Element => {
  const icons: Record<string, JSX.Element> = {
    Clear: <WiDaySunny />,
    Clouds: <WiCloudy />,
    Rain: <WiRain />,
    Drizzle: <WiDayRainMix />,
    Thunderstorm: <WiThunderstorm />,
    Snow: <WiSnow />,
    Mist: <WiFog />,
    Fog: <WiFog />,
    Haze: <WiFog />,
    Smoke: <WiSmoke />,
    Dust: <WiDust />,
    Sand: <WiDust />,
    Ash: <WiVolcano />,
    Squall: <WiStrongWind />,
    Tornado: <WiTornado />,
  };
  return icons[condition] || <WiDaySunny />;
};
