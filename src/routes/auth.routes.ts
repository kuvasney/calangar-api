import { Router } from "express";
import passport from "../auth/strategies/google.strategy.js";
import { authController } from "../controllers/auth.controller.js";

const router = Router();

// ========== Autenticação tradicional (Email/Senha) ==========

/**
 * Registrar novo usuário
 * POST /api/auth/register
 * Body: { email, name, password }
 */
router.post("/register", (req, res) => authController.register(req, res));

/**
 * Login com email e senha
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", (req, res) => authController.login(req, res));

// ========== OAuth Google ==========

/**
 * Iniciar autenticação com Google
 * GET /api/auth/google
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/**
 * Callback do Google OAuth
 * GET /api/auth/google/callback
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/?error=auth_failed`,
    session: false,
  }),
  (req, res) => authController.googleCallback(req, res)
);

// ========== Token Management ==========

/**
 * Renovar access token
 * POST /api/auth/refresh-token
 * Body: { refreshToken }
 */
router.post("/refresh-token", (req, res) =>
  authController.refreshToken(req, res)
);

/**
 * Logout
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;
