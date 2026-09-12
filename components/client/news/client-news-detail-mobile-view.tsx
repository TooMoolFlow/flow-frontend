"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { NewsReactionsRow } from "@/components/news/news-reactions-row";
import { formatNewsDisplayDate } from "@/constants/news-filters";
import { useClientNewsDetailPage } from "@/hooks/use-client-news-page";
import { recordNewsView } from "@/lib/news-api";
import { emptyReactionCounts, type NewsReactionKind } from "@/lib/news-reactions";
import { useAuthStore } from "@/stores/useAuthStore";

interface ClientNewsDetailMobileViewProps {
  newsId: string;
}

/** Mobile news detail — parity с workflow-mobile app/client/news/[id].tsx. */
export function ClientNewsDetailMobileView({ newsId }: ClientNewsDetailMobileViewProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isGuest = useAuthStore((s) => s.isGuest);
  const canReact = Boolean(token) && !isGuest;
  const { loading, error, item, setItem } = useClientNewsDetailPage(newsId);

  const numericNewsId = Number(newsId);

  useEffect(() => {
    if (!Number.isFinite(numericNewsId) || !canReact) return;
    void recordNewsView(numericNewsId);
  }, [numericNewsId, canReact]);

  return (
    <div
      className="min-h-screen bg-background"
    >
      <div className="flex items-center px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-w-11 min-h-11 flex items-center justify-center text-white"
          aria-label="Назад"
        >
          <ArrowLeft className="h-[22px] w-[22px]" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-white">Новость</h1>
        <div className="w-11" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      ) : error ? (
        <div className="px-6 py-16 text-center text-sm text-brand">{error}</div>
      ) : item ? (
        <div className="px-4 pt-2 pb-6 space-y-4">
          {/* Пропорции фото задаёт администратор, поэтому `contain`: обрезка по
              высоте от вертикального снимка оставляла бы неузнаваемую полосу. */}
          {item.image ? (
            <div className="flex h-[180px] w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : null}
          <div className="rounded-2xl bg-surface-2 p-[18px] space-y-3">
            <div className="flex items-center justify-between gap-3">
              {item.tag ? (
                <span className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-full bg-brand-fill">
                  {item.tag}
                </span>
              ) : null}
              {item.date ? (
                <span className="text-xs text-content-tertiary">
                  {formatNewsDisplayDate(item.date)}
                </span>
              ) : null}
            </div>
            <h2 className="text-xl font-bold text-foreground">{item.title}</h2>
            <p className="text-[15px] leading-[22px] text-content-tertiary whitespace-pre-line">
              {item.desc}
            </p>
            {Number.isFinite(numericNewsId) && (
              <NewsReactionsRow
                newsId={numericNewsId}
                reactionCounts={item.reaction_counts ?? emptyReactionCounts()}
                myReaction={item.my_reaction ?? null}
                canInteract={canReact}
                centered
                onUpdated={(patch) => {
                  setItem((prev) =>
                    prev
                      ? {
                          ...prev,
                          reaction_counts: patch.reaction_counts,
                          my_reaction: patch.my_reaction as NewsReactionKind | null,
                        }
                      : prev,
                  );
                }}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
