import React from 'react';

interface ImageUploadProps {
  originalImage: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileSelect: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  originalImage,
  fileInputRef,
  handleFileChange,
  triggerFileSelect,
}) => {
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      onClick={triggerFileSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerFileSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Enviar ficheiro de imagem - clique ou prima Enter para selecionar"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        aria-label="Enviar ficheiro de imagem"
      />
      {originalImage ? (
        <img
          src={originalImage}
          alt="A sua imagem carregada para edição"
          className="max-h-64 object-contain mx-auto"
        />
      ) : (
        <p className="text-gray-500">Clique ou prima Enter para enviar uma imagem</p>
      )}
    </div>
  );
};