import type { Request, Response } from "express";

import { productService } from "../services/product.service.js";

class ProductController {
  /**
   * Criar um novo produto
   * POST /api/products
   */
  async create(req: Request, res: Response) {
    try {
      const { userId, description, value, steps } = req.body;

      // Validações básicas
      if (!userId || !value || !steps) {
        return res.status(400).json({
          error: "userId, value and steps are required",
        });
      }

      // Criar produto
      const product = await productService.create({
        userId,
        description,
        value,
        steps,
      });

      res.status(201).json({ product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      // req.user vem do authMiddleware
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const products = await productService.findByUserId(req.user.userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
export const productController = new ProductController();
