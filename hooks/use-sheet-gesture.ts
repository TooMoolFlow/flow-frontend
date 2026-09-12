"use client";

/**
 * Жест нижней шторки: перетаскивание вниз закрывает.
 *
 * Реализует §2 (движение 1:1 с пальцем), §3 (перехват на любом кадре),
 * §5 (передача скорости в пружину), §6 (проекция инерции), §7 (вход и выход по
 * одному пути), §9 (сопротивление на границе), §10 (порог до начала жеста).
 *
 * Возвращает `visible`: пока идёт анимация закрытия, шторка обязана оставаться
 * в DOM, иначе выход не показать — элемент исчезнет мгновенно.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  createVelocityTracker,
  currentTranslateY,
  prefersReducedMotion,
  project,
  rubberband,
  spring,
  springOpacity,
  springY,
  type AnimationPlaybackControls,
} from "@/lib/motion";

export type UseSheetGestureOptions = {
  open: boolean;
  onClose: () => void;
  /** Отключить жест (например, на десктопе, где шторка — обычный диалог). */
  enabled?: boolean;
  /**
   * Доля высоты, за которой отпускание закрывает шторку. Сравнивается со
   * спроецированной точкой, а не с точкой отпускания (§6).
   */
  dismissRatio?: number;
};

/** Порог до принятия решения о направлении — §10. */
const DRAG_THRESHOLD_PX = 10;

/** Ищем прокручиваемого предка внутри шторки: его прокрутка важнее жеста. */
function scrolledAncestor(from: EventTarget | null, root: HTMLElement): boolean {
  let node = from instanceof Node ? from : null;
  while (node && node !== root) {
    if (node instanceof HTMLElement) {
      const overflow = getComputedStyle(node).overflowY;
      const scrollable =
        (overflow === "auto" || overflow === "scroll") &&
        node.scrollHeight > node.clientHeight;
      if (scrollable && node.scrollTop > 0) return true;
    }
    node = node.parentNode;
  }
  return false;
}

export function useSheetGesture({
  open,
  onClose,
  enabled = true,
  dismissRatio = 0.5,
}: UseSheetGestureOptions) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  /** Затемнение — любой элемент: где-то это div, где-то кнопка-подложка. */
  const scrimRef = useRef<HTMLElement | null>(null);

  const [visible, setVisible] = useState(open);
  const [dragging, setDragging] = useState(false);

  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const closingRef = useRef(false);
  const draggingRef = useRef(false);
  const tracker = useRef(createVelocityTracker());
  const startPointerY = useRef(0);
  const startY = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  /* Свежий onClose держим в ref, чтобы обработчики жеста не переподписывались
     на каждый рендер. Присваивание — в эффекте: запись в ref во время рендера
     несовместима с конкурентным рендерингом. */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /** Прозрачность затемнения повторяет положение шторки — §1 непрерывная связь. */
  const syncScrim = useCallback((progress: number) => {
    const scrim = scrimRef.current;
    if (scrim) scrim.style.opacity = String(Math.max(0, 1 - progress));
  }, []);

  const stopAnimation = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  /* ── Открытие: монтируем и въезжаем снизу ──────────────────────────────── */
  useEffect(() => {
    if (open) {
      closingRef.current = false;
      setVisible(true);
    }
  }, [open]);

  /* ── Закрытие: выезжаем тем же путём, каким въехали (§7) ───────────────── */
  const runClose = useCallback(
    (velocity?: number) => {
      const el = panelRef.current;
      if (closingRef.current) return;
      closingRef.current = true;

      const finish = () => {
        setVisible(false);
        closingRef.current = false;
        onCloseRef.current();
      };

      if (!el || prefersReducedMotion()) {
        if (el) {
          animate(el, { opacity: 0 }, { duration: 0.15 }).finished.then(finish, finish);
        } else {
          finish();
        }
        if (scrimRef.current) {
          animate(scrimRef.current, { opacity: 0 }, { duration: 0.15 });
        }
        return;
      }

      stopAnimation();
      const height = el.offsetHeight || window.innerHeight;
      const anim = springY(el, currentTranslateY(el), height, spring.sheet, velocity);
      animationRef.current = anim;
      if (scrimRef.current) {
        springOpacity(
          scrimRef.current,
          Number(getComputedStyle(scrimRef.current).opacity) || 0,
          0,
          spring.sheet
        );
      }
      anim.finished.then(finish, finish);
    },
    [stopAnimation]
  );

  /** Закрыть с анимацией — для крестика, клика по затемнению, Esc. */
  const requestClose = useCallback(() => runClose(), [runClose]);

  /* Родитель может закрыть шторку сам (open → false): выход всё равно нужен. */
  useEffect(() => {
    if (!open && visible && !closingRef.current) {
      runClose();
    }
  }, [open, visible, runClose]);

  /* ── Въезд ─────────────────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    if (!visible) return;
    const el = panelRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.transform = "none";
      el.style.opacity = "0";
      animate(el, { opacity: 1 }, { duration: 0.15 });
      if (scrimRef.current) {
        scrimRef.current.style.opacity = "0";
        animate(scrimRef.current, { opacity: 1 }, { duration: 0.15 });
      }
      return;
    }

    const height = el.offsetHeight || window.innerHeight;
    el.style.transform = `translateY(${height}px)`;
    if (scrimRef.current) scrimRef.current.style.opacity = "0";

    const anim = springY(el, height, 0, spring.sheet);
    animationRef.current = anim;
    if (scrimRef.current) {
      springOpacity(scrimRef.current, 0, 1, spring.sheet);
    }
  }, [visible]);

  /* ── Жест ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!visible || !enabled) return;
    const el = panelRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (closingRef.current) return;

      /* §3: анимацию можно схватить на любом кадре. Новое движение стартует от
         того, что сейчас на экране, а не от логической цели, — иначе скачок. */
      stopAnimation();

      pointerIdRef.current = e.pointerId;
      startPointerY.current = e.clientY;
      startY.current = currentTranslateY(el);
      tracker.current.reset(startY.current);
      draggingRef.current = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;

      const dy = e.clientY - startPointerY.current;

      if (!draggingRef.current) {
        if (Math.abs(dy) < DRAG_THRESHOLD_PX) return; // §10 гистерезис
        if (dy < 0) {
          // Движение вверх шторке не принадлежит — отдаём его контенту.
          pointerIdRef.current = null;
          return;
        }
        if (scrolledAncestor(e.target, el)) {
          pointerIdRef.current = null;
          return;
        }
        draggingRef.current = true;
        setDragging(true);
        /* Захват держит жест, даже когда палец уходит за пределы панели (§2).
           Бросает, если указателя уже нет, — на исход жеста это не влияет. */
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* указатель уже отпущен */
        }
      }

      const height = el.offsetHeight || window.innerHeight;
      let y = startY.current + dy;
      /* §9: выше исходного положения — нарастающее сопротивление, не упор. */
      if (y < 0) y = rubberband(y, height);

      el.style.transform = `translateY(${y}px)`;
      tracker.current.add(y);
      syncScrim(y / height);
    };

    const endGesture = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      pointerIdRef.current = null;

      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);

      const height = el.offsetHeight || window.innerHeight;
      const y = currentTranslateY(el);
      const velocity = tracker.current.velocity();

      /* §6: цель выбирается по точке, куда движение долетит само, а не по
         точке отпускания. Знак скорости при этом учтён: флик вверх проецируется
         в минус и возвращает шторку на место. */
      const projected = y + project(velocity);

      if (projected > height * dismissRatio) {
        runClose(velocity); // §5: скорость пальца передаётся в пружину
      } else {
        stopAnimation();
        const anim = springY(el, y, 0, spring.sheet, velocity);
        animationRef.current = anim;
        if (scrimRef.current) {
          springOpacity(
            scrimRef.current,
            Number(getComputedStyle(scrimRef.current).opacity) || 0,
            1,
            spring.sheet
          );
        }
      }
    };

    /* Пока тянем шторку, браузер не должен прокручивать страницу. Слушатель
       непассивный, но preventDefault срабатывает только после порога. */
    const onTouchMove = (ev: TouchEvent) => {
      if (draggingRef.current) ev.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endGesture);
    el.addEventListener("pointercancel", endGesture);
    el.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endGesture);
      el.removeEventListener("pointercancel", endGesture);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [visible, enabled, dismissRatio, runClose, stopAnimation, syncScrim]);

  /* ── Клавиатура: из шторки всегда есть выход (§16 wayfinding) ──────────── */
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible, requestClose]);

  useEffect(() => () => stopAnimation(), [stopAnimation]);

  return { panelRef, scrimRef, visible, dragging, requestClose };
}
