const EMAIL_PATTERN =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export function isValidEmail(email: string) {
  const value = email.trim();
  if (!value || value.length > 200) return false;
  if ((value.match(/@/g) || []).length !== 1) return false;
  if (value.includes("..") || value.startsWith(".") || value.endsWith(".")) return false;
  return EMAIL_PATTERN.test(value);
}

export const INVALID_EMAIL_MESSAGE = "Please write a correct email address.";
