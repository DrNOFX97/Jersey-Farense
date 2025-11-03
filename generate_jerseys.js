const fs = require('fs');
const path = require('path');

// Read all JPG files from camisolas folder
const camisolasDir = './camisolas';
const files = fs.readdirSync(camisolasDir).filter(f => f.endsWith('.jpg'));

console.log(`Found ${files.length} jersey images`);

const jerseys = files.map((file, index) => {
  const filePath = path.join(camisolasDir, file);
  const imageBuffer = fs.readFileSync(filePath);
  const base64 = imageBuffer.toString('base64');

  return {
    name: `Farense Jersey ${index + 1}`,
    base64: `data:image/jpeg;base64,${base64}`,
    description: `Official Farense jersey design ${index + 1}`
  };
});

const constantsContent = `import { JerseyData } from './types';

// Base64 encoded images of Farense jerseys
export const FARENSE_JERSEYS: JerseyData[] = ${JSON.stringify(jerseys, null, 2)};
`;

fs.writeFileSync('./constants.ts', constantsContent);
console.log(`✅ Updated constants.ts with ${jerseys.length} jerseys`);
