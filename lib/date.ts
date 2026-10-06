export function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysString(dateString: string, days: number) {
  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

export function daysBetweenLocalDates(from: string, to: string) {
  const [fromY, fromM, fromD] = from.split("-").map(Number);
  const [toY, toM, toD] = to.split("-").map(Number);
  const fromDate = new Date(fromY, fromM - 1, fromD);
  const toDate = new Date(toY, toM - 1, toD);
  return Math.round((toDate.getTime() - fromDate.getTime()) / 86400000);
}

export function getDeliveryLabel(deliveryDate: string, today = localDateString()) {
  const days = daysBetweenLocalDates(today, deliveryDate);
  if (days < 0) {
    const lateDays = Math.abs(days);
    return `LATE · ${lateDays} ${lateDays === 1 ? "day" : "days"}`;
  }
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}
