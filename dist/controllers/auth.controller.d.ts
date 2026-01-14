import type { Request, Response } from "express";
declare class AuthController {
    /**
     * Registra um novo usuário com email e senha
     * POST /api/auth/register
     */
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Login com email e senha
     * POST /api/auth/login
     */
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Callback do Google OAuth
     * GET /api/auth/google/callback
     */
    googleCallback(req: Request, res: Response): void;
    /**
     * Renovar access token usando refresh token
     * POST /api/auth/refresh-token
     */
    refreshToken(req: Request, res: Response): Response<any, Record<string, any>> | undefined;
    /**
     * Logout
     * POST /api/auth/logout
     */
    logout(req: Request, res: Response): void;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=auth.controller.d.ts.map