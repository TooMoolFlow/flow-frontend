"use client"

import {useEffect, useRef, useState} from "react"
import {createPortal} from "react-dom"
import {Button} from "@/components/ui/button"
import {
  CheckCircle,
  Clock,
  Eye,
  MessageCircle,
  MoreHorizontal,
  Play,
  Star,
  Trash2,
  UserPlus,
  XCircle,
  ArrowRight,
  SkipForward,
  Share2
} from "lucide-react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { getSubRequestDisplayId } from "@/lib/subRequestUtils"
import { getWhatsAppShareUrl } from "@/lib/shareRequest"
import {useAuthStore} from "@/stores/useAuthStore";

interface ActionItem {
  icon: any
  label: string
  onClick: () => void
  variant: "default" | "destructive" | "outline"
  showForRoles: string[]
  primary?: boolean
  longTerm?: boolean
}

interface RoleBasedActionMenuProps {
  request: any
  requestGroup?: any
  isDesktop: boolean
  userRole: string
  isSubRequest?: boolean // Новый параметр для определения типа заявки
  variant?: "default" | "admin" // Тёмный дизайн для админ мобилки
  onStartTask?: (id: string) => void
  onCompleteTask?: (request: any) => void
  onSkipTask?: (request: any) => void
  onViewDetails?: (request: any) => void
  onReject?: (request: any) => void
  onEdit?: (request: any) => void
  onDelete?: (request: any) => void
  onToggleLongTerm?: (requestId: number, requestGroupId: number, currentStatus: boolean) => void
  onAssignExecutor?: (request: any) => void
  onChangeExecutors?: (request: any) => void
  onUnassignExecutor?: (request: any) => void
  onRateRequest?: (request: any) => void
  onRateClient?: (requestGroup: any) => void
  onAddComment?: (request: any) => void
  onExportData?: (request: any) => void
  onShareRequest?: (request: any) => void
  onArchiveRequest?: (request: any) => void
  onRefreshRequest?: (request: any) => void
  onViewAnalytics?: (request: any) => void
  onManageSettings?: (request: any) => void
  onRedirectToOtherDepartment?: (request: any) => void
}

export function RoleBasedActionMenu({
  request,
  requestGroup,
  isDesktop,
  userRole,
  isSubRequest = false,
  variant = "default",
  onStartTask,
  onCompleteTask,
  onSkipTask,
  onViewDetails,
  onReject,
  onDelete,
  onToggleLongTerm,
  onAssignExecutor,
  onChangeExecutors,
  onRateRequest,
  onRateClient,
  onAddComment,
  onRedirectToOtherDepartment,
  onShareRequest,
}: RoleBasedActionMenuProps) {
  const {user} = useAuthStore()
  const [open, setOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Поделиться заявкой в WhatsApp (URL и текст из lib/shareRequest — как в workflow-mobile)
  const handleShareWhatsApp = () => {
    const params = {
      requestId: isSubRequest && requestGroup ? requestGroup.id : request.id,
      ...(isSubRequest && requestGroup && { subRequestId: request.id }),
      title: request.title,
      status: request.status,
      description: request.description,
    };
    const whatsappUrl = getWhatsAppShareUrl(params);
    window.open(whatsappUrl, "_blank");
    if (onShareRequest) onShareRequest(request);
    setOpen(false);
  };

  // Для Portal
  useEffect(() => {
    setMounted(true)
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open && !isDesktop) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, isDesktop])

  const isExecutorLeader = request?.executors?.find((executor: any) => {
    return executor?.user?.id === user?.id && executor?.RequestExecutor?.role === 'leader'
  })

  // Определяем действия в зависимости от роли
  const getActionsByRole = (): ActionItem[] => {
    const baseActions: ActionItem[] = !isSubRequest ? [
      {
        icon: Eye,
        label: "Посмотреть детали",
        onClick: () => {
          onViewDetails?.(request)
          setOpen(false)
        },
        variant: "default" as const,
        showForRoles: ["executor", "manager", "department-head", "admin-worker","client"],
      },
      {
        icon: Share2,
        label: "Поделиться в WhatsApp",
        onClick: handleShareWhatsApp,
        variant: "default" as const,
        showForRoles: ["executor", "manager", "department-head", "admin-worker", "client"],
      },
    ] : [
      {
        icon: Share2,
        label: "Поделиться в WhatsApp",
        onClick: handleShareWhatsApp,
        variant: "default" as const,
        showForRoles: ["executor", "manager", "department-head", "admin-worker", "client"],
      },
    ]

    const roleSpecificActions: ActionItem[] = []

    // Действия для исполнителя
    if (userRole === "executor") {
      if (isSubRequest) {
        roleSpecificActions.push(
            ...(request.status === "in_progress" && requestGroup?.client_id === user?.id && onDelete
                ? [
                  {
                    icon: Trash2,
                    label: "Удалить заявку",
                    onClick: () => {
                      onDelete(request)
                      setOpen(false)
                    },
                    variant: "destructive" as const,
                    showForRoles: ["executor"],
                  },
                ]
                : [])
        )
      }
      if (isSubRequest && isExecutorLeader) {
        roleSpecificActions.push(
            ...(request.status === "assigned"
                ? [
                  {
                    icon: Play,
                    label: "Начать задачу",
                    onClick: () => {
                      onStartTask?.(request.id)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    primary: true,
                    showForRoles: ["executor"],
                  },
                ]
                : []),
            ...(request.status === "execution"
                ? [
                  {
                    icon: CheckCircle,
                    label: "Завершить задачу",
                    onClick: () => {
                      onCompleteTask?.(request)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    primary: true,
                    showForRoles: ["executor"],
                  }
                ]
                : []),
            ...(((request.status === "assigned" || request.status === 'execution') && onReject)
                ? [
                  {
                    icon: XCircle,
                    label: "Отклонить",
                    onClick: () => {
                      onReject(request)
                      setOpen(false)
                    },
                    variant: "destructive" as const,
                    showForRoles: ["executor"],
                  },
                ]
                : []),
            ...(onRedirectToOtherDepartment && (request.status !== "completed")
                ? [
                  {
                    icon: ArrowRight,
                    label: "Перенаправить к другой категории",
                    onClick: () => {
                      onRedirectToOtherDepartment?.(request)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    showForRoles: ["executor"],
                  },
                ]
                : []),
            ...(onRateClient && requestGroup && requestGroup.status === "completed" &&
            requestGroup.client_id && requestGroup.client?.role === "client"
                ? [
                  {
                    icon: Star,
                    label: "Оценить клиента",
                    onClick: () => {
                      onRateClient?.(requestGroup)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    showForRoles: ["executor"],
                  },
                ]
                : [])
        )
      } else if (!isSubRequest) {
        // Действия для главных заявок (групп)
        roleSpecificActions.push(
            ...(request.status === "in_progress" && requestGroup?.client_id === user?.id && onDelete
                ? [
                  {
                    icon: Trash2,
                    label: "Удалить заявку",
                    onClick: () => {
                      onDelete(request)
                      setOpen(false)
                    },
                    variant: "destructive" as const,
                    showForRoles: ["executor"],
                  },
                ]
                : [])
        )
      }
    }

    // Действия для клиента
    if (userRole === "client") {
      if (isSubRequest) {
        // Действия для подзаявок
        roleSpecificActions.push(
          ...(request.status === "completed"
            ? [
                {
                  icon: Star,
                  label: request?.rating ? "Изменить оценку" : "Оценить работу",
                  onClick: () => {
                    onRateRequest?.(request)
                    setOpen(false)
                  },
                  variant: "default" as const,
                  primary: true,
                  showForRoles: ["client"],
                },
              ]
            : []),
          ...(request.status === "in_progress" && onDelete
            ? [
                {
                  icon: Trash2,
                  label: "Удалить заявку",
                  onClick: () => {
                    onDelete(request)
                    setOpen(false)
                  },
                  variant: "destructive" as const,
                  showForRoles: ["client"],
                },
              ]
            : [])
        )
      } else {
        // Действия для главных заявок (групп)
        roleSpecificActions.push(
          ...(request.status === "in_progress" && onDelete
            ? [
                {
                  icon: Trash2,
                  label: "Удалить заявку",
                  onClick: () => {
                    onDelete(request)
                    setOpen(false)
                  },
                  variant: "destructive" as const,
                  showForRoles: ["client"],
                },
              ]
            : [])
        )
      }
    }

    // Действия для менеджера
    if (userRole === "manager") {
      roleSpecificActions.push(
        ...(request.status === "completed" && isSubRequest
          ? [
              {
                icon: Star,
                label: request?.rating ? "Изменить оценку" : "Оценить работу",
                onClick: () => {
                  onRateRequest?.(request)
                  setOpen(false)
                },
                variant: "default" as const,
                primary: true,
                showForRoles: ["manager"],
              },
            ]
          : []),
        ...(onDelete
          ? [
              {
                icon: Trash2,
                label: "Удалить",
                onClick: () => {
                  onDelete(request)
                  setOpen(false)
                },
                variant: "destructive" as const,
                showForRoles: ["manager"],
              },
            ]
          : [])
      )
    }

    // Действия для офис менеджера
    if (userRole === "department-head") {
      // Категория у офис-менеджера заполняется не всегда: и форма регистрации,
      // и создание пользователя менеджером оставляют service_category_id пустым.
      // Раньше сравнение с категорией заявки в таком случае было всегда false,
      // и офис-менеджер не получал ни одного действия — даже «Назначить исполнителей».
      // Ограничиваем по категории только тогда, когда она у него реально задана;
      // заявки и так ограничены его офисом на бэкенде.
      const headCategoryId = user?.service_category_id ?? null;
      const matchesHeadCategory =
        headCategoryId == null || request?.category?.id === headCategoryId;

      if (isSubRequest && matchesHeadCategory) {
        roleSpecificActions.push(
            ...(request.status === "awaiting_assignment" && onAssignExecutor
                ? [
                  {
                    icon: UserPlus,
                    label: "Назначить исполнителей",
                    onClick: () => {
                      onAssignExecutor(request)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    primary: true,
                    showForRoles: ["department-head"],
                  },
                ]
                : []),
            ...(request.status !== "in_progress" && request.status !== "awaiting_assignment" &&
                request.status !== "completed" && onChangeExecutors
                ? [
                  {
                    icon: UserPlus,
                    label: "Изменить исполнителей",
                    onClick: () => {
                      onChangeExecutors(request)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    primary: true,
                    showForRoles: ["department-head"],
                  },
                ]
                : []),
            ...(onRedirectToOtherDepartment && (request.status !== "completed")
                ? [
                  {
                    icon: ArrowRight,
                    label: "Перенаправить к другой категории",
                    onClick: () => {
                      onRedirectToOtherDepartment?.(request)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    showForRoles: ["department-head"],
                  },
                ]
                : []),
            ...(request.status === "completed" && request.client_id === user?.id
                ? [
                  {
                    icon: Star,
                    label: request?.rating ? "Изменить оценку" : "Оценить работу",
                    onClick: () => {
                      onRateRequest?.(request)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    primary: true,
                    showForRoles: ["department-head"],
                  },
                ]
                : []),
            ...(onDelete
                ? [
                  {
                    icon: Trash2,
                    label: "Удалить заявку",
                    onClick: () => {
                      onDelete(request)
                      setOpen(false)
                    },
                    variant: "destructive" as const,
                    showForRoles: ["department-head"],
                  },
                ]
                : [])
        )
      } else {
        roleSpecificActions.push(
            ...(onDelete && request?.client_id === user?.id
                ? [
                  {
                    icon: Trash2,
                    label: "Удалить",
                    onClick: () => {
                      onDelete(request)
                      setOpen(false)
                    },
                    variant: "destructive" as const,
                    showForRoles: ["department-head"],
                  },
                ]
                : [])
        )
      }
    }

    // Действия для администратора офиса
    if (userRole === "admin-worker") {
      if (isSubRequest) {
        roleSpecificActions.push(
            ...(request.status === "completed"
                ? [
                  {
                    icon: Star,
                    label: request?.rating ? "Изменить оценку" : "Оценить работу",
                    onClick: () => {
                      onRateRequest?.(request)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    primary: true,
                    showForRoles: ["admin-worker"],
                  },
                ]
                : []),
            ...(onToggleLongTerm && (request.status === "in_progress" || request.status === "execution" || request.status === "awaiting_assignment" || request.status === "assigned") && requestGroup.request_type !== 'recurring'
                ? [
                  {
                    icon: Clock,
                    label: request.is_long_term ? "Снять с долгосрочных" : "Пометить как долгосрочную",
                    onClick: () => {
                      onToggleLongTerm(request.id, requestGroup.id, request.is_long_term || false)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    longTerm: true,
                    showForRoles: ["admin-worker"],
                  },
                ]
                : []),
            ...(onDelete
                ? [
                  {
                    icon: Trash2,
                    label: "Удалить заявку",
                    onClick: () => {
                      onDelete(request)
                      setOpen(false)
                    },
                    variant: "destructive" as const,
                    showForRoles: ["admin-worker"],
                  },
                ]
                : [])
        )
      } else {
        roleSpecificActions.push(
            ...(onDelete
                ? [
                  {
                    icon: Trash2,
                    label: "Удалить",
                    onClick: () => {
                      onDelete(request)
                      setOpen(false)
                    },
                    variant: "destructive" as const,
                    showForRoles: ["admin-worker"],
                  },
                ]
                : []),
            ...(onRateClient && requestGroup && requestGroup.status === "completed" &&
            requestGroup.client_id && requestGroup.client?.role === "client"
                ? [
                  {
                    icon: Star,
                    label: "Оценить клиента",
                    onClick: () => {
                      onRateClient?.(requestGroup)
                      setOpen(false)
                    },
                    variant: "default" as const,
                    showForRoles: ["executor", "admin-worker"],
                  },
                ]
                : [])
        )
      }
    }

    // Фильтруем действия по роли пользователя
    const allActions = [...baseActions, ...roleSpecificActions]
    return allActions.filter(action => 
      action.showForRoles.includes(userRole)
    )
  }

  const actions = getActionsByRole()

  // Если нет действий, не показываем меню
  if (actions.length === 0) {
    return null
  }

  // Обработка свайпа для мобильной версии
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const deltaY = currentY - startY
    const threshold = 100 // Минимальное расстояние для закрытия

    if (deltaY > threshold) {
      setOpen(false)
    }
    
    setIsDragging(false)
  }

  const isAdminDark = variant === "admin"

  // Мобильный ActionMenu через Portal
  const mobileActionMenu = open && !isDesktop && mounted ? createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-end"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setOpen(false)
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Sheet Content */}
      <div
        ref={sheetRef}
        className={`relative w-full rounded-t-3xl shadow-elev-4 transform transition-all duration-300 ease-out max-h-[80vh] overflow-y-auto ${
          isAdminDark ? "bg-surface-1" : "bg-card"
        }`}
        style={{
          transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className={`flex justify-center pt-4 pb-2 sticky top-0 rounded-t-3xl ${
          isAdminDark ? "bg-surface-1" : "bg-card"
        }`}>
          <div className={`w-12 h-1 rounded-full ${isAdminDark ? "bg-content-quaternary" : "bg-surface-3"}`} />
        </div>

        {/* Header */}
        <div className={`px-6 pb-4 border-b ${isAdminDark ? "border-hairline" : "border-hairline"}`}>
          <h3 className={`text-lg font-semibold ${isAdminDark ? "text-white" : "text-foreground"}`}>Действия</h3>
          <p className={`text-sm mt-1 ${isAdminDark ? "text-content-tertiary" : "text-content-tertiary"}`}>
            Выберите действие для заявки № {isSubRequest ? getSubRequestDisplayId(request, requestGroup?.id) : request.id}
          </p>
          <p className={`text-xs mt-1 font-medium ${isAdminDark ? "text-brand" : "text-marine"}`}>
            {userRole === "client" && "Клиент"}
            {userRole === "executor" && "Исполнитель"}
            {userRole === "manager" && "Руководитель"}
            {userRole === "department-head" && "Офис менеджер"}
            {userRole === "admin-worker" && "Администратор офиса"}
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`w-full flex items-center justify-start gap-4 h-14 text-left transition-all duration-200 rounded-xl px-4 ${
                action.variant === "destructive"
                  ? isAdminDark
                    ? "text-danger-400 hover:text-danger-300 hover:bg-danger/20 active:bg-danger/30"
                    : "text-danger hover:text-danger-600 hover:bg-danger/10 active:bg-danger/15"
                  : action.longTerm
                    ? isAdminDark
                      ? "text-info-400 hover:text-info-300 hover:bg-info/20 active:bg-info/30"
                      : "text-info hover:text-info-600 hover:bg-info/10 active:bg-info/15"
                    : action.primary
                      ? isAdminDark
                        ? "text-brand font-semibold hover:bg-brand/20 active:bg-brand/30"
                        : "text-marine font-semibold hover:bg-marine/10 active:bg-marine/20"
                      : isAdminDark
                        ? "text-content-tertiary hover:text-white hover:bg-surface-2 active:bg-surface-3"
                        : "text-content-secondary hover:text-marine hover:bg-marine/10 active:bg-marine/20"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                action.onClick()
              }}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                action.primary 
                  ? isAdminDark ? "bg-brand/20 text-brand" : "bg-marine/10 text-marine"
                  : action.longTerm
                    ? isAdminDark ? "bg-info/20 text-info-400" : "bg-info/15 text-info"
                    : action.variant === "destructive"
                      ? isAdminDark ? "bg-danger/20 text-danger-400" : "bg-danger/15 text-danger"
                      : isAdminDark ? "bg-surface-3 text-content-tertiary" : "bg-surface-3 text-content-secondary"
              }`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-6" />
      </div>
    </div>,
    document.body
  ) : null

  if (isDesktop) {
    const triggerClass = isAdminDark
      ? "h-8 w-8 p-0 bg-surface-2 hover:bg-surface-3 border border-hairline rounded-full transition-all duration-200"
      : "h-8 w-8 p-0 bg-card hover:bg-marine/10 border border-marine/20 rounded-full transition-all duration-200 shadow-elev-1 hover:shadow-elev-2";
    const iconClass = isAdminDark ? "h-4 w-4 text-content-tertiary" : "h-4 w-4 text-marine";
    const contentClass = isAdminDark
      ? "w-48 shadow-elev-3 border border-hairline rounded-xl overflow-hidden bg-surface-1"
      : "w-48 shadow-elev-3 border border-marine/20 rounded-xl overflow-hidden";
    const itemClass = (action: ActionItem) => {
      if (isAdminDark) {
        if (action.variant === "destructive") return "text-danger-400 hover:text-danger-300 hover:bg-danger/20 focus:bg-danger/20";
        if (action.longTerm) return "text-info-400 hover:text-info-300 hover:bg-info/20 focus:bg-info/20";
        if (action.primary) return "text-brand font-semibold hover:bg-brand/20 focus:bg-brand/20";
        return "text-content-tertiary hover:text-white hover:bg-white/10 focus:bg-white/10";
      }
      if (action.variant === "destructive") return "text-danger hover:text-danger-600 hover:bg-danger/10 focus:bg-danger/10";
      if (action.longTerm) return "text-info hover:text-info-600 hover:bg-info/10 focus:bg-info/10";
      if (action.primary) return "text-marine font-semibold hover:bg-marine/10 focus:bg-marine/20";
      return "text-content-secondary hover:text-marine hover:bg-marine/10 focus:bg-marine/20";
    };
    const iconColorClass = (action: ActionItem) => {
      if (isAdminDark) {
        if (action.primary) return "text-brand";
        if (action.longTerm) return "text-info-400";
        if (action.variant === "destructive") return "text-danger-400";
        return "text-content-tertiary";
      }
      if (action.primary) return "text-marine";
      if (action.longTerm) return "text-info";
      return "";
    };
    return (
      <>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={triggerClass}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <MoreHorizontal className={iconClass} />
              <span className="sr-only">Открыть меню действий</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className={contentClass}
            onClick={(e) => e.stopPropagation()}
          >
            {actions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  action.onClick()
                }}
                className={`flex items-center gap-3 cursor-pointer px-4 py-3 transition-all duration-200 ${itemClass(action)}`}
              >
                <action.icon className={`h-4 w-4 flex-shrink-0 ${iconColorClass(action)}`} />
                <span className="font-medium">{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {mobileActionMenu}
      </>
    )
  }

  // Мобильная версия
  return (
    <>
      <button
        className={`hit-44 press-sm h-10 w-10 p-0 rounded-full transition-all duration-200 flex items-center justify-center ${
          isAdminDark
            ? "bg-surface-2 hover:bg-surface-3 text-content-tertiary hover:text-white"
            : "bg-card hover:bg-marine/10 border border-marine/20 text-marine shadow-elev-1 hover:shadow-elev-2"
        }`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <MoreHorizontal className="h-5 w-5" />
        <span className="sr-only">Открыть меню действий</span>
      </button>
      {mobileActionMenu}
    </>
  )
}
