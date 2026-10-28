const assert = require("node:assert/strict");
const test = require("node:test");

const {
  isDuplicateUsernameError,
  validateAvatarUrl,
} = require("../src/controllers/profileController");
const {
  isValidUsername,
  normalizeUsername,
} = require("../src/utils/validation");

test("valida usernames com as mesmas regras do banco", () => {
  assert.equal(isValidUsername("ryan_2026"), true);
  assert.equal(isValidUsername("ab"), false);
  assert.equal(isValidUsername("nome-com-hifen"), false);
  assert.equal(isValidUsername("nome muito longo para perfil"), false);
  assert.equal(normalizeUsername("  Ryan  "), "Ryan");
});

test("reconhece conflito de username sem diferenciar maiúsculas", () => {
  assert.equal(isDuplicateUsernameError({ code: "23505" }), true);
  assert.equal(
    isDuplicateUsernameError({ message: "profiles_username_lower_key" }),
    true,
  );
});

test("aceita somente URLs http ou https para avatar", () => {
  assert.equal(validateAvatarUrl("https://example.com/avatar.png"), "https://example.com/avatar.png");
  assert.equal(validateAvatarUrl(null), null);
  assert.equal(validateAvatarUrl("javascript:alert(1)"), undefined);
});
