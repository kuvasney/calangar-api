import { Router } from 'express';
import passport from '../auth/strategies/google.strategy.js';
import { jwtService } from '../services/jwt.service.js';
const router = Router();
// Rota para iniciar autenticação com Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}));
// Callback do Google OAuth
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/?error=auth_failed`,
    session: false, // Não manter sessão, vamos usar JWT
}), (req, res) => {
    // req.user é o User do Prisma vindo do passport
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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});
// Refresh token - Gerar novo access token
router.post('/refresh-token', (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
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
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});
// Logout (opcional - apenas limpa do lado do cliente)
router.post('/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Logged out successfully' });
    });
});
export default router;
//# sourceMappingURL=auth.routes.js.map