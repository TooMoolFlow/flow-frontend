"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Play, CheckCircle, Eye, Edit, Trash2, XCircle, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSubRequestDisplayId } from "@/lib/subRequestUtils"
import { useSheetGesture } from "@/hooks/use-sheet-gesture"

interface ActionMenuProps {
  request: any
  isDesktop: boolean
  onStartTask: (id: string) => void
  onCompleteTask: (request: any) => void
  onViewDetails: (request: any) => void
  onReject?: (request: any) => void
  onEdit?: (request: any) => void
  onDelete?: (request: any) => void
  onToggleLongTerm?: (requestId: number, currentStatus: boolean) => void
}

export function ActionMenu({
  request,
  isDesktop,
  onStartTask,
  onCompleteTask,
  onViewDetails,
  onReject,
  onEdit,
  onDelete,
  onToggleLongTerm,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  /**
   * Жест шторки вынесен в общий хук: здесь он был на touch-событиях с
   * состоянием React на каждое движение (кадр отставания), фиксированным
   * порогом в 100px без учёта скорости и `transition-all duration-300` прямо
   * на перетаскиваемой панели — то есть палец двигался, а панель догоняла его
   * 300 мс.
   */
  const { panelRef, scrimRef, visible, requestClose } = useSheetGesture({
    open,
    onClose: () => setOpen(false),
    enabled: !isDesktop,
  })

  // Для Portal
  useEffect(() => {
    setMounted(true)
  }, [])

  const actions = [
    {
      icon: Eye,
      label: "Посмотреть детали",
      onClick: () => {
        onViewDetails(request)
        setOpen(false)
      },
      variant: "default" as const,
    },
    ...(request.status === "assigned"
      ? [
          {
            icon: Play,
            label: "Начать задачу",
            onClick: () => {
              onStartTask(request.id)
              setOpen(false)
            },
            variant: "default" as const,
            primary: true,
          },
        ]
      : []),
    ...(request.status === "execution"
      ? [
          {
            icon: CheckCircle,
            label: "Завершить задачу",
            onClick: () => {
              onCompleteTask(request)
              setOpen(false)
            },
            variant: "default" as const,
            primary: true,
          },
        ]
      : []),
    ...(request.status === "assigned" && onReject
      ? [
          {
            icon: XCircle,
            label: "Отклонить",
            onClick: () => {
              onReject(request)
              setOpen(false)
            },
            variant: "destructive" as const,
          },
        ]
      : []),
    ...(onToggleLongTerm && (request.status === "in_progress" || request.status === "execution") && request.request_type !== 'recurring'
      ? [
          {
            icon: Clock,
            label: request.is_long_term ? "Снять с долгосрочных" : "Пометить как долгосрочную",
            onClick: () => {
              onToggleLongTerm(request.id, request.is_long_term || false)
              setOpen(false)
            },
            variant: "default" as const,
            longTerm: true,
          },
        ]
      : []),
    ...(onEdit
      ? [
          {
            icon: Edit,
            label: "Редактировать",
            onClick: () => {
              onEdit(request)
              setOpen(false)
            },
            variant: "default" as const,
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
          },
        ]
      : []),
  ]

  // Мобильный ActionMenu через Portal
  const mobileActionMenu = visible && !isDesktop && mounted ? createPortal(
    <div className="fixed inset-0 z-[99999] flex items-end">
      {/* Затемнение: прозрачность идёт за положением шторки (§1) */}
      <div
        ref={scrimRef as React.RefObject<HTMLDivElement | null>}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={requestClose}
      />

      {/* Панель: transform принадлежит жесту, transition на ней быть не должно */}
      <div
        ref={panelRef}
        className="relative w-full bg-card rounded-t-3xl shadow-elev-4 max-h-[80vh] overflow-y-auto"
        style={{ touchAction: "pan-y" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-2 sticky top-0 bg-card rounded-t-3xl">
          <div className="w-12 h-1 bg-surface-3 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-hairline">
          <h3 className="text-lg font-semibold text-foreground">Действия</h3>
          <p className="text-sm text-content-tertiary mt-1">Выберите действие для заявки № {request.sub_request_number ? getSubRequestDisplayId(request, request.request_group_id) : request.id}</p>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start gap-4 h-14 text-left transition-all duration-200 rounded-xl ${
                action.variant === "destructive"
                  ? "text-danger hover:text-danger-600 hover:bg-danger/10 active:bg-danger/15"
                  : action.longTerm
                    ? "text-info hover:text-info-600 hover:bg-info/10 active:bg-info/15"
                    : action.primary
                      ? "text-marine font-semibold hover:bg-marine/10 active:bg-marine/20"
                      : "text-content-secondary hover:text-marine hover:bg-marine/10 active:bg-marine/20"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                action.onClick()
              }}
            >
              <div className={`p-2 rounded-lg ${
                action.primary 
                  ? "bg-marine/10 text-marine" 
                  : action.longTerm
                    ? "bg-info/15 text-info"
                    : action.variant === "destructive"
                      ? "bg-danger/15 text-danger"
                      : "bg-surface-3 text-content-secondary"
              }`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-6" />
      </div>
    </div>,
    document.body
  ) : null

  if (isDesktop) {
    return (
      <>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hit-44 press-sm h-8 w-8 p-0 bg-card hover:bg-marine/10 border border-marine/20 rounded-full transition-all duration-200 shadow-elev-1 hover:shadow-elev-2"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <MoreHorizontal className="h-4 w-4 text-marine" />
              <span className="sr-only">Открыть меню действий</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 shadow-elev-3 border border-marine/20 rounded-xl overflow-hidden"
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
                className={`flex items-center gap-3 cursor-pointer px-4 py-3 transition-all duration-200 ${
                  action.variant === "destructive"
                    ? "text-danger hover:text-danger-600 hover:bg-danger/10 focus:bg-danger/10"
                    : action.longTerm
                      ? "text-info hover:text-info-600 hover:bg-info/10 focus:bg-info/10"
                      : action.primary
                        ? "text-marine font-semibold hover:bg-marine/10 focus:bg-marine/20"
                        : "text-content-secondary hover:text-marine hover:bg-marine/10 focus:bg-marine/20"
                }`}
              >
                <action.icon className={`h-4 w-4 flex-shrink-0 ${
                  action.primary ? "text-marine" : action.longTerm ? "text-info" : ""
                }`} />
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
      <Button
        variant="outline"
        size="sm"
        className="hit-44 press-sm h-8 w-8 p-0 bg-card hover:bg-marine/10 border border-marine/20 rounded-full transition-all duration-200 shadow-elev-1 hover:shadow-elev-2"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <MoreHorizontal className="h-4 w-4 text-marine" />
        <span className="sr-only">Открыть меню действий</span>
      </Button>
      {mobileActionMenu}
    </>
  )
}
