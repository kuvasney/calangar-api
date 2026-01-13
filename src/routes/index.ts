import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { userService } from "../services/user.service.js";

const router = Router();

// Rota de teste (pública)
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API running" });
});

// Rotas de autenticação
router.use("/auth", authRoutes);

// Rotas de produtos (protegidas)
router.use("/products", productRoutes);

// Rota protegida de teste - Retorna dados do usuário autenticado
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await userService.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Não retornar senha
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: "Authenticated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
