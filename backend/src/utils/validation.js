const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const RESOURCE_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

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

// Aceita somente datas reais no formato AAAA-MM-DD (rejeita 2026-02-31 e similares).
function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidResourceId(value) {
  return typeof value === "string" && RESOURCE_ID_PATTERN.test(value);
}

// 22P02 = invalid_text_representation (ex.: "abc" numa coluna uuid/integer).
function isInvalidIdError(error) {
  return error?.code === "22P02";
}

module.exports = {
  USERNAME_PATTERN,
  normalizeUsername,
  isValidUsername,
  isValidEmail,
  isValidPassword,
  isValidIsoDate,
  isValidResourceId,
  isInvalidIdError,
};
