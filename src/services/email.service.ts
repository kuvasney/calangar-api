import nodemailer from "nodemailer";
import type { IUser } from "../types/user.js";

function createTransporter() {
  if (process.env.NODE_ENV === "production") {
    //
  } else {
    // Os emails podem ser visualizados em https://ethereal.email
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
}

export interface SendPasswordResetEmailOptions {
  user: IUser;
  resetToken: string;
  resetUrl: string;
}
export const SendPasswordResetEmail = async (
  options: SendPasswordResetEmailOptions,
): Promise<void> => {
  const { user, resetUrl } = options;
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Calangar" <noreply@calangar.com>',
    to: user.email,
    subject: "Recuperação de Senha - Calangar",
    html: `
    <!DOCTYPE html>
      <html>
        <head>
        </head>
        <body>
          <p>Olá, <strong>${user.name}</strong>!</p>
              
              <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Calangar</strong>.</p>
              
              <p>Para criar uma nova senha, clique no botão abaixo:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
              </div>
              
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="background: #fff; padding: 10px; border: 1px solid #ddd; word-break: break-all;">
                ${resetUrl}
              </p>
              <p>Este é um email automático, por favor não responda.</p>
        </body>
      </html>
    `,
    text: `
    Olá, <strong>${user.name}</strong>!              
    Recebemos uma solicitação para redefinir a senha da sua conta no Calangar.
    Para criar uma nova senha, acesse o link: ${resetUrl}
    Este é um email automático, por favor não responda.
    `,
  };

  try {
    const info: any = await transporter?.sendMail(mailOptions);
    // Log para desenvolvimento
    if (process.env.NODE_ENV !== "production") {
      console.log("📧 Email de recuperação enviado!");
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    throw new Error("Falha ao enviar email de recuperação");
  }
};
