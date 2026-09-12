"use client";

import { useEffect, useState } from "react";

/**
 * true после первого клиентского рендера, когда zustand-persist уже поднял
 * состояние из localStorage.
 *
 * До этого момента `user` в useAuthStore всегда null, поэтому проверка вида
 * `if (!user) router.push("/login")` на маунте выбрасывает залогиненного
 * пользователя на страницу входа при прямом заходе или обновлении страницы.
 * Тот же приём инлайном используют ролевые layout-ы (app/client/layout.tsx и др.).
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
