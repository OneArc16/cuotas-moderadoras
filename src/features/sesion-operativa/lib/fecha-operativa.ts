export function getFechaOperativaBogota(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const fecha = formatter.format(date);
  return new Date(`${fecha}T00:00:00-05:00`);
}