"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DepartmentHeadAnalytics from "@/components/DepartmentHeadAnalytics";
import type { DepartmentHeadStats } from "@/lib/department-head-stats-api";
import { token } from "@/lib/tokens";

interface DepartmentHeadStatisticsDesktopViewProps {
  stats: DepartmentHeadStats | null;
}

const GRADIENT =
  `linear-gradient(180deg, ${token.surface1} 0%, ${token.surface2} 25%, ${token.brand} 45%, ${token.brand} 70%, ${token.brand950} 90%, ${token.surface1} 100%)`;

/** Desktop department-head statistics — сохраняет текущий web UI + DepartmentHeadAnalytics. */
export function DepartmentHeadStatisticsDesktopView({
  stats,
}: DepartmentHeadStatisticsDesktopViewProps) {
  const sc = stats?.statusCounts;
  const rts = stats?.requestTypeSummary;

  return (
    <div className="min-h-screen" style={{ background: GRADIENT }}>
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/department-head/management"
          className="inline-flex items-center gap-1 text-brand md:text-brand-600 font-medium mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
          Назад
        </Link>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6" style={{ background: token.brand600 }}>
              <h3 className="text-base sm:text-lg font-bold text-white mb-4">Статистика по заявкам</h3>
              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex justify-between items-center flex-wrap gap-1 text-white">
                  <span className="break-words">Ожидает назначения</span>
                  <span className="font-bold">{sc?.awaitingAssignment ?? 0}</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1 text-white">
                  <span className="break-words">Всего заявок</span>
                  <span className="font-bold">{stats?.totalRequests ?? 0}</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1 text-white">
                  <span className="break-words">Завершено</span>
                  <span className="font-bold text-white">{sc?.completed ?? 0}</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1 text-white">
                  <span className="break-words">В работе</span>
                  <span className="font-bold">{sc?.inWork ?? 0}</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1 text-white">
                  <span className="break-words">Просрочено</span>
                  <span className="font-bold">{sc?.overdue ?? 0}</span>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{ background: token.surface3, border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <h3 className="text-base sm:text-lg font-bold text-white mb-4">По типам заявок</h3>
              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex justify-between items-center flex-wrap gap-1 text-white">
                  <span className="break-words">Обычные</span>
                  <span className="font-bold">{rts?.normal ?? 0}</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1 text-white">
                  <span className="break-words">Экстренные</span>
                  <span className="font-bold">{rts?.urgent ?? 0}</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1 text-white">
                  <span className="break-words">Плановые</span>
                  <span className="font-bold">{rts?.planned ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 sm:p-6"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">Аналитика</h3>
            <DepartmentHeadAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
}
