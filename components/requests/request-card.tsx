"use client"

import React, { useMemo, useCallback, useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar as CalendarLucid, ImageIcon, User, ChevronRight, Clock } from "lucide-react"
import { RequestGroup } from "@/stores/useRequestStore"
import { getThumbnailUrl } from "@/lib/imageOptimization"
import { formatCardDateShort, formatDateOnly, formatDateTime } from "@/lib/dateTimeUtils"
import { getStatusLabel, getTypeLabel } from "@/constants/requests"
import { token } from "@/lib/tokens";

interface RequestCardProps {
  request: RequestGroup
  onCardClick: (request: RequestGroup) => void
  renderCardHeader: (request: RequestGroup) => React.ReactNode
  isLast?: boolean
  lastElementRef?: ((node: HTMLDivElement | null) => void) | React.RefObject<HTMLDivElement> | null
  clientRating?: any
  userRole?: string
  variant?: 'default' | 'compact' // Новый пропс для выбора стиля карточки
}

// Компонент для ленивой загрузки изображений с IntersectionObserver
function LazyImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' } // Начинаем загрузку за 50px до появления в viewport
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <img
      ref={imgRef}
      src={isInView ? src : '/placeholder.svg'}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      style={{ 
        backgroundColor: isLoaded ? 'transparent' : token.surface3,
        transition: 'opacity 0.2s'
      }}
    />
  )
}

function RequestCardComponent({
  request,
  onCardClick,
  renderCardHeader,
  isLast = false,
  lastElementRef,
  clientRating,
  userRole,
  variant = 'default'
}: RequestCardProps) {

  const formattedDateShort = useMemo(
    () => formatCardDateShort(request.created_date),
    [request.created_date]
  )
  const formattedDate = useMemo(
    () => formatDateOnly(request.created_date),
    [request.created_date]
  )
  
  const handleClick = useCallback(() => onCardClick(request), [onCardClick, request])
  
  // Получаем тип заявки и статус для compact варианта
  const requestTypeLabel = useMemo(
    () => getTypeLabel(request.request_type ?? 'normal'),
    [request.request_type]
  )

  const statusLabel = useMemo(
    () => getStatusLabel(request.status),
    [request.status]
  )

  const cardClassName = useMemo(() => {
    return `press-lg hover:shadow-elev-3 transition-all duration-300 border-0 shadow-elev-2 relative overflow-hidden cursor-pointer will-change-transform backdrop-blur-sm ${
      request.is_long_term && request.request_type !== 'recurring'
        ? 'bg-gradient-to-r from-brand/10 via-card to-marine-500/5 hover:from-brand/15 hover:via-card hover:to-marine-500/10 border-l-4 border-marine-500 backdrop-blur-md' 
        : 'bg-gradient-to-br from-card via-surface-3 to-card hover:shadow-brand/20'
    }`
  }, [request.is_long_term, request.request_type])

  const headerContent = useMemo(() => renderCardHeader(request), [renderCardHeader, request])

  // Compact вариант карточки (как на скриншотах)
  if (variant === 'compact') {
    const firstPhoto = request.photos && request.photos.length > 0 ? request.photos[0] : null

    return (
      <div
        ref={isLast ? lastElementRef : null}
        className="press-lg flex items-center gap-4 bg-transparent cursor-pointer"
        onClick={handleClick}
      >
        {/* Фото слева */}
        <div className="w-[140px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden bg-surface-2">
          {firstPhoto ? (
            <LazyImage
              src={getThumbnailUrl(firstPhoto.photo_url)}
              alt={`Заявка #${request.id}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-3">
              <ImageIcon className="w-8 h-8 text-content-tertiary" />
            </div>
          )}
        </div>

        {/* Контент справа */}
        <div className="flex-1 min-w-0">
          {/* Заголовок */}
          <h3 className="text-white font-semibold text-lg mb-2">
            Заявка #{request.id}
          </h3>

          {/* Бейджи */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-marine-700 text-white">
              {requestTypeLabel}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-surface-3 text-content-tertiary">
              {statusLabel}
            </span>
          </div>

          {/* Локация */}
          <p className="text-content-tertiary text-sm mb-2 truncate">
            {request.location_detail || 'Местоположение не указано'}
          </p>

          {/* Дата */}
          <div className="flex items-center gap-2 text-content-tertiary text-sm">
            <Clock className="w-4 h-4" />
            <span>{formattedDateShort}</span>
          </div>
        </div>

        {/* Стрелка */}
        <ChevronRight className="w-6 h-6 text-content-tertiary flex-shrink-0" />
      </div>
    )
  }

  // Default вариант карточки (оригинальный)
  return (
    <Card
      ref={isLast ? lastElementRef : null}
      className={cardClassName}
      onClick={handleClick}
      style={{ contentVisibility: 'auto' }}
    >
      {headerContent}

      <CardContent className="px-5 pb-5 pt-0 space-y-3">
        {/* Основная информация в сетке */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-content bg-gradient-to-r from-brand/10 to-brand-600/10 backdrop-blur-sm border border-brand/20 p-2 rounded-lg shadow-elev-1">
            <MapPin className="w-4 h-4 flex-shrink-0 text-brand" />
            <span className="truncate font-medium">{request.location_detail}</span>
          </div>

          <div className="flex items-center gap-2 text-content bg-gradient-to-r from-brand-600/10 to-brand/10 backdrop-blur-sm border border-brand-600/20 p-2 rounded-lg shadow-elev-1">
            <CalendarLucid className="w-4 h-4 flex-shrink-0 text-brand" />
            <span className="truncate font-medium">{formattedDate}</span>
          </div>
        </div>

        {/* Фотографии - оптимизированная загрузка */}
        {request.photos && request.photos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand" />
              <span className="text-sm font-medium text-content">{request.photos.length} фото</span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {request.photos.slice(0, 2).map((photo, index) => (
                <LazyImage
                  key={index}
                  src={getThumbnailUrl(photo.photo_url)}
                  alt={`Фото ${index + 1}`}
                  className="w-12 h-12 rounded-lg object-cover border-2 border-hairline-strong shadow-elev-1 flex-shrink-0"
                />
              ))}
              {request.photos.length > 2 && (
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-brand border-2 border-hairline-strong flex items-center justify-center shadow-elev-1">
                  <span className="text-xs font-bold text-white">+{request.photos.length - 2}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Рейтинг клиента */}
        {clientRating && request.status === "completed" && request.client?.role === "client" && (
          <div className="p-3 bg-gradient-to-br from-marine/15 via-brand-700/10 to-marine/15 backdrop-blur-md border border-marine/30 rounded-lg shadow-elev-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-marine">
                {userRole === "client" ? "Оценки от исполнителей:" : "Оценки клиента:"}
              </span>
              {Array.isArray(clientRating) ? (
                // Показываем количество оценок
                <span className="text-xs text-marine">
                  {clientRating.length} оценок
                </span>
              ) : (
                // Обратная совместимость для старого формата
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-sm ${star <= clientRating.rating ? 'text-brand-700' : 'text-content-secondary'}`}>
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {Array.isArray(clientRating) ? (
              // Показываем первую оценку как превью
              clientRating.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-sm ${star <= clientRating[0].rating ? 'text-brand-700' : 'text-content-secondary'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-marine">
                      {clientRating[0].rating}/5
                    </span>
                  </div>
                  {clientRating[0].comment && (
                    <p className="text-xs text-content break-words line-clamp-2">
                      "{clientRating[0].comment}"
                    </p>
                  )}
                  {clientRating.length > 1 && (
                    <p className="text-xs text-marine mt-1">
                      +{clientRating.length - 1} еще оценок
                    </p>
                  )}
                </div>
              )
            ) : (
              // Обратная совместимость для старого формата
              clientRating.comment && (
                <p className="text-xs text-content break-words line-clamp-2">
                  "{clientRating.comment}"
                </p>
              )
            )}
          </div>
        )}

        {/* Нижняя панель */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-hairline-strong gap-2">
          <div className="flex items-center gap-1 text-xs text-content min-w-0">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium truncate" title={request.client?.full_name || 'Неизвестный клиент'}>
              {request.client?.full_name || 'Неизвестный клиент'}
            </span>
          </div>
          {request.client?.phone && (
            <a
              href={`tel:${request.client.phone}`}
              className="text-xs font-bold text-marine bg-marine/10 hover:bg-marine/20 px-2 py-1 rounded-full transition-colors duration-200 cursor-pointer break-words"
              onClick={(e) => e.stopPropagation()}
              title="Позвонить"
            >
              {request.client.phone}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const RequestCard = React.memo(RequestCardComponent, (prevProps, nextProps) => {
  // Оптимизированная функция сравнения - без JSON.stringify
  if (
    prevProps.request.id !== nextProps.request.id ||
    prevProps.request.status !== nextProps.request.status ||
    prevProps.request.created_date !== nextProps.request.created_date ||
    prevProps.isLast !== nextProps.isLast ||
    prevProps.userRole !== nextProps.userRole
  ) {
    return false
  }

  // Быстрое сравнение clientRating без JSON.stringify
  if (prevProps.clientRating === nextProps.clientRating) {
    return true
  }

  if (!prevProps.clientRating || !nextProps.clientRating) {
    return prevProps.clientRating === nextProps.clientRating
  }

  // Сравнение массива рейтингов
  if (Array.isArray(prevProps.clientRating) && Array.isArray(nextProps.clientRating)) {
    if (prevProps.clientRating.length !== nextProps.clientRating.length) {
      return false
    }
    return prevProps.clientRating[0]?.rating === nextProps.clientRating[0]?.rating &&
           prevProps.clientRating[0]?.comment === nextProps.clientRating[0]?.comment
  }

  // Сравнение объекта рейтинга
  return prevProps.clientRating.rating === nextProps.clientRating.rating &&
         prevProps.clientRating.comment === nextProps.clientRating.comment
})
