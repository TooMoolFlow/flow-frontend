"use client";

import { type RefObject } from "react";
import { Bell, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestNotFoundModal } from "@/components/RequestNotFoundModal";
import { createClickableRequestIds } from "@/lib/notificationUtils";
import { formatTimeAgo } from "@/lib/dateTimeUtils";
import type { UseNotificationsPageResult } from "@/hooks/use-notifications-page";
import { NotificationsEmptyState } from "./notification-detail-modal";
import type { AppNotification } from "./notification-types";

function getNotificationIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("принята") || lower.includes("одобрена")) {
    return <CheckCircle className="w-4 h-4 text-success" />;
  }
  if (lower.includes("завершена") || lower.includes("выполнена")) {
    return <CheckCircle className="w-4 h-4 text-info" />;
  }
  if (lower.includes("просрочена") || lower.includes("отклонена")) {
    return <AlertCircle className="w-4 h-4 text-danger" />;
  }
  return <Clock className="w-4 h-4 text-content-secondary" />;
}

function getNotificationBgColor(title: string, isRead: boolean) {
  if (isRead) {
    return "bg-gradient-to-r from-surface-3 to-surface-3/30 border-hairline-strong backdrop-blur-sm";
  }
  const lower = title.toLowerCase();
  if (lower.includes("принята") || lower.includes("одобрена")) {
    return "bg-gradient-to-r from-marine/20 via-marine/10 to-marine/20 border-marine/30 backdrop-blur-md";
  }
  if (lower.includes("завершена") || lower.includes("выполнена")) {
    return "bg-gradient-to-r from-marine/20 via-brand-700/10 to-marine/20 border-marine/30 backdrop-blur-md";
  }
  if (lower.includes("просрочена") || lower.includes("отклонена")) {
    return "bg-gradient-to-r from-brand-700/20 via-brand-700/10 to-brand-700/20 border-brand-700/30 backdrop-blur-md";
  }
  return "bg-gradient-to-r from-marine/15 via-brand-700/10 to-marine/15 border-marine/30 backdrop-blur-md";
}

export function NotificationsDesktopList({
  notifications,
  isLoading,
  hasMore,
  onNotificationPress,
  onRequestClick,
}: {
  notifications: AppNotification[];
  isLoading: boolean;
  hasMore: boolean;
  onNotificationPress: (notification: AppNotification) => void;
  onRequestClick: (requestId: string) => void;
}) {
  if (notifications.length === 0 && !isLoading) {
    return <NotificationsEmptyState />;
  }

  return (
    <>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => onNotificationPress(notification)}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-elev-2 hover:scale-[1.02] ${getNotificationBgColor(notification.title, notification.is_read)} ${
            notification.is_read ? "opacity-75" : "opacity-100"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.title)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                  {notification.title}
                </h3>
                {!notification.is_read && (
                  <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium text-brand-700 bg-brand-700/20 rounded-full whitespace-nowrap">
                    Новое
                  </span>
                )}
              </div>
              <p className="text-xs text-content-tertiary mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(notification.created_at)}
              </p>
              <p className="text-sm text-content-secondary mt-2 leading-relaxed line-clamp-3">
                {createClickableRequestIds(notification.content, onRequestClick)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="flex items-center gap-2 text-content-tertiary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Загрузка...</span>
          </div>
        </div>
      )}

      {!hasMore && notifications.length > 0 && !isLoading && (
        <div className="text-center py-4">
          <div className="w-8 h-px bg-surface-3 mx-auto mb-3" />
          <p className="text-xs text-content-tertiary">Вы достигли конца списка</p>
        </div>
      )}
    </>
  );
}

function NotificationsDesktopModal({
  unreadCount,
  onClose,
  scrollRef,
  children,
}: {
  unreadCount: number;
  onClose: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative bg-card rounded-2xl shadow-elev-4 w-full max-w-2xl mx-auto overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-hairline">
        <div className="flex items-center border-b border-hairline-strong px-6 py-4 bg-surface-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-marine rounded-xl flex items-center justify-center shadow-elev-1">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Уведомления</h2>
              <p className="text-sm text-content-secondary">
                {unreadCount > 0 ? `${unreadCount} новых` : "Все прочитаны"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-surface-3"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
          >
            <span className="text-2xl text-content-tertiary">×</span>
          </Button>
        </div>

        <div
          ref={scrollRef}
          className="max-h-[60vh] sm:max-h-[65vh] overflow-y-auto custom-scrollbar"
        >
          <div className="px-4 py-4 space-y-3">{children}</div>
        </div>

        <div className="border-t border-hairline px-6 py-3 bg-surface-3/50">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-hairline hover:bg-surface-3 text-content-secondary"
          >
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
}

type NotificationsDesktopViewProps = Pick<
  UseNotificationsPageResult,
  | "notifications"
  | "isLoading"
  | "hasMore"
  | "unreadCount"
  | "containerRef"
  | "showNotFoundModal"
  | "setShowNotFoundModal"
  | "notFoundRequestId"
  | "handleNotificationPress"
  | "handleRequestClick"
  | "handleClose"
>;

export function NotificationsDesktopView({
  notifications,
  isLoading,
  hasMore,
  unreadCount,
  containerRef,
  showNotFoundModal,
  setShowNotFoundModal,
  notFoundRequestId,
  handleNotificationPress,
  handleRequestClick,
  handleClose,
}: NotificationsDesktopViewProps) {
  return (
    <>
      <NotificationsDesktopModal
        unreadCount={unreadCount}
        onClose={handleClose}
        scrollRef={containerRef}
      >
        <NotificationsDesktopList
          notifications={notifications}
          isLoading={isLoading}
          hasMore={hasMore}
          onNotificationPress={handleNotificationPress}
          onRequestClick={handleRequestClick}
        />
      </NotificationsDesktopModal>

      <RequestNotFoundModal
        isOpen={showNotFoundModal}
        onClose={() => setShowNotFoundModal(false)}
        requestId={notFoundRequestId}
      />
    </>
  );
}
