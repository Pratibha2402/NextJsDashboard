"use client";

import { signIn } from "next-auth/react";
import LoginForm from "@/app/ui/login-form";
export default function Login() {
  async function handleSubmit(e: any) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirect: true,
      callbackUrl: "/Dashboard",
    });
  }

  return (
    <LoginForm onSubmit={handleSubmit} />

    /*   <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#e2e8f0)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-2xl shadow-slate-300/40 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden bg-slate-900 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
                IOC Network
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">
                Sign in with your Active Directory account.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Use your organization username and password to access the
                dashboard securely through AD authentication.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-200">
                Domain
                <span className="ml-2 rounded-full bg-sky-400/15 px-3 py-1 text-xs font-medium text-sky-200">
                  IOC
                </span>
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                If your password is managed by your organization, use the same
                credentials here.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="md:hidden">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-700">
                  IOC Network
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                  AD Login
                </h1>
              </div>

              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-500">
                  Welcome back
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                  Login to Dashboard
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your AD username"
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
                >
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    */
  );
}
