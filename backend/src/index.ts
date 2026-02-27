import express from "express";
import cors from "cors";
import recipeRoutes from "./routes/recipes";
import searchRoutes from "./routes/search";
import allergenSubRoutes from "./routes/allergenSub";

const app = express();
const PORT = process.env.PORT ?? 5001;

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',')
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use("/api/recipes", recipeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/allergen-sub", allergenSubRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Culinr backend running on http://localhost:${PORT}`);
});
