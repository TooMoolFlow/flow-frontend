import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import "./globals.css"
import "../lib/fcm"
import BridgeInit from "@/components/BridgeInit"
import { RestorePendingRequestUrl } from "@/components/RestorePendingRequestUrl"
import { MobileDeepLinkToApp } from "@/components/MobileDeepLinkToApp"
import { AppProviders } from "@/components/theme/app-providers"
import { ColorSchemeInitScript } from "@/components/theme/color-scheme-init-script"
import { PressFeedbackInitScript } from "@/components/theme/press-feedback-init-script"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Flow — система управления заявками",
  description:
    "Mobile-first internal solution for Kcell employees to submit and manage cleaning and maintenance requests across office buildings.",
  keywords: "Kcell, service requests, maintenance, internal app, Kazakhstan telecom",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Масштабирование щипком не блокируем: это базовая доступность.
            Автозум iOS при фокусе снят кеглем поля в globals.css. */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ColorSchemeInitScript />
        <PressFeedbackInitScript />
      </head>
      <body className="font-sf-pro">
        <AppProviders>
          <BridgeInit />
          <Suspense fallback={null}>
            <RestorePendingRequestUrl />
          </Suspense>
          <Suspense fallback={null}>
            <MobileDeepLinkToApp />
          </Suspense>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  )
}
