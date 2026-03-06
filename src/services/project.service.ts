import { prisma } from "../config/prisma.js";
import type { ProductStep } from "@prisma/client";

interface CreateProjectData {
  userId: string;
  projectName: string;
  clientName: string;
  clientAddress: Address;
  obraAddress: Address;
  productId: number;
  startDate: string; // Será convertido para Date no create
  status?: projectStatus;
}

interface UpdateProjectData {
  projectName?: string;
  clientName?: string;
  clientAddress?: Address;
  obraAddress?: Address;
  status?: projectStatus;
  startDate?: string;
}

type projectStatus = "planned" | "in_progress" | "completed";

interface StepProgress {
  stepId: number;
  status: "completed" | "in_progress" | "pending";
  actualStartDate?: string;
  actualEndDate?: string;
  plannedStartDate: string;
  plannedEndDate: string;
}

interface Address {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  number: string;
  complement?: string;
}

interface Project {
  id: number;
  clientName: string;
  projectAddress: Address;
  projectName: string;
  productId: number;
  startDate: string;
  stepsProgress: StepProgress[];
}

// Helper: Calcular datas do cronograma baseado nas etapas
function calculateSchedule(startDate: Date, steps: ProductStep[]) {
  const schedules = [];
  let currentDate = new Date(startDate);

  // Ordenar steps pela ordem
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  for (const [index, step] of sortedSteps.entries()) {
    const plannedStartDate = new Date(currentDate);
    const plannedEndDate = new Date(currentDate);
    plannedEndDate.setDate(plannedEndDate.getDate() + step.days - 1);

    schedules.push({
      productStepId: step.id,
      plannedStartDate,
      plannedEndDate,
      status: index === 0 ? "in_progress" : "pending",
      actualStartDate: index === 0 ? new Date(plannedStartDate) : null,
    });

    // Próxima etapa começa no dia seguinte ao fim desta
    currentDate = new Date(plannedEndDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
}

const projectFullInclude = {
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
      plannedStartDate: "asc" as const,
    },
  },
};

function parseDateInput(date?: string) {
  if (!date) return undefined;
  const normalized = date.includes("T") ? date : `${date}T12:00:00.000Z`;
  return new Date(normalized);
}

function addDays(baseDate: Date, days: number) {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}

async function recalculateFollowingSchedules(
  schedules: Array<{
    id: number;
    actualEndDate: Date | null;
    plannedStartDate: Date;
    plannedEndDate: Date;
    productStep: { days: number };
  }>,
  currentIndex: number,
  options: {
    daysDiff: number;
    referenceEndDate: Date;
    updatePlannedEndDate: boolean;
  },
) {
  const { daysDiff, referenceEndDate, updatePlannedEndDate } = options;

  if (currentIndex < 0) return;

  if (updatePlannedEndDate) {
    let nextStartDate = addDays(referenceEndDate, 1);

    for (let i = currentIndex + 1; i < schedules.length; i++) {
      const nextSchedule = schedules[i];

      if (!nextSchedule || nextSchedule.actualEndDate) {
        continue;
      }

      const recalculatedPlannedStartDate = new Date(nextStartDate);
      const recalculatedPlannedEndDate = addDays(
        recalculatedPlannedStartDate,
        nextSchedule.productStep.days - 1,
      );

      await prisma.projectStepSchedule.update({
        where: { id: nextSchedule.id },
        data: {
          actualStartDate: recalculatedPlannedStartDate,
          plannedStartDate: recalculatedPlannedStartDate,
          plannedEndDate: recalculatedPlannedEndDate,
        },
      });

      nextStartDate = addDays(recalculatedPlannedEndDate, 1);
    }

    return;
  }

  if (daysDiff === 0) {
    return;
  }

  for (let i = currentIndex + 1; i < schedules.length; i++) {
    const nextSchedule = schedules[i];

    if (!nextSchedule || nextSchedule.actualEndDate) {
      continue;
    }

    const shiftedActualStartDate = addDays(
      nextSchedule.plannedStartDate,
      daysDiff,
    );

    await prisma.projectStepSchedule.update({
      where: { id: nextSchedule.id },
      data: {
        actualStartDate: shiftedActualStartDate,
      },
    });
  }
}

export const projectService = {
  // Criar novo projeto
  async create(data: CreateProjectData) {
    // 1. Buscar o produto com suas etapas
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { steps: true },
    });

    if (!product) {
      throw new Error("Produto não encontrado");
    }

    // 2. Calcular cronograma baseado nas etapas
    // Garantir que a data seja interpretada como meio-dia UTC para evitar problemas de timezone
    const dateStr =
      typeof data.startDate === "string"
        ? data.startDate.includes("T")
          ? data.startDate
          : `${data.startDate}T12:00:00.000Z`
        : data.startDate;
    const startDate = new Date(dateStr);
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
        ...projectFullInclude,
      },
    });

    return project;
  },

  // Atualizar campos simples do projeto (exceto productId)
  async update(projectId: number, userId: string, data: UpdateProjectData) {
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
    const updateData: any = {};

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

    if (data.startDate !== undefined) {
      // Garantir que a data seja interpretada como meio-dia UTC para evitar problemas de timezone
      const dateStr =
        typeof data.startDate === "string"
          ? data.startDate.includes("T")
            ? data.startDate
            : `${data.startDate}T12:00:00.000Z`
          : data.startDate;
      updateData.startDate = new Date(dateStr);
    }

    // 3. Atualizar projeto
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        ...projectFullInclude,
      },
    });

    // 4. Se startDate foi alterado, recalcular todos os schedules pendentes
    if (data.startDate !== undefined) {
      const product = await prisma.product.findUnique({
        where: { id: existingProject.productId },
        include: {
          steps: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (product) {
        // Usar a data já convertida corretamente em updateData
        let currentDate = new Date(updateData.startDate);

        // Recalcular datas planejadas de todas as etapas conforme nova data inicial
        for (const step of product.steps) {
          const schedule = updatedProject.schedules.find(
            (s) => s.productStepId === step.id,
          );

          if (schedule) {
            const endDate = new Date(currentDate);
            endDate.setDate(currentDate.getDate() + step.days - 1);

            await prisma.projectStepSchedule.update({
              where: { id: schedule.id },
              data: {
                plannedStartDate: new Date(currentDate),
                plannedEndDate: endDate,
              },
            });

            currentDate = new Date(endDate);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        // Recarregar o projeto com schedules atualizados
        return await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            ...projectFullInclude,
          },
        });
      }
    }

    return updatedProject;
  },

  // Atualizar status de uma etapa e recalcular cronograma
  async updateStepStatus(
    projectId: number,
    userId: string,
    scheduleId: number,
    status: "pending" | "in_progress" | "completed",
    actualDate?: string,
    actualStartDate?: string,
    actualEndDate?: string,
  ) {
    // 1. Buscar o schedule
    const schedule = await prisma.projectStepSchedule.findFirst({
      where: {
        id: scheduleId,
        projectId,
        project: {
          userId,
        },
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

    const previousStatus = schedule.status;
    const scheduleIndex = schedule.project.schedules.findIndex(
      (item) => item.id === scheduleId,
    );
    const nextSchedule =
      scheduleIndex >= 0
        ? schedule.project.schedules[scheduleIndex + 1]
        : undefined;

    // 2. Atualizar status da etapa
    const updateData: any = { status };
    const parsedActualDate = parseDateInput(actualDate);
    const parsedActualStartDate = parseDateInput(actualStartDate);
    const parsedActualEndDate = parseDateInput(actualEndDate);

    if (status === "pending") {
      updateData.actualStartDate = null;
      updateData.actualEndDate = null;
    }

    if (status === "in_progress") {
      updateData.actualStartDate =
        parsedActualStartDate ??
        parsedActualDate ??
        schedule.actualStartDate ??
        new Date();
    }

    // Desfazer conclusão: ao voltar de completed para in_progress,
    // remover data real de fim da própria etapa
    if (previousStatus === "completed" && status === "in_progress") {
      updateData.actualEndDate = null;
    }

    if (status === "completed") {
      updateData.actualStartDate =
        parsedActualStartDate ??
        schedule.actualStartDate ??
        schedule.plannedStartDate;
      updateData.actualEndDate =
        parsedActualEndDate ?? parsedActualDate ?? new Date();
    }

    await prisma.projectStepSchedule.update({
      where: { id: scheduleId },
      data: updateData,
    });

    // 2.1 Recalcular etapas seguintes conforme regra de datas reais da etapa atual
    if (status === "completed") {
      const completedActualEndDate =
        updateData.actualEndDate ?? schedule.actualEndDate;
      const completedActualStartDate =
        updateData.actualStartDate ?? schedule.actualStartDate;

      if (completedActualEndDate) {
        const msInDay = 1000 * 60 * 60 * 24;
        const daysDiff = Math.ceil(
          (completedActualEndDate.getTime() -
            schedule.plannedEndDate.getTime()) /
            msInDay,
        );

        const hasCustomStartDate =
          Boolean(parsedActualStartDate) &&
          Boolean(completedActualStartDate) &&
          completedActualStartDate.getTime() !==
            schedule.plannedStartDate.getTime();

        const hasCustomEndDate =
          Boolean(parsedActualEndDate) &&
          completedActualEndDate.getTime() !==
            schedule.plannedEndDate.getTime();

        const currentIndex = schedule.project.schedules.findIndex(
          (item) => item.id === scheduleId,
        );

        if (daysDiff > 0) {
          await recalculateFollowingSchedules(
            schedule.project.schedules,
            currentIndex,
            {
              daysDiff,
              referenceEndDate: completedActualEndDate,
              updatePlannedEndDate: true,
            },
          );
        } else if (daysDiff < 0) {
          await recalculateFollowingSchedules(
            schedule.project.schedules,
            currentIndex,
            {
              daysDiff,
              referenceEndDate: completedActualEndDate,
              updatePlannedEndDate: false,
            },
          );
        } else if (hasCustomStartDate || hasCustomEndDate) {
          await recalculateFollowingSchedules(
            schedule.project.schedules,
            currentIndex,
            {
              daysDiff: 0,
              referenceEndDate: completedActualEndDate,
              updatePlannedEndDate: true,
            },
          );
        }
      }
    }

    // 2.3 Atualizar etapa seguinte automaticamente
    if (nextSchedule) {
      // Ao concluir uma etapa, próxima vira in_progress
      if (status === "completed" && nextSchedule.status !== "completed") {
        await prisma.projectStepSchedule.update({
          where: { id: nextSchedule.id },
          data: {
            status: "in_progress",
            actualStartDate: nextSchedule.actualStartDate ?? new Date(),
          },
        });
      }

      // Ao desfazer (completed -> in_progress), próxima volta para pending
      if (previousStatus === "completed" && status === "in_progress") {
        await prisma.projectStepSchedule.update({
          where: { id: nextSchedule.id },
          data: {
            status: "pending",
            actualStartDate: null,
            actualEndDate: null,
          },
        });
      }
    }

    // 3. Recarregar todas as etapas do projeto após o update
    const allSchedules = await prisma.projectStepSchedule.findMany({
      where: { projectId },
    });

    // 4. Verificar se todas as etapas estão concluídas
    const openedSchedules = allSchedules.filter(
      (o) => o.actualEndDate === null,
    );

    if (openedSchedules.length < 1) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: "completed",
        },
      });
    } else {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: "in_progress",
        },
      });
    }

    // 4. Retornar projeto atualizado
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        ...projectFullInclude,
      },
    });
  },

  // Atualizar datas planejadas de uma etapa específica
  async updateScheduleDates(
    projectId: number,
    scheduleId: number,
    userId: string,
    plannedStartDate?: string,
    plannedEndDate?: string,
  ) {
    // 1. Verificar se o projeto pertence ao usuário
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      throw new Error("Projeto não encontrado ou sem permissão");
    }

    // 2. Verificar se o schedule pertence ao projeto
    const schedule = await prisma.projectStepSchedule.findFirst({
      where: {
        id: scheduleId,
        projectId,
      },
    });

    if (!schedule) {
      throw new Error("Etapa não encontrada");
    }

    // 3. Preparar dados para atualização
    const updateData: any = {};

    if (plannedStartDate !== undefined) {
      const dateStr =
        typeof plannedStartDate === "string"
          ? plannedStartDate.includes("T")
            ? plannedStartDate
            : `${plannedStartDate}T12:00:00.000Z`
          : plannedStartDate;
      updateData.plannedStartDate = new Date(dateStr);
    }

    if (plannedEndDate !== undefined) {
      const dateStr =
        typeof plannedEndDate === "string"
          ? plannedEndDate.includes("T")
            ? plannedEndDate
            : `${plannedEndDate}T12:00:00.000Z`
          : plannedEndDate;
      updateData.plannedEndDate = new Date(dateStr);
    }

    // 4. Atualizar o schedule
    await prisma.projectStepSchedule.update({
      where: { id: scheduleId },
      data: updateData,
    });

    // 5. Retornar o projeto atualizado
    return await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        ...projectFullInclude,
      },
    });
  },

  // Buscar projetos por userId (lista resumida para calendário)
  async findByUserId(userId: string) {
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
  async findById(projectId: number, userId: string) {
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

  // Deletar projeto
  async delete(id: number, userId: string) {
    // Verificar se o projeto existe e pertence ao usuário
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingProject) {
      throw new Error("Projeto não encontrado ou sem permissão");
    }

    // Deletar projeto (cascade vai deletar as steps automaticamente)
    await prisma.project.delete({
      where: {
        id,
      },
    });

    return { message: "Projeto deletado com sucesso" };
  },
};
