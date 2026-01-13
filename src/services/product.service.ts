import { prisma } from "../config/prisma.js";

interface ProductStepData {
  name: string;
  days: number;
  order: number;
}

interface CreateProductData {
  userId: string;
  description: string;
  value: string;
  steps: ProductStepData[];
}

export const productService = {
  // Criar novo produto
  async create(data: CreateProductData) {
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

  async getAll() {
    return await prisma.product.findMany({
      include: {
        steps: true,
      },
    });
  },

  // Buscar produtos por userId
  async findByUserId(userId: string) {
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
};
