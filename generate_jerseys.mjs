import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read all JPG files from camisolas folder
const camisolasDir = path.join(__dirname, 'camisolas');
const files = fs.readdirSync(camisolasDir).filter(f => f.endsWith('.jpg')).sort();

console.log(`Found ${files.length} jersey images`);

const jerseys = files.map((file) => {
  const filePath = path.join(camisolasDir, file);
  const imageBuffer = fs.readFileSync(filePath);
  const base64 = imageBuffer.toString('base64');

  // Extract year and variant from filename
  const yearMatch = file.match(/(\d{4})(?:_(\d))?/);
  const year = yearMatch ? yearMatch[1] : 'Unknown';
  const variant = yearMatch && yearMatch[2] ? yearMatch[2] : '';

  // Create a descriptive name based on year and variant
  let jerseyName = `Farense ${year}`;
  let description = `Camisola histórica do Farense de ${year}`;

  if (variant) {
    const variantNames = {
      '1': 'Principal',
      '2': 'Alternativa',
      '3': 'Terceira'
    };
    const variantName = variantNames[variant] || `Variante ${variant}`;
    jerseyName = `Farense ${year} - ${variantName}`;
    description = `Camisola ${variantName.toLowerCase()} do Farense de ${year}`;
  }

  return {
    name: jerseyName,
    base64: `data:image/jpeg;base64,${base64}`,
    description: description
  };
});

const constantsContent = `import { JerseyData } from './types';

// Base64 encoded images of Farense jerseys - organized by year
export const FARENSE_JERSEYS: JerseyData[] = ${JSON.stringify(jerseys, null, 2)};
`;

const outputPath = path.join(__dirname, 'constants.ts');
fs.writeFileSync(outputPath, constantsContent);
console.log(`✅ Updated constants.ts with ${jerseys.length} jerseys`);
console.log('Jersey names:');
jerseys.forEach((j, i) => console.log(`  ${i + 1}. ${j.name}`));
