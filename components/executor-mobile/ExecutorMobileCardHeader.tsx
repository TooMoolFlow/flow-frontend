"use client";

import React from "react";
import { CardHeader } from "@/components/ui/card";
import { RequestGroup } from "@/stores/useRequestStore";
import { formatDateOnly } from "@/lib/dateTimeUtils";

function getRecurrenceText(recurrenceType: string, interval: number) {
  switch (recurrenceType) {
    case "daily":
      return interval === 1 ? "Ежедневно" : `Каждые ${interval} дней`;
    case "weekly":
      return interval === 1 ? "Еженедельно" : `Каждые ${interval} недель`;
    case "monthly":
      return interval === 1 ? "Ежемесячно" : `Каждые ${interval} месяцев`;
    case "yearly":
      return interval === 1 ? "Ежегодно" : `Каждые ${interval} лет`;
    default:
      return "Повторяющаяся";
  }
}

export function ExecutorMobileCardHeader({ requestGroup }: { requestGroup: RequestGroup }) {
  const isLongTerm = requestGroup.requests?.some((req) => req.is_long_term);
  const isRecurring = requestGroup.request_type === "recurring";

  return (
    <CardHeader className="pb-3 px-5 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base leading-tight line-clamp-2 text-foreground">
              Заявка #{requestGroup.id}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isLongTerm
                  ? "text-white bg-marine-500"
                  : requestGroup.request_type === "urgent"
                  ? "text-white bg-brand-600"
                  : requestGroup.request_type === "planned"
                  ? "text-white bg-marine-500"
                  : "text-white bg-brand-fill"
              }`}
            >
              {requestGroup.request_type === "urgent"
                ? "Экстренная"
                : requestGroup.request_type === "planned"
                ? "Плановая"
                : "Обычная"}
            </span>
          </div>
          {isRecurring && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full text-info bg-info/10 border border-info/30">
                🔄 {getRecurrenceText(requestGroup.recurrence_type || "daily", requestGroup.recurrence_interval || 1)}
              </span>
              {requestGroup.next_due_date && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full text-success bg-success/10 border border-success/30">
                  📅 Следующая: {formatDateOnly(requestGroup.next_due_date)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
