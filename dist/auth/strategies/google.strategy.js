import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { userService } from '../../services/user.service.js';
import 'dotenv/config';
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Extrair dados do perfil do Google
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;
        const googleId = profile.id;
        if (!email) {
            return done(new Error('Email not provided by Google'), undefined);
        }
        // Verificar se usuário já existe pelo Google ID
        let user = await userService.findByGoogleId(googleId);
        if (!user) {
            // Se não existe, verificar se já existe pelo email (pode ter criado conta tradicional)
            user = await userService.findByEmail(email);
            if (user) {
                // Atualizar usuário existente com Google ID
                user = await userService.update(user.id, { googleId, ...(avatar && { avatar }) });
            }
            else {
                // Criar novo usuário
                user = await userService.create({
                    email,
                    name,
                    ...(avatar && { avatar }),
                    googleId,
                });
            }
        }
        // Retornar usuário autenticado
        return done(null, user);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
// Serializar usuário na sessão (usado durante OAuth flow)
passport.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserializar usuário da sessão
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userService.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
export default passport;
//# sourceMappingURL=google.strategy.js.map