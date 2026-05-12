import Link from "next/link";
import { Header } from "@/components/brand/Header";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export const dynamic = "force-dynamic";

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header subtitle="Add a recipe to your cookbook" />

      <Link
        href="/recipes"
        className="mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
      >
        ← All recipes
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-50">
        New recipe
      </h1>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      ) : null}

      <RecipeForm />
    </main>
  );
}
