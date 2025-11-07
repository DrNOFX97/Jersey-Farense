import { GoogleGenAI, Modality } from "@google/genai";
import { JerseyData } from "@/types";
import { getGeminiApiKey, API_CONFIG } from "@/config";
import { urlToBase64 } from "@/utils/imageUtils";

const getBase64DataAndMimeType = (base64String: string | null): { data: string | null; mimeType: string | null } => {
  if (!base64String) return { data: null, mimeType: null };
  const parts = base64String.split(';base64,');
  if (parts.length === 2) return { data: parts[1], mimeType: parts[0].substring(5) };
  return { data: null, mimeType: null };
};

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)),
  ]);
};

const buildPrompt = (selectedJersey: JerseyData): string => {
  return `
    **Primary Directive (Absolute Priority):**
    1.  **Preserve Facial Identity:** The face of the person in the generated image must be an exact, 100% identical replica of the face in the uploaded photo. This is the most important rule and overrides all other instructions. Do not alter, modify, or regenerate the face.

    **Secondary Task:**
    With the primary directive fulfilled, create a **realistic** image of the person in a full-body athletic pose on the pitch at Estádio de São Luís.

    **Image Elements:**
    - **Outfit:** The person must be wearing the provided Farense jersey (${selectedJersey.description}), along with black shorts, black socks, and football boots.
    - **Environment:** Use the provided stadium image for the background and include the correct football for the era.
    - **Style:** The final image should have the aesthetic of a professional sports photograph.
  `;
};

export const generateJerseyImage = async (originalImage: string, selectedJersey: JerseyData): Promise<string> => {
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const { data: imageData, mimeType: imageMimeType } = getBase64DataAndMimeType(originalImage);

  const jerseyBase64 = selectedJersey.path ? await urlToBase64(selectedJersey.path) : selectedJersey.base64 || '';
  const { data: jerseyData, mimeType: jerseyMimeType } = getBase64DataAndMimeType(jerseyBase64);

  let stadiumBase64 = '';
  try {
    stadiumBase64 = await urlToBase64('/camisolas/estadio.png');
  } catch (err) {
    console.warn('Stadium image not found, continuing without it');
  }
  const { data: stadiumData, mimeType: stadiumMimeType } = getBase64DataAndMimeType(stadiumBase64);

  let ballBase64 = '';
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

  parts.push({ text: buildPrompt(selectedJersey) });

  const request = ai.models.generateContent({
    model: 'models/gemini-2.5-flash-image',
    contents: { parts },
    config: { responseModalities: [Modality.IMAGE] },
  });

  const response = await withTimeout(request, API_CONFIG.REQUEST_TIMEOUT_MS);

  const generatedImagePart = response.candidates?.[0]?.content?.parts?.[0];
  if (generatedImagePart?.inlineData?.data) {
    return `data:${generatedImagePart.inlineData.mimeType};base64,${generatedImagePart.inlineData.data}`;
  } else {
    throw new Error('Nenhuma imagem foi gerada pelo modelo.');
  }
};