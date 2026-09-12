"use client"

import React from "react"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  ratingValue: number
  onRatingChange: (rating: number) => void
  onSubmit: () => void
  title?: string
  description?: string
  currentRating?: number
  comment?: string
  onCommentChange?: (comment: string) => void
  /** Тёмный стиль для админ-мобилки */
  variant?: "default" | "dark"
}

export function RatingModal({
  isOpen,
  onClose,
  ratingValue,
  onRatingChange,
  onSubmit,
  title = "Оценка заявки",
  description = "Поставьте оценку выполненной работе",
  currentRating,
  comment = "",
  onCommentChange,
  variant = "default",
}: RatingModalProps) {
  if (!isOpen) return null

  const isUpdate = !!currentRating;
  const showCommentField = ratingValue > 0 && ratingValue < 4;
  const dark = variant === "dark";

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 z-[110] ${dark ? "bg-black/60" : "bg-black/40"}`}>
      <div className={`w-full max-w-md shadow-elev-3 rounded-2xl overflow-hidden ${
        dark ? "bg-surface-2 border border-hairline" : "bg-card border-0"
      }`}>
        <div className="text-center p-6">
          <h2 className={`text-xl font-semibold mb-2 ${dark ? "text-white" : "text-foreground"}`}>{title}</h2>
          <p className={`mb-6 ${dark ? "text-content-tertiary" : "text-content-secondary"}`}>{description}</p>
          
          {isUpdate && (
            <div className={`mb-4 p-3 rounded-xl ${
              dark ? "bg-surface-3 border border-hairline" : "bg-info/10 border border-info/30"
            }`}>
              <p className={`text-sm ${dark ? "text-content-secondary" : "text-info-600"}`}>
                Текущая оценка: {currentRating} из 5 звезд
              </p>
              <p className={`text-xs mt-1 ${dark ? "text-content-tertiary" : "text-info"}`}>
                Вы можете изменить свою оценку
              </p>
            </div>
          )}
          
          <div className="text-center mb-6">
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onRatingChange(star)}
                  className="transition-all duration-150 hover:scale-105"
                >
                  <span className={`text-4xl cursor-pointer transition-colors duration-150 ${
                    star <= ratingValue 
                      ? dark ? "text-brand" : "text-marine"
                      : dark ? "text-content-tertiary hover:text-brand/50" : "text-content-tertiary hover:text-marine/50"
                  }`}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            {ratingValue > 0 && (
              <p className={`text-sm ${dark ? "text-content-tertiary" : "text-content-secondary"}`}>
                {ratingValue} из 5 звезд
              </p>
            )}
          </div>

          {showCommentField && (
            <div className="mb-6">
              <label className={`block text-sm font-medium text-left mb-2 ${dark ? "text-content-secondary" : "text-content-secondary"}`}>
                Укажите причину низкой оценки *
              </label>
              <textarea
                value={comment}
                onChange={(e) => onCommentChange?.(e.target.value)}
                placeholder="Опишите, что именно вас не устроило..."
                className={`w-full max-w-full px-3 py-2 rounded-xl resize-none break-words focus:outline-none focus:ring-2 ${
                  dark
                    ? "bg-surface-1 border border-hairline text-white placeholder:text-content-tertiary focus:ring-brand"
                    : "border border-hairline focus:ring-marine focus:border-transparent"
                }`}
                rows={3}
                required
              />
              <p className={`text-xs mt-1 text-left ${dark ? "text-content-tertiary" : "text-content-tertiary"}`}>
                Это поможет нам улучшить качество обслуживания
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={onSubmit}
              disabled={ratingValue === 0 || (showCommentField && !comment.trim())}
              className={`w-full text-white py-3 px-4 rounded-xl transition-colors duration-150 disabled:opacity-50 ${
                dark
                  ? "bg-brand hover:bg-brand-600"
                  : "bg-gradient-to-r from-marine to-brand-700 hover:from-marine-800 hover:to-brand-700"
              }`}
            >
              {isUpdate ? "Обновить оценку" : "Отправить оценку"}
            </button>
            <button
              onClick={onClose}
              className={`w-full py-3 px-4 rounded-xl transition-colors duration-150 ${
                dark
                  ? "border border-hairline text-content-secondary hover:bg-surface-3"
                  : "text-content-secondary hover:text-foreground hover:bg-surface-3"
              }`}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
