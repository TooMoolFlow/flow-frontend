"use client";

import { useEffect } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useIsDesktop } from "@/hooks/use-media-query";

/**
 * Ставит `html.dark` — от него зависят все токены.
 *
 * Десктоп тёмный всегда: светлой версии у него нет. Раньше класс на десктопе
 * намеренно снимался, потому что тёмность держалась на жёстко прописанных
 * цветах и `!important`-каскаде, а не на теме. Теперь она держится на токенах,
 * и без класса на корне светлыми оставались все портальные слои — поповеры,
 * выпадающие списки, диалоги, тосты: Radix рендерит их в `document.body`, то
 * есть снаружи тёмной области ролевого shell.
 *
 * На мобильном схему выбирает пользователь.
 */
export function MobileThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDesktop || scheme === "dark");
  }, [scheme, isDesktop]);

  return <>{children}</>;
}
