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

const SUPABASE_URL = "https://abc123.supabase.co";
const USER_ID = "11111111-1111-1111-1111-111111111111";
const OTHER_ID = "22222222-2222-2222-2222-222222222222";
const options = { userId: USER_ID, supabaseUrl: SUPABASE_URL };
const bucket = `${SUPABASE_URL}/storage/v1/object/public/avatars`;

test("aceita avatar somente do bucket do próprio projeto e do próprio usuário", () => {
  assert.equal(validateAvatarUrl(null, options), null);
  assert.equal(validateAvatarUrl("", options), null);

  const novo = `${bucket}/${USER_ID}/1730000000000.png`;
  assert.equal(validateAvatarUrl(novo, options), novo);

  // Formato antigo (<uid>-<timestamp>.ext na raiz do bucket) continua válido.
  const legado = `${bucket}/${USER_ID}-1730000000000.jpg`;
  assert.equal(validateAvatarUrl(legado, options), legado);
});

test("rejeita avatar externo, de outro usuário ou com formato suspeito", () => {
  const invalidos = [
    "https://example.com/avatar.png",
    "javascript:alert(1)",
    "http://abc123.supabase.co/storage/v1/object/public/avatars/" + USER_ID + "/a.png",
    "https://abc123.supabase.co.evil.com/storage/v1/object/public/avatars/" + USER_ID + "/a.png",
    "https://outro.supabase.co/storage/v1/object/public/avatars/" + USER_ID + "/a.png",
    `${bucket}/${OTHER_ID}/a.png`,
    `${bucket}/${OTHER_ID}-1730000000000.png`,
    `${bucket}/${USER_ID}/../${OTHER_ID}/a.png`,
    `${bucket}/${USER_ID}/a.png?token=1`,
    `${bucket}/${USER_ID}/a.png#x`,
    `${bucket}/${USER_ID}/sub/a.png`,
    `https://user:pass@abc123.supabase.co/storage/v1/object/public/avatars/${USER_ID}/a.png`,
    "https://abc123.supabase.co/storage/v1/object/public/documentos/" + USER_ID + "/a.png",
  ];

  for (const url of invalidos) {
    assert.equal(validateAvatarUrl(url, options), undefined, url);
  }

  // Sem usuário identificado ou sem Supabase configurado, nada é aceito.
  assert.equal(validateAvatarUrl(`${bucket}/${USER_ID}/a.png`, { supabaseUrl: SUPABASE_URL }), undefined);
  assert.equal(validateAvatarUrl(`${bucket}/${USER_ID}/a.png`, { userId: USER_ID, supabaseUrl: "" }), undefined);
});
