export function getBogotaOperationalDayParts(baseDate = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(baseDate);

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (!year || !month || !day) {
        throw new Error("no se pudo resolver la fecha operativa de Bogotá."); 
    }

    return { year, month , day};
}

export function getBogotaOperationalDayRange(baseDate = new Date()) {
    const { year, month, day } = getBogotaOperationalDayParts(baseDate);

    const start = new Date(`${year}-${month}-${day}T00:00:00.000-05:00`);
    const end = new Date(`${year}-${month}-${day}T23:59:59.999-05:00`);

    return {
        start,
        end,
        fechaOperativa: start,
    };
}