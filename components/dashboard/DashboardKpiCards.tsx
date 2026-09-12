"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  LayoutGrid,
  BarChart3,
  Plus,
  Calendar,
} from "lucide-react";

interface Stats {
  statusCounts?: {
    new?: number;
    inWork?: number;
    completed?: number;
    overdue?: number;
  };
}

interface DashboardKpiCardsProps {
  stats?: Stats | null;
  /** Override counts when stats structure differs (e.g. manager kpi) */
  counts?: { new?: number; inWork?: number; completed?: number; overdue?: number };
  createRequestHref: string;
  createBookingHref?: string;
  statisticsHref: string;
  requestsHref: string;
  variant?: "admin" | "manager";
  /** Скрыть кнопки «Создать заявку», «Создать бронь», «Статистика» (для менеджера на десктопе) */
  hideActionButtons?: boolean;
}

export function DashboardKpiCards({
  stats,
  counts,
  createRequestHref,
  createBookingHref = "/meeting-rooms",
  statisticsHref,
  requestsHref,
  variant = "admin",
  hideActionButtons = false,
}: DashboardKpiCardsProps) {
  const newCount = counts?.new ?? stats?.statusCounts?.new ?? 0;
  const inWorkCount = counts?.inWork ?? stats?.statusCounts?.inWork ?? 0;
  const completedCount = counts?.completed ?? stats?.statusCounts?.completed ?? 0;
  const overdueCount = counts?.overdue ?? stats?.statusCounts?.overdue ?? 0;

  const firstLabel = variant === "manager" ? "Экстренные" : "Новые";
  const kpiCards = [
    {
      label: firstLabel,
      value: newCount,
      icon: Clock,
      color: "bg-brand/20 text-brand",
      borderColor: "border-brand/30",
    },
    {
      label: "В работе",
      value: inWorkCount,
      icon: Users,
      color: "bg-marine-500/20 text-marine-500",
      borderColor: "border-marine-500/30",
    },
    {
      label: "Завершено",
      value: completedCount,
      icon: CheckCircle,
      color: "bg-success/20 text-success-400",
      borderColor: "border-success/30",
    },
    {
      label: "Просрочено",
      value: overdueCount,
      icon: AlertTriangle,
      color: "bg-danger/20 text-danger-400",
      borderColor: "border-danger/30",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 min-w-0">
        {kpiCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={requestsHref} className="min-w-0">
              <Card className={`bg-surface-2 border ${item.borderColor} hover:border-brand/50 transition-colors cursor-pointer`}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-xs text-white/60 truncate">{item.label}</p>
                      <p className="text-lg md:text-xl font-bold text-white">{item.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {!hideActionButtons && (
      <div className="flex flex-wrap gap-3">
        <Link href={createRequestHref}>
          <Button className="bg-brand-fill hover:bg-brand/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Создать заявку
          </Button>
        </Link>
        <Link href={createBookingHref}>
          <Button variant="outline" className="border-hairline-strong text-white hover:bg-white/10">
            <Calendar className="w-4 h-4 mr-2" />
            Создать бронь
          </Button>
        </Link>
        <Link href={statisticsHref}>
          <Button variant="outline" className="border-hairline-strong text-white hover:bg-white/10">
            <BarChart3 className="w-4 h-4 mr-2" />
            Статистика
          </Button>
        </Link>
      </div>
      )}
    </div>
  );
}
