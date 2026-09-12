"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RequestModalShell } from "./request-modal-shell";

interface RedirectCategory {
  id: number;
  name: string;
}

interface RedirectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  categories: RedirectCategory[];
  currentCategoryId: number;
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number) => void;
  isSubmitting: boolean;
  error?: string | null;
  title?: string;
  description?: string;
  variant?: "dark" | "light";
  usePortal?: boolean;
}

export function RedirectRequestModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  currentCategoryId,
  selectedCategoryId,
  onCategoryChange,
  isSubmitting,
  error = null,
  title = "Перенаправить к другой категории",
  description = "Выберите категорию, к которой нужно перенаправить подзаявку",
  variant = "dark",
  usePortal = false,
}: RedirectRequestModalProps) {
  const isDark = variant === "dark";
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

  if (!isOpen) return null;

  return (
    <RequestModalShell
      isOpen={isOpen}
      onClose={onClose}
      usePortal={usePortal}
      overlayClassName={cn(
        "z-[99999] bg-black/50 backdrop-blur-none",
        !isDark && "z-[100] bg-black/60"
      )}
    >
      <Card
        className={cn(
          "w-full max-w-md shadow-elev-3",
          isDark
            ? "bg-surface-2 border border-hairline"
            : "bg-card border border-hairline"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className={isDark ? "text-white" : undefined}>{title}</CardTitle>
          <CardDescription className={isDark ? "text-white/70" : undefined}>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="redirect-category" className={isDark ? "text-white" : undefined}>
              Категория
            </Label>
            <Select
              value={selectedCategoryId?.toString() ?? ""}
              onValueChange={(value) => onCategoryChange(parseInt(value, 10))}
            >
              <SelectTrigger
                id="redirect-category"
                className={
                  isDark ? "bg-surface-1 border-hairline text-white" : undefined
                }
              >
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent
                className={cn("z-[100001]", isDark && "bg-surface-2 border-hairline")}
              >
                {categories
                  .filter((category) => category.id !== currentCategoryId)
                  .map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                      className={cn(
                        isDark && "text-white focus:bg-brand/20"
                      )}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategoryId && selectedCategory && (
            <div
              className={cn(
                "rounded-lg p-4 border",
                isDark
                  ? "bg-brand/20 border-brand/40"
                  : "bg-brand/10 border-brand/30"
              )}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isDark ? "text-brand" : "text-brand"
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    isDark ? "text-white/90" : "text-content-tertiary"
                  )}
                >
                  Подзаявка будет перенаправлена руководителям категории &quot;
                  {selectedCategory.name}&quot;
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-danger-400">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className={
                isDark
                  ? "!bg-transparent border border-white/30 !text-white hover:!bg-white/10"
                  : "bg-transparent text-white hover:bg-white/10"
              }
            >
              Отмена
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!selectedCategoryId || isSubmitting}
              className="bg-brand-fill hover:bg-brand-600 text-white"
            >
              {isSubmitting ? "Перенаправление..." : "Перенаправить"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </RequestModalShell>
  );
}
