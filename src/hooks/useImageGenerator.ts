import { useState } from 'react';
import { JerseyData } from '@/types';
import { generateJerseyImage } from '@/services/geminiService';

export const useImageGenerator = () => {
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyJersey = async (originalImage: string | null, selectedJersey: JerseyData | null) => {
    if (!originalImage || !selectedJersey) {
      setError('Por favor, carregue uma imagem e selecione uma camisola.');
      return;
    }

    setLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const imageUrl = await generateJerseyImage(originalImage, selectedJersey);
      setEditedImage(imageUrl);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error applying jersey:', error);
      setError(`Falha ao aplicar a camisola: ${error.message}. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  return { editedImage, loading, error, handleApplyJersey, setEditedImage };
};