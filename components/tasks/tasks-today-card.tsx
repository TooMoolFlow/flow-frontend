"use client";

import { Sparkles } from "lucide-react";
import { useTodayTasks } from "@/hooks/use-today-tasks";

type TasksTodayCardProps = {
  onPress: () => void;
};

/** Карточка продуктивности на главной — parity с workflow-mobile TasksTodayCard. */
export function TasksTodayCard({ onPress }: TasksTodayCardProps) {
  const { stats, loading } = useTodayTasks();
  const { todayCompleted, todayTotal } = stats;
  const percent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full rounded-2xl bg-surface-2 border border-hairline p-4 text-left press"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand" />
          </div>
          <div>
            <p className="text-white font-medium">Продуктивность за сегодня</p>
            <p className="text-sm text-content-tertiary">
              {loading ? "Загрузка…" : `Выполнено ${todayCompleted} из ${todayTotal}`}
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-brand px-2 py-1 rounded-lg bg-brand/10 min-w-[54px] text-center">
          {loading ? "—" : `${percent}%`}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-brand/20 overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-content-tertiary mt-2.5 font-medium">
        Нажмите, чтобы открыть задачи (Сегодня)
      </p>
    </button>
  );
}
