import { Router, type Router as ExpressRouter } from "express";
import passport from "../auth/strategies/google.strategy.js";
import { authController } from "../controllers/auth.controller.js";
import { emailController } from "../controllers/email.controller.js";
import type { Request, Response, NextFunction } from "express";

const router: ExpressRouter = Router();

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

/**
 * Email de recuperação de senha
 * POST /api/auth/reset-password-email
 * Body: { email }
 */
router.post("/reset-password-email", (req, res, next) =>
  emailController.requestPasswordReset(req, res, next),
);

/**
 * REset da senha por token
 * POST /api/auth/reset-password
 * Body: { token, password }
 */
router.post("/reset-password", (req, res, next) =>
  emailController.resetPassword(req, res, next),
);

// ========== OAuth Google ==========

/**
 * Iniciar autenticação com Google
 * GET /api/auth/google
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
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
  (req, res) => authController.googleCallback(req, res),
);

// ========== Token Management ==========

/**
 * Renovar access token
 * POST /api/auth/refresh-token
 * Body: { refreshToken }
 */
router.post("/refresh-token", (req, res) =>
  authController.refreshToken(req, res),
);

/**
 * Logout
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;
