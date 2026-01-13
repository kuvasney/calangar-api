import jwt from 'jsonwebtoken';
import 'dotenv/config';

interface TokenPayload {
  userId: string;
  email: string;
}

export const jwtService = {
  // Gerar Access Token (curta duração)
  generateAccessToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    
    return jwt.sign(payload, secret, { expiresIn: '1h' });
  },

  // Gerar Refresh Token (longa duração)
  generateRefreshToken(payload: TokenPayload): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) throw new Error('REFRESH_TOKEN_SECRET not configured');
    
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  },

  // Verificar Access Token
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  },

  // Verificar Refresh Token
  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  },

  // Gerar ambos os tokens de uma vez
  generateTokenPair(payload: TokenPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  },
};
