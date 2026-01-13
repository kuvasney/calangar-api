import jwt from 'jsonwebtoken';
import 'dotenv/config';
export const jwtService = {
    // Gerar Access Token (curta duração)
    generateAccessToken(payload) {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error('JWT_SECRET not configured');
        return jwt.sign(payload, secret, { expiresIn: '1h' });
    },
    // Gerar Refresh Token (longa duração)
    generateRefreshToken(payload) {
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if (!secret)
            throw new Error('REFRESH_TOKEN_SECRET not configured');
        return jwt.sign(payload, secret, { expiresIn: '7d' });
    },
    // Verificar Access Token
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            throw new Error('Invalid or expired access token');
        }
    },
    // Verificar Refresh Token
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    },
    // Gerar ambos os tokens de uma vez
    generateTokenPair(payload) {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    },
};
//# sourceMappingURL=jwt.service.js.map