"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSheetGesture } from "@/hooks/use-sheet-gesture";
import { useThemeColor } from "@/hooks/use-theme-color";
import { cn } from "@/lib/utils";

import type { TaskPickerVariant } from "@/hooks/use-task-picker-theme";

export type { TaskPickerVariant };

const DESKTOP_DIALOG_CONTENT_CLASS =
  "max-h-[min(90vh,820px)] overflow-hidden flex flex-col border-hairline bg-surface-1 text-white sm:rounded-2xl p-0 gap-0 [&>button]:text-content-tertiary [&>button]:hover:text-white [&>button]:right-5 [&>button]:top-5";

type TaskPickerShellProps = {
  open: boolean;
  onClose: () => void;
  variant?: TaskPickerVariant;
  /** Dialog title — only shown in dialog variant when provided */
  title?: string;
  maxWidthClass?: string;
  zIndexClass?: string;
  maxHeightClass?: string;
  /** Extra classes on the bottom sheet panel (mobile). */
  sheetPanelClassName?: string;
  children: ReactNode;
};

export function TaskPickerShell({
  open,
  onClose,
  variant = "sheet",
  title,
  maxWidthClass = "max-w-lg",
  zIndexClass = "z-[60]",
  maxHeightClass = "max-h-[90vh]",
  sheetPanelClassName,
  children,
}: TaskPickerShellProps) {
  const cardBackground = useThemeColor("cardBackground");
  const primary = useThemeColor("primary");
  const [portalReady, setPortalReady] = useState(false);

  /**
   * Жест «потянуть вниз, чтобы закрыть». `visible` держит шторку в DOM, пока
   * идёт анимация выхода: без этого React снял бы её мгновенно и выход
   * показать было бы нечем.
   */
  const { panelRef, scrimRef, visible, dragging, requestClose } = useSheetGesture({
    open,
    onClose,
    enabled: variant === "sheet",
  });

  useEffect(() => {
    setPortalReady(typeof document !== "undefined");
  }, []);

  useEffect(() => {
    if (!visible || variant === "dialog") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible, variant]);

  if (variant === "dialog") {
    return (
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className={cn(DESKTOP_DIALOG_CONTENT_CLASS, maxWidthClass)}>
          {title ? (
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-hairline shrink-0 text-left space-y-0">
              <DialogTitle className="text-lg font-bold text-white">{title}</DialogTitle>
            </DialogHeader>
          ) : null}
          <div className="flex flex-col min-h-0 flex-1 overflow-hidden">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!visible || !portalReady) return null;

  const sheet = (
    <div className={cn("fixed inset-0 flex flex-col justify-end", zIndexClass)}>
      <button
        ref={scrimRef as React.RefObject<HTMLButtonElement | null>}
        type="button"
        className="absolute inset-0 bg-black/45"
        onClick={requestClose}
        aria-label="Закрыть"
      />
      <div
        ref={panelRef}
        className={cn(
          "relative flex min-h-0 w-full flex-col rounded-t-2xl border-t border-border shadow-elev-4",
          /* Пока тянем — никаких переходов: движение идёт 1:1 с пальцем (§2),
             а любой transition вносил бы отставание. */
          dragging && "will-change-transform",
          maxHeightClass,
          sheetPanelClassName,
        )}
        style={{ backgroundColor: cardBackground, touchAction: "pan-y" }}
      >
        {/* Ручка — теперь не украшение: за неё шторку можно утащить вниз. */}
        <div className="flex shrink-0 cursor-grab justify-center pt-2 pb-1 active:cursor-grabbing">
          <div className="h-1 w-10 rounded-full" style={{ backgroundColor: primary }} />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
