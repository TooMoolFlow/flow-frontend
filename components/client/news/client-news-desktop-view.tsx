"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, Search, X } from "lucide-react";
import { DesktopContentPage } from "@/components/layout/desktop-content-page";
import { NewsListItem } from "@/components/news/news-list-item";
import { NewsReactionsRow } from "@/components/news/news-reactions-row";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatNewsDisplayDate,
  NEWS_DATE_FILTER_OPTIONS,
  type NewsDateFilter,
} from "@/constants/news-filters";
import type { UseClientNewsPageResult } from "@/hooks/use-client-news-page";
import { emptyReactionCounts } from "@/lib/news-reactions";
import { useAuthStore } from "@/stores/useAuthStore";

type ClientNewsDesktopViewProps = UseClientNewsPageResult;

export function ClientNewsDesktopView({
  searchQuery,
  setSearchQuery,
  filterDate,
  setFilterDate,
  filteredItems,
  loading,
  patchNewsEngagement,
}: ClientNewsDesktopViewProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isGuest = useAuthStore((s) => s.isGuest);
  const canReact = Boolean(token) && !isGuest;

  return (
    <DesktopContentPage title="Все новости" dark>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-hairline bg-surface-2 px-3 py-2.5">
        <Search className="h-5 w-5 text-content-tertiary shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск новостей..."
          className="flex-1 bg-transparent text-base text-white placeholder:text-content-tertiary outline-none"
        />
        {searchQuery.length > 0 && (
          <button type="button" onClick={() => setSearchQuery("")} aria-label="Очистить">
            <X className="h-5 w-5 text-content-tertiary" />
          </button>
        )}
      </div>

      <div className="pb-4 border-b border-hairline/60 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-content-tertiary min-w-[50px]">Дата</span>
          <Select value={filterDate} onValueChange={(v) => setFilterDate(v as NewsDateFilter)}>
            <SelectTrigger className="flex-1 max-w-xs h-10 bg-surface-2 border-hairline text-white">
              <SelectValue placeholder="Все даты" />
            </SelectTrigger>
            <SelectContent>
              {NEWS_DATE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <p className="text-base text-content-tertiary">Загрузка...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-base text-content-tertiary">Нет новостей</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <NewsListItem
              key={item.id}
              title={item.title}
              tag={item.tag}
              dateLabel={item.date ? formatNewsDisplayDate(item.date) : null}
              description={item.desc}
              imageUrl={item.image}
              onPress={() => router.push(`/client/news/${item.id}`)}
              rightSlot={<ChevronRight className="h-6 w-6 text-content-tertiary" />}
              footerSlot={
                <NewsReactionsRow
                  newsId={Number(item.id)}
                  reactionCounts={item.reaction_counts ?? emptyReactionCounts()}
                  myReaction={item.my_reaction ?? null}
                  canInteract={canReact}
                  compact
                  centered
                  onUpdated={(patch) => patchNewsEngagement(item.id, patch)}
                />
              }
            />
          ))}
        </div>
      )}
    </DesktopContentPage>
  );
}
