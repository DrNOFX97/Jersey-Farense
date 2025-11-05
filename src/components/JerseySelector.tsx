import React from 'react';
import { JerseyData } from '@/types';

interface JerseySelectorProps {
  jerseys: JerseyData[];
  selectedJersey: JerseyData | null;
  onSelectJersey: (jersey: JerseyData | null) => void;
  onRandomJersey: () => void;
  loading: boolean;
  originalImage: string | null;
}

export const JerseySelector: React.FC<JerseySelectorProps> = ({
  jerseys,
  selectedJersey,
  onSelectJersey,
  onRandomJersey,
  loading,
  originalImage,
}) => {
  return (
    <section className="flex flex-col space-y-4">
      <h2 className="text-xl font-semibold text-gray-700">Selecionar Camisola</h2>
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="jersey-select" className="block text-sm font-medium text-gray-700 mb-2">
            Escolha uma camisola:
          </label>
          <select
            id="jersey-select"
            value={selectedJersey?.name || ''}
            onChange={(e) => {
              const selected = jerseys.find(j => j.name === e.target.value);
              onSelectJersey(selected || null);
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading || !originalImage}
          >
            <option value="">-- Selecione uma camisola --</option>
            {jerseys.map((jersey) => (
              <option key={jersey.name} value={jersey.name}>
                {jersey.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onRandomJersey}
            className="bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            disabled={loading || !originalImage || jerseys.length === 0}
            aria-live="polite"
            title="Selecionar camisola aleatória"
          >
            Aleatório
          </button>
        </div>
      </div>
    </section>
  );
};