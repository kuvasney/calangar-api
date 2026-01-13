import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Rota para criar um novo produto (protegida)
router.post("/", authMiddleware, (req, res) =>
  productController.create(req, res)
);

router.get("/", authMiddleware, (req, res) =>
  productController.getAllProducts(req, res)
);

export default router;
