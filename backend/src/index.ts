import express from "express";
import cors from "cors";
import recipeRoutes from "./routes/recipes";
import searchRoutes from "./routes/search";
import allergenSubRoutes from "./routes/allergenSub";

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
      // Preview URLs have exactly one extra segment (the hash) inserted at position 1
      if (oParts.length !== aParts.length + 1) return false
      const withoutHash = [oParts[0], ...oParts.slice(2)]
      return withoutHash.join('-') === aParts.join('-')
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

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Culinr backend running on http://localhost:${PORT}`);
});
