import { Router, type Router as ExpressRouter } from "express";
import { projectController } from "../controllers/project.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router: ExpressRouter = Router();

// Rota para criar um novo projeto (protegida)
router.post("/", authMiddleware, (req, res) =>
  projectController.create(req, res),
);

// Rota para obter todos os projetos (protegida)
router.get("/", authMiddleware, (req, res) =>
  projectController.getAllProjects(req, res),
);

// Rota para obter projeto específico por ID (protegida)
router.get("/:id", authMiddleware, (req, res) =>
  projectController.getProjectById(req, res),
);

// Rota para atualizar campos simples do projeto (protegida)
// Não permite atualizar productId e startDate (imutáveis)
router.put("/:id", authMiddleware, (req, res) =>
  projectController.update(req, res),
);

// Rota para atualizar status de uma etapa específica (protegida)
// Recalcula automaticamente as datas das próximas etapas
router.patch("/:id/schedules/:scheduleId/status", authMiddleware, (req, res) =>
  projectController.updateStepStatus(req, res),
);

// Rota para deletar um projeto (protegida)
router.delete("/:id", authMiddleware, (req, res) =>
  projectController.delete(req, res),
);

export default router;
