import { lusitana } from "@/app/ui/fonts";
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "./button";

export default function LoginForm({ onSubmit }: { onSubmit: any }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#e2e8f0)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-2xl shadow-slate-300/40 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden  p-10 text-white md:flex md:flex-col md:justify-between">
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
                <h1 className={`${lusitana.className} mb-3 text-2xl`}>
                  Please log in to continue.
                </h1>
                <div className="w-full">
                  <div>
                    <label
                      className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="Enter your AD username"
                        required
                      />
                      <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label
                      className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        required
                        minLength={6}
                      />
                      <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    </div>
                  </div>
                </div>
                <Button className="mt-4 w-full">
                  Log in{" "}
                  <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
                </Button>
                <div className="flex h-8 items-end space-x-1">
                  {/* Add form errors here */}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
