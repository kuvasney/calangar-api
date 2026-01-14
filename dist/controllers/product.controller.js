import { productService } from "../services/product.service.js";
class ProductController {
    /**
     * Criar um novo produto
     * POST /api/products
     */
    async create(req, res) {
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
        }
        catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    /**
     * Editar um produto
     * PUT /api/products/:id
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { description, value, steps } = req.body;
            // req.user vem do authMiddleware
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            // Validações básicas
            if (!id || !value || !steps) {
                return res.status(400).json({
                    error: "id, value and steps are required",
                });
            }
            // Atualizar produto
            const product = await productService.update({
                id: Number(id),
                userId: req.user.userId,
                description,
                value,
                steps,
            });
            res.status(200).json({ product });
        }
        catch (error) {
            console.error("Error updating product:", error);
            if (error.message === "Produto não encontrado ou sem permissão") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Internal server error" });
        }
    }
    async getAllProducts(req, res) {
        try {
            // req.user vem do authMiddleware
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const products = await productService.findByUserId(req.user.userId);
            res.json(products);
        }
        catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
    /**
     * Deletar um produto
     * DELETE /api/products/:id
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            // req.user vem do authMiddleware
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            if (!id) {
                return res.status(400).json({ error: "id is required" });
            }
            const result = await productService.delete(Number(id), req.user.userId);
            res.status(200).json(result);
        }
        catch (error) {
            console.error("Error deleting product:", error);
            if (error.message === "Produto não encontrado ou sem permissão") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
export const productController = new ProductController();
//# sourceMappingURL=product.controller.js.map