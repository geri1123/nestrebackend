export function formatDate(date: Date | string): string {
  const d = new Date(date);

  // Example: "Nov 06, 2025 18:02"
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
  });
}