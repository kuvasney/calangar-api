import type { Request, Response } from "express";

import { projectService } from "../services/project.service.js";

class ProjectController {
  async create(req: Request, res: Response) {
    try {
      // userId vem do token (req.user), não do body
      const userId = req.user?.userId;

      const {
        projectName,
        clientName,
        clientAddress,
        obraAddress,
        productId,
        startDate,
        status,
      } = req.body;

      // Validações básicas
      if (
        !projectName ||
        !clientName ||
        !clientAddress ||
        !obraAddress ||
        !productId ||
        !startDate
      ) {
        return res.status(400).json({
          error:
            "projectName, clientName, clientAddress, obraAddress, productId and startDate are required",
        });
      }

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Criar projeto
      const project = await projectService.create({
        userId,
        projectName,
        clientName,
        clientAddress,
        obraAddress,
        productId,
        startDate,
        status,
      });

      res.status(201).json({ project });
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAllProjects(req: Request, res: Response) {
    try {
      // req.user vem do authMiddleware
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const projects = await projectService.findByUserId(req.user.userId!);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const projectId = parseInt(req.params.id!);

      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const project = await projectService.findById(
        projectId,
        req.user.userId!,
      );
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      if (error instanceof Error && error.message.includes("não encontrado")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const projectId = parseInt(req.params.id!);

      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const {
        projectName,
        clientName,
        clientAddress,
        obraAddress,
        status,
        startDate,
      } = req.body;

      // Verificar se há pelo menos um campo para atualizar
      if (
        !projectName &&
        !clientName &&
        !clientAddress &&
        !obraAddress &&
        !status &&
        !startDate
      ) {
        return res.status(400).json({
          error:
            "At least one field must be provided: projectName, clientName, clientAddress, obraAddress, status, startDate",
        });
      }

      const updatedProject = await projectService.update(
        projectId,
        req.user.userId!,
        {
          projectName,
          clientName,
          clientAddress,
          obraAddress,
          status,
          startDate,
        },
      );

      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      if (error instanceof Error && error.message.includes("não encontrado")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async updateStepStatus(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const projectId = parseInt(req.params.id!);
      const scheduleId = parseInt(req.params.scheduleId!);

      if (isNaN(projectId) || isNaN(scheduleId)) {
        return res
          .status(400)
          .json({ error: "Invalid project ID or schedule ID" });
      }

      const { status, actualDate } = req.body;

      if (!status || !["in_progress", "completed"].includes(status)) {
        return res.status(400).json({
          error: 'Status must be "in_progress" or "completed"',
        });
      }

      const updatedProject = await projectService.updateStepStatus(
        projectId,
        scheduleId,
        status,
        actualDate,
      );

      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating step status:", error);
      if (error instanceof Error && error.message.includes("não encontrad")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // req.user vem do authMiddleware
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const result = await projectService.delete(Number(id), req.user.userId!);

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error deleting project:", error);

      if (error.message === "Projeto não encontrado ou sem permissão") {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const projectController = new ProjectController();
