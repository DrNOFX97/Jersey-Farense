import React, { useState, useEffect } from 'react';
import { JerseyData } from '@/types';
import { useJerseys } from '@/hooks/useJerseys';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useImageGenerator } from '@/hooks/useImageGenerator';
import { ImageUpload } from '@/components/ImageUpload';
import { JerseySelector } from '@/components/JerseySelector';
import { SelectedJersey } from '@/components/SelectedJersey';
import { ResultDisplay } from '@/components/ResultDisplay';

const App: React.FC = () => {
  const { jerseys, error: jerseysError } = useJerseys();
  const {
    originalImage,
    fileInputRef,
    handleFileChange,
    triggerFileSelect,
    error: fileError,
    setError: setFileError,
    setOriginalImage,
  } = useFileUpload();
  const { editedImage, loading, error: generatorError, handleApplyJersey, setEditedImage } = useImageGenerator();

  const [selectedJersey, setSelectedJersey] = useState<JerseyData | null>(null);

  const handleRandomJersey = () => {
    if (jerseys.length > 0) {
      const randomIndex = Math.floor(Math.random() * jerseys.length);
      setSelectedJersey(jerseys[randomIndex]);
    }
  };

  useEffect(() => {
    if (originalImage && !selectedJersey && jerseys.length > 0) {
      handleRandomJersey();
    }
  }, [originalImage, selectedJersey, jerseys]);

  useEffect(() => {
    if (originalImage) {
      setEditedImage(null);
    }
  }, [originalImage]);

  const error = jerseysError || fileError || generatorError;

  return (
    <main className="flex flex-col md:flex-row gap-6 p-4 min-h-screen bg-gray-50">
      <section className="w-full md:w-1/2 space-y-4 bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Quero uma camisola do Farense</h1>
        <ImageUpload
          originalImage={originalImage}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          triggerFileSelect={triggerFileSelect}
        />
        <JerseySelector
          jerseys={jerseys}
          selectedJersey={selectedJersey}
          onSelectJersey={setSelectedJersey}
          onRandomJersey={handleRandomJersey}
          loading={loading}
          originalImage={originalImage}
        />
        <SelectedJersey selectedJersey={selectedJersey} />
        <button
          onClick={() => handleApplyJersey(originalImage, selectedJersey)}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          disabled={loading || !originalImage || !selectedJersey}
          aria-live="polite"
          aria-busy={loading && !!selectedJersey}
        >
          {loading ? 'A trocar camisola...' : 'Aplicar Camisola'}
        </button>
        {error && (
          <div
            className="text-red-700 p-3 bg-red-100 border border-red-300 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            <strong>Erro:</strong> {error}
          </div>
        )}
      </section>
      <ResultDisplay editedImage={editedImage} loading={loading} />
    </main>
  );
};

export default App;