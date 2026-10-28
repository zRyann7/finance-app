const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeUsername(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidUsername(value) {
  return USERNAME_PATTERN.test(normalizeUsername(value));
}

function isValidEmail(value) {
  return (
    typeof value === "string" &&
    value.trim().length <= 254 &&
    EMAIL_PATTERN.test(value.trim())
  );
}

function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 72;
}

module.exports = {
  USERNAME_PATTERN,
  normalizeUsername,
  isValidUsername,
  isValidEmail,
  isValidPassword,
};
