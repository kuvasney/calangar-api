import { userService } from "../services/user.service.js";
import { jwtService } from "../services/jwt.service.js";
class AuthController {
    /**
     * Registra um novo usuário com email e senha
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            const { email, fullName, password } = req.body;
            // Validações básicas
            if (!email || !fullName || !password) {
                return res.status(400).json({
                    error: `Email, name and password are required: ${email}, ${fullName}, ${password}`,
                });
            }
            if (password.length < 6) {
                return res.status(400).json({
                    error: "Password must be at least 6 characters long",
                });
            }
            // Verificar se usuário já existe
            const existingUser = await userService.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    error: "User with this email already exists",
                });
            }
            // Criar usuário (senha já é hasheada pelo userService)
            const user = await userService.create({
                email,
                name: fullName,
                password,
            });
            // Gerar tokens JWT
            const { accessToken, refreshToken } = jwtService.generateTokenPair({
                userId: user.id,
                email: user.email,
            });
            // Remover senha da resposta
            const { password: _, ...userWithoutPassword } = user;
            res.status(201).json({
                user: userWithoutPassword,
                accessToken,
                refreshToken,
            });
        }
        catch (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    /**
     * Login com email e senha
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Validações básicas
            if (!email || !password) {
                return res.status(400).json({
                    error: "Email and password are required",
                });
            }
            // Buscar usuário
            const user = await userService.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    error: "Invalid email or password",
                });
            }
            // Verificar se usuário tem senha (pode ter sido criado via Google)
            if (!user.password) {
                return res.status(401).json({
                    error: "This account was created with Google. Please use Google login.",
                });
            }
            // Verificar senha
            const isPasswordValid = await userService.verifyPassword(user, password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    error: "Invalid email or password",
                });
            }
            // Gerar tokens JWT
            const { accessToken, refreshToken } = jwtService.generateTokenPair({
                userId: user.id,
                email: user.email,
            });
            // Remover senha da resposta
            const { password: _, ...userWithoutPassword } = user;
            res.json({
                user: userWithoutPassword,
                accessToken,
                refreshToken,
            });
        }
        catch (error) {
            console.error("Error logging in:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    /**
     * Callback do Google OAuth
     * GET /api/auth/google/callback
     */
    googleCallback(req, res) {
        const authenticatedUser = req.user;
        if (!authenticatedUser) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
        }
        // Gerar tokens JWT
        const { accessToken, refreshToken } = jwtService.generateTokenPair({
            userId: authenticatedUser.id,
            email: authenticatedUser.email,
        });
        // Redirecionar para o frontend com tokens
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
    /**
     * Renovar access token usando refresh token
     * POST /api/auth/refresh-token
     */
    refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: "Refresh token is required" });
            }
            // Verificar refresh token
            const decoded = jwtService.verifyRefreshToken(refreshToken);
            // Gerar novo access token
            const newAccessToken = jwtService.generateAccessToken({
                userId: decoded.userId,
                email: decoded.email,
            });
            res.json({ accessToken: newAccessToken });
        }
        catch (error) {
            res.status(401).json({ error: "Invalid or expired refresh token" });
        }
    }
    /**
     * Logout
     * POST /api/auth/logout
     */
    logout(req, res) {
        // O logout é principalmente do lado do cliente (remover tokens)
        // Aqui podemos adicionar lógica futura para blacklist de tokens
        res.json({ message: "Logged out successfully" });
    }
}
export const authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map