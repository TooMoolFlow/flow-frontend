"use client";

import dynamic from "next/dynamic";

/**
 * Страница рендерится только на клиенте.
 *
 * При серверном рендере сегмент отдавался незакрытой Suspense-границей:
 * разметка политики приезжала внутри <template>, но на клиенте граница
 * не раскрывалась. Прямой заход на /privacy и обновление страницы
 * показывали пустой экран, хотя переход по ссылке внутри приложения
 * работал. Страница статическая и в SSR не нуждается.
 */
const PrivacyView = dynamic(
  () => import("@/components/auth/privacy-view").then((m) => m.PrivacyView),
  { ssr: false },
);

export default function PrivacyPage() {
  return <PrivacyView />;
}
