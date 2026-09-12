"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Loader2, Trash2, Home } from "lucide-react"
import { formatDateTime } from "@/lib/dateTimeUtils"
import { useYandexSmartHomeTokens } from "@/hooks/use-yandex-smart-home-tokens"

interface YandexSmartHomeAdminProps {
  /** Тёмная тема (для раздела Управление на десктопе у админа) */
  dark?: boolean
}

export function YandexSmartHomeAdmin({ dark = false }: YandexSmartHomeAdminProps) {
  const {
    tokensMeta: existingToken,
    isLoading,
    error,
    tokenAction,
    handleRefreshTokens,
    handleDeleteTokens,
  } = useYandexSmartHomeTokens()

  const isRefreshing = tokenAction === "refresh"
  const isDeleting = tokenAction === "delete"

  const cardCl = dark ? "border-hairline bg-surface-2" : ""
  const titleCl = dark ? "text-white" : ""
  const descCl = dark ? "text-white/70" : ""
  const errorBoxCl = dark ? "bg-danger/20 border-danger/50" : "bg-danger/10 border-danger/30"
  const errorTextCl = dark ? "text-danger-300" : "text-danger-600"
  const loadingBoxCl = dark ? "bg-info/20 border-info/50" : "bg-info/10 border-info/30"
  const loadingTextCl = dark ? "text-info-400" : "text-info-600"
  const successBoxCl = dark ? "bg-info/20 border-info/50" : "bg-info/10 border-info/30"
  const successTextCl = dark ? "text-info-400" : "text-info-600"
  const warnBoxCl = dark ? "bg-warning/20 border-warning/50" : "bg-warning/10 border-warning/30"
  const warnTextCl = dark ? "text-warning-400" : "text-warning-600"
  const infoBoxCl = dark ? "bg-white/5 border-hairline" : "bg-surface-3 border-hairline"
  const infoTextCl = dark ? "text-white/70" : "text-content-secondary"
  const buttonOutlineCl = dark ? "border-hairline-strong text-white hover:bg-white/10" : ""

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className={`w-full ${cardCl}`}>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className={`text-base sm:text-lg flex items-center gap-2 ${titleCl}`}>
            <Home className="h-5 w-5" />
            Управление Яндекс умным домом
          </CardTitle>
          <CardDescription className={descCl}>
            Управление токенами авторизации для интеграции с Яндекс умным домом. Токены получаются через OAuth авторизацию и хранятся только на сервере.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className={`border rounded-lg p-3 ${errorBoxCl}`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${dark ? "text-danger-400" : "text-danger"}`} />
                <div className={`text-sm ${errorTextCl}`}>{error}</div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className={`border rounded-lg p-3 ${loadingBoxCl}`}>
              <div className="flex items-center gap-2">
                <Loader2 className={`w-4 h-4 animate-spin ${dark ? "text-info-300" : "text-info"}`} />
                <div className={`text-sm ${loadingTextCl}`}>Загрузка...</div>
              </div>
            </div>
          )}

          {existingToken && !isLoading && (
            <div className={`border rounded-lg p-3 ${successBoxCl}`}>
              <div className="flex items-start gap-2">
                <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${dark ? "text-info-300" : "text-info"}`} />
                <div className={`text-sm ${successTextCl}`}>
                  <p className="font-medium mb-1">Токены настроены</p>
                  {existingToken.created_at ? (
                    <p>Создано: {formatDateTime(existingToken.created_at)}</p>
                  ) : null}
                  {existingToken.expires_at && (
                    <p>Истекает: {formatDateTime(existingToken.expires_at)}</p>
                  )}
                  <p className={`text-xs mt-2 ${dark ? "text-info-300/90" : "text-info"}`}>Токены хранятся только на сервере и не отправляются на фронтенд</p>
                </div>
              </div>
            </div>
          )}

          {!existingToken && !isLoading && (
            <div className={`border rounded-lg p-3 ${warnBoxCl}`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${dark ? "text-warning-400" : "text-warning"}`} />
                <div className={`text-sm ${warnTextCl}`}>
                  <p className="font-medium mb-1">Токены не настроены</p>
                  <p>Токены должны быть получены через OAuth авторизацию Яндекс и сохраняются автоматически на сервере.</p>
                </div>
              </div>
            </div>
          )}

          {existingToken && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => void handleRefreshTokens()}
                disabled={isRefreshing || !!tokenAction}
                variant="outline"
                className={`bg-transparent flex-1 ${buttonOutlineCl}`}
              >
                {isRefreshing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Обновление...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4" />
                    <span>Обновить токены</span>
                  </div>
                )}
              </Button>
              <Button
                onClick={() => void handleDeleteTokens()}
                disabled={isDeleting || !!tokenAction}
                variant="destructive"
                className="flex-1 sm:flex-initial"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Удаление...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Удалить</span>
                  </div>
                )}
              </Button>
            </div>
          )}

          <div className={`border rounded-lg p-3 mt-4 ${infoBoxCl}`}>
            <div className={`text-xs ${infoTextCl}`}>
              <p className="font-medium mb-1">Информация:</p>
              <p>• Endpoint для Яндекс умного дома: <code className={dark ? "bg-white/10 px-1 rounded text-white/90" : "bg-surface-3 px-1 rounded"}>GET /api/yandex-smart-home/v1.0/user/devices</code></p>
              <p>• Яндекс будет отправлять запросы с токеном в заголовке Authorization</p>
              <p>• Токены получаются через OAuth авторизацию и сохраняются автоматически на сервере</p>
              <p>• Токены хранятся только на сервере и никогда не отправляются на фронтенд</p>
              <p>• При истечении токены автоматически обновляются через refresh_token</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
