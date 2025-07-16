import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
  taskTitle?: string;
}

export function PhotoGallery({ 
  photos, 
  isOpen, 
  onClose, 
  initialIndex = 0, 
  taskTitle = "Fotos da Tarefa" 
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photos[currentIndex];
    link.download = `foto-tarefa-${currentIndex + 1}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        prevPhoto();
        break;
      case 'ArrowRight':
        nextPhoto();
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Adicionar listener de teclado
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown as any);
      return () => document.removeEventListener('keydown', handleKeyDown as any);
    }
  }, [isOpen]);

  if (!isOpen || photos.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideCloseButton 
        className="max-w-4xl w-[95vw] h-auto max-h-[90vh] p-0 flex flex-col bg-card"
      >
        {/* Header */}
        <DialogHeader className="p-4 border-b flex-row items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-foreground">
              {taskTitle}
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
        </DialogHeader>

        {/* Área principal da imagem */}
        <div className="relative flex-grow flex items-center justify-center p-4 bg-muted/30 overflow-hidden">
          <img 
            src={photos[currentIndex]} 
            alt={`Foto ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onLoad={() => {
              // Preload próxima e anterior
              if (photos[currentIndex + 1]) {
                const img = new Image();
                img.src = photos[currentIndex + 1];
              }
              if (photos[currentIndex - 1]) {
                const img = new Image();
                img.src = photos[currentIndex - 1];
              }
            }}
          />

          {/* Botões de navegação */}
          {photos.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 text-foreground w-10 h-10 rounded-full"
                disabled={photos.length <= 1}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 text-foreground w-10 h-10 rounded-full"
                disabled={photos.length <= 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Footer com thumbnails */}
        {photos.length > 1 && (
          <DialogFooter className="p-4 border-t">
            <div className="w-full flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Foto {currentIndex + 1} de {photos.length}
              </span>
              <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                    }}
                    className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      index === currentIndex 
                        ? 'border-primary' 
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <img 
                      src={photo} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
} 