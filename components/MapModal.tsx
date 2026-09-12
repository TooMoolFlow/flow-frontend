import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import('@/app/map/MapView'), {
  ssr: false,
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapLocation: {
    lat: number;
    lon: number;
    accuracy: number;
  };
}

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  mapLocation,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Мобильная версия */}
      <div className="sm:hidden">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-[100]"
          onClick={onClose}
        >
          <div
            className="w-full h-[95vh] bg-card rounded-t-3xl flex flex-col shadow-elev-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок мобильной версии */}
            <div className="flex items-center justify-between p-4 border-b border-hairline">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground">
                  Локация заявки
                </h3>
                <p className="text-sm text-content-secondary mt-1">
                  Точное местоположение проблемы
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hit-44 press-sm h-8 w-8 p-0 hover:bg-surface-3 rounded-full flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Карта мобильной версии */}
            <div className="flex-1 relative">
              <React.Suspense fallback={
                <div className="w-full h-full bg-surface-3 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine mx-auto mb-3"></div>
                    <p className="text-sm text-content-secondary">Загрузка карты...</p>
                  </div>
                </div>
              }>
                <MapView 
                  lat={mapLocation.lat} 
                  lon={mapLocation.lon} 
                  accuracy={mapLocation.accuracy} 
                />
              </React.Suspense>
            </div>
            
            {/* Футер мобильной версии */}
            <div className="px-4 py-3 border-t border-hairline bg-surface-3/50">
              <div className="flex flex-col space-y-2">
                <div className="text-xs text-content-tertiary text-center">
                  Координаты: {mapLocation.lat.toFixed(6)}, {mapLocation.lon.toFixed(6)}
                  {mapLocation.accuracy && (
                    <span className="ml-2">±{mapLocation.accuracy}м</span>
                  )}
                </div>
                <Button 
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-marine to-brand-700 hover:from-marine-800 hover:to-brand-700 text-white py-2 text-sm"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Десктопная версия */}
      <div className="hidden sm:block">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={onClose}
        >
          <Card
            className="w-full max-w-5xl h-[90vh] max-h-[90vh] flex flex-col shadow-elev-4 border-0"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Локация заявки
                  </CardTitle>
                  <CardDescription className="text-sm text-content-secondary mt-1">
                    Точное местоположение проблемы
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hit-44 press-sm h-8 w-8 p-0 hover:bg-surface-3 rounded-full flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 overflow-hidden">
              <div className="w-full h-full relative">
                <React.Suspense fallback={
                  <div className="w-full h-full bg-surface-3 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-marine mx-auto mb-3"></div>
                      <p className="text-sm text-content-secondary">Загрузка карты...</p>
                    </div>
                  </div>
                }>
                  <MapView 
                    lat={mapLocation.lat} 
                    lon={mapLocation.lon} 
                    accuracy={mapLocation.accuracy} 
                  />
                </React.Suspense>
              </div>
            </CardContent>
            
            <div className="px-6 py-3 border-t border-hairline bg-surface-3/50">
              <div className="flex justify-between items-center">
                <div className="text-xs text-content-tertiary">
                  Координаты: {mapLocation.lat.toFixed(6)}, {mapLocation.lon.toFixed(6)}
                  {mapLocation.accuracy && (
                    <span className="ml-2">±{mapLocation.accuracy}м</span>
                  )}
                </div>
                <Button 
                  onClick={onClose}
                  className="bg-gradient-to-r from-marine to-brand-700 hover:from-marine-800 hover:to-brand-700 text-white px-4 py-2 text-sm"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
