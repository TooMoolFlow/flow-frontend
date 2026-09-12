"use client";

import { PrivacyViewDesktop } from "@/components/auth/privacy-view-desktop";
import { PrivacyViewMobile } from "@/components/auth/privacy-view-mobile";

export function PrivacyView() {
  return (
    <>
      <div data-theme="dark" className="hidden min-h-screen bg-background md:block">
        <PrivacyViewDesktop />
      </div>
      <div data-theme="dark" className="min-h-screen bg-background md:hidden">
        <PrivacyViewMobile />
      </div>
    </>
  );
}
