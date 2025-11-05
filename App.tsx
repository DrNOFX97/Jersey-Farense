import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { loadJerseys, urlToBase64 } from './jerseys';
import { JerseyData } from './types';
import { getGeminiApiKey, API_CONFIG } from './config';

/**
 * Converts File to Base64 data URL
 * @param file - File to convert
 * @returns Promise resolving to base64 data URL
 * @throws Error if file reading fails
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extracts base64 data and MIME type from a base64 data URL
 * @param base64String - Base64 data URL string (e.g., "data:image/png;base64,...")
 * @returns Object with data and mimeType, or nulls if parsing fails
 */
const getBase64DataAndMimeType = (
  base64String: string | null
): { data: string | null; mimeType: string | null } => {
  if (!base64String) {
    return { data: null, mimeType: null };
  }
  const parts = base64String.split(';base64,');
  if (parts.length === 2) {
    return { data: parts[1], mimeType: parts[0].substring(5) };
  }
  return { data: null, mimeType: null };
};

/**
 * Validates file size against maximum allowed
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
const validateFileSize = (file: File): string | null => {
  const maxSizeBytes = API_CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size exceeds ${API_CONFIG.MAX_IMAGE_SIZE_MB}MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
  }
  return null;
};

/**
 * Validates file MIME type
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
const validateFileType = (file: File): string | null => {
  if (!API_CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return `Unsupported image type. Supported types: ${API_CONFIG.SUPPORTED_IMAGE_TYPES.join(', ')}`;
  }
  return null;
};

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJersey, setSelectedJersey] = useState<JerseyData | null>(null);
  const [jerseys, setJerseys] = useState<JerseyData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load jerseys dynamically on mount
  useEffect(() => {
    loadJerseys().then(loadedJerseys => {
      setJerseys(loadedJerseys);
    }).catch(err => {
      console.error('Error loading jerseys:', err);
      setError('Erro ao carregar as camisolas');
    });
  }, []);

  /**
   * Handles file selection with validation
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file size
    const sizeError = validateFileSize(file);
    if (sizeError) {
      setError(sizeError);
      return;
    }

    // Validate file type
    const typeError = validateFileType(file);
    if (typeError) {
      setError(typeError);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setEditedImage(null);
    };
    reader.onerror = () => {
      setError('Falha ao ler o ficheiro. Tente novamente.');
    };
    reader.readAsDataURL(file);
    setError(null);
  };


  /**
   * Creates a promise that rejects after specified timeout
   * Used to prevent hanging API requests
   */
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  };


  /**
   * Handles applying jersey to image via AI
   */
  const handleApplyJersey = async (): Promise<void> => {
    if (!originalImage || !selectedJersey) {
      setError('Por favor, carregue uma imagem e selecione uma camisola.');
      return;
    }
    setLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const apiKey = getGeminiApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const { data: imageData, mimeType: imageMimeType } = getBase64DataAndMimeType(originalImage);

      let jerseyBase64: string;
      if (selectedJersey.path) {
        jerseyBase64 = await urlToBase64(selectedJersey.path);
      } else if (selectedJersey.base64) {
        jerseyBase64 = selectedJersey.base64;
      } else {
        throw new Error('No image path or base64 data found for selected jersey.');
      }
      const { data: jerseyData, mimeType: jerseyMimeType } = getBase64DataAndMimeType(jerseyBase64);

      let stadiumBase64: string = '';
      try {
        stadiumBase64 = await urlToBase64('/camisolas/estadio.png');
      } catch (err) {
        console.warn('Stadium image not found, continuing without it');
      }
      const { data: stadiumData, mimeType: stadiumMimeType } = getBase64DataAndMimeType(stadiumBase64);

      let ballBase64: string = '';
      if (selectedJersey.ball) {
        try {
          ballBase64 = await urlToBase64(selectedJersey.ball);
        } catch (err) {
          console.warn('Ball image not found, continuing without it');
        }
      }
      const { data: ballData, mimeType: ballMimeType } = getBase64DataAndMimeType(ballBase64);

      if (!imageData || !imageMimeType || !jerseyData || !jerseyMimeType) {
        throw new Error("Falha ao extrair dados da imagem ou camisola/tipo MIME.");
      }

      const parts: any[] = [
        { inlineData: { data: imageData, mimeType: imageMimeType } },
        { inlineData: { data: jerseyData, mimeType: jerseyMimeType } },
      ];

      if (stadiumData && stadiumMimeType) {
        parts.push({ inlineData: { data: stadiumData, mimeType: stadiumMimeType } });
      }

      if (ballData && ballMimeType) {
        parts.push({ inlineData: { data: ballData, mimeType: ballMimeType } });
      }

      const promptText = `
      **Primary Goal: Create a photorealistic, full-body portrait of the person from the original image, wearing the Farense kit in the Estádio de São Luís.**

      **Non-Negotiable Rule: The person's face must be an exact, 100% perfect match to the original photo.** Do not alter, modify, or change their facial features in any way. The final image must be instantly recognizable as the same person.

      **Key Elements:**
      - **Outfit:** Wear the specified Farense jersey (${selectedJersey.description}), black shorts, black socks, and football boots.
      - **Pose:** Assume a natural, athletic pose of a professional football player on the pitch.
      - **Environment:** Place the person on the pitch at Estádio de São Luís, using the provided stadium image for the background. Include the correct football for the era.
      - **Quality:** The final image should be hyperrealistic, with a professional sports photography style.

      **Final Verification:** Before finishing, check if the face is identical to the original. If not, regenerate until it is perfect.
      `;

      parts.push({ text: promptText });

      const request = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { responseModalities: [Modality.IMAGE] },
      });

      const response = await withTimeout(request, API_CONFIG.REQUEST_TIMEOUT_MS);

      const generatedImagePart = response.candidates?.[0]?.content?.parts?.[0];
      if (generatedImagePart?.inlineData?.data) {
        const base64ImageBytes: string = generatedImagePart.inlineData.data;
        const imageUrl = `data:${generatedImagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        setEditedImage(imageUrl);
      } else {
        throw new Error('Nenhuma imagem foi gerada pelo modelo.');
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error applying jersey:', error);
      setError(`Falha ao aplicar a camisola: ${error.message}. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles random jersey selection
   */
  const handleRandomJersey = (): void => {
    if (jerseys.length > 0) {
      const randomIndex = Math.floor(Math.random() * jerseys.length);
      setSelectedJersey(jerseys[randomIndex]);
    } else {
      setError("Nenhuma camisola do Farense disponível.");
    }
  };

  /**
   * Auto-select random jersey when image is uploaded
   */
  useEffect(() => {
    if (originalImage && !selectedJersey && jerseys.length > 0) {
      handleRandomJersey();
    }
  }, [originalImage, selectedJersey, jerseys]);


  return (
    <main className="flex flex-col md:flex-row gap-6 p-4 min-h-screen bg-gray-50">
      <section className="w-full md:w-1/2 space-y-4 bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Quero uma camisola do Farense</h1>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
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

        <section className="flex flex-col space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Selecionar Camisola</h2>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="jersey-select" className="block text-sm font-medium text-gray-700 mb-2">
                Escolha uma camisola:
              </label>
              <select
                id="jersey-select"
                value={selectedJersey?.name || ''}
                onChange={(e) => {
                  const selected = jerseys.find(j => j.name === e.target.value);
                  setSelectedJersey(selected || null);
                }}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading || !originalImage}
              >
                <option value="">-- Selecione uma camisola --</option>
                {jerseys.map((jersey) => (
                  <option key={jersey.name} value={jersey.name}>
                    {jersey.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRandomJersey}
                className="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                disabled={loading || !originalImage || jerseys.length === 0}
                aria-live="polite"
                title="Selecionar camisola aleatória"
              >
                Aleatório
              </button>
            </div>
          </div>

          {selectedJersey && (
            <article className="flex items-center space-x-4 p-4 border border-gray-200 rounded-md bg-blue-50">
              <img
                src={selectedJersey.path ? selectedJersey.path : selectedJersey.base64 || ''}
                alt={`Camisola selecionada: ${selectedJersey.name}`}
                className="h-20 w-20 object-contain"
              />
              {selectedJersey.ball && (
                <img
                  src={selectedJersey.ball}
                  alt={`Bola oficial para ${selectedJersey.name}`}
                  className="h-20 w-20 object-contain"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-800">{selectedJersey.name}</p>
                <p className="text-sm text-gray-600">{selectedJersey.description}</p>
              </div>
            </article>
          )}

          <button
            onClick={handleApplyJersey}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            disabled={loading || !originalImage || !selectedJersey}
            aria-live="polite"
            aria-busy={loading && !!selectedJersey}
          >
            {loading && selectedJersey ? 'A trocar camisola...' : 'Aplicar Camisola'}
          </button>
        </section>

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
            !loading && (
              <p className="text-gray-500">A sua imagem editada aparecerá aqui</p>
            )
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
    </main>
  );
};

export default App;