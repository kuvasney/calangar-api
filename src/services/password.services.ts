import { prisma } from "../config/prisma.js";
import { randomBytes } from "crypto";

export const PasswordServices = {
  async generate(userId: string, expiresInMinutes = 60) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    return await prisma.passwordResetToken.create({
      data: { token, userId, expiresAt },
    });
  },

  async invalidateAllByUserId(userId: string) {
    return await prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  },

  async invalidateOne(token: string) {
    return await prisma.passwordResetToken.delete({
      where: { token },
    });
  },

  async findByToken(token: string) {
    return await prisma.passwordResetToken.findUnique({ where: { token } });
  },
};
