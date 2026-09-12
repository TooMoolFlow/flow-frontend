import { COLOR_SCHEME_STORAGE_KEY } from "@/constants/mobile-theme";

/**
 * Блокирующий скрипт: ставит тему до гидратации, иначе первый кадр приезжает
 * в чужой схеме и страница мигает.
 *
 * Десктоп тёмный всегда — светлой версии у него нет. На мобильном схему
 * выбирает пользователь, по умолчанию тёмная.
 */
export function ColorSchemeInitScript() {
  const script = `
(function() {
  try {
    var scheme = 'dark';
    if (window.matchMedia('(max-width: 767px)').matches) {
      var raw = localStorage.getItem('${COLOR_SCHEME_STORAGE_KEY}');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.state && parsed.state.colorScheme) {
          scheme = parsed.state.colorScheme;
        }
      }
    }
    if (scheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
