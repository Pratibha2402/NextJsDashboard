// app/lib/actions/authActions.ts
"use server";

import { signOut } from "@/app/lib/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/Login" });
}