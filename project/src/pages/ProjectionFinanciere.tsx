import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Mail, Calculator, ArrowRight, Sun } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useClient } from '../contexts/client';
import ResultsSection from '../components/ResultsSection';
import FinancingOptions from '../components/financial/FinancingOptions';
import FinancialParameters from '../components/financial/FinancialParameters';
import ProjectionTable from '../components/financial/ProjectionTable';
import ProjectionSummary from '../components/financial/ProjectionSummary';
import { useFinancialProjection } from '../hooks/useFinancialProjection';
import { scrollToTop } from '../utils/scroll';

interface RecommendedKit {
  power: number;
  duration: number;
  monthlyPayment: number;
  annualRatio: number;
}

export default function ProjectionFinanciere() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCalculating, setIsCalculating] = useState(false);
  const [showProjection, setShowProjection] = useState(false);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [solarResults, setSolarResults] = useState<any>(null);
  const { clientInfo } = useClient();
  
  const { 
    projection,
    parameters,
    updateParameters,
    calculateProjection
  } = useFinancialProjection();

  useEffect(() => {
    const savedResults = localStorage.getItem('solarResults');
    if (!savedResults) {
      navigate('/');
      return;
    }

    const loadResults = async () => {
      try {
        const results = JSON.parse(savedResults);
        if (!results.typeCompteur) {
          console.error('Type de compteur manquant dans les résultats');
          navigate('/');
          return;
        }
        setSolarResults(results);
        const { productionAnnuelle, puissanceCrete } = results;

        // Check for suggested power from eligibility page
        const suggestedPower = location.state?.power || localStorage.getItem('selectedPower');
        const suggestedDuration = location.state?.duration || localStorage.getItem('subscriptionDuration');
        
        const actualPower = suggestedPower ? parseFloat(suggestedPower) : puissanceCrete;

        if (!productionAnnuelle || !actualPower) {
          navigate('/');
          return;
        }

        const primeBase = actualPower <= 3 ? 0.22 : 0.16; // €/Wc
        const primeAmount = Math.round(primeBase * actualPower * 1000); // Conversion en Wc
        
        updateParameters({
          productionAnnuelle,
          puissanceCrete: actualPower,
          primeAutoconsommation: primeAmount,
          financingMode: 'subscription',
          dureeAbonnement: suggestedDuration ? parseInt(suggestedDuration) : 20
        });

        // Clear suggested values after using them
        localStorage.removeItem('selectedPower');
        localStorage.removeItem('subscriptionDuration');
      } catch (error) {
        console.error('Erreur lors du chargement des résultats:', error);
        navigate('/');
      }
    };

    loadResults();
  }, [navigate, updateParameters, location.state]);

  const handleCalculate = async () => {
    if (!parameters.productionAnnuelle || !parameters.puissanceCrete) return;
    
    setIsCalculating(true);
    
    localStorage.setItem('financialMode', parameters.financingMode);
    localStorage.setItem('primeAutoconsommation', parameters.primeAutoconsommation.toString());
    localStorage.setItem('remiseCommerciale', parameters.remiseCommerciale.toString());
    if (parameters.dureeAbonnement) {
      localStorage.setItem('subscriptionDuration', parameters.dureeAbonnement.toString());
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    calculateProjection(parameters.productionAnnuelle, parameters.puissanceCrete);
    setShowProjection(true);
    setIsCalculating(false);
  };

  const handlePowerChange = (newPower: number) => {
    if (!solarResults?.typeCompteur) {
      console.error('Type de compteur non défini');
      return;
    }

    // Vérifier si la nouvelle puissance respecte la limite du compteur
    const maxPower = solarResults.typeCompteur === 'monophase' ? 6.0 : 9.0;
    if (newPower > maxPower) {
      console.warn(`Puissance ${newPower} kWc supérieure à la limite ${maxPower} kWc en ${solarResults.typeCompteur}`);
      return;
    }

    // Update solar results with new power
    const updatedResults = {
      ...solarResults,
      puissanceCrete: newPower,
      productionAnnuelle: Math.round(newPower * (solarResults.productionAnnuelle / solarResults.puissanceCrete)),
      surfaceTotale: Math.round(newPower * 2.3 * 100) / 100
    };
    setSolarResults(updatedResults);
    localStorage.setItem('solarResults', JSON.stringify(updatedResults));

    // Update financial parameters
    const primeBase = newPower <= 3 ? 0.22 : 0.16;
    const primeAmount = Math.round(primeBase * newPower * 1000);
    
    updateParameters({
      puissanceCrete: newPower,
      productionAnnuelle: updatedResults.productionAnnuelle,
      primeAutoconsommation: primeAmount
    });
  };

  const handleKitSelect = (kit: RecommendedKit) => {
    handlePowerChange(kit.power);
    updateParameters({
      dureeAbonnement: kit.duration
    });
  };

  const handleEligibilityClick = () => {
    scrollToTop();
    navigate('/eligibilite');
  };

  if (!solarResults?.typeCompteur) {
    return null;
  }

  // Générer les options de puissance en fonction du type de compteur
  const maxPower = solarResults.typeCompteur === 'monophase' ? 6.0 : 9.0;
  const powerOptions = Array.from(
    { length: Math.floor((maxPower - 2.4) / 0.5) + 1 },
    (_, i) => ({
      value: 2.5 + i * 0.5,
      label: `${(2.5 + i * 0.5).toFixed(1)} kWc`
    })
  ).filter(option => option.value <= maxPower);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour au dimensionnement
        </Link>
      </div>

      <div className="space-y-8">
        <ResultsSection 
          result={solarResults} 
          onModifyPower={() => setShowPowerModal(true)} 
        />

        {showPowerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ajuster la puissance
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puissance (kWc)
                  </label>
                  <select
                    value={solarResults.puissanceCrete}
                    onChange={(e) => handlePowerChange(parseFloat(e.target.value))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {powerOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {solarResults.typeCompteur === 'monophase' && (
                    <p className="mt-1 text-sm text-gray-500">
                      Limité à 6 kWc en monophasé
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPowerModal(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => setShowPowerModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-8">
            <FinancingOptions
              selectedMode={parameters.financingMode}
              onModeChange={(mode) => updateParameters({ financingMode: mode })}
              puissanceCrete={parameters.puissanceCrete}
              dureeAbonnement={parameters.dureeAbonnement || 20}
              onDureeChange={(duree) => updateParameters({ dureeAbonnement: duree })}
              onKitSelect={handleKitSelect}
            />
            
            <FinancialParameters
              parameters={parameters}
              onParameterChange={updateParameters}
              puissanceCrete={parameters.puissanceCrete}
            />

            <div className="flex justify-center">
              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="relative px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2">
                  {isCalculating ? (
                    <>
                      <div className="relative w-5 h-5">
                        <Sun className="absolute inset-0 w-5 h-5 text-yellow-300 animate-spin" />
                      </div>
                      <span>Calcul en cours...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      <span>Calculer la projection financière</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {showProjection && projection && !isCalculating && (
          <>
            <ProjectionTable projection={projection} />
            <ProjectionSummary projection={projection} />

            <div className="mt-8 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Pour toute demande d'étude d'éligibilité au dossier, nos conseillers sont à votre disposition :
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <a href="tel:0183835150" className="text-blue-600 hover:text-blue-800 font-medium">
                        01 83 83 51 50
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <a href="mailto:contact@abie.fr" className="text-blue-600 hover:text-blue-800 font-medium">
                        contact@abie.fr
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleEligibilityClick}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tester mon éligibilité
                  <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}