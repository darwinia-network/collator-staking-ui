// UTC, yyyy.mm.dd
export function formatTime(timestamp: number) {
  const date = new Date(timestamp);

  let month: string | number = date.getUTCMonth() + 1;
  month = month < 10 ? `0${month}` : `${month}`;

  let day: string | number = date.getUTCDate();
  day = day < 10 ? `0${day}` : `${day}`;

  return `${date.getUTCFullYear()}.${month}.${day}`;
}

export function calcMonths(startTime: number, endTime: number) {
  const month = 60 * 60 * 24 * 30 * 1000;
  return Math.round((endTime - startTime) / month);
}
