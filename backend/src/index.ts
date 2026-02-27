import express from "express";
import cors from "cors";
import recipeRoutes from "./routes/recipes";
import searchRoutes from "./routes/search";
import allergenSubRoutes from "./routes/allergenSub";

const app = express();
const PORT = process.env.PORT ?? 5001;

app.use(cors({ origin: "http://localhost:5173" }));
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
