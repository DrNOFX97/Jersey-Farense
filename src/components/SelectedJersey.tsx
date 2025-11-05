import React from 'react';
import { JerseyData } from '@/types';

interface SelectedJerseyProps {
  selectedJersey: JerseyData | null;
}

export const SelectedJersey: React.FC<SelectedJerseyProps> = ({ selectedJersey }) => {
  if (!selectedJersey) return null;

  return (
    <article className="flex items-center space-x-4 p-4 border border-gray-200 rounded-md bg-blue-50">
      <img
        src={selectedJersey.path ? selectedJersey.path : selectedJersey.base64 || ''}
        alt={`Camisola selecionada: ${selectedJersey.name}`}
        className="h-20 w-20 object-contain"
      />
      {selectedJersey.ball && (
        <img
          src={selectedJersey.ball}
          alt={`Bola oficial para ${selectedJersey.name}`}
          className="h-20 w-20 object-contain"
        />
      )}
      <div className="flex-1">
        <p className="font-medium text-gray-800">{selectedJersey.name}</p>
        <p className="text-sm text-gray-600">{selectedJersey.description}</p>
      </div>
    </article>
  );
};