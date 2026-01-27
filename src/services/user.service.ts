import { prisma } from "../config/prisma.js";
import type { User } from "@prisma/client";
import type { IUser } from "../types/user.js";

import bcrypt from "bcrypt";

export const userService = {
  // Buscar usuário por email
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  // Buscar usuário por Google ID
  async findByGoogleId(googleId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { googleId },
    });
  },

  // Buscar usuário por ID
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  // Criar novo usuário
  async create(data: IUser): Promise<User> {
    const userData: any = {
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      googleId: data.googleId,
    };

    // Se tiver senha, fazer hash
    if (data.password) {
      userData.password = await bcrypt.hash(data.password, 10);
    }

    return await prisma.user.create({
      data: userData,
    });
  },

  // Verificar senha (para login tradicional)
  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return await bcrypt.compare(password, user.password);
  },

  // Atualizar usuário
  async update(id: string, data: Partial<IUser>): Promise<User> {
    const updateData: any = { ...data };

    // Se estiver atualizando senha, fazer hash
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  },
};
