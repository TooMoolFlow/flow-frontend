"use client";

import type { FormEvent } from "react";
import { Headphones, Loader2, Send, X } from "lucide-react";

type HelpSupportFormModalProps = {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  submitting: boolean;
  error: string | null;
};

export function HelpSupportFormModal({
  open,
  value,
  onChange,
  onClose,
  onSubmit,
  submitting,
  error,
}: HelpSupportFormModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-surface-1 w-full max-w-lg rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom,0px)+80px)] md:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-brand" />
            Обращение в поддержку
          </h2>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            className="hit-44 press-sm p-2 rounded-full bg-surface-2 text-content-tertiary hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-content-tertiary text-sm mb-4">
          Опишите вашу проблему. Администратор свяжется с вами в чате.
        </p>
        <form onSubmit={onSubmit}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Опишите проблему..."
            className="w-full border border-hairline rounded-xl p-4 bg-surface-2 text-white placeholder-content-tertiary min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            disabled={submitting}
            rows={4}
          />
          {error ? <p className="text-brand text-sm mt-2">{error}</p> : null}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="flex-1 py-3 rounded-xl bg-surface-2 text-content-tertiary hover:text-white"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!value.trim() || submitting}
              className="flex-1 py-3 rounded-xl bg-brand-fill text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
