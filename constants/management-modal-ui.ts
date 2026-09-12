import type { TaskPickerVariant } from "@/hooks/use-task-picker-theme";

export function managementModalVariant(isDesktop: boolean): TaskPickerVariant {
  return isDesktop ? "dialog" : "sheet";
}

export const DESKTOP_MANAGEMENT_DIALOG_CONTENT_CLASS =
  "max-h-[min(90vh,820px)] overflow-hidden flex flex-col border-hairline bg-surface-1 text-white sm:rounded-2xl p-0 gap-0 [&>button]:text-content-tertiary [&>button]:hover:text-white [&>button]:right-5 [&>button]:top-5";

export const DESKTOP_MANAGEMENT_ALERT_CONTENT_CLASS =
  "border-hairline bg-surface-1 text-white sm:rounded-2xl";

export const DESKTOP_MANAGEMENT_ALERT_TITLE_CLASS = "text-white";

export const DESKTOP_MANAGEMENT_ALERT_DESCRIPTION_CLASS = "text-content-tertiary";

export const DESKTOP_MANAGEMENT_ALERT_CANCEL_CLASS =
  "border-hairline bg-transparent text-white hover:bg-white/10";

/** Scoped dark tokens for portaled Dialog / AlertDialog / request modals (≥768px). */
export const MANAGEMENT_MODAL_DARK_CLASS = "management-modal-dark";

/** Alias — same surface tokens on admin/manager requests desktop shell. */
export const REQUESTS_DESKTOP_DARK_CLASS = MANAGEMENT_MODAL_DARK_CLASS;
