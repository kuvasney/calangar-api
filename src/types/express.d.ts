import "express";
import type { User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends PrismaUser {
      userId?: string; // Adiciona userId como alias para compatibilidade
    }

    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}
