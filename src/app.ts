import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.routes";
import { usersRouter } from "./routes/users.routes";
import { matchesRouter } from "./routes/matches.routes";
import { predictionsRouter } from "./routes/predictions.routes";
import { dataRouter } from "./routes/data.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/predictions", predictionsRouter);
app.use("/api/data", dataRouter);

app.use(errorMiddleware);
