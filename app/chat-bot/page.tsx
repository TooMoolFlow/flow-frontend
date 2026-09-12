import { Suspense } from "react";

import { HelpChatView } from "@/components/help";

/**
 * useSearchParams() внутри HelpChatView требует границы Suspense.
 * Без неё прямой заход на /chat-bot и обновление страницы навсегда
 * оставляли пользователя на экране загрузки: сегмент отдавался
 * незакрытой Suspense-границей и не раскрывался при гидратации.
 * Переход по ссылке внутри приложения при этом работал, поэтому
 * поломка была видна только при перезагрузке.
 */
export default function ChatBotPage() {
  return (
    <Suspense fallback={null}>
      <HelpChatView />
    </Suspense>
  );
}
