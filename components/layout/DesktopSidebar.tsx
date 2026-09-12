"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DesktopSidebarItem {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
}

interface DesktopSidebarProps {
  title: string;
  subtitle?: string;
  items: DesktopSidebarItem[];
  className?: string;
  /** Свёрнут ли сайдбар (только иконки) */
  collapsed?: boolean;
  /** Переключить свёрнутое состояние */
  onToggleCollapse?: () => void;
}

export function DesktopSidebar({
  title,
  subtitle,
  items,
  className,
  collapsed = false,
  onToggleCollapse,
}: DesktopSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 fixed left-0 top-0 h-screen z-20 bg-surface-1 border-r border-hairline transition-[width] duration-200 ease-in-out overflow-hidden",
        collapsed ? "w-[4.25rem]" : "w-56 lg:w-64",
        className
      )}
    >
      <div
        className={cn(
          "border-b border-hairline flex shrink-0 p-3 md:p-4",
          collapsed ? "justify-center p-3" : "flex-col"
        )}
      >
        {collapsed ? (
          /* Короткое имя показываем целиком — обрезать «Flow» до «Fl» незачем.
             Длинное сокращаем до двух букв, чтобы влезло в узкую полосу. */
          <span className="font-bold text-sm text-white">
            {!title ? "F" : title.length <= 4 ? title : title.slice(0, 2)}
          </span>
        ) : (
          <>
            <span className="font-bold text-base lg:text-lg text-white">{title}</span>
            {subtitle && <p className="text-xs text-white/60 mt-0.5">{subtitle}</p>}
          </>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 md:py-4 min-h-0 custom-scrollbar-dark">
        <ul
          className={cn(
            "space-y-1",
            collapsed ? "px-2 flex flex-col items-center" : "px-2 md:px-3"
          )}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.key} className={cn("w-full", collapsed && "flex justify-center")}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "press-dim flex items-center rounded-lg font-medium",
                    collapsed
                      ? "justify-center w-10 h-10 mx-auto"
                      : "gap-2 lg:gap-3 px-2 md:px-3 py-2 md:py-2.5 text-xs lg:text-sm",
                    item.isActive
                      ? "bg-brand-fill text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {onToggleCollapse && (
        <div className={cn("p-2 border-t border-hairline", collapsed && "flex justify-center")}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn(
              "text-white/80 hover:bg-white/10 hover:text-white w-full",
              collapsed && "w-10 h-10 p-0 mx-auto"
            )}
            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            {collapsed ? (
              <PanelLeft className="w-5 h-5 shrink-0" />
            ) : (
              <PanelLeftClose className="w-5 h-5 shrink-0" />
            )}
          </Button>
        </div>
      )}
    </aside>
  );
}

