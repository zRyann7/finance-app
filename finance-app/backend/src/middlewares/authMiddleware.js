const {
  createSupabaseClient,
} = require("../config/supabase");

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || "";

  const match = /^Bearer\s+(.+)$/i.exec(authorization);

  if (!match) {
    return res.status(401).json({
      error: "Token não informado.",
    });
  }

  const token = match[1];
  const supabase = createSupabaseClient(token);

  const { data, error } =
    await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({
      error: "Token inválido ou expirado.",
    });
  }

  req.user = data.user;
  req.supabase = supabase;

  next();
}

module.exports = authMiddleware;
