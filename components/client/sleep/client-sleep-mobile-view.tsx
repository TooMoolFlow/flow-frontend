"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lightbulb, Moon, X } from "lucide-react";
import PullToRefresh from "@/components/pull-to-refresh";
import { formatDateForApi } from "@/lib/dateTimeUtils";
import {
  formatSleepDuration,
  FULL_SLEEP_ADVICE,
  getScheduledSleepMinutes,
  type SleepRating,
  useSleepStore,
} from "@/stores/sleep-store";
import { cn } from "@/lib/utils";

export type ClientSleepViewLayout = "mobile" | "desktop";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

const BEDTIME_OPTIONS = [
  [20, 0], [20, 30], [21, 0], [21, 30], [22, 0], [22, 30], [23, 0], [23, 30], [0, 0],
];
const WAKE_OPTIONS = [
  [5, 0], [5, 30], [6, 0], [6, 30], [7, 0], [7, 30], [8, 0], [8, 30], [9, 0],
];

function SleepSurveyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const todayKey = useMemo(() => formatDateForApi(new Date()), []);
  const setSleepRating = useSleepStore((s) => s.setSleepRating);
  const settings = useSleepStore((s) => s.settings);
  const setLastNightSleep = useSleepStore((s) => s.setLastNightSleep);

  if (!open) return null;

  const options: { key: SleepRating; label: string }[] = [
    { key: "poor", label: "Не выспался" },
    { key: "ok", label: "Можно и лучше" },
    { key: "good", label: "Выспался" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-2 border border-hairline p-5">
        <p className="text-white font-semibold text-lg mb-4">Как вы спали?</p>
        <div className="space-y-2">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setSleepRating(todayKey, opt.key);
                setLastNightSleep(getScheduledSleepMinutes(settings));
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-surface-3 text-white text-left px-4"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type ClientSleepMobileViewProps = {
  layout?: ClientSleepViewLayout;
};

export function ClientSleepMobileView({ layout = "mobile" }: ClientSleepMobileViewProps) {
  const isDesktopLayout = layout === "desktop";
  const router = useRouter();
  const todayKey = useMemo(() => formatDateForApi(new Date()), []);
  const settings = useSleepStore((s) => s.settings);
  const setSettings = useSleepStore((s) => s.setSettings);
  const dayRecord = useSleepStore((s) => s.dayRecords[todayKey]);
  const recommendations = dayRecord?.recommendations ?? [];
  const rating = dayRecord?.rating ?? null;
  const lastNightMinutes = useSleepStore((s) => s.lastNightSleepMinutes);
  const avg7DaysMinutes = useSleepStore((s) => s.avgSleep7DaysMinutes);
  const requestSurveyShow = useSleepStore((s) => s.requestSurveyShow);
  const forceShowSurvey = useSleepStore((s) => s.forceShowSurvey);
  const clearForceShowSurvey = useSleepStore((s) => s.clearForceShowSurvey);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<"bed" | "wake" | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(false);

  const goalHours = Math.floor(settings.goalMinutes / 60);
  const scheduledMinutes = getScheduledSleepMinutes(settings);
  const scheduleWarning = scheduledMinutes < settings.goalMinutes;
  const bedtimeStr = `${pad2(settings.bedtimeHour)}:${pad2(settings.bedtimeMinute)}`;
  const wakeStr = `${pad2(settings.wakeHour)}:${pad2(settings.wakeMinute)}`;
  const options = timePickerMode === "bed" ? BEDTIME_OPTIONS : WAKE_OPTIONS;

  const handleTimeSelect = useCallback(
    (hour: number, minute: number) => {
      if (timePickerMode === "bed") {
        setSettings({ bedtimeHour: hour, bedtimeMinute: minute });
      } else {
        setSettings({ wakeHour: hour, wakeMinute: minute });
      }
      setTimePickerMode(null);
    },
    [timePickerMode, setSettings]
  );

  const openSurvey = () => {
    requestSurveyShow();
    setSurveyOpen(true);
  };

  useEffect(() => {
    if (forceShowSurvey) {
      setSurveyOpen(true);
      clearForceShowSurvey();
    }
  }, [forceShowSurvey, clearForceShowSurvey]);

  const handleRefresh = async () => {
    /* Данные локальные — обновлять нечего; искусственная пауза убрана (§1). */
  };

  const body = (
    <div
      className={cn(
        isDesktopLayout
          ? "pb-2"
          : "min-h-screen bg-background px-4 pt-[max(1rem,env(safe-area-inset-top))]",
      )}
    >
      {!isDesktopLayout && (
        <>
          <header className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-brand p-1 -ml-1"
            >
              <ChevronLeft className="w-6 h-6" />
              <span>Назад</span>
            </button>
          </header>
          <h1 className="text-2xl font-bold text-foreground mb-6">Сон</h1>
        </>
      )}

      {recommendations.length > 0 && (
            <div className="rounded-2xl bg-surface-2 border border-hairline p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <p className="text-white font-semibold">Рекомендации на сегодня</p>
              </div>
              {recommendations.map((rec, i) => (
                <p key={i} className="text-content-tertiary text-sm mb-2">
                  • {rec}
                </p>
              ))}
              <button
                type="button"
                onClick={() => setShowDetailModal(true)}
                className="flex items-center gap-1 text-brand text-sm font-medium mt-2"
              >
                Подробнее
              </button>
            </div>
          )}

          <div className="rounded-2xl bg-surface-2 border border-hairline p-5 mb-4">
            <Moon className="w-6 h-6 text-brand mb-2" />
            <p className="text-white font-semibold mb-3">Сон прошлой ночи</p>
            {lastNightMinutes != null ? (
              <>
                <p className="text-white text-3xl font-bold">
                  {formatSleepDuration(lastNightMinutes)}
                </p>
                {rating != null && (
                  <p className="text-content-tertiary text-sm mt-1">Оценка по расписанию</p>
                )}
                {avg7DaysMinutes != null && (
                  <p className="text-content-tertiary text-sm mt-2">
                    Среднее за 7 дней: {formatSleepDuration(avg7DaysMinutes)}
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-content-tertiary text-sm mb-4">
                  Оцените сон, чтобы увидеть длительность
                </p>
                <button
                  type="button"
                  onClick={openSurvey}
                  className="px-6 py-3 rounded-xl bg-brand-fill text-white font-medium"
                >
                  Оценить сон
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-surface-2 border border-hairline p-5 mb-4">
            <p className="text-white font-semibold mb-4">Расписание сна</p>

            <div className="py-3 border-b border-hairline">
              <p className="text-white mb-2">Цель сна</p>
              <div className="flex gap-2">
                {[6, 7, 8, 9].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSettings({ goalMinutes: h * 60 })}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      goalHours === h ? "bg-brand-fill text-white" : "bg-surface-3 text-white"
                    }`}
                  >
                    {h}ч
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setTimePickerMode("bed")}
              className="w-full flex justify-between items-center py-3 border-b border-hairline text-left"
            >
              <span className="text-white">Отход ко сну</span>
              <span className="text-brand font-medium">{bedtimeStr}</span>
            </button>

            <button
              type="button"
              onClick={() => setTimePickerMode("wake")}
              className="w-full flex justify-between items-center py-3 border-b border-hairline text-left"
            >
              <span className="text-white">Пробуждение</span>
              <span className="text-brand font-medium">{wakeStr}</span>
            </button>

            {scheduleWarning && (
              <p className="text-warning-400 text-sm mt-3 p-3 rounded-xl bg-[rgba(255,183,77,0.12)]">
                Расписание ({formatSleepDuration(scheduledMinutes)}) короче цели (
                {formatSleepDuration(settings.goalMinutes)})
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                setSettings({ notificationsEnabled: !settings.notificationsEnabled })
              }
              className="w-full flex justify-between items-center py-3 mt-2"
            >
              <span className="text-white">Уведомления</span>
              <div
                className={`w-12 h-7 rounded-full flex items-center px-1 ${
                  settings.notificationsEnabled ? "bg-brand/40" : "bg-surface-3"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white ${
                    settings.notificationsEnabled ? "ml-auto" : ""
                  }`}
                />
              </div>
            </button>
          </div>

          {rating == null && lastNightMinutes != null && (
            <button
              type="button"
              onClick={openSurvey}
              className="w-full py-3 rounded-xl border border-brand text-brand font-medium"
            >
              Изменить оценку сна
            </button>
          )}
    </div>
  );

  return (
    <>
      {isDesktopLayout ? body : <PullToRefresh onRefresh={handleRefresh}>{body}</PullToRefresh>}

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="w-full max-h-[85vh] rounded-t-2xl bg-surface-2 border border-hairline flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-hairline">
              <p className="text-white font-semibold">Как улучшить сон</p>
              <button type="button" onClick={() => setShowDetailModal(false)}>
                <X className="w-6 h-6 text-content-tertiary" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <pre className="text-content-tertiary text-sm whitespace-pre-wrap font-sans">
                {rating ? FULL_SLEEP_ADVICE[rating] : recommendations[0] ?? ""}
              </pre>
            </div>
          </div>
        </div>
      )}

      {timePickerMode && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-2 border border-hairline p-4 max-h-[50vh] overflow-y-auto">
            <p className="text-white font-semibold mb-3">
              {timePickerMode === "bed" ? "Отход ко сну" : "Пробуждение"}
            </p>
            <div className="space-y-1">
              {options.map(([h, m]) => (
                <button
                  key={`${h}-${m}`}
                  type="button"
                  onClick={() => handleTimeSelect(h, m)}
                  className="w-full py-3 rounded-xl bg-surface-3 text-white text-left px-4"
                >
                  {pad2(h)}:{pad2(m)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTimePickerMode(null)}
              className="w-full mt-3 py-3 text-content-tertiary"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <SleepSurveyModal open={surveyOpen} onClose={() => setSurveyOpen(false)} />
    </>
  );
}
