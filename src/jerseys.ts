import { JerseyData } from './types';

export const FARENSE_JERSEYS: JerseyData[] = [
  {
    "name": "Farense 1981",
    "path": "/camisolas/1981.jpg",
    "description": "Camisola histórica do Farense de 1981",
    "ball": "/bolas/1982.webp"
  },
  {
    "name": "Farense 1983",
    "path": "/camisolas/1983.png",
    "description": "Camisola histórica do Farense de 1983",
    "ball": "/bolas/1982.webp"
  },
  {
    "name": "Farense 1988",
    "path": "/camisolas/1988.png",
    "description": "Camisola histórica do Farense de 1988",
    "ball": "/bolas/1986.webp"
  },
  {
    "name": "Farense 1989",
    "path": "/camisolas/1989.png",
    "description": "Camisola histórica do Farense de 1989",
    "ball": "/bolas/1990.webp"
  },
  {
    "name": "Farense 1990",
    "path": "/camisolas/1990.png",
    "description": "Camisola histórica do Farense de 1990",
    "ball": "/bolas/1990.webp"
  },
  {
    "name": "Farense 1994",
    "path": "/camisolas/1994.png",
    "description": "Camisola histórica do Farense de 1994",
    "ball": "/bolas/1994.webp"
  },
  {
    "name": "Farense 1997",
    "path": "/camisolas/1997.png",
    "description": "Camisola histórica do Farense de 1997",
    "ball": "/bolas/1994.webp"
  },
  {
    "name": "Farense 1998",
    "path": "/camisolas/1998.jpg",
    "description": "Camisola histórica do Farense de 1998",
    "ball": "/bolas/1994.webp"
  },
  {
    "name": "Farense 1999",
    "path": "/camisolas/1999.png",
    "description": "Camisola histórica do Farense de 1999",
    "ball": "/bolas/2002.webp"
  },
  {
    "name": "Farense 2000",
    "path": "/camisolas/2000.png",
    "description": "Camisola histórica do Farense de 2000",
    "ball": "/bolas/2002.webp"
  },
  {
    "name": "Farense 2002",
    "path": "/camisolas/2002.png",
    "description": "Camisola histórica do Farense de 2002",
    "ball": "/bolas/2002.webp"
  },
  {
    "name": "Farense 2003",
    "path": "/camisolas/2003.png",
    "description": "Camisola histórica do Farense de 2003",
    "ball": "/bolas/2002.webp"
  },
  {
    "name": "Farense 2013",
    "path": "/camisolas/2013.jpg",
    "description": "Camisola histórica do Farense de 2013",
    "ball": "/bolas/2014.webp"
  },
  {
    "name": "Farense 2014",
    "path": "/camisolas/2014.png",
    "description": "Camisola histórica do Farense de 2014",
    "ball": "/bolas/2014.webp"
  },
  {
    "name": "Farense 2015",
    "path": "/camisolas/2015.jpg",
    "description": "Camisola histórica do Farense de 2015",
    "ball": "/bolas/2014.webp"
  },
  {
    "name": "Farense 2021",
    "path": "/camisolas/2021.jpg",
    "description": "Camisola histórica do Farense de 2021",
    "ball": "/bolas/2014.webp"
  },
  {
    "name": "Farense 2024 - Principal",
    "path": "/camisolas/2024_1.jpg",
    "description": "Camisola do Farense de 2024",
    "ball": "/bolas/2014.webp"
  },
  {
    "name": "Farense 2024 - Alternativa",
    "path": "/camisolas/2024_2.jpg",
    "description": "Camisola do Farense de 2024",
    "ball": "/bolas/2014.webp"
  },
  {
    "name": "Farense 2025 - Principal",
    "path": "/camisolas/2025_1.jpg",
    "description": "Camisola do Farense de 2025",
    "ball": "/bolas/2014.webp"
  },
  {
    "name": "Farense 2025 - Alternativa",
    "path": "/camisolas/2025_2.jpg",
    "description": "Camisola do Farense de 2025",
    "ball": "/bolas/2014.webp"
  },
  {
    "name": "Farense 2025 - Alternativa 2",
    "path": "/camisolas/2025_3.jpg",
    "description": "Camisola do Farense de 2025",
    "ball": "/bolas/2014.webp"
  }
];

import { urlToBase64 } from '@/utils/imageUtils';

export const loadJerseys = async (): Promise<JerseyData[]> => {
  const jerseysWithBase64 = await Promise.all(
    FARENSE_JERSEYS.map(async (jersey) => {
      if (jersey.path) {
        try {
          const base64 = await urlToBase64(jersey.path);
          return { ...jersey, base64 };
        } catch (error) {
          console.error(`Failed to load image for ${jersey.name}:`, error);
          // Return jersey without base64 if loading fails
          return jersey;
        }
      }
      return jersey;
    })
  );
  console.log("Loaded jerseys:", jerseysWithBase64.map(j => j.name));
  return jerseysWithBase64;
};
