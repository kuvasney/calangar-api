import { prisma } from "../config/prisma.js";
// Helper: Calcular datas do cronograma baseado nas etapas
function calculateSchedule(startDate, steps) {
    const schedules = [];
    let currentDate = new Date(startDate);
    // Ordenar steps pela ordem
    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
    for (const step of sortedSteps) {
        const plannedStartDate = new Date(currentDate);
        const plannedEndDate = new Date(currentDate);
        plannedEndDate.setDate(plannedEndDate.getDate() + step.days);
        schedules.push({
            productStepId: step.id,
            plannedStartDate,
            plannedEndDate,
            status: "pending",
        });
        // Próxima etapa começa onde a anterior termina
        currentDate = new Date(plannedEndDate);
    }
    return schedules;
}
export const projectService = {
    // Criar novo projeto
    async create(data) {
        // 1. Buscar o produto com suas etapas
        const product = await prisma.product.findUnique({
            where: { id: data.productId },
            include: { steps: true },
        });
        if (!product) {
            throw new Error("Produto não encontrado");
        }
        // 2. Calcular cronograma baseado nas etapas
        const startDate = new Date(data.startDate);
        const schedules = calculateSchedule(startDate, product.steps);
        // 3. Criar projeto com os schedules
        const project = await prisma.project.create({
            data: {
                userId: data.userId,
                projectName: data.projectName,
                clientName: data.clientName,
                clientAddress: {
                    street: data.clientAddress.street,
                    neighborhood: data.clientAddress.neighborhood,
                    city: data.clientAddress.city,
                    state: data.clientAddress.state,
                    zipCode: data.clientAddress.zipCode,
                    number: data.clientAddress.number,
                    complement: data.clientAddress.complement,
                },
                obraAddress: {
                    street: data.obraAddress.street,
                    neighborhood: data.obraAddress.neighborhood,
                    city: data.obraAddress.city,
                    state: data.obraAddress.state,
                    zipCode: data.obraAddress.zipCode,
                    number: data.obraAddress.number,
                    complement: data.obraAddress.complement,
                },
                productId: data.productId,
                startDate,
                status: data.status || "planned",
                schedules: {
                    create: schedules,
                },
            },
            include: {
                user: true,
                product: {
                    include: {
                        steps: true,
                    },
                },
                schedules: {
                    include: {
                        productStep: true,
                    },
                    orderBy: {
                        plannedStartDate: "asc",
                    },
                },
            },
        });
        return project;
    },
    // Atualizar campos simples do projeto (exceto productId e startDate que são imutáveis)
    async update(projectId, userId, data) {
        // 1. Validar que o projeto existe e pertence ao usuário
        const existingProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
            },
        });
        if (!existingProject) {
            throw new Error("Projeto não encontrado ou sem permissão");
        }
        // 2. Preparar dados para atualização
        const updateData = {};
        if (data.projectName !== undefined) {
            updateData.projectName = data.projectName;
        }
        if (data.clientName !== undefined) {
            updateData.clientName = data.clientName;
        }
        if (data.clientAddress !== undefined) {
            updateData.clientAddress = {
                street: data.clientAddress.street,
                neighborhood: data.clientAddress.neighborhood,
                city: data.clientAddress.city,
                state: data.clientAddress.state,
                zipCode: data.clientAddress.zipCode,
                number: data.clientAddress.number,
                complement: data.clientAddress.complement,
            };
        }
        if (data.obraAddress !== undefined) {
            updateData.obraAddress = {
                street: data.obraAddress.street,
                neighborhood: data.obraAddress.neighborhood,
                city: data.obraAddress.city,
                state: data.obraAddress.state,
                zipCode: data.obraAddress.zipCode,
                number: data.obraAddress.number,
                complement: data.obraAddress.complement,
            };
        }
        if (data.status !== undefined) {
            updateData.status = data.status;
        }
        // 3. Atualizar projeto
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                product: {
                    include: {
                        steps: true,
                    },
                },
                schedules: {
                    include: {
                        productStep: true,
                    },
                    orderBy: {
                        plannedStartDate: "asc",
                    },
                },
            },
        });
        return updatedProject;
    },
    // Atualizar status de uma etapa e recalcular cronograma
    async updateStepStatus(projectId, scheduleId, status, actualDate) {
        // 1. Buscar o schedule
        const schedule = await prisma.projectStepSchedule.findFirst({
            where: {
                id: scheduleId,
                projectId,
            },
            include: {
                project: {
                    include: {
                        schedules: {
                            include: {
                                productStep: true,
                            },
                            orderBy: {
                                plannedStartDate: "asc",
                            },
                        },
                    },
                },
            },
        });
        if (!schedule) {
            throw new Error("Etapa não encontrada");
        }
        // 2. Atualizar status da etapa
        const updateData = { status };
        if (status === "in_progress" && !schedule.actualStartDate) {
            updateData.actualStartDate = actualDate
                ? new Date(actualDate)
                : new Date();
        }
        if (status === "completed") {
            updateData.actualEndDate = actualDate ? new Date(actualDate) : new Date();
            if (!schedule.actualStartDate) {
                updateData.actualStartDate = schedule.plannedStartDate;
            }
        }
        await prisma.projectStepSchedule.update({
            where: { id: scheduleId },
            data: updateData,
        });
        // 3. Recalcular etapas seguintes se a etapa foi concluída
        if (status === "completed") {
            const completedSchedule = await prisma.projectStepSchedule.findUnique({
                where: { id: scheduleId },
                include: { productStep: true },
            });
            if (!completedSchedule)
                return;
            // Pegar todas as etapas seguintes (order > atual)
            const nextSchedules = schedule.project.schedules.filter((s) => s.productStep.order > completedSchedule.productStep.order);
            // Calcular diferença entre data planejada e data real
            const actualEnd = completedSchedule.actualEndDate || new Date();
            const plannedEnd = completedSchedule.plannedEndDate;
            const diffDays = Math.floor((actualEnd.getTime() - plannedEnd.getTime()) / (1000 * 60 * 60 * 24));
            // Atualizar datas das etapas seguintes
            for (const nextSchedule of nextSchedules) {
                const newPlannedStart = new Date(nextSchedule.plannedStartDate);
                newPlannedStart.setDate(newPlannedStart.getDate() + diffDays);
                const newPlannedEnd = new Date(nextSchedule.plannedEndDate);
                newPlannedEnd.setDate(newPlannedEnd.getDate() + diffDays);
                await prisma.projectStepSchedule.update({
                    where: { id: nextSchedule.id },
                    data: {
                        plannedStartDate: newPlannedStart,
                        plannedEndDate: newPlannedEnd,
                    },
                });
            }
        }
        // 4. Retornar projeto atualizado
        return await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                schedules: {
                    include: {
                        productStep: true,
                    },
                    orderBy: {
                        plannedStartDate: "asc",
                    },
                },
                product: {
                    include: {
                        steps: true,
                    },
                },
            },
        });
    },
    // Buscar projetos por userId (lista resumida para calendário)
    async findByUserId(userId) {
        return await prisma.project.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                projectName: true,
                clientName: true,
                startDate: true,
                status: true,
                productId: true,
                schedules: {
                    select: {
                        id: true,
                        plannedStartDate: true,
                        plannedEndDate: true,
                        actualStartDate: true,
                        actualEndDate: true,
                        status: true,
                        productStep: {
                            select: {
                                name: true,
                                days: true,
                                order: true,
                            },
                        },
                    },
                    orderBy: {
                        plannedStartDate: "asc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },
    // Buscar projeto específico por ID (detalhes completos)
    async findById(projectId, userId) {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId, // Garante que o projeto pertence ao usuário
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                product: {
                    include: {
                        steps: true,
                    },
                },
                schedules: {
                    include: {
                        productStep: true,
                    },
                    orderBy: {
                        plannedStartDate: "asc",
                    },
                },
            },
        });
        if (!project) {
            throw new Error("Projeto não encontrado ou sem permissão");
        }
        return project;
    },
    //   // 1. Verificar se o produto existe e pertence ao usuário
    //   const existingProject = await prisma.project.findFirst({
    //     where: {
    //       id: data.id,
    //       userId: data.userId,
    //     },
    //   });
    //   if (!existingProject) {
    //     throw new Error("Produto não encontrado ou sem permissão");
    //   }
    //   // 2. Deletar etapas antigas
    //   await prisma.projectStep.deleteMany({
    //     where: {
    //       projectId: data.id,
    //     },
    //   });
    //   // 3. Atualizar produto e criar novas etapas
    //   const updatedProject = await prisma.project.update({
    //     where: {
    //       id: data.id,
    //     },
    //     data: {
    //       value: data.value,
    //       description: data.description,
    //       steps: {
    //         create: data.steps.map((step) => ({
    //           name: step.name,
    //           days: step.days,
    //           order: step.order,
    //         })),
    //       },
    //     },
    //     include: {
    //       steps: true,
    //     },
    //   });
    //   return updatedProject;
    // },
    // // Buscar todos os produtos
    // async getAll() {
    //   return await prisma.project.findMany({
    //     include: {
    //       steps: true,
    //     },
    //   });
    // },
    // // Buscar produtos por userId
    // async findByUserId(userId: string) {
    //   return await prisma.project.findMany({
    //     where: {
    //       userId,
    //     },
    //     include: {
    //       steps: true,
    //     },
    //     orderBy: {
    //       createdAt: "desc",
    //     },
    //   });
    // },
    // // Deletar produto
    // async delete(id: number, userId: string) {
    //   // Verificar se o produto existe e pertence ao usuário
    //   const existingProject = await prisma.project.findFirst({
    //     where: {
    //       id,
    //       userId,
    //     },
    //   });
    //   if (!existingProject) {
    //     throw new Error("Produto não encontrado ou sem permissão");
    //   }
    //   // Deletar produto (cascade vai deletar as steps automaticamente)
    //   await prisma.project.delete({
    //     where: {
    //       id,
    //     },
    //   });
    //   return { message: "Produto deletado com sucesso" };
    // },
};
//# sourceMappingURL=project.service.js.map