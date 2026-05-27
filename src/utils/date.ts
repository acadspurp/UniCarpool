export function formatDepartureLabel(rawValue: string) {
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    return rawValue;
  }
  return parsed.toLocaleString();
}
