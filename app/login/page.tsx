import { Suspense } from "react";
import LoginClient from "@/components/LoginClient";

export const metadata = { title: "Sign in — ファヤの辞書" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
