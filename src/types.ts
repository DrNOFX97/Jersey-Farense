/**
 * Jersey data structure for Farense soccer jerseys
 */
export interface JerseyData {
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
}
