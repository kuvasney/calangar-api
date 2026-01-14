import type { Request, Response } from "express";
declare class ProductController {
    /**
     * Criar um novo produto
     * POST /api/products
     */
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Editar um produto
     * PUT /api/products/:id
     */
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllProducts(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Deletar um produto
     * DELETE /api/products/:id
     */
    delete(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const productController: ProductController;
export {};
//# sourceMappingURL=product.controller.d.ts.map