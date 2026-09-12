"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PRIVACY_CONTENT, type PrivacyLanguage } from "@/constants/privacy-content";
import { token } from "@/lib/tokens";

/** Mobile privacy — parity с workflow-mobile/app/privacy/index.tsx */
export function PrivacyViewMobile() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionOffsetsRef = useRef<number[]>([]);
  const [lang, setLang] = useState<PrivacyLanguage>("ru");
  const [activeSection, setActiveSection] = useState(0);

  const content = PRIVACY_CONTENT[lang];

  const measureSections = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const containerTop = scrollEl.getBoundingClientRect().top;
    sectionOffsetsRef.current = sectionRefs.current.map((node) => {
      if (!node) return 0;
      return node.getBoundingClientRect().top - containerTop + scrollEl.scrollTop;
    });
  }, []);

  useEffect(() => {
    setActiveSection(0);
    sectionRefs.current = [];
    sectionOffsetsRef.current = [];
    scrollRef.current?.scrollTo({ top: 0 });
  }, [lang]);

  useLayoutEffect(() => {
    measureSections();
  }, [lang, content.sections.length, measureSections]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const observer = new ResizeObserver(() => {
      measureSections();
    });
    observer.observe(scrollEl);
    return () => observer.disconnect();
  }, [lang, measureSections]);

  const scrollToSection = useCallback(
    (index: number) => {
      measureSections();
      const y = sectionOffsetsRef.current[index];
      if (y !== undefined && scrollRef.current) {
        scrollRef.current.scrollTo({ top: y - 16, behavior: "smooth" });
        setActiveSection(index);
      }
    },
    [measureSections]
  );

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    const offsets = sectionOffsetsRef.current;
    if (!el || offsets.length === 0) return;
    const offsetY = el.scrollTop;
    let idx = 0;
    for (let i = 0; i < offsets.length; i++) {
      if (offsets[i] != null && offsetY >= offsets[i] - 32) {
        idx = i;
      }
    }
    setActiveSection((prev) => (prev === idx ? prev : idx));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="flex flex-1 flex-col px-4 pb-4 pt-2">
        <div className="flex items-center gap-3 border-b border-hairline pb-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-11 w-11 items-center justify-center text-primary"
            aria-label="Назад"
          >
            <ChevronLeft className="h-7 w-7" strokeWidth={2.5} />
          </button>
          <h1 className="flex-1 text-center text-lg font-bold leading-[22px] text-white">
            {content.title}
          </h1>
          <div className="flex gap-2">
            {(["ru", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className="rounded-full border px-4 py-2 text-[13px] font-semibold"
                style={{
                  borderColor: lang === code ? token.brand : token.surface1,
                  background: lang === code ? token.brandFill : "transparent",
                  color: lang === code ? token.white : undefined,
                }}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="py-2.5 text-center">
          <p className="text-sm leading-5 text-content-tertiary">{content.subtitle}</p>
          <p className="mt-1 text-xs text-content-tertiary">{content.lastUpdate}</p>
        </div>

        <div className="border-b border-hairline py-2.5">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {content.sections.map((section, index) => (
              <button
                key={section.heading}
                type="button"
                onClick={() => scrollToSection(index)}
                className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
                style={{
                  borderColor: activeSection === index ? token.brand : token.surface1,
                  background: activeSection === index ? token.brandFill : "transparent",
                  color: activeSection === index ? token.white : token.contentTertiary,
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-hairline">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-5"
          >
            {content.sections.map((section, index) => (
              <div
                key={section.heading}
                ref={(node) => {
                  sectionRefs.current[index] = node;
                }}
                className="mb-6 flex flex-col gap-2.5 last:mb-0"
              >
                <h2 className="text-[17px] font-bold leading-6 text-white">
                  {section.heading}
                </h2>
                <p className="whitespace-pre-line text-[15px] leading-6 text-white/90">
                  {section.content}
                </p>
              </div>
            ))}
            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
