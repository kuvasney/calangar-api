interface CreateProjectData {
    userId: string;
    projectName: string;
    clientName: string;
    clientAddress: Address;
    obraAddress: Address;
    productId: number;
    startDate: string;
    status?: projectStatus;
}
interface UpdateProjectData {
    projectName?: string;
    clientName?: string;
    clientAddress?: Address;
    obraAddress?: Address;
    status?: projectStatus;
}
type projectStatus = "planned" | "in_progress" | "completed";
interface Address {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    number: string;
    complement?: string;
}
export declare const projectService: {
    create(data: CreateProjectData): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
            password: string | null;
            avatar: string | null;
            googleId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        product: {
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
        };
        schedules: ({
            productStep: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                days: number;
                order: number;
                productId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            plannedStartDate: Date;
            plannedEndDate: Date;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            status: string;
            projectId: number;
            productStepId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        productId: number;
        projectName: string;
        clientName: string;
        clientAddress: import("@prisma/client/runtime/library").JsonValue;
        obraAddress: import("@prisma/client/runtime/library").JsonValue;
        startDate: Date;
    }>;
    update(projectId: number, userId: string, data: UpdateProjectData): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
        product: {
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
        };
        schedules: ({
            productStep: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                days: number;
                order: number;
                productId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            plannedStartDate: Date;
            plannedEndDate: Date;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            status: string;
            projectId: number;
            productStepId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        productId: number;
        projectName: string;
        clientName: string;
        clientAddress: import("@prisma/client/runtime/library").JsonValue;
        obraAddress: import("@prisma/client/runtime/library").JsonValue;
        startDate: Date;
    }>;
    updateStepStatus(projectId: number, scheduleId: number, status: "in_progress" | "completed", actualDate?: string): Promise<({
        product: {
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
        };
        schedules: ({
            productStep: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                days: number;
                order: number;
                productId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            plannedStartDate: Date;
            plannedEndDate: Date;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            status: string;
            projectId: number;
            productStepId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        productId: number;
        projectName: string;
        clientName: string;
        clientAddress: import("@prisma/client/runtime/library").JsonValue;
        obraAddress: import("@prisma/client/runtime/library").JsonValue;
        startDate: Date;
    }) | null | undefined>;
    findByUserId(userId: string): Promise<{
        id: number;
        schedules: {
            productStep: {
                name: string;
                days: number;
                order: number;
            };
            id: number;
            plannedStartDate: Date;
            plannedEndDate: Date;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            status: string;
        }[];
        status: string;
        productId: number;
        projectName: string;
        clientName: string;
        startDate: Date;
    }[]>;
    findById(projectId: number, userId: string): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
        product: {
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
        };
        schedules: ({
            productStep: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                days: number;
                order: number;
                productId: number;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            plannedStartDate: Date;
            plannedEndDate: Date;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            status: string;
            projectId: number;
            productStepId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: string;
        productId: number;
        projectName: string;
        clientName: string;
        clientAddress: import("@prisma/client/runtime/library").JsonValue;
        obraAddress: import("@prisma/client/runtime/library").JsonValue;
        startDate: Date;
    }>;
};
export {};
//# sourceMappingURL=project.service.d.ts.map