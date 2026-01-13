import type { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service.js';

// Interface para dados do usuário autenticado
export interface AuthUser {
  userId: string;
  email: string;
}

// Estender tipos do Express
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header not provided' });
      return;
    }

    // Verificar formato: "Bearer token"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Invalid authorization header format' });
      return;
    }

    const token = parts[1];

    if (!token) {
      res.status(401).json({ error: 'Token not provided' });
      return;
    }

    // Verificar e decodificar token
    const decoded = jwtService.verifyAccessToken(token);

    // Adicionar dados do usuário ao request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    // Prosseguir para a próxima função
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid or expired token',
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
};
