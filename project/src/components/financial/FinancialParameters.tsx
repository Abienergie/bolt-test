import React, { useState, useEffect } from 'react';
import { FinancialParameters as Parameters } from '../../types/financial';
import FormField from '../FormField';
import FormFieldWithTooltip from '../FormFieldWithTooltip';
import { getPriceFromPower, calculateFinalPrice } from '../../utils/calculations/priceCalculator';
import { formatCurrency } from '../../utils/formatters';
import Tooltip from '../Tooltip';
import { Info } from 'lucide-react';
import { useFinancialSettings } from '../../contexts/FinancialSettingsContext';

interface FinancialParametersProps {
  parameters: Parameters;
  onParameterChange: (updates: Partial<Parameters>) => void;
  puissanceCrete: number;
}

export default function FinancialParameters({ 
  parameters, 
  onParameterChange,
  puissanceCrete
}: FinancialParametersProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { settings } = useFinancialSettings();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue = parseFloat(value);

    // Application des limites
    switch (name) {
      case 'remiseCommerciale':
        parsedValue = Math.min(Math.max(0, parsedValue), 10); // Max 10%
        break;
      case 'revalorisationEnergie':
        parsedValue = Math.min(Math.max(0, parsedValue), 10); // Max 10%
        break;
      case 'indexationProduction':
        parsedValue = Math.min(Math.max(-5, parsedValue), 3); // Max 3%
        break;
    }

    onParameterChange({ [name]: parsedValue });
  };

  const basePrice = getPriceFromPower(puissanceCrete);
  const remiseAmount = (basePrice * parameters.remiseCommerciale) / 100;
  const priceAfterRemise = basePrice - remiseAmount;
  const finalPrice = calculateFinalPrice(
    puissanceCrete,
    parameters.primeAutoconsommation,
    parameters.remiseCommerciale
  );

  // Formater la date des primes de manière sécurisée
  let formattedSubsidyDate = '';
  let formattedSellPriceDate = '';
  try {
    if (settings.subsidyDate) {
      const subsidyDate = new Date(settings.subsidyDate);
      if (!isNaN(subsidyDate.getTime())) {
        formattedSubsidyDate = new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(subsidyDate);
      }
    }
    if (settings.sellPriceDate) {
      const sellPriceDate = new Date(settings.sellPriceDate);
      if (!isNaN(sellPriceDate.getTime())) {
        formattedSellPriceDate = new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(sellPriceDate);
      }
    }
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    formattedSubsidyDate = 'Date non disponible';
    formattedSellPriceDate = 'Date non disponible';
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Paramètres financiers</h3>
      
      <div className="grid grid-cols-1 gap-6">
        {parameters.financingMode === 'cash' && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">Prix de base TTC</span>
              <span className="font-semibold">{formatCurrency(basePrice)}</span>
            </div>
            
            <div className="space-y-4">
              <FormField
                label="Remise commerciale"
                name="remiseCommerciale"
                value={parameters.remiseCommerciale}
                onChange={handleChange}
                min={0}
                max={10}
                step={1}
                unit="%"
              />

              {parameters.remiseCommerciale > 0 && (
                <div className="flex justify-between items-center text-gray-700">
                  <span>Prix TTC remisé</span>
                  <span className="font-semibold">{formatCurrency(priceAfterRemise)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Prime à l'autoconsommation</span>
                  <Tooltip content={`Prime en vigueur au ${formattedSubsidyDate} pour les installations en autoconsommation avec revente de surplus`}>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
                <span className="font-semibold text-green-600">
                  {formatCurrency(parameters.primeAutoconsommation)}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-gray-700">Prix final TTC</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(finalPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            label="Prix du kWh"
            name="prixKwh"
            value={parameters.prixKwh}
            onChange={handleChange}
            min={0}
            max={1}
            step={0.01}
            unit="€/kWh"
          />

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Tarif de revente
              </label>
              <div className="relative">
                <Info 
                  className="h-4 w-4 text-gray-400 cursor-help"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                  <div className="absolute z-10 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg -right-2 top-6">
                    <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
                    <p>Tarif en vigueur au {formattedSellPriceDate} pour les installations en autoconsommation avec revente de surplus inférieures à 9kWc</p>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                name="tarifRevente"
                value={parameters.tarifRevente}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm focus:border-gray-300 focus:ring-0 cursor-not-allowed disabled:bg-gray-100"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">€/kWh</span>
              </div>
            </div>
          </div>

          <FormField
            label="Niveau d'autoconsommation"
            name="autoconsommation"
            value={parameters.autoconsommation}
            onChange={handleChange}
            min={0}
            max={100}
            unit="%"
          />

          <FormField
            label="Revalorisation annuelle"
            name="revalorisationEnergie"
            value={parameters.revalorisationEnergie}
            onChange={handleChange}
            min={0}
            max={10}
            unit="%"
          />

          <FormFieldWithTooltip
            label="Indexation revente"
            name="indexationProduction"
            value={parameters.indexationProduction}
            onChange={handleChange}
            min={-5}
            max={3}
            step={0.1}
            unit="%"
            tooltipContent="Évolution annuelle du tarif de revente de l'électricité"
          />

          <FormFieldWithTooltip
            label="Dégradation panneaux"
            name="degradationPanneau"
            value={parameters.degradationPanneau}
            onChange={handleChange}
            min={-2}
            max={0}
            step={0.1}
            unit="%"
            tooltipContent="Dégradation annuelle de la production des panneaux solaires (-0.2% par défaut)"
          />
        </div>
      </div>
    </div>
  );
}