"use server";

import { redirect } from "next/navigation";

import {
  areAdminCredentialsValid,
  clearAdminSession,
  setAdminSession,
} from "@/lib/admin-auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _state: LoginState | undefined,
  formData: FormData,
): Promise<LoginState | undefined> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!areAdminCredentialsValid(username, password)) {
    return {
      error: "Invalid username or password.",
    };
  }

  await setAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}