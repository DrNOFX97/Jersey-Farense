/**
 * Jersey data structure for Farense soccer jerseys
 */
export interface JerseyData {
  /** Unique identifier for the jersey */
  id?: string;
  /** Jersey display name */
  name: string;
  /** Base64 encoded jersey image */
  base64?: string;
  /** Path to jersey image */
  path?: string;
  /** Jersey description */
  description: string;
  /** Path to the official ball for the season */
  ball?: string;
  /** Path to the club emblem/badge for this jersey */
  emblem?: string;
  /** Error state if image failed to load */
  loadError?: boolean;
}

/**
 * Gemini API response part structure
 */
export interface GeminiPart {
  inlineData?: {
    data: string;
    mimeType: string;
  };
  text?: string;
}

/**
 * Gemini API response content structure
 */
export interface GeminiContent {
  parts: GeminiPart[];
}

/**
 * Gemini API candidate structure
 */
export interface GeminiCandidate {
  content: GeminiContent;
  finishReason?: string;
}

/**
 * Full Gemini API response structure
 */
export interface GeminiResponse {
  candidates: GeminiCandidate[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}
