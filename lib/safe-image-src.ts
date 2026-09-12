/** Заглушка для картинок, которых нет или чей адрес непригоден. */
export const IMAGE_PLACEHOLDER = "/placeholder.svg";

/**
 * Приводит адрес картинки к виду, пригодному для next/image.
 *
 * next/image бросает исключение на некорректном src и роняет весь роут —
 * так, например, страница /meeting-rooms падала целиком из-за офиса,
 * у которого в поле photo лежала строка «photo». Данные приходят из БД
 * и могут быть любыми, поэтому адрес проверяется перед отрисовкой.
 *
 * Допустимы абсолютные http(s)-ссылки, пути от корня, data: и blob:.
 * Всё остальное заменяется заглушкой.
 */
export function safeImageSrc(
  src: unknown,
  fallback: string = IMAGE_PLACEHOLDER,
): string {
  if (typeof src !== "string") return fallback;

  const value = src.trim();
  if (!value) return fallback;

  if (value.startsWith("/") || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return fallback;
}
