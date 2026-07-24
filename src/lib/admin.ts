const raw = process.env.ADMIN_EMAILS ?? "";

export const ADMIN_EMAILS: string[] = raw
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
