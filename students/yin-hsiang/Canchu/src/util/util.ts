export function date2CanchuStr (timestamp: Date) {
  const [date, time] = timestamp.toISOString().split('T');
  const [hour, minute, second] = time.split('.')[0].split(':');
  return `${date} ${+hour + 8}:${minute}:${second}`;
}
