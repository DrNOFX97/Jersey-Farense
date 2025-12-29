import { JerseyData, GeminiPart, GeminiResponse } from "@/types";
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

interface GeminiRequestPart {
  inlineData?: {
    data: string;
    mimeType: string;
  };
  text?: string;
}

interface GeminiRequestContent {
  parts: GeminiRequestPart[];
}

const buildPrompt = (selectedJersey: JerseyData): string => {
  const hasEmblem = !!selectedJersey.emblem;
  const emblemText = hasEmblem
    ? ', using the club emblem from the third image'
    : '';
  const stadiumPos = hasEmblem ? 'fourth' : 'third';
  const ballPos = hasEmblem ? 'fifth' : 'fourth';

  return `Create a professional football portrait using the person from the first image wearing the jersey from the second image${emblemText}, with the stadium background from the ${stadiumPos} image and the football from the ${ballPos} image.

CRITICAL - PRESERVE THE PERSON'S IDENTITY:
- Keep the EXACT same face from the first image
- If the person is bald or has a shaved head, keep them bald
- If the person has a beard, mustache, or any facial hair, keep it exactly as shown
- Maintain all facial features: eyes, nose, mouth, facial structure, skin tone, age
- Keep their exact hairstyle or lack of hair
- Preserve any distinctive features (wrinkles, freckles, scars)

CRITICAL - PRESERVE JERSEY DETAILS FROM SECOND IMAGE:
- Copy the EXACT jersey design: ${selectedJersey.description}
- Replicate the exact colors, stripes, patterns, and color blocks as shown
- Match the fabric texture and material appearance (knit pattern, sheen, weave)
- Include all sponsor logos, manufacturer logos, and text exactly as shown
- Preserve the collar style, sleeve design, and all trim details

EXTREMELY IMPORTANT - CLUB EMBLEM/CREST:
- The club emblem on the chest is the most critical detail${hasEmblem ? ' - use the separate high-resolution emblem image as a reference for design accuracy' : ''}
- Use the ${hasEmblem ? 'emblem reference to understand the exact design, then ' : ''}integrate it naturally onto the jersey as it would appear in the era
- The emblem should look like it's embroidered or printed on the fabric, not pasted on top
- Match the emblem design exactly: shape, colors (green "SCP", blue section with castle, white/black diagonal with golden lion), text, symbols, and border
- The emblem should have realistic fabric texture - it's part of the jersey, with natural shadows, folds, and fabric integration
- Position the emblem on the left chest as it would traditionally appear on a football jersey from that era
- The emblem must be clearly visible, accurately detailed, and feel authentic to the period
- If the emblem has text (like "SC FARENSE"), reproduce it exactly but integrate it naturally into the fabric

OUTFIT AND SETTING:
- Add black football shorts, black socks, and football boots
- Professional football portrait pose: standing upright with one foot resting on top of the football shown in the fourth image
- Background: Use the stadium from the third image (Estádio de São Luís) with the pitch's green grass visible
- The person looks confidently at the camera

STYLE:
- Professional sports photography aesthetic with sharp detail
- Natural daylight with flattering illumination
- Photorealistic and authentic
- High detail on both the face and the jersey fabric/emblem

The output must show the SAME person with the EXACT jersey details - identical face AND identical jersey design, emblem, and texture.`;
};

export const generateJerseyImage = async (originalImage: string, selectedJersey: JerseyData): Promise<string> => {
  const apiKey = getGeminiApiKey();

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

  let emblemBase64 = '';
  if (selectedJersey.emblem) {
    try {
      emblemBase64 = await urlToBase64(selectedJersey.emblem);
    } catch (err) {
      console.warn('Emblem image not found, continuing without it');
    }
  }
  const { data: emblemData, mimeType: emblemMimeType } = getBase64DataAndMimeType(emblemBase64);

  if (!imageData || !imageMimeType || !jerseyData || !jerseyMimeType) {
    throw new Error("Falha ao extrair dados da imagem ou camisola/tipo MIME.");
  }

  // Strategy: Put text first, then all reference images for Gemini 3 Pro
  const parts: GeminiRequestPart[] = [
    { text: buildPrompt(selectedJersey) },
    { inlineData: { data: imageData, mimeType: imageMimeType } },
    { inlineData: { data: jerseyData, mimeType: jerseyMimeType } },
  ];

  // Add emblem reference for accurate badge details
  if (emblemData && emblemMimeType) {
    parts.push({
      inlineData: { data: emblemData, mimeType: emblemMimeType }
    });
  }

  // Add stadium and ball references for authentic background
  if (stadiumData && stadiumMimeType) {
    parts.push({ inlineData: { data: stadiumData, mimeType: stadiumMimeType } });
  }

  if (ballData && ballMimeType) {
    parts.push({ inlineData: { data: ballData, mimeType: ballMimeType } });
  }

  try {
    console.log('Sending request to Gemini API with', parts.length, 'parts');

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: parts
        }
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
        temperature: 0.4,  // Lower temperature for more consistent/deterministic output
        topP: 0.8,         // Reduce randomness
        topK: 40           // Limit token selection for consistency
      }
    };

    console.log('Request body prepared');

    const makeRequest = async () => {
      // Using Gemini 3 Pro Image (Nano Banana Pro) - better identity preservation
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      return response.json();
    };

    const response = await withTimeout(makeRequest(), API_CONFIG.REQUEST_TIMEOUT_MS);

    console.log('Gemini API Response:', JSON.stringify(response, null, 2));

    // Validate API response structure
    if (!response?.candidates || response.candidates.length === 0) {
      console.error('API response missing candidates:', JSON.stringify(response, null, 2));
      throw new Error('Nenhuma imagem foi gerada pelo modelo.');
    }

    console.log('Candidates found:', response.candidates.length);
    console.log('First candidate:', JSON.stringify(response.candidates[0], null, 2));

    const generatedImagePart = response.candidates[0]?.content?.parts?.[0];

    console.log('Generated image part:', generatedImagePart ? 'Found' : 'Missing');
    console.log('Has inlineData?', generatedImagePart?.inlineData ? 'Yes' : 'No');
    console.log('Has data?', generatedImagePart?.inlineData?.data ? 'Yes' : 'No');

    // Validate image part structure
    if (!generatedImagePart?.inlineData?.data) {
      console.error('Image part missing inlineData:', JSON.stringify(generatedImagePart, null, 2));
      throw new Error('Nenhuma imagem foi gerada pelo modelo.');
    }

    // Fallback to 'image/png' if mimeType is missing
    const mimeType = generatedImagePart.inlineData.mimeType || 'image/png';

    return `data:${mimeType};base64,${generatedImagePart.inlineData.data}`;
  } catch (error) {
    console.error('Full error in generateJerseyImage:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Erro ao gerar imagem: ${String(error)}`);
  }
};