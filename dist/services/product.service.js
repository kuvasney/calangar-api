import { prisma } from "../config/prisma.js";
export const productService = {
    // Criar novo produto
    async create(data) {
        return await prisma.product.create({
            data: {
                userId: data.userId,
                description: data.description,
                value: data.value,
                steps: {
                    create: data.steps.map((step) => ({
                        name: step.name,
                        days: step.days,
                        order: step.order,
                    })),
                },
            },
            include: {
                steps: true,
            },
        });
    },
    async update(data) {
        // 1. Verificar se o produto existe e pertence ao usuário
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: data.id,
                userId: data.userId,
            },
        });
        if (!existingProduct) {
            throw new Error("Produto não encontrado ou sem permissão");
        }
        // 2. Deletar etapas antigas
        await prisma.productStep.deleteMany({
            where: {
                productId: data.id,
            },
        });
        // 3. Atualizar produto e criar novas etapas
        const updatedProduct = await prisma.product.update({
            where: {
                id: data.id,
            },
            data: {
                value: data.value,
                description: data.description,
                steps: {
                    create: data.steps.map((step) => ({
                        name: step.name,
                        days: step.days,
                        order: step.order,
                    })),
                },
            },
            include: {
                steps: true,
            },
        });
        return updatedProduct;
    },
    // Buscar todos os produtos
    async getAll() {
        return await prisma.product.findMany({
            include: {
                steps: true,
            },
        });
    },
    // Buscar produtos por userId
    async findByUserId(userId) {
        return await prisma.product.findMany({
            where: {
                userId,
            },
            include: {
                steps: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },
    // Deletar produto
    async delete(id, userId) {
        // Verificar se o produto existe e pertence ao usuário
        const existingProduct = await prisma.product.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existingProduct) {
            throw new Error("Produto não encontrado ou sem permissão");
        }
        // Deletar produto (cascade vai deletar as steps automaticamente)
        await prisma.product.delete({
            where: {
                id,
            },
        });
        return { message: "Produto deletado com sucesso" };
    },
};
//# sourceMappingURL=product.service.js.map