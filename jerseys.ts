import { JerseyData } from './types';

export const FARENSE_JERSEYS: JerseyData[] = [
  {
    "name": "Farense 1981",
    "path": "/camisolas/1981.png",
    "description": "Camisola histórica do Farense de 1981"
  },
  {
    "name": "Farense 1983",
    "path": "/camisolas/1983.png",
    "description": "Camisola histórica do Farense de 1983"
  },
  {
    "name": "Farense 1988",
    "path": "/camisolas/1988.png",
    "description": "Camisola histórica do Farense de 1988"
  },
  {
    "name": "Farense 1989",
    "path": "/camisolas/1989.png",
    "description": "Camisola histórica do Farense de 1989"
  },
  {
    "name": "Farense 1990",
    "path": "/camisolas/1990.jpg",
    "description": "Camisola histórica do Farense de 1990"
  },
  {
    "name": "Farense 1994",
    "path": "/camisolas/1994.jpg",
    "description": "Camisola histórica do Farense de 1994"
  },
  {
    "name": "Farense 1997",
    "path": "/camisolas/1997.jpg",
    "description": "Camisola histórica do Farense de 1997"
  },
  {
    "name": "Farense 1998",
    "path": "/camisolas/1998.png",
    "description": "Camisola histórica do Farense de 1998"
  },
  {
    "name": "Farense 1999",
    "path": "/camisolas/1999.png",
    "description": "Camisola histórica do Farense de 1999"
  },
  {
    "name": "Farense 2000",
    "path": "/camisolas/2000.png",
    "description": "Camisola histórica do Farense de 2000"
  },
  {
    "name": "Farense 2002",
    "path": "/camisolas/2002.png",
    "description": "Camisola histórica do Farense de 2002"
  },
  {
    "name": "Farense 2003",
    "path": "/camisolas/2003.png",
    "description": "Camisola histórica do Farense de 2003"
  },
  {
    "name": "Farense 2013",
    "path": "/camisolas/2013.jpg",
    "description": "Camisola histórica do Farense de 2013"
  },
  {
    "name": "Farense 2014",
    "path": "/camisolas/2014.png",
    "description": "Camisola histórica do Farense de 2014"
  },
  {
    "name": "Farense 2015",
    "path": "/camisolas/2015.jpg",
    "description": "Camisola histórica do Farense de 2015"
  },
  {
    "name": "Farense 2021",
    "path": "/camisolas/2021.jpg",
    "description": "Camisola histórica do Farense de 2021"
  },
  {
    "name": "Farense 2024 - Principal",
    "path": "/camisolas/2024_1.jpg",
    "description": "Camisola do Farense de 2024"
  },
  {
    "name": "Farense 2024 - Alternativa",
    "path": "/camisolas/2024_2.jpg",
    "description": "Camisola do Farense de 2024"
  },
  {
    "name": "Farense 2025 - Principal",
    "path": "/camisolas/2025_1.jpg",
    "description": "Camisola do Farense de 2025"
  },
  {
    "name": "Farense 2025 - Alternativa",
    "path": "/camisolas/2025_2.jpg",
    "description": "Camisola do Farense de 2025"
  },
  {
    "name": "Farense 2025 - Alternativa 2",
    "path": "/camisolas/2025_3.jpg",
    "description": "Camisola do Farense de 2025"
  }
  }
];

export const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

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
