import { JerseyData } from './types';

/**
 * Dynamically load jersey images from the camisolas folder
 * Prioritizes PNG files (better quality), falls back to JPG
 */
export async function loadJerseys(): Promise<JerseyData[]> {
  const jerseyFiles = [
    { file: '1981.png', year: '1981' },
    { file: '1985.jpg', year: '1985' },
    { file: '1988.jpg', year: '1988' },
    { file: '1989.png', year: '1989' },
    { file: '1990.jpg', year: '1990' },
    { file: '1995.jpg', year: '1995' },
    { file: '1996.jpg', year: '1996' },
    { file: '1997.jpg', year: '1997' },
    { file: '1999.png', year: '1999' },
    { file: '2000.jpg', year: '2000' },
    { file: '2002.png', year: '2002' },
    { file: '2003.png', year: '2003' },
    { file: '2013.jpg', year: '2013' },
    { file: '2014.png', year: '2014' },
    { file: '2015.jpg', year: '2015' },
    { file: '2021.jpg', year: '2021' },
    { file: '2024_1.jpg', year: '2024', variant: 'Principal' },
    { file: '2024_2.jpg', year: '2024', variant: 'Alternativa' },
    { file: '2025_1.jpg', year: '2025', variant: 'Principal' },
    { file: '2025_2.jpg', year: '2025', variant: 'Alternativa' },
    { file: '2025_3.jpg', year: '2025', variant: 'Terceira' }
  ];

  const jerseys: JerseyData[] = jerseyFiles.map((item) => {
    let jerseyName = `Farense ${item.year}`;
    let description = `Camisola histórica do Farense de ${item.year}`;

    if (item.variant) {
      jerseyName = `Farense ${item.year} - ${item.variant}`;
      description = `Camisola ${item.variant.toLowerCase()} do Farense de ${item.year}`;
    }

    // Add timestamp to URL to prevent caching
    const timestamp = new Date().getTime();
    const imageUrl = `/camisolas/${item.file}?t=${timestamp}`;

    return {
      name: jerseyName,
      base64: imageUrl, // Using the URL as base64 field for compatibility
      description: description
    };
  });

  return jerseys;
}

/**
 * Utility to convert image URL to base64
 */
export async function urlToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
