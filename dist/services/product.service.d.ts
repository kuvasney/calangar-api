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
interface UpdateProductData {
    id: number;
    userId: string;
    description: string;
    value: string;
    steps: ProductStepData[];
}
export declare const productService: {
    create(data: CreateProductData): Promise<{
        steps: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            days: number;
            order: number;
            productId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        value: string;
        userId: string;
    }>;
    update(data: UpdateProductData): Promise<{
        steps: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            days: number;
            order: number;
            productId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        value: string;
        userId: string;
    }>;
    getAll(): Promise<({
        steps: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            days: number;
            order: number;
            productId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        value: string;
        userId: string;
    })[]>;
    findByUserId(userId: string): Promise<({
        steps: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            days: number;
            order: number;
            productId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        value: string;
        userId: string;
    })[]>;
    delete(id: number, userId: string): Promise<{
        message: string;
    }>;
};
export {};
//# sourceMappingURL=product.service.d.ts.map