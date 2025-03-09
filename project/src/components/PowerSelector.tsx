import React from 'react';
import SelectFormField from './SelectFormField';
import { getPowerLimit } from '../utils/calculations/powerLimits';
import { useFinancialSettings } from '../contexts/FinancialSettingsContext';

interface PowerSelectorProps {
  value: number;
  onChange: (value: number) => void;
  typeCompteur: string;
}

export default function PowerSelector({ value, onChange, typeCompteur }: PowerSelectorProps) {
  const { settings } = useFinancialSettings();
  
  // Obtenir toutes les puissances disponibles, y compris les kits pro
  const allPowers = settings.installationPrices
    .map(p => p.power)
    .sort((a, b) => a - b);

  // Filtrer selon le type de compteur pour les puissances ≤ 9kWc
  const maxStandardPower = getPowerLimit(typeCompteur);
  const standardPowers = allPowers.filter(p => p <= maxStandardPower);
  
  // Ajouter les puissances pro sans limite de compteur
  const proPowers = allPowers.filter(p => p > 9);
  
  // Combiner les puissances
  const powerOptions = [
    ...standardPowers,
    ...proPowers
  ].map(power => ({
    value: power,
    label: `${power.toFixed(1)} kWc${power > 9 ? ' (Pro)' : ''}`
  }));

  return (
    <div className="space-y-2">
      <SelectFormField
        label="Puissance de l'installation"
        name="puissanceCrete"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        options={powerOptions}
        unit="kWc"
      />
      {typeCompteur === 'monophase' && value <= 9 && (
        <p className="text-sm text-gray-500">
          Limité à 6 kWc en monophasé
        </p>
      )}
      {value > 9 && (
        <p className="text-sm text-amber-500">
          Installation professionnelle - Paiement comptant uniquement
        </p>
      )}
    </div>
  );
}