export function generateUsername(base: string): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9]/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${random}`;
}