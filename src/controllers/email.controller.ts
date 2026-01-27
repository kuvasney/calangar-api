import { userService } from "../services/user.service.js";
import { PasswordServices } from "../services/password.services.js";
import { SendPasswordResetEmail } from "../services/email.service.js";
import type { Request, Response, NextFunction } from "express";

class EmailController {
  async requestPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          error: "Email required",
          message: "Email é obrigatório",
        });
        return;
      }

      const existingUser = await userService.findByEmail(email);

      if (!existingUser) {
        res.json({
          message:
            "Se o email existir em nossa base, você receberá instruções para recuperação de senha",
        });
        return;
      }

      await PasswordServices.invalidateAllByUserId(existingUser.id);

      // Cria novo token
      const tokenObj = await PasswordServices.generate(existingUser.id);
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${tokenObj.token}`;

      // Envia e-mail com o token
      await SendPasswordResetEmail({
        user: existingUser,
        resetToken: tokenObj.token,
        resetUrl: resetUrl,
      });

      res.json({
        message:
          "Se o email existir em nossa base, você receberá instruções para recuperação de senha",
      });
    } catch (error) {
      next(error);
    }
  }
  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { token, password } = req.body;
    if (!token) {
      res.status(400).json({
        error: "Token required",
        message: "Token é obrigatório",
      });
      return;
    }

    if (!password) {
      res.status(400).json({
        error: "Password required",
        message: "Nova senha é obrigatória",
      });
      return;
    }

    const resetToken = await PasswordServices.findByToken(token);

    if (!resetToken) {
      res.status(400).json({
        error: "Invalid token",
        message: "Token inválido ou expirado",
      });
      return;
    }

    // Verificar se token é válido
    if (resetToken.expiresAt < new Date()) {
      res.status(400).json({
        error: "Invalid token",
        message: "Token inválido ou expirado",
      });
      return;
    }

    // Buscar usuário
    const user = await userService.findById(resetToken.userId);

    if (!user) {
      res.status(404).json({
        error: "User not found",
        message: "Usuário não encontrado",
      });
      return;
    }

    // Atualizar senha
    await userService.update(user.id, { password });

    // Invalidar o token utilizado
    await PasswordServices.invalidateOne(resetToken.token);

    res.json({
      message: "Senha redefinida com sucesso.",
    });
  }
}

export const emailController = new EmailController();
