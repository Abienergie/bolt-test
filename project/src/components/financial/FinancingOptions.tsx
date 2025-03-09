import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, ArrowRight, HelpCircle, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSubscriptionPrice } from '../../utils/calculations/priceCalculator';
import { scrollToTop } from '../../utils/scroll';
import { formatCurrency } from '../../utils/formatters';

interface RecommendedKit {
  power: number;
  duration: number;
  monthlyPayment: number;
  annualRatio: number;
}

interface FinancingOptionsProps {
  selectedMode: 'cash' | 'subscription';
  onModeChange: (mode: 'cash' | 'subscription') => void;
  puissanceCrete: number;
  dureeAbonnement: number;
  onDureeChange: (duree: number) => void;
  onKitSelect?: (kit: RecommendedKit) => void;
}

export default function FinancingOptions({
  selectedMode,
  onModeChange,
  puissanceCrete,
  dureeAbonnement,
  onDureeChange,
  onKitSelect
}: FinancingOptionsProps) {
  const monthlyPrice = getSubscriptionPrice(puissanceCrete, dureeAbonnement);
  const [revenuFiscal, setRevenuFiscal] = useState('');
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [recommendedKits, setRecommendedKits] = useState<RecommendedKit[]>([]);
  const [selectedKit, setSelectedKit] = useState<RecommendedKit | null>(null);

  // Vérifier si la puissance est > 9kWc
  const isProKit = puissanceCrete > 9;

  // Forcer le mode "cash" pour les kits pro
  useEffect(() => {
    if (isProKit && selectedMode === 'subscription') {
      onModeChange('cash');
    }
  }, [isProKit, selectedMode, onModeChange]);

  // Reset fiscal revenue when changing mode
  useEffect(() => {
    if (selectedMode === 'cash') {
      setRevenuFiscal('');
      setIsEligible(null);
      setRecommendedKits([]);
      setSelectedKit(null);
      localStorage.removeItem('revenuFiscal');
    }
  }, [selectedMode]);

  const calculateAffordableKits = (revenuAnnuel: number) => {
    const maxAnnualPayment = revenuAnnuel * 0.04;
    const durations = [25, 20, 15, 10];
    const powers = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0];
    
    const kits: RecommendedKit[] = [];
    
    for (const power of powers) {
      for (const duration of durations) {
        const monthlyPayment = getSubscriptionPrice(power, duration);
        const annualPayment = monthlyPayment * 12;
        const annualRatio = (annualPayment / revenuAnnuel) * 100;
        
        if (annualRatio <= 4) {
          kits.push({
            power,
            duration,
            monthlyPayment,
            annualRatio
          });
        }
      }
    }
    
    return kits.sort((a, b) => b.power - a.power);
  };

  const checkEligibility = (revenu: number) => {
    if (revenu <= 0) return null;
    
    const annualSubscription = monthlyPrice * 12;
    const revenuMinimumRequis = Math.ceil(annualSubscription / 0.04);
    
    return revenu >= revenuMinimumRequis;
  };

  const checkEligibilityAndUpdateKits = (revenuAnnuel: number) => {
    if (revenuAnnuel > 0 && selectedMode === 'subscription') {
      const eligibility = checkEligibility(revenuAnnuel);
      setIsEligible(eligibility);

      if (!eligibility) {
        const affordableKits = calculateAffordableKits(revenuAnnuel);
        setRecommendedKits(affordableKits);
      } else {
        setRecommendedKits([]);
      }
    } else {
      setIsEligible(null);
      setRecommendedKits([]);
    }
  };

  const handleRevenuFiscalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setRevenuFiscal(value);
    
    if (value) {
      localStorage.setItem('revenuFiscal', value);
      const revenuAnnuel = parseInt(value, 10);
      checkEligibilityAndUpdateKits(revenuAnnuel);
    } else {
      localStorage.removeItem('revenuFiscal');
      setIsEligible(null);
      setRecommendedKits([]);
    }
    
    setSelectedKit(null);
  };

  const handleKitSelection = (kit: RecommendedKit) => {
    setSelectedKit(kit);
  };

  const handleKitValidation = () => {
    if (selectedKit && onKitSelect) {
      setIsEligible(true);
      onKitSelect(selectedKit);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Mode de financement</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onModeChange('cash')}
          onKeyPress={(e) => e.key === 'Enter' && onModeChange('cash')}
          className={`relative p-6 rounded-lg border-2 text-left transition-colors cursor-pointer
            ${selectedMode === 'cash'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <CreditCard className={`h-5 w-5 ${selectedMode === 'cash' ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="font-medium">Paiement comptant</span>
          </div>
          <p className="text-sm text-gray-600">
            Investissez une fois et profitez d'économies maximales dès le premier jour
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => !isProKit && onModeChange('subscription')}
          onKeyPress={(e) => e.key === 'Enter' && !isProKit && onModeChange('subscription')}
          className={`relative p-6 rounded-lg border-2 text-left transition-colors ${
            isProKit 
              ? 'opacity-50 cursor-not-allowed border-gray-200'
              : selectedMode === 'subscription'
                ? 'border-blue-500 bg-blue-50 cursor-pointer'
                : 'border-gray-200 hover:border-gray-300 cursor-pointer'
          }`}
        >
          {isProKit && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="bg-white px-4 py-2 rounded-full text-sm text-gray-600 shadow">
                Non disponible pour puissance &gt; 9 kWc
              </div>
            </div>
          )}
          <div className="absolute -top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Plus populaire
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Clock className={`h-5 w-5 ${selectedMode === 'subscription' ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="font-medium">Abonnement mensuel</span>
          </div>
          
          {selectedMode === 'subscription' && (
            <>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {monthlyPrice.toFixed(2)} €
                  </span>
                  <span className="text-gray-500">/mois</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[10, 15, 20, 25].map(duree => (
                  <div
                    key={duree}
                    role="button"
                    tabIndex={0}
                    onClick={() => onDureeChange(duree)}
                    onKeyPress={(e) => e.key === 'Enter' && onDureeChange(duree)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-center
                      ${dureeAbonnement === duree
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {duree} ans
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <Link 
                  to="/modalites-abonnement"
                  onClick={() => scrollToTop()}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voir les avantages de l'abonnement
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
                <Link 
                  to="/modalites-sortie"
                  onClick={() => scrollToTop()}
                  className="block text-sm text-blue-600 hover:text-blue-800"
                >
                  Consulter les modalités de sortie
                </Link>
              </div>
            </>
          )}
          
          <p className="text-sm text-gray-600 mt-4">
            Répartissez votre investissement sur la durée et commencez à économiser immédiatement
          </p>
        </div>
      </div>

      {selectedMode === 'subscription' && (
        <>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Services inclus dans votre abonnement :</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Maintenance préventive et curative 7j/7</li>
              <li>• Garantie pièces et main d'œuvre pendant {dureeAbonnement} ans</li>
              <li>• Monitoring et optimisation de performance</li>
              <li>• Assurance tous risques incluse</li>
              <li>• Pas d'apport initial</li>
              <li>• Réponse sous 48h</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Revenu fiscal de référence
              <div className="relative inline-block ml-2 group">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-sm rounded-lg py-2 px-3 w-72 bottom-full left-1/2 -translate-x-1/2 mb-2">
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  Le revenu fiscal de référence se trouve sur votre dernier avis d'imposition, en première page dans le cadre "Vos références".
                </div>
              </div>
            </label>
            <input
              type="text"
              value={revenuFiscal}
              onChange={handleRevenuFiscalChange}
              placeholder="Montant en euros"
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-2 ${
                isEligible === true
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : isEligible === false
                  ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />

            {revenuFiscal && parseInt(revenuFiscal, 10) > 0 && (
              <>
                {isEligible === true && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">Vous êtes éligible à cet abonnement</p>
                      <p className="mt-1">
                        Votre revenu vous permet de souscrire à cette offre en toute sérénité.
                        L'abonnement mensuel de {formatCurrency(monthlyPrice)} 
                        représente moins de 4% de votre revenu annuel.
                      </p>
                    </div>
                  </div>
                )}

                {isEligible === false && (
                  <div className="space-y-6">
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium">Kit solaire trop puissant pour votre budget</p>
                        <p className="mt-1">
                          Pour un abonnement mensuel de {formatCurrency(monthlyPrice)}, 
                          votre revenu fiscal doit être d'au moins {formatCurrency(Math.ceil((monthlyPrice * 12) / 0.04))}. 
                          Voici les kits solaires adaptés à votre budget :
                        </p>
                      </div>
                    </div>

                    {recommendedKits.length > 0 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recommendedKits.slice(0, 4).map((kit, index) => (
                            <div 
                              key={`${kit.power}-${kit.duration}`}
                              onClick={() => handleKitSelection(kit)}
                              className={`bg-white rounded-lg p-4 border transition-all cursor-pointer ${
                                selectedKit === kit
                                  ? 'border-blue-500 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className={`h-5 w-5 ${
                                  selectedKit === kit ? 'text-blue-500' : 'text-green-500'
                                }`} />
                                <h4 className="font-medium text-gray-900">
                                  Kit {kit.power} kWc
                                </h4>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                  • Durée : {kit.duration} ans
                                </p>
                                <p className="text-sm text-gray-600">
                                  • Mensualité : {formatCurrency(kit.monthlyPayment)}
                                </p>
                                <p className="text-sm text-green-600">
                                  • {kit.annualRatio.toFixed(1)}% de votre revenu annuel
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedKit && (
                          <div className="flex justify-center">
                            <button
                              onClick={handleKitValidation}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                              Valider ce kit
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}