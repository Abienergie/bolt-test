import React, { createContext, useContext, useState } from 'react';

interface InstallationPrice {
  power: number;
  price: number;
}

interface FinancialSettings {
  baseKwhPrice: number;
  baseSellPrice: number;
  sellPriceDate: string;
  defaultAutoconsumption: number;
  defaultEnergyRevaluation: number;
  defaultSellIndexation: number;
  defaultPanelDegradation: number;
  installationPrices: InstallationPrice[];
  defaultSubsidyUnder3kw: number;
  defaultSubsidyOver3kw: number;
  defaultSubsidy9to36kw: number;
  defaultSubsidy36to100kw: number;
  subsidyDate: string;
}

interface FinancialSettingsContextType {
  settings: FinancialSettings;
  updateSettings: (updates: Partial<FinancialSettings>) => void;
  addInstallationPrice: (power: number, price: number) => void;
  removeInstallationPrice: (power: number) => void;
}

const DEFAULT_INSTALLATION_PRICES: InstallationPrice[] = [
  { power: 2.5, price: 6890 },
  { power: 3.0, price: 7890 },
  { power: 3.5, price: 8890 },
  { power: 4.0, price: 9890 },
  { power: 4.5, price: 10890 },
  { power: 5.0, price: 11890 },
  { power: 5.5, price: 12890 },
  { power: 6.0, price: 14890 },
  { power: 6.5, price: 15890 },
  { power: 7.0, price: 16890 },
  { power: 7.5, price: 17890 },
  { power: 8.0, price: 18890 },
  { power: 8.5, price: 19890 },
  { power: 9.0, price: 19890 }
];

const DEFAULT_SETTINGS: FinancialSettings = {
  baseKwhPrice: 0.25,
  baseSellPrice: 0.1269,
  sellPriceDate: '2025-01-01',
  defaultAutoconsumption: 75,
  defaultEnergyRevaluation: 7,
  defaultSellIndexation: 2,
  defaultPanelDegradation: -0.2,
  installationPrices: DEFAULT_INSTALLATION_PRICES,
  defaultSubsidyUnder3kw: 220,
  defaultSubsidyOver3kw: 160,
  defaultSubsidy9to36kw: 110,
  defaultSubsidy36to100kw: 80,
  subsidyDate: '2025-01-01'
};

const FinancialSettingsContext = createContext<FinancialSettingsContextType | undefined>(undefined);

export function FinancialSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<FinancialSettings>(() => {
    try {
      // Charger les paramètres sauvegardés
      const savedSettings = {
        ...DEFAULT_SETTINGS,
        baseKwhPrice: parseFloat(localStorage.getItem('base_kwh_price') || DEFAULT_SETTINGS.baseKwhPrice.toString()),
        baseSellPrice: parseFloat(localStorage.getItem('base_sell_price') || DEFAULT_SETTINGS.baseSellPrice.toString()),
        sellPriceDate: localStorage.getItem('sell_price_date') || DEFAULT_SETTINGS.sellPriceDate,
        defaultAutoconsumption: parseFloat(localStorage.getItem('default_autoconsumption') || DEFAULT_SETTINGS.defaultAutoconsumption.toString()),
        defaultEnergyRevaluation: parseFloat(localStorage.getItem('default_energy_revaluation') || DEFAULT_SETTINGS.defaultEnergyRevaluation.toString()),
        defaultSellIndexation: parseFloat(localStorage.getItem('default_sell_indexation') || DEFAULT_SETTINGS.defaultSellIndexation.toString()),
        defaultPanelDegradation: parseFloat(localStorage.getItem('default_panel_degradation') || DEFAULT_SETTINGS.defaultPanelDegradation.toString()),
        defaultSubsidyUnder3kw: parseFloat(localStorage.getItem('default_subsidy_under_3kw') || DEFAULT_SETTINGS.defaultSubsidyUnder3kw.toString()),
        defaultSubsidyOver3kw: parseFloat(localStorage.getItem('default_subsidy_over_3kw') || DEFAULT_SETTINGS.defaultSubsidyOver3kw.toString()),
        defaultSubsidy9to36kw: parseFloat(localStorage.getItem('default_subsidy_9to36kw') || DEFAULT_SETTINGS.defaultSubsidy9to36kw.toString()),
        defaultSubsidy36to100kw: parseFloat(localStorage.getItem('default_subsidy_36to100kw') || DEFAULT_SETTINGS.defaultSubsidy36to100kw.toString()),
        subsidyDate: localStorage.getItem('subsidy_date') || DEFAULT_SETTINGS.subsidyDate,
        installationPrices: [...DEFAULT_INSTALLATION_PRICES]
      };

      // Charger les prix personnalisés
      const savedPrices = localStorage.getItem('installation_prices');
      if (savedPrices) {
        try {
          const customPrices = JSON.parse(savedPrices);
          if (Array.isArray(customPrices)) {
            // Filtrer les prix valides
            const validCustomPrices = customPrices.filter(p => 
              p && typeof p.power === 'number' && typeof p.price === 'number' && p.power > 9
            );
            
            // Fusionner avec les prix par défaut
            savedSettings.installationPrices = [
              ...DEFAULT_INSTALLATION_PRICES,
              ...validCustomPrices
            ].sort((a, b) => a.power - b.power);
          }
        } catch (error) {
          console.error('Erreur lors du parsing des prix personnalisés:', error);
        }
      }

      return savedSettings;
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = (updates: Partial<FinancialSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      
      // Sauvegarder dans le localStorage
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'installationPrices') {
          // Pour les prix, ne sauvegarder que les prix pro (> 9 kWc)
          const customPrices = value.filter(p => p.power > 9);
          localStorage.setItem('installation_prices', JSON.stringify(customPrices));
        } else {
          localStorage.setItem(
            key.replace(/([A-Z])/g, '_$1').toLowerCase(),
            typeof value === 'object' ? JSON.stringify(value) : value.toString()
          );
        }
      });

      return newSettings;
    });
  };

  const addInstallationPrice = (power: number, price: number) => {
    if (power <= 0 || price <= 0) {
      console.error('Puissance et prix doivent être positifs');
      return;
    }

    setSettings(prev => {
      // Vérifier si la puissance existe déjà
      const existingIndex = prev.installationPrices.findIndex(p => Math.abs(p.power - power) < 0.01);
      
      let newPrices;
      if (existingIndex >= 0) {
        // Mettre à jour le prix existant
        newPrices = [...prev.installationPrices];
        newPrices[existingIndex] = { power, price };
      } else {
        // Ajouter un nouveau prix
        newPrices = [...prev.installationPrices, { power, price }];
      }
      
      // Trier les prix par puissance
      newPrices.sort((a, b) => a.power - b.power);

      // Sauvegarder uniquement les prix pro
      const customPrices = newPrices.filter(p => p.power > 9);
      localStorage.setItem('installation_prices', JSON.stringify(customPrices));

      return {
        ...prev,
        installationPrices: newPrices
      };
    });
  };

  const removeInstallationPrice = (power: number) => {
    if (power <= 9) {
      console.error('Impossible de supprimer les prix par défaut');
      return;
    }

    setSettings(prev => {
      const newPrices = prev.installationPrices.filter(p => Math.abs(p.power - power) >= 0.01);
      
      // Sauvegarder uniquement les prix pro
      const customPrices = newPrices.filter(p => p.power > 9);
      localStorage.setItem('installation_prices', JSON.stringify(customPrices));

      return {
        ...prev,
        installationPrices: newPrices
      };
    });
  };

  return (
    <FinancialSettingsContext.Provider value={{ 
      settings, 
      updateSettings,
      addInstallationPrice,
      removeInstallationPrice
    }}>
      {children}
    </FinancialSettingsContext.Provider>
  );
}

export function useFinancialSettings() {
  const context = useContext(FinancialSettingsContext);
  if (context === undefined) {
    throw new Error('useFinancialSettings must be used within a FinancialSettingsProvider');
  }
  return context;
}