export function formatRelativeTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "À l'instant";
  if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute);
    return `Il y a ${mins} minute${mins > 1 ? 's' : ''}`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }
  const days = Math.floor(diffMs / day);
  return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
}
