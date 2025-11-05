import React from 'react';

interface ResultDisplayProps {
  editedImage: string | null;
  loading: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ editedImage, loading }) => {
  return (
    <section className="w-full md:w-1/2 space-y-4 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">Resultado</h2>
      <div
        className="min-h-[300px] bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden relative"
        role="region"
        aria-label="Resultado da imagem gerada"
        aria-live="polite"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg">
            <svg
              className="animate-spin h-8 w-8 text-white mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>A gerar imagem...</span>
          </div>
        )}
        {editedImage ? (
          <img
            src={editedImage}
            alt="Imagem do resultado gerado"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          !loading && <p className="text-gray-500">A sua imagem editada aparecerá aqui</p>
        )}
      </div>
      {editedImage && (
        <a
          href={editedImage}
          download="camisola-farense.png"
          className="w-full block text-center bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
        >
          Descarregar Imagem
        </a>
      )}
    </section>
  );
};