"use client";

import Image from "next/image";
import { safeImageSrc } from "@/lib/safe-image-src";
import { MapPin } from "lucide-react";
import type { Office } from "@/lib/api";

interface MeetingRoomsMobileOfficeGridProps {
  offices: Office[];
  loading: boolean;
  onOfficeClick: (office: Office) => void;
}

export function MeetingRoomsMobileOfficeGrid({
  offices,
  loading,
  onOfficeClick,
}: MeetingRoomsMobileOfficeGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 animate-pulse">
            <div className="w-full aspect-[112/145] bg-surface-2 rounded" />
            <div className="space-y-1">
              <div className="h-2 bg-surface-2 rounded w-3/4" />
              <div className="h-2 bg-surface-2 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {offices.map((office) => (
        <button
          key={office.id}
          type="button"
          onClick={() => onOfficeClick(office)}
          className="flex flex-col gap-2 text-left"
        >
          <div className="w-full aspect-[112/145] bg-surface-2 rounded overflow-hidden relative">
            {office.photo ? (
              <Image
                src={safeImageSrc(office.photo)}
                alt={office.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 112px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-surface-2 to-surface-1 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-content-secondary" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-white leading-[8px]">{office.name}</span>
            <span className="text-[8px] text-content-tertiary leading-[9px]">{office.address}</span>
            <div className="flex items-center gap-[2px]">
              <MapPin className="w-2 h-2 text-content-tertiary" />
              <span className="text-[8px] text-content-tertiary leading-[6px]">{office.city}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
