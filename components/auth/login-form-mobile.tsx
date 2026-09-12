"use client";

import Link from "next/link";
import type { UseLoginResult } from "@/hooks/use-login";
import { AuthTextField } from "@/components/auth/auth-text-field";

type LoginFormMobileProps = Pick<
  UseLoginResult,
  | "phone"
  | "password"
  | "phoneError"
  | "passwordError"
  | "formError"
  | "loading"
  | "handlePhoneChange"
  | "handlePasswordChange"
  | "handleLogin"
  | "handleRegister"
  | "handleGuestLogin"
>;

/** Mobile login — parity с workflow-mobile/app/login/index.tsx */
export function LoginFormMobile({
  phone,
  password,
  phoneError,
  passwordError,
  formError,
  loading,
  handlePhoneChange,
  handlePasswordChange,
  handleLogin,
  handleRegister,
  handleGuestLogin,
}: LoginFormMobileProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="flex flex-1 flex-col justify-center px-5 py-8">
        <header className="mb-12 flex flex-col gap-3">
          <h1 className="text-[28px] font-semibold leading-10 text-white">Вход</h1>
          <p className="text-lg leading-[26px] text-content-tertiary">
            Войдите в свою учетную запись
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <AuthTextField
            id="phone"
            label="Номер телефона"
            type="tel"
            placeholder="+7 XXX XXX XX XX"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={19}
            error={phoneError}
            inputMode="tel"
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-base font-medium leading-6 text-white">
                Пароль
              </label>
              <Link
                href="/reset-password"
                className="text-xs font-medium leading-6 text-brand"
              >
                Забыли пароль?
              </Link>
            </div>
            <AuthTextField
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              error={passwordError}
              hideLabel
            />
          </div>

          {formError ? (
            <p className="text-center text-sm text-brand">{formError}</p>
          ) : null}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-brand-fill text-base font-medium text-white disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>

          <button
            type="button"
            onClick={handleRegister}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[rgba(56,189,248,0.18)] text-base font-normal text-info-400"
          >
            Запросить регистрацию
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="flex h-12 w-full items-center justify-center rounded-lg border border-hairline bg-transparent text-base font-normal text-content-tertiary"
          >
            Открыть демо-режим
          </button>

          <Link
            href="/privacy"
            className="py-2 text-center text-base text-content-tertiary hover:opacity-80"
          >
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </div>
  );
}
