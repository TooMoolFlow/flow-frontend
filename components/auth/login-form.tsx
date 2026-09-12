"use client";

import { useLogin } from "@/hooks/use-login";
import { LoginFormDesktop } from "@/components/auth/login-form-desktop";
import { LoginFormMobile } from "@/components/auth/login-form-mobile";

export function LoginForm() {
  const login = useLogin();

  return (
    <>
      <div data-theme="dark" className="hidden min-h-screen bg-background md:block">
        <LoginFormDesktop {...login} />
      </div>
      <div data-theme="dark" className="min-h-screen bg-background md:hidden">
        <LoginFormMobile {...login} />
      </div>
    </>
  );
}
