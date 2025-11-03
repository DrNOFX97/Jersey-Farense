/**
 * Jersey data structure for Farense soccer jerseys
 */
export interface JerseyData {
  /** Jersey display name */
  name: string;
  /** Base64 encoded jersey image */
  base64: string;
  /** Jersey description */
  description: string;
}
