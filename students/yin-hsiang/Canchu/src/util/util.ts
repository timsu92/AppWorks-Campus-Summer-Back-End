export function date2CanchuStr (timestamp: Date) {
  const year = timestamp.getFullYear();
  const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
  const date = timestamp.getDate().toString().padStart(2, '0');
  const hour = (timestamp.getHours()).toString().padStart(2, '0');
  const minute = timestamp.getMinutes().toString().padStart(2, '0');
  const second = timestamp.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
}
