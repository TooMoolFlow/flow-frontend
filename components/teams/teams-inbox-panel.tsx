"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2, Lock, Plus, Users, X } from "lucide-react";
import { useTeams } from "@/hooks/use-teams";
import { membersPluralRu } from "@/lib/teams-api";
import { useAuthStore } from "@/stores/useAuthStore";

type TeamsInboxPanelProps = {
  onClose: () => void;
};

/** Панель списка команд — parity с workflow-mobile TeamsInboxPanel. */
export function TeamsInboxPanel({ onClose }: TeamsInboxPanelProps) {
  const router = useRouter();
  const isGuest = useAuthStore((s) => s.isGuest);
  const { teams, loading, error } = useTeams();

  const goCreateTeam = () => {
    onClose();
    router.push("/client/teams/create");
  };

  const openTeam = (teamId: number) => {
    onClose();
    router.push(`/client/teams/${teamId}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-black/45" onClick={onClose} aria-label="Закрыть панель" />
      <div className="relative bg-surface-1 rounded-t-2xl max-h-[88vh] overflow-hidden shadow-elev-4">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-[42px] h-[5px] rounded-full bg-brand" />
        </div>

        <div className="flex items-center justify-between px-2 pb-2">
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center"
            aria-label="Закрыть"
          >
            <X className="h-[26px] w-[26px] text-content-tertiary" />
          </button>
          <p className="text-base font-bold text-white flex-1 text-center">Команды</p>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center"
            aria-label="Готово"
          >
            <Check className="h-6 w-6 text-brand" />
          </button>
        </div>

        {isGuest ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] px-6 py-6 gap-3">
            <Lock className="h-10 w-10 text-content-tertiary" />
            <p className="text-content-tertiary text-center text-base font-semibold">
              Войдите в аккаунт, чтобы работать с командами
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center min-h-[200px] py-6">
            <Loader2 className="h-10 w-10 animate-spin text-brand" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[200px] px-6 py-6">
            <p className="text-content-tertiary text-center">{error}</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] px-6 py-6 gap-3">
            <Users className="h-11 w-11 text-content-tertiary" />
            <p className="text-white text-base font-semibold">Пока нет команд</p>
            <p className="text-content-tertiary text-center text-sm leading-5">
              Создайте команду — позже здесь можно будет смотреть статистику
            </p>
          </div>
        ) : (
          <div className="max-h-[52vh] overflow-y-auto px-4 pt-3 pb-4 space-y-2.5">
            {teams.map((t) => {
              const memberCount = t.members?.length ?? 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => openTeam(t.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-hairline bg-surface-2 text-left press-dim"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand/15 flex items-center justify-center shrink-0">
                    <Users className="h-[22px] w-[22px] text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-white line-clamp-2">{t.name}</p>
                    <p className="text-[13px] text-content-tertiary mt-0.5">
                      {memberCount} {membersPluralRu(memberCount)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!isGuest && (
          <div className="border-t border-hairline px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={goCreateTeam}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-fill text-white font-bold press-dim"
            >
              <Plus className="h-[22px] w-[22px]" />
              Создать команду
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
