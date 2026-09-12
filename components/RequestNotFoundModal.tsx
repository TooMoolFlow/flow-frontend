'use client'

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowDown, RefreshCw } from "lucide-react";

interface RequestNotFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

export function RequestNotFoundModal({ isOpen, onClose, requestId }: RequestNotFoundModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] max-w-md p-4 sm:p-5 rounded-xl border border-hairline bg-surface-1 text-white shadow-elev-3 [&>button]:right-3 [&>button]:top-3 [&>button]:text-white/70 [&>button]:hover:text-white [&>button]:hover:bg-white/10 [&>button]:rounded-lg"
      >
        <DialogHeader className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-semibold text-white">
              Заявка не найдена
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-content-tertiary leading-relaxed">
            Заявка <span className="font-semibold text-brand">№ {requestId}</span> не отображается в текущем списке.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-surface-2 border border-hairline rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <ArrowDown className="w-3 h-3 text-brand" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <h4 className="font-medium text-white text-sm sm:text-base">Как найти заявку:</h4>
                <ol className="text-xs sm:text-sm text-content-tertiary space-y-1 list-decimal list-inside">
                  <li>Прокрутите список заявок вниз</li>
                  <li>Нажмите кнопку &quot;Загрузить еще&quot; внизу страницы</li>
                  <li>Заявка может появиться в следующих страницах</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-surface-2 border border-hairline rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <RefreshCw className="w-3 h-3 text-content-tertiary" />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-white text-sm sm:text-base mb-1">Альтернативный способ:</h4>
                <p className="text-xs sm:text-sm text-content-tertiary">
                  Обновите страницу, чтобы загрузить все заявки заново
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 sm:pt-4">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto min-h-11 px-4 sm:px-6 rounded-xl bg-brand-fill hover:bg-brand-600 text-white border-0"
          >
            Понятно
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
