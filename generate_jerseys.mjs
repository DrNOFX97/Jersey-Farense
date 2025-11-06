import fs from 'fs';
import path from 'path';

const jerseysDir = path.join('public', 'camisolas');
const ballsDir = path.join('public', 'bolas');
const outputFile = path.join('src', 'jerseys.ts');

const getYearFromFilename = (filename) => {
  const match = filename.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
};

const findClosestBall = (jerseyYear, ballYears) => {
  if (!jerseyYear || ballYears.length === 0) return null;

  let closestYear = null;
  let minDiff = Infinity;

  for (const ballYear of ballYears) {
    const diff = Math.abs(jerseyYear - ballYear);
    if (diff < minDiff) {
      minDiff = diff;
      closestYear = ballYear;
    } else if (diff === minDiff && ballYear > closestYear) {
      // Prefer the later year in case of a tie
      closestYear = ballYear;
    }
  }
  return closestYear;
};

try {
  const jerseyFiles = fs.readdirSync(jerseysDir);
  const ballFiles = fs.readdirSync(ballsDir);

  const ballYears = ballFiles.map(getYearFromFilename).filter(Boolean).sort((a, b) => a - b);

  const jerseysData = jerseyFiles
    .map(file => {
      const year = getYearFromFilename(file);
      if (!year) return null;

      const closestBallYear = findClosestBall(year, ballYears);
      const ballFile = ballFiles.find(bFile => bFile.startsWith(String(closestBallYear)));

      const name = `Farense ${file.replace(/\.(jpg|png)$/, '')}`;
      const description = `Camisola histórica do Farense de ${year}`;

      return {
        name,
        path: `/camisolas/${file}`,
        description,
        ball: ballFile ? `/bolas/${ballFile}` : undefined,
      };
    })
    .filter(Boolean)
    .sort((a, b) => getYearFromFilename(a.path) - getYearFromFilename(b.path));

  const fileContent = `
import { JerseyData } from './types';

export const FARENSE_JERSEYS: JerseyData[] = ${JSON.stringify(jerseysData, null, 2)};

// The rest of the file (loadJerseys function) remains the same for now.
// We can refactor it later if needed.
import { urlToBase64 } from '@/utils/imageUtils';

export const loadJerseys = async (): Promise<JerseyData[]> => {
  const jerseysWithBase64 = await Promise.all(
    FARENSE_JERSEYS.map(async (jersey) => {
      if (jersey.path) {
        try {
          const base64 = await urlToBase64(jersey.path);
          return { ...jersey, base64 };
        } catch (error) {
          console.error(\`Failed to load image for \${jersey.name}:\`, error);
          return jersey;
        }
      }
      return jersey;
    })
  );
  console.log("Loaded jerseys:", jerseysWithBase64.map(j => j.name));
  return jerseysWithBase64;
};
  `;

  fs.writeFileSync(outputFile, fileContent.trim());
  console.log(`Successfully generated ${outputFile} with ${jerseysData.length} jerseys.`);

} catch (error) {
  console.error('Error generating jerseys file:', error);
}
