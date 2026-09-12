"use client";

import { useResetPassword } from "@/hooks/use-reset-password";
import { ResetPasswordFormDesktop } from "@/components/auth/reset-password-form-desktop";
import { ResetPasswordFormMobile } from "@/components/auth/reset-password-form-mobile";

export function ResetPasswordForm() {
  const reset = useResetPassword();

  return (
    <>
      <div data-theme="dark" className="hidden min-h-screen bg-background md:block">
        <ResetPasswordFormDesktop {...reset} />
      </div>
      <div data-theme="dark" className="min-h-screen bg-background md:hidden">
        <ResetPasswordFormMobile {...reset} />
      </div>
    </>
  );
}
