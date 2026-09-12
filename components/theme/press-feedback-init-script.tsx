/**
 * Включает `:active` на iOS Safari.
 *
 * Без хотя бы одного слушателя touchstart на документе Safari не применяет
 * `:active` к обычным элементам — обратная связь на нажатие просто не
 * появляется, и интерфейс читается как неотзывчивый (§1). Слушатель пустой и
 * passive, поэтому на прокрутку не влияет.
 *
 * Скрипт блокирующий и стоит в <head>: отклик должен работать с первого касания,
 * а не после гидратации.
 */
export function PressFeedbackInitScript() {
  const script = `document.addEventListener('touchstart',function(){},{passive:true});`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
