import { useState, useCallback, useEffect } from 'react';
import { FinancialParameters, FinancialProjection } from '../types/financial';
import { generateFinancialProjection } from '../utils/calculations/financialProjection';
import { useFinancialSettings } from '../contexts/FinancialSettingsContext';

export function useFinancialProjection() {
  const { settings } = useFinancialSettings();
  const [parameters, setParameters] = useState<FinancialParameters>(() => ({
    financingMode: 'subscription',
    prixKwh: settings.baseKwhPrice,
    tarifRevente: settings.baseSellPrice,
    autoconsommation: settings.defaultAutoconsumption,
    revalorisationEnergie: settings.defaultEnergyRevaluation,
    indexationProduction: settings.defaultSellIndexation,
    degradationPanneau: settings.defaultPanelDegradation,
    dureeAbonnement: 20,
    primeAutoconsommation: 0,
    remiseCommerciale: 0
  }));
  const [projection, setProjection] = useState<FinancialProjection | null>(null);

  // Mettre à jour les paramètres quand les paramètres financiers changent
  useEffect(() => {
    setParameters(prev => ({
      ...prev,
      prixKwh: settings.baseKwhPrice,
      tarifRevente: settings.baseSellPrice,
      autoconsommation: settings.defaultAutoconsumption,
      revalorisationEnergie: settings.defaultEnergyRevaluation,
      indexationProduction: settings.defaultSellIndexation,
      degradationPanneau: settings.defaultPanelDegradation
    }));
  }, [settings]);

  // Écouter les changements de paramètres financiers
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent<FinancialParameters>) => {
      setParameters(prev => ({
        ...prev,
        ...event.detail
      }));
    };

    window.addEventListener('financialSettingsUpdated', handleSettingsUpdate as EventListener);
    return () => {
      window.removeEventListener('financialSettingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);

  const updateParameters = useCallback((updates: Partial<FinancialParameters>) => {
    setParameters(prev => ({ ...prev, ...updates }));
  }, []);

  const calculateProjection = useCallback((productionAnnuelle: number, puissanceCrete: number) => {
    const newProjection = generateFinancialProjection(
      parameters,
      productionAnnuelle,
      puissanceCrete
    );
    setProjection(newProjection);
  }, [parameters]);

  return {
    parameters,
    projection,
    updateParameters,
    calculateProjection
  };
}