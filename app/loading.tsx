export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface animate-fade-in">
      {/* Logo centered */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center overflow-hidden shadow-elev-4 animate-fade-in-up">
          <img 
            src="/app-icon.png" 
            alt="Flow App Icon" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <span className="sr-only">Загрузка приложения...</span>
    </div>
  )
}
