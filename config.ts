/**
 * Configuration file for API and environment variables
 * Centralizes all environment variable access for security
 */

/**
 * Get the Gemini API key from environment variables
 * Falls back to undefined if not set, preventing API calls without proper configuration
 */
export const getGeminiApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file. ' +
      'Get your API key from https://aistudio.google.com/app/apikey'
    );
  }

  return apiKey;
};

/**
 * Constants for request configuration
 */
export const API_CONFIG = {
  REQUEST_TIMEOUT_MS: 60000, // 60 seconds timeout for image generation
  MAX_IMAGE_SIZE_MB: 20, // Maximum upload file size
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};
