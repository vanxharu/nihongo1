/** YYYY-MM-DD in the user's local time zone (toISOString() is UTC and rolls the day over at 07:00 in Vietnam). */
export function localDateStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
