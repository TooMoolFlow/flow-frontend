"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Inbox,
  LayoutList,
  Loader2,
  MoreHorizontal,
  Plus,
  Users,
  X,
  Check,
} from "lucide-react";
import { CalendarTab } from "@/components/tasks/calendar-tab";
import { TaskAddSheet } from "@/components/tasks/task-add-sheet";
import { UserTaskRow } from "@/components/tasks/user-task-row";
import { TeamsInboxPanel } from "@/components/teams/teams-inbox-panel";
import { ScreenHeader } from "@/components/ui/screen-header";
import type { UseClientTasksPageResult } from "@/hooks/use-client-tasks-page";
import { scrollTaskStripToIndex, taskStripVisibleIndex } from "@/lib/task-calendar-strip";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

export type ClientTasksViewLayout = "mobile" | "desktop";

type ClientTasksMobileViewProps = UseClientTasksPageResult & {
  layout?: ClientTasksViewLayout;
};

/** Mobile client tasks — parity с workflow-mobile app/client/tasks.tsx. */
export function ClientTasksMobileView({ layout = "mobile", ...props }: ClientTasksMobileViewProps) {
  const isDesktopLayout = layout === "desktop";
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);
  const [teamsPanelOpen, setTeamsPanelOpen] = useState(false);
  const upcomingScrollRef = useRef<HTMLDivElement>(null);
  const completedScrollRef = useRef<HTMLDivElement>(null);

  const {
    viewTabs,
    mainView,
    setMainView,
    viewMode,
    applyLayout,
    todayKey,
    tomorrowKey,
    upcomingDate,
    setUpcomingDate,
    setUpcomingVisibleDateKey,
    upcomingStripDays,
    upcomingMonthLabel,
    completedDateKey,
    setCompletedDateKey,
    setCompletedVisibleDateKey,
    completedStripDays,
    completedMonthLabel,
    sections,
    emptyCopy,
    loadingTasks,
    loadingMore,
    hasMore,
    loadMore,
    toggleComplete,
    addTask,
    addSheetOpen,
    setAddSheetOpen,
    displayMenuOpen,
    setDisplayMenuOpen,
    openTaskStats,
  } = props;

  useEffect(() => {
    if (mainView !== "upcoming") return;
    const activeKey = upcomingDate ?? tomorrowKey;
    const idx = upcomingStripDays.findIndex((d) => d.key === activeKey);
    if (idx < 0) return;
    const el = upcomingScrollRef.current;
    if (!el) return;
    scrollTaskStripToIndex(el, idx, upcomingStripDays.length);
    setUpcomingVisibleDateKey(activeKey);
  }, [mainView, upcomingDate, tomorrowKey, upcomingStripDays, setUpcomingVisibleDateKey]);

  useEffect(() => {
    if (mainView !== "completed") return;
    const idx = completedStripDays.findIndex((d) => d.key === completedDateKey);
    if (idx < 0) return;
    const el = completedScrollRef.current;
    if (!el) return;
    scrollTaskStripToIndex(el, idx, completedStripDays.length);
    setCompletedVisibleDateKey(completedDateKey);
  }, [mainView, completedDateKey, completedStripDays, setCompletedVisibleDateKey]);

  const headerRight = (
    <button
      type="button"
      onClick={() => setDisplayMenuOpen(true)}
      className="w-11 h-11 flex items-center justify-center"
      aria-label="Вид, календарь и команды"
    >
      <MoreHorizontal className="h-[26px] w-[26px] text-brand" />
    </button>
  );

  return (
    <>
      <div
        className={cn(
          "flex flex-col",
          isDesktopLayout ? "min-h-0" : "min-h-screen bg-background",
        )}
      >
        <ScreenHeader title="Задачи" rightSlot={headerRight} />

        {viewMode === "list" && (
          <div className="px-4 pt-2.5 pb-1.5">
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {viewTabs.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMainView(opt.value)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-[13px] font-semibold transition-colors ${
 opt.value === mainView
 ?"border-brand/40 bg-brand/15 text-brand"
                      : "border-hairline text-content-tertiary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {mainView === "upcoming" && (
              <div className="mt-2.5">
                <p className="text-base font-bold text-white capitalize mb-2">{upcomingMonthLabel}</p>
                <div
                  ref={upcomingScrollRef}
                  className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const idx = Math.min(
                      upcomingStripDays.length - 1,
                      taskStripVisibleIndex(el.scrollLeft, el.clientWidth),
                    );
                    const visibleKey = upcomingStripDays[idx]?.key ?? null;
                    if (visibleKey) setUpcomingVisibleDateKey(visibleKey);
                  }}
                >
                  {upcomingStripDays.map((d) => {
                    const isSelected = d.key === upcomingDate;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setUpcomingDate(d.key)}
                        className="w-[42px] shrink-0 flex flex-col items-center gap-1.5"
                      >
                        <span
                          className={`text-[11px] font-semibold ${
 isSelected ?"text-brand" : "text-content-tertiary"
                          }`}
                        >
                          {d.weekdayLabel}
                        </span>
                        <span
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
 isSelected ?"bg-brand-fill text-white" : "text-white"
                          }`}
                        >
                          {d.dayNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mainView === "completed" && (
              <div className="mt-2.5">
                <p className="text-base font-bold text-white capitalize mb-2">{completedMonthLabel}</p>
                <div
                  ref={completedScrollRef}
                  className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const idx = Math.min(
                      completedStripDays.length - 1,
                      taskStripVisibleIndex(el.scrollLeft, el.clientWidth),
                    );
                    const visibleKey = completedStripDays[idx]?.key ?? null;
                    if (visibleKey) setCompletedVisibleDateKey(visibleKey);
                  }}
                >
                  {completedStripDays.map((d) => {
                    const isSelected = d.key === completedDateKey;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setCompletedDateKey(d.key)}
                        className="w-[42px] shrink-0 flex flex-col items-center gap-1.5"
                      >
                        <span
                          className={`text-[11px] font-semibold ${
 isSelected ?"text-brand" : "text-content-tertiary"
                          }`}
                        >
                          {d.weekdayLabel}
                        </span>
                        <span
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
 isSelected ?"bg-brand-fill text-white" : "text-white"
                          }`}
                        >
                          {d.dayNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === "calendar" ? (
          <div className="flex-1 min-h-0 flex flex-col pt-2">
            <CalendarTab />
          </div>
        ) : loadingTasks ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-brand" />
          </div>
        ) : (
          <div className="flex-1 relative">
            <div className="px-4 pt-3 pb-24 overflow-y-auto max-h-[calc(100vh-220px)]">
              {sections.length === 0 ? (
                <div className="flex flex-col items-center py-12 px-6 text-center">
                  {mainView === "completed" ? (
                    <CheckCircle2 className="h-12 w-12 text-content-tertiary mb-4" />
                  ) : (
                    <Inbox className="h-12 w-12 text-content-tertiary mb-4" />
                  )}
                  <p className="text-lg font-semibold text-white">{emptyCopy.title}</p>
                  <p className="text-sm text-content-tertiary mt-1">{emptyCopy.subtitle}</p>
                </div>
              ) : (
                sections.map((section) => (
                  <div key={section.sectionId}>
                    {section.title ? (
                      <p className="text-xs font-bold uppercase tracking-wider text-content-tertiary mt-2 mb-1.5">
                        {section.title}
                      </p>
                    ) : null}
                    {section.data.map((item) => (
                      <UserTaskRow
                        key={item.id}
                        item={item}
                        todayKey={todayKey}
                        sectionId={section.sectionId}
                        onToggle={() => void toggleComplete(item)}
                        onPressRow={() => router.push(`/client/tasks/${item.id}`)}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </div>
                ))
              )}
              {loadingMore ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-brand" />
                </div>
              ) : null}
              {hasMore && !loadingMore ? (
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  className="w-full py-3 text-sm font-medium text-brand"
                >
                  Загрузить ещё
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setAddSheetOpen(true)}
              aria-label="Добавить задачу"
              className={cn(
                "w-14 h-14 rounded-full bg-brand-fill text-white flex items-center justify-center shadow-elev-2 press-sm z-10",
                isDesktopLayout
                  ? "absolute right-0 bottom-4"
                  : "fixed right-4 bottom-[calc(52px+max(env(safe-area-inset-bottom,0px),10px)+8px)]",
              )}
            >
              <Plus className="h-7 w-7" />
            </button>
          </div>
        )}
      </div>

      {displayMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setDisplayMenuOpen(false)}
            aria-label="Закрыть"
          />
          <div className="relative bg-surface-1 rounded-t-2xl px-4 pt-2 pb-8 border-t border-hairline">
            <div className="flex items-center justify-between border-b border-hairline pb-3.5 mb-1">
              <button
                type="button"
                onClick={() => setDisplayMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center"
              >
                <X className="h-[22px] w-[22px] text-white" />
              </button>
              <p className="text-[17px] font-bold text-white flex-1 text-center">Вид и команды</p>
              <button
                type="button"
                onClick={() => setDisplayMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-brand flex items-center justify-center"
              >
                <Check className="h-[22px] w-[22px] text-white" />
              </button>
            </div>

            <p className="text-[13px] font-semibold uppercase tracking-wide text-content-tertiary mt-3 mb-2.5">
              Раскладка
            </p>
            <div className="flex gap-4 rounded-xl border border-hairline bg-surface-2 p-3.5 justify-around">
              <button type="button" onClick={() => applyLayout("list")} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-[52px] h-[52px] rounded-md border flex items-center justify-center ${
 viewMode ==="list" ? "border-brand" : "border-hairline"
                  }`}
                >
                  <LayoutList
                    className={`h-[26px] w-[26px] ${viewMode ==="list" ? "text-brand" : "text-content-tertiary"}`}
                  />
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
 viewMode ==="list" ? "bg-brand-fill text-white" : "text-content-tertiary"
                  }`}
                >
                  Список
                </span>
              </button>
              <button
                type="button"
                onClick={() => applyLayout("calendar")}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className={`w-[52px] h-[52px] rounded-md border flex items-center justify-center ${
 viewMode ==="calendar" ? "border-brand" : "border-hairline"
                  }`}
                >
                  <Calendar
                    className={`h-[26px] w-[26px] ${viewMode ==="calendar" ? "text-brand" : "text-content-tertiary"}`}
                  />
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${
 viewMode ==="calendar" ? "bg-brand-fill text-white" : "text-content-tertiary"
                  }`}
                >
                  Календарь
                </span>
              </button>
            </div>

            <p className="text-[13px] font-semibold uppercase tracking-wide text-content-tertiary mt-5 mb-2.5">
              Статистика
            </p>
            <button
              type="button"
              onClick={openTaskStats}
              className="w-full flex items-center gap-3 rounded-xl border border-hairline bg-surface-2 px-3.5 py-3.5 press-dim"
            >
              <BarChart3 className="h-6 w-6 text-brand" />
              <span className="flex-1 text-left text-base font-semibold text-white">Статистика</span>
              <ChevronRightIcon />
            </button>

            <p className="text-[13px] font-semibold uppercase tracking-wide text-content-tertiary mt-5 mb-2.5">
              Команды
            </p>
            <button
              type="button"
              onClick={() => {
                setDisplayMenuOpen(false);
                setTeamsPanelOpen(true);
              }}
              className="w-full flex items-center gap-3 rounded-xl border border-hairline bg-surface-2 px-3.5 py-3.5 press-dim"
            >
              <Users className="h-6 w-6 text-brand" />
              <span className="flex-1 text-left text-base font-semibold text-white">Команды</span>
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      <TaskAddSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        mainView={mainView}
        todayKey={todayKey}
        tomorrowKey={tomorrowKey}
        defaultDateKey={mainView === "upcoming" ? upcomingDate : null}
        addTask={addTask}
        variant={isDesktopLayout ? "dialog" : "sheet"}
      />

      {teamsPanelOpen ? <TeamsInboxPanel onClose={() => setTeamsPanelOpen(false)} /> : null}
    </>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-content-tertiary">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
