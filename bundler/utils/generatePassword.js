/**
 * generatePassword()
 * -------------------
 * Creates a simple pseudo-random password using
 * current date/time + Math.random().
 */
export function generatePassword(length = 12) {
  // Use current timestamp for seed
  const seed = Date.now().toString(36);

  // Characters to choose from
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?";

  let password = seed; // start with date-time seed

  // Fill until reaching desired length
  while (password.length < length) {
    const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
    password += randomChar;
  }

  // Shuffle characters for extra randomness
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
}