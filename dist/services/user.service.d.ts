import type { User } from '@prisma/client';
interface CreateUserData {
    email: string;
    name: string;
    password?: string;
    avatar?: string;
    googleId?: string;
}
export declare const userService: {
    findByEmail(email: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: CreateUserData): Promise<User>;
    verifyPassword(user: User, password: string): Promise<boolean>;
    update(id: string, data: Partial<CreateUserData>): Promise<User>;
};
export {};
//# sourceMappingURL=user.service.d.ts.map