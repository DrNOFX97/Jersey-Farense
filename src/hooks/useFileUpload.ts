import { useState, useRef } from 'react';
import { API_CONFIG } from '@/config';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const validateFileSize = (file: File): string | null => {
  const maxSizeBytes = API_CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Tamanho do ficheiro excede o limite de ${API_CONFIG.MAX_IMAGE_SIZE_MB}MB. Tamanho actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
  }
  return null;
};

const validateFileType = (file: File): string | null => {
  if (!API_CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return `Tipo de imagem não suportado. Tipos suportados: ${API_CONFIG.SUPPORTED_IMAGE_TYPES.join(', ')}`;
  }
  return null;
};

export const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    const sizeError = validateFileSize(file);
    if (sizeError) {
      setError(sizeError);
      return;
    }

    const typeError = validateFileType(file);
    if (typeError) {
      setError(typeError);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setSelectedFile(file);
      setOriginalImage(base64);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao ler o ficheiro. Tente novamente.';
      console.error('Erro ao processar ficheiro:', err);
      setError(`Falha ao ler o ficheiro: ${errorMessage}`);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return {
    selectedFile,
    originalImage,
    error,
    fileInputRef,
    handleFileChange,
    triggerFileSelect,
    setOriginalImage,
    setError
  };
};