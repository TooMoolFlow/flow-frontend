import {Bell, LogOut, User} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createClickableRequestIds } from "@/lib/notificationUtils";
import { formatDateOnly } from "@/lib/dateTimeUtils";
import { token } from "@/lib/tokens";

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
}


interface HeaderProps {
    handleLogout: () => void;
    notificationCount?: number;
    role?: string;
    variant?: "default" | "dark";
    /** Когда задан, кнопка «Профиль» ведёт сюда (для admin/manager desktop) */
    profileHref?: string;
    /** Путь к разделу заявок для перехода по клику на номер заявки в уведомлении (например /manager/requests) */
    requestsPathForNotification?: string;
}

const PAGE_SIZE = 10;

const Header: React.FC<HeaderProps> = ({
                                           handleLogout,
                                           notificationCount = 0,
                                           role = "Клиент",
                                           variant = "default",
                                           profileHref,
                                           requestsPathForNotification,
                                       }) => {
    const router = useRouter();
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsPage, setNotificationsPage] = useState(1);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadNotificationCount = async () => {
        try {
            const res = await api.get('/notifications/me?page=1&pageSize=100');
            const unread = res.data.notifications.filter((n: any) => !n.is_read).length;
            setUnreadNotificationCount(unread);
        } catch (err) {
            console.error("Ошибка загрузки уведомлений:", err);
        }
    };

    useEffect(() => {
        loadNotificationCount();
    }, []);

    const loadNotificationsList = useCallback(async (page: number, append: boolean) => {
        if (append) setLoadingMore(true);
        else setNotificationsLoading(true);
        try {
            const res = await api.get(`/notifications/me?page=${page}&pageSize=${PAGE_SIZE}`);
            const list = res.data.notifications || [];
            const totalPages = res.data.totalPages ?? 1;
            setHasMoreNotifications(page < totalPages);
            setNotificationsList((prev) => (append ? [...prev, ...list.filter((n: NotificationItem) => !prev.some((p) => p.id === n.id))] : list));
        } catch (err) {
            console.error("Ошибка загрузки уведомлений:", err);
        } finally {
            if (append) setLoadingMore(false);
            else setNotificationsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (notificationsOpen && variant === "dark") {
            setNotificationsPage(1);
            setHasMoreNotifications(true);
            loadNotificationsList(1, false);
        }
    }, [notificationsOpen, variant]);

    const handleNotificationScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (!hasMoreNotifications || loadingMore || notificationsLoading) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        if (scrollHeight - (scrollTop + clientHeight) < 80) {
            const nextPage = notificationsPage + 1;
            setNotificationsPage(nextPage);
            setLoadingMore(true);
            loadNotificationsList(nextPage, true);
        }
    }, [hasMoreNotifications, loadingMore, notificationsLoading, notificationsPage, loadNotificationsList]);

    const markAsRead = useCallback(async (notification: NotificationItem) => {
        if (notification.is_read) return;
        setNotificationsList((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
        setUnreadNotificationCount((c) => Math.max(0, c - 1));
        try {
            await api.patch(`/notifications/${notification.id}/read`);
        } catch (err) {
            setNotificationsList((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: false } : n)));
            setUnreadNotificationCount((c) => c + 1);
        }
    }, []);

    const handleRequestIdClick = useCallback((requestId: string) => {
        const groupId = requestId.split("/")[0];
        setNotificationsOpen(false);
        if (requestsPathForNotification) {
            router.push(`${requestsPathForNotification}?requestId=${groupId}`);
        }
    }, [requestsPathForNotification, router]);

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        if (diffInMinutes < 1) return "только что";
        if (diffInMinutes < 60) return `${diffInMinutes} мин`;
        if (diffInHours < 24) return `${diffInHours} ч`;
        if (diffInDays < 7) return `${diffInDays} дн`;
        return formatDateOnly(date);
    };

    return (
        <>
            <style>{`
                html { scrollbar-gutter: stable; }
            `}</style>

            <header
                className={variant === "dark"
                    ? "hidden md:block border-b border-hairline"
                    : "hidden md:block bg-gradient-to-r from-card via-card to-surface-3/50 shadow-elev-2 border-b border-hairline/50 backdrop-blur-sm"
                }
                style={variant === "dark" ? { backgroundColor: token.surface1 } : undefined}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3 group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-elev-2 transition-transform duration-300 group-hover:scale-105 bg-white`}>
                                <div className={`w-full h-full rounded-lg flex items-center justify-center bg-white`}>
                                    <Image 
                                        src="/app-icon.png" 
                                        alt="App Icon" 
                                        width={40} 
                                        height={40} 
                                        className="rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className={`font-bold text-xl ${variant === "dark" ? "text-white" : "bg-gradient-to-r from-marine to-brand-700 bg-clip-text text-transparent"}`}>Flow</span>
                                <span className={`text-xs -mt-1 ${variant === "dark" ? "text-white/60" : "text-content-tertiary"}`}>Система управления</span>
                            </div>
                        </div>
                        {/* DESKTOP */}
                        <div className="hidden md:flex flex-row space-x-3 items-center">
                            {variant === "dark" ? (
                                <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="relative h-11 w-11 rounded-xl border border-hairline-strong text-white/80 hover:bg-white/10 hover:text-white"
                                        >
                                            <Bell className="w-5 h-5" />
                                            {unreadNotificationCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-brand-fill text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center font-bold shadow-elev-2">
                                                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                                                </span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="end"
                                        side="bottom"
                                        sideOffset={8}
                                        className="w-[360px] p-0 rounded-xl border border-hairline bg-surface-1 shadow-elev-3"
                                    >
                                        <div className="border-b border-hairline px-4 py-3">
                                            <h3 className="font-semibold text-white text-sm">Уведомления</h3>
                                            <p className="text-xs text-content-tertiary mt-0.5">
                                                {unreadNotificationCount > 0
                                                    ? `Непрочитанных: ${unreadNotificationCount}`
                                                    : "Нет новых"}
                                            </p>
                                        </div>
                                        <div
                                            className="max-h-[320px] overflow-y-auto"
                                            onScroll={handleNotificationScroll}
                                        >
                                            {notificationsLoading ? (
                                                <div className="py-8 text-center text-content-tertiary text-sm">Загрузка...</div>
                                            ) : notificationsList.length === 0 ? (
                                                <div className="py-8 text-center text-content-tertiary text-sm">Пока нет уведомлений</div>
                                            ) : (
                                                <ul className="py-1">
                                                    {notificationsList.map((n) => (
                                                        <li
                                                            key={n.id}
                                                            role="button"
                                                            tabIndex={0}
                                                            className={`px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${!n.is_read ? "bg-brand/5" : ""}`}
                                                            onClick={() => markAsRead(n)}
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <p className={`text-sm font-medium truncate ${n.is_read ? "text-content-tertiary" : "text-white"}`}>
                                                                        {n.title}
                                                                    </p>
                                                                    <p className="text-xs text-content-tertiary mt-0.5 line-clamp-2">
                                                                        {createClickableRequestIds(n.content, handleRequestIdClick, "text-brand underline cursor-pointer hover:text-brand-300")}
                                                                    </p>
                                                                    <p className="text-[10px] text-content-tertiary mt-1">
                                                                        {formatTimeAgo(n.created_at)}
                                                                    </p>
                                                                </div>
                                                                {!n.is_read && (
                                                                    <span className="shrink-0 w-2 h-2 rounded-full bg-brand mt-1.5" />
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {loadingMore && (
                                                <div className="py-3 text-center text-content-tertiary text-xs">Загрузка...</div>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push("/notifications")}
                                    className="relative h-11 w-11 rounded-xl border-2 border-brand/20 bg-gradient-to-br from-card to-brand/5 hover:from-brand/10 hover:to-brand/20 hover:border-brand/40 transition-all duration-300 shadow-elev-1 hover:shadow-elev-2"
                                >
                                    <Bell className="w-5 h-5 text-brand" />
                                    {unreadNotificationCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-brand-fill text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center font-bold shadow-elev-2 animate-pulse">
                                            {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                                        </span>
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(profileHref ?? '/profile')}
                                className={variant === "dark"
                                    ? "h-11 px-4 rounded-xl border border-hairline-strong text-white/80 hover:bg-white/10 hover:text-white"
                                    : "h-11 px-4 rounded-xl bg-gradient-to-br from-card to-marine/5 hover:from-marine/10 hover:to-marine/20 border border-marine/20 hover:border-marine/40 transition-all duration-300 shadow-elev-1 hover:shadow-elev-2"
                                }
                            >
                                <User className={variant === "dark" ? "w-5 h-5 mr-2" : "w-5 h-5 text-marine mr-2"}/>
                                <span className={`text-sm font-semibold ${variant === "dark" ? "" : "text-marine"}`}>Профиль</span>
                            </Button>
                            <Badge variant="secondary" className={variant === "dark"
                                ? "bg-marine-500/20 text-marine-500 border-marine-500/30 px-3 py-1.5 font-semibold"
                                : "bg-gradient-to-r from-marine/10 to-marine/5 text-marine border-marine/30 px-3 py-1.5 font-semibold shadow-elev-1"
                            }>{role}</Badge>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleLogout} 
                                className={variant === "dark"
                                    ? "h-11 w-11 rounded-xl text-white/80 hover:bg-danger/20 hover:text-danger-400"
                                    : "h-11 w-11 rounded-xl hover:bg-danger/10 hover:text-danger hover:border-danger/30 border border-transparent transition-all duration-300 shadow-elev-1 hover:shadow-elev-2"
                                }
                            >
                                <LogOut className="w-5 h-5"/>
                            </Button>
                        </div>
                        {/* MOBILE */}
                        <div className="flex md:hidden items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/notifications')}
                                className="relative h-11 w-11 rounded-xl border-2 border-brand/20 bg-gradient-to-br from-card to-brand/5 hover:from-brand/10 hover:to-brand/20 hover:border-brand/40 transition-all duration-300 shadow-elev-1"
                            >
                                <Bell className="w-5 h-5 text-brand"/>
                                {unreadNotificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-danger to-danger text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center font-bold shadow-elev-2 animate-pulse">
                                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
