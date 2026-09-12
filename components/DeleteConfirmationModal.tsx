"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (() => void) | ((arg: any) => Promise<void>)
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: "default" | "dark"
}

export function DeleteConfirmationModal({
                                          isOpen,
                                          onClose,
                                          onConfirm,
                                          title,
                                          description,
                                          confirmText = "Удалить",
                                          cancelText = "Отмена",
                                          isLoading = false,
                                          variant = "default",
                                        }: DeleteConfirmationModalProps) {
  const isDark = variant === "dark";
  return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
          <AlertDialogContent className={cn(
            "w-[calc(100vw-2rem)] max-w-[400px] mx-auto rounded-xl shadow-elev-4 p-0 overflow-hidden",
            isDark ? "border-hairline bg-surface-1" : "border border-hairline dark:border-hairline bg-card dark:bg-surface-1"
          )}>
              <AlertDialogHeader className="px-6 pt-6 pb-4 space-y-4">
            <AlertDialogTitle className={cn(
              "text-xl sm:text-2xl font-semibold leading-tight text-center",
              isDark ? "text-white" : "text-foreground dark:text-content-quaternary"
            )}>
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(
              "text-sm sm:text-base leading-relaxed text-center max-w-sm mx-auto",
              isDark ? "text-white/70" : "text-content-secondary dark:text-content-tertiary"
            )}>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="px-6 pb-6 pt-2 flex flex-col gap-3 sm:flex-row sm:gap-3 sm:justify-end">
            <AlertDialogCancel
                className={cn(
                  "w-full sm:w-auto sm:min-w-[100px] h-12 sm:h-10 rounded-lg font-medium transition-all duration-200 text-base sm:text-sm order-2 sm:order-1",
                  isDark ? "bg-surface-2 hover:bg-surface-3 text-white border-hairline" : "bg-surface-3 hover:bg-surface-3 dark:bg-surface-2 dark:hover:bg-surface-3 text-content-secondary dark:text-content-tertiary border border-hairline dark:border-hairline"
                )}
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
                className={cn(
                  "w-full sm:w-auto sm:min-w-[100px] h-12 sm:h-10 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-hairline-strong focus:ring-offset-2 text-base sm:text-sm order-1 sm:order-2 shadow-elev-1",
                  confirmText.includes("Забронировать") || confirmText.includes("бронирова")
                    ? "bg-brand-fill hover:bg-brand-600 text-white"
                    : isDark
                      ? "bg-danger hover:bg-danger-600 text-white"
                      : "bg-danger-600 hover:bg-surface-2 dark:bg-surface-3 dark:hover:bg-surface-3 text-white dark:text-foreground"
                )}
                onClick={onConfirm}
                disabled={isLoading}
            >
              {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
                    <span className="text-sm sm:text-sm">Удаление...</span>
                  </div>
              ) : (
                  confirmText
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  )
}
