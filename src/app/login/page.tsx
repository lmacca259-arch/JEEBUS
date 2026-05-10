import { login, signup } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">HYETAS</h1>
        <p className="mt-1 text-sm text-slate-400">
          {isSignup ? "Create your account." : "Welcome back."}
        </p>
      </header>

      <form className="mt-12 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={8}
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <p className="text-sm text-rose-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          formAction={isSignup ? signup : login}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
        >
          {isSignup ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <a href="/login" className="text-emerald-400 hover:text-emerald-300">
              Log in
            </a>
          </>
        ) : (
          <>
            New here?{" "}
            <a
              href="/login?mode=signup"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Create an account
            </a>
          </>
        )}
      </p>

      <p className="mt-auto pt-12 text-[10px] uppercase tracking-wider text-slate-600">
        the system asks. you don&apos;t have to.
      </p>
    </main>
  );
}
