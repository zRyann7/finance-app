const { rateLimit } = require("express-rate-limit");

const commonOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
};

const apiLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: {
    error: "Muitas requisições. Tente novamente em alguns minutos.",
  },
});

const loginLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: {
    error: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  },
});

module.exports = { apiLimiter, loginLimiter };
