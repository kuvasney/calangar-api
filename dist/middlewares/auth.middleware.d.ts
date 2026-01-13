import type { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    userId: string;
    email: string;
}
declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthUser;
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map