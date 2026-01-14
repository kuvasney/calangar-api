import type { Request, Response } from "express";
declare class ProjectController {
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllProjects(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getProjectById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateStepStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const projectController: ProjectController;
export {};
//# sourceMappingURL=project.controller.d.ts.map