import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
export const userService = {
    // Buscar usuário por email
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    },
    // Buscar usuário por Google ID
    async findByGoogleId(googleId) {
        return await prisma.user.findUnique({
            where: { googleId },
        });
    },
    // Buscar usuário por ID
    async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
        });
    },
    // Criar novo usuário
    async create(data) {
        const userData = {
            email: data.email,
            name: data.name,
            avatar: data.avatar,
            googleId: data.googleId,
        };
        // Se tiver senha, fazer hash
        if (data.password) {
            userData.password = await bcrypt.hash(data.password, 10);
        }
        return await prisma.user.create({
            data: userData,
        });
    },
    // Verificar senha (para login tradicional)
    async verifyPassword(user, password) {
        if (!user.password)
            return false;
        return await bcrypt.compare(password, user.password);
    },
    // Atualizar usuário
    async update(id, data) {
        const updateData = { ...data };
        // Se estiver atualizando senha, fazer hash
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }
        return await prisma.user.update({
            where: { id },
            data: updateData,
        });
    },
};
//# sourceMappingURL=user.service.js.map