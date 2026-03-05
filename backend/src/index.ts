import express from "express";
import cors from "cors";
import recipeRoutes from "./routes/recipes";
import searchRoutes from "./routes/search";
import allergenSubRoutes from "./routes/allergenSub";
import scanRoutes from "./routes/scan";

const app = express();
const PORT = process.env.PORT ?? 5001;

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())

// Also accept Vercel preview deployment URLs (contain a random hash segment).
// e.g. if CORS_ORIGIN is https://culinr-kaylacoelhos-projects.vercel.app,
// also allow https://culinr-ltn2elv48-kaylacoelhos-projects.vercel.app
function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true
  return allowedOrigins.some(allowed => {
    try {
      const allowedHost = new URL(allowed).hostname
      const originHost = new URL(origin).hostname
      if (!allowedHost.endsWith('.vercel.app') || !originHost.endsWith('.vercel.app')) return false
      const aParts = allowedHost.replace('.vercel.app', '').split('-')
      const oParts = originHost.replace('.vercel.app', '').split('-')
      // Case 1: same project-team slug, one extra hash segment
      // culinr-kaylacoelhos-projects.vercel.app → culinr-HASH-kaylacoelhos-projects.vercel.app
      if (oParts.length === aParts.length + 1) {
        const withoutHash = [oParts[0], ...oParts.slice(2)]
        if (withoutHash.join('-') === aParts.join('-')) return true
      }
      // Case 2: production is a short domain (e.g. culinr.vercel.app), preview has team slug
      // culinr.vercel.app → culinr-HASH-team.vercel.app
      if (aParts.length === 1 && oParts[0] === aParts[0] && oParts.length > 1) return true
      return false
    } catch {
      return false
    }
  })
}

app.use(cors({ origin: (origin, cb) => cb(null, isAllowedOrigin(origin)) }));
app.use(express.json());

app.use("/api/recipes", recipeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/allergen-sub", allergenSubRoutes);
app.use("/api/recipes/scan", scanRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Culinr backend running on http://localhost:${PORT}`);
});
