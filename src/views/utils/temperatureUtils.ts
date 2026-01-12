export const formatTemperature = (
  temp: number | null | undefined,
  scale: string
): string => {
  if (temp === null || temp === undefined) {
    return `--°${scale === "Fahrenheit" ? "F" : "C"}`;
  }
  return `${Math.round(temp)}°${scale === "Fahrenheit" ? "F" : "C"}`;
};
