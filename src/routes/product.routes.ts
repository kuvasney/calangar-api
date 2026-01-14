import { Router, type Router as ExpressRouter } from "express";
import { productController } from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router: ExpressRouter = Router();

// Rota para criar um novo produto (protegida)
router.post("/", authMiddleware, (req, res) =>
  productController.create(req, res)
);

// Rota para editar um produto (protegida)
router.put("/:id", authMiddleware, (req, res) =>
  productController.update(req, res)
);

// Rota para deletar um produto (protegida)
router.delete("/:id", authMiddleware, (req, res) =>
  productController.delete(req, res)
);

router.get("/", authMiddleware, (req, res) =>
  productController.getAllProducts(req, res)
);

export default router;
