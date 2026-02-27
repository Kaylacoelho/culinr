import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parseRecipeUrl, searchRecipes } from "../services/recipeApi";
import { useRestrictions } from "../hooks/useRestrictions";
import { RESTRICTIONS } from "../types/dietary";
import type { Recipe } from "../types/recipe";
import type { SearchResult } from "../services/recipeApi";

export default function Home() {
  const [mode, setMode] = useState<"url" | "search">("url");

  // URL paste mode
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState("");

  // Search mode
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState("");
  const [importing, setImporting] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<Record<string, string>>({});
  const [filterByDiet, setFilterByDiet] = useState(false);

  const { restrictions, allergies } = useRestrictions();
  const activeRestrictionLabels = RESTRICTIONS.filter((r) =>
    restrictions.includes(r.value),
  );
  const hasAnyRestrictions = restrictions.length > 0 || allergies.length > 0;

  const navigate = useNavigate();

  // Restore search state when returning via "← Search results"
  useEffect(() => {
    const raw = sessionStorage.getItem("culinr_search_back");
    if (!raw) return;
    sessionStorage.removeItem("culinr_search_back");
    try {
      const saved = JSON.parse(raw) as {
        query: string;
        results: SearchResult[];
        filterByDiet: boolean;
      };
      setMode("search");
      setQuery(saved.query);
      setResults(saved.results);
      setFilterByDiet(saved.filterByDiet);
    } catch {
      // ignore malformed data
    }
  }, []);

  async function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setUrlError("");
    try {
      const recipe: Recipe = await parseRecipeUrl(trimmed);
      navigate(`/recipe/${recipe.id}`, { state: { recipe } });
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    setSearchError("");
    setResults([]);
    try {
      const effectiveQuery =
        filterByDiet && hasAnyRestrictions
          ? [
              trimmed,
              ...restrictions,
              ...allergies.map((a) => `-${a.name}`),
            ].join(" ")
          : trimmed;
      const data = await searchRecipes(effectiveQuery);
      setResults(data);
      if (data.length === 0)
        setSearchError("No results found. Try a different search.");
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function handleImport(result: SearchResult) {
    sessionStorage.setItem(
      "culinr_search_back",
      JSON.stringify({ query, results, filterByDiet }),
    );
    setImporting(result.url);
    setImportErrors((prev) => ({ ...prev, [result.url]: "" }));
    try {
      const recipe: Recipe = await parseRecipeUrl(result.url);
      navigate(`/recipe/${recipe.id}`, { state: { recipe, fromSearch: true } });
    } catch (err) {
      setImportErrors((prev) => ({
        ...prev,
        [result.url]: err instanceof Error ? err.message : "Failed to import",
      }));
    } finally {
      setImporting(null);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Clean any recipe, instantly.
        </h1>
        <p className="text-gray-500 text-lg">
          Paste a URL or search online — we strip the ads and life story.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        {(["url", "search"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
              mode === m
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m === "url" ? "🔗 Paste URL" : "🔍 Search online"}
          </button>
        ))}
      </div>

      {/* Paste URL tab */}
      {mode === "url" && (
        <>
          <form onSubmit={handlePasteSubmit} className="flex flex-col gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.allrecipes.com/recipe/..."
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-60"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Fetching recipe…" : "Clean this recipe →"}
            </button>
          </form>
          {urlError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {urlError}
            </div>
          )}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
            {[
              ["🚫", "No ads or popups"],
              ["📋", "Ingredients & steps only"],
              ["💾", "Save for later"],
            ].map(([icon, label]) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Search tab */}
      {mode === "search" && (
        <>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value) {
                  setResults([]);
                  setSearchError("");
                }
              }}
              placeholder="e.g. chocolate lava cake, vegan tacos…"
              disabled={searching}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-60"
              autoFocus
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? "…" : "Search"}
            </button>
          </form>

          {hasAnyRestrictions && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
                  {(["all", "friendly"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFilterByDiet(opt === "friendly")}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        (opt === "friendly") === filterByDiet
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {opt === "all" ? "All recipes" : "Restriction-friendly"}
                    </button>
                  ))}
                </div>
                {filterByDiet && (
                  <div className="relative group">
                    <span className="text-gray-400 hover:text-gray-500 cursor-help text-sm select-none">
                      ⓘ
                    </span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 px-3 py-2 rounded-xl bg-gray-800 text-white text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg text-center">
                      Results use search keywords — not a guarantee. Allergen
                      detection runs after you import a recipe.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                )}
              </div>
              {filterByDiet && (
                <div className="flex flex-wrap gap-1.5">
                  {activeRestrictionLabels.map((r) => (
                    <span
                      key={r.value}
                      className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200"
                    >
                      {r.emoji} {r.label}
                    </span>
                  ))}
                  {allergies.map((a) => (
                    <span
                      key={a.name}
                      className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium border border-red-200"
                    >
                      no {a.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {searchError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm mb-4">
              {searchError}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.url}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm leading-snug mb-0.5">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate mb-2">
                        {result.url}
                      </p>
                      {result.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      {importErrors[result.url] && (
                        <p className="text-xs text-red-600 mt-1">
                          {importErrors[result.url]}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleImport(result)}
                      disabled={importing === result.url}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                    >
                      {importing === result.url ? "…" : "Import →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
