/**
 * Базовый адрес API — единственное место, где он задаётся.
 *
 * Переопределяется переменной окружения NEXT_PUBLIC_API_BASE_URL
 * (для локальной разработки — http://localhost:3001/api в .env.local).
 *
 * Модуль намеренно не тянет axios и сторы: его импортируют в том числе
 * из lib/fcm.ts, который подключается в корневом layout.
 */
export const API_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  "https://workflow-back-zpk4.onrender.com/api";
