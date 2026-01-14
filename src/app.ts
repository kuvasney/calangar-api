// api/src/app.ts
import "dotenv/config";
import express, { type Express } from "express";
import session from "express-session";
import cors from "cors";
import passport from "./auth/strategies/google.strategy.js";
import routes from "./routes/index.js";

const app: Express = express();

// CORS - Permitir requisições do frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Permitir cookies
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (necessário para Passport OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS em produção
      maxAge: 10 * 60 * 1000, // 10 minutos (só para OAuth flow)
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Rotas
app.use("/api", routes);

export default app;
