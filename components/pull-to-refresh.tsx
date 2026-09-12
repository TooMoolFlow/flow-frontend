"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/page-loader";
import {
  animate,
  createVelocityTracker,
  currentTranslateY,
  prefersReducedMotion,
  rubberband,
  spring,
  springY,
  type AnimationPlaybackControls,
} from "@/lib/motion";

export type PullToRefreshProps = {
  children?: React.ReactNode;
  onRefresh?: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  /** @deprecated используйте variant overlay через PageLoader */
  color?: string;
  /**
   * Минимальное время показа лоадера — только чтобы он не мигнул на быстром
   * ответе. Это не «пусть пользователь увидит, что мы работаем»: удерживать
   * лоадер дольше, чем длится запрос, — та же искусственная задержка (§1).
   */
  minVisibleMs?: number;
  loaderSize?: number;
};

/**
 * Потянуть вниз, чтобы обновить.
 *
 * Положение считается и пишется напрямую в стиль, а не через состояние React:
 * жест обязан идти 1:1 с пальцем (§2), а перерисовка на каждый `pointermove`
 * добавляет кадр отставания. React знает только о том, идёт ли обновление.
 *
 * Отпускание переходит в пружину со скоростью пальца (§5) — без этого между
 * перетаскиванием и анимацией виден шов.
 */
export function PullToRefresh(props: PullToRefreshProps) {
  const {
    children,
    onRefresh = async () => {},
    threshold = 96,
    maxPull = 180,
    minVisibleMs = 350,
    loaderSize = 56,
  } = props;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const loaderRef = React.useRef<HTMLDivElement | null>(null);

  const animationRef = React.useRef<AnimationPlaybackControls | null>(null);
  const tracker = React.useRef(createVelocityTracker());
  const startPointerY = React.useRef(0);
  const pullingRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const refreshingRef = React.useRef(false);
  const pointerIdRef = React.useRef<number | null>(null);
  const refreshStartedAt = React.useRef<number | null>(null);

  const [refreshing, setRefreshing] = React.useState(false);
  /* Свежий onRefresh — в ref, чтобы обработчики не переподписывались; запись
     в эффекте, а не во время рендера. */
  const onRefreshRef = React.useRef(onRefresh);
  React.useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  /** Одна запись положения — содержимое и лоадер едут вместе. */
  const applyY = React.useCallback(
    (y: number) => {
      const content = contentRef.current;
      const loader = loaderRef.current;
      if (content) content.style.transform = `translateY(${y}px)`;
      if (loader) {
        const progress = Math.max(0, Math.min(1, y / threshold));
        loader.style.transform = `translateY(${y}px) scale(${0.3 + progress * 0.7})`;
        loader.style.opacity = String(progress);
      }
    },
    [threshold]
  );

  const stopAnimation = React.useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  /** Пружина к цели с передачей скорости жеста — §5. */
  const settleTo = React.useCallback(
    (target: number, velocity: number) => {
      const content = contentRef.current;
      const loader = loaderRef.current;
      if (!content) return null;

      stopAnimation();

      if (prefersReducedMotion()) {
        applyY(target);
        return null;
      }

      const from = currentTranslateY(content);
      const anim = springY(content, from, target, spring.momentum, velocity);
      animationRef.current = anim;

      if (loader) {
        const progress = Math.max(0, Math.min(1, target / threshold));
        const fromProgress = Math.max(0, Math.min(1, from / threshold));
        animate(
          loader,
          {
            y: [from, target],
            scale: [0.3 + fromProgress * 0.7, 0.3 + progress * 0.7],
            opacity: [fromProgress, progress],
          },
          { ...spring.momentum, velocity } as never
        );
      }
      return anim;
    },
    [applyY, stopAnimation, threshold]
  );

  const doRefresh = React.useCallback(
    async (velocity: number) => {
      refreshingRef.current = true;
      setRefreshing(true);
      refreshStartedAt.current = Date.now();
      settleTo(threshold, velocity);

      try {
        await onRefreshRef.current();
      } finally {
        const elapsed = Date.now() - (refreshStartedAt.current ?? Date.now());
        const wait = Math.max(minVisibleMs - elapsed, 0);
        window.setTimeout(() => {
          refreshingRef.current = false;
          refreshStartedAt.current = null;
          setRefreshing(false);
          settleTo(0, 0);
        }, wait);
      }
    },
    [minVisibleMs, settleTo, threshold]
  );

  React.useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const onPointerDown = (e: PointerEvent) => {
      if (refreshingRef.current) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (container.scrollTop > 0) return;

      /* §3: жест может начаться прямо поверх идущей анимации — она
         останавливается, а отсчёт идёт от текущего положения на экране. */
      stopAnimation();

      pointerIdRef.current = e.pointerId;
      pullingRef.current = true;
      draggingRef.current = false;
      startPointerY.current = e.clientY;
      tracker.current.reset(currentTranslateY(content));
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pullingRef.current || pointerIdRef.current !== e.pointerId) return;
      if (refreshingRef.current) return;

      const dy = e.clientY - startPointerY.current;

      if (!draggingRef.current) {
        if (dy < 10) {
          if (dy < 0) pullingRef.current = false; // вверх — это прокрутка
          return;
        }
        if (container.scrollTop > 0) {
          pullingRef.current = false;
          return;
        }
        draggingRef.current = true;
      }

      /*
       * До порога содержимое идёт ровно за пальцем (§2), дальше — нарастающее
       * сопротивление (§9) с асимптотой на maxPull.
       *
       * Прежняя версия пропускала через резинку весь ход с самого нуля, и до
       * срабатывания приходилось протаскивать 343px — почти половину экрана.
       * Резинка нужна за границей, а не до неё.
       */
      const y =
        dy <= threshold
          ? dy
          : threshold + rubberband(dy - threshold, maxPull - threshold);
      applyY(y);
      tracker.current.add(y);
    };

    const endGesture = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;
      if (!pullingRef.current) return;
      pullingRef.current = false;

      if (!draggingRef.current || refreshingRef.current) return;
      draggingRef.current = false;

      const y = currentTranslateY(content);
      const velocity = tracker.current.velocity();

      if (y >= threshold) {
        void doRefresh(velocity);
      } else {
        settleTo(0, velocity);
      }
    };

    /* Пока тянем, страница прокручиваться не должна. Слушатель непассивный,
       но preventDefault срабатывает только после порога. */
    const onTouchMove = (ev: TouchEvent) => {
      if (draggingRef.current && !refreshingRef.current) ev.preventDefault();
    };

    container.addEventListener("pointerdown", onPointerDown, { passive: true });
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerup", endGesture, { passive: true });
    container.addEventListener("pointercancel", endGesture, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", endGesture);
      container.removeEventListener("pointercancel", endGesture);
      container.removeEventListener("touchmove", onTouchMove);
    };
  }, [applyY, doRefresh, maxPull, settleTo, stopAnimation, threshold]);

  React.useEffect(() => () => stopAnimation(), [stopAnimation]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-full h-[calc(100vh_-_theme(spacing.14))] sm:h-[calc(100vh_-_theme(spacing.16))] overflow-y-auto overscroll-contain bg-inherit"
      role="region"
      aria-label="Лента"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollBehavior: "auto",
        contain: "layout style paint",
      }}
    >
      {/* Лоадер стоит выше кромки и выезжает вместе с содержимым: анимируются
          только transform и opacity — свойства, которые не вызывают перекладку
          (§11). Высота-«распорка» этого не давала. */}
      <div
        ref={loaderRef}
        className="pointer-events-none absolute inset-x-0 z-10 flex justify-center"
        style={{
          top: -(loaderSize + 8),
          height: loaderSize,
          opacity: 0,
          transform: "translateY(0px) scale(0.3)",
        }}
        aria-hidden={!refreshing}
      >
        <PageLoader
          size={loaderSize}
          variant="overlay"
          className={cn(refreshing && "animate-pulse")}
        />
      </div>

      <div ref={contentRef}>{children}</div>
    </div>
  );
}

export default PullToRefresh;
