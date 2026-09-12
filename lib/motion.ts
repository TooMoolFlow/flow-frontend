/**
 * Движение: пружины вместо переходов фиксированной длительности.
 *
 * Заранее заданная анимация не умеет реагировать на новый ввод — её нельзя
 * схватить на середине и развернуть. Пружина умеет: новый ввод просто меняет
 * цель, движение остаётся непрерывным. Поэтому всё, чего пользователь может
 * коснуться, анимируется отсюда, а не классами `transition-*`.
 *
 * Параметры — в терминах Apple (коэффициент затухания + response), а не
 * mass/stiffness/damping.
 */

import { animate, type AnimationPlaybackControls } from "motion";

/* ────────────────────────────────────────────────────────────────────────────
   Пресеты
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Соответствие параметров:
 *
 * - Затухание (Apple) → `bounce` (Motion). `1.0` = критическое затухание, без
 *   перелёта → `bounce: 0`. `0.8` → `bounce: 0.2`.
 * - Response (Apple) → `visualDuration`, а НЕ `duration`. Response — это время,
 *   за которое значение визуально доходит до цели; «пружинистый хвост» живёт
 *   после него. `duration` в Motion — полная длительность вместе с затуханием,
 *   и подставлять её вместо response значит делать движение заметно вялее.
 *
 * Перелёт добавляется только там, где жесту предшествовал импульс — бросок,
 * флик, отпускание после перетаскивания. Перелёт у меню, которое просто
 * появилось, читается как ошибка.
 */
export const spring = {
  /** По умолчанию: критическое затухание, без перелёта. */
  default: { type: "spring", bounce: 0, visualDuration: 0.4 },
  /** Перемещение объекта (Apple: затухание 1.0, response 0.4). */
  move: { type: "spring", bounce: 0, visualDuration: 0.4 },
  /** Импульсное движение — только после флика (затухание 0.8, response 0.4). */
  momentum: { type: "spring", bounce: 0.2, visualDuration: 0.4 },
  /** Шторки и ящики (затухание 0.8, response 0.3). */
  sheet: { type: "spring", bounce: 0.2, visualDuration: 0.3 },
  /** Мгновенная реакция без перелёта — переключатели, мелкие элементы. */
  snappy: { type: "spring", bounce: 0, visualDuration: 0.25 },
} as const;

export type SpringPreset = (typeof spring)[keyof typeof spring];

/* ────────────────────────────────────────────────────────────────────────────
   Доступность — §14
   ────────────────────────────────────────────────────────────────────────── */

/** Пользователь просил уменьшить движение. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Пружина, уважающая системную настройку.
 *
 * Уменьшенное движение — это не отсутствие обратной связи, а её нев­естибулярный
 * вариант: короткий переход без перелёта вместо упругого броска.
 */
export function springTransition(
  preset: SpringPreset,
  velocity?: number
): Record<string, unknown> {
  if (prefersReducedMotion()) {
    return { duration: 0.2, ease: "easeOut" };
  }
  return velocity === undefined ? { ...preset } : { ...preset, velocity };
}

/* ────────────────────────────────────────────────────────────────────────────
   Физика жеста
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Куда «долетит» объект, отпущенный с данной скоростью — §6.
 *
 * Это форма экспоненциального затухания из образцов Apple, а не школьная
 * `v²/(2a)`: именно она даёт привычное по инерционной прокрутке ощущение.
 * Снапиться нужно к точке, ближайшей к спроецированной, а не к точке отпускания,
 * иначе флик не «бросает» объект, а лишь чуть сдвигает.
 *
 * @param velocity px/s
 * @param decelerationRate 0.998 — обычная прокрутка, 0.99 — резче
 * @returns смещение в px от текущей позиции
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Сопротивление за границей — §9.
 *
 * Жёсткий упор читается как «залипло», нарастающее сопротивление — как
 * «отзывается, но дальше ничего нет».
 *
 * @param overshoot насколько ушли за границу, px
 * @param dimension размер поверхности, px
 */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant = 0.55
): number {
  const sign = Math.sign(overshoot);
  const x = Math.abs(overshoot);
  return (sign * (x * dimension * constant)) / (dimension + constant * x);
}

/* ────────────────────────────────────────────────────────────────────────────
   Скорость жеста
   ────────────────────────────────────────────────────────────────────────── */

type Sample = { value: number; time: number };

/**
 * Скорость на момент отпускания — §5.
 *
 * Считается по короткой истории, а не по последним двум событиям: одиночный
 * интервал между `pointermove` шумит, и анимация после отпускания уезжает не с
 * той скоростью, с какой двигался палец. Виден шов между перетаскиванием и
 * анимацией — ровно то, что отличает «плавно» от «нормально».
 */
export function createVelocityTracker(windowMs = 100) {
  let samples: Sample[] = [];

  return {
    reset(value: number) {
      samples = [{ value, time: performance.now() }];
    },
    add(value: number) {
      const time = performance.now();
      samples.push({ value, time });
      const cutoff = time - windowMs * 2;
      if (samples.length > 12) samples = samples.filter((s) => s.time >= cutoff);
    },
    /** px/s. 0, если движения не было или оно остановилось. */
    velocity(): number {
      const now = performance.now();
      const recent = samples.filter((s) => now - s.time <= windowMs);
      if (recent.length < 2) return 0;
      const first = recent[0];
      const last = recent[recent.length - 1];
      const dt = (last.time - first.time) / 1000;
      if (dt <= 0) return 0;
      return (last.value - first.value) / dt;
    },
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   Анимация элемента
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Текущее — не целевое — положение элемента по Y.
 *
 * При перехвате анимации новое движение обязано стартовать от того, что сейчас
 * на экране (§3). Старт от логического значения даёт видимый скачок.
 */
export function currentTranslateY(el: HTMLElement): number {
  const t = new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return t.m42;
}

/**
 * Сдвиг по Y пружиной, с передачей скорости жеста.
 *
 * Начальное значение передаётся явно, а не берётся из элемента. Так требует §3
 * («анимировать от того, что сейчас на экране»), и так же обходится ловушка
 * Motion: подкомпоненты трансформа он читает из своего хранилища значений, а не
 * из inline-стиля. Если во время жеста положение писалось напрямую в
 * `style.transform`, Motion считает текущий `y` нулём — и анимация 0 → 0 просто
 * ничего не делает, оставляя элемент там, где его бросил палец.
 */
export function springY(
  el: HTMLElement,
  from: number,
  to: number,
  preset: SpringPreset = spring.default,
  velocity?: number
): AnimationPlaybackControls {
  return animate(el, { y: [from, to] }, springTransition(preset, velocity) as never);
}

/** То же для непрозрачности — затемнение под шторкой. */
export function springOpacity(
  el: HTMLElement,
  from: number,
  to: number,
  preset: SpringPreset = spring.default
): AnimationPlaybackControls {
  return animate(el, { opacity: [from, to] }, springTransition(preset) as never);
}

export { animate };
export type { AnimationPlaybackControls };
