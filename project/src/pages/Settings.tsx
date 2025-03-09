import React, { useState } from 'react';
import { Euro, Save, Calculator, Trash2, ChevronDown, ChevronRight, Coins, Building } from 'lucide-react';
import { useFinancialSettings } from '../contexts/FinancialSettingsContext';

export default function Settings() {
  const { settings, updateSettings, addInstallationPrice, removeInstallationPrice } = useFinancialSettings();
  const [tempSettings, setTempSettings] = useState(settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPower, setNewPower] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);
  
  const [openSections, setOpenSections] = useState<{
    financial: boolean;
    subsidies: boolean;
    prices: boolean;
    proPrices: boolean;
  }>({
    financial: false,
    subsidies: false,
    prices: false,
    proPrices: false
  });

  const handleNumberChange = (field: keyof typeof tempSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setTempSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSettings(prev => ({ ...prev, sellPriceDate: e.target.value }));
  };

  const handleSubsidyDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSettings(prev => ({ ...prev, subsidyDate: e.target.value }));
  };

  const handlePriceChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const newPrices = [...tempSettings.installationPrices];
      newPrices[index] = { ...newPrices[index], price: value };
      setTempSettings(prev => ({ ...prev, installationPrices: newPrices }));
    }
  };

  const handleAddPrice = () => {
    const power = parseFloat(newPower);
    const price = parseFloat(newPrice);

    if (isNaN(power) || isNaN(price) || power <= 0 || price <= 0) {
      setError('Veuillez entrer des valeurs valides');
      return;
    }

    if (power <= 9) {
      setError('La puissance doit être supérieure à 9 kWc');
      return;
    }

    addInstallationPrice(power, price);
    setNewPower('');
    setNewPrice('');
    setError(null);
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 3000);
  };

  const handleApplySettings = () => {
    updateSettings(tempSettings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Réglages
        </h1>
        <button
          onClick={handleApplySettings}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Appliquer les modifications
        </button>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">
            Les modifications ont été appliquées avec succès
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Paramètres financiers */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('financial')}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Euro className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-medium text-gray-900">Paramètres financiers</h2>
            </div>
            {openSections.financial ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {openSections.financial && (
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix du kWh par défaut
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.baseKwhPrice}
                    onChange={handleNumberChange('baseKwhPrice')}
                    step="0.0001"
                    min="0"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">€/kWh</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarif de revente par défaut
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.baseSellPrice}
                    onChange={handleNumberChange('baseSellPrice')}
                    step="0.0001"
                    min="0"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">€/kWh</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date du tarif de revente
                </label>
                <input
                  type="date"
                  value={tempSettings.sellPriceDate}
                  onChange={handleDateChange}
                  className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau d'autoconsommation par défaut
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.defaultAutoconsumption}
                    onChange={handleNumberChange('defaultAutoconsumption')}
                    step="1"
                    min="0"
                    max="100"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Revalorisation annuelle par défaut
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.defaultEnergyRevaluation}
                    onChange={handleNumberChange('defaultEnergyRevaluation')}
                    step="0.1"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indexation de la revente par défaut
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.defaultSellIndexation}
                    onChange={handleNumberChange('defaultSellIndexation')}
                    step="0.1"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dégradation panneaux par défaut
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.defaultPanelDegradation}
                    onChange={handleNumberChange('defaultPanelDegradation')}
                    step="0.1"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primes & Subventions */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('subsidies')}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-medium text-gray-900">Primes & Subventions</h2>
            </div>
            {openSections.subsidies ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {openSections.subsidies && (
            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de validité des primes
                </label>
                <input
                  type="date"
                  value={tempSettings.subsidyDate}
                  onChange={handleSubsidyDateChange}
                  className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prime ≤ 3 kWc
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.defaultSubsidyUnder3kw}
                    onChange={handleNumberChange('defaultSubsidyUnder3kw')}
                    step="1"
                    min="0"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">€/kWc</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prime 3-9 kWc
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.defaultSubsidyOver3kw}
                    onChange={handleNumberChange('defaultSubsidyOver3kw')}
                    step="1"
                    min="0"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">€/kWc</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prime 9-36 kWc
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.defaultSubsidy9to36kw}
                    onChange={handleNumberChange('defaultSubsidy9to36kw')}
                    step="1"
                    min="0"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">€/kWc</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prime 36-100 kWc
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    value={tempSettings.defaultSubsidy36to100kw}
                    onChange={handleNumberChange('defaultSubsidy36to100kw')}
                    step="1"
                    min="0"
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">€/kWc</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prix des installations */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('prices')}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-medium text-gray-900">Prix des installations</h2>
            </div>
            {openSections.prices ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {openSections.prices && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                {tempSettings.installationPrices
                  .filter(price => price.power <= 9)
                  .map((price, index) => (
                    <div key={price.power} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {price.power} kWc
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          type="number"
                          value={price.price}
                          onChange={handlePriceChange(index)}
                          step="10"
                          min="0"
                          className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Prix des installations pro */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('proPrices')}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-medium text-gray-900">Prix des installations pro</h2>
            </div>
            {openSections.proPrices ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {openSections.proPrices && (
            <div className="px-6 pb-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {tempSettings.installationPrices
                    .filter(price => price.power > 9)
                    .map(price => (
                      <div key={price.power} className="relative bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{price.power} kWc</span>
                          <button
                            onClick={() => removeInstallationPrice(price.power)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {price.price.toLocaleString()} €
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Ajouter un nouveau kit
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Puissance (kWc)
                      </label>
                      <input
                        type="number"
                        value={newPower}
                        onChange={(e) => setNewPower(e.target.value)}
                        min="9.5"
                        step="0.5"
                        className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix (€)
                      </label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        min="0"
                        step="100"
                        className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                  {addSuccess && (
                    <p className="mt-2 text-sm text-green-600">Kit ajouté avec succès</p>
                  )}
                  <button
                    onClick={handleAddPrice}
                    className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}